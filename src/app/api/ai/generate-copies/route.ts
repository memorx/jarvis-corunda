import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateCopy } from '@/lib/ai/copy-generator'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const copy = await generateCopy({
      accountId: body.accountId,
      platform: body.platform,
      contentType: body.contentType,
      objective: body.objective,
      concept: body.concept,
      hookType: body.hookType,
      strategy: body.strategy,
      parrillaId: body.parrillaId,
      entryId: body.entryId,
    })

    return NextResponse.json(copy)
  } catch (error: any) {
    console.error('Copy generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar copies' },
      { status: 500 }
    )
  }
}
