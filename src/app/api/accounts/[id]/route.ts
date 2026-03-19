import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { updateAccountSchema } from '@/lib/validations'
import type { Platform, ContentType } from '@/generated/prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('accounts:read')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true },
            },
          },
        },
        _count: {
          select: { parrillas: true, campaigns: true },
        },
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json({ error: 'Error al obtener cuenta' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const body = await request.json()
    const validation = validateBody(updateAccountSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const account = await prisma.account.update({
      where: { id },
      data: {
        name: data.name,
        brandName: data.brandName,
        industry: data.industry,
        description: data.description,
        brandVoice: data.brandVoice,
        brandColors: data.brandColors,
        targetAudience: data.targetAudience,
        competitors: data.competitors,
        guidelines: data.guidelines,
        sampleCopies: data.sampleCopies,
        platforms: data.platforms as Platform[],
        contentTypes: data.contentTypes as ContentType[],
        monthlyBudget: data.monthlyBudget,
        metaPageId: data.metaPageId,
        metaAdAccountId: data.metaAdAccountId,
        googleAdsId: data.googleAdsId,
        tiktokAdAccountId: data.tiktokAdAccountId,
        linkedinPageId: data.linkedinPageId,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Error al actualizar cuenta' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    await prisma.account.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Error al eliminar cuenta' }, { status: 500 })
  }
}
