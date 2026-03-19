'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Image,
  Video,
  Loader2,
  CalendarDays,
  Hash,
  FileText,
  Film,
} from 'lucide-react'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/constants'

function getStatusVariant(status: string) {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'orange'> = {
    DRAFT: 'secondary',
    INTERNAL_REVIEW: 'warning',
    REVISION: 'error',
    APPROVED_INTERNAL: 'default',
    CLIENT_REVIEW: 'orange',
    APPROVED: 'success',
  }
  return map[status] || 'secondary'
}

function getPlatformVariant(platform: string) {
  if (platform.startsWith('META')) return 'default'
  if (platform.startsWith('GOOGLE')) return 'success'
  if (platform === 'TIKTOK') return 'secondary'
  return 'secondary' as const
}

export default function ApprovalsPage() {
  const [parrillas, setParrillas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [expandedParrilla, setExpandedParrilla] = useState<string | null>(null)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchPending()
  }, [])

  async function fetchPending() {
    setFetchError(null)
    try {
      const res = await fetch('/api/approvals/pending')
      if (!res.ok) throw new Error('Error al cargar aprobaciones')
      const data = await res.json()
      setParrillas(data)
    } catch (err: any) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function approveEntry(parrillaId: string, entryId: string, status: string) {
    const comment = commentInputs[entryId] || ''
    if (status === 'REVISION_REQUESTED' && !comment.trim()) {
      toast('warning', 'Agrega un comentario para solicitar revisión')
      return
    }

    setActionLoading(prev => ({ ...prev, [entryId]: true }))
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, status, comment: comment || undefined }),
      })

      if (!res.ok) throw new Error('Error al procesar aprobación')

      toast('success', status === 'APPROVED' ? 'Entrada aprobada' : 'Revisión solicitada')
      setCommentInputs(prev => ({ ...prev, [entryId]: '' }))
      await fetchPending()
    } catch (err: any) {
      toast('error', err.message)
    } finally {
      setActionLoading(prev => ({ ...prev, [entryId]: false }))
    }
  }

  async function approveAllParrilla(parrillaId: string) {
    setActionLoading(prev => ({ ...prev, [parrillaId]: true }))
    try {
      const res = await fetch(`/api/parrillas/${parrillaId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (!res.ok) throw new Error('Error al aprobar parrilla')

      toast('success', 'Parrilla aprobada completamente')
      await fetchPending()
    } catch (err: any) {
      toast('error', err.message)
    } finally {
      setActionLoading(prev => ({ ...prev, [parrillaId]: false }))
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Aprobaciones" />
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Aprobaciones" />
      <div className="p-6 space-y-6">
        <p className="text-[#94A3B8]">
          Revisa y aprueba las parrillas de contenido pendientes
        </p>

        {fetchError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-400">{fetchError}</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => { setLoading(true); fetchPending() }}>
              Reintentar
            </Button>
          </div>
        )}

        {parrillas.length === 0 && !fetchError && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-emerald-400/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-1">Todo al día</h3>
            <p className="text-sm text-[#94A3B8]">No hay parrillas pendientes de aprobación</p>
          </div>
        )}

        {parrillas.map((parrilla: any) => {
          const isExpanded = expandedParrilla === parrilla.id

          return (
            <Card key={parrilla.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedParrilla(isExpanded ? null : parrilla.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{parrilla.name}</CardTitle>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#94A3B8]">
                      <span>{parrilla.account?.brandName}</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {parrilla._count?.entries || 0} entradas
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(parrilla.status)}>
                      {STATUS_LABELS[parrilla.status] || parrilla.status}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#94A3B8]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  {/* Approve all button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => approveAllParrilla(parrilla.id)}
                      disabled={!!actionLoading[parrilla.id]}
                      size="sm"
                    >
                      {actionLoading[parrilla.id] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      Aprobar Toda la Parrilla
                    </Button>
                  </div>

                  {/* Entries */}
                  <div className="space-y-3">
                    {parrilla.entries?.map((entry: any) => (
                      <div
                        key={entry.id}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-4 space-y-3"
                      >
                        {/* Entry header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-[10px]">
                                {new Date(entry.publishDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                              </Badge>
                              <Badge variant={getPlatformVariant(entry.platform) as any} className="text-[10px]">
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
                            <h4 className="font-medium text-[#FAFAFA] text-sm">
                              {entry.headline || entry.visualConcept || 'Sin título'}
                            </h4>
                          </div>
                        </div>

                        {/* Entry content */}
                        {entry.primaryText && (
                          <p className="text-sm text-[#94A3B8]">{entry.primaryText}</p>
                        )}

                        {entry.hashtags?.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <Hash className="h-3 w-3 text-cyan-400 shrink-0" />
                            <p className="text-xs text-cyan-400">{entry.hashtags.join(' ')}</p>
                          </div>
                        )}

                        {/* Collapsible: Image prompt */}
                        {entry.imagePrompt && (
                          <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-xs text-[#94A3B8] hover:text-[#FAFAFA] transition-colors">
                              <FileText className="h-3 w-3" />
                              Prompt de imagen disponible
                            </summary>
                            <div className="mt-2 rounded-lg bg-white/5 p-3">
                              <p className="text-xs text-[#94A3B8] font-mono whitespace-pre-wrap">{entry.imagePrompt}</p>
                            </div>
                          </details>
                        )}

                        {/* Collapsible: Video script */}
                        {entry.videoScript && (
                          <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-xs text-[#94A3B8] hover:text-[#FAFAFA] transition-colors">
                              <Film className="h-3 w-3" />
                              Guión de video disponible
                            </summary>
                            <div className="mt-2 rounded-lg bg-white/5 p-3">
                              <pre className="text-xs text-[#94A3B8] whitespace-pre-wrap">
                                {JSON.stringify(entry.videoScript, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}

                        {/* Last approval/comment */}
                        {entry.approvals?.[0] && (
                          <div className="text-xs text-[#94A3B8] flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            Última revisión por {entry.approvals[0].user?.name}: {entry.approvals[0].status}
                          </div>
                        )}

                        {entry.comments?.length > 0 && (
                          <div className="space-y-1.5">
                            {entry.comments.map((c: any) => (
                              <div key={c.id} className="text-xs text-[#94A3B8] bg-white/5 rounded-lg px-3 py-2">
                                <span className="font-medium text-[#FAFAFA]">{c.user?.name}: </span>
                                {c.content}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Comentario (opcional para aprobar, requerido para revisión)"
                            value={commentInputs[entry.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [entry.id]: e.target.value }))}
                            className="flex-1 rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-xs text-[#FAFAFA] placeholder:text-[#94A3B8]/50 focus:border-cyan-400/50 focus:outline-none"
                          />
                          <Button
                            size="sm"
                            onClick={() => approveEntry(parrilla.id, entry.id, 'APPROVED')}
                            disabled={!!actionLoading[entry.id]}
                          >
                            {actionLoading[entry.id] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3 text-emerald-400" />
                            )}
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => approveEntry(parrilla.id, entry.id, 'REVISION_REQUESTED')}
                            disabled={!!actionLoading[entry.id]}
                          >
                            <XCircle className="h-3 w-3 text-orange-400" />
                            Revisión
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}
