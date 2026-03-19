import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { assignUserToAccountSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const body = await request.json()
    const validation = validateBody(assignUserToAccountSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const accountUser = await prisma.accountUser.create({
      data: {
        accountId: id,
        userId: data.userId,
        role: data.role,
      },
    })

    return NextResponse.json(accountUser, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'El usuario ya está asignado a esta cuenta' }, { status: 409 })
    }
    console.error('Error assigning user:', error)
    return NextResponse.json({ error: 'Error al asignar usuario' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
  }

  try {
    await prisma.accountUser.deleteMany({
      where: { accountId: id, userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing user:', error)
    return NextResponse.json({ error: 'Error al remover usuario' }, { status: 500 })
  }
}
