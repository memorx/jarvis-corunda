import Anthropic from '@anthropic-ai/sdk'
import { getImageDirectorSystemPrompt, getImageDirectorUserPrompt } from './prompts/image-director'
import { buildAccountContext } from './context-builder'
import { cleanJsonResponse } from '@/lib/utils'
import prisma from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface ImagePromptInput {
  accountId: string
  visualConcept: string
  platform: string
  aspectRatio: string
  style?: string
  parrillaId?: string
  entryId?: string
  funnelStage?: string
}

export interface ImagePromptOutput {
  prompt: string
  negativePrompt: string
  style: string
  textOverlaySuggestion: string
  textPlacement: string
}

export async function generateImagePrompt(input: ImagePromptInput): Promise<ImagePromptOutput> {
  const startTime = Date.now()

  const account = await prisma.account.findUnique({
    where: { id: input.accountId },
  })

  if (!account) throw new Error('Cuenta no encontrada')

  // Construir contexto enriquecido de documentos
  const knowledgeBase = await buildAccountContext(input.accountId)

  const systemPrompt = getImageDirectorSystemPrompt() + knowledgeBase
  const userPrompt = getImageDirectorUserPrompt({
    visualConcept: input.visualConcept,
    brandColors: account.brandColors,
    platform: input.platform,
    aspectRatio: input.aspectRatio,
    style: input.style,
    brandName: account.brandName,
    funnelStage: input.funnelStage,
    productInfo: account.productInfo ?? undefined,
    industry: account.industry ?? undefined,
  })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const result: ImagePromptOutput = JSON.parse(cleanJsonResponse(content.text))

    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'image_prompt',
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

    return result
  } catch (error: any) {
    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'image_prompt',
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
