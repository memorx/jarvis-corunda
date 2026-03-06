import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { entryId } = await params

  try {
    const body = await request.json()
    const entry = await prisma.parrillaEntry.update({
      where: { id: entryId },
      data: {
        headline: body.headline,
        primaryText: body.primaryText,
        description: body.description,
        ctaText: body.ctaText,
        hashtags: body.hashtags,
        visualConcept: body.visualConcept,
        imagePrompt: body.imagePrompt,
        publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
        publishTime: body.publishTime,
        platform: body.platform,
        contentType: body.contentType,
        objective: body.objective,
        status: body.status,
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
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { entryId } = await params

  try {
    await prisma.parrillaEntry.delete({ where: { id: entryId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting entry:', error)
    return NextResponse.json({ error: 'Error al eliminar entrada' }, { status: 500 })
  }
}
