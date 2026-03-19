import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db')

import prisma from '@/lib/db'
import { buildAccountContext } from '../context-builder'

const mockPrisma = vi.mocked(prisma, true)

describe('buildAccountContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna string vacio cuando no hay documentos', async () => {
    mockPrisma.accountDocument.findMany.mockResolvedValue([])
    const result = await buildAccountContext('acc-1')
    expect(result).toBe('')
  })

  it('incluye contenido directo de documento corto (sin resumen)', async () => {
    mockPrisma.accountDocument.findMany.mockResolvedValue([
      { title: 'Kickoff Test', type: 'kickoff', content: 'Este es el contenido del kickoff', summary: null, charCount: 33 },
    ] as any)

    const result = await buildAccountContext('acc-1')
    expect(result).toContain('KNOWLEDGE BASE DEL CLIENTE')
    expect(result).toContain('Kickoff Test')
    expect(result).toContain('Este es el contenido del kickoff')
  })

  it('usa resumen en vez de contenido cuando existe', async () => {
    mockPrisma.accountDocument.findMany.mockResolvedValue([
      { title: 'Audit Doc', type: 'audit', content: 'Contenido muy largo...'.repeat(100), summary: 'Resumen compacto del audit', charCount: 2100 },
    ] as any)

    const result = await buildAccountContext('acc-1')
    expect(result).toContain('Resumen compacto del audit')
    expect(result).not.toContain('Contenido muy largo...')
  })

  it('respeta prioridad de tipos (kickoff primero)', async () => {
    mockPrisma.accountDocument.findMany.mockResolvedValue([
      { title: 'Research Doc', type: 'research', content: 'Research content', summary: null, charCount: 16 },
      { title: 'Kickoff Doc', type: 'kickoff', content: 'Kickoff content', summary: null, charCount: 15 },
      { title: 'Strategy Doc', type: 'strategy', content: 'Strategy content', summary: null, charCount: 16 },
    ] as any)

    const result = await buildAccountContext('acc-1')
    const kickoffPos = result.indexOf('Kickoff Doc')
    const strategyPos = result.indexOf('Strategy Doc')
    const researchPos = result.indexOf('Research Doc')

    expect(kickoffPos).toBeLessThan(strategyPos)
    expect(strategyPos).toBeLessThan(researchPos)
  })

  it('no excede MAX_TOTAL_CHARS (~8000) y trunca', async () => {
    const longContent = 'A'.repeat(5000)
    mockPrisma.accountDocument.findMany.mockResolvedValue([
      { title: 'Doc 1', type: 'kickoff', content: longContent, summary: null, charCount: 5000 },
      { title: 'Doc 2', type: 'audit', content: longContent, summary: null, charCount: 5000 },
      { title: 'Doc 3', type: 'strategy', content: longContent, summary: null, charCount: 5000 },
    ] as any)

    const result = await buildAccountContext('acc-1')
    // El header + contenido no deberia exceder ~8500 (8000 + overhead del header)
    expect(result.length).toBeLessThan(9000)
  })

  it('contiene header de KNOWLEDGE BASE DEL CLIENTE', async () => {
    mockPrisma.accountDocument.findMany.mockResolvedValue([
      { title: 'Test', type: 'other', content: 'Contenido', summary: null, charCount: 9 },
    ] as any)

    const result = await buildAccountContext('acc-1')
    expect(result).toContain('## KNOWLEDGE BASE DEL CLIENTE (documentos de contexto)')
  })

  it('usa labels correctos por tipo de documento', async () => {
    mockPrisma.accountDocument.findMany.mockResolvedValue([
      { title: 'Mi Kickoff', type: 'kickoff', content: 'contenido', summary: null, charCount: 9 },
    ] as any)

    const result = await buildAccountContext('acc-1')
    expect(result).toContain('kickoff: Mi Kickoff')
  })

  it('filtra solo documentos activos via query', async () => {
    mockPrisma.accountDocument.findMany.mockResolvedValue([])

    await buildAccountContext('acc-1')

    expect(mockPrisma.accountDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { accountId: 'acc-1', isActive: true },
      })
    )
  })
})
