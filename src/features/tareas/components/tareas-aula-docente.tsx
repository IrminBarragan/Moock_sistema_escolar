import { ClipboardList, Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { fechaHora, plural, vencimientoRelativo } from '@/lib/format'
import type { TareaDocenteFila } from '@/types'
import { useTareasAula } from '../hooks'

const etiquetaPeriodo = { cerrado: 'Cerrado', 'en-curso': 'En curso', proximo: 'Próximo' } as const

export function TareasAulaDocente({ aulaId }: { aulaId: string }) {
  const consulta = useTareasAula(aulaId)
  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      }
      estaVacio={(t) => t.length === 0}
      vacio={
        <EmptyState
          icono={ClipboardList}
          titulo="Todavía no hay tareas en esta aula"
          descripcion="Crea la primera tarea con instrucciones, fecha límite y puntos."
          accion={
            <Button asChild>
              <Link to={`/docente/aulas/${aulaId}/tareas/nueva`}>
                <Plus aria-hidden="true" />
                Nueva tarea
              </Link>
            </Button>
          }
        />
      }
    >
      {(filas) => {
        const grupos = new Map<string, TareaDocenteFila[]>()
        for (const f of filas) grupos.set(f.periodo.id, [...(grupos.get(f.periodo.id) ?? []), f])
        return (
          <div className="grid gap-8">
            {[...grupos.values()].map((lista) => (
              <section key={lista[0].periodo.id} aria-labelledby={`periodo-${lista[0].periodo.id}`}>
                <div className="mb-3 flex items-center gap-2">
                  <h3 id={`periodo-${lista[0].periodo.id}`} className="font-semibold">
                    {lista[0].periodo.nombre}
                  </h3>
                  <Badge variant={lista[0].periodo.estado === 'en-curso' ? 'info' : 'neutral'}>{etiquetaPeriodo[lista[0].periodo.estado]}</Badge>
                </div>
                <ul className="grid gap-2">
                  {lista.map((f) => (
                    <FilaTarea key={f.tarea.id} fila={f} aulaId={aulaId} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )
      }}
    </Consulta>
  )
}

function FilaTarea({ fila, aulaId }: { fila: TareaDocenteFila; aulaId: string }) {
  const { tarea } = fila
  const avance = Math.round((fila.entregadas / Math.max(1, fila.total)) * 100)
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center md:gap-6">
      <div className="min-w-0 flex-1">
        <Link
          to={`/docente/aulas/${aulaId}/tareas/${tarea.id}/entregas`}
          className="leading-snug font-medium hover:text-primary hover:underline focus-visible:underline"
        >
          {tarea.titulo}
        </Link>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {fila.tema} · {plural(tarea.puntos, 'punto')}
        </p>
        <p className="mt-1 text-sm">
          <span className="text-muted-foreground">Límite: </span>
          {fechaHora(tarea.fechaLimite)} <span className="text-muted-foreground">· {vencimientoRelativo(tarea.fechaLimite)}</span>
        </p>
      </div>
      <div className="flex items-center gap-4 md:w-56">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Entregas</span>
            <span className="tabular">
              {fila.entregadas}/{fila.total}
            </span>
          </div>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
            role="meter"
            aria-label="Entregas recibidas"
            aria-valuemin={0}
            aria-valuemax={fila.total}
            aria-valuenow={fila.entregadas}
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${avance}%` }} />
          </div>
        </div>
        {fila.porRevisar > 0 ? (
          <Badge variant="warning" className="tabular">
            {fila.porRevisar} por revisar
          </Badge>
        ) : (
          <Badge variant="neutral">Al día</Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant={fila.porRevisar > 0 ? 'default' : 'outline'} size="sm" asChild className="flex-1 md:flex-none">
          <Link to={`/docente/aulas/${aulaId}/tareas/${tarea.id}/entregas`}>Revisar entregas</Link>
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to={`/docente/aulas/${aulaId}/tareas/${tarea.id}/editar`} aria-label={`Editar ${tarea.titulo}`}>
            <Pencil aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </li>
  )
}
