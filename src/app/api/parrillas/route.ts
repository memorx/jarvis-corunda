import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth('parrillas:read')
  if (!authCheck.success) return authCheck.response

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')

  try {
    let where: any = accountId ? { accountId } : undefined

    // CLIENT solo ve parrillas de cuentas asignadas
    if (authCheck.role === 'CLIENT') {
      where = {
        ...where,
        account: { users: { some: { userId: authCheck.userId } } },
      }
    }

    const parrillas = await prisma.parrilla.findMany({
      where,
      include: {
        account: { select: { id: true, brandName: true, brandColors: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { entries: true, approvals: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(parrillas)
  } catch (error) {
    console.error('Error fetching parrillas:', error)
    return NextResponse.json({ error: 'Error al obtener parrillas' }, { status: 500 })
  }
}
