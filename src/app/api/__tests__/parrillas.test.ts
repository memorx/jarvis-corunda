import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthSuccess, mockAuthNone, createMockRequest, parseResponse } from './helpers'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db')

import prisma from '@/lib/db'
import { GET as ListGET } from '../parrillas/route'
import { GET as DetailGET, PUT, DELETE } from '../parrillas/[id]/route'

const mockPrisma = vi.mocked(prisma, true)

function paramsPromise(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('API /api/parrillas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── GET /parrillas ────────────────────────────────
  describe('GET /parrillas (list)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('GET')
      const res = await ListGET(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for role without parrillas:read', async () => {
      // All defined roles have parrillas:read. Use a non-existent role to test.
      mockAuthSuccess('UNKNOWN_ROLE' as any)
      const req = createMockRequest('GET')
      const res = await ListGET(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 200 with all parrillas for MANAGER', async () => {
      mockAuthSuccess('MANAGER')
      const parrillas = [{ id: 'p1', name: 'Grid A' }]
      mockPrisma.parrilla.findMany.mockResolvedValue(parrillas as any)

      const req = createMockRequest('GET')
      const res = await ListGET(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data).toEqual(parrillas)
    })

    it('filters by userId for CLIENT', async () => {
      mockAuthSuccess('CLIENT', 'client-1')
      mockPrisma.parrilla.findMany.mockResolvedValue([] as any)

      const req = createMockRequest('GET')
      const res = await ListGET(req as any)

      expect(res.status).toBe(200)
      expect(mockPrisma.parrilla.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            account: { users: { some: { userId: 'client-1' } } },
          }),
        })
      )
    })

    it('filters by accountId when provided', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.parrilla.findMany.mockResolvedValue([] as any)

      const req = createMockRequest('GET', undefined, {
        searchParams: { accountId: 'acc-1' },
      })
      const res = await ListGET(req as any)

      expect(res.status).toBe(200)
      expect(mockPrisma.parrilla.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ accountId: 'acc-1' }),
        })
      )
    })
  })

  // ─── GET /parrillas/[id] ──────────────────────────
  describe('GET /parrillas/[id]', () => {
    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('GET')
      const res = await DetailGET(req as any, paramsPromise('p1') as any)
      expect(res.status).toBe(401)
    })

    it('returns 200 when parrilla found', async () => {
      mockAuthSuccess('MANAGER')
      const parrilla = { id: 'p1', name: 'Grid' }
      mockPrisma.parrilla.findUnique.mockResolvedValue(parrilla as any)

      const req = createMockRequest('GET')
      const res = await DetailGET(req as any, paramsPromise('p1') as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.id).toBe('p1')
    })

    it('returns 404 when parrilla not found', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.parrilla.findUnique.mockResolvedValue(null as any)

      const req = createMockRequest('GET')
      const res = await DetailGET(req as any, paramsPromise('nonexistent') as any)
      expect(res.status).toBe(404)
    })
  })

  // ─── PUT /parrillas/[id] ──────────────────────────
  describe('PUT /parrillas/[id]', () => {
    const validBody = { name: 'Updated Name' }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('PUT', validBody)
      const res = await PUT(req as any, paramsPromise('p1') as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for DESIGNER (no parrillas:edit)', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('PUT', validBody)
      const res = await PUT(req as any, paramsPromise('p1') as any)
      expect(res.status).toBe(403)
    })

    it('returns 400 on invalid body', async () => {
      mockAuthSuccess('MANAGER')
      // name too long (>200 chars)
      const req = createMockRequest('PUT', { name: 'x'.repeat(201) })
      const res = await PUT(req as any, paramsPromise('p1') as any)
      expect(res.status).toBe(400)
    })

    it('returns 200 on success', async () => {
      mockAuthSuccess('MANAGER')
      const updated = { id: 'p1', name: 'Updated' }
      mockPrisma.parrilla.update.mockResolvedValue(updated as any)

      const req = createMockRequest('PUT', validBody)
      const res = await PUT(req as any, paramsPromise('p1') as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.name).toBe('Updated')
    })
  })

  // ─── DELETE /parrillas/[id] ────────────────────────
  describe('DELETE /parrillas/[id]', () => {
    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('DELETE')
      const res = await DELETE(req as any, paramsPromise('p1') as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for DESIGNER', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('DELETE')
      const res = await DELETE(req as any, paramsPromise('p1') as any)
      expect(res.status).toBe(403)
    })

    it('returns 200 on success', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.parrilla.delete.mockResolvedValue({} as any)

      const req = createMockRequest('DELETE')
      const res = await DELETE(req as any, paramsPromise('p1') as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('returns 500 on Prisma error (e.g. not found)', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.parrilla.delete.mockRejectedValue(new Error('Record not found'))

      const req = createMockRequest('DELETE')
      const res = await DELETE(req as any, paramsPromise('nonexistent') as any)
      expect(res.status).toBe(500)
    })
  })
})
