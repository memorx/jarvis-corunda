import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMockRequest, parseResponse } from './helpers'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db')

import prisma from '@/lib/db'
import { POST as CampaignMetricsPOST } from '../n8n/campaign-metrics/route'
import { POST as PublishResultPOST } from '../n8n/publish-result/route'
import { POST as CampaignAlertPOST } from '../n8n/campaign-alert/route'

const mockPrisma = vi.mocked(prisma, true)

describe('API n8n Routes', () => {
  const originalSecret = process.env.N8N_API_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.N8N_API_SECRET = 'test-secret-key'
  })

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.N8N_API_SECRET
    } else {
      process.env.N8N_API_SECRET = originalSecret
    }
  })

  function apiKeyHeaders() {
    return { 'x-api-key': 'test-secret-key' }
  }

  // ─── campaign-metrics ──────────────────────────────
  describe('POST /api/n8n/campaign-metrics', () => {
    const validBody = {
      campaignId: 'camp-1',
      date: '2026-03-01',
      impressions: 1000,
      clicks: 50,
      spend: 25.5,
    }

    it('returns 401 with missing API key', async () => {
      const req = createMockRequest('POST', validBody)
      const res = await CampaignMetricsPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 401 with wrong API key', async () => {
      const req = createMockRequest('POST', validBody, {
        headers: { 'x-api-key': 'wrong-key' },
      })
      const res = await CampaignMetricsPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 400 on invalid body (missing campaignId)', async () => {
      const req = createMockRequest('POST', { date: '2026-03-01' }, {
        headers: apiKeyHeaders(),
      })
      const res = await CampaignMetricsPOST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 200 on success', async () => {
      const metricsResult = { id: 'met-1', campaignId: 'camp-1' }
      mockPrisma.campaignMetrics.upsert.mockResolvedValue(metricsResult as any)

      const req = createMockRequest('POST', validBody, {
        headers: apiKeyHeaders(),
      })
      const res = await CampaignMetricsPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.metricsId).toBe('met-1')
    })

    it('returns 500 on Prisma error', async () => {
      mockPrisma.campaignMetrics.upsert.mockRejectedValue(new Error('DB error'))

      const req = createMockRequest('POST', validBody, {
        headers: apiKeyHeaders(),
      })
      const res = await CampaignMetricsPOST(req as any)
      expect(res.status).toBe(500)
    })
  })

  // ─── publish-result ────────────────────────────────
  describe('POST /api/n8n/publish-result', () => {
    const validBody = {
      entryId: 'entry-1',
      platform: 'META_FEED',
      success: true,
    }

    it('returns 401 with missing API key', async () => {
      const req = createMockRequest('POST', validBody)
      const res = await PublishResultPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 400 on invalid body (missing entryId)', async () => {
      const req = createMockRequest('POST', { success: true }, {
        headers: apiKeyHeaders(),
      })
      const res = await PublishResultPOST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 200 and updates entry when success=true', async () => {
      mockPrisma.parrillaEntry.update.mockResolvedValue({} as any)

      const req = createMockRequest('POST', validBody, {
        headers: apiKeyHeaders(),
      })
      const res = await PublishResultPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.parrillaEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: { status: 'PUBLISHED' },
      })
    })

    it('returns 200 without updating entry when success=false', async () => {
      const req = createMockRequest('POST', { ...validBody, success: false }, {
        headers: apiKeyHeaders(),
      })
      const res = await PublishResultPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.parrillaEntry.update).not.toHaveBeenCalled()
    })
  })

  // ─── campaign-alert ────────────────────────────────
  describe('POST /api/n8n/campaign-alert', () => {
    const validBody = {
      campaignId: 'camp-1',
      alertType: 'BUDGET_EXCEEDED',
      message: 'Budget exceeded threshold',
      threshold: 100,
      currentValue: 120,
    }

    it('returns 401 with missing API key', async () => {
      const req = createMockRequest('POST', validBody)
      const res = await CampaignAlertPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 401 with wrong API key', async () => {
      const req = createMockRequest('POST', validBody, {
        headers: { 'x-api-key': 'wrong' },
      })
      const res = await CampaignAlertPOST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 200 on success', async () => {
      const req = createMockRequest('POST', validBody, {
        headers: apiKeyHeaders(),
      })
      const res = await CampaignAlertPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Alert received and logged')
    })

    it('returns 200 with minimal body (all fields optional)', async () => {
      const req = createMockRequest('POST', {}, {
        headers: apiKeyHeaders(),
      })
      const res = await CampaignAlertPOST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
