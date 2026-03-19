'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  CalendarDays,
  Megaphone,
  Settings,
  Users,
  Plus,
  Palette,
  Target,
  MessageSquare,
  Clock,
} from 'lucide-react'
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, ROLE_LABELS, STATUS_LABELS } from '@/lib/constants'

function getStatusVariant(status: string) {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'orange'> = {
    DRAFT: 'secondary',
    INTERNAL_REVIEW: 'warning',
    REVISION: 'error',
    APPROVED_INTERNAL: 'default',
    CLIENT_REVIEW: 'orange',
    CLIENT_REVISION: 'error',
    APPROVED: 'success',
    IN_PRODUCTION: 'default',
    COMPLETED: 'success',
  }
  return map[status] || 'secondary'
}

interface AccountDetail {
  id: string
  name: string
  brandName: string
  industry: string | null
  description: string | null
  brandVoice: string | null
  brandColors: string[]
  targetAudience: string | null
  competitors: string | null
  guidelines: string | null
  sampleCopies: string | null
  platforms: string[]
  contentTypes: string[]
  monthlyBudget: number | null
  _count: { parrillas: number; campaigns: number }
  users: { id: string; role: string; user: { id: string; name: string; email: string; role: string; avatar: string | null } }[]
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'brand' | 'parrillas' | 'campaigns'>('overview')
  const [parrillas, setParrillas] = useState<any[]>([])
  const [parrillasLoading, setParrillasLoading] = useState(false)
  const [parrillasLoaded, setParrillasLoaded] = useState(false)

  useEffect(() => {
    fetchAccount()
  }, [id])

  useEffect(() => {
    if (activeTab === 'parrillas' && !parrillasLoaded) {
      fetchParrillas()
    }
  }, [activeTab])

  async function fetchParrillas() {
    setParrillasLoading(true)
    try {
      const res = await fetch(`/api/parrillas?accountId=${id}`)
      if (!res.ok) throw new Error('Error')
      const data = await res.json()
      setParrillas(data)
      setParrillasLoaded(true)
    } catch {
      setParrillas([])
    } finally {
      setParrillasLoading(false)
    }
  }

