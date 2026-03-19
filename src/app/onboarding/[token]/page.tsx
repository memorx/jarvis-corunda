'use client'

import { useState, useEffect, use } from 'react'

type FormData = {
  brandName: string
  industry: string
  description: string
  brandVoice: string
  brandColors: string[]
  targetAudience: string
  competitors: string
  guidelines: string
  sampleCopies: string
  websiteUrl: string
  socialLinks: {
    instagram: string
    facebook: string
    tiktok: string
    linkedin: string
  }
  productInfo: string
  painPoints: string
  differentiators: string
  priceRange: string
  salesProcess: string
}

const VOICE_OPTIONS = [
  'Formal y corporativo',
  'Profesional cercano',
  'Casual y divertido',
  'Tecnico y experto',
  'Inspiracional y motivador',
]

export default function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [newColor, setNewColor] = useState('#00D9FF')
  const [socialNetworks, setSocialNetworks] = useState<string[]>([])

  const [form, setForm] = useState<FormData>({
    brandName: '',
    industry: '',
    description: '',
    brandVoice: '',
    brandColors: [],
    targetAudience: '',
    competitors: '',
    guidelines: '',
    sampleCopies: '',
    websiteUrl: '',
    socialLinks: { instagram: '', facebook: '', tiktok: '', linkedin: '' },
    productInfo: '',
    painPoints: '',
    differentiators: '',
    priceRange: '',
    salesProcess: '',
  })

  useEffect(() => {
    fetchAccount()
  }, [token])

  async function fetchAccount() {
    try {
      const res = await fetch(`/api/onboarding/${token}`)
      if (!res.ok) {
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        throw new Error('Error al cargar')
      }
      const data = await res.json()
      if (data.onboardingStatus === 'COMPLETED') {
        setAlreadyDone(true)
        return
      }
      setForm(prev => ({
        ...prev,
        brandName: data.brandName || '',
        industry: data.industry || '',
        description: data.description || '',
      }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: keyof FormData, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateSocialLink(network: string, value: string) {
    setForm(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [network]: value },
    }))
  }

  function addColor() {
    if (form.brandColors.includes(newColor)) return
    setForm(prev => ({ ...prev, brandColors: [...prev.brandColors, newColor] }))
  }

  function removeColor(color: string) {
    setForm(prev => ({ ...prev, brandColors: prev.brandColors.filter(c => c !== color) }))
  }

  function toggleNetwork(network: string) {
    setSocialNetworks(prev =>
      prev.includes(network) ? prev.filter(n => n !== network) : [...prev, network]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.brandName.trim()) {
      setError('El nombre de la marca es requerido')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/onboarding/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar')
      }
      setCompleted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Enlace no valido</h1>
          <p className="text-gray-500">Este enlace de onboarding no existe o ha expirado. Contacta a tu equipo de Koi para obtener uno nuevo.</p>
        </div>
      </div>
    )
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Formulario completado</h1>
          <p className="text-gray-500">Ya enviaste tu informacion. El equipo de Koi esta trabajando con tus datos.</p>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gracias!</h1>
          <p className="text-gray-500">Tu informacion fue recibida. El equipo de Koi se pondra en contacto contigo pronto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Koi Ads</h1>
              <p className="text-sm text-gray-500">Onboarding de marca</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Intro */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cuentanos sobre tu marca</h2>
          <p className="text-gray-500">Esta informacion nos ayuda a crear contenido que conecte con tu audiencia. Entre mas detalles nos des, mejores resultados obtendremos.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Section 1: Tu marca */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tu marca</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la marca *</label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => updateField('brandName', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industria / giro</label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                placeholder="Ej: Restaurantes, Moda, Tech..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
              <input
                type="url"
                value={form.websiteUrl}
                onChange={(e) => updateField('websiteUrl', e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion breve del negocio</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Que hace tu negocio? Cual es tu propuesta de valor?"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>
        </section>

        {/* Section 2: Tu identidad */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tu identidad</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Como habla tu marca?</label>
            <div className="flex flex-wrap gap-2">
              {VOICE_OPTIONS.map(voice => (
                <button
                  key={voice}
                  type="button"
                  onClick={() => updateField('brandVoice', voice)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    form.brandVoice === voice
                      ? 'bg-cyan-50 text-cyan-700 border-2 border-cyan-500'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {voice}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colores de marca</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.brandColors.map((color, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5">
                  <div className="h-6 w-6 rounded border border-gray-300" style={{ backgroundColor: color }} />
                  <span className="text-sm font-mono text-gray-600">{color}</span>
                  <button type="button" onClick={() => removeColor(color)} className="text-gray-400 hover:text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer" />
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono outline-none focus:border-cyan-500"
              />
              <button type="button" onClick={addColor} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Tu audiencia */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tu audiencia</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quien es tu cliente ideal?</label>
            <textarea
              value={form.targetAudience}
              onChange={(e) => updateField('targetAudience', e.target.value)}
              placeholder="Edad, genero, ubicacion, intereses, nivel socioeconomico..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuales son los problemas/dolores que resuelves?</label>
            <textarea
              value={form.painPoints}
              onChange={(e) => updateField('painPoints', e.target.value)}
              placeholder="Que problema tiene tu cliente que tu resuelves?"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Que te diferencia de la competencia?</label>
            <textarea
              value={form.differentiators}
              onChange={(e) => updateField('differentiators', e.target.value)}
              placeholder="Tu propuesta unica de valor, lo que te hace diferente..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quienes son tus competidores?</label>
            <textarea
              value={form.competitors}
              onChange={(e) => updateField('competitors', e.target.value)}
              placeholder="Nombres de marcas competidoras directas e indirectas..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>
        </section>

        {/* Section 4: Tu contenido */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tu contenido</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Redes sociales activas</label>
            <div className="flex flex-wrap gap-2">
              {['instagram', 'facebook', 'tiktok', 'linkedin'].map(network => (
                <button
                  key={network}
                  type="button"
                  onClick={() => toggleNetwork(network)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                    socialNetworks.includes(network)
                      ? 'bg-cyan-50 text-cyan-700 border-2 border-cyan-500'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {network}
                </button>
              ))}
            </div>
          </div>

          {socialNetworks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialNetworks.map(network => (
                <div key={network}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{network}</label>
                  <input
                    type="text"
                    value={(form.socialLinks as any)[network] || ''}
                    onChange={(e) => updateSocialLink(network, e.target.value)}
                    placeholder={`@tu_${network} o URL`}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copies o textos de ejemplo que te gusten</label>
            <textarea
              value={form.sampleCopies}
              onChange={(e) => updateField('sampleCopies', e.target.value)}
              placeholder="Pega aqui ejemplos de textos publicitarios que te gusten o que hayan funcionado bien..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guidelines o restricciones de marca</label>
            <textarea
              value={form.guidelines}
              onChange={(e) => updateField('guidelines', e.target.value)}
              placeholder="Hay algo que NO debamos decir o hacer? Restricciones de la marca..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>
        </section>

        {/* Section 5: Tu producto */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tu producto</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Describe tu producto o servicio principal</label>
            <textarea
              value={form.productInfo}
              onChange={(e) => updateField('productInfo', e.target.value)}
              placeholder="Que vendes? Como funciona?"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rango de precios</label>
            <input
              type="text"
              value={form.priceRange}
              onChange={(e) => updateField('priceRange', e.target.value)}
              placeholder="Ej: Desde $500 hasta $5,000 MXN"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Como vendes?</label>
            <textarea
              value={form.salesProcess}
              onChange={(e) => updateField('salesProcess', e.target.value)}
              placeholder="Tienda en linea, WhatsApp, tienda fisica, telefono..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !form.brandName.trim()}
            className="rounded-xl bg-cyan-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'Enviando...' : 'Enviar Informacion'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Tus datos son confidenciales y seran usados unicamente para crear contenido para tu marca.
        </p>
      </form>
    </div>
  )
}
