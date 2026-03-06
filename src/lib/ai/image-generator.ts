import OpenAI from 'openai'
import prisma from '@/lib/db'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface ImageGenerationInput {
  prompt: string
  size: '1024x1024' | '1024x1792' | '1792x1024'
  quality?: 'standard' | 'hd'
  accountId?: string
  parrillaId?: string
  entryId?: string
}

export interface ImageGenerationOutput {
  url: string
  revisedPrompt: string
}

function mapAspectRatioToSize(aspectRatio: string): '1024x1024' | '1024x1792' | '1792x1024' {
  if (['9:16', '4:5', '4:15'].includes(aspectRatio)) return '1024x1792'
  if (['16:9', '1.91:1'].includes(aspectRatio)) return '1792x1024'
  return '1024x1024'
}

export { mapAspectRatioToSize }

export async function generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
  const startTime = Date.now()

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: input.prompt,
      n: 1,
      size: input.size,
      quality: input.quality || 'hd',
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) throw new Error('No image URL in response')

    const revisedPrompt = response.data?.[0]?.revised_prompt || input.prompt

    // Estimate cost: DALL-E 3 HD = $0.080 per image, Standard = $0.040
    const cost = input.quality === 'standard' ? 0.04 : 0.08

    await prisma.aIGenerationLog.create({
      data: {
        provider: 'openai',
        model: 'dall-e-3',
        promptType: 'image_generation',
        prompt: input.prompt,
        response: imageUrl,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: cost,
        accountId: input.accountId,
        parrillaId: input.parrillaId,
        entryId: input.entryId,
        duration: Date.now() - startTime,
        success: true,
      },
    })

    return { url: imageUrl, revisedPrompt }
  } catch (error: any) {
    await prisma.aIGenerationLog.create({
      data: {
        provider: 'openai',
        model: 'dall-e-3',
        promptType: 'image_generation',
        prompt: input.prompt,
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
