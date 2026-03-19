import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { hash } from 'bcryptjs'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { createUserSchema } from '@/lib/validations'
import type { UserRole } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth('team:read')
  if (!authCheck.success) return authCheck.response

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        _count: { select: { assignedAccounts: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('team:write')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(createUserSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const hashedPassword = await hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role as UserRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
