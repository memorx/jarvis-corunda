import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth('approvals:create')
  if (!authCheck.success) return authCheck.response

  try {
    const { role, userId } = authCheck

    // CLIENTs solo ven parrillas de sus cuentas
    const accountFilter = role === 'CLIENT'
      ? { account: { users: { some: { userId } } } }
      : {}

    const parrillas = await prisma.parrilla.findMany({
      where: {
        status: { in: ['CLIENT_REVIEW', 'INTERNAL_REVIEW', 'APPROVED_INTERNAL'] },
        ...accountFilter,
      },
      include: {
        account: { select: { id: true, brandName: true, brandColors: true } },
        entries: {
          include: {
            approvals: {
              include: { user: { select: { name: true } } },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            comments: {
              include: { user: { select: { name: true } } },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
          orderBy: { publishDate: 'asc' },
        },
        _count: { select: { entries: true, approvals: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(parrillas)
  } catch (error) {
    console.error('Pending approvals error:', error)
    return NextResponse.json({ error: 'Error al obtener aprobaciones' }, { status: 500 })
  }
}
