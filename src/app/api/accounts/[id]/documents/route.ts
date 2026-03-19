import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { validateBody } from '@/lib/validate'
import { z } from 'zod'
import prisma from '@/lib/db'
import { generateDocumentSummary } from '@/lib/ai/document-summarizer'

const createDocSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200),
  type: z.enum(['kickoff', 'audit', 'strategy', 'dossier', 'brief', 'research', 'other']),
  content: z.string().min(1, 'Contenido requerido').max(500000),
})

// GET — listar documentos de una cuenta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('accounts:read')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const documents = await prisma.accountDocument.findMany({
      where: { accountId: id },
      select: {
        id: true,
        title: true,
        type: true,
        charCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Error al obtener documentos' }, { status: 500 })
  }
}

// POST — crear documento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  const { id } = await params

  try {
    const body = await request.json()
    const validation = validateBody(createDocSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    // Generar resumen automático si el documento es largo (> 3000 chars)
    let summary: string | null = null
    if (data.content.length > 3000) {
      try {
        summary = await generateDocumentSummary(data.content, data.type)
      } catch (e) {
        console.error('Failed to generate summary:', e)
        // No bloquear la creación si el resumen falla
      }
    }

    const doc = await prisma.accountDocument.create({
      data: {
        accountId: id,
        title: data.title,
        type: data.type,
        content: data.content,
        summary,
        charCount: data.content.length,
        uploadedById: authCheck.userId,
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Error al crear documento' }, { status: 500 })
  }
}
