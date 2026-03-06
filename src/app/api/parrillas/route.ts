import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')

  try {
    const parrillas = await prisma.parrilla.findMany({
      where: accountId ? { accountId } : undefined,
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
