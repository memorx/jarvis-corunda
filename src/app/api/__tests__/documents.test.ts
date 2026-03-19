import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthSuccess, mockAuthNone, createMockRequest, parseResponse } from './helpers'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db')
vi.mock('@/lib/ai/document-summarizer', () => ({
  generateDocumentSummary: vi.fn().mockResolvedValue('Resumen generado'),
}))

import prisma from '@/lib/db'
import { GET, POST } from '../accounts/[id]/documents/route'
import { GET as GET_DOC, PUT, DELETE } from '../accounts/[id]/documents/[docId]/route'

const mockPrisma = vi.mocked(prisma, true)

const mockParams = (id: string) => ({ params: Promise.resolve({ id }) })
const mockDocParams = (id: string, docId: string) => ({ params: Promise.resolve({ id, docId }) })

describe('API /api/accounts/[id]/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET - listar documentos', () => {
    it('retorna 401 sin autenticacion', async () => {
      mockAuthNone()
      const req = createMockRequest('GET')
      const res = await GET(req as any, mockParams('acc-1') as any)
      expect(res.status).toBe(401)
    })

    it('retorna 403 para DESIGNER (sin accounts:read)', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('GET')
      const res = await GET(req as any, mockParams('acc-1') as any)
      expect(res.status).toBe(403)
    })

    it('retorna 200 con lista de documentos', async () => {
      mockAuthSuccess('MANAGER')
      const docs = [{ id: 'doc-1', title: 'Kickoff', type: 'kickoff', charCount: 1000, isActive: true }]
      mockPrisma.accountDocument.findMany.mockResolvedValue(docs as any)

      const req = createMockRequest('GET')
      const res = await GET(req as any, mockParams('acc-1') as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data).toEqual(docs)
    })
  })

  describe('POST - crear documento', () => {
    const validBody = { title: 'Kickoff Test', type: 'kickoff', content: 'Contenido del documento' }

    it('retorna 401 sin autenticacion', async () => {
      mockAuthNone()
      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any, mockParams('acc-1') as any)
      expect(res.status).toBe(401)
    })

    it('retorna 403 para DESIGNER (sin accounts:write)', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any, mockParams('acc-1') as any)
      expect(res.status).toBe(403)
    })

    it('retorna 400 sin titulo', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { type: 'kickoff', content: 'test' })
      const res = await POST(req as any, mockParams('acc-1') as any)
      expect(res.status).toBe(400)
    })

    it('retorna 400 sin contenido', async () => {
      mockAuthSuccess('MANAGER')
      const req = createMockRequest('POST', { title: 'Test', type: 'kickoff' })
      const res = await POST(req as any, mockParams('acc-1') as any)
      expect(res.status).toBe(400)
    })

    it('retorna 201 al crear documento valido', async () => {
      mockAuthSuccess('MANAGER')
      const created = { id: 'doc-1', ...validBody, charCount: validBody.content.length }
      mockPrisma.accountDocument.create.mockResolvedValue(created as any)

      const req = createMockRequest('POST', validBody)
      const res = await POST(req as any, mockParams('acc-1') as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(201)
      expect(data.id).toBe('doc-1')
    })
  })

  describe('GET /[docId] - obtener documento', () => {
    it('retorna 404 cuando no existe', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.accountDocument.findUnique.mockResolvedValue(null)

      const req = createMockRequest('GET')
      const res = await GET_DOC(req as any, mockDocParams('acc-1', 'doc-999') as any)
      expect(res.status).toBe(404)
    })

    it('retorna 200 con documento completo', async () => {
      mockAuthSuccess('MANAGER')
      const doc = { id: 'doc-1', title: 'Test', content: 'Full content', type: 'kickoff' }
      mockPrisma.accountDocument.findUnique.mockResolvedValue(doc as any)

      const req = createMockRequest('GET')
      const res = await GET_DOC(req as any, mockDocParams('acc-1', 'doc-1') as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.content).toBe('Full content')
    })
  })

  describe('PUT /[docId] - actualizar documento', () => {
    it('retorna 403 para DESIGNER', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('PUT', { title: 'Updated' })
      const res = await PUT(req as any, mockDocParams('acc-1', 'doc-1') as any)
      expect(res.status).toBe(403)
    })

    it('retorna 200 al actualizar', async () => {
      mockAuthSuccess('MANAGER')
      const updated = { id: 'doc-1', title: 'Updated', isActive: true }
      mockPrisma.accountDocument.update.mockResolvedValue(updated as any)

      const req = createMockRequest('PUT', { title: 'Updated' })
      const res = await PUT(req as any, mockDocParams('acc-1', 'doc-1') as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.title).toBe('Updated')
    })
  })

  describe('DELETE /[docId] - eliminar documento', () => {
    it('retorna 403 para DESIGNER', async () => {
      mockAuthSuccess('DESIGNER')
      const req = createMockRequest('DELETE')
      const res = await DELETE(req as any, mockDocParams('acc-1', 'doc-1') as any)
      expect(res.status).toBe(403)
    })

    it('retorna 200 al eliminar', async () => {
      mockAuthSuccess('MANAGER')
      mockPrisma.accountDocument.delete.mockResolvedValue({} as any)

      const req = createMockRequest('DELETE')
      const res = await DELETE(req as any, mockDocParams('acc-1', 'doc-1') as any)
      const { status, data } = await parseResponse(res)

      expect(status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
