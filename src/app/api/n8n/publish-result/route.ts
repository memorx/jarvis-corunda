import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { entryId, platform, externalPostId, publishedUrl, success } = body

    if (!entryId) {
      return NextResponse.json({ error: 'entryId is required' }, { status: 400 })
    }

    if (success) {
      await prisma.parrillaEntry.update({
        where: { id: entryId },
        data: { status: 'PUBLISHED' },
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
