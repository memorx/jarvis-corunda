import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const role = (session.user as any).role
    const type = role === 'CLIENT' ? 'CLIENT' : 'INTERNAL'

    const approval = await prisma.approval.create({
      data: {
        userId: session.user.id,
        parrillaId: body.entryId ? undefined : id,
        entryId: body.entryId || undefined,
        type: type as any,
        status: body.status,
        comment: body.comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    })

    // If approving the whole parrilla, update its status
    if (!body.entryId && body.status === 'APPROVED') {
      const newStatus = type === 'CLIENT' ? 'APPROVED' : 'APPROVED_INTERNAL'
      await prisma.parrilla.update({
        where: { id },
        data: { status: newStatus as any },
      })
    }

    // If approving a single entry, update its status
    if (body.entryId && body.status === 'APPROVED') {
      const newStatus = type === 'CLIENT' ? 'APPROVED' : 'APPROVED_INTERNAL'
      await prisma.parrillaEntry.update({
        where: { id: body.entryId },
        data: { status: newStatus as any },
      })
    }

    // If rejecting, update status
    if (body.status === 'REJECTED' || body.status === 'REVISION_REQUESTED') {
      if (body.entryId) {
        await prisma.parrillaEntry.update({
          where: { id: body.entryId },
          data: { status: 'REVISION' as any },
        })
      } else {
        const newStatus = type === 'CLIENT' ? 'CLIENT_REVISION' : 'REVISION'
        await prisma.parrilla.update({
          where: { id },
          data: { status: newStatus as any },
        })
      }
    }

    return NextResponse.json(approval, { status: 201 })
  } catch (error) {
    console.error('Error creating approval:', error)
    return NextResponse.json({ error: 'Error al procesar aprobación' }, { status: 500 })
  }
}
