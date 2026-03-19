import { describe, it, expect, vi, beforeEach } from 'vitest'

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: createMock } }
  }),
}))

vi.mock('@/lib/db')

import prisma from '@/lib/db'
import { generateDocumentSummary } from '../document-summarizer'

describe('generateDocumentSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('genera resumen y crea log de AI', async () => {
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: 'Resumen generado del documento' }],
      usage: { input_tokens: 1000, output_tokens: 500 },
    })
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    const result = await generateDocumentSummary('Contenido largo del documento...', 'kickoff')

    expect(result).toBe('Resumen generado del documento')
    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        promptType: 'document_summary',
        success: true,
        provider: 'anthropic',
      }),
    })
  })

  it('trunca contenido mayor a 50K caracteres', async () => {
    const longContent = 'X'.repeat(60000)
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: 'Resumen' }],
      usage: { input_tokens: 2000, output_tokens: 200 },
    })
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await generateDocumentSummary(longContent, 'audit')

    const calledWith = createMock.mock.calls[0][0]
    const userMessage = calledWith.messages[0].content
    // El contenido dentro del prompt no deberia tener mas de 50000 chars del doc
    expect(userMessage.length).toBeLessThan(51000)
  })

  it('lanza error cuando Anthropic retorna tipo no-texto', async () => {
    createMock.mockResolvedValue({
      content: [{ type: 'tool_use', id: 'x', name: 'y', input: {} }],
      usage: { input_tokens: 100, output_tokens: 0 },
    })

    await expect(
      generateDocumentSummary('Contenido', 'brief')
    ).rejects.toThrow('Unexpected response type')
  })

  it('lanza error cuando la API falla', async () => {
    createMock.mockRejectedValue(new Error('API error'))

    await expect(
      generateDocumentSummary('Contenido', 'strategy')
    ).rejects.toThrow('API error')
  })
})
