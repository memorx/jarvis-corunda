'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Megaphone,
  CalendarDays,
  DollarSign,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  Cpu,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatNumber, timeAgo } from '@/lib/utils'

interface DashboardStats {
  accounts: number
  activeCampaigns: number
  totalBudget: number
  pendingEntries: number
  aiCostThisMonth: number
  aiCallsThisMonth: number
}

interface ActivityItem {
  type: 'parrilla' | 'approval' | 'ai'
  text: string
  detail: string
  time: string
}

function getActivityIcon(type: string, text: string) {
  if (type === 'parrilla') return <CalendarDays className="h-4 w-4 text-cyan-400" />
  if (type === 'ai') return <Sparkles className="h-4 w-4 text-violet-400" />
  if (text.includes('aprobó')) return <CheckCircle className="h-4 w-4 text-emerald-400" />
  return <XCircle className="h-4 w-4 text-orange-400" />
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  function fetchDashboard() {
    setError(null)
    setLoading(true)
    fetch('/api/dashboard/stats')
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar estadísticas')
        return r.json()
      })
      .then(data => {
        setStats(data.stats)
        setActivity(data.activity)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const role = (session?.user as any)?.role
  const showAiCost = role === 'SUPERADMIN' || role === 'MANAGER'

  const statCards = stats ? [
    {
      title: 'Cuentas Activas',
      value: formatNumber(stats.accounts),
      icon: Building2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Campañas Activas',
      value: formatNumber(stats.activeCampaigns),
      icon: Megaphone,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Contenido Pendiente',
      value: formatNumber(stats.pendingEntries),
      icon: CalendarDays,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Presupuesto Activo',
      value: formatCurrency(stats.totalBudget),
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ] : []

  return (
    <>
      <Header title={`¡Hola, ${session?.user?.name || 'usuario'}!`} />
      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={fetchDashboard}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${showAiCost ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-[100px] rounded-xl" />
              ))}
              {showAiCost && <Skeleton className="h-[100px] rounded-xl" />}
            </>
          ) : (
            <>
              {statCards.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#94A3B8]">{stat.title}</p>
                        <p className="mt-1 text-2xl font-bold text-[#FAFAFA]">{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} rounded-xl p-3`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {showAiCost && stats && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#94A3B8]">Costo AI Mensual</p>
                        <p className="mt-1 text-2xl font-bold text-[#FAFAFA]">
                          ${stats.aiCostThisMonth.toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {formatNumber(stats.aiCallsThisMonth)} llamadas
                        </p>
                      </div>
                      <div className="bg-violet-500/10 rounded-xl p-3">
                        <Cpu className="h-6 w-6 text-violet-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Acciones Rapidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/accounts" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <Plus className="h-4 w-4 text-cyan-400" />
                  Nueva Parrilla
                </Button>
              </Link>
              <Link href="/dashboard/accounts" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <Megaphone className="h-4 w-4 text-orange-400" />
                  Nueva Campaña
                </Button>
              </Link>
              <Link href="/dashboard/playground" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  AI Playground
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-[#94A3B8]/30 mx-auto mb-3" />
                  <p className="text-sm text-[#94A3B8]">No hay actividad reciente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg p-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {getActivityIcon(item.type, item.text)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#FAFAFA]">{item.text}</p>
                        {item.detail && (
                          <p className="text-xs text-[#94A3B8] mt-0.5">{item.detail}</p>
                        )}
                        <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(item.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
