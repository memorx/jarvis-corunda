import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { randomBytes } from 'crypto'

// POST — genera un token de onboarding
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const token = randomBytes(32).toString('hex')

    await prisma.account.update({
      where: { id },
      data: {
        onboardingToken: token,
        onboardingStatus: 'PENDING',
      },
    })

    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/${token}`

    return NextResponse.json({ token, url })
  } catch (error) {
    console.error('Error generating onboarding token:', error)
    return NextResponse.json({ error: 'Error al generar enlace' }, { status: 500 })
  }
}
