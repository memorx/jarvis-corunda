import Anthropic from '@anthropic-ai/sdk'
import { getStrategySystemPrompt, getStrategyUserPrompt } from './prompts/strategy'
import prisma from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface StrategyInput {
  accountId: string
  month: number
  year: number
  objectives: string
  specialInstructions?: string
  promotions?: string
  isPaid: boolean
}

export interface StrategyOutput {
  creative_concept: string
  key_message: string
  emotional_hooks: string[]
  visual_direction: string
  content_pillars: string[]
  color_palette_suggestion: string
  hashtags: string[]
  campaign_angles: {
    angle: string
    objective: string
    platforms: string[]
  }[]
}

export async function generateStrategy(input: StrategyInput): Promise<StrategyOutput> {
  const startTime = Date.now()

  // Load account brand settings
  const account = await prisma.account.findUnique({
    where: { id: input.accountId },
  })

  if (!account) throw new Error('Cuenta no encontrada')

  const systemPrompt = getStrategySystemPrompt({
    brandName: account.brandName,
    industry: account.industry,
    brandVoice: account.brandVoice,
    targetAudience: account.targetAudience,
    competitors: account.competitors,
    guidelines: account.guidelines,
    sampleCopies: account.sampleCopies,
    brandColors: account.brandColors,
  })

  const userPrompt = getStrategyUserPrompt({
    month: input.month,
    year: input.year,
    objectives: input.objectives,
    specialInstructions: input.specialInstructions,
    promotions: input.promotions,
    isPaid: input.isPaid,
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

    const strategy: StrategyOutput = JSON.parse(content.text)

    // Log the generation
    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'strategy',
        prompt: userPrompt,
        response: content.text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        estimatedCost: (response.usage.input_tokens * 0.003 + response.usage.output_tokens * 0.015) / 1000,
        accountId: input.accountId,
        duration: Date.now() - startTime,
        success: true,
      },
    })

    return strategy
  } catch (error: any) {
    await prisma.aIGenerationLog.create({
      data: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        promptType: 'strategy',
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
