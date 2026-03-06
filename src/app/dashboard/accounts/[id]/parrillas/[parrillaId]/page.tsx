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
} from 'lucide-react'
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS } from '@/lib/constants'

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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  useEffect(() => {
    fetchParrilla()
  }, [parrillaId])

  async function fetchParrilla() {
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setParrilla(data)
    } catch (error) {
      console.error('Error:', error)
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
        await fetchParrilla()
      }
    } catch (error) {
      console.error('Error saving:', error)
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
        await fetchParrilla()
        // Refresh selected entry
        const updatedParrilla = await (await fetch(`/api/parrillas/${parrillaId}`)).json()
        const updatedEntry = updatedParrilla.entries.find((e: any) => e.id === selectedEntry.id)
        if (updatedEntry) setSelectedEntry(updatedEntry)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSendingComment(false)
    }
  }

  async function approveEntry(entryId: string, status: string) {
    try {
      await fetch(`/api/parrillas/${parrillaId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, status }),
      })
      await fetchParrilla()
    } catch (error) {
      console.error('Error:', error)
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
        <div className="p-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
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

        {/* Entries */}
        <div className="flex gap-6">
          {/* Entry list */}
          <div className={selectedEntry ? 'w-1/2' : 'w-full'}>
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
