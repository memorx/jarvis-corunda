import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthSuccess, mockAuthNone, createMockRequest, parseResponse } from './helpers'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db')

import prisma from '@/lib/db'
import { GET, POST } from '../accounts/route'

const mockPrisma = vi.mocked(prisma, true)

describe('API /api/accounts', () => {
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

    it('returns 403 when role has no accounts:read', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('GET')
      const res = await GET(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 200 with all accounts for MANAGER', async () => {
      mockAuthSuccess('MANAGER')
      const accounts = [{ id: 'a1', name: 'Acme' }]
      mockPrisma.account.findMany.mockResolvedValue(accounts as any)

      const req = createMockRequest('GET')
      const res = await GET(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data).toEqual(accounts)
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } })
      )
    })

    it('returns 403 for CLIENT (no accounts:read)', async () => {
      mockAuthSuccess('CLIENT', 'client-1')
      const req = createMockRequest('GET')
      const res = await GET(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 200 with accounts for SUPERADMIN', async () => {
      mockAuthSuccess('SUPERADMIN')
      const accounts = [{ id: 'a1', name: 'Acme' }]
      mockPrisma.account.findMany.mockResolvedValue(accounts as any)

      const req = createMockRequest('GET')
      const res = await GET(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data).toEqual(accounts)
    })

    it('returns empty array when no accounts', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.account.findMany.mockResolvedValue([] as any)

      const req = createMockRequest('GET')
      const res = await GET(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data).toEqual([])
    })

    it('returns 500 on Prisma error', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.account.findMany.mockRejectedValue(new Error('DB down'))

      const req = createMockRequest('GET')
      const res = await GET(req as any)
      expect(res.status).toBe(500)
    })
  })

  // ─── POST ──────────────────────────────────────────
  describe('POST', () => {
    const validBody = {
      name: 'Test Account',
      brandName: 'Test Brand',
    }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for DESIGNER (no accounts:write)', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 400 on invalid body (missing required fields)', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { name: '' })
      const res = await POST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(400)
      expect(data.error).toBe('Datos inválidos')
    })

    it('returns 201 on success', async () => {
      mockAuthSuccess('MANAGER')
      const created = { id: 'acc-1', ...validBody }
      mockPrisma.account.create.mockResolvedValue(created as any)

      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(201)
      expect(data.id).toBe('acc-1')
    })

    it('returns 500 on Prisma error', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.account.create.mockRejectedValue(new Error('DB error'))

      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      expect(res.status).toBe(500)
    })
  })
})
