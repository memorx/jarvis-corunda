import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { createApprovalSchema } from '@/lib/validations'
import type { ApprovalType, ApprovalStatus, ParrillaStatus, ContentStatus } from '@/generated/prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('approvals:create')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const body = await request.json()
    const validation = validateBody(createApprovalSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const type = authCheck.role === 'CLIENT' ? 'CLIENT' : 'INTERNAL'

    const approval = await prisma.approval.create({
      data: {
        userId: authCheck.userId,
        parrillaId: data.entryId ? undefined : id,
        entryId: data.entryId || undefined,
        type: type as ApprovalType,
        status: data.status as ApprovalStatus,
        comment: data.comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    // If approving the whole parrilla, update its status
    if (!data.entryId && data.status === 'APPROVED') {
      const newStatus = type === 'CLIENT' ? 'APPROVED' : 'APPROVED_INTERNAL'
      await prisma.parrilla.update({
        where: { id },
        data: { status: newStatus as ParrillaStatus },
      })
    }

    // If approving a single entry, update its status
    if (data.entryId && data.status === 'APPROVED') {
      const newStatus = type === 'CLIENT' ? 'APPROVED' : 'APPROVED_INTERNAL'
      await prisma.parrillaEntry.update({
        where: { id: data.entryId },
        data: { status: newStatus as ContentStatus },
      })
    }

    // If rejecting, update status
    if (data.status === 'REJECTED' || data.status === 'REVISION_REQUESTED') {
      if (data.entryId) {
        await prisma.parrillaEntry.update({
          where: { id: data.entryId },
          data: { status: 'REVISION' as ContentStatus },
        })
      } else {
        const newStatus = type === 'CLIENT' ? 'CLIENT_REVISION' : 'REVISION'
        await prisma.parrilla.update({
          where: { id },
          data: { status: newStatus as ParrillaStatus },
        })
      }
    }

    return NextResponse.json(approval, { status: 201 })
  } catch (error) {
    console.error('Error creating approval:', error)
    return NextResponse.json({ error: 'Error al procesar aprobación' }, { status: 500 })
  }
}
