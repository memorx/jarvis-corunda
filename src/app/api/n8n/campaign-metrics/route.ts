import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { campaignId, date, impressions, clicks, spend, conversions, leads, reach } = body

    if (!campaignId || !date) {
      return NextResponse.json({ error: 'campaignId and date are required' }, { status: 400 })
    }

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
        impressions: impressions || 0,
        clicks: clicks || 0,
        spend: spend || 0,
        conversions: conversions || 0,
        leads: leads || 0,
        reach: reach || 0,
        ctr,
        cpc,
        cpm,
        cpa,
      },
      create: {
        campaignId,
        date: new Date(date),
        impressions: impressions || 0,
        clicks: clicks || 0,
        spend: spend || 0,
        conversions: conversions || 0,
        leads: leads || 0,
        reach: reach || 0,
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
