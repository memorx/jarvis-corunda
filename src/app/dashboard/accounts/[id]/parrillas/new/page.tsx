'use client'

import { useState, use } from 'react'
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
} from 'lucide-react'
import { PLATFORM_LABELS } from '@/lib/constants'

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
    } catch (err: any) {
      setError(err.message)
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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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
                  <Input
                    id="budget"
                    label="Presupuesto total (MXN)"
                    type="number"
                    value={brief.budget || ''}
                    onChange={(e) => setBrief({ ...brief, budget: parseFloat(e.target.value) || 0 })}
                  />
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

                {strategy.campaign_angles && (
                  <div>
                    <h4 className="text-sm font-medium text-[#94A3B8] mb-2">Ángulos de Campaña</h4>
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
                          </div>
                        </div>
                      ))}
                    </div>
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
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-cyan-400" />
                  Generación de Assets
                </CardTitle>
                <CardDescription>
                  Los prompts de imagen han sido generados. Revísalos antes de generar imágenes con DALL-E.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-[#94A3B8] mb-4">
                    La generación de imágenes con DALL-E se hace por separado para optimizar costos.
                    Revisa y edita los prompts en la vista detallada de la parrilla.
                  </p>
                  <Button onClick={() => setCurrentStep(4)}>
                    <ArrowRight className="h-4 w-4" /> Ir a Revisión
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-4 w-4" /> Volver
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                <ArrowRight className="h-4 w-4" /> Continuar
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
                  Tu parrilla ha sido generada exitosamente. Puedes editarla en la vista detallada.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8 space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#FAFAFA]">¡Parrilla generada!</h3>
                <p className="text-[#94A3B8]">
                  Se generaron {parrillaResult?.entriesCreated || 0} piezas de contenido.
                </p>
                <div className="flex justify-center gap-3">
                  {parrillaResult?.parrillaId && (
                    <Button
                      onClick={() => router.push(`/dashboard/accounts/${accountId}/parrillas/${parrillaResult.parrillaId}`)}
                    >
                      Ver Parrilla Completa
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => setCurrentStep(5)}>
                    <Send className="h-4 w-4" /> Enviar a Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                <CardDescription>Genera un enlace de revisión para compartir con el cliente</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8 space-y-4">
                <p className="text-[#94A3B8]">
                  La funcionalidad de enlace de revisión para clientes estará disponible próximamente.
                  Por ahora, puedes compartir la parrilla desde la vista detallada.
                </p>
                {parrillaResult?.parrillaId && (
                  <Button
                    onClick={() => router.push(`/dashboard/accounts/${accountId}/parrillas/${parrillaResult.parrillaId}`)}
                  >
                    Ir a la Parrilla
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
