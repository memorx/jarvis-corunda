import prisma from '@/lib/db'

/**
 * Construye el contexto enriquecido de una cuenta para inyectar en prompts AI.
 * Combina los campos estáticos del Account con los documentos de knowledge base.
 *
 * Reglas de tamaño:
 * - Si hay resúmenes: usa los resúmenes (compactos)
 * - Si no hay resúmenes: trunca contenido a ~2000 chars por doc
 * - Máximo total de contexto de documentos: ~8000 chars (para no saturar el prompt)
 */
export async function buildAccountContext(accountId: string): Promise<string> {
  const documents = await prisma.accountDocument.findMany({
    where: {
      accountId,
      isActive: true,
    },
    select: {
      title: true,
      type: true,
      content: true,
      summary: true,
      charCount: true,
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
  })

  if (documents.length === 0) return ''

  const MAX_TOTAL_CHARS = 8000
  let totalChars = 0
  const sections: string[] = []

  // Ordenar por tipo de prioridad
  const priorityOrder: Record<string, number> = {
    kickoff: 1,
    audit: 2,
    strategy: 3,
    brief: 4,
    dossier: 5,
    research: 6,
    other: 7,
  }

  const sorted = [...documents].sort(
    (a, b) => (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99)
  )

  for (const doc of sorted) {
    if (totalChars >= MAX_TOTAL_CHARS) break

    const text = doc.summary || doc.content
    const available = MAX_TOTAL_CHARS - totalChars
    const truncated = text.length > available ? text.slice(0, available) + '...' : text

    const typeLabels: Record<string, string> = {
      kickoff: 'Reunión de kickoff',
      audit: 'Auditoría de reseñas',
      strategy: 'Estrategia de crecimiento',
      dossier: 'Dossier de marketing',
      brief: 'Brief creativo',
      research: 'Investigación de mercado',
      other: 'Contexto adicional',
    }

    sections.push(`### ${typeLabels[doc.type] || doc.type}: ${doc.title}\n${truncated}`)
    totalChars += truncated.length
  }

  return `\n## KNOWLEDGE BASE DEL CLIENTE (documentos de contexto)\n${sections.join('\n\n')}`
}
