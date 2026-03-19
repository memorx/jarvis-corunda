import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { validateBody } from '@/lib/validate'

const onboardingSchema = z.object({
  brandName: z.string().min(1).max(200),
  industry: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  brandVoice: z.string().max(5000).optional(),
  brandColors: z.array(z.string()).optional().default([]),
  targetAudience: z.string().max(5000).optional(),
  competitors: z.string().max(5000).optional(),
  guidelines: z.string().max(10000).optional(),
  sampleCopies: z.string().max(10000).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  productInfo: z.string().max(5000).optional(),
  painPoints: z.string().max(5000).optional(),
  differentiators: z.string().max(5000).optional(),
  priceRange: z.string().max(200).optional(),
  salesProcess: z.string().max(2000).optional(),
})

// GET — obtiene datos actuales de la cuenta (para pre-llenar)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const account = await prisma.account.findUnique({
    where: { onboardingToken: token },
    select: {
      brandName: true,
      industry: true,
      description: true,
      onboardingStatus: true,
    },
  })

  if (!account) {
    return NextResponse.json({ error: 'Enlace invalido o expirado' }, { status: 404 })
  }

  return NextResponse.json(account)
}

// POST — guarda la informacion del cliente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const account = await prisma.account.findUnique({
    where: { onboardingToken: token },
  })

  if (!account) {
    return NextResponse.json({ error: 'Enlace invalido o expirado' }, { status: 404 })
  }

  if (account.onboardingStatus === 'COMPLETED') {
    return NextResponse.json({ error: 'Este formulario ya fue completado' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const validation = validateBody(onboardingSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    await prisma.account.update({
      where: { onboardingToken: token },
      data: {
        brandName: data.brandName,
        industry: data.industry || null,
        description: data.description || null,
        brandVoice: data.brandVoice || null,
        brandColors: data.brandColors || [],
        targetAudience: data.targetAudience || null,
        competitors: data.competitors || null,
        guidelines: data.guidelines || null,
        sampleCopies: data.sampleCopies || null,
        websiteUrl: data.websiteUrl || null,
        instagramUrl: data.socialLinks?.instagram || null,
        facebookUrl: data.socialLinks?.facebook || null,
        tiktokUrl: data.socialLinks?.tiktok || null,
        linkedinUrl: data.socialLinks?.linkedin || null,
        productInfo: data.productInfo || null,
        painPoints: data.painPoints || null,
        differentiators: data.differentiators || null,
        priceRange: data.priceRange || null,
        salesProcess: data.salesProcess || null,
        onboardingStatus: 'COMPLETED',
      },
    })

    return NextResponse.json({ success: true, message: 'Informacion guardada correctamente' })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Error al guardar informacion' }, { status: 500 })
  }
}
