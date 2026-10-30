import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

interface Props {
  titulo: ReactNode
  descripcion?: ReactNode
  acciones?: ReactNode
  regresar?: { to: string; etiqueta: string }
  /** Elemento visual a la izquierda del título (por ejemplo, el ícono de la materia). */
  adorno?: ReactNode
  className?: string
}

export function PageHeader({ titulo, descripcion, acciones, regresar, adorno, className }: Props) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4 sm:mb-8', className)}>
      {regresar && (
        <Link
          to={regresar.to}
          className="-ml-1 inline-flex w-fit items-center gap-1 rounded-md py-1 pr-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {regresar.etiqueta}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {adorno}
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight font-semibold sm:text-[1.75rem]">{titulo}</h1>
            {descripcion && <p className="mt-1.5 text-[0.95rem] text-muted-foreground">{descripcion}</p>}
          </div>
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
      </div>
    </header>
  )
}
