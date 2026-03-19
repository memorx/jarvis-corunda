import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { analyzeMetrics } from '@/lib/ai/metrics-analyzer'
import { z } from 'zod'
import { validateBody } from '@/lib/validate'

const insightsSchema = z.object({
  accountId: z.string().optional(),
  campaignId: z.string().optional(),
  days: z.number().int().min(7).max(90).optional().default(30),
})

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('performance:read')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(insightsSchema, body)
    if (!validation.success) return validation.response

    const insights = await analyzeMetrics(validation.data)
    return NextResponse.json(insights)
  } catch (error: any) {
    console.error('Insights error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar insights' },
      { status: 500 }
    )
  }
}
