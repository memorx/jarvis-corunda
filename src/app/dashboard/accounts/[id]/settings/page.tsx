'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save, Loader2, Sparkles, Plus, X } from 'lucide-react'
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS } from '@/lib/constants'

const ALL_PLATFORMS = Object.keys(PLATFORM_LABELS)
const ALL_CONTENT_TYPES = Object.keys(CONTENT_TYPE_LABELS)

interface AccountSettings {
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
  metaPageId: string | null
  metaAdAccountId: string | null
  googleAdsId: string | null
  tiktokAdAccountId: string | null
  linkedinPageId: string | null
}

export default function AccountSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [account, setAccount] = useState<AccountSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newColor, setNewColor] = useState('#00D9FF')

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

  async function handleSave() {
    if (!account) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: string, value: any) {
    if (!account) return
    setAccount({ ...account, [field]: value })
  }

  function togglePlatform(platform: string) {
    if (!account) return
    const platforms = account.platforms.includes(platform)
      ? account.platforms.filter((p) => p !== platform)
      : [...account.platforms, platform]
    setAccount({ ...account, platforms })
  }

  function toggleContentType(ct: string) {
    if (!account) return
    const contentTypes = account.contentTypes.includes(ct)
      ? account.contentTypes.filter((c) => c !== ct)
      : [...account.contentTypes, ct]
    setAccount({ ...account, contentTypes })
  }

  function addColor() {
    if (!account || account.brandColors.includes(newColor)) return
    setAccount({ ...account, brandColors: [...account.brandColors, newColor] })
  }

  function removeColor(color: string) {
    if (!account) return
    setAccount({ ...account, brandColors: account.brandColors.filter((c) => c !== color) })
  }

  if (loading) {
    return (
      <>
        <Header title="Cargando..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64" />
        </div>
      </>
    )
  }

  if (!account) return null

  return (
    <>
      <Header title={`Configuración — ${account.brandName}`} />
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push(`/dashboard/accounts/${id}`)}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : saved ? (
              <><Save className="h-4 w-4" /> ¡Guardado!</>
            ) : (
              <><Save className="h-4 w-4" /> Guardar Cambios</>
            )}
          </Button>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="name"
                label="Nombre de la cuenta"
                value={account.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
              <Input
                id="brandName"
                label="Nombre de marca"
                value={account.brandName}
                onChange={(e) => updateField('brandName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="industry"
                label="Industria"
                value={account.industry || ''}
                onChange={(e) => updateField('industry', e.target.value)}
              />
              <Input
                id="monthlyBudget"
                label="Presupuesto mensual (MXN)"
                type="number"
                value={account.monthlyBudget || ''}
                onChange={(e) => updateField('monthlyBudget', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
            <Textarea
              id="description"
              label="Descripción"
              value={account.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="¿Qué hace el cliente?"
            />
          </CardContent>
        </Card>

        {/* Brand Identity - AI Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Identidad de Marca (Contexto IA)
            </CardTitle>
            <CardDescription>
              Esta información alimenta a la IA para generar contenido alineado con tu marca. Entre más detallada, mejores resultados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="brandVoice"
              label="Voz de marca"
              placeholder="Describe el tono, personalidad y estilo de escritura de la marca..."
              value={account.brandVoice || ''}
              onChange={(e) => updateField('brandVoice', e.target.value)}
              className="min-h-[100px]"
            />
            <Textarea
              id="targetAudience"
              label="Audiencia objetivo"
              placeholder="Describe en detalle a tu audiencia ideal: edad, ubicación, intereses, nivel socioeconómico..."
              value={account.targetAudience || ''}
              onChange={(e) => updateField('targetAudience', e.target.value)}
              className="min-h-[100px]"
            />
            <Textarea
              id="competitors"
              label="Competidores principales"
              placeholder="¿Quiénes son los competidores directos e indirectos?"
              value={account.competitors || ''}
              onChange={(e) => updateField('competitors', e.target.value)}
            />
            <Textarea
              id="guidelines"
              label="Lineamientos (Do's & Don'ts)"
              placeholder="¿Qué se debe y no se debe hacer en el contenido? Restricciones, palabras clave, estilo visual..."
              value={account.guidelines || ''}
              onChange={(e) => updateField('guidelines', e.target.value)}
              className="min-h-[100px]"
            />
            <Textarea
              id="sampleCopies"
              label="Copies de ejemplo (alto rendimiento)"
              placeholder="Pega aquí copies anteriores que hayan funcionado bien. La IA los usará como referencia de tono."
              value={account.sampleCopies || ''}
              onChange={(e) => updateField('sampleCopies', e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Colores de Marca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {account.brandColors.map((color, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 p-2 pr-3">
                  <div
                    className="h-8 w-8 rounded border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-mono text-[#94A3B8]">{color}</span>
                  <button
                    onClick={() => removeColor(color)}
                    className="text-[#94A3B8] hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer bg-transparent"
              />
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-32"
                placeholder="#000000"
              />
              <Button variant="secondary" size="sm" onClick={addColor}>
                <Plus className="h-4 w-4" /> Agregar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Plataformas</CardTitle>
            <CardDescription>Selecciona las plataformas donde esta cuenta tiene presencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    account.platforms.includes(p)
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-[#94A3B8] border border-white/10 hover:border-white/20'
                  }`}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Contenido</CardTitle>
            <CardDescription>Selecciona los tipos de contenido que necesita la cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALL_CONTENT_TYPES.map((ct) => (
                <button
                  key={ct}
                  onClick={() => toggleContentType(ct)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    account.contentTypes.includes(ct)
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                      : 'bg-white/5 text-[#94A3B8] border border-white/10 hover:border-white/20'
                  }`}
                >
                  {CONTENT_TYPE_LABELS[ct]}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Conexiones de Plataforma</CardTitle>
            <CardDescription>IDs de cuentas publicitarias (se configurarán cuando estén disponibles)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="metaPageId"
                label="Meta Page ID"
                value={account.metaPageId || ''}
                onChange={(e) => updateField('metaPageId', e.target.value)}
                placeholder="Ej: 123456789"
              />
              <Input
                id="metaAdAccountId"
                label="Meta Ad Account ID"
                value={account.metaAdAccountId || ''}
                onChange={(e) => updateField('metaAdAccountId', e.target.value)}
                placeholder="Ej: act_123456789"
              />
              <Input
                id="googleAdsId"
                label="Google Ads ID"
                value={account.googleAdsId || ''}
                onChange={(e) => updateField('googleAdsId', e.target.value)}
                placeholder="Ej: 123-456-7890"
              />
              <Input
                id="tiktokAdAccountId"
                label="TikTok Ad Account ID"
                value={account.tiktokAdAccountId || ''}
                onChange={(e) => updateField('tiktokAdAccountId', e.target.value)}
              />
              <Input
                id="linkedinPageId"
                label="LinkedIn Page ID"
                value={account.linkedinPageId || ''}
                onChange={(e) => updateField('linkedinPageId', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save button bottom */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="h-4 w-4" /> Guardar Todos los Cambios</>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
