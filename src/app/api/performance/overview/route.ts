import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth('performance:read')
  if (!authCheck.success) return authCheck.response

  const { searchParams } = new URL(request.url)
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30') || 30, 1), 365)
  const accountId = searchParams.get('accountId')

  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const campaignFilter = accountId
      ? { campaign: { accountId } }
      : {}

    const dailyMetrics = await prisma.campaignMetrics.groupBy({
      by: ['date'],
      where: {
        date: { gte: since },
        ...campaignFilter,
      },
      _sum: {
        impressions: true,
        clicks: true,
        spend: true,
        conversions: true,
        reach: true,
      },
      orderBy: { date: 'asc' },
    })

    const campaignsWithMetrics = await prisma.campaign.findMany({
      where: {
        metrics: { some: { date: { gte: since } } },
        ...(accountId ? { accountId } : {}),
      },
      select: {
        id: true,
        name: true,
        platform: true,
        status: true,
        account: { select: { brandName: true } },
        metrics: {
          where: { date: { gte: since } },
          select: {
            impressions: true,
            clicks: true,
            spend: true,
            conversions: true,
          },
        },
      },
    })

    const campaignSummaries = campaignsWithMetrics.map(c => {
      const totals = c.metrics.reduce(
        (acc, m) => ({
          impressions: acc.impressions + m.impressions,
          clicks: acc.clicks + m.clicks,
          spend: acc.spend + m.spend,
          conversions: acc.conversions + m.conversions,
        }),
        { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
      )
      return {
        id: c.id,
        name: c.name,
        platform: c.platform,
        status: c.status,
        brandName: c.account.brandName,
        ...totals,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
        cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
      }
    })

    const grandTotals = campaignSummaries.reduce(
      (acc, c) => ({
        impressions: acc.impressions + c.impressions,
        clicks: acc.clicks + c.clicks,
        spend: acc.spend + c.spend,
        conversions: acc.conversions + c.conversions,
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    )

    return NextResponse.json({
      daily: dailyMetrics.map(d => ({
        date: d.date,
        impressions: d._sum.impressions || 0,
        clicks: d._sum.clicks || 0,
        spend: d._sum.spend || 0,
        conversions: d._sum.conversions || 0,
        reach: d._sum.reach || 0,
      })),
      campaigns: campaignSummaries,
      totals: {
        ...grandTotals,
        avgCtr: grandTotals.impressions > 0 ? (grandTotals.clicks / grandTotals.impressions) * 100 : 0,
        avgCpc: grandTotals.clicks > 0 ? grandTotals.spend / grandTotals.clicks : 0,
        activeCampaigns: campaignSummaries.filter(c => c.status === 'ACTIVE').length,
      },
    })
  } catch (error) {
    console.error('Performance overview error:', error)
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 })
  }
}
