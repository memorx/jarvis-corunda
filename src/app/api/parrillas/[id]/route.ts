import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

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
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const parrilla = await prisma.parrilla.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
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
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.parrilla.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting parrilla:', error)
    return NextResponse.json({ error: 'Error al eliminar parrilla' }, { status: 500 })
  }
}
