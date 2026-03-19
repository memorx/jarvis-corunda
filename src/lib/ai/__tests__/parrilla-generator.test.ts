import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { mockAccount } from './_test-helpers'

// MOCK: generators individuales — no mockeamos SDKs, solo los generators ya testeados
vi.mock('@/lib/ai/strategy-generator')
vi.mock('@/lib/ai/copy-generator')
vi.mock('@/lib/ai/image-prompt-generator')
vi.mock('@/lib/ai/video-script-generator')
vi.mock('@/lib/db')
vi.mock('@/lib/ai/context-builder', () => ({
  buildAccountContext: vi.fn().mockResolvedValue(''),
}))

// MOCK: Anthropic SDK — solo para la llamada directa de planificación de entries
const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: createMock } }
  }),
}))

import prisma from '@/lib/db'
import { generateStrategy } from '../strategy-generator'
import { generateCopy } from '../copy-generator'
import { generateImagePrompt } from '../image-prompt-generator'
import { generateVideoScript } from '../video-script-generator'
import { generateParrilla, normalizeContentType, normalizePlatform } from '../parrilla-generator'

const mockInput = {
  accountId: 'acc-1',
  month: 3,
  year: 2025,
  objectives: 'Increase brand awareness',
  platforms: ['META_FEED', 'TIKTOK'],
  contentMix: {
    staticImages: 2,
    videos: 1,
    carousels: 0,
    stories: 0,
  },
  isPaid: false,
  budget: 30000,
}

const mockStrategy = {
  creative_concept: 'Test Concept',
  key_message: 'Test message',
  emotional_hooks: ['hook1'],
  visual_direction: 'Modern',
  content_pillars: ['pillar1'],
  color_palette_suggestion: 'Blue tones',
  hashtags: ['#test'],
  campaign_angles: [{ angle: 'Direct', objective: 'awareness', platforms: ['META_FEED'] }],
}

const mockEntryPlans = [
  {
    publishDate: '2025-03-05',
    platform: 'META_FEED',
    contentType: 'STATIC_IMAGE',
    objective: 'awareness',
    concept: 'Product showcase',
    hookType: 'emotion',
  },
  {
    publishDate: '2025-03-12',
    platform: 'TIKTOK',
    contentType: 'STATIC_IMAGE',
    objective: 'engagement',
    concept: 'Behind the scenes',
    hookType: 'humor',
  },
  {
    publishDate: '2025-03-20',
    platform: 'META_FEED',
    contentType: 'VIDEO_SHORT',
    objective: 'traffic',
    concept: 'Tutorial video',
    hookType: 'question',
  },
]

const mockCopy = {
  headline: 'Test Headline',
  primaryText: 'Test text',
  description: 'Test desc',
  ctaText: 'Buy now',
  hashtags: ['#test'],
  hookType: 'emotion',
  reasoning: 'Because reasons',
}

const mockImagePrompt = {
  prompt: 'A professional photo',
  negativePrompt: 'No text',
  style: 'photographic',
  textOverlaySuggestion: 'Great deal',
  textPlacement: 'bottom',
}

const mockVideoScript = {
  variants: [
    { style: 'produced', hook: 'Hook', scenes: [], ctaScene: { visual: '', textOverlay: '', audio: '' }, musicSuggestion: '', productionNotes: '' },
    { style: 'ugc', hook: 'UGC Hook', scenes: [], ctaScene: { visual: '', textOverlay: '', audio: '' }, musicSuggestion: '', productionNotes: '' },
  ],
}

