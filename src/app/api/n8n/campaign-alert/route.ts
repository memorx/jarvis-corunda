import { NextRequest, NextResponse } from 'next/server'
import { requireApiKey } from '@/lib/auth-helpers'
import { validateBody } from '@/lib/validate'
import { campaignAlertSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const keyCheck = requireApiKey(request)
  if (!keyCheck.success) return keyCheck.response

  try {
    const body = await request.json()
    const validation = validateBody(campaignAlertSchema, body)
    if (!validation.success) return validation.response
    const data = validation.data

    console.log('[n8n Alert]', {
      campaignId: data.campaignId,
      alertType: data.alertType,
      message: data.message,
      threshold: data.threshold,
      currentValue: data.currentValue,
    })

    return NextResponse.json({
      success: true,
      message: 'Alert received and logged',
    })
  } catch (error) {
    console.error('n8n campaign-alert error:', error)
    return NextResponse.json({ error: 'Failed to process alert' }, { status: 500 })
  }
}
