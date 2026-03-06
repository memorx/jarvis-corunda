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
    const campaigns = await prisma.campaign.findMany({
      where: accountId ? { accountId } : undefined,
      include: {
        account: { select: { id: true, brandName: true, brandColors: true } },
        _count: { select: { entries: true, metrics: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Error al obtener campañas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const campaign = await prisma.campaign.create({
      data: {
        accountId: body.accountId,
        name: body.name,
        platform: body.platform,
        objective: body.objective,
        dailyBudget: body.dailyBudget,
        totalBudget: body.totalBudget,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Error al crear campaña' }, { status: 500 })
  }
}
