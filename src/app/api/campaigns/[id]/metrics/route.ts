import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('campaigns:read')
  if (!authCheck.success) return authCheck.response

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30') || 30, 1), 365)

  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const metrics = await prisma.campaignMetrics.findMany({
      where: {
        campaignId: id,
        date: { gte: since },
      },
      orderBy: { date: 'asc' },
    })

    const totals = metrics.reduce(
      (acc, m) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        spend: acc.spend + m.spend,
        conversions: acc.conversions + m.conversions,
        leads: acc.leads + m.leads,
        reach: acc.reach + m.reach,
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0, leads: 0, reach: 0 }
    )

    const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
    const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
    const avgCpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0

    return NextResponse.json({
      daily: metrics.map(m => ({
        date: m.date,
        impressions: m.impressions,
        clicks: m.clicks,
        spend: m.spend,
        conversions: m.conversions,
        ctr: m.ctr,
        cpc: m.cpc,
      })),
      totals: { ...totals, avgCtr, avgCpc, avgCpm },
    })
  } catch (error) {
    console.error('Campaign metrics error:', error)
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 })
  }
}
