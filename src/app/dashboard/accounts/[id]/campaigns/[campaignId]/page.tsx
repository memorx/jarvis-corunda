'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, TrendingUp, DollarSign, Eye, MousePointer, Users, Target } from 'lucide-react'
import { PLATFORM_LABELS, CAMPAIGN_OBJECTIVE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string; campaignId: string }> }) {
  const { id: accountId, campaignId } = use(params)
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/campaigns/${campaignId}`)
      .then(r => r.json())
      .then(setCampaign)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [campaignId])

  if (loading) return <><Header title="Cargando..." /><div className="p-6"><Skeleton className="h-64" /></div></>

  if (!campaign) return <><Header title="Campaña no encontrada" /><div className="p-6"><Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Volver</Button></div></>

  const metrics = campaign.metrics || []
  const totalSpend = metrics.reduce((sum: number, m: any) => sum + m.spend, 0)
  const totalClicks = metrics.reduce((sum: number, m: any) => sum + m.clicks, 0)
  const totalImpressions = metrics.reduce((sum: number, m: any) => sum + m.impressions, 0)
  const totalConversions = metrics.reduce((sum: number, m: any) => sum + m.conversions, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0
  const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0

  const metricCards = [
    { title: 'Gasto Total', value: formatCurrency(totalSpend), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Impresiones', value: formatNumber(totalImpressions), icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { title: 'Clics', value: formatNumber(totalClicks), icon: MousePointer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { title: 'CTR', value: `${avgCTR.toFixed(2)}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Conversiones', value: formatNumber(totalConversions), icon: Target, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { title: 'CPA', value: formatCurrency(avgCPA), icon: Users, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ]

  return (
    <>
      <Header title={campaign.name} />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/dashboard/accounts/${accountId}/campaigns`)}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'secondary'}>
            {STATUS_LABELS[campaign.status] || campaign.status}
          </Badge>
          <span className="text-sm text-[#94A3B8]">{PLATFORM_LABELS[campaign.platform]}</span>
          <span className="text-sm text-[#94A3B8]">{CAMPAIGN_OBJECTIVE_LABELS[campaign.objective]}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metricCards.map(m => (
            <Card key={m.title}>
              <CardContent className="p-4">
                <div className={`${m.bg} p-2 rounded-lg w-fit mb-2`}>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <p className="text-lg font-bold text-[#FAFAFA]">{m.value}</p>
                <p className="text-xs text-[#94A3B8]">{m.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Budget info */}
        <Card>
          <CardHeader>
            <CardTitle>Presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[#94A3B8]">Presupuesto diario</p>
                <p className="text-[#FAFAFA] font-medium">{campaign.dailyBudget ? formatCurrency(campaign.dailyBudget) : 'No definido'}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Presupuesto total</p>
                <p className="text-[#FAFAFA] font-medium">{campaign.totalBudget ? formatCurrency(campaign.totalBudget) : 'No definido'}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Gastado</p>
                <p className="text-[#FAFAFA] font-medium">{formatCurrency(totalSpend)}</p>
                {campaign.totalBudget && (
                  <div className="mt-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${Math.min(100, (totalSpend / campaign.totalBudget) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily metrics table */}
        {metrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Métricas Diarias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[#94A3B8]">
                      <th className="text-left py-2 px-3">Fecha</th>
                      <th className="text-right py-2 px-3">Gasto</th>
                      <th className="text-right py-2 px-3">Impresiones</th>
                      <th className="text-right py-2 px-3">Clics</th>
                      <th className="text-right py-2 px-3">CTR</th>
                      <th className="text-right py-2 px-3">Conv.</th>
                      <th className="text-right py-2 px-3">CPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m: any) => (
                      <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-3 text-[#FAFAFA]">{new Date(m.date).toLocaleDateString('es-MX')}</td>
                        <td className="py-2 px-3 text-right text-[#FAFAFA]">{formatCurrency(m.spend)}</td>
                        <td className="py-2 px-3 text-right text-[#94A3B8]">{formatNumber(m.impressions)}</td>
                        <td className="py-2 px-3 text-right text-[#94A3B8]">{formatNumber(m.clicks)}</td>
                        <td className="py-2 px-3 text-right text-[#94A3B8]">{m.ctr ? `${m.ctr.toFixed(2)}%` : '-'}</td>
                        <td className="py-2 px-3 text-right text-[#94A3B8]">{m.conversions}</td>
                        <td className="py-2 px-3 text-right text-[#94A3B8]">{m.cpa ? formatCurrency(m.cpa) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {metrics.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#FAFAFA] mb-1">Sin métricas aún</h3>
              <p className="text-sm text-[#94A3B8]">Las métricas se importarán automáticamente via n8n</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
