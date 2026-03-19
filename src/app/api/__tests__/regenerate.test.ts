import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthSuccess, mockAuthNone, createMockRequest, parseResponse } from './helpers'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db')

// Mock Anthropic SDK to prevent browser-check error
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: vi.fn() } }
  }),
}))

vi.mock('@/lib/ai/copy-generator')
vi.mock('@/lib/ai/image-prompt-generator')
vi.mock('@/lib/ai/video-script-generator')

import prisma from '@/lib/db'
import { generateCopy } from '@/lib/ai/copy-generator'
import { generateImagePrompt } from '@/lib/ai/image-prompt-generator'
import { generateVideoScript } from '@/lib/ai/video-script-generator'
import { POST } from '../parrillas/[id]/entries/[entryId]/regenerate/route'

const mockPrisma = vi.mocked(prisma, true)
const mockGenerateCopy = vi.mocked(generateCopy)
const mockGenerateImagePrompt = vi.mocked(generateImagePrompt)
const mockGenerateVideoScript = vi.mocked(generateVideoScript)

function paramsPromise(id: string, entryId: string) {
  return { params: Promise.resolve({ id, entryId }) }
}

const mockEntry = {
  id: 'entry-1',
  parrillaId: 'parrilla-1',
  platform: 'META_FEED',
  contentType: 'STATIC_IMAGE',
  objective: 'awareness',
  visualConcept: 'Promo verano',
  hookType: 'question',
  funnelStage: 'TOFU',
  parrilla: {
    id: 'parrilla-1',
    aiStrategy: { creative_concept: 'Test' },
    account: { id: 'account-1', brandName: 'TestBrand' },
  },
}

const mockVideoEntry = {
  ...mockEntry,
  id: 'entry-2',
  contentType: 'VIDEO_SHORT',
}

const mockCopyResult = {
  headline: 'Nuevo headline',
  primaryText: 'Nuevo texto',
  description: 'Nueva desc',
  ctaText: 'Click aqui',
  hashtags: ['#test'],
  hookType: 'emotion',
  reasoning: 'Razon de prueba',
}

const mockImageResult = {
  prompt: 'New image prompt',
  negativePrompt: 'nothing',
  style: 'photographic',
  textOverlaySuggestion: 'Texto',
  textPlacement: 'center',
}

const mockVideoResult = {
  variants: [{ style: 'produced', hook: 'Hook', scenes: [], ctaScene: { visual: '', textOverlay: '', audio: '' }, musicSuggestion: '', productionNotes: '' }],
}

