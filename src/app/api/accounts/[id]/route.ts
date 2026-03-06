import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

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
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const role = (session.user as any).role
  if (!['SUPERADMIN', 'MANAGER'].includes(role)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const account = await prisma.account.update({
      where: { id },
      data: {
        name: body.name,
        brandName: body.brandName,
        industry: body.industry,
        description: body.description,
        brandVoice: body.brandVoice,
        brandColors: body.brandColors,
        targetAudience: body.targetAudience,
        competitors: body.competitors,
        guidelines: body.guidelines,
        sampleCopies: body.sampleCopies,
        platforms: body.platforms,
        contentTypes: body.contentTypes,
        monthlyBudget: body.monthlyBudget,
        metaPageId: body.metaPageId,
        metaAdAccountId: body.metaAdAccountId,
        googleAdsId: body.googleAdsId,
        tiktokAdAccountId: body.tiktokAdAccountId,
        linkedinPageId: body.linkedinPageId,
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
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const role = (session.user as any).role
  if (role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

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
