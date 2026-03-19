import { NextRequest, NextResponse } from 'next/server'
import { requireApiKey } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { publishResultSchema } from '@/lib/validations'
import type { ContentStatus } from '@/generated/prisma/client'

export async function POST(request: NextRequest) {
  const keyCheck = requireApiKey(request)
  if (!keyCheck.success) return keyCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(publishResultSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const { entryId, platform, externalPostId, publishedUrl, success } = data

    if (success) {
      await prisma.parrillaEntry.update({
        where: { id: entryId },
        data: { status: 'PUBLISHED' as ContentStatus },
      })
    }

    console.log('[n8n Publish]', {
      entryId,
      platform,
      externalPostId,
      publishedUrl,
      success,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('n8n publish-result error:', error)
    return NextResponse.json({ error: 'Failed to process publish result' }, { status: 500 })
  }
}
