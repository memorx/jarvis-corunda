import { describe, it, expect, vi, beforeEach } from 'vitest'

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }))
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: createMock } }
  }),
}))

vi.mock('@/lib/db')

import prisma from '@/lib/db'
import { analyzeMetrics } from '../metrics-analyzer'

const mockPrisma = vi.mocked(prisma, true)

describe('analyzeMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sin metricas retorna respuesta default sin llamar a Anthropic', async () => {
    mockPrisma.campaignMetrics.findMany.mockResolvedValue([])

    const result = await analyzeMetrics({ days: 30 })

    expect(result.summary).toContain('No hay metricas')
    expect(result.topPerformers).toEqual([])
    expect(result.concerns).toEqual([])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(createMock).not.toHaveBeenCalled()
  })

  it('con metricas parsea respuesta correctamente y crea AI log', async () => {
    const mockMetrics = [
      {
        id: 'm1',
        campaignId: 'c1',
        date: new Date(),
        impressions: 10000,
        clicks: 200,
        spend: 500,
        conversions: 10,
        leads: 5,
        reach: 8000,
        campaign: {
          name: 'Test Campaign',
          platform: 'META_FEED',
          objective: 'CONVERSIONS',
          dailyBudget: 50,
          totalBudget: 1500,
        },
      },
    ]

    mockPrisma.campaignMetrics.findMany.mockResolvedValue(mockMetrics as any)

    const insightsResponse = {
      summary: 'Las campanas van bien',
      topPerformers: ['Campaign A tiene buen CTR'],
      concerns: ['CPM alto en TikTok'],
      recommendations: ['Aumentar budget en Meta'],
      budgetAdvice: 'Redistribuir 20% de TikTok a Meta',
      nextSteps: ['Revisar creativos'],
    }

    createMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(insightsResponse) }],
      usage: { input_tokens: 500, output_tokens: 200 },
    })

    mockPrisma.aIGenerationLog.create.mockResolvedValue({} as any)

    const result = await analyzeMetrics({ days: 30 })

    expect(result.summary).toBe('Las campanas van bien')
    expect(result.topPerformers).toEqual(['Campaign A tiene buen CTR'])
    expect(result.concerns).toEqual(['CPM alto en TikTok'])
    expect(result.recommendations).toEqual(['Aumentar budget en Meta'])
    expect(mockPrisma.aIGenerationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          promptType: 'metrics_analysis',
          success: true,
        }),
      })
    )
  })

  it('el prompt contiene regla de TOFU alimenta al BOFU', async () => {
    const mockMetrics = [
      {
        id: 'm1',
        campaignId: 'c1',
        date: new Date(),
        impressions: 5000,
        clicks: 100,
        spend: 200,
        conversions: 5,
        leads: 3,
        reach: 4000,
        campaign: {
          name: 'Campaign Check',
          platform: 'META_FEED',
          objective: 'CONVERSIONS',
          dailyBudget: 20,
          totalBudget: 600,
        },
      },
    ]

    mockPrisma.campaignMetrics.findMany.mockResolvedValue(mockMetrics as any)

    const insightsResponse = {
      summary: 'OK',
      topPerformers: [],
      concerns: [],
      recommendations: [],
      budgetAdvice: 'OK',
      nextSteps: [],
    }

    createMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(insightsResponse) }],
      usage: { input_tokens: 300, output_tokens: 100 },
    })
    mockPrisma.aIGenerationLog.create.mockResolvedValue({} as any)

    await analyzeMetrics({ days: 30 })

    const promptArg = createMock.mock.calls[0][0].messages[0].content
    expect(promptArg).toContain('TOFU alimenta al BOFU')
    expect(promptArg).toContain('frecuencia')
  })

  it('error de API lanza error', async () => {
    const mockMetrics = [
      {
        id: 'm1',
        campaignId: 'c1',
        date: new Date(),
        impressions: 1000,
        clicks: 50,
        spend: 100,
        conversions: 2,
        leads: 1,
        reach: 800,
        campaign: {
          name: 'Failing Campaign',
          platform: 'META_FEED',
          objective: 'AWARENESS',
          dailyBudget: 10,
          totalBudget: 300,
        },
      },
    ]

    mockPrisma.campaignMetrics.findMany.mockResolvedValue(mockMetrics as any)
    createMock.mockRejectedValue(new Error('API Error'))

    await expect(analyzeMetrics({ days: 30 })).rejects.toThrow('API Error')
  })
})
