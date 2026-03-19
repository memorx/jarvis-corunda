import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { generateImage } from '@/lib/ai/image-generator'
import { validateBody } from '@/lib/validate'
import { generateImageSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('playground:use')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(generateImageSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const image = await generateImage(data)

    return NextResponse.json(image)
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar imagen' },
      { status: 500 }
    )
  }
}
