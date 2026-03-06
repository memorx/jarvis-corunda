'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, CalendarDays, Clock } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/constants'

function getStatusVariant(status: string) {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'orange'> = {
    DRAFT: 'secondary',
    INTERNAL_REVIEW: 'warning',
    REVISION: 'error',
    APPROVED_INTERNAL: 'default',
    CLIENT_REVIEW: 'orange',
    CLIENT_REVISION: 'error',
    APPROVED: 'success',
    IN_PRODUCTION: 'default',
    COMPLETED: 'success',
  }
  return map[status] || 'secondary'
}

export default function ParrillasListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: accountId } = use(params)
  const [parrillas, setParrillas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/parrillas?accountId=${accountId}`)
      .then(res => res.json())
      .then(data => setParrillas(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [accountId])

  return (
    <>
      <Header title="Parrillas" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href={`/dashboard/accounts/${accountId}`}>
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" /> Volver a la cuenta
            </Button>
          </Link>
          <Link href={`/dashboard/accounts/${accountId}/parrillas/new`}>
            <Button>
              <Plus className="h-4 w-4" /> Nueva Parrilla
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && parrillas.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-1">Sin parrillas</h3>
            <p className="text-sm text-[#94A3B8] mb-4">Crea tu primera parrilla de contenidos</p>
            <Link href={`/dashboard/accounts/${accountId}/parrillas/new`}>
              <Button><Plus className="h-4 w-4" /> Crear Parrilla</Button>
            </Link>
          </div>
        )}

        {!loading && parrillas.length > 0 && (
          <div className="space-y-3">
            {parrillas.map((p: any) => (
              <Link key={p.id} href={`/dashboard/accounts/${accountId}/parrillas/${p.id}`}>
                <Card className="hover:border-cyan-500/20 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[#FAFAFA]">{p.name}</h3>
                        <p className="text-sm text-[#94A3B8] mt-1">{p.description || 'Sin descripción'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#94A3B8]">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {p._count?.entries || 0} entradas
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(p.createdAt).toLocaleDateString('es-MX')}
                          </span>
                          <span>Por: {p.createdBy?.name}</span>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(p.status)}>
                        {STATUS_LABELS[p.status] || p.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
