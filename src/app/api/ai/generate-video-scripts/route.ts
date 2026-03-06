import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateVideoScript } from '@/lib/ai/video-script-generator'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const script = await generateVideoScript({
      accountId: body.accountId,
      concept: body.concept,
      platform: body.platform,
      duration: body.duration || '30s',
      objective: body.objective,
      strategy: body.strategy,
      parrillaId: body.parrillaId,
      entryId: body.entryId,
    })

    return NextResponse.json(script)
  } catch (error: any) {
    console.error('Video script generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar guión de video' },
      { status: 500 }
    )
  }
}
