import { ChevronRight, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router'

import { MateriaIcono } from '@/components/shared/materia-icono'
import { Skeleton } from '@/components/ui/skeleton'
import { calificacion, diasHasta, fechaHora, vencimientoRelativo } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TareaAlumnoVista } from '@/types'
import { EstadoTareaBadge } from './estado-tarea-badge'

interface Props {
  item: TareaAlumnoVista
  to: string
  /** Oculta la materia cuando la lista ya está dentro de un aula. */
  sinMateria?: boolean
}

/** Renglón de tarea para alumno y familia; toda la tarjeta es el enlace. */
export function TareaItem({ item, to, sinMateria }: Props) {
  const { tarea, estado, entrega } = item
  const dias = diasHasta(tarea.fechaLimite)
  const urgente = estado === 'pendiente' && dias <= 1
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-primary/35 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none sm:p-4"
    >
      {!sinMateria && <MateriaIcono materia={item.materia} />}
      <div className="min-w-0 flex-1">
        {!sinMateria && <p className="truncate text-xs font-medium text-muted-foreground">{item.materia.nombre}</p>}
        <p className="leading-snug font-medium">{tarea.titulo}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <EstadoTareaBadge estado={estado} />
          {estado === 'pendiente' || estado === 'vencida' ? (
            <span className={cn('text-xs', urgente ? 'font-semibold text-danger' : 'text-muted-foreground')}>
              {vencimientoRelativo(tarea.fechaLimite)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Límite: {fechaHora(tarea.fechaLimite)}</span>
          )}
          {entrega?.comentario && estado === 'calificada' && (
            <MessageSquareText className="size-3.5 text-muted-foreground" aria-label="Con comentario del docente" />
          )}
        </div>
      </div>
      {estado === 'calificada' && entrega?.calificacion != null ? (
        <span className="text-right">
          <span className="block text-lg leading-none font-semibold tabular">{calificacion(entrega.calificacion)}</span>
          <span className="text-[0.7rem] text-muted-foreground">de 10</span>
        </span>
      ) : (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      )}
    </Link>
  )
}

export function TareaItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <Skeleton className="size-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  )
}
