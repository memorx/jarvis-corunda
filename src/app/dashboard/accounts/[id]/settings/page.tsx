'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save, Loader2, Sparkles, Plus, X, Link as LinkIcon, Copy, Check, FileText, Database, Trash2, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS } from '@/lib/constants'

const ALL_PLATFORMS = Object.keys(PLATFORM_LABELS)
const ALL_CONTENT_TYPES = Object.keys(CONTENT_TYPE_LABELS)

const DOC_TYPE_LABELS: Record<string, string> = {
  kickoff: 'Reunion de Kickoff',
  audit: 'Auditoria de Resenas',
  strategy: 'Estrategia',
  dossier: 'Dossier de Marketing',
  brief: 'Brief Creativo',
  research: 'Investigacion',
  other: 'Otro',
}

const DOC_TYPE_OPTIONS = [
  { value: 'kickoff', label: 'Reunion de Kickoff' },
  { value: 'audit', label: 'Auditoria de Resenas' },
  { value: 'strategy', label: 'Estrategia' },
  { value: 'dossier', label: 'Dossier de Marketing' },
  { value: 'brief', label: 'Brief Creativo' },
  { value: 'research', label: 'Investigacion' },
  { value: 'other', label: 'Otro' },
]

function getDocTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    kickoff: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    audit: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    strategy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dossier: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    brief: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    research: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    other: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  }
  return classes[type] || classes.other
}

