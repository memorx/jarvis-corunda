import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthSuccess, mockAuthNone, createMockRequest, parseResponse } from './helpers'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db')

import prisma from '@/lib/db'
import { GET, POST } from '../campaigns/route'

const mockPrisma = vi.mocked(prisma, true)

describe('API /api/campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── GET ───────────────────────────────────────────
  describe('GET', () => {
    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('GET')
      const res = await GET(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for DESIGNER (no campaigns:read)', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('GET')
      const res = await GET(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 200 with campaigns list', async () => {
      mockAuthSuccess('MANAGER')
      const campaigns = [{ id: 'c1', name: 'Camp A' }]
      mockPrisma.campaign.findMany.mockResolvedValue(campaigns as any)

      const req = createMockRequest('GET')
      const res = await GET(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data).toEqual(campaigns)
    })

    it('filters by accountId when provided', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.campaign.findMany.mockResolvedValue([] as any)

      const req = createMockRequest('GET', undefined, {
        searchParams: { accountId: 'acc-1' },
      })
      const res = await GET(req as any)
      expect(res.status).toBe(200)
      expect(mockPrisma.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { accountId: 'acc-1' },
        })
      )
    })

    it('returns 500 on Prisma error', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.campaign.findMany.mockRejectedValue(new Error('DB error'))

      const req = createMockRequest('GET')
      const res = await GET(req as any)
      expect(res.status).toBe(500)
    })
  })

  // ─── POST ──────────────────────────────────────────
  describe('POST', () => {
    const validBody = {
      accountId: 'acc-1',
      name: 'New Campaign',
      platform: 'META_FEED',
      objective: 'AWARENESS',
    }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for COMMUNITY (no campaigns:write)', async () => {
      mockAuthSuccess('COMMUNITY')
      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 400 on invalid body', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { name: '' })
      const res = await POST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.error).toBe('Datos inválidos')
    })

    it('returns 201 on success', async () => {
      mockAuthSuccess('MANAGER')
      const created = { id: 'camp-1', ...validBody }
      mockPrisma.campaign.create.mockResolvedValue(created as any)

      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(201)
      expect(data.id).toBe('camp-1')
    })

    it('returns 500 on Prisma error', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.campaign.create.mockRejectedValue(new Error('DB error'))

      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      expect(res.status).toBe(500)
    })
  })
})
