import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { validateBody } from '@/lib/validate'
import { z } from 'zod'
import prisma from '@/lib/db'
import { generateDocumentSummary } from '@/lib/ai/document-summarizer'

const updateDocSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(500000).optional(),
  type: z.enum(['kickoff', 'audit', 'strategy', 'dossier', 'brief', 'research', 'other']).optional(),
  isActive: z.boolean().optional(),
})

// GET — obtener documento completo (con contenido)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const authCheck = await requireAuth('accounts:read')
  if (!authCheck.success) return authCheck.response

  const { docId } = await params

  try {
    const doc = await prisma.accountDocument.findUnique({
      where: { id: docId },
      include: { uploadedBy: { select: { name: true } } },
    })

    if (!doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Error al obtener documento' }, { status: 500 })
  }
}

// PUT — actualizar documento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  const { docId } = await params

  try {
    const body = await request.json()
    const validation = validateBody(updateDocSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    const updateData: Record<string, unknown> = { ...data }
    if (data.content) {
      updateData.charCount = data.content.length
      // Re-generar resumen si el contenido cambió y es largo
      if (data.content.length > 3000) {
        try {
          updateData.summary = await generateDocumentSummary(data.content, data.type)
        } catch (e) {
          console.error('Failed to regenerate summary:', e)
        }
      }
    }

    const doc = await prisma.accountDocument.update({
      where: { id: docId },
      data: updateData,
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Error al actualizar documento' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const authCheck = await requireAuth('accounts:write')
  if (!authCheck.success) return authCheck.response

  const { docId } = await params

  try {
    await prisma.accountDocument.delete({ where: { id: docId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Error al eliminar documento' }, { status: 500 })
  }
}
