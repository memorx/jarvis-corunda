import { NextRequest, NextResponse } from 'next/server'
import { requireApiKey } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { campaignMetricsSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const keyCheck = requireApiKey(request)
  if (!keyCheck.success) return keyCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(campaignMetricsSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const { campaignId, date, impressions, clicks, spend, conversions, leads, reach } = data

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : null
    const cpc = clicks > 0 ? spend / clicks : null
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : null
    const cpa = conversions > 0 ? spend / conversions : null

    const metrics = await prisma.campaignMetrics.upsert({
      where: {
        campaignId_date: {
          campaignId,
          date: new Date(date),
        },
      },
      update: {
        impressions,
        clicks,
        spend,
        conversions,
        leads,
        reach,
        ctr,
        cpc,
        cpm,
        cpa,
      },
      create: {
        campaignId,
        date: new Date(date),
        impressions,
        clicks,
        spend,
        conversions,
        leads,
        reach,
        ctr,
        cpc,
        cpm,
        cpa,
      },
    })

    return NextResponse.json({ success: true, metricsId: metrics.id })
  } catch (error) {
    console.error('n8n campaign-metrics error:', error)
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 })
  }
}
