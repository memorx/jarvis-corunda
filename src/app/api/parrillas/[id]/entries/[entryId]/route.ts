import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { updateEntrySchema } from '@/lib/validations'
import type { Platform, ContentType, CampaignObjective, ContentStatus } from '@/generated/prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const authCheck = await requireAuth('parrillas:edit')
  if (!authCheck.success) return authCheck.response

  const { entryId } = await params

  try {
    const body = await request.json()
    const validation = validateBody(updateEntrySchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const entry = await prisma.parrillaEntry.update({
      where: { id: entryId },
      data: {
        headline: data.headline,
        primaryText: data.primaryText,
        description: data.description,
        ctaText: data.ctaText,
        hashtags: data.hashtags,
        visualConcept: data.visualConcept,
        imagePrompt: data.imagePrompt,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
        publishTime: data.publishTime,
        platform: data.platform as Platform,
        contentType: data.contentType as ContentType,
        objective: data.objective as CampaignObjective,
        status: data.status as ContentStatus,
      },
      include: {
        assets: true,
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json({ error: 'Error al actualizar entrada' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const authCheck = await requireAuth('parrillas:edit')
  if (!authCheck.success) return authCheck.response

  const { entryId } = await params

  try {
    await prisma.parrillaEntry.delete({ where: { id: entryId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting entry:', error)
    return NextResponse.json({ error: 'Error al eliminar entrada' }, { status: 500 })
  }
}
