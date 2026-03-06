import Anthropic from '@anthropic-ai/sdk'
import { getCopywriterSystemPrompt, getCopyUserPrompt } from './prompts/copywriter'
import { PLATFORM_SPECS } from '@/lib/constants'
import prisma from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface CopyInput {
  accountId: string
  platform: string
  contentType: string
  objective: string
  concept: string
  hookType?: string
  strategy?: any
  parrillaId?: string
  entryId?: string
}

export interface CopyOutput {
  headline: string
  primaryText: string
  description: string
  ctaText: string
  hashtags: string[]
  hookType: string
  reasoning: string
}

function getCharLimits(platform: string): Record<string, number> {
  const specs = PLATFORM_SPECS[platform as keyof typeof PLATFORM_SPECS]
  if (!specs) return { headline: 60, primaryText: 200, description: 100 }

  const limits: Record<string, number> = {}
  if ('headline' in specs) limits.headline = specs.headline as number
  if ('primaryText' in specs) limits.primaryText = specs.primaryText as number
  if ('description' in specs) limits.description = specs.description as number
  if ('textOverlay' in specs) limits.textOverlay = specs.textOverlay as number
  if ('adText' in specs) limits.primaryText = specs.adText as number
  if ('title' in specs) limits.headline = specs.title as number
  if ('shortHeadline' in specs) limits.headline = specs.shortHeadline as number
  if ('longHeadline' in specs) limits.longHeadline = specs.longHeadline as number

  return Object.keys(limits).length > 0 ? limits : { headline: 60, primaryText: 200, description: 100 }
}

export async function generateCopy(input: CopyInput): Promise<CopyOutput> {
  const startTime = Date.now()

  const account = await prisma.account.findUnique({
    where: { id: input.accountId },
  })

  if (!account) throw new Error('Cuenta no encontrada')

  const systemPrompt = getCopywriterSystemPrompt({
    brandName: account.brandName,
    brandVoice: account.brandVoice,
    targetAudience: account.targetAudience,
    guidelines: account.guidelines,
    sampleCopies: account.sampleCopies,
  })

  const charLimits = getCharLimits(input.platform)
  const userPrompt = getCopyUserPrompt({
    platform: input.platform,
    contentType: input.contentType,
    objective: input.objective,
    concept: input.concept,
    hookType: input.hookType,
    strategy: input.strategy,
    charLimits,
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

    const copy: CopyOutput = JSON.parse(content.text)

    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'copies',
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

    return copy
  } catch (error: any) {
    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'copies',
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
