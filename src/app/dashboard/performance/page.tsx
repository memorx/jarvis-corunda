'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  Eye,
  MousePointer,
  TrendingUp,
  Target,
  BarChart3,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/constants'

export default function PerformancePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(setCampaigns)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE')

  return (
    <>
      <Header title="Rendimiento" />
      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-cyan-500/10 p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FAFAFA]">{campaigns.length}</p>
                  <p className="text-sm text-[#94A3B8]">Total Campañas</p>
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
                  <p className="text-2xl font-bold text-[#FAFAFA]">{activeCampaigns.length}</p>
                  <p className="text-sm text-[#94A3B8]">Campañas Activas</p>
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
                  <p className="text-2xl font-bold text-[#FAFAFA]">
                    {formatCurrency(campaigns.reduce((sum, c) => sum + (c.totalBudget || 0), 0))}
                  </p>
                  <p className="text-sm text-[#94A3B8]">Presupuesto Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-violet-500/10 p-3 rounded-xl">
                  <Target className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FAFAFA]">
                    {campaigns.reduce((sum, c) => sum + (c._count?.entries || 0), 0)}
                  </p>
                  <p className="text-sm text-[#94A3B8]">Piezas de Contenido</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign list */}
        <Card>
          <CardHeader>
            <CardTitle>Todas las Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>}

            {!loading && campaigns.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
                <p className="text-[#94A3B8]">No hay campañas creadas aún</p>
              </div>
            )}

            {!loading && campaigns.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[#94A3B8]">
                      <th className="text-left py-3 px-3">Campaña</th>
                      <th className="text-left py-3 px-3">Cuenta</th>
                      <th className="text-left py-3 px-3">Plataforma</th>
                      <th className="text-left py-3 px-3">Estado</th>
                      <th className="text-right py-3 px-3">Presupuesto</th>
                      <th className="text-right py-3 px-3">Entradas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-3 font-medium text-[#FAFAFA]">{c.name}</td>
                        <td className="py-3 px-3 text-[#94A3B8]">{c.account?.brandName}</td>
                        <td className="py-3 px-3 text-[#94A3B8]">{PLATFORM_LABELS[c.platform]}</td>
                        <td className="py-3 px-3">
                          <Badge variant={c.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {STATUS_LABELS[c.status] || c.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right text-[#FAFAFA]">
                          {c.totalBudget ? formatCurrency(c.totalBudget) : '-'}
                        </td>
                        <td className="py-3 px-3 text-right text-[#94A3B8]">{c._count?.entries || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
