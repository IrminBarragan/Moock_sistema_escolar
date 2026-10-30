import { CalendarClock, CheckCircle2, ChevronRight, Inbox, Users } from 'lucide-react'
import { Link } from 'react-router'

import { MateriaIcono } from '@/components/shared/materia-icono'
import { Skeleton } from '@/components/ui/skeleton'
import { plural, vencimientoRelativo } from '@/lib/format'
import { estiloMateria } from '@/lib/materias'
import type { AulaResumen } from '@/types'

interface Props {
  aula: AulaResumen
  to: string
  vista: 'docente' | 'alumno'
}

/** Tarjeta de un aula: la banda superior lleva el color de la materia. */
export function AulaCard({ aula, to, vista }: Props) {
  return (
    <Link
      to={to}
      style={estiloMateria(aula.materia.color)}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] hover:border-[color-mix(in_oklab,var(--materia)_45%,var(--border))] hover:shadow-[0_4px_16px_rgb(0_0_0/0.06)] focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <span className="h-1.5 bg-[var(--materia)]" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <MateriaIcono materia={aula.materia} />
          <div className="min-w-0 flex-1">
            <h3 className="leading-snug font-semibold">{aula.materia.nombre}</h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {vista === 'docente' ? `${aula.grupo.nombre} · ${aula.grupo.nivel}` : aula.docente.nombre}
            </p>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {vista === 'docente' ? (
            <>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-4" aria-hidden="true" />
                {plural(aula.alumnos, 'alumno')}
              </span>
              {aula.porRevisar > 0 ? (
                <span className="flex items-center gap-1.5 font-medium text-warning">
                  <Inbox className="size-4" aria-hidden="true" />
                  {plural(aula.porRevisar, 'entrega')} por revisar
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-success">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Todo revisado
                </span>
              )}
            </>
          ) : aula.pendientes > 0 ? (
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CalendarClock className="size-4 text-[var(--materia)]" aria-hidden="true" />
              {plural(aula.pendientes, 'tarea pendiente', 'tareas pendientes')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Sin tareas pendientes
            </span>
          )}
        </div>
        {aula.proximaTarea && (
          <p className="-mt-2 truncate text-xs text-muted-foreground">
            Próxima: {aula.proximaTarea.titulo} · {vencimientoRelativo(aula.proximaTarea.fechaLimite).toLowerCase()}
          </p>
        )}
      </div>
    </Link>
  )
}

export function AulaCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Skeleton className="h-1.5 rounded-none" />
      <div className="flex flex-col gap-5 p-5">
        <div className="flex gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
