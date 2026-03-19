import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

/**
 * Genera un resumen ejecutivo de un documento largo.
 * Se usa para incluir el contexto en prompts sin mandar 50 páginas.
 * Target: ~500-1000 palabras de resumen por documento.
 */
export async function generateDocumentSummary(
  content: string,
  docType?: string
): Promise<string> {
  const typeContext = docType ? {
    kickoff: 'una transcripción de reunión de kickoff con el cliente',
    audit: 'una auditoría de reseñas del negocio',
    strategy: 'un documento de estrategia de marketing/crecimiento',
    dossier: 'un dossier de marketing con contexto del negocio',
    brief: 'un brief creativo del cliente',
    research: 'un documento de investigación de mercado',
    other: 'un documento de contexto del negocio',
  }[docType] || 'un documento de contexto' : 'un documento de contexto'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Eres un asistente de marketing. Analiza ${typeContext} y genera un resumen ejecutivo.

El resumen debe capturar:
1. La esencia de la marca/negocio (valores, personalidad, diferenciadores)
2. El público objetivo (quiénes son, qué quieren, qué les duele)
3. Puntos de dolor y oportunidades identificados
4. Cualquier dato duro relevante (números, métricas, precios, capacidad)
5. Tono de comunicación y estilo de la marca
6. Insights clave para crear campañas de publicidad

NO inventes información. Solo resume lo que está en el documento.
El resumen debe ser conciso pero completo — entre 500 y 1000 palabras.
Escribe en español.

DOCUMENTO:
${content.slice(0, 50000)}`
    }],
  })

  const textBlock = response.content[0]
  if (textBlock.type !== 'text') throw new Error('Unexpected response type')

  // Log the summarization
  await prisma.aIGenerationLog.create({
    data: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      promptType: 'document_summary',
      prompt: `Summarize ${docType} document (${content.length} chars)`,
      response: textBlock.text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      estimatedCost: (response.usage.input_tokens * 0.003 + response.usage.output_tokens * 0.015) / 1000,
      duration: 0,
      success: true,
    },
  })

  return textBlock.text
}
