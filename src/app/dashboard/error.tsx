'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="rounded-full bg-red-500/10 p-4">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#FAFAFA]">Algo salio mal</h2>
        <p className="mt-1 text-sm text-[#94A3B8] max-w-md">
          Ocurrio un error inesperado. Puedes intentar recargar la pagina.
        </p>
      </div>
      <Button onClick={reset} variant="secondary">
        Intentar de nuevo
      </Button>
    </div>
  )
}
