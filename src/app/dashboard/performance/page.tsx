'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  Eye,
  MousePointer,
  TrendingUp,
  BarChart3,
  Sparkles,
  Loader2,
} from 'lucide-react'
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/constants'

const chartColors = {
  text: '#94A3B8',
  grid: 'rgba(255,255,255,0.05)',
  spend: '#F97316',
  impressions: '#06B6D4',
  clicks: '#8B5CF6',
  conversions: '#10B981',
}

const platformBarColors: Record<string, string> = {
  META_FEED: '#06B6D4',
  META_STORIES: '#06B6D4',
  META_REELS: '#06B6D4',
  GOOGLE_SEARCH: '#10B981',
  GOOGLE_DISPLAY: '#10B981',
  GOOGLE_YOUTUBE: '#10B981',
  TIKTOK: '#8B5CF6',
  YOUTUBE_SHORTS: '#8B5CF6',
  LINKEDIN: '#3B82F6',
  TWITTER_X: '#6B7280',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 shadow-xl">
      <p className="text-xs text-[#94A3B8] mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'Spend' ? formatCurrency(entry.value) : formatNumber(entry.value)}
        </p>
      ))}
    </div>
  )
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function PerformancePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [accountId, setAccountId] = useState('')
  const [accounts, setAccounts] = useState<Array<{ id: string; brandName: string }>>([])
  const [insights, setInsights] = useState<any>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState('')

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then(setAccounts)
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchData()
  }, [days, accountId])

  function fetchData() {
    setError(null)
    setLoading(true)
    const params = new URLSearchParams({ days: String(days) })
    if (accountId) params.set('accountId', accountId)
    fetch(`/api/performance/overview?${params}`)
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar datos de rendimiento')
        return r.json()
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  async function analyzeWithAI() {
    setInsightsLoading(true)
    setInsightsError('')
    try {
      const res = await fetch('/api/performance/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days,
          accountId: accountId || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al generar insights')
      }
      const result = await res.json()
      setInsights(result)
    } catch (err: any) {
      setInsightsError(err.message)
    } finally {
      setInsightsLoading(false)
    }
  }

  const dailyChartData = data?.daily?.map((d: any) => ({
    date: formatShortDate(d.date),
    Spend: d.spend,
    Impresiones: d.impressions,
  })) || []

  const campaignChartData = (data?.campaigns || [])
    .sort((a: any, b: any) => b.spend - a.spend)
    .slice(0, 10)
    .map((c: any) => ({
      name: `${c.name} (${c.brandName})`,
      spend: c.spend,
      platform: c.platform,
      fill: platformBarColors[c.platform] || '#6B7280',
    }))

  return (
    <>
      <Header title="Rendimiento" />
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === d ? 'bg-cyan-500/10 text-cyan-400' : 'text-[#94A3B8] hover:text-[#FAFAFA]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-1.5 text-xs text-[#FAFAFA]"
          >
            <option value="">Todas las cuentas</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.brandName}</option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={analyzeWithAI}
            disabled={insightsLoading}
          >
            {insightsLoading ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Analizando...</>
            ) : (
              <><Sparkles className="h-3 w-3" /> Analizar con IA</>
            )}
          </Button>
        </div>

        {/* AI Insights */}
        {insightsError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{insightsError}</p>
          </div>
        )}

        {insights && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                Analisis IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#FAFAFA]">{insights.summary}</p>

              {insights.topPerformers?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-emerald-400 mb-2">Lo que va bien</h4>
                  <ul className="space-y-1">
                    {insights.topPerformers.map((t: string, i: number) => (
                      <li key={i} className="text-sm text-[#94A3B8]">- {t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.concerns?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-amber-400 mb-2">Puntos de atencion</h4>
                  <ul className="space-y-1">
                    {insights.concerns.map((c: string, i: number) => (
                      <li key={i} className="text-sm text-[#94A3B8]">- {c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Recomendaciones</h4>
                <ul className="space-y-1">
                  {insights.recommendations?.map((r: string, i: number) => (
                    <li key={i} className="text-sm text-[#94A3B8]">- {r}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-white/5 p-3 border border-white/5">
                <h4 className="text-sm font-medium text-orange-400 mb-1">Presupuesto</h4>
                <p className="text-sm text-[#94A3B8]">{insights.budgetAdvice}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-violet-400 mb-2">Proximos pasos</h4>
                <ul className="space-y-1">
                  {insights.nextSteps?.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#94A3B8]">{i + 1}. {s}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={fetchData}>
              Reintentar
            </Button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[100px] rounded-xl" />)
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-cyan-500/10 p-3 rounded-xl">
                      <Eye className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#FAFAFA]">{formatNumber(data?.totals?.impressions || 0)}</p>
                      <p className="text-sm text-[#94A3B8]">Impresiones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-violet-500/10 p-3 rounded-xl">
                      <MousePointer className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#FAFAFA]">{formatNumber(data?.totals?.clicks || 0)}</p>
                      <p className="text-sm text-[#94A3B8]">Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <DollarSign className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#FAFAFA]">{formatCurrency(data?.totals?.spend || 0)}</p>
                      <p className="text-sm text-[#94A3B8]">Gasto Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#FAFAFA]">{(data?.totals?.avgCtr || 0).toFixed(2)}%</p>
                      <p className="text-sm text-[#94A3B8]">CTR Promedio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        {!loading && !error && data && (
          <>
            {dailyChartData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily trend chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia Diaria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dailyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                        <XAxis dataKey="date" tick={{ fill: chartColors.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tick={{ fill: chartColors.text, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: chartColors.text, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="Spend" stroke={chartColors.spend} fill={chartColors.spend} fillOpacity={0.15} name="Spend" />
                        <Area yAxisId="right" type="monotone" dataKey="Impresiones" stroke={chartColors.impressions} fill={chartColors.impressions} fillOpacity={0.1} name="Impresiones" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Campaign spend chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gasto por Campaña</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {campaignChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={campaignChartData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                          <XAxis type="number" tick={{ fill: chartColors.text, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                          <YAxis type="category" dataKey="name" tick={{ fill: chartColors.text, fontSize: 10 }} width={150} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="spend" name="Spend" radius={[0, 4, 4, 0]}>
                            {campaignChartData.map((entry: any, idx: number) => (
                              <rect key={idx} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-[#94A3B8] text-sm">
                        Sin datos de campaña
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#FAFAFA] mb-1">Sin metricas registradas</h3>
                  <p className="text-sm text-[#94A3B8]">
                    Las metricas se importan automaticamente cuando las campañas estan activas.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Campaign table */}
        {!loading && data?.campaigns?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campañas con Metricas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[#94A3B8]">
                      <th className="text-left py-3 px-3">Campaña</th>
                      <th className="text-left py-3 px-3">Cuenta</th>
                      <th className="text-left py-3 px-3">Plataforma</th>
                      <th className="text-left py-3 px-3">Estado</th>
                      <th className="text-right py-3 px-3">Impresiones</th>
                      <th className="text-right py-3 px-3">Clicks</th>
                      <th className="text-right py-3 px-3">CTR</th>
                      <th className="text-right py-3 px-3">Gasto</th>
                      <th className="text-right py-3 px-3">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((c: any) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3 font-medium text-[#FAFAFA]">{c.name}</td>
                        <td className="py-3 px-3 text-[#94A3B8]">{c.brandName}</td>
                        <td className="py-3 px-3 text-[#94A3B8]">{PLATFORM_LABELS[c.platform] || c.platform}</td>
                        <td className="py-3 px-3">
                          <Badge variant={c.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {STATUS_LABELS[c.status] || c.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right text-[#FAFAFA]">{formatNumber(c.impressions)}</td>
                        <td className="py-3 px-3 text-right text-[#FAFAFA]">{formatNumber(c.clicks)}</td>
                        <td className="py-3 px-3 text-right text-[#FAFAFA]">{c.ctr.toFixed(2)}%</td>
                        <td className="py-3 px-3 text-right text-[#FAFAFA]">{formatCurrency(c.spend)}</td>
                        <td className="py-3 px-3 text-right text-[#94A3B8]">{formatCurrency(c.cpc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
