import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { createCommentSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const authCheck = await requireAuth('parrillas:read')
  if (!authCheck.success) return authCheck.response

  const { entryId } = await params

  try {
    const body = await request.json()
    const validation = validateBody(createCommentSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const comment = await prisma.comment.create({
      data: {
        userId: authCheck.userId,
        entryId,
        content: data.content,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Error al crear comentario' }, { status: 500 })
  }
}
