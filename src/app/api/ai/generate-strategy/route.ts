import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { generateStrategy } from '@/lib/ai/strategy-generator'
import { validateBody } from '@/lib/validate'
import { generateStrategySchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('playground:use')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(generateStrategySchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const strategy = await generateStrategy(data)

    return NextResponse.json(strategy)
  } catch (error: any) {
    console.error('Strategy generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar estrategia' },
      { status: 500 }
    )
  }
}
