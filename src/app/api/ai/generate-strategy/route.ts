import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateStrategy } from '@/lib/ai/strategy-generator'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const strategy = await generateStrategy({
      accountId: body.accountId,
      month: body.month,
      year: body.year,
      objectives: body.objectives,
      specialInstructions: body.specialInstructions,
      promotions: body.promotions,
      isPaid: body.isPaid || false,
    })

    return NextResponse.json(strategy)
  } catch (error: any) {
    console.error('Strategy generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar estrategia' },
      { status: 500 }
    )
  }
}
