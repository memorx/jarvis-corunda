import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth()
  if (!authCheck.success) return authCheck.response

  try {
    const { role, userId } = authCheck

    // Base where clause — CLIENTs solo ven sus cuentas
    const accountFilter = role === 'CLIENT'
      ? { account: { users: { some: { userId } } } }
      : {}

    const [
      accountCount,
      activeCampaigns,
      totalBudget,
      pendingEntries,
      recentParrillas,
      recentApprovals,
      aiLogs,
    ] = await Promise.all([
      role === 'CLIENT'
        ? prisma.account.count({ where: { isActive: true, users: { some: { userId } } } })
        : prisma.account.count({ where: { isActive: true } }),

      prisma.campaign.count({ where: { status: 'ACTIVE', ...accountFilter } }),

      prisma.campaign.aggregate({
        where: { status: 'ACTIVE', ...accountFilter },
        _sum: { totalBudget: true },
      }),

      prisma.parrillaEntry.count({
        where: {
          status: { in: ['DRAFT', 'INTERNAL_REVIEW', 'CLIENT_REVIEW'] },
          parrilla: accountFilter,
        },
      }),

      prisma.parrilla.findMany({
        where: accountFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          account: { select: { brandName: true } },
          createdBy: { select: { name: true } },
          _count: { select: { entries: true } },
        },
      }),

      prisma.approval.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          type: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
          parrilla: { select: { name: true } },
          entry: { select: { headline: true, platform: true } },
        },
      }),

      prisma.aIGenerationLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          promptType: true,
          success: true,
          estimatedCost: true,
          duration: true,
          createdAt: true,
          accountId: true,
        },
      }),
    ])

    const activity = [
      ...recentParrillas.map(p => ({
        type: 'parrilla' as const,
        text: `Parrilla "${p.name}" creada por ${p.createdBy.name}`,
        detail: `${p.account.brandName} · ${p._count.entries} entradas`,
        time: p.createdAt,
      })),
      ...recentApprovals.map(a => ({
        type: 'approval' as const,
        text: `${a.user.name} ${a.status === 'APPROVED' ? 'aprobó' : 'solicitó revisión de'} ${a.parrilla?.name || a.entry?.headline || 'contenido'}`,
        detail: a.comment || '',
        time: a.createdAt,
      })),
      ...aiLogs.slice(0, 5).map(l => ({
        type: 'ai' as const,
        text: `${l.promptType} generado`,
        detail: l.success ? `${l.duration}ms · $${l.estimatedCost?.toFixed(4) || '0'}` : 'Error',
        time: l.createdAt,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
     .slice(0, 10)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const aiCostThisMonth = await prisma.aIGenerationLog.aggregate({
      where: { createdAt: { gte: startOfMonth }, success: true },
      _sum: { estimatedCost: true },
      _count: true,
    })

    return NextResponse.json({
      stats: {
        accounts: accountCount,
        activeCampaigns,
        totalBudget: totalBudget._sum.totalBudget || 0,
        pendingEntries,
        aiCostThisMonth: aiCostThisMonth._sum.estimatedCost || 0,
        aiCallsThisMonth: aiCostThisMonth._count,
      },
      activity,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
