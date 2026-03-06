import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateImage } from '@/lib/ai/image-generator'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const image = await generateImage({
      prompt: body.prompt,
      size: body.size || '1024x1024',
      quality: body.quality || 'hd',
      accountId: body.accountId,
      parrillaId: body.parrillaId,
      entryId: body.entryId,
    })

    return NextResponse.json(image)
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar imagen' },
      { status: 500 }
    )
  }
}
