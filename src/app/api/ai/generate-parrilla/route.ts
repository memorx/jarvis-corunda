import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateParrilla } from '@/lib/ai/parrilla-generator'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const result = await generateParrilla({
      accountId: body.accountId,
      month: body.month,
      year: body.year,
      objectives: body.objectives,
      platforms: body.platforms,
      contentMix: body.contentMix,
      isPaid: body.isPaid || false,
      specialInstructions: body.specialInstructions,
      promotions: body.promotions,
      budget: body.budget,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Parrilla generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar parrilla' },
      { status: 500 }
    )
  }
}
