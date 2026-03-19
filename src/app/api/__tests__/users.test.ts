import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthSuccess, mockAuthNone, createMockRequest, parseResponse } from './helpers'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db')
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('$2a$12$hashed'),
  compare: vi.fn(),
}))

import prisma from '@/lib/db'
import { GET, POST } from '../users/route'

const mockPrisma = vi.mocked(prisma, true)

describe('API /api/users', () => {
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

    it('returns 403 for CLIENT (no team:read)', async () => {
      mockAuthSuccess('CLIENT')
      const req = createMockRequest('GET')
      const res = await GET(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 200 with users list', async () => {
      mockAuthSuccess('MANAGER')
      const users = [{ id: 'u1', email: 'a@b.com', name: 'User A' }]
      mockPrisma.user.findMany.mockResolvedValue(users as any)

      const req = createMockRequest('GET')
      const res = await GET(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data).toEqual(users)
    })

    it('returns 500 on Prisma error', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.user.findMany.mockRejectedValue(new Error('DB error'))

      const req = createMockRequest('GET')
      const res = await GET(req as any)
      expect(res.status).toBe(500)
    })
  })

  // ─── POST ──────────────────────────────────────────
  describe('POST', () => {
    const validBody = {
      email: 'new@test.com',
      name: 'New User',
      password: 'secure123',
      role: 'COMMUNITY',
    }

    it('returns 401 when unauthenticated', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      expect(res.status).toBe(401)
    })

    it('returns 403 for CLIENT (no team:write)', async () => {
      mockAuthSuccess('CLIENT')
      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      expect(res.status).toBe(403)
    })

    it('returns 400 on invalid body (bad email)', async () => {
      mockAuthSuccess('SUPERADMIN')
      const req = createMockRequest('POST', { ...validBody, email: 'not-email' })
      const res = await POST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 400 on invalid body (short password)', async () => {
      mockAuthSuccess('SUPERADMIN')
      const req = createMockRequest('POST', { ...validBody, password: '123' })
      const res = await POST(req as any)
      expect(res.status).toBe(400)
    })

    it('returns 201 on success', async () => {
      mockAuthSuccess('SUPERADMIN')
      const created = {
        id: 'u-new',
        email: validBody.email,
        name: validBody.name,
        role: 'COMMUNITY',
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      mockPrisma.user.create.mockResolvedValue(created as any)

      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(201)
      expect(data.id).toBe('u-new')
    })

    it('returns 409 on duplicate email (P2002)', async () => {
      mockAuthSuccess('SUPERADMIN')
      const prismaError = new Error('Unique constraint failed')
      ;(prismaError as any).code = 'P2002'
      mockPrisma.user.create.mockRejectedValue(prismaError)

      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(409)
      expect(data.error).toBe('El email ya está registrado')
    })
  })
})
