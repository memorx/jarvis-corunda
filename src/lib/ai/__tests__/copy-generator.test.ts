import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAccount, createMockAnthropicResponse } from './_test-helpers'

// MOCK: Anthropic SDK — vi.hoisted garantiza que createMock exista cuando vi.mock se ejecuta (hoisted)
const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: createMock } }
  }),
}))

vi.mock('@/lib/db')
vi.mock('@/lib/ai/context-builder', () => ({
  buildAccountContext: vi.fn().mockResolvedValue(''),
}))

import prisma from '@/lib/db'
import { generateCopy } from '../copy-generator'

const mockCopyResponse = {
  headline: 'Test Headline',
  primaryText: 'Test primary text for the ad',
  description: 'Test description',
  ctaText: 'Comprar ahora',
  hashtags: ['#test', '#brand'],
  hookType: 'emotion',
  reasoning: 'Emotion works for awareness',
}

describe('generateCopy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('genera copy exitosamente y loguea el resultado', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockResolvedValue(createMockAnthropicResponse(mockCopyResponse))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    const result = await generateCopy({
      accountId: 'acc-1',
      platform: 'META_FEED',
      contentType: 'STATIC_IMAGE',
      objective: 'awareness',
      concept: 'Promo verano',
    })

    expect(result).toEqual(mockCopyResponse)

    // Verifica log con promptType correcto
    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: true,
        promptType: 'copies',
        provider: 'anthropic',
      }),
    })

    // Verifica que el userPrompt contiene límites de caracteres
    const callArgs = createMock.mock.calls[0][0]
    expect(callArgs.messages[0].content).toContain('máximo')
  })

  it('lanza error cuando la cuenta no existe', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)

    await expect(
      generateCopy({
        accountId: 'nonexistent',
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'awareness',
        concept: 'Test',
      })
    ).rejects.toThrow('Cuenta no encontrada')

    expect(createMock).not.toHaveBeenCalled()
  })

  it('loguea fallo y relanza error cuando Anthropic falla', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockRejectedValue(new Error('Overloaded'))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await expect(
      generateCopy({
        accountId: 'acc-1',
        platform: 'META_FEED',
        contentType: 'STATIC_IMAGE',
        objective: 'awareness',
        concept: 'Test',
      })
    ).rejects.toThrow('Overloaded')

    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: false,
        error: 'Overloaded',
      }),
    })
  })
})
