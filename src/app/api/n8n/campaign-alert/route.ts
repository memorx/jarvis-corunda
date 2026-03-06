import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[n8n Alert]', {
      campaignId: body.campaignId,
      alertType: body.alertType,
      message: body.message,
      threshold: body.threshold,
      currentValue: body.currentValue,
    })

    // In production, this would trigger notifications via email/WhatsApp
    // For now, just log and acknowledge

    return NextResponse.json({
      success: true,
      message: 'Alert received and logged',
    })
  } catch (error) {
    console.error('n8n campaign-alert error:', error)
    return NextResponse.json({ error: 'Failed to process alert' }, { status: 500 })
  }
}
