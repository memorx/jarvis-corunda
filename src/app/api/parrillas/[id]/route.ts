import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { updateParrillaSchema } from '@/lib/validations'
import type { ParrillaStatus } from '@/generated/prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('parrillas:read')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const parrilla = await prisma.parrilla.findUnique({
      where: { id },
      include: {
        account: true,
        createdBy: { select: { id: true, name: true } },
        entries: {
          include: {
            assets: true,
            comments: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
              orderBy: { createdAt: 'desc' },
            },
            approvals: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
          orderBy: { publishDate: 'asc' },
        },
        approvals: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })

    if (!parrilla) {
      return NextResponse.json({ error: 'Parrilla no encontrada' }, { status: 404 })
    }

    return NextResponse.json(parrilla)
  } catch (error) {
    console.error('Error fetching parrilla:', error)
    return NextResponse.json({ error: 'Error al obtener parrilla' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('parrillas:edit')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const body = await request.json()
    const validation = validateBody(updateParrillaSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const parrilla = await prisma.parrilla.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status as ParrillaStatus,
      },
    })

    return NextResponse.json(parrilla)
  } catch (error) {
    console.error('Error updating parrilla:', error)
    return NextResponse.json({ error: 'Error al actualizar parrilla' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('parrillas:edit')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    await prisma.parrilla.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting parrilla:', error)
    return NextResponse.json({ error: 'Error al eliminar parrilla' }, { status: 500 })
  }
}
