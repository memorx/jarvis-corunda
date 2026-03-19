import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { updateCampaignSchema } from '@/lib/validations'
import type { Platform, CampaignObjective, CampaignStatus } from '@/generated/prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('campaigns:read')
  if (!authCheck.success) return authCheck.response

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
  const authCheck = await requireAuth('campaigns:write')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const body = await request.json()
    const validation = validateBody(updateCampaignSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        platform: data.platform as Platform,
        objective: data.objective as CampaignObjective,
        dailyBudget: data.dailyBudget,
        totalBudget: data.totalBudget,
        status: data.status as CampaignStatus,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Error al actualizar campaña' }, { status: 500 })
  }
}
