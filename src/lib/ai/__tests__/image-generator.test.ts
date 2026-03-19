import { describe, it, expect, vi, beforeEach } from 'vitest'

// MOCK: OpenAI SDK — vi.hoisted garantiza que generateMock exista cuando vi.mock se ejecuta (hoisted)
const { generateMock } = vi.hoisted(() => ({ generateMock: vi.fn() }))
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function () {
    return { images: { generate: generateMock } }
  }),
}))

vi.mock('@/lib/db')

import prisma from '@/lib/db'
import { generateImage } from '../image-generator'

const mockOpenAIResponse = {
  data: [{
    url: 'https://oaidalleapiprodscus.blob.core.windows.net/test-image.png',
    revised_prompt: 'A revised version of the prompt',
  }],
}

describe('generateImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('genera imagen exitosamente y loguea el resultado', async () => {
    generateMock.mockResolvedValue(mockOpenAIResponse)
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    const result = await generateImage({
      prompt: 'A beautiful sunset',
      size: '1024x1024',
    })

    expect(result).toEqual({
      url: 'https://oaidalleapiprodscus.blob.core.windows.net/test-image.png',
      revisedPrompt: 'A revised version of the prompt',
    })

    // Verifica llamada a OpenAI con parámetros correctos
    expect(generateMock).toHaveBeenCalledWith({
      model: 'dall-e-3',
      prompt: 'A beautiful sunset',
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    })

    // Verifica log
    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: 'openai',
        promptType: 'image_generation',
        success: true,
        estimatedCost: 0.08,
      }),
    })
  })

  it('usa costo de $0.04 cuando quality es standard', async () => {
    generateMock.mockResolvedValue(mockOpenAIResponse)
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await generateImage({
      prompt: 'Test',
      size: '1024x1024',
      quality: 'standard',
    })

    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        estimatedCost: 0.04,
      }),
    })
  })

  it('lanza error cuando no hay URL en la respuesta', async () => {
    // MOCK: OpenAI retorna data sin URL
    generateMock.mockResolvedValue({ data: [{ url: undefined }] })
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await expect(
      generateImage({ prompt: 'Test', size: '1024x1024' })
    ).rejects.toThrow('No image URL in response')
  })

  it('loguea fallo y relanza error cuando OpenAI falla', async () => {
    generateMock.mockRejectedValue(new Error('Billing limit reached'))
    vi.mocked(prisma.aIGenerationLog.create).mockResolvedValue({} as any)

    await expect(
      generateImage({ prompt: 'Test', size: '1024x1024' })
    ).rejects.toThrow('Billing limit reached')

    expect(prisma.aIGenerationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        success: false,
        error: 'Billing limit reached',
      }),
    })
  })
})
