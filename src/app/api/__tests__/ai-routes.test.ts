import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthSuccess, mockAuthNone, createMockRequest, parseResponse } from './helpers'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db')
vi.mock('@/lib/ai/strategy-generator', () => ({
  generateStrategy: vi.fn().mockResolvedValue({ strategy: 'mock strategy' }),
}))
vi.mock('@/lib/ai/copy-generator', () => ({
  generateCopy: vi.fn().mockResolvedValue({ copies: ['mock copy'] }),
}))
vi.mock('@/lib/ai/image-prompt-generator', () => ({
  generateImagePrompt: vi.fn().mockResolvedValue({ prompt: 'mock prompt' }),
}))
vi.mock('@/lib/ai/video-script-generator', () => ({
  generateVideoScript: vi.fn().mockResolvedValue({ script: 'mock script' }),
}))
vi.mock('@/lib/ai/parrilla-generator', () => ({
  generateParrilla: vi.fn().mockResolvedValue({ parrilla: 'mock parrilla' }),
}))

import { POST as StrategyPOST } from '../ai/generate-strategy/route'
import { POST as CopiesPOST } from '../ai/generate-copies/route'
import { POST as ImagePromptPOST } from '../ai/generate-image-prompts/route'
import { POST as VideoScriptPOST } from '../ai/generate-video-scripts/route'
import { POST as ParrillaPOST } from '../ai/generate-parrilla/route'

describe('API AI Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── generate-strategy ─────────────────────────────
  describe('POST /api/ai/generate-strategy', () => {
    const validBody = {
      accountId: 'acc-1',
      month: 3,
      year: 2026,
      objectives: 'Increase brand awareness',
    }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await StrategyPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for DESIGNER (no playground:use)', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('POST', validBody)
      const res = await StrategyPOST(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 403 for CLIENT (no playground:use)', async () => {
      mockAuthSuccess('CLIENT')
      const req = createMockRequest('POST', validBody)
      const res = await StrategyPOST(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 400 on invalid body', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { accountId: '' })
      const res = await StrategyPOST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 200 on success', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', validBody)
      const res = await StrategyPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.strategy).toBe('mock strategy')
    })
  })

  // ─── generate-copies ───────────────────────────────
  describe('POST /api/ai/generate-copies', () => {
    const validBody = {
      accountId: 'acc-1',
      platform: 'META_FEED',
      contentType: 'STATIC_IMAGE',
      objective: 'AWARENESS',
      concept: 'Product launch promo',
    }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await CopiesPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for CLIENT', async () => {
      mockAuthSuccess('CLIENT')
      const req = createMockRequest('POST', validBody)
      const res = await CopiesPOST(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 400 on invalid body', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { accountId: '' })
      const res = await CopiesPOST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 200 on success', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', validBody)
      const res = await CopiesPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.copies).toEqual(['mock copy'])
    })
  })

  // ─── generate-image-prompts ────────────────────────
  describe('POST /api/ai/generate-image-prompts', () => {
    const validBody = {
      accountId: 'acc-1',
      visualConcept: 'Modern minimalist ad',
      platform: 'META_FEED',
      aspectRatio: '1:1',
    }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await ImagePromptPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 400 on invalid body', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { accountId: '' })
      const res = await ImagePromptPOST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 200 on success', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', validBody)
      const res = await ImagePromptPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.prompt).toBe('mock prompt')
    })
  })

  // ─── generate-video-scripts ────────────────────────
  describe('POST /api/ai/generate-video-scripts', () => {
    const validBody = {
      accountId: 'acc-1',
      concept: 'Product showcase',
      platform: 'META_REELS',
      objective: 'ENGAGEMENT',
    }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await VideoScriptPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 400 on invalid body', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { concept: '' })
      const res = await VideoScriptPOST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 200 on success', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', validBody)
      const res = await VideoScriptPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.script).toBe('mock script')
    })
  })

  // ─── generate-parrilla ─────────────────────────────
  describe('POST /api/ai/generate-parrilla', () => {
    const validBody = {
      accountId: 'acc-1',
      month: 3,
      year: 2026,
      objectives: 'Monthly content',
      platforms: ['META_FEED'],
      contentMix: { staticImages: 4, videos: 2, carousels: 1, stories: 3 },
    }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await ParrillaPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for TRAFFIC (no parrillas:create)', async () => {
      mockAuthSuccess('TRAFFIC')
      const req = createMockRequest('POST', validBody)
      const res = await ParrillaPOST(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 400 on invalid body (missing platforms)', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { accountId: 'acc-1', month: 3, year: 2026, objectives: 'test', platforms: [] })
      const res = await ParrillaPOST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 200 on success', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', validBody)
      const res = await ParrillaPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.parrilla).toBe('mock parrilla')
    })
  })
})
