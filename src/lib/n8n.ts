const N8N_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678'

export async function triggerN8nWebhook(
  webhookPath: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/webhook/${webhookPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      return { success: false, error: `n8n webhook failed: ${response.statusText}` }
    }

    const result = await response.json()
    return { success: true, data: result }
  } catch (error) {
    console.error('n8n webhook error:', error)
    return { success: false, error: 'Failed to connect to n8n' }
  }
}
