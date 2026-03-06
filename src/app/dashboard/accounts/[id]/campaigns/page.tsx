'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Megaphone, DollarSign, Calendar } from 'lucide-react'
import { PLATFORM_LABELS, CAMPAIGN_OBJECTIVE_LABELS, STATUS_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

const PLATFORMS_FOR_ADS = ['META_FEED', 'META_STORIES', 'META_REELS', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY', 'GOOGLE_YOUTUBE', 'TIKTOK', 'LINKEDIN']
const OBJECTIVES = ['AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'CONVERSIONS', 'SALES']

export default function CampaignsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: accountId } = use(params)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '', platform: 'META_FEED', objective: 'CONVERSIONS',
    dailyBudget: '', totalBudget: '', startDate: '', endDate: '',
  })

  useEffect(() => {
    fetch(`/api/campaigns?accountId=${accountId}`)
      .then(r => r.json())
      .then(setCampaigns)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [accountId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          name: form.name,
          platform: form.platform,
          objective: form.objective,
          dailyBudget: form.dailyBudget ? parseFloat(form.dailyBudget) : null,
          totalBudget: form.totalBudget ? parseFloat(form.totalBudget) : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      })
      if (res.ok) {
        setShowCreate(false)
        const data = await fetch(`/api/campaigns?accountId=${accountId}`).then(r => r.json())
        setCampaigns(data)
        setForm({ name: '', platform: 'META_FEED', objective: 'CONVERSIONS', dailyBudget: '', totalBudget: '', startDate: '', endDate: '' })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  const statusVariant = (s: string) => {
    const map: Record<string, any> = { DRAFT: 'secondary', READY: 'warning', ACTIVE: 'success', PAUSED: 'warning', COMPLETED: 'default', ARCHIVED: 'secondary' }
    return map[s] || 'secondary'
  }

  return (
    <>
      <Header title="Campañas" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href={`/dashboard/accounts/${accountId}`}>
            <Button variant="ghost"><ArrowLeft className="h-4 w-4" /> Volver</Button>
          </Link>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Nueva Campaña
          </Button>
        </div>

        {loading && <div className="space-y-3">{[1,2,3].map(i => <Card key={i}><CardContent className="p-6"><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-32" /></CardContent></Card>)}</div>}

        {!loading && campaigns.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-1">Sin campañas</h3>
            <p className="text-sm text-[#94A3B8] mb-4">Crea tu primera campaña publicitaria</p>
            <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Crear Campaña</Button>
          </div>
        )}

        {!loading && campaigns.map((c: any) => (
          <Link key={c.id} href={`/dashboard/accounts/${accountId}/campaigns/${c.id}`}>
            <Card className="hover:border-cyan-500/20 transition-all cursor-pointer mb-3">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#FAFAFA]">{c.name}</h3>
                      <Badge variant={statusVariant(c.status)}>{STATUS_LABELS[c.status] || c.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
                      <span>{PLATFORM_LABELS[c.platform]}</span>
                      <span>{CAMPAIGN_OBJECTIVE_LABELS[c.objective]}</span>
                      {c.totalBudget && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatCurrency(c.totalBudget)}</span>}
                      {c.startDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.startDate).toLocaleDateString('es-MX')}</span>}
                    </div>
                  </div>
                  <div className="text-right text-sm text-[#94A3B8]">
                    <p>{c._count?.entries || 0} entradas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva Campaña">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#94A3B8]">Plataforma</label>
            <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none">
              {PLATFORMS_FOR_ADS.map(p => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#94A3B8]">Objetivo</label>
            <select value={form.objective} onChange={e => setForm({...form, objective: e.target.value})} className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none">
              {OBJECTIVES.map(o => <option key={o} value={o}>{CAMPAIGN_OBJECTIVE_LABELS[o]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Presupuesto diario (MXN)" type="number" value={form.dailyBudget} onChange={e => setForm({...form, dailyBudget: e.target.value})} />
            <Input label="Presupuesto total (MXN)" type="number" value={form.totalBudget} onChange={e => setForm({...form, totalBudget: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            <Input label="Fecha fin" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Creando...' : 'Crear Campaña'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
