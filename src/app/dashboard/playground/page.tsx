'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  FileText,
  Image,
  Video,
  Loader2,
  Copy,
  RefreshCw,
} from 'lucide-react'
import { PLATFORM_LABELS } from '@/lib/constants'

type Tab = 'copy' | 'image' | 'video'

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<Tab>('copy')

  // Copy generator state
  const [copyInput, setCopyInput] = useState({
    accountId: '',
    platform: 'META_FEED',
    contentType: 'STATIC_IMAGE',
    objective: 'awareness',
    concept: '',
  })
  const [copyResult, setCopyResult] = useState<any>(null)
  const [copyLoading, setCopyLoading] = useState(false)

  // Image generator state
  const [imageInput, setImageInput] = useState({
    accountId: '',
    visualConcept: '',
    platform: 'META_FEED',
    aspectRatio: '1:1',
  })
  const [imageResult, setImageResult] = useState<any>(null)
  const [imageLoading, setImageLoading] = useState(false)

  // Video generator state
  const [videoInput, setVideoInput] = useState({
    accountId: '',
    concept: '',
    platform: 'META_REELS',
    duration: '30s',
    objective: 'engagement',
  })
  const [videoResult, setVideoResult] = useState<any>(null)
  const [videoLoading, setVideoLoading] = useState(false)

  async function generateCopy() {
    setCopyLoading(true)
    setCopyResult(null)
    try {
      const res = await fetch('/api/ai/generate-copies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyInput),
      })
      const data = await res.json()
      if (res.ok) setCopyResult(data)
      else setCopyResult({ error: data.error })
    } catch (err: any) {
      setCopyResult({ error: err.message })
    } finally {
      setCopyLoading(false)
    }
  }

  async function generateImagePrompt() {
    setImageLoading(true)
    setImageResult(null)
    try {
      const res = await fetch('/api/ai/generate-image-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageInput),
      })
      const data = await res.json()
      if (res.ok) setImageResult(data)
      else setImageResult({ error: data.error })
    } catch (err: any) {
      setImageResult({ error: err.message })
    } finally {
      setImageLoading(false)
    }
  }

  async function generateVideoScript() {
    setVideoLoading(true)
    setVideoResult(null)
    try {
      const res = await fetch('/api/ai/generate-video-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoInput),
      })
      const data = await res.json()
      if (res.ok) setVideoResult(data)
      else setVideoResult({ error: data.error })
    } catch (err: any) {
      setVideoResult({ error: err.message })
    } finally {
      setVideoLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  const tabs = [
    { key: 'copy', label: 'Generador de Copies', icon: FileText },
    { key: 'image', label: 'Prompts de Imagen', icon: Image },
    { key: 'video', label: 'Guiones de Video', icon: Video },
  ] as const

  return (
    <>
      <Header title="AI Playground" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          <p className="text-[#94A3B8]">Genera contenido rápido sin crear una parrilla completa</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-[#94A3B8] hover:text-[#FAFAFA]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Copy Generator */}
        {activeTab === 'copy' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generador de Copies</CardTitle>
                <CardDescription>Genera copies para cualquier plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="ID de Cuenta (opcional)"
                  placeholder="Deja vacío para copy genérico"
                  value={copyInput.accountId}
                  onChange={e => setCopyInput({...copyInput, accountId: e.target.value})}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#94A3B8]">Plataforma</label>
                  <select
                    value={copyInput.platform}
                    onChange={e => setCopyInput({...copyInput, platform: e.target.value})}
                    className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none"
                  >
                    {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Objetivo"
                  placeholder="awareness, engagement, conversions..."
                  value={copyInput.objective}
                  onChange={e => setCopyInput({...copyInput, objective: e.target.value})}
                />
                <Textarea
                  label="Concepto / Idea"
                  placeholder="Describe qué quieres comunicar..."
                  value={copyInput.concept}
                  onChange={e => setCopyInput({...copyInput, concept: e.target.value})}
                  className="min-h-[100px]"
                />
                <Button onClick={generateCopy} disabled={copyLoading || !copyInput.concept} className="w-full">
                  {copyLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generando...</> : <><Sparkles className="h-4 w-4" /> Generar Copy</>}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                {!copyResult && !copyLoading && (
                  <div className="text-center py-12 text-[#94A3B8]">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Los copies generados aparecerán aquí</p>
                  </div>
                )}
                {copyResult?.error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                    <p className="text-sm text-red-400">{copyResult.error}</p>
                  </div>
                )}
                {copyResult && !copyResult.error && (
                  <div className="space-y-4">
                    {copyResult.headline && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-[#94A3B8]">Titular</label>
                          <button onClick={() => copyToClipboard(copyResult.headline)} className="text-[#94A3B8] hover:text-cyan-400"><Copy className="h-3 w-3" /></button>
                        </div>
                        <p className="text-[#FAFAFA] bg-white/5 rounded-lg p-3 text-sm">{copyResult.headline}</p>
                      </div>
                    )}
                    {copyResult.primaryText && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-[#94A3B8]">Texto Principal</label>
                          <button onClick={() => copyToClipboard(copyResult.primaryText)} className="text-[#94A3B8] hover:text-cyan-400"><Copy className="h-3 w-3" /></button>
                        </div>
                        <p className="text-[#FAFAFA] bg-white/5 rounded-lg p-3 text-sm">{copyResult.primaryText}</p>
                      </div>
                    )}
                    {copyResult.description && (
                      <div>
                        <label className="text-xs font-medium text-[#94A3B8]">Descripción</label>
                        <p className="text-[#FAFAFA] bg-white/5 rounded-lg p-3 text-sm mt-1">{copyResult.description}</p>
                      </div>
                    )}
                    {copyResult.ctaText && (
                      <div>
                        <label className="text-xs font-medium text-[#94A3B8]">CTA</label>
                        <Badge className="ml-2">{copyResult.ctaText}</Badge>
                      </div>
                    )}
                    {copyResult.hashtags && (
                      <div>
                        <label className="text-xs font-medium text-[#94A3B8]">Hashtags</label>
                        <p className="text-cyan-400 text-sm mt-1">{copyResult.hashtags.join(' ')}</p>
                      </div>
                    )}
                    {copyResult.reasoning && (
                      <div className="border-t border-white/5 pt-3">
                        <label className="text-xs font-medium text-[#94A3B8]">Razonamiento IA</label>
                        <p className="text-xs text-[#94A3B8] mt-1">{copyResult.reasoning}</p>
                      </div>
                    )}
                    <Button variant="secondary" onClick={generateCopy} disabled={copyLoading} className="w-full">
                      <RefreshCw className="h-4 w-4" /> Regenerar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Image Prompt Generator */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generador de Prompts de Imagen</CardTitle>
                <CardDescription>Genera prompts optimizados para DALL-E</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="ID de Cuenta (opcional)"
                  value={imageInput.accountId}
                  onChange={e => setImageInput({...imageInput, accountId: e.target.value})}
                />
                <Textarea
                  label="Concepto Visual"
                  placeholder="Describe qué quieres ver en la imagen..."
                  value={imageInput.visualConcept}
                  onChange={e => setImageInput({...imageInput, visualConcept: e.target.value})}
                  className="min-h-[100px]"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#94A3B8]">Plataforma</label>
                    <select value={imageInput.platform} onChange={e => setImageInput({...imageInput, platform: e.target.value})} className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none">
                      {Object.entries(PLATFORM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#94A3B8]">Aspect Ratio</label>
                    <select value={imageInput.aspectRatio} onChange={e => setImageInput({...imageInput, aspectRatio: e.target.value})} className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none">
                      <option value="1:1">1:1 (Cuadrado)</option>
                      <option value="4:5">4:5 (Portrait)</option>
                      <option value="9:16">9:16 (Stories/Reels)</option>
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="1.91:1">1.91:1 (Link Ad)</option>
                    </select>
                  </div>
                </div>
                <Button onClick={generateImagePrompt} disabled={imageLoading || !imageInput.visualConcept} className="w-full">
                  {imageLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generando...</> : <><Image className="h-4 w-4" /> Generar Prompt</>}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                {!imageResult && !imageLoading && (
                  <div className="text-center py-12 text-[#94A3B8]">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>El prompt generado aparecerá aquí</p>
                  </div>
                )}
                {imageResult?.error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                    <p className="text-sm text-red-400">{imageResult.error}</p>
                  </div>
                )}
                {imageResult && !imageResult.error && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-[#94A3B8]">Prompt (DALL-E)</label>
                        <button onClick={() => copyToClipboard(imageResult.prompt)} className="text-[#94A3B8] hover:text-cyan-400"><Copy className="h-3 w-3" /></button>
                      </div>
                      <p className="text-[#FAFAFA] bg-white/5 rounded-lg p-3 text-sm font-mono">{imageResult.prompt}</p>
                    </div>
                    {imageResult.style && <div><label className="text-xs font-medium text-[#94A3B8]">Estilo</label><Badge className="ml-2">{imageResult.style}</Badge></div>}
                    {imageResult.textOverlaySuggestion && <div><label className="text-xs font-medium text-[#94A3B8]">Texto sugerido para overlay</label><p className="text-sm text-[#FAFAFA] mt-1">{imageResult.textOverlaySuggestion}</p></div>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Video Script Generator */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generador de Guiones de Video</CardTitle>
                <CardDescription>Crea guiones escena por escena</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="ID de Cuenta (opcional)" value={videoInput.accountId} onChange={e => setVideoInput({...videoInput, accountId: e.target.value})} />
                <Textarea label="Concepto del Video" placeholder="¿De qué trata el video?" value={videoInput.concept} onChange={e => setVideoInput({...videoInput, concept: e.target.value})} className="min-h-[100px]" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#94A3B8]">Plataforma</label>
                    <select value={videoInput.platform} onChange={e => setVideoInput({...videoInput, platform: e.target.value})} className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none">
                      <option value="META_REELS">Meta Reels</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="YOUTUBE_SHORTS">YouTube Shorts</option>
                      <option value="META_STORIES">Meta Stories</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#94A3B8]">Duración</label>
                    <select value={videoInput.duration} onChange={e => setVideoInput({...videoInput, duration: e.target.value})} className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none">
                      <option value="15s">15 segundos</option>
                      <option value="30s">30 segundos</option>
                      <option value="60s">60 segundos</option>
                    </select>
                  </div>
                  <Input label="Objetivo" value={videoInput.objective} onChange={e => setVideoInput({...videoInput, objective: e.target.value})} />
                </div>
                <Button onClick={generateVideoScript} disabled={videoLoading || !videoInput.concept} className="w-full">
                  {videoLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generando...</> : <><Video className="h-4 w-4" /> Generar Guión</>}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Resultado</CardTitle></CardHeader>
              <CardContent>
                {!videoResult && !videoLoading && (
                  <div className="text-center py-12 text-[#94A3B8]">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>El guión generado aparecerá aquí</p>
                  </div>
                )}
                {videoResult?.error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4"><p className="text-sm text-red-400">{videoResult.error}</p></div>}
                {videoResult?.variants && (
                  <div className="space-y-6">
                    {videoResult.variants.map((variant: any, vi: number) => (
                      <div key={vi} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={variant.style === 'produced' ? 'default' : 'orange'}>
                            {variant.style === 'produced' ? 'Producido' : 'UGC/Nativo'}
                          </Badge>
                        </div>
                        <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-3">
                          <label className="text-xs font-medium text-orange-400">HOOK</label>
                          <p className="text-sm text-[#FAFAFA] mt-1">{variant.hook}</p>
                        </div>
                        {variant.scenes?.map((scene: any, si: number) => (
                          <div key={si} className="rounded-lg bg-white/5 p-3 text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-[10px]">{scene.timestamp}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{scene.transition}</Badge>
                            </div>
                            <p className="text-[#FAFAFA]"><strong>Visual:</strong> {scene.visual}</p>
                            <p className="text-[#94A3B8]"><strong>Audio:</strong> {scene.audio}</p>
                            {scene.textOverlay && <p className="text-cyan-400"><strong>Texto:</strong> {scene.textOverlay}</p>}
                          </div>
                        ))}
                        {variant.musicSuggestion && <p className="text-xs text-[#94A3B8]">🎵 {variant.musicSuggestion}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
