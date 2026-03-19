import Anthropic from '@anthropic-ai/sdk'
import { generateStrategy } from './strategy-generator'
import prisma from '@/lib/db'
import { PLATFORM_LABELS } from '@/lib/constants'
import { cleanJsonResponse } from '@/lib/utils'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface ParrillaGenerationInput {
  accountId: string
  month: number
  year: number
  objectives: string
  platforms: string[]
  contentMix: {
    staticImages: number
    videos: number
    carousels: number
    stories: number
  }
  isPaid: boolean
  specialInstructions?: string
  promotions?: string
  budget?: number
}

interface EntryPlan {
  publishDate: string
  platform: string
  contentType: string
  objective: string
  concept: string
  hookType: string
  funnelStage: string
}

export function normalizeContentType(type: string): string {
  const map: Record<string, string> = {
    'VIDEO': 'VIDEO_SHORT',
    'IMAGE': 'STATIC_IMAGE',
    'STATIC': 'STATIC_IMAGE',
    'REEL': 'VIDEO_SHORT',
    'STORY': 'STORY',
    'STORIES': 'STORY',
  }
  return map[type.toUpperCase()] || type
}

export function normalizePlatform(platform: string): string {
  const map: Record<string, string> = {
    'META': 'META_FEED',
    'FACEBOOK': 'META_FEED',
    'INSTAGRAM': 'META_FEED',
    'INSTAGRAM_REELS': 'META_REELS',
    'INSTAGRAM_STORIES': 'META_STORIES',
    'GOOGLE': 'GOOGLE_SEARCH',
    'YOUTUBE': 'GOOGLE_YOUTUBE',
  }
  return map[platform.toUpperCase()] || platform
}

export async function generateParrilla(input: ParrillaGenerationInput) {
  // Step 1: Load account
  const account = await prisma.account.findUnique({
    where: { id: input.accountId },
  })
  if (!account) throw new Error('Cuenta no encontrada')

  // Step 2: Generate strategy
  const strategy = await generateStrategy({
    accountId: input.accountId,
    month: input.month,
    year: input.year,
    objectives: input.objectives,
    specialInstructions: input.specialInstructions,
    promotions: input.promotions,
    isPaid: input.isPaid,
  })

  // Step 3: Generate entry plan (dates, platforms, types) using Claude
  const totalEntries = input.contentMix.staticImages + input.contentMix.videos + input.contentMix.carousels + input.contentMix.stories

  const planPrompt = `Basándote en esta estrategia:
${JSON.stringify(strategy)}

Genera un plan de ${totalEntries} publicaciones para ${getMonthName(input.month)} ${input.year}.

Distribución:
- ${input.contentMix.staticImages} imágenes estáticas
- ${input.contentMix.videos} videos cortos
- ${input.contentMix.carousels} carruseles
- ${input.contentMix.stories} historias

Plataformas disponibles: ${input.platforms.map(p => PLATFORM_LABELS[p] || p).join(', ')}

IMPORTANTE: Distribuye las entradas en las 3 etapas del embudo de ventas:
- TOFU (frio/awareness): ~40% de las entradas
- MOFU (tibio/consideracion): ~35% de las entradas
- BOFU (caliente/conversion): ~25% de las entradas

REGLAS DE ESTRUCTURA:
- Cada campaña/ángulo debe tener MÍNIMO 2-3 variantes creativas (diferentes formatos o enfoques)
- NO generes una sola pieza por ángulo — la plataforma necesita opciones para testear
- Prioriza VIDEO sobre imagen estática — los videos suelen tener mejor performance en Meta
- Para TOFU: usa hooks de problema/curiosidad, NO vendas directo
- Para BOFU: sé directo con la oferta, precio, urgencia
- Varía los formatos: no todas imágenes estáticas. Mezcla imagen + video + carrusel por ángulo

Responde SOLO con JSON válido (array):
[
  {
    "publishDate": "YYYY-MM-DD",
    "platform": "META_FEED",
    "contentType": "STATIC_IMAGE",
    "objective": "awareness|engagement|leads|conversions|traffic",
    "concept": "Descripción breve del concepto de esta pieza",
    "hookType": "question|emotion|urgency|social_proof|humor|data",
    "funnelStage": "TOFU|MOFU|BOFU"
  }
]

Distribuye las publicaciones de manera uniforme a lo largo del mes. Varía los tipos de hooks. Alterna entre plataformas.`

  const planResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{ role: 'user', content: planPrompt }],
  })

  const planContent = planResponse.content[0]
  if (planContent.type !== 'text') throw new Error('Unexpected response type')
  const rawPlans: EntryPlan[] = JSON.parse(cleanJsonResponse(planContent.text))
  const entryPlans = rawPlans.map(plan => ({
    ...plan,
    platform: normalizePlatform(plan.platform),
    contentType: normalizeContentType(plan.contentType),
  }))

  // Step 4: Create parrilla in DB
  const parrilla = await prisma.parrilla.create({
    data: {
      accountId: input.accountId,
      createdById: (await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } }))!.id,
      name: `${getMonthName(input.month)} ${input.year} - ${account.brandName}`,
      month: input.month,
      year: input.year,
      description: input.objectives,
      status: 'DRAFT',
      aiPrompt: JSON.stringify(input),
      aiStrategy: strategy as any,
    },
  })

  // Step 5: Create skeleton entries (no copies/images/videos — those are generated later per entry)
  const entries = await Promise.all(
    entryPlans.map((plan) =>
      prisma.parrillaEntry.create({
        data: {
          parrillaId: parrilla.id,
          publishDate: new Date(plan.publishDate),
          platform: plan.platform as any,
          contentType: plan.contentType as any,
          objective: plan.objective,
          visualConcept: plan.concept,
          hookType: plan.hookType,
          funnelStage: plan.funnelStage || null,
          isPaid: input.isPaid,
          budget: input.budget ? input.budget / totalEntries : null,
          status: 'DRAFT',
        },
      })
    )
  )

  return {
    parrillaId: parrilla.id,
    strategy,
    entriesCreated: entries.length,
    totalPlanned: entryPlans.length,
  }
}

export function getMonthName(month: number): string {
  const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return names[month - 1] || ''
}

export function getDefaultAspectRatio(platform: string): string {
  const ratios: Record<string, string> = {
    META_FEED: '1:1',
    META_STORIES: '9:16',
    META_REELS: '9:16',
    TIKTOK: '9:16',
    YOUTUBE_SHORTS: '9:16',
    GOOGLE_DISPLAY: '1.91:1',
    GOOGLE_YOUTUBE: '16:9',
    LINKEDIN: '1.91:1',
  }
  return ratios[platform] || '1:1'
}
