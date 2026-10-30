import { RotateCw, WifiOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ApiError } from '@/types'

interface Props {
  error: unknown
  onReintentar?: () => void
  className?: string
}

export function ErrorState({ error, onReintentar, className }: Props) {
  const titulo = error instanceof ApiError ? error.title : 'Algo salió mal'
  const detalle =
    error instanceof ApiError ? error.detail : 'No pudimos cargar esta información. Inténtalo de nuevo en unos segundos.'
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-12 text-center', className)}>
      <span className="flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <WifiOff className="size-5" aria-hidden="true" />
      </span>
      <div className="max-w-sm">
        <p className="font-medium">{titulo}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detalle}</p>
      </div>
      {onReintentar && (
        <Button variant="outline" onClick={onReintentar} className="mt-1">
          <RotateCw aria-hidden="true" />
          Reintentar
        </Button>
      )}
    </div>
  )
}