  async function fetchAccount() {
    try {
      const res = await fetch(`/api/accounts/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setAccount(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Cargando..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </>
    )
  }

  if (!account) {
    return (
      <>
        <Header title="Cuenta no encontrada" />
        <div className="p-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/accounts')}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>
      </>
    )
  }

  const tabs = [
    { key: 'overview', label: 'General' },
    { key: 'brand', label: 'Marca & IA' },
    { key: 'parrillas', label: 'Parrillas' },
    { key: 'campaigns', label: 'Campañas' },
  ] as const

  return (
    <>
      <Header title={account.brandName} />
      <div className="p-6 space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/dashboard/accounts')}>
            <ArrowLeft className="h-4 w-4" /> Volver a cuentas
          </Button>
          <div className="flex gap-2">
            <Link href={`/dashboard/accounts/${id}/settings`}>
              <Button variant="secondary">
                <Settings className="h-4 w-4" /> Configuración
              </Button>
            </Link>
          </div>
        </div>

        {/* Account Header */}
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: account.brandColors?.[0] || '#1A1A2E' }}
          >
            {account.brandName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#FAFAFA]">{account.brandName}</h2>
            <p className="text-[#94A3B8]">{account.industry || 'Sin industria'}</p>
          </div>
          {/* Brand colors preview */}
          {account.brandColors.length > 0 && (
            <div className="flex gap-1 ml-4">
              {account.brandColors.map((color, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-[#94A3B8] hover:text-[#FAFAFA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="bg-cyan-500/10 p-3 rounded-xl">
                      <CalendarDays className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#FAFAFA]">{account._count.parrillas}</p>
                      <p className="text-sm text-[#94A3B8]">Parrillas</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <Megaphone className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#FAFAFA]">{account._count.campaigns}</p>
                      <p className="text-sm text-[#94A3B8]">Campañas</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {account.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#94A3B8]">{account.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Platforms */}
              <Card>
                <CardHeader>
                  <CardTitle>Plataformas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {account.platforms.map((p) => (
                      <Badge key={p}>{PLATFORM_LABELS[p] || p}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Contenido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {account.contentTypes.map((ct) => (
                      <Badge key={ct} variant="orange">{CONTENT_TYPE_LABELS[ct] || ct}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Equipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {account.users.map((au) => (
                      <div key={au.id} className="flex items-center gap-3">
                        <Avatar name={au.user.name} src={au.user.avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#FAFAFA] truncate">{au.user.name}</p>
                          <p className="text-xs text-[#94A3B8]">{ROLE_LABELS[au.user.role] || au.user.role}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{au.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/dashboard/accounts/${id}/parrillas/new`} className="block">
                    <Button variant="secondary" className="w-full justify-start">
                      <Plus className="h-4 w-4 text-cyan-400" /> Nueva Parrilla
                    </Button>
                  </Link>
                  <Link href={`/dashboard/accounts/${id}/campaigns`} className="block">
                    <Button variant="secondary" className="w-full justify-start">
                      <Megaphone className="h-4 w-4 text-orange-400" /> Ver Campañas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Voz de Marca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">
                  {account.brandVoice || 'Sin definir — configura la voz de marca para mejores resultados de IA'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" /> Audiencia Objetivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">
                  {account.targetAudience || 'Sin definir'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Colores de Marca
                </CardTitle>
              </CardHeader>
              <CardContent>
                {account.brandColors.length > 0 ? (
                  <div className="flex gap-3">
                    {account.brandColors.map((color, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className="h-12 w-12 rounded-lg border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-[#94A3B8] font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#94A3B8]">Sin colores definidos</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competidores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">
                  {account.competitors || 'Sin definir'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lineamientos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">
                  {account.guidelines || 'Sin definir'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Copies de Ejemplo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">
                  {account.sampleCopies || 'Sin definir'}
                </p>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Link href={`/dashboard/accounts/${id}/settings`}>
                <Button variant="secondary">
                  <Settings className="h-4 w-4" /> Editar Configuración de Marca
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'parrillas' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-[#FAFAFA]">Parrillas</h3>
              <Link href={`/dashboard/accounts/${id}/parrillas/new`}>
                <Button><Plus className="h-4 w-4" /> Nueva Parrilla</Button>
              </Link>
            </div>

            {parrillasLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Card key={i}><CardContent className="p-6"><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-32" /></CardContent></Card>
                ))}
              </div>
            )}

            {!parrillasLoading && parrillas.length === 0 && (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
                <p className="text-sm text-[#94A3B8] mb-4">Sin parrillas creadas</p>
                <Link href={`/dashboard/accounts/${id}/parrillas/new`}>
                  <Button><Plus className="h-4 w-4" /> Crear Parrilla</Button>
                </Link>
              </div>
            )}

            {!parrillasLoading && parrillas.length > 0 && (
              <div className="space-y-3">
                {parrillas.map((p: any) => (
                  <Link key={p.id} href={`/dashboard/accounts/${id}/parrillas/${p.id}`}>
                    <Card className="hover:border-cyan-500/20 transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-[#FAFAFA]">{p.name}</h4>
                            <p className="text-sm text-[#94A3B8] mt-1">{p.description || 'Sin descripción'}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-[#94A3B8]">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {p._count?.entries || 0} entradas
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(p.createdAt).toLocaleDateString('es-MX')}
                              </span>
                              {p.createdBy?.name && <span>Por: {p.createdBy.name}</span>}
                            </div>
                          </div>
                          <Badge variant={getStatusVariant(p.status)}>
                            {STATUS_LABELS[p.status] || p.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-1">Campañas</h3>
            <p className="text-sm text-[#94A3B8]">
              Las campañas de esta cuenta aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </>
  )
}
