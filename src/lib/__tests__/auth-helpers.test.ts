import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { requireAuth, requireApiKey } from '../auth-helpers'
import { auth } from '@/lib/auth'

const mockAuth = vi.mocked(auth)

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 401 cuando no hay sesión', async () => {
    mockAuth.mockResolvedValue(null as any)

    const result = await requireAuth()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
      const body = await result.response.json()
      expect(body.error).toBe('No autorizado')
    }
  })

  it('retorna 403 cuando el rol no tiene el permiso', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', role: 'DESIGNER' },
    } as any)

    const result = await requireAuth('playground:use')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(403)
      const body = await result.response.json()
      expect(body.error).toBe('Sin permisos')
      expect(body.required).toBe('playground:use')
      expect(body.role).toBe('DESIGNER')
    }
  })

  it('retorna success cuando el rol tiene el permiso', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', role: 'MANAGER' },
    } as any)

    const result = await requireAuth('accounts:read')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.userId).toBe('u1')
      expect(result.role).toBe('MANAGER')
    }
  })

  it('retorna success sin permiso específico (solo auth)', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'u1', role: 'CLIENT' },
    } as any)

    const result = await requireAuth()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.userId).toBe('u1')
      expect(result.role).toBe('CLIENT')
    }
  })
})

describe('requireApiKey', () => {
  const originalEnv = process.env.N8N_API_SECRET

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.N8N_API_SECRET
    } else {
      process.env.N8N_API_SECRET = originalEnv
    }
  })

  it('permite en dev mode cuando N8N_API_SECRET no está seteado', () => {
    delete process.env.N8N_API_SECRET
    const request = new Request('http://localhost:3000/api/n8n/test')

    const result = requireApiKey(request)
    expect(result.success).toBe(true)
  })

  it('permite con API key correcta', () => {
    process.env.N8N_API_SECRET = 'test-secret'
    const request = new Request('http://localhost:3000/api/n8n/test', {
      headers: { 'x-api-key': 'test-secret' },
    })

    const result = requireApiKey(request)
    expect(result.success).toBe(true)
  })

  it('retorna 401 con API key incorrecta', async () => {
    process.env.N8N_API_SECRET = 'test-secret'
    const request = new Request('http://localhost:3000/api/n8n/test', {
      headers: { 'x-api-key': 'wrong-key' },
    })

    const result = requireApiKey(request)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
      const body = await result.response.json()
      expect(body.error).toBe('API key inválida')
    }
  })

  it('retorna 401 sin header x-api-key', async () => {
    process.env.N8N_API_SECRET = 'test-secret'
    const request = new Request('http://localhost:3000/api/n8n/test')

    const result = requireApiKey(request)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(401)
    }
  })
})
