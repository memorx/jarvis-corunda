import Anthropic from '@anthropic-ai/sdk'
import { getVideoDirectorSystemPrompt, getVideoDirectorUserPrompt } from './prompts/video-director'
import { buildAccountContext } from './context-builder'
import prisma from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface VideoScriptInput {
  accountId: string
  concept: string
  platform: string
  duration: string
  objective: string
  strategy?: any
  parrillaId?: string
  entryId?: string
  funnelStage?: string
}

export interface VideoScene {
  timestamp: string
  visual: string
  audio: string
  textOverlay: string
  transition: 'cut' | 'fade' | 'zoom' | 'swipe' | 'morph'
}

export interface VideoScriptVariant {
  style: 'produced' | 'ugc'
  hook: string
  scenes: VideoScene[]
  ctaScene: {
    visual: string
    textOverlay: string
    audio: string
  }
  musicSuggestion: string
  productionNotes: string
}

export interface VideoScriptOutput {
  variants: VideoScriptVariant[]
}

export async function generateVideoScript(input: VideoScriptInput): Promise<VideoScriptOutput> {
  const startTime = Date.now()

  const account = await prisma.account.findUnique({
    where: { id: input.accountId },
  })

  if (!account) throw new Error('Cuenta no encontrada')

  // Construir contexto enriquecido de documentos
  const knowledgeBase = await buildAccountContext(input.accountId)

  const systemPrompt = getVideoDirectorSystemPrompt({
    brandName: account.brandName,
    brandVoice: account.brandVoice,
    targetAudience: account.targetAudience,
    painPoints: account.painPoints,
    productInfo: account.productInfo,
  }) + knowledgeBase

  const userPrompt = getVideoDirectorUserPrompt({
    concept: input.concept,
    platform: input.platform,
    duration: input.duration,
    objective: input.objective,
    strategy: input.strategy,
    funnelStage: input.funnelStage,
  })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const script: VideoScriptOutput = JSON.parse(content.text)

    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'video_script',
        prompt: userPrompt,
        response: content.text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        estimatedCost: (response.usage.input_tokens * 0.003 + response.usage.output_tokens * 0.015) / 1000,
        accountId: input.accountId,
        parrillaId: input.parrillaId,
        entryId: input.entryId,
        duration: Date.now() - startTime,
        success: true,
      },
    })

    return script
  } catch (error: any) {
    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'video_script',
        prompt: userPrompt,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        accountId: input.accountId,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
      },
    })
    throw error
  }
}