describe('generateParrilla', () => {
  let entryCounter: number

  beforeEach(() => {
    vi.clearAllMocks()
    entryCounter = 0

    // MOCK: generators
    ;(generateStrategy as Mock).mockResolvedValue(mockStrategy)
    ;(generateCopy as Mock).mockResolvedValue(mockCopy)
    ;(generateImagePrompt as Mock).mockResolvedValue(mockImagePrompt)
    ;(generateVideoScript as Mock).mockResolvedValue(mockVideoScript)

    // MOCK: Prisma
    vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount as any)
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1' } as any)
    vi.mocked(prisma.parrilla.create).mockResolvedValue({ id: 'parrilla-1' } as any)
    vi.mocked(prisma.parrillaEntry.create).mockImplementation(async () => {
      entryCounter++
      return { id: `entry-${entryCounter}` } as any
    })

    // MOCK: Anthropic para la planificación directa de entries
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(mockEntryPlans) }],
      usage: { input_tokens: 100, output_tokens: 200 },
    })
  })

  it('debe orquestar la generación completa de una parrilla', async () => {
    const result = await generateParrilla(mockInput)

    expect(result).toEqual({
      parrillaId: 'parrilla-1',
      strategy: mockStrategy,
      entriesCreated: 3,
      totalPlanned: 3,
    })

    // generateStrategy llamado 1 vez
    expect(generateStrategy).toHaveBeenCalledTimes(1)
    expect(generateStrategy).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: 'acc-1' })
    )

    // generateCopy llamado 3 veces (una por entry)
    expect(generateCopy).toHaveBeenCalledTimes(3)

    // generateImagePrompt llamado 2 veces (solo STATIC_IMAGE, no VIDEO_SHORT)
    expect(generateImagePrompt).toHaveBeenCalledTimes(2)

    // generateVideoScript llamado 1 vez (solo VIDEO_SHORT)
    expect(generateVideoScript).toHaveBeenCalledTimes(1)

    // Parrilla creada con nombre que contiene mes y año
    expect(prisma.parrilla.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: expect.stringContaining('Marzo 2025'),
      }),
    })

    // 3 entries creadas
    expect(prisma.parrillaEntry.create).toHaveBeenCalledTimes(3)
  })

  it('debe calcular el presupuesto por entrada correctamente', async () => {
    await generateParrilla(mockInput)

    const calls = vi.mocked(prisma.parrillaEntry.create).mock.calls
    for (const call of calls) {
      expect((call[0] as any).data.budget).toBe(10000) // 30000 / 3
    }
  })

  it('debe crear entries parciales si generateCopy falla para una entry', async () => {
    ;(generateCopy as Mock)
      .mockResolvedValueOnce(mockCopy)
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce(mockCopy)

    const result = await generateParrilla(mockInput)

    // Las 3 entries se crean (el error no detiene el loop)
    expect(prisma.parrillaEntry.create).toHaveBeenCalledTimes(3)
    expect(result.entriesCreated).toBe(3)

    // La segunda entry se crea con datos parciales (sin headline)
    const secondCall = vi.mocked(prisma.parrillaEntry.create).mock.calls[1]
    const secondEntryData = (secondCall[0] as any).data
    expect(secondEntryData.headline).toBeUndefined()
    expect(secondEntryData.primaryText).toBeUndefined()
    expect(secondEntryData.visualConcept).toBe('Behind the scenes')
  })

  it('debe continuar si generateImagePrompt falla (non-blocking)', async () => {
    ;(generateImagePrompt as Mock).mockRejectedValue(new Error('Image error'))

    const result = await generateParrilla(mockInput)

    // Entries se crean igual
    expect(prisma.parrillaEntry.create).toHaveBeenCalledTimes(3)
    expect(result.entriesCreated).toBe(3)

    // Las entries de imagen se crean con imagePrompt null
    const staticImageCalls = vi.mocked(prisma.parrillaEntry.create).mock.calls
      .filter((call) => {
        const data = (call[0] as any).data
        return data.contentType !== 'VIDEO_SHORT'
      })
    for (const call of staticImageCalls) {
      expect((call[0] as any).data.imagePrompt).toBeNull()
    }
  })

  it('debe lanzar error si la cuenta no existe', async () => {
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)

    // generateStrategy también lanza error cuando la cuenta no existe
    ;(generateStrategy as Mock).mockRejectedValue(new Error('Cuenta no encontrada'))

    await expect(generateParrilla(mockInput)).rejects.toThrow('Cuenta no encontrada')

    // generateStrategy se llama antes del findUnique del orchestrator
    // pero el orchestrator depende de la strategy, así que el error burbujea
  })

  it('debe pasar isPaid a las entries', async () => {
    const paidInput = { ...mockInput, isPaid: true }
    await generateParrilla(paidInput)

    const calls = vi.mocked(prisma.parrillaEntry.create).mock.calls
    for (const call of calls) {
      expect((call[0] as any).data.isPaid).toBe(true)
    }
  })

  it('debe manejar budget undefined (sin presupuesto)', async () => {
    const noBudgetInput = { ...mockInput, budget: undefined }
    await generateParrilla(noBudgetInput)

    const calls = vi.mocked(prisma.parrillaEntry.create).mock.calls
    for (const call of calls) {
      expect((call[0] as any).data.budget).toBeNull()
    }
  })

  it('debe normalizar contentType y platform del plan AI', async () => {
    const rawPlans = [
      {
        publishDate: '2025-03-05',
        platform: 'INSTAGRAM',
        contentType: 'VIDEO',
        objective: 'awareness',
        concept: 'Test',
        hookType: 'emotion',
      },
    ]
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(rawPlans) }],
      usage: { input_tokens: 100, output_tokens: 200 },
    })

    await generateParrilla(mockInput)

    const call = vi.mocked(prisma.parrillaEntry.create).mock.calls[0]
    const data = (call[0] as any).data
    expect(data.platform).toBe('META_FEED')
    expect(data.contentType).toBe('VIDEO_SHORT')
  })
})

