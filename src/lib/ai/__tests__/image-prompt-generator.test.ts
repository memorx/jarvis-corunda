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
import { generateImagePrompt } from '../image-prompt-generator'

const mockImagePromptResponse = {
  prompt: 'A professional photo of technology products',
  negativePrompt: 'No text, no logos',
  style: 'photographic',
  textOverlaySuggestion: 'Innovación que transforma',
  textPlacement: 'bottom',
}

describe('generateImagePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('genera prompt de imagen exitosamente y loguea el resultado', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockResolvedValue(createMockAnthropicResponse(mockImagePromptResponse))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    const result = await generateImagePrompt({
      accountId: 'acc-1',
      visualConcept: 'Tech product showcase',
      platform: 'META_FEED',
      aspectRatio: '1:1',
    })

    expect(result).toEqual(mockImagePromptResponse)

    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: true,
        promptType: 'image_prompt',
        provider: 'anthropic',
      }),
    })
  })

  it('lanza error cuando la cuenta no existe', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)

    await expect(
      generateImagePrompt({
        accountId: 'nonexistent',
        visualConcept: 'Test',
        platform: 'META_FEED',
        aspectRatio: '1:1',
      })
    ).rejects.toThrow('Cuenta no encontrada')

    expect(createMock).not.toHaveBeenCalled()
  })

  it('loguea fallo y relanza error cuando Anthropic falla', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    createMock.mockRejectedValue(new Error('Service unavailable'))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await expect(
      generateImagePrompt({
        accountId: 'acc-1',
        visualConcept: 'Test',
        platform: 'META_FEED',
        aspectRatio: '1:1',
      })
    ).rejects.toThrow('Service unavailable')

    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: false,
        error: 'Service unavailable',
      }),
    })
  })
})
