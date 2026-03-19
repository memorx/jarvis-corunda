import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { generateImagePrompt } from '@/lib/ai/image-prompt-generator'
import { validateBody } from '@/lib/validate'
import { generateImagePromptSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('playground:use')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(generateImagePromptSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const imagePrompt = await generateImagePrompt(data)

    return NextResponse.json(imagePrompt)
  } catch (error: any) {
    console.error('Image prompt generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar prompts de imagen' },
      { status: 500 }
    )
  }
}
