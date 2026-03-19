import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { generateCopy } from '@/lib/ai/copy-generator'
import { validateBody } from '@/lib/validate'
import { generateCopySchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('playground:use')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(generateCopySchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const copy = await generateCopy(data)

    return NextResponse.json(copy)
  } catch (error: any) {
    console.error('Copy generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar copies' },
      { status: 500 }
    )
  }
}
