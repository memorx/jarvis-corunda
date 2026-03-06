import Anthropic from '@anthropic-ai/sdk'
import { generateStrategy, StrategyOutput } from './strategy-generator'
import { generateCopy } from './copy-generator'
import { generateImagePrompt } from './image-prompt-generator'
import { generateVideoScript } from './video-script-generator'
import prisma from '@/lib/db'
import { PLATFORM_LABELS } from '@/lib/constants'

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

Responde SOLO con JSON válido (array):
[
  {
    "publishDate": "YYYY-MM-DD",
    "platform": "META_FEED",
    "contentType": "STATIC_IMAGE",
    "objective": "awareness|engagement|leads|conversions|traffic",
    "concept": "Descripción breve del concepto de esta pieza",
    "hookType": "question|emotion|urgency|social_proof|humor|data"
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
  const entryPlans: EntryPlan[] = JSON.parse(planContent.text)

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

  // Step 5: Generate copies and create entries
  const entries = []
  for (const plan of entryPlans) {
    try {
      // Generate copy
      const copy = await generateCopy({
        accountId: input.accountId,
        platform: plan.platform,
        contentType: plan.contentType,
        objective: plan.objective,
        concept: plan.concept,
        hookType: plan.hookType,
        strategy,
        parrillaId: parrilla.id,
      })

      // Generate image prompt for non-video content
      let imagePrompt = null
      if (!['VIDEO_SHORT', 'VIDEO_LONG'].includes(plan.contentType)) {
        try {
          imagePrompt = await generateImagePrompt({
            accountId: input.accountId,
            visualConcept: plan.concept,
            platform: plan.platform,
            aspectRatio: getDefaultAspectRatio(plan.platform),
            parrillaId: parrilla.id,
          })
        } catch (e) {
          console.error('Image prompt generation failed for entry:', e)
        }
      }

      // Generate video script for video content
      let videoScript = null
      if (['VIDEO_SHORT', 'VIDEO_LONG'].includes(plan.contentType)) {
        try {
          videoScript = await generateVideoScript({
            accountId: input.accountId,
            concept: plan.concept,
            platform: plan.platform,
            duration: plan.contentType === 'VIDEO_SHORT' ? '30s' : '60s',
            objective: plan.objective,
            strategy,
            parrillaId: parrilla.id,
          })
        } catch (e) {
          console.error('Video script generation failed for entry:', e)
        }
      }

      const entry = await prisma.parrillaEntry.create({
        data: {
          parrillaId: parrilla.id,
          publishDate: new Date(plan.publishDate),
          platform: plan.platform as any,
          contentType: plan.contentType as any,
          objective: plan.objective,
          headline: copy.headline,
          primaryText: copy.primaryText,
          description: copy.description,
          ctaText: copy.ctaText,
          hashtags: copy.hashtags,
          visualConcept: plan.concept,
          imagePrompt: imagePrompt?.prompt || null,
          videoScript: videoScript as any,
          hookType: copy.hookType,
          aiReasoning: copy.reasoning,
          isPaid: input.isPaid,
          budget: input.budget ? input.budget / totalEntries : null,
          status: 'DRAFT',
        },
      })

      entries.push(entry)
    } catch (error) {
      console.error(`Failed to generate entry for ${plan.publishDate}:`, error)
      // Create entry with partial data
      const entry = await prisma.parrillaEntry.create({
        data: {
          parrillaId: parrilla.id,
          publishDate: new Date(plan.publishDate),
          platform: plan.platform as any,
          contentType: plan.contentType as any,
          objective: plan.objective,
          visualConcept: plan.concept,
          hookType: plan.hookType,
          isPaid: input.isPaid,
          status: 'DRAFT',
        },
      })
      entries.push(entry)
    }
  }

  return {
    parrillaId: parrilla.id,
    strategy,
    entriesCreated: entries.length,
    totalPlanned: entryPlans.length,
  }
}

function getMonthName(month: number): string {
  const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return names[month - 1] || ''
}

function getDefaultAspectRatio(platform: string): string {
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
