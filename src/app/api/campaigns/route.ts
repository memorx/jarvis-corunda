import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { createCampaignSchema } from '@/lib/validations'
import type { Platform, CampaignObjective } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth('campaigns:read')
  if (!authCheck.success) return authCheck.response

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
  const authCheck = await requireAuth('campaigns:write')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(createCampaignSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const campaign = await prisma.campaign.create({
      data: {
        accountId: data.accountId,
        name: data.name,
        platform: data.platform as Platform,
        objective: data.objective as CampaignObjective,
        dailyBudget: data.dailyBudget,
        totalBudget: data.totalBudget,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Error al crear campaña' }, { status: 500 })
  }
}