interface AccountDocument {
  id: string
  title: string
  type: string
  charCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  uploadedBy: { name: string } | null
}

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
  websiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  tiktokUrl: string | null
  linkedinUrl: string | null
  painPoints: string | null
  differentiators: string | null
  productInfo: string | null
  priceRange: string | null
  salesProcess: string | null
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export default function AccountSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [account, setAccount] = useState<AccountSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newColor, setNewColor] = useState('#00D9FF')
  const [onboardingUrl, setOnboardingUrl] = useState('')
  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [documents, setDocuments] = useState<AccountDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [showDocModal, setShowDocModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState<{ id: string; content: string } | null>(null)
  const [newDoc, setNewDoc] = useState({ title: '', type: 'kickoff', content: '' })
  const [savingDoc, setSavingDoc] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<{ id: string; title: string; content: string; type: string } | null>(null)

  useEffect(() => { fetchAccount(); fetchDocuments() }, [id])

  async function fetchAccount() {
    try {
      const res = await fetch(`/api/accounts/${id}`)
      if (!res.ok) throw new Error('Not found')
      setAccount(await res.json())
    } catch (error) { console.error('Error:', error) } finally { setLoading(false) }
  }

  async function fetchDocuments() {
    setDocsLoading(true)
    try {
      const res = await fetch(`/api/accounts/${id}/documents`)
      if (res.ok) setDocuments(await res.json())
    } catch (error) { console.error('Error fetching documents:', error) } finally { setDocsLoading(false) }
  }

  async function handleSave() {
    if (!account) return
    setSaving(true); setSaved(false)
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(account) })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } catch (error) { console.error('Error saving:', error) } finally { setSaving(false) }
  }

  async function handleSaveDocument() {
    if (!newDoc.title || !newDoc.content) return
    setSavingDoc(true)
    try {
      if (editingDoc) {
        const res = await fetch(`/api/accounts/${id}/documents/${editingDoc.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newDoc.title, type: newDoc.type, content: newDoc.content }) })
        if (res.ok) { setShowDocModal(false); setEditingDoc(null); setNewDoc({ title: '', type: 'kickoff', content: '' }); fetchDocuments() }
      } else {
        const res = await fetch(`/api/accounts/${id}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDoc) })
        if (res.ok) { setShowDocModal(false); setNewDoc({ title: '', type: 'kickoff', content: '' }); fetchDocuments() }
      }
    } catch (error) { console.error('Error saving document:', error) } finally { setSavingDoc(false) }
  }

  async function handleToggleDocument(docId: string, isActive: boolean) {
    try { await fetch(`/api/accounts/${id}/documents/${docId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) }); fetchDocuments() } catch (error) { console.error('Error toggling document:', error) }
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm('Eliminar este documento permanentemente?')) return
    try { await fetch(`/api/accounts/${id}/documents/${docId}`, { method: 'DELETE' }); fetchDocuments() } catch (error) { console.error('Error deleting document:', error) }
  }

  async function handleViewDocument(docId: string) {
    try { const res = await fetch(`/api/accounts/${id}/documents/${docId}`); if (res.ok) { const data = await res.json(); setViewingDoc({ id: data.id, title: data.title, content: data.content, type: data.type }) } } catch (error) { console.error('Error fetching document:', error) }
  }

  async function handleEditDocument(docId: string) {
    try { const res = await fetch(`/api/accounts/${id}/documents/${docId}`); if (res.ok) { const data = await res.json(); setEditingDoc({ id: data.id, content: data.content }); setNewDoc({ title: data.title, type: data.type, content: data.content }); setShowDocModal(true) } } catch (error) { console.error('Error fetching document for edit:', error) }
  }

  function updateField(field: string, value: any) { if (!account) return; setAccount({ ...account, [field]: value }) }
  function togglePlatform(platform: string) { if (!account) return; const platforms = account.platforms.includes(platform) ? account.platforms.filter((p) => p !== platform) : [...account.platforms, platform]; setAccount({ ...account, platforms }) }
  function toggleContentType(ct: string) { if (!account) return; const contentTypes = account.contentTypes.includes(ct) ? account.contentTypes.filter((c) => c !== ct) : [...account.contentTypes, ct]; setAccount({ ...account, contentTypes }) }
  function addColor() { if (!account || account.brandColors.includes(newColor)) return; setAccount({ ...account, brandColors: [...account.brandColors, newColor] }) }
  function removeColor(color: string) { if (!account) return; setAccount({ ...account, brandColors: account.brandColors.filter((c) => c !== color) }) }

  if (loading) return (<><Header title="Cargando..." /><div className="p-6 space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div></>)
  if (!account) return null

  const activeDocCount = documents.filter(d => d.isActive).length
  const totalDocChars = documents.filter(d => d.isActive).reduce((sum, d) => sum + d.charCount, 0)

  return (
    <>
      <Header title={`Configuracion - ${account.brandName}`} />
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push(`/dashboard/accounts/${id}`)}><ArrowLeft className="h-4 w-4" /> Volver</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : saved ? <><Save className="h-4 w-4" /> Guardado!</> : <><Save className="h-4 w-4" /> Guardar Cambios</>}
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Informacion Basica</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input id="name" label="Nombre de la cuenta" value={account.name} onChange={(e) => updateField('name', e.target.value)} />
              <Input id="brandName" label="Nombre de marca" value={account.brandName} onChange={(e) => updateField('brandName', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="industry" label="Industria" value={account.industry || ''} onChange={(e) => updateField('industry', e.target.value)} />
              <Input id="monthlyBudget" label="Presupuesto mensual (MXN)" type="number" value={account.monthlyBudget || ''} onChange={(e) => updateField('monthlyBudget', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            <Textarea id="description" label="Descripcion" value={account.description || ''} onChange={(e) => updateField('description', e.target.value)} placeholder="Que hace el cliente?" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-cyan-400" />Identidad de Marca (Contexto IA)</CardTitle>
            <CardDescription>Esta informacion alimenta a la IA para generar contenido alineado con tu marca. Entre mas detallada, mejores resultados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea id="brandVoice" label="Voz de marca" placeholder="Describe el tono, personalidad y estilo de escritura de la marca..." value={account.brandVoice || ''} onChange={(e) => updateField('brandVoice', e.target.value)} className="min-h-[100px]" />
            <Textarea id="targetAudience" label="Audiencia objetivo" placeholder="Describe en detalle a tu audiencia ideal..." value={account.targetAudience || ''} onChange={(e) => updateField('targetAudience', e.target.value)} className="min-h-[100px]" />
            <Textarea id="competitors" label="Competidores principales" placeholder="Quienes son los competidores directos e indirectos?" value={account.competitors || ''} onChange={(e) => updateField('competitors', e.target.value)} />
            <Textarea id="guidelines" label="Lineamientos (Do's & Don'ts)" placeholder="Que se debe y no se debe hacer en el contenido?" value={account.guidelines || ''} onChange={(e) => updateField('guidelines', e.target.value)} className="min-h-[100px]" />
            <Textarea id="sampleCopies" label="Copies de ejemplo (alto rendimiento)" placeholder="Pega aqui copies anteriores que hayan funcionado bien." value={account.sampleCopies || ''} onChange={(e) => updateField('sampleCopies', e.target.value)} className="min-h-[100px]" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-cyan-400" />Knowledge Base</CardTitle>
            <CardDescription>Documentos de contexto que enriquecen la generacion de contenido AI. Sube transcripciones de reuniones, auditorias, estrategias, briefs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Database className="h-3 w-3" />{activeDocCount} documentos activos · {formatNumber(totalDocChars)} caracteres de contexto
              </div>
            )}
            {docsLoading ? (
              <div className="space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
            ) : documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className={`flex items-center justify-between rounded-lg border p-3 transition-all ${doc.isActive ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02] opacity-60'}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#FAFAFA] truncate">{doc.title}</span>
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${getDocTypeBadgeClass(doc.type)}`}>{DOC_TYPE_LABELS[doc.type] || doc.type}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#94A3B8]">
                          <span>{formatNumber(doc.charCount)} chars</span><span>·</span><span>{new Date(doc.createdAt).toLocaleDateString('es-MX')}</span>
                          {doc.uploadedBy && <><span>·</span><span>{doc.uploadedBy.name}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => handleViewDocument(doc.id)} className="p-1.5 rounded-md hover:bg-white/10 text-[#94A3B8] hover:text-[#FAFAFA] transition-colors" title="Ver documento"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEditDocument(doc.id)} className="p-1.5 rounded-md hover:bg-white/10 text-[#94A3B8] hover:text-[#FAFAFA] transition-colors" title="Editar"><FileText className="h-4 w-4" /></button>
                      <button onClick={() => handleToggleDocument(doc.id, doc.isActive)} className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${doc.isActive ? 'text-emerald-400 hover:text-amber-400' : 'text-[#94A3B8] hover:text-emerald-400'}`} title={doc.isActive ? 'Desactivar' : 'Activar'}>{doc.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                      <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-[#94A3B8] hover:text-red-400 transition-colors" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#94A3B8] text-sm">Sin documentos de contexto. Agrega transcripciones, auditorias o estrategias para mejorar la generacion AI.</div>
            )}
            <Button variant="secondary" onClick={() => { setEditingDoc(null); setNewDoc({ title: '', type: 'kickoff', content: '' }); setShowDocModal(true) }}><Plus className="h-4 w-4" /> Agregar Documento</Button>
          </CardContent>
        </Card>

        {showDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0F0F23] p-6 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#FAFAFA]">{editingDoc ? 'Editar Documento' : 'Nuevo Documento de Contexto'}</h3>
                <button onClick={() => { setShowDocModal(false); setEditingDoc(null) }} className="text-[#94A3B8] hover:text-[#FAFAFA]"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <Input id="docTitle" label="Titulo" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} placeholder="Ej: Kickoff Hotel Boutique - Marzo 2025" />
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Tipo de documento</label>
                  <select value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })} className="w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-500 focus:outline-none">
                    {DOC_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Contenido</label>
                  <textarea value={newDoc.content} onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })} placeholder="Pega aqui la transcripcion, el analisis, o cualquier documento de contexto..." className="w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] placeholder:text-[#94A3B8]/50 focus:border-cyan-500 focus:outline-none min-h-[300px] resize-y" />
                  <div className="text-xs text-[#94A3B8] mt-1">
                    {newDoc.content.length > 0 && `${formatNumber(newDoc.content.length)} caracteres`}
                    {newDoc.content.length > 3000 && ' · Se generara un resumen automatico'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => { setShowDocModal(false); setEditingDoc(null) }}>Cancelar</Button>
                <Button onClick={handleSaveDocument} disabled={savingDoc || !newDoc.title || !newDoc.content}>
                  {savingDoc ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> {editingDoc ? 'Actualizar' : 'Guardar'}</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {viewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0F0F23] p-6 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#FAFAFA]">{viewingDoc.title}</h3>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium mt-1 ${getDocTypeBadgeClass(viewingDoc.type)}`}>{DOC_TYPE_LABELS[viewingDoc.type] || viewingDoc.type}</span>
                </div>
                <button onClick={() => setViewingDoc(null)} className="text-[#94A3B8] hover:text-[#FAFAFA]"><X className="h-5 w-5" /></button>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#1A1A2E] p-4 text-sm text-[#FAFAFA]/80 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">{viewingDoc.content}</div>
              <div className="flex justify-end mt-4"><Button variant="ghost" onClick={() => setViewingDoc(null)}>Cerrar</Button></div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Presencia Digital</CardTitle><CardDescription>URLs de la marca en internet y redes sociales</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Input id="websiteUrl" label="Sitio web" type="url" value={account.websiteUrl || ''} onChange={(e) => updateField('websiteUrl', e.target.value || null)} placeholder="https://www.tumarca.com" />
            <div className="grid grid-cols-2 gap-4">
              <Input id="instagramUrl" label="Instagram" type="url" value={account.instagramUrl || ''} onChange={(e) => updateField('instagramUrl', e.target.value || null)} placeholder="https://instagram.com/tumarca" />
              <Input id="facebookUrl" label="Facebook" type="url" value={account.facebookUrl || ''} onChange={(e) => updateField('facebookUrl', e.target.value || null)} placeholder="https://facebook.com/tumarca" />
              <Input id="tiktokUrl" label="TikTok" type="url" value={account.tiktokUrl || ''} onChange={(e) => updateField('tiktokUrl', e.target.value || null)} placeholder="https://tiktok.com/@tumarca" />
              <Input id="linkedinUrl" label="LinkedIn" type="url" value={account.linkedinUrl || ''} onChange={(e) => updateField('linkedinUrl', e.target.value || null)} placeholder="https://linkedin.com/company/tumarca" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-cyan-400" />Contexto Comercial</CardTitle>
            <CardDescription>Esta informacion enriquece los prompts de IA para generar copies mas efectivos y orientados a ventas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea id="productInfo" label="Que vende?" placeholder="Describe tu producto o servicio principal..." value={account.productInfo || ''} onChange={(e) => updateField('productInfo', e.target.value || null)} className="min-h-[100px]" />
            <Input id="priceRange" label="Rango de precios" value={account.priceRange || ''} onChange={(e) => updateField('priceRange', e.target.value || null)} placeholder="Ej: Desde $500 hasta $5,000 MXN" />
            <Textarea id="painPoints" label="Que problemas resuelve?" placeholder="Que problema tiene tu cliente que tu producto/servicio resuelve?" value={account.painPoints || ''} onChange={(e) => updateField('painPoints', e.target.value || null)} className="min-h-[100px]" />
            <Textarea id="differentiators" label="Que lo hace diferente?" placeholder="Propuesta unica de valor..." value={account.differentiators || ''} onChange={(e) => updateField('differentiators', e.target.value || null)} className="min-h-[100px]" />
            <Textarea id="salesProcess" label="Como vende?" placeholder="Tienda en linea, WhatsApp, tienda fisica, telefono, etc." value={account.salesProcess || ''} onChange={(e) => updateField('salesProcess', e.target.value || null)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Colores de Marca</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {account.brandColors.map((color, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 p-2 pr-3">
                  <div className="h-8 w-8 rounded border border-white/20" style={{ backgroundColor: color }} />
                  <span className="text-sm font-mono text-[#94A3B8]">{color}</span>
                  <button onClick={() => removeColor(color)} className="text-[#94A3B8] hover:text-red-400 transition-colors"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer bg-transparent" />
              <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-32" placeholder="#000000" />
              <Button variant="secondary" size="sm" onClick={addColor}><Plus className="h-4 w-4" /> Agregar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Plataformas</CardTitle><CardDescription>Selecciona las plataformas donde esta cuenta tiene presencia</CardDescription></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => (
                <button key={p} onClick={() => togglePlatform(p)} className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${account.platforms.includes(p) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-[#94A3B8] border border-white/10 hover:border-white/20'}`}>{PLATFORM_LABELS[p]}</button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tipos de Contenido</CardTitle><CardDescription>Selecciona los tipos de contenido que necesita la cuenta</CardDescription></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALL_CONTENT_TYPES.map((ct) => (
                <button key={ct} onClick={() => toggleContentType(ct)} className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${account.contentTypes.includes(ct) ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-[#94A3B8] border border-white/10 hover:border-white/20'}`}>{CONTENT_TYPE_LABELS[ct]}</button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Conexiones de Plataforma</CardTitle><CardDescription>IDs de cuentas publicitarias</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input id="metaPageId" label="Meta Page ID" value={account.metaPageId || ''} onChange={(e) => updateField('metaPageId', e.target.value)} placeholder="Ej: 123456789" />
              <Input id="metaAdAccountId" label="Meta Ad Account ID" value={account.metaAdAccountId || ''} onChange={(e) => updateField('metaAdAccountId', e.target.value)} placeholder="Ej: act_123456789" />
              <Input id="googleAdsId" label="Google Ads ID" value={account.googleAdsId || ''} onChange={(e) => updateField('googleAdsId', e.target.value)} placeholder="Ej: 123-456-7890" />
              <Input id="tiktokAdAccountId" label="TikTok Ad Account ID" value={account.tiktokAdAccountId || ''} onChange={(e) => updateField('tiktokAdAccountId', e.target.value)} />
              <Input id="linkedinPageId" label="LinkedIn Page ID" value={account.linkedinPageId || ''} onChange={(e) => updateField('linkedinPageId', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5 text-cyan-400" />Onboarding de Cliente</CardTitle>
            <CardDescription>Genera un enlace para que tu cliente llene su informacion de marca</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingUrl ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] truncate">{onboardingUrl}</div>
                  <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(onboardingUrl); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000) }}>
                    {linkCopied ? <><Check className="h-3 w-3 text-emerald-400" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar</>}
                  </Button>
                </div>
                {onboardingStatus && <Badge variant={onboardingStatus === 'COMPLETED' ? 'success' : 'warning'}>{onboardingStatus === 'COMPLETED' ? 'Completado' : 'Pendiente'}</Badge>}
              </div>
            ) : (
              <Button onClick={async () => { setGeneratingLink(true); try { const res = await fetch(`/api/accounts/${id}/onboarding`, { method: 'POST' }); if (!res.ok) throw new Error('Error'); const data = await res.json(); setOnboardingUrl(data.url); setOnboardingStatus('PENDING') } catch {} finally { setGeneratingLink(false) } }} disabled={generatingLink}>
                {generatingLink ? <><Loader2 className="h-4 w-4 animate-spin" /> Generando...</> : <><LinkIcon className="h-4 w-4" /> Generar Link de Onboarding</>}
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> Guardar Todos los Cambios</>}
          </Button>
        </div>
      </div>
    </>
  )
}
