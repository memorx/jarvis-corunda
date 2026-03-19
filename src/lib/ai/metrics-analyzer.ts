import Anthropic from '@anthropic-ai/sdk'
import { cleanJsonResponse } from '@/lib/utils'
import prisma from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface MetricsAnalysisInput {
  campaignId?: string
  accountId?: string
  days: number
}

export interface MetricsInsight {
  summary: string
  topPerformers: string[]
  concerns: string[]
  recommendations: string[]
  budgetAdvice: string
  nextSteps: string[]
}

export async function analyzeMetrics(input: MetricsAnalysisInput): Promise<MetricsInsight> {
  const startTime = Date.now()

  const since = new Date()
  since.setDate(since.getDate() - input.days)

  // Fetch metrics
  const where: any = { date: { gte: since } }
  if (input.campaignId) where.campaignId = input.campaignId
  if (input.accountId) where.campaign = { accountId: input.accountId }

  const metrics = await prisma.campaignMetrics.findMany({
    where,
    include: {
      campaign: {
        select: { name: true, platform: true, objective: true, dailyBudget: true, totalBudget: true },
      },
    },
    orderBy: { date: 'asc' },
  })

  if (metrics.length === 0) {
    return {
      summary: 'No hay metricas disponibles para el periodo seleccionado.',
      topPerformers: [],
      concerns: [],
      recommendations: ['Configura el tracking de metricas para empezar a recibir insights.'],
      budgetAdvice: 'Sin datos suficientes para recomendar ajustes de presupuesto.',
      nextSteps: ['Activar importacion de metricas desde las plataformas de ads.'],
    }
  }

  // Aggregate by campaign
  const byCampaign: Record<string, any> = {}
  for (const m of metrics) {
    const key = m.campaignId
    if (!byCampaign[key]) {
      byCampaign[key] = {
        name: m.campaign.name,
        platform: m.campaign.platform,
        objective: m.campaign.objective,
        budget: m.campaign.totalBudget,
        impressions: 0, clicks: 0, spend: 0, conversions: 0, leads: 0,
        days: 0,
      }
    }
    byCampaign[key].impressions += m.impressions
    byCampaign[key].clicks += m.clicks
    byCampaign[key].spend += m.spend
    byCampaign[key].conversions += m.conversions
    byCampaign[key].leads += m.leads
    byCampaign[key].days++
  }

  // Calculate KPIs
  const campaignSummaries = Object.entries(byCampaign).map(([id, c]) => ({
    id,
    ...c,
    ctr: c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0',
    cpc: c.clicks > 0 ? (c.spend / c.clicks).toFixed(2) : '0',
    cpm: c.impressions > 0 ? ((c.spend / c.impressions) * 1000).toFixed(2) : '0',
    cpa: c.conversions > 0 ? (c.spend / c.conversions).toFixed(2) : 'N/A',
    costPerLead: c.leads > 0 ? (c.spend / c.leads).toFixed(2) : 'N/A',
  }))

  const prompt = `Eres un analista de marketing digital experto en Facebook Ads, Google Ads y TikTok Ads para el mercado mexicano. Trabajas para Koi, una agencia en Morelia.

Analiza estas metricas de los ultimos ${input.days} dias y da insights accionables:

${JSON.stringify(campaignSummaries, null, 2)}

Considera estos benchmarks y reglas (basados en experiencia real con Meta Ads en México):

BENCHMARKS MÉXICO:
- CTR aceptable: 1-3% (>3% es excelente)
- CPM promedio: $30-80 MXN (varía por industria y temporada)
- CPC promedio: $3-15 MXN dependiendo del objetivo
- ROAS mínimo para ser rentable: 3x (ideal: 4x+)
- Frecuencia saludable: <3 en 7 días (>3 = fatiga creativa)

REGLAS DE ANÁLISIS:
- Si el ROAS de una campaña BOFU/retargeting es alto pero la de TOFU es baja, NO recomiendes mover todo el presupuesto a BOFU — el TOFU alimenta al BOFU. Sin TOFU, el BOFU se seca.
- Si el ticket promedio está bajando, recomienda estrategias de upselling: bundles, envío gratis por monto mínimo, "compra 2 lleva 3"
- Si la frecuencia sube de 3, recomienda rotar creativos URGENTE
- Si el CTR es bajo (<1%), el problema son los creativos/hooks, no la audiencia
- Si el CTR es bueno pero no hay conversiones, el problema es la landing page o la oferta
- Campañas de temporada (San Valentín, Buen Fin, etc.) van a tener ROAS alto pero NO son sostenibles — no recomiendes basar toda la estrategia en ellas
- Campañas Advantage+ (Shopping) son buenas para TOFU pero NO son BOFU — no confundir

Responde UNICAMENTE con JSON valido:
{
  "summary": "Resumen ejecutivo en 2-3 oraciones de como van las campanas",
  "topPerformers": ["Campanas o metricas que van bien y por que"],
  "concerns": ["Problemas o metricas preocupantes"],
  "recommendations": ["Acciones especificas a tomar YA"],
  "budgetAdvice": "Recomendacion de ajuste de presupuesto (subir/bajar/redistribuir y cuanto)",
  "nextSteps": ["Pasos concretos para la proxima semana"]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const insights: MetricsInsight = JSON.parse(cleanJsonResponse(content.text))

    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'metrics_analysis',
        prompt,
        response: content.text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        estimatedCost: (response.usage.input_tokens * 0.003 + response.usage.output_tokens * 0.015) / 1000,
        accountId: input.accountId,
        duration: Date.now() - startTime,
        success: true,
      },
    })

    return insights
  } catch (error: any) {
    console.error('Metrics analysis error:', error)
    throw error
  }
}
