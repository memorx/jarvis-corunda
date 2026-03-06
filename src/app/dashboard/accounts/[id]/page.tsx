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
} from 'lucide-react'
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, ROLE_LABELS } from '@/lib/constants'

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

  useEffect(() => {
    fetchAccount()
  }, [id])

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
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-1">Parrillas</h3>
            <p className="text-sm text-[#94A3B8] mb-4">
              Las parrillas de esta cuenta aparecerán aquí
            </p>
            <Link href={`/dashboard/accounts/${id}/parrillas/new`}>
              <Button>
                <Plus className="h-4 w-4" /> Crear Parrilla
              </Button>
            </Link>
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
