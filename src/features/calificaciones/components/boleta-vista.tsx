import { GraduationCap } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { calificacion } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Boleta, PeriodoVista } from '@/types'
import { ColorCalificacion } from './celda-calificacion'

function EncabezadoPeriodo({ periodo }: { periodo: PeriodoVista }) {
  return (
    <span className="flex flex-col items-center gap-1">
      <span>{periodo.nombre}</span>
      {periodo.estado === 'en-curso' && <span className="text-[0.65rem] font-normal tracking-normal normal-case">en curso</span>}
    </span>
  )
}

/** Boleta por materia y periodo. La comparten el alumno, la familia y el expediente. */
export function BoletaVista({ boleta, compacta }: { boleta: Boleta; compacta?: boolean }) {
  if (boleta.materias.length === 0) {
    return <EmptyState icono={GraduationCap} titulo="Todavía no hay calificaciones" descripcion="Aparecerán aquí cuando los docentes registren la primera evaluación." />
  }
  const enCurso = boleta.periodos.find((p) => p.estado === 'en-curso')
  return (
    <div className="grid gap-5">
      <div className={cn('grid gap-3', compacta ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4')}>
        <div className="col-span-2 rounded-xl border bg-card p-4 sm:col-span-1">
          <p className="text-sm text-muted-foreground">Promedio general</p>
          <p className="mt-1 text-3xl font-semibold tabular">{calificacion(boleta.promedioGeneral)}</p>
        </div>
        {boleta.periodos.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-4">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {p.nombre}
              {p.estado === 'en-curso' && <Badge variant="info">En curso</Badge>}
            </p>
            <p className={cn('mt-1 text-2xl font-semibold tabular', p.estado === 'proximo' && 'text-muted-foreground')}>
              {p.estado === 'proximo' ? '—' : calificacion(boleta.promedioPorPeriodo[p.id])}
            </p>
          </div>
        ))}
      </div>

      {/* Escritorio: tabla de materias por periodo */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Calificaciones por materia y periodo</caption>
          <thead>
            <tr className="border-b text-xs tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="px-5 py-3 text-left font-medium">
                Materia
              </th>
              {boleta.periodos.map((p) => (
                <th key={p.id} scope="col" className="w-28 px-3 py-3 text-center font-medium">
                  <EncabezadoPeriodo periodo={p} />
                </th>
              ))}
              <th scope="col" className="w-28 bg-muted/40 px-3 py-3 text-center font-semibold text-foreground">
                Promedio
              </th>
            </tr>
          </thead>
          <tbody>
            {boleta.materias.map((m) => (
              <tr key={m.aulaId} className="border-b last:border-0">
                <th scope="row" className="px-5 py-3 text-left font-normal">
                  <span className="flex items-center gap-3">
                    <MateriaIcono materia={m.materia} tamano="sm" />
                    <span className="min-w-0">
                      <span className="block font-medium">{m.materia.nombre}</span>
                      {!compacta && <span className="block truncate text-xs text-muted-foreground">{m.docente}</span>}
                    </span>
                  </span>
                </th>
                {boleta.periodos.map((p) => (
                  <td key={p.id} className={cn('px-3 py-3 text-center tabular', p.estado === 'en-curso' && 'text-muted-foreground italic')}>
                    {p.estado === 'proximo' ? <span className="text-muted-foreground">—</span> : calificacion(m.porPeriodo[p.id])}
                  </td>
                ))}
                <td className="bg-muted/40 px-3 py-3 text-center">
                  <ColorCalificacion valor={m.promedio} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil: una tarjeta por materia */}
      <ul className="grid gap-2 md:hidden">
        {boleta.materias.map((m) => (
          <li key={m.aulaId} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <MateriaIcono materia={m.materia} tamano="sm" />
              <p className="min-w-0 flex-1 font-medium">{m.materia.nombre}</p>
              <ColorCalificacion valor={m.promedio} className="text-xl" />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center">
              {boleta.periodos.map((p) => (
                <div key={p.id}>
                  <dt className="text-xs text-muted-foreground">{p.nombre.replace('Trimestre', 'Trim.')}</dt>
                  <dd className={cn('mt-0.5 font-medium tabular', p.estado === 'en-curso' && 'italic text-muted-foreground')}>
                    {p.estado === 'proximo' ? '—' : calificacion(m.porPeriodo[p.id])}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {enCurso && (
        <p className="text-xs text-muted-foreground">
          Las calificaciones de {enCurso.nombre} (en cursiva) son parciales: se actualizan conforme los docentes califican tareas y exámenes.
        </p>
      )}
    </div>
  )
}

export function BoletaSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}
