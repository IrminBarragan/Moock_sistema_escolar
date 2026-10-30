import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface Props {
  icono: LucideIcon
  titulo: string
  descripcion?: ReactNode
  accion?: ReactNode
  className?: string
  compacto?: boolean
}

export function EmptyState({ icono: Icono, titulo, descripcion, accion, className, compacto }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed text-center',
        compacto ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14',
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icono className="size-5" aria-hidden="true" />
      </span>
      <div className="max-w-sm">
        <p className="font-medium">{titulo}</p>
        {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {accion && <div className="mt-1">{accion}</div>}
    </div>
  )
}
