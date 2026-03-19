import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { generateParrilla } from '@/lib/ai/parrilla-generator'
import { validateBody } from '@/lib/validate'
import { generateParrillaSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('parrillas:create')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(generateParrillaSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const result = await generateParrilla(data)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Parrilla generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar parrilla' },
      { status: 500 }
    )
  }
}
