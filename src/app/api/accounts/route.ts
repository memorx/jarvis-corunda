import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const role = (session.user as any).role

    let accounts
    if (role === 'CLIENT') {
      accounts = await prisma.account.findMany({
        where: {
          users: { some: { userId: session.user.id } },
          isActive: true,
        },
        include: {
          users: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
          _count: { select: { parrillas: true, campaigns: true } },
        },
        orderBy: { name: 'asc' },
      })
    } else {
      accounts = await prisma.account.findMany({
        where: { isActive: true },
        include: {
          users: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
          _count: { select: { parrillas: true, campaigns: true } },
        },
        orderBy: { name: 'asc' },
      })
    }

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Error al obtener cuentas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const role = (session.user as any).role
  if (!['SUPERADMIN', 'MANAGER'].includes(role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const account = await prisma.account.create({
      data: {
        name: body.name,
        brandName: body.brandName,
        industry: body.industry || null,
        description: body.description || null,
        brandVoice: body.brandVoice || null,
        brandColors: body.brandColors || [],
        targetAudience: body.targetAudience || null,
        competitors: body.competitors || null,
        guidelines: body.guidelines || null,
        sampleCopies: body.sampleCopies || null,
        platforms: body.platforms || [],
        contentTypes: body.contentTypes || [],
        monthlyBudget: body.monthlyBudget || null,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 })
  }
}
