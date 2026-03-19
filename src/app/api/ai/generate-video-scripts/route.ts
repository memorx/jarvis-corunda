import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { generateVideoScript } from '@/lib/ai/video-script-generator'
import { validateBody } from '@/lib/validate'
import { generateVideoScriptSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('playground:use')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(generateVideoScriptSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const script = await generateVideoScript(data)

    return NextResponse.json(script)
  } catch (error: any) {
    console.error('Video script generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar guión de video' },
      { status: 500 }
    )
  }
}
