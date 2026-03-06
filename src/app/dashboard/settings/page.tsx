'use client'

import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Key, Webhook, Bot } from 'lucide-react'

export default function SettingsPage() {
  return (
    <>
      <Header title="Configuración" />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-cyan-400" />
              API Keys
            </CardTitle>
            <CardDescription>Las claves de API se configuran en las variables de entorno del servidor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-[#94A3B8]" />
                <div>
                  <p className="text-sm font-medium text-[#FAFAFA]">Anthropic (Claude)</p>
                  <p className="text-xs text-[#94A3B8]">Para generación de texto, copies y estrategias</p>
                </div>
              </div>
              <Badge variant={process.env.NEXT_PUBLIC_APP_URL ? 'success' : 'warning'}>
                Configurado en .env
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-[#94A3B8]" />
                <div>
                  <p className="text-sm font-medium text-[#FAFAFA]">OpenAI (DALL-E)</p>
                  <p className="text-xs text-[#94A3B8]">Para generación de imágenes</p>
                </div>
              </div>
              <Badge variant="warning">Configurado en .env</Badge>
            </div>
          </CardContent>
        </Card>

        {/* n8n */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-orange-400" />
              n8n Webhooks
            </CardTitle>
            <CardDescription>Configuración de la conexión con n8n para automatización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="n8n Webhook Base URL"
              value={process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678'}
              readOnly
              disabled
            />
            <p className="text-xs text-[#94A3B8]">
              Los webhooks están configurados en las variables de entorno. Para cambiarlos, actualiza el archivo .env
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#94A3B8]">Webhooks disponibles:</p>
              <div className="space-y-1 text-xs text-[#94A3B8] font-mono">
                <p>POST /api/n8n/campaign-metrics → Actualizar métricas</p>
                <p>POST /api/n8n/campaign-alert → Alertas de rendimiento</p>
                <p>POST /api/n8n/publish-result → Confirmación de publicación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-violet-400" />
              Conexiones de Plataforma
            </CardTitle>
            <CardDescription>Las conexiones con Meta, Google y TikTok se configuran por cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#94A3B8]">
              Para conectar plataformas publicitarias, ve a la configuración de cada cuenta y agrega los IDs correspondientes.
              Los tokens de acceso se configurarán cuando estén disponibles.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
