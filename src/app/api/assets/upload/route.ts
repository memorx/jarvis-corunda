import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/db'
import { uploadToStorage } from '@/lib/supabase'
import type { AssetType, AssetStatus } from '@/generated/prisma/client'

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth('assets:upload')
  if (!authCheck.success) return authCheck.response

  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob | null
    const entryId = formData.get('entryId') as string | null
    const assetType = (formData.get('type') as string) || 'IMAGE'
    const fileName = (formData.get('fileName') as string) || 'asset'

    if (!file || !entryId) {
      return NextResponse.json({ error: 'file y entryId son requeridos' }, { status: 400 })
    }

    // Verify entry exists and get platform
    const entry = await prisma.parrillaEntry.findUnique({
      where: { id: entryId },
      select: { id: true, parrillaId: true, platform: true },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry no encontrada' }, { status: 404 })
    }

    // Attempt upload to Supabase
    const path = `entries/${entryId}/${Date.now()}-${fileName}`
    const contentType = file.type || 'application/octet-stream'
    const { url, error: uploadError } = await uploadToStorage('assets', path, file, contentType)

    // Default dimensions based on type
    const width = assetType === 'VIDEO' ? 1080 : 1080
    const height = assetType === 'VIDEO' ? 1920 : 1080
    const aspectRatio = assetType === 'VIDEO' ? '9:16' : '1:1'

    const asset = await prisma.asset.create({
      data: {
        entryId,
        type: assetType as AssetType,
        platform: entry.platform,
        width,
        height,
        aspectRatio,
        url: url || `placeholder://${path}`,
        status: (url ? 'GENERATED' : 'GENERATING') as AssetStatus,
      },
    })

    return NextResponse.json({
      asset,
      uploaded: !!url,
      message: url ? 'Asset subido correctamente' : 'Asset registrado (storage no configurado)',
    }, { status: 201 })
  } catch (error) {
    console.error('Asset upload error:', error)
    return NextResponse.json({ error: 'Error al subir asset' }, { status: 500 })
  }
}
