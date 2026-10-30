import { Megaphone, Pin } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { MateriaPunto } from '@/components/shared/materia-icono'
import { Badge } from '@/components/ui/badge'
import { haceTiempo } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AvisoVista } from '@/types'

interface Props {
  avisos: AvisoVista[]
  mostrarOrigen?: boolean
  limite?: number
  className?: string
}

export function ListaAvisos({ avisos, mostrarOrigen, limite, className }: Props) {
  const lista = limite ? avisos.slice(0, limite) : avisos
  if (lista.length === 0) {
    return <EmptyState icono={Megaphone} titulo="Sin avisos por ahora" descripcion="Aquí aparecerán los avisos de la escuela y de tus docentes." compacto />
  }
  return (
    <ul className={cn('grid gap-3', className)}>
      {lista.map((a) => (
        <li key={a.id}>
          <article className={cn('rounded-xl border bg-card p-4 sm:p-5', a.importante && 'border-warning/40 bg-warning-soft/40')}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {mostrarOrigen && (
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  {a.materia && <MateriaPunto color={a.materia.color} />}
                  {a.origen}
                </span>
              )}
              {mostrarOrigen && <span aria-hidden="true">·</span>}
              <time dateTime={a.publicadoEl}>{haceTiempo(a.publicadoEl)}</time>
              {a.importante && (
                <Badge variant="warning" className="ml-auto">
                  <Pin aria-hidden="true" /> Importante
                </Badge>
              )}
            </div>
            <h3 className="mt-2 leading-snug font-semibold">{a.titulo}</h3>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/85">{a.cuerpo}</p>
            <p className="mt-3 text-xs text-muted-foreground">{a.autor}</p>
          </article>
        </li>
      ))}
    </ul>
  )
}
