'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Check,
  Calendar,
  FileText,
  Image,
  Eye,
  Send,
  RefreshCw,
  Video,
  Copy,
  Link as LinkIcon,
  CheckCircle,
  BarChart3,
  AlertTriangle,
} from 'lucide-react'
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS } from '@/lib/constants'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'
import { recommendContentMix } from '@/lib/budget-advisor'

const STEPS = [
  { key: 'brief', label: 'Brief', icon: FileText },
  { key: 'strategy', label: 'Estrategia IA', icon: Sparkles },
  { key: 'preview', label: 'Vista Previa', icon: Calendar },
  { key: 'assets', label: 'Assets', icon: Image },
  { key: 'review', label: 'Revisión', icon: Eye },
  { key: 'share', label: 'Compartir', icon: Send },
]

const ALL_PLATFORMS = Object.keys(PLATFORM_LABELS)

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

export default function NewParrillaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: accountId } = use(params)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  // Step 4: Image generation
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({})
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({})
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({})

  // Budget suggestion
  const [suggestedMix, setSuggestedMix] = useState<ReturnType<typeof recommendContentMix> | null>(null)
  const [docCount, setDocCount] = useState<number | null>(null)

  // Step 5/6: Status updates
  const [statusLoading, setStatusLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Step 1: Brief
  const [brief, setBrief] = useState({
    month: new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2,
    year: new Date().getMonth() + 2 > 12 ? new Date().getFullYear() + 1 : new Date().getFullYear(),
    objectives: '',
    platforms: [] as string[],
    contentMix: { staticImages: 8, videos: 4, carousels: 3, stories: 5 },
    isPaid: false,
    specialInstructions: '',
    promotions: '',
    budget: 0,
  })

  // Step 2: Strategy
  const [strategy, setStrategy] = useState<any>(null)

  // Step 3: Generated parrilla
  const [parrillaResult, setParrillaResult] = useState<any>(null)
  const [parrillaEntries, setParrillaEntries] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/accounts/${accountId}/documents`).then(res => res.ok ? res.json() : []).then(docs => setDocCount(Array.isArray(docs) ? docs.filter((d: any) => d.isActive).length : 0)).catch(() => setDocCount(0))
  }, [accountId])

  function togglePlatform(p: string) {
    setBrief(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p],
    }))
  }

  async function generateStrategy() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          month: brief.month,
          year: brief.year,
          objectives: brief.objectives,
          specialInstructions: brief.specialInstructions,
          promotions: brief.promotions,
          isPaid: brief.isPaid,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al generar estrategia')
      }

      const data = await res.json()
      setStrategy(data)
      setCurrentStep(1)
      toast('success', 'Estrategia generada')
    } catch (err: any) {
      setError(err.message)
      toast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function generateFullParrilla() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/generate-parrilla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          ...brief,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al generar parrilla')
      }

      const data = await res.json()
      setParrillaResult(data)

      // Fetch the full parrilla with entries
      const parrillaRes = await fetch(`/api/parrillas/${data.parrillaId}`)
      if (parrillaRes.ok) {
        const parrilla = await parrillaRes.json()
        setParrillaEntries(parrilla.entries || [])
      }

      setCurrentStep(2)
      toast('success', 'Parrilla generada exitosamente')
    } catch (err: any) {
      setError(err.message)
      toast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function generateImage(entryId: string, prompt: string) {
    setGeneratingImages(prev => ({ ...prev, [entryId]: true }))
    setImageErrors(prev => ({ ...prev, [entryId]: '' }))
    try {
      const res = await fetch('/api/ai/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, entryId, size: '1024x1024' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al generar imagen')
      }
      const data = await res.json()
      setGeneratedImages(prev => ({ ...prev, [entryId]: data.url || data.imageUrl || '' }))
      toast('success', 'Imagen generada')
    } catch (err: any) {
      setImageErrors(prev => ({ ...prev, [entryId]: err.message }))
    } finally {
      setGeneratingImages(prev => ({ ...prev, [entryId]: false }))
    }
  }

  async function generateAllImages() {
    const imageEntries = parrillaEntries.filter(
      (e: any) => e.imagePrompt && !['VIDEO_SHORT', 'VIDEO_LONG'].includes(e.contentType)
    )
    for (const entry of imageEntries) {
      if (generatedImages[entry.id]) continue
      await generateImage(entry.id, entry.imagePrompt)
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  async function updateParrillaStatus(status: string) {
    if (!parrillaResult?.parrillaId) return
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/parrillas/${parrillaResult.parrillaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Error al actualizar status')
      toast('success', status === 'INTERNAL_REVIEW' ? 'Enviada a revisión interna' : 'Enviada a revisión de cliente')
    } catch (err: any) {
      toast('error', err.message)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <>
      <Header title="Nueva Parrilla" />
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Back */}
        <Button variant="ghost" onClick={() => router.push(`/dashboard/accounts/${accountId}`)}>
          <ArrowLeft className="h-4 w-4" /> Volver a la cuenta
        </Button>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  i === currentStep
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : i < currentStep
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-[#94A3B8] border border-white/10'
                }`}
              >
                {i < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-4 ${i < currentStep ? 'bg-emerald-500/30' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Step 1: Brief */}
        {currentStep === 0 && (
          <div className="space-y-6">
            {docCount !== null && docCount > 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">{docCount} documentos de contexto activos — la AI conoce al cliente en profundidad</span>
              </div>
            ) : docCount === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-amber-400">Sin documentos de contexto. La generacion sera mas generica.</span>
                <Link href={`/dashboard/accounts/${accountId}/settings`} className="text-xs text-cyan-400 underline ml-auto">Agregar contexto</Link>
              </div>
            ) : null}
            <Card>
              <CardHeader>
                <CardTitle>Brief del Mes</CardTitle>
                <CardDescription>Define los objetivos y parámetros para la parrilla</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#94A3B8]">Mes</label>
                    <select
                      value={brief.month}
                      onChange={(e) => setBrief({ ...brief, month: parseInt(e.target.value) })}
                      className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none"
                    >
                      {MONTHS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    id="year"
                    label="Año"
                    type="number"
                    value={brief.year}
                    onChange={(e) => setBrief({ ...brief, year: parseInt(e.target.value) })}
                  />
                </div>

                <Textarea
                  id="objectives"
                  label="Objetivos del mes"
                  placeholder="¿Qué quieres lograr este mes? Ej: Aumentar awareness, generar leads, promocionar nuevo producto..."
                  value={brief.objectives}
                  onChange={(e) => setBrief({ ...brief, objectives: e.target.value })}
                  className="min-h-[100px]"
                />

                <div>
                  <label className="text-sm font-medium text-[#94A3B8] block mb-2">Plataformas</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PLATFORMS.map(p => (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          brief.platforms.includes(p)
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : 'bg-white/5 text-[#94A3B8] border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {PLATFORM_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#94A3B8] block mb-2">Mix de Contenido</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Input
                      id="staticImages"
                      label="Imágenes"
                      type="number"
                      min={0}
                      value={brief.contentMix.staticImages}
                      onChange={(e) => setBrief({ ...brief, contentMix: { ...brief.contentMix, staticImages: parseInt(e.target.value) || 0 } })}
                    />
                    <Input
                      id="videos"
                      label="Videos"
                      type="number"
                      min={0}
                      value={brief.contentMix.videos}
                      onChange={(e) => setBrief({ ...brief, contentMix: { ...brief.contentMix, videos: parseInt(e.target.value) || 0 } })}
                    />
                    <Input
                      id="carousels"
                      label="Carruseles"
                      type="number"
                      min={0}
                      value={brief.contentMix.carousels}
                      onChange={(e) => setBrief({ ...brief, contentMix: { ...brief.contentMix, carousels: parseInt(e.target.value) || 0 } })}
                    />
                    <Input
                      id="stories"
                      label="Historias"
                      type="number"
                      min={0}
                      value={brief.contentMix.stories}
                      onChange={(e) => setBrief({ ...brief, contentMix: { ...brief.contentMix, stories: parseInt(e.target.value) || 0 } })}
                    />
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-2">
                    Total: {brief.contentMix.staticImages + brief.contentMix.videos + brief.contentMix.carousels + brief.contentMix.stories} piezas
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#94A3B8] block mb-2">
                    Distribucion de Embudo
                  </label>
                  <p className="text-xs text-[#94A3B8] mb-3">
                    Define que porcentaje de artes va para cada etapa. La IA distribuira automaticamente.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-center">
                      <p className="text-xs text-blue-400 font-medium">FRIO (TOFU)</p>
                      <p className="text-[10px] text-[#94A3B8]">Awareness, alcance</p>
                      <p className="text-lg font-bold text-blue-400 mt-1">40%</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                      <p className="text-xs text-amber-400 font-medium">TIBIO (MOFU)</p>
                      <p className="text-[10px] text-[#94A3B8]">Consideracion, engagement</p>
                      <p className="text-lg font-bold text-amber-400 mt-1">35%</p>
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
                      <p className="text-xs text-red-400 font-medium">CALIENTE (BOFU)</p>
                      <p className="text-[10px] text-[#94A3B8]">Conversion, ventas</p>
                      <p className="text-lg font-bold text-red-400 mt-1">25%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[#94A3B8]">¿Es pauta (pagado)?</label>
                  <button
                    onClick={() => setBrief({ ...brief, isPaid: !brief.isPaid })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      brief.isPaid ? 'bg-cyan-500' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        brief.isPaid ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                {brief.isPaid && (
                  <>
                    <Input
                      id="budget"
                      label="Presupuesto total (MXN)"
                      type="number"
                      value={brief.budget || ''}
                      onChange={(e) => {
                        setBrief({ ...brief, budget: parseFloat(e.target.value) || 0 })
                        setSuggestedMix(null)
                      }}
                    />
                    {brief.budget > 0 && (
                      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                        <button
                          type="button"
                          onClick={() => {
                            const suggestion = recommendContentMix(brief.budget, brief.platforms)
                            setSuggestedMix(suggestion)
                          }}
                          className="text-sm text-cyan-400 font-medium flex items-center gap-2"
                        >
                          <Sparkles className="h-4 w-4" /> Sugerir mix segun presupuesto
                        </button>
                        {suggestedMix && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-[#94A3B8]">{suggestedMix.reasoning}</p>
                            <p className="text-sm text-[#FAFAFA]">
                              Sugerencia: {suggestedMix.staticImages} imagenes, {suggestedMix.videos} videos, {suggestedMix.carousels} carruseles, {suggestedMix.stories} stories
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setBrief({
                                  ...brief,
                                  contentMix: {
                                    staticImages: suggestedMix.staticImages,
                                    videos: suggestedMix.videos,
                                    carousels: suggestedMix.carousels,
                                    stories: suggestedMix.stories,
                                  },
                                })
                              }}
                              className="text-xs text-cyan-400 underline"
                            >
                              Aplicar sugerencia
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <Textarea
                  id="promotions"
                  label="Promociones especiales (opcional)"
                  placeholder="Ej: 20% de descuento en marzo, lanzamiento de nuevo producto el 15..."
                  value={brief.promotions}
                  onChange={(e) => setBrief({ ...brief, promotions: e.target.value })}
                />

                <Textarea
                  id="specialInstructions"
                  label="Instrucciones especiales (opcional)"
                  placeholder="Cualquier indicación adicional para la IA..."
                  value={brief.specialInstructions}
                  onChange={(e) => setBrief({ ...brief, specialInstructions: e.target.value })}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={generateStrategy} disabled={loading || !brief.objectives || brief.platforms.length === 0}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generando estrategia...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generar Estrategia</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Strategy */}
        {currentStep === 1 && strategy && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Estrategia Generada por IA
                </CardTitle>
                <CardDescription>Revisa la estrategia y ajústala si es necesario antes de generar la parrilla</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-[#94A3B8] mb-1">Concepto Creativo</h4>
                  <p className="text-[#FAFAFA]">{strategy.creative_concept}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#94A3B8] mb-1">Mensaje Principal</h4>
                  <p className="text-[#FAFAFA]">{strategy.key_message}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Hooks Emocionales</h4>
                  <div className="flex flex-wrap gap-2">
                    {strategy.emotional_hooks?.map((hook: string, i: number) => (
                      <Badge key={i}>{hook}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#94A3B8] mb-1">Dirección Visual</h4>
                  <p className="text-[#FAFAFA]">{strategy.visual_direction}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Pilares de Contenido</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {strategy.content_pillars?.map((pillar: string, i: number) => (
                      <div key={i} className="rounded-lg bg-white/5 p-3 border border-white/5">
                        <p className="text-sm text-[#FAFAFA]">{pillar}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {strategy.hashtags?.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {strategy.selling_angles && strategy.selling_angles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Angulos de Venta</h4>
                    <div className="space-y-2">
                      {strategy.selling_angles.map((sa: any, i: number) => (
                        <div key={i} className="rounded-lg bg-white/5 p-3 border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="orange" className="text-[10px]">{sa.angle}</Badge>
                          </div>
                          <p className="text-sm font-medium text-[#FAFAFA]">{sa.hook}</p>
                          <p className="text-xs text-[#94A3B8] mt-1">{sa.copy_direction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {strategy.campaign_angles && (
                  <div>
                    <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Angulos de Campana</h4>
                    <div className="space-y-2">
                      {strategy.campaign_angles.map((angle: any, i: number) => (
                        <div key={i} className="rounded-lg bg-white/5 p-3 border border-white/5">
                          <p className="font-medium text-[#FAFAFA]">{angle.angle}</p>
                          <p className="text-sm text-[#94A3B8]">{angle.objective}</p>
                          <div className="flex gap-1 mt-1">
                            {angle.platforms?.map((p: string) => (
                              <Badge key={p} variant="secondary" className="text-[10px]">
                                {PLATFORM_LABELS[p] || p}
                              </Badge>
                            ))}
                            {angle.funnelStage && (
                              <Badge
                                variant={
                                  angle.funnelStage === 'TOFU' ? 'default' :
                                  angle.funnelStage === 'MOFU' ? 'warning' : 'error'
                                }
                                className="text-[10px]"
                              >
                                {angle.funnelStage}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {strategy.testing_plan && (
                  <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-3">
                    <h4 className="text-sm font-medium text-cyan-400 mb-1">Plan de Testing</h4>
                    <p className="text-sm text-[#94A3B8]">{strategy.testing_plan}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(0)}>
                <ArrowLeft className="h-4 w-4" /> Volver al Brief
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={generateStrategy} disabled={loading}>
                  <RefreshCw className="h-4 w-4" /> Regenerar
                </Button>
                <Button onClick={generateFullParrilla} disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generando parrilla...</>
                  ) : (
                    <><ArrowRight className="h-4 w-4" /> Generar Parrilla Completa</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parrilla Generada</CardTitle>
                <CardDescription>
                  {parrillaResult?.entriesCreated || 0} de {parrillaResult?.totalPlanned || 0} entradas generadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parrillaEntries.map((entry: any, i: number) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-white/5 bg-white/5 p-4 hover:border-cyan-500/20 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {new Date(entry.publishDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </Badge>
                            <Badge className="text-[10px]">
                              {PLATFORM_LABELS[entry.platform] || entry.platform}
                            </Badge>
                            <Badge variant="orange" className="text-[10px]">
                              {entry.contentType.replace('_', ' ')}
                            </Badge>
                            {entry.funnelStage && (
                              <Badge
                                variant={
                                  entry.funnelStage === 'TOFU' ? 'default' :
                                  entry.funnelStage === 'MOFU' ? 'warning' : 'error'
                                }
                                className="text-[10px]"
                              >
                                {entry.funnelStage === 'TOFU' ? 'Frio' :
                                 entry.funnelStage === 'MOFU' ? 'Tibio' : 'Caliente'}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-[#FAFAFA]">
                            {entry.headline || entry.visualConcept || `Entrada ${i + 1}`}
                          </h4>
                          {entry.primaryText && (
                            <p className="text-sm text-[#94A3B8] mt-1 line-clamp-2">{entry.primaryText}</p>
                          )}
                          {entry.hashtags?.length > 0 && (
                            <p className="text-xs text-cyan-400 mt-2">{entry.hashtags.join(' ')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Volver a Estrategia
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => setCurrentStep(3)}>
                  <ArrowRight className="h-4 w-4" /> Continuar a Assets
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Assets */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-cyan-400" />
                      Generación de Assets
                    </CardTitle>
                    <CardDescription>
                      Revisa los prompts y genera imágenes con DALL-E
                    </CardDescription>
                  </div>
                  <Button
                    onClick={generateAllImages}
                    disabled={parrillaEntries.filter((e: any) => e.imagePrompt && !['VIDEO_SHORT', 'VIDEO_LONG'].includes(e.contentType) && !generatedImages[e.id]).length === 0}
                    size="sm"
                  >
                    <Sparkles className="h-3 w-3" /> Generar Todas las Imágenes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {parrillaEntries.map((entry: any, i: number) => {
                  const isVideo = ['VIDEO_SHORT', 'VIDEO_LONG'].includes(entry.contentType)

                  if (isVideo) {
                    return (
                      <div key={entry.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="h-4 w-4 text-orange-400" />
                          <Badge variant="secondary" className="text-[10px]">
                            {new Date(entry.publishDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </Badge>
                          <Badge variant="orange" className="text-[10px]">Video</Badge>
                        </div>
                        <h4 className="text-sm font-medium text-[#FAFAFA]">
                          {entry.headline || entry.visualConcept || `Entrada ${i + 1}`}
                        </h4>
                        <p className="text-xs text-[#94A3B8] mt-1">Script de video disponible — no se genera imagen</p>
                      </div>
                    )
                  }

                  if (!entry.imagePrompt) {
                    return (
                      <div key={entry.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Image className="h-4 w-4 text-[#94A3B8]" />
                          <Badge variant="secondary" className="text-[10px]">
                            {new Date(entry.publishDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium text-[#FAFAFA]">
                          {entry.headline || entry.visualConcept || `Entrada ${i + 1}`}
                        </h4>
                        <p className="text-xs text-[#94A3B8] mt-1">Sin prompt de imagen</p>
                      </div>
                    )
                  }

                  return (
                    <div key={entry.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-cyan-400" />
                          <Badge variant="secondary" className="text-[10px]">
                            {new Date(entry.publishDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </Badge>
                          <Badge className="text-[10px]">
                            {PLATFORM_LABELS[entry.platform] || entry.platform}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => generateImage(entry.id, entry.imagePrompt)}
                          disabled={!!generatingImages[entry.id] || !!generatedImages[entry.id]}
                        >
                          {generatingImages[entry.id] ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Generando...</>
                          ) : generatedImages[entry.id] ? (
                            <><Check className="h-3 w-3 text-emerald-400" /> Generada</>
                          ) : (
                            <><Sparkles className="h-3 w-3" /> Generar con DALL-E</>
                          )}
                        </Button>
                      </div>
                      <h4 className="text-sm font-medium text-[#FAFAFA]">
                        {entry.headline || entry.visualConcept || `Entrada ${i + 1}`}
                      </h4>
                      <div className="rounded-lg bg-white/5 p-3">
                        <p className="text-xs text-[#94A3B8] font-mono whitespace-pre-wrap">{entry.imagePrompt}</p>
                      </div>
                      {generatedImages[entry.id] && (
                        <div className="rounded-lg overflow-hidden border border-emerald-500/20">
                          <img src={generatedImages[entry.id]} alt="" className="w-full max-h-64 object-cover" />
                        </div>
                      )}
                      {imageErrors[entry.id] && (
                        <p className="text-xs text-red-400">{imageErrors[entry.id]}</p>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-4 w-4" /> Volver
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                <ArrowRight className="h-4 w-4" /> Continuar a Revisión
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-cyan-400" />
                  Revisión Final
                </CardTitle>
                <CardDescription>
                  Resumen de la parrilla generada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(() => {
                    const stats = {
                      images: parrillaEntries.filter((e: any) => e.contentType === 'STATIC_IMAGE' || e.contentType === 'CAROUSEL').length,
                      videos: parrillaEntries.filter((e: any) => ['VIDEO_SHORT', 'VIDEO_LONG'].includes(e.contentType)).length,
                      carousels: parrillaEntries.filter((e: any) => e.contentType === 'CAROUSEL').length,
                      stories: parrillaEntries.filter((e: any) => e.contentType === 'STORY').length,
                    }
                    return (
                      <>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                          <Image className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-[#FAFAFA]">{stats.images}</p>
                          <p className="text-[10px] text-[#94A3B8]">Imágenes</p>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                          <Video className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-[#FAFAFA]">{stats.videos}</p>
                          <p className="text-[10px] text-[#94A3B8]">Videos</p>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                          <BarChart3 className="h-5 w-5 text-violet-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-[#FAFAFA]">{stats.carousels}</p>
                          <p className="text-[10px] text-[#94A3B8]">Carruseles</p>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3 text-center">
                          <Calendar className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-[#FAFAFA]">{stats.stories}</p>
                          <p className="text-[10px] text-[#94A3B8]">Stories</p>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Platforms */}
                <div>
                  <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Plataformas</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(parrillaEntries.map((e: any) => e.platform))].map((p: string) => (
                      <Badge key={p}>{PLATFORM_LABELS[p] || p}</Badge>
                    ))}
                  </div>
                </div>

                {/* Preview of first 3 entries */}
                <div>
                  <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Vista previa</h4>
                  <div className="space-y-2">
                    {parrillaEntries.slice(0, 3).map((entry: any, i: number) => (
                      <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                        {generatedImages[entry.id] ? (
                          <img src={generatedImages[entry.id]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                            {['VIDEO_SHORT', 'VIDEO_LONG'].includes(entry.contentType) ? (
                              <Video className="h-5 w-5 text-orange-400" />
                            ) : (
                              <Image className="h-5 w-5 text-cyan-400" />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#FAFAFA] truncate">
                            {entry.headline || entry.visualConcept || `Entrada ${i + 1}`}
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            {new Date(entry.publishDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} — {PLATFORM_LABELS[entry.platform] || entry.platform}
                          </p>
                        </div>
                      </div>
                    ))}
                    {parrillaEntries.length > 3 && (
                      <p className="text-xs text-[#94A3B8] text-center">
                        +{parrillaEntries.length - 3} entradas más
                      </p>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-[#FAFAFA] font-medium">
                    {parrillaResult?.entriesCreated || parrillaEntries.length} piezas de contenido listas
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="h-4 w-4" /> Volver a Assets
              </Button>
              <div className="flex gap-2">
                {parrillaResult?.parrillaId && (
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/accounts/${accountId}/parrillas/${parrillaResult.parrillaId}`)}
                  >
                    <Eye className="h-4 w-4" /> Ver Parrilla Completa
                  </Button>
                )}
                <Button
                  onClick={async () => {
                    await updateParrillaStatus('INTERNAL_REVIEW')
                    setCurrentStep(5)
                  }}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Enviar a Revisión Interna
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Share */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-cyan-400" />
                  Compartir con Cliente
                </CardTitle>
                <CardDescription>Envía la parrilla al cliente para su revisión</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Send to client review */}
                <div className="rounded-lg bg-white/5 border border-white/10 p-4 space-y-3">
                  <Button
                    onClick={() => updateParrillaStatus('CLIENT_REVIEW')}
                    disabled={statusLoading}
                    className="w-full"
                  >
                    {statusLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar a Revisión de Cliente
                  </Button>
                </div>

                {/* Shareable link */}
                {parrillaResult?.parrillaId && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[#94A3B8]">Link de revisión</h4>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] truncate">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/accounts/{accountId}/parrillas/{parrillaResult.parrillaId}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}/dashboard/accounts/${accountId}/parrillas/${parrillaResult.parrillaId}`
                          navigator.clipboard.writeText(url)
                          setCopied(true)
                          toast('success', '¡Link copiado!')
                          setTimeout(() => setCopied(false), 2000)
                        }}
                      >
                        {copied ? (
                          <><Check className="h-3 w-3 text-emerald-400" /> ¡Copiado!</>
                        ) : (
                          <><Copy className="h-3 w-3" /> Copiar</>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-[#94A3B8]">
                      El cliente debe tener acceso a la plataforma para ver la parrilla
                    </p>
                  </div>
                )}

                {/* Navigate */}
                <div className="flex justify-center gap-3 pt-4 border-t border-white/5">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/accounts/${accountId}`)}
                  >
                    <ArrowLeft className="h-4 w-4" /> Volver a la Cuenta
                  </Button>
                  {parrillaResult?.parrillaId && (
                    <Button
                      onClick={() => router.push(`/dashboard/accounts/${accountId}/parrillas/${parrillaResult.parrillaId}`)}
                    >
                      <Eye className="h-4 w-4" /> Ver Parrilla
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
