import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { validateBody } from '@/lib/validate'
import { createAccountSchema } from '@/lib/validations'
import type { Platform, ContentType } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth('accounts:read')
  if (!authCheck.success) return authCheck.response

  try {
    let accounts
    if (authCheck.role === 'CLIENT') {
      accounts = await prisma.account.findMany({
        where: {
          users: { some: { userId: authCheck.userId } },
          isActive: true,
        },
        include: {
          users: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
          _count: { select: { parrillas: true, campaigns: true } },
        },
        orderBy: { name: 'asc' },
      })
    } else {
      accounts = await prisma.account.findMany({
        where: { isActive: true },
        include: {
          users: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
          _count: { select: { parrillas: true, campaigns: true } },
        },
        orderBy: { name: 'asc' },
      })
    }

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Error al obtener cuentas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(createAccountSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const account = await prisma.account.create({
      data: {
        name: data.name,
        brandName: data.brandName,
        industry: data.industry || null,
        description: data.description || null,
        brandVoice: data.brandVoice || null,
        brandColors: data.brandColors,
        targetAudience: data.targetAudience || null,
        competitors: data.competitors || null,
        guidelines: data.guidelines || null,
        sampleCopies: data.sampleCopies || null,
        platforms: data.platforms as Platform[],
        contentTypes: data.contentTypes as ContentType[],
        monthlyBudget: data.monthlyBudget || null,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 })
  }
}