describe('API /api/parrillas/[id]/entries/[entryId]/regenerate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateCopy.mockResolvedValue(mockCopyResult)
    mockGenerateImagePrompt.mockResolvedValue(mockImageResult)
    mockGenerateVideoScript.mockResolvedValue(mockVideoResult as any)
  })

  it('retorna 401 sin autenticacion', async () => {
    mockAuthNone()
    const req = createMockRequest('POST', { what: 'copy' })
    const res = await POST(req as any, paramsPromise('parrilla-1', 'entry-1') as any)
    expect(res.status).toBe(401)
  })

  it('retorna 403 sin permiso parrillas:edit', async () => {
    mockAuthSuccess('DESIGNER')
    const req = createMockRequest('POST', { what: 'copy' })
    const res = await POST(req as any, paramsPromise('parrilla-1', 'entry-1') as any)
    expect(res.status).toBe(403)
  })

  it('retorna 404 cuando entry no existe', async () => {
    mockAuthSuccess('MANAGER')
    mockPrisma.parrillaEntry.findUnique.mockResolvedValue(null)

    const req = createMockRequest('POST', { what: 'copy' })
    const res = await POST(req as any, paramsPromise('parrilla-1', 'nonexistent') as any)
    expect(res.status).toBe(404)
  })

  it('retorna 400 cuando entry no pertenece a la parrilla', async () => {
    mockAuthSuccess('MANAGER')
    mockPrisma.parrillaEntry.findUnique.mockResolvedValue({
      ...mockEntry,
      parrillaId: 'other-parrilla',
    } as any)

    const req = createMockRequest('POST', { what: 'copy' })
    const res = await POST(req as any, paramsPromise('parrilla-1', 'entry-1') as any)
    expect(res.status).toBe(400)
  })

  it('regenera solo copy — llama generateCopy, NO imagePrompt ni videoScript', async () => {
    mockAuthSuccess('MANAGER')
    mockPrisma.parrillaEntry.findUnique.mockResolvedValue(mockEntry as any)
    mockPrisma.parrillaEntry.update.mockResolvedValue({ ...mockEntry, ...mockCopyResult } as any)

    const req = createMockRequest('POST', { what: 'copy' })
    const res = await POST(req as any, paramsPromise('parrilla-1', 'entry-1') as any)
    const { status } = await parseResponse(res)

    expect(status).toBe(200)
    expect(mockGenerateCopy).toHaveBeenCalledTimes(1)
    expect(mockGenerateImagePrompt).not.toHaveBeenCalled()
    expect(mockGenerateVideoScript).not.toHaveBeenCalled()
  })

  it('regenera solo imagePrompt — llama generateImagePrompt, NO copy ni videoScript', async () => {
    mockAuthSuccess('MANAGER')
    mockPrisma.parrillaEntry.findUnique.mockResolvedValue(mockEntry as any)
    mockPrisma.parrillaEntry.update.mockResolvedValue({ ...mockEntry, imagePrompt: mockImageResult.prompt } as any)

    const req = createMockRequest('POST', { what: 'imagePrompt' })
    const res = await POST(req as any, paramsPromise('parrilla-1', 'entry-1') as any)
    const { status } = await parseResponse(res)

    expect(status).toBe(200)
    expect(mockGenerateCopy).not.toHaveBeenCalled()
    expect(mockGenerateImagePrompt).toHaveBeenCalledTimes(1)
    expect(mockGenerateVideoScript).not.toHaveBeenCalled()
  })

  it('regenera all para STATIC_IMAGE — llama copy + imagePrompt, NO videoScript', async () => {
    mockAuthSuccess('MANAGER')
    mockPrisma.parrillaEntry.findUnique.mockResolvedValue(mockEntry as any)
    mockPrisma.parrillaEntry.update.mockResolvedValue({ ...mockEntry } as any)

    const req = createMockRequest('POST', { what: 'all' })
    const res = await POST(req as any, paramsPromise('parrilla-1', 'entry-1') as any)
    const { status } = await parseResponse(res)

    expect(status).toBe(200)
    expect(mockGenerateCopy).toHaveBeenCalledTimes(1)
    expect(mockGenerateImagePrompt).toHaveBeenCalledTimes(1)
    expect(mockGenerateVideoScript).not.toHaveBeenCalled()
  })

  it('regenera all para VIDEO_SHORT — llama copy + videoScript, NO imagePrompt', async () => {
    mockAuthSuccess('MANAGER')
    mockPrisma.parrillaEntry.findUnique.mockResolvedValue(mockVideoEntry as any)
    mockPrisma.parrillaEntry.update.mockResolvedValue({ ...mockVideoEntry } as any)

    const req = createMockRequest('POST', { what: 'all' })
    const res = await POST(req as any, paramsPromise('parrilla-1', 'entry-2') as any)
    const { status } = await parseResponse(res)

    expect(status).toBe(200)
    expect(mockGenerateCopy).toHaveBeenCalledTimes(1)
    expect(mockGenerateImagePrompt).not.toHaveBeenCalled()
    expect(mockGenerateVideoScript).toHaveBeenCalledTimes(1)
  })

  it('pasa instrucciones adicionales al generar copy', async () => {
    mockAuthSuccess('MANAGER')
    mockPrisma.parrillaEntry.findUnique.mockResolvedValue(mockEntry as any)
    mockPrisma.parrillaEntry.update.mockResolvedValue({ ...mockEntry } as any)

    const req = createMockRequest('POST', { what: 'copy', instructions: 'Usa humor' })
    await POST(req as any, paramsPromise('parrilla-1', 'entry-1') as any)

    expect(mockGenerateCopy).toHaveBeenCalledWith(
      expect.objectContaining({
        concept: expect.stringContaining('Usa humor'),
      })
    )
  })
})
