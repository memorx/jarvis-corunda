import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { validateBody } from '@/lib/validate'
import { z } from 'zod'
import prisma from '@/lib/db'
import { generateCopy } from '@/lib/ai/copy-generator'
import { generateImagePrompt } from '@/lib/ai/image-prompt-generator'
import { generateVideoScript } from '@/lib/ai/video-script-generator'

const regenerateSchema = z.object({
  what: z.enum(['copy', 'imagePrompt', 'videoScript', 'all']),
  instructions: z.string().max(2000).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const authCheck = await requireAuth('parrillas:edit')
  if (!authCheck.success) return authCheck.response

  const { id: parrillaId, entryId } = await params

  try {
    const body = await request.json()
    const validation = validateBody(regenerateSchema, body)
    if (!validation.success) return validation.response
    const { what, instructions } = validation.data

    // Load entry + parrilla + account
    const entry = await prisma.parrillaEntry.findUnique({
      where: { id: entryId },
      include: {
        parrilla: {
          include: {
            account: true,
          },
        },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry no encontrada' }, { status: 404 })
    }

    if (entry.parrillaId !== parrillaId) {
      return NextResponse.json({ error: 'Entry no pertenece a esta parrilla' }, { status: 400 })
    }

    const account = entry.parrilla.account
    const strategy = entry.parrilla.aiStrategy as any
    const updateData: Record<string, any> = {}

    // Regenerate copy
    if (what === 'copy' || what === 'all') {
      const concept = instructions
        ? `${entry.visualConcept || entry.objective}. Instrucciones adicionales: ${instructions}`
        : (entry.visualConcept || entry.objective)

      const copy = await generateCopy({
        accountId: account.id,
        platform: entry.platform,
        contentType: entry.contentType,
        objective: entry.objective,
        concept,
        hookType: entry.hookType || undefined,
        strategy,
        parrillaId,
        entryId,
        funnelStage: (entry as any).funnelStage || undefined,
      })

      updateData.headline = copy.headline
      updateData.primaryText = copy.primaryText
      updateData.description = copy.description
      updateData.ctaText = copy.ctaText
      updateData.hashtags = copy.hashtags
      updateData.hookType = copy.hookType
      updateData.aiReasoning = copy.reasoning
    }

    // Regenerate image prompt
    if ((what === 'imagePrompt' || what === 'all') && !['VIDEO_SHORT', 'VIDEO_LONG'].includes(entry.contentType)) {
      const visualConcept = instructions
        ? `${entry.visualConcept || entry.objective}. ${instructions}`
        : (entry.visualConcept || entry.objective)

      const imgPrompt = await generateImagePrompt({
        accountId: account.id,
        visualConcept,
        platform: entry.platform,
        aspectRatio: getDefaultAspectRatio(entry.platform),
        parrillaId,
        entryId,
        funnelStage: (entry as any).funnelStage || undefined,
      })

      updateData.imagePrompt = imgPrompt.prompt
    }

    // Regenerate video script
    if ((what === 'videoScript' || what === 'all') && ['VIDEO_SHORT', 'VIDEO_LONG'].includes(entry.contentType)) {
      const concept = instructions
        ? `${entry.visualConcept || entry.objective}. ${instructions}`
        : (entry.visualConcept || entry.objective)

      const script = await generateVideoScript({
        accountId: account.id,
        concept,
        platform: entry.platform,
        duration: entry.contentType === 'VIDEO_SHORT' ? '30s' : '60s',
        objective: entry.objective,
        strategy,
        parrillaId,
        entryId,
        funnelStage: (entry as any).funnelStage || undefined,
      })

      updateData.videoScript = script as any
    }

    // Update entry
    const updated = await prisma.parrillaEntry.update({
      where: { id: entryId },
      data: updateData,
      include: {
        assets: true,
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Regeneration error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al regenerar' },
      { status: 500 }
    )
  }
}

function getDefaultAspectRatio(platform: string): string {
  const ratios: Record<string, string> = {
    META_FEED: '1:1',
    META_STORIES: '9:16',
    META_REELS: '9:16',
    TIKTOK: '9:16',
    YOUTUBE_SHORTS: '9:16',
    GOOGLE_DISPLAY: '1.91:1',
    GOOGLE_YOUTUBE: '16:9',
    LINKEDIN: '1.91:1',
  }
  return ratios[platform] || '1:1'
}
