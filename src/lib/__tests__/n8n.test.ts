import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

import { triggerN8nWebhook } from '../n8n'

describe('triggerN8nWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna éxito con datos cuando el webhook responde ok', async () => {
    // MOCK: fetch retorna respuesta exitosa con JSON
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ result: 'ok' }), { status: 200 })
    )

    const result = await triggerN8nWebhook('test-hook', { key: 'value' })

    expect(result).toEqual({ success: true, data: { result: 'ok' } })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5678/webhook/test-hook',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
      }
    )
  })

  it('retorna error cuando el webhook responde con HTTP error', async () => {
    // MOCK: fetch retorna respuesta con status 500
    fetchMock.mockResolvedValue(
      new Response('', { status: 500, statusText: 'Internal Server Error' })
    )

    const result = await triggerN8nWebhook('failing-hook', { data: 1 })

    expect(result).toEqual({
      success: false,
      error: 'n8n webhook failed: Internal Server Error',
    })
  })

  it('retorna error de conexión cuando fetch lanza excepción', async () => {
    // MOCK: fetch lanza error de red
    fetchMock.mockRejectedValue(new Error('Network error'))

    const result = await triggerN8nWebhook('unreachable', {})

    expect(result).toEqual({
      success: false,
      error: 'Failed to connect to n8n',
    })
  })

  it('usa N8N_WEBHOOK_BASE_URL custom cuando está seteada', async () => {
    // MOCK: reimportar módulo con env var diferente para que lea la nueva URL
    vi.resetModules()
    process.env.N8N_WEBHOOK_BASE_URL = 'https://n8n.example.com'

    const freshFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    vi.stubGlobal('fetch', freshFetch)

    const { triggerN8nWebhook: freshTrigger } = await import('@/lib/n8n')
    await freshTrigger('custom-hook', { x: 1 })

    expect(freshFetch).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook/custom-hook',
      expect.objectContaining({ method: 'POST' })
    )

    delete process.env.N8N_WEBHOOK_BASE_URL
  })
})
