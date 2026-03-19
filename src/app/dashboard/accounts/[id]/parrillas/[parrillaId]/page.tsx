'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Calendar,
  List,
  Save,
  X,
  Check,
  MessageSquare,
  Send,
  Sparkles,
  Eye,
  Image,
  Video,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { CalendarView } from '@/components/parrilla/calendar-view'
import { FileUpload } from '@/components/ui/file-upload'
import { useToast } from '@/components/ui/toast'

function getStatusVariant(status: string) {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'orange'> = {
    DRAFT: 'secondary',
    INTERNAL_REVIEW: 'warning',
    REVISION: 'error',
    APPROVED_INTERNAL: 'default',
    CLIENT_REVIEW: 'orange',
    APPROVED: 'success',
    SCHEDULED: 'default',
    PUBLISHED: 'success',
    PAUSED: 'warning',
    ARCHIVED: 'secondary',
  }
  return map[status] || 'secondary'
}

export default function ParrillaDetailPage({
  params,
}: {
  params: Promise<{ id: string; parrillaId: string }>
}) {
  const { id: accountId, parrillaId } = use(params)
  const router = useRouter()
  const [parrilla, setParrilla] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [regenerating, setRegenerating] = useState<string | null>(null)
  const [regenInstructions, setRegenInstructions] = useState('')
  const [bulkGenerating, setBulkGenerating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })
  const [statusUpdating, setStatusUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchParrilla()
  }, [parrillaId])

  async function fetchParrilla() {
    setFetchError(null)
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}`)
      if (!res.ok) throw new Error('Error al cargar parrilla')
      const data = await res.json()
      setParrilla(data)
    } catch (error: any) {
      setFetchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveEntry() {
    if (!selectedEntry) return
    setSaving(true)
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}/entries/${selectedEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEntry),
      })
      if (res.ok) {
        toast('success', 'Entrada guardada')
        await fetchParrilla()
      } else {
        toast('error', 'Error al guardar entrada')
      }
    } catch (error) {
      toast('error', 'Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  async function addComment() {
    if (!selectedEntry || !newComment.trim()) return
    setSendingComment(true)
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}/entries/${selectedEntry.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })
      if (res.ok) {
        setNewComment('')
        toast('success', 'Comentario agregado')
        await fetchParrilla()
        const updatedParrilla = await (await fetch(`/api/parrillas/${parrillaId}`)).json()
        const updatedEntry = updatedParrilla.entries.find((e: any) => e.id === selectedEntry.id)
        if (updatedEntry) setSelectedEntry(updatedEntry)
      } else {
        toast('error', 'Error al agregar comentario')
      }
    } catch (error) {
      toast('error', 'Error al enviar comentario')
    } finally {
      setSendingComment(false)
    }
  }

  async function approveEntry(entryId: string, status: string) {
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, status }),
      })
      if (res.ok) {
        toast('success', status === 'APPROVED' ? 'Entrada aprobada' : 'Revisión solicitada')
      } else {
        toast('error', 'Error al procesar aprobación')
      }
      await fetchParrilla()
    } catch (error) {
      toast('error', 'Error al procesar aprobación')
    }
  }

  async function regenerateEntry(what: 'copy' | 'imagePrompt' | 'videoScript' | 'all') {
    if (!selectedEntry) return
    setRegenerating(what)
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}/entries/${selectedEntry.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ what, instructions: regenInstructions || undefined }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al regenerar')
      }
      const updated = await res.json()
      setSelectedEntry(updated)
      // Update the entry in the parrilla list too
      setParrilla((prev: any) => ({
        ...prev,
        entries: prev.entries.map((e: any) => e.id === updated.id ? updated : e),
      }))
      setRegenInstructions('')
      toast('success', `${what === 'all' ? 'Todo' : what === 'copy' ? 'Copy' : what === 'imagePrompt' ? 'Imagen' : 'Video script'} regenerado`)
    } catch (error: any) {
      toast('error', error.message || 'Error al regenerar')
    } finally {
      setRegenerating(null)
    }
  }

  async function generateAllContent() {
    if (bulkGenerating) return
    const pending = entries.filter((e: any) => !e.headline)
    if (pending.length === 0) {
      toast('success', 'Todas las entradas ya tienen contenido')
      return
    }
    setBulkGenerating(true)
    setBulkProgress({ current: 0, total: pending.length })
    let errorCount = 0

    for (let i = 0; i < pending.length; i++) {
      setBulkProgress({ current: i + 1, total: pending.length })
      try {
        const res = await fetch(`/api/parrillas/${parrillaId}/entries/${pending[i].id}/regenerate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ what: 'all' }),
        })
        if (!res.ok) throw new Error('Error')
        const updated = await res.json()
        setParrilla((prev: any) => ({
          ...prev,
          entries: prev.entries.map((e: any) => e.id === updated.id ? updated : e),
        }))
      } catch {
        errorCount++
      }
      if (i < pending.length - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    setBulkGenerating(false)
    const success = pending.length - errorCount
    if (errorCount === 0) {
      toast('success', `${success} de ${pending.length} generadas`)
    } else {
      toast('warning', `${success} de ${pending.length} generadas (${errorCount} errores)`)
    }
    await fetchParrilla()
  }

  async function updateParrillaStatus(newStatus: string) {
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Error al actualizar status')
      const labels: Record<string, string> = {
        INTERNAL_REVIEW: 'Enviada a revisión interna',
        CLIENT_REVIEW: 'Enviada a revisión de cliente',
        COMPLETED: 'Marcada como completada',
      }
      toast('success', labels[newStatus] || 'Status actualizado')
      await fetchParrilla()
    } catch (err: any) {
      toast('error', err.message || 'Error al actualizar status')
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Cargando..." />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64" />
        </div>
      </>
    )
  }

  if (!parrilla) {
    return (
      <>
        <Header title="Parrilla no encontrada" />
        <div className="p-6 space-y-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          {fetchError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
              <p className="text-sm text-red-400">{fetchError}</p>
              <Button variant="secondary" size="sm" className="mt-2" onClick={() => { setLoading(true); fetchParrilla() }}>
                Reintentar
              </Button>
            </div>
          )}
        </div>
      </>
    )
  }

  const entries = parrilla.entries || []

  return (
    <>
      <Header title={parrilla.name} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/accounts/${accountId}/parrillas`}>
              <Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Volver</Button>
            </Link>
            <Badge variant={getStatusVariant(parrilla.status)}>
              {STATUS_LABELS[parrilla.status] || parrilla.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-cyan-500/10 text-cyan-400' : 'text-[#94A3B8]'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 ${viewMode === 'calendar' ? 'bg-cyan-500/10 text-cyan-400' : 'text-[#94A3B8]'}`}
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Strategy summary */}
        {parrilla.aiStrategy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Estrategia: {(parrilla.aiStrategy as any).creative_concept}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Content progress indicator */}
        {(() => {
          const withContent = entries.filter((e: any) => !!e.headline).length
          const total = entries.length
          const pct = total > 0 ? Math.round((withContent / total) * 100) : 0
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#94A3B8]">
                  {withContent} de {total} entries con contenido generado
                </span>
                <span className="text-[#94A3B8]">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })()}

        {/* Bulk generation progress */}
        {bulkGenerating && (
          <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-400 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando contenido...
              </span>
              <span className="text-[#94A3B8]">
                {bulkProgress.current} de {bulkProgress.total}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${bulkProgress.total > 0 ? (bulkProgress.current / bulkProgress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Generate all content button */}
          {entries.some((e: any) => !e.headline) && (
            <Button
              onClick={generateAllContent}
              disabled={bulkGenerating}
            >
              {bulkGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generando {bulkProgress.current}/{bulkProgress.total}...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generar Contenido para Todas</>
              )}
            </Button>
          )}

          {/* Status action buttons */}
          {parrilla.status === 'DRAFT' && (
            <Button variant="secondary" onClick={() => updateParrillaStatus('INTERNAL_REVIEW')} disabled={statusUpdating}>
              {statusUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar a Revisión Interna
            </Button>
          )}
          {['INTERNAL_REVIEW', 'APPROVED_INTERNAL'].includes(parrilla.status) && (
            <Button variant="secondary" onClick={() => updateParrillaStatus('CLIENT_REVIEW')} disabled={statusUpdating}>
              {statusUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Enviar a Revisión Cliente
            </Button>
          )}
          {['CLIENT_REVIEW', 'APPROVED'].includes(parrilla.status) && (
            <Button variant="secondary" onClick={() => updateParrillaStatus('COMPLETED')} disabled={statusUpdating}>
              {statusUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Marcar como Completada
            </Button>
          )}
        </div>

        {/* Entries */}
        <div className="flex gap-6">
          {/* Entry list / calendar */}
          <div className={selectedEntry ? 'w-1/2' : 'w-full'}>
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {entries.map((entry: any, i: number) => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`rounded-lg border p-4 cursor-pointer transition-all ${
                      selectedEntry?.id === entry.id
                        ? 'border-cyan-500/50 bg-cyan-500/5'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-[#94A3B8]">
                            {new Date(entry.publishDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {PLATFORM_LABELS[entry.platform] || entry.platform}
                          </Badge>
                          <Badge variant={getStatusVariant(entry.status)} className="text-[10px]">
                            {STATUS_LABELS[entry.status] || entry.status}
                          </Badge>
                          {['VIDEO_SHORT', 'VIDEO_LONG'].includes(entry.contentType) ? (
                            <Video className="h-3 w-3 text-orange-400" />
                          ) : (
                            <Image className="h-3 w-3 text-cyan-400" />
                          )}
                          {entry.funnelStage && (
                            <Badge
                              variant={
                                entry.funnelStage === 'TOFU' ? 'default' :
                                entry.funnelStage === 'MOFU' ? 'warning' : 'error'
                              }
                              className="text-[10px]"
                            >
                              {entry.funnelStage === 'TOFU' ? 'Frio' :
                               entry.funnelStage === 'MOFU' ? 'Tibio' : 'Caliente'}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-[#FAFAFA] text-sm truncate">
                          {entry.headline || entry.visualConcept || `Entrada ${i + 1}`}
                        </h4>
                        {entry.primaryText && (
                          <p className="text-xs text-[#94A3B8] mt-1 line-clamp-1">{entry.primaryText}</p>
                        )}
                      </div>
                      {entry.comments?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                          <MessageSquare className="h-3 w-3" />
                          {entry.comments.length}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CalendarView
                entries={entries}
                month={parrilla.month || new Date().getMonth() + 1}
                year={parrilla.year || new Date().getFullYear()}
                onEntryClick={setSelectedEntry}
              />
            )}
          </div>

          {/* Entry detail slide-over */}
          {selectedEntry && (
            <div className="w-1/2 sticky top-20">
              <Card className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Editar Entrada</CardTitle>
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="text-[#94A3B8] hover:text-[#FAFAFA]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Copy fields */}
                  <Input
                    label="Titular"
                    value={selectedEntry.headline || ''}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, headline: e.target.value })}
                  />
                  <Textarea
                    label="Texto principal"
                    value={selectedEntry.primaryText || ''}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, primaryText: e.target.value })}
                  />
                  <Input
                    label="Descripción"
                    value={selectedEntry.description || ''}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, description: e.target.value })}
                  />
                  <Input
                    label="CTA"
                    value={selectedEntry.ctaText || ''}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, ctaText: e.target.value })}
                  />
                  <Input
                    label="Hashtags (separados por coma)"
                    value={selectedEntry.hashtags?.join(', ') || ''}
                    onChange={(e) => setSelectedEntry({
                      ...selectedEntry,
                      hashtags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean),
                    })}
                  />

                  {/* Visual concept */}
                  <Textarea
                    label="Concepto Visual"
                    value={selectedEntry.visualConcept || ''}
                    onChange={(e) => setSelectedEntry({ ...selectedEntry, visualConcept: e.target.value })}
                  />

                  {/* Image prompt */}
                  {selectedEntry.imagePrompt && (
                    <Textarea
                      label="Prompt de Imagen (DALL-E)"
                      value={selectedEntry.imagePrompt || ''}
                      onChange={(e) => setSelectedEntry({ ...selectedEntry, imagePrompt: e.target.value })}
                      className="font-mono text-xs"
                    />
                  )}

                  {/* Video script preview */}
                  {selectedEntry.videoScript && (
                    <div>
                      <label className="text-sm font-medium text-[#94A3B8] block mb-2">Guión de Video</label>
                      <div className="rounded-lg bg-white/5 p-3 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-[#94A3B8] whitespace-pre-wrap">
                          {JSON.stringify(selectedEntry.videoScript, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={saveEntry} disabled={saving} size="sm">
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Guardar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => approveEntry(selectedEntry.id, 'APPROVED')}
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-400" /> Aprobar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => approveEntry(selectedEntry.id, 'REVISION_REQUESTED')}
                    >
                      <XCircle className="h-3 w-3" /> Revisión
                    </Button>
                  </div>

                  {/* Regeneration */}
                  <div className="border-t border-white/5 pt-4">
                    <details className="mt-0">
                      <summary className="text-xs text-cyan-400 cursor-pointer">
                        + Instrucciones para regenerar
                      </summary>
                      <Textarea
                        placeholder="Ej: Hazlo mas urgente, enfoca en el precio, usa humor..."
                        value={regenInstructions}
                        onChange={(e) => setRegenInstructions(e.target.value)}
                        className="mt-2 min-h-[60px]"
                      />
                    </details>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => regenerateEntry('copy')}
                        disabled={!!regenerating}
                      >
                        {regenerating === 'copy' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        Regenerar Copy
                      </Button>
                      {!['VIDEO_SHORT', 'VIDEO_LONG'].includes(selectedEntry.contentType) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => regenerateEntry('imagePrompt')}
                          disabled={!!regenerating}
                        >
                          {regenerating === 'imagePrompt' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                          Regenerar Imagen
                        </Button>
                      )}
                      {['VIDEO_SHORT', 'VIDEO_LONG'].includes(selectedEntry.contentType) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => regenerateEntry('videoScript')}
                          disabled={!!regenerating}
                        >
                          {regenerating === 'videoScript' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                          Regenerar Video Script
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => regenerateEntry('all')}
                        disabled={!!regenerating}
                      >
                        {regenerating === 'all' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        Regenerar Todo
                      </Button>
                    </div>
                  </div>

                  {/* Assets */}
                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-sm font-medium text-[#94A3B8] mb-3">
                      Assets ({selectedEntry.assets?.length || 0})
                    </h4>
                    {selectedEntry.assets?.map((asset: any) => (
                      <div key={asset.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-2 mb-2">
                        <Image className="h-4 w-4 text-[#94A3B8]" />
                        <span className="text-sm text-[#FAFAFA] truncate flex-1">{asset.url?.split('/').pop() || asset.type}</span>
                        <Badge variant="secondary" className="text-[10px]">{asset.type}</Badge>
                      </div>
                    ))}
                    <FileUpload
                      accept="image/*,video/*"
                      multiple
                      maxSize={25}
                      onUpload={async (files) => {
                        for (const file of files) {
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('entryId', selectedEntry.id)
                          formData.append('fileName', file.name)
                          formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
                          await fetch('/api/assets/upload', { method: 'POST', body: formData })
                        }
                        toast('success', 'Assets subidos')
                        await fetchParrilla()
                      }}
                      label="Subir imagen o video para esta entrada"
                    />
                  </div>

                  {/* Comments */}
                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-sm font-medium text-[#94A3B8] mb-3">
                      Comentarios ({selectedEntry.comments?.length || 0})
                    </h4>
                    <div className="space-y-3 mb-3 max-h-40 overflow-y-auto">
                      {selectedEntry.comments?.map((comment: any) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar name={comment.user.name} src={comment.user.avatar} size="sm" className="h-6 w-6 text-[8px]" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-[#FAFAFA]">{comment.user.name}</span>
                              <span className="text-[10px] text-[#94A3B8]">
                                {new Date(comment.createdAt).toLocaleDateString('es-MX')}
                              </span>
                            </div>
                            <p className="text-xs text-[#94A3B8]">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addComment()}
                        className="flex-1 rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-xs text-[#FAFAFA] placeholder:text-[#94A3B8]/50 focus:border-cyan-400/50 focus:outline-none"
                      />
                      <Button size="sm" variant="secondary" onClick={addComment} disabled={sendingComment}>
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
