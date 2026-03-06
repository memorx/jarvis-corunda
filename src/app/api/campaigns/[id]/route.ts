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
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        account: true,
        entries: {
          include: { assets: true },
          orderBy: { publishDate: 'asc' },
        },
        metrics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({ error: 'Error al obtener campaña' }, { status: 500 })
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
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: body.name,
        platform: body.platform,
        objective: body.objective,
        dailyBudget: body.dailyBudget,
        totalBudget: body.totalBudget,
        status: body.status,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Error al actualizar campaña' }, { status: 500 })
  }
}
