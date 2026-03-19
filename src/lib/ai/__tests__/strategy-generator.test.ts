import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAccount, createMockAnthropicResponse, createMockAnthropicErrorResponse } from './_test-helpers'

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
import { generateStrategy } from '../strategy-generator'

const mockStrategyResponse = {
  creative_concept: 'Innovation First',
  key_message: 'Test message',
  emotional_hooks: ['hook1', 'hook2'],
  visual_direction: 'Modern and clean',
  content_pillars: ['pillar1', 'pillar2'],
  color_palette_suggestion: 'Red and green',
  hashtags: ['#test'],
  campaign_angles: [{ angle: 'Direct', objective: 'awareness', platforms: ['META_FEED'] }],
}

describe('generateStrategy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('genera estrategia exitosamente y loguea el resultado', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockResolvedValue(createMockAnthropicResponse(mockStrategyResponse))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    const result = await generateStrategy({
      accountId: 'acc-1',
      month: 3,
      year: 2025,
      objectives: 'Increase awareness',
      isPaid: false,
    })

    expect(result).toEqual(mockStrategyResponse)

    // Verifica que se logueó con éxito
    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: true,
        promptType: 'strategy',
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        accountId: 'acc-1',
      }),
    })

    // Verifica que se llamó a Anthropic con el modelo correcto
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
      })
    )
  })

  it('lanza error cuando la cuenta no existe', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)

    await expect(
      generateStrategy({
        accountId: 'nonexistent',
        month: 1,
        year: 2025,
        objectives: 'Test',
        isPaid: false,
      })
    ).rejects.toThrow('Cuenta no encontrada')

    // Anthropic NUNCA debería haberse llamado
    expect(createMock).not.toHaveBeenCalled()
  })

  it('loguea fallo y relanza error cuando Anthropic falla', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockRejectedValue(new Error('API rate limited'))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await expect(
      generateStrategy({
        accountId: 'acc-1',
        month: 6,
        year: 2025,
        objectives: 'Test',
        isPaid: true,
      })
    ).rejects.toThrow('API rate limited')

    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: false,
        error: 'API rate limited',
      }),
    })
  })

  it('lanza error cuando Anthropic retorna respuesta no-texto', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockResolvedValue(createMockAnthropicErrorResponse())
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await expect(
      generateStrategy({
        accountId: 'acc-1',
        month: 1,
        year: 2025,
        objectives: 'Test',
        isPaid: false,
      })
    ).rejects.toThrow('Unexpected response type')
  })
})
