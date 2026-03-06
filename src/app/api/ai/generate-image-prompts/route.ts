import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateImagePrompt } from '@/lib/ai/image-prompt-generator'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const imagePrompt = await generateImagePrompt({
      accountId: body.accountId,
      visualConcept: body.visualConcept,
      platform: body.platform,
      aspectRatio: body.aspectRatio,
      style: body.style,
      parrillaId: body.parrillaId,
      entryId: body.entryId,
    })

    return NextResponse.json(imagePrompt)
  } catch (error: any) {
    console.error('Image prompt generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar prompts de imagen' },
      { status: 500 }
    )
  }
}
