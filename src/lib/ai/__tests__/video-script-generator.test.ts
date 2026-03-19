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
import { generateVideoScript } from '../video-script-generator'

const mockVideoScriptResponse = {
  variants: [
    {
      style: 'produced',
      hook: 'Test hook',
      scenes: [{ timestamp: '0-3s', visual: 'Opening', audio: 'Music', textOverlay: 'Hello', transition: 'cut' }],
      ctaScene: { visual: 'Logo', textOverlay: 'Buy now', audio: 'Voiceover' },
      musicSuggestion: 'Upbeat pop',
      productionNotes: 'Use natural lighting',
    },
    {
      style: 'ugc',
      hook: 'UGC hook',
      scenes: [{ timestamp: '0-3s', visual: 'Selfie', audio: 'Talking', textOverlay: 'Hey!', transition: 'cut' }],
      ctaScene: { visual: 'Screen recording', textOverlay: 'Link in bio', audio: 'Voice' },
      musicSuggestion: 'Trending TikTok sound',
      productionNotes: 'Film on iPhone',
    },
  ],
}

describe('generateVideoScript', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('genera guión de video con 2 variantes y loguea el resultado', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockResolvedValue(createMockAnthropicResponse(mockVideoScriptResponse))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    const result = await generateVideoScript({
      accountId: 'acc-1',
      concept: 'Unboxing de producto',
      platform: 'META_REELS',
      duration: '30s',
      objective: 'engagement',
    })

    expect(result.variants).toHaveLength(2)
    expect(result.variants[0].style).toBe('produced')
    expect(result.variants[1].style).toBe('ugc')

    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: true,
        promptType: 'video_script',
        provider: 'anthropic',
      }),
    })
  })

  it('lanza error cuando la cuenta no existe', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)

    await expect(
      generateVideoScript({
        accountId: 'nonexistent',
        concept: 'Test',
        platform: 'TIKTOK',
        duration: '15s',
        objective: 'awareness',
      })
    ).rejects.toThrow('Cuenta no encontrada')

    expect(createMock).not.toHaveBeenCalled()
  })

  it('loguea fallo y relanza error cuando Anthropic falla', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockRejectedValue(new Error('Timeout'))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await expect(
      generateVideoScript({
        accountId: 'acc-1',
        concept: 'Test',
        platform: 'TIKTOK',
        duration: '15s',
        objective: 'awareness',
      })
    ).rejects.toThrow('Timeout')

    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: false,
        error: 'Timeout',
      }),
    })
  })
})