describe('normalizeContentType', () => {
  it('maps VIDEO to VIDEO_SHORT', () => {
    expect(normalizeContentType('VIDEO')).toBe('VIDEO_SHORT')
  })

  it('maps IMAGE to STATIC_IMAGE', () => {
    expect(normalizeContentType('IMAGE')).toBe('STATIC_IMAGE')
  })

  it('maps STATIC to STATIC_IMAGE', () => {
    expect(normalizeContentType('STATIC')).toBe('STATIC_IMAGE')
  })

  it('maps REEL to VIDEO_SHORT', () => {
    expect(normalizeContentType('REEL')).toBe('VIDEO_SHORT')
  })

  it('maps STORIES to STORY', () => {
    expect(normalizeContentType('STORIES')).toBe('STORY')
  })

  it('is case-insensitive', () => {
    expect(normalizeContentType('video')).toBe('VIDEO_SHORT')
    expect(normalizeContentType('Image')).toBe('STATIC_IMAGE')
  })

  it('passes through valid enum values unchanged', () => {
    expect(normalizeContentType('STATIC_IMAGE')).toBe('STATIC_IMAGE')
    expect(normalizeContentType('VIDEO_SHORT')).toBe('VIDEO_SHORT')
    expect(normalizeContentType('VIDEO_LONG')).toBe('VIDEO_LONG')
    expect(normalizeContentType('CAROUSEL')).toBe('CAROUSEL')
  })
})

describe('normalizePlatform', () => {
  it('maps META to META_FEED', () => {
    expect(normalizePlatform('META')).toBe('META_FEED')
  })

  it('maps FACEBOOK to META_FEED', () => {
    expect(normalizePlatform('FACEBOOK')).toBe('META_FEED')
  })

  it('maps INSTAGRAM to META_FEED', () => {
    expect(normalizePlatform('INSTAGRAM')).toBe('META_FEED')
  })

  it('maps INSTAGRAM_REELS to META_REELS', () => {
    expect(normalizePlatform('INSTAGRAM_REELS')).toBe('META_REELS')
  })

  it('maps INSTAGRAM_STORIES to META_STORIES', () => {
    expect(normalizePlatform('INSTAGRAM_STORIES')).toBe('META_STORIES')
  })

  it('maps GOOGLE to GOOGLE_SEARCH', () => {
    expect(normalizePlatform('GOOGLE')).toBe('GOOGLE_SEARCH')
  })

  it('maps YOUTUBE to GOOGLE_YOUTUBE', () => {
    expect(normalizePlatform('YOUTUBE')).toBe('GOOGLE_YOUTUBE')
  })

  it('is case-insensitive', () => {
    expect(normalizePlatform('facebook')).toBe('META_FEED')
    expect(normalizePlatform('Instagram')).toBe('META_FEED')
  })

  it('passes through valid enum values unchanged', () => {
    expect(normalizePlatform('META_FEED')).toBe('META_FEED')
    expect(normalizePlatform('META_REELS')).toBe('META_REELS')
    expect(normalizePlatform('TIKTOK')).toBe('TIKTOK')
    expect(normalizePlatform('LINKEDIN')).toBe('LINKEDIN')
  })
})
