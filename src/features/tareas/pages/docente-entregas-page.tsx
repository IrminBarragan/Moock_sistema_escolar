import { Inbox } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useTitulo } from '@/hooks/use-titulo'
import { calificacion, fechaHora } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EntregasDeTarea, FilaEntrega } from '@/types'
import { EstadoTareaBadge } from '../components/estado-tarea-badge'
import { RevisionEntrega } from '../components/revision-entrega'
import { useEntregasTarea } from '../hooks'

type Filtro = 'todas' | 'revisar' | 'calificadas' | 'sin-entregar'

const filtros: { valor: Filtro; etiqueta: string; cumple: (f: FilaEntrega) => boolean }[] = [
  { valor: 'todas', etiqueta: 'Todos', cumple: () => true },
  { valor: 'revisar', etiqueta: 'Por revisar', cumple: (f) => f.estado === 'entregada' || f.estado === 'tarde' },
  { valor: 'calificadas', etiqueta: 'Calificadas', cumple: (f) => f.estado === 'calificada' },
  { valor: 'sin-entregar', etiqueta: 'Sin entregar', cumple: (f) => !f.entrega },
]

export default function DocenteEntregasPage() {
  const { tareaId = '' } = useParams()
  const consulta = useEntregasTarea(tareaId)
  useTitulo(consulta.data ? `Entregas · ${consulta.data.tarea.titulo}` : 'Entregas')

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-6">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-11 w-full max-w-md" />
          <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
            <Skeleton className="h-[28rem] rounded-xl" />
            <Skeleton className="hidden h-[28rem] rounded-xl lg:block" />
          </div>
        </div>
      }
    >
      {(datos) => <Revision datos={datos} />}
    </Consulta>
  )
}

function Revision({ datos }: { datos: EntregasDeTarea }) {
  const [params, setParams] = useSearchParams()
  const escritorio = useMediaQuery('(min-width: 1024px)')
  const filtro = (filtros.find((f) => f.valor === params.get('filtro'))?.valor ?? 'todas') as Filtro
  const { tarea, aula, filas } = datos

  const porRevisar = filas.filter(filtros[1].cumple)
  const visibles = filas.filter(filtros.find((f) => f.valor === filtro)!.cumple)
  const idSeleccionado = params.get('alumno') ?? (escritorio ? (porRevisar[0] ?? filas[0])?.alumno.id : undefined)
  const seleccionada = filas.find((f) => f.alumno.id === idSeleccionado) ?? null

  function seleccionar(alumnoId: string | null) {
    const siguiente = new URLSearchParams(params)
    if (alumnoId) siguiente.set('alumno', alumnoId)
    else siguiente.delete('alumno')
    setParams(siguiente, { replace: true })
  }

  function cambiarFiltro(f: Filtro) {
    const siguiente = new URLSearchParams(params)
    siguiente.set('filtro', f)
    setParams(siguiente, { replace: true })
  }

  const siguientePorRevisar = seleccionada ? porRevisar.find((f) => f.alumno.id !== seleccionada.alumno.id) : undefined

  const panel = seleccionada && (
    <RevisionEntrega
      key={seleccionada.alumno.id}
      tarea={tarea}
      fila={seleccionada}
      onSiguiente={siguientePorRevisar ? () => seleccionar(siguientePorRevisar.alumno.id) : null}
    />
  )

  return (
    <>
      <PageHeader
        regresar={{ to: `/docente/aulas/${aula.id}?pestana=tareas`, etiqueta: `${aula.materia.nombre} · ${aula.grupo.nombre}` }}
        adorno={<MateriaIcono materia={aula.materia} />}
        titulo={tarea.titulo}
        descripcion={`${datos.tema} · Fecha límite: ${fechaHora(tarea.fechaLimite)} · ${tarea.puntos} puntos`}
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar alumnos">
        {filtros.map((f) => {
          const cantidad = filas.filter(f.cumple).length
          const activo = f.valor === filtro
          return (
            <button
              key={f.valor}
              type="button"
              aria-pressed={activo}
              onClick={() => cambiarFiltro(f.valor)}
              className={cn(
                'flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
                activo ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent',
              )}
            >
              {f.etiqueta}
              <span className={cn('rounded-full px-1.5 text-xs tabular', activo ? 'bg-white/20' : 'bg-muted text-muted-foreground')}>
                {cantidad}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <section aria-label="Alumnos" className="overflow-hidden rounded-xl border bg-card lg:sticky lg:top-28">
          {visibles.length === 0 ? (
            <EmptyState icono={Inbox} titulo="Nadie en esta lista" descripcion="Prueba con otro filtro." compacto className="m-3 border-0" />
          ) : (
            <ul className="max-h-[calc(100dvh-14rem)] divide-y overflow-y-auto">
              {visibles.map((f) => (
                <li key={f.alumno.id}>
                  <button
                    type="button"
                    onClick={() => seleccionar(f.alumno.id)}
                    aria-current={f.alumno.id === seleccionada?.alumno.id ? 'true' : undefined}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60 focus-visible:bg-accent focus-visible:outline-none aria-[current=true]:bg-primary/8 aria-[current=true]:shadow-[inset_3px_0_0_var(--primary)]"
                  >
                    <Avatar className="size-8" aria-hidden="true">
                      <AvatarFallback>{f.alumno.iniciales}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{f.alumno.nombreLista}</span>
                      <span className="mt-1 block">
                        <EstadoTareaBadge estado={f.estado} vista="docente" />
                      </span>
                    </span>
                    {f.entrega?.calificacion != null && (
                      <span className="text-base font-semibold tabular">{calificacion(f.entrega.calificacion)}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {escritorio ? (
          <section aria-label="Revisión" className="rounded-xl border bg-card p-5 xl:p-6">
            {panel ?? <p className="text-sm text-muted-foreground">Elige un alumno de la lista para revisar su entrega.</p>}
          </section>
        ) : (
          <Sheet open={Boolean(seleccionada)} onOpenChange={(abierto) => !abierto && seleccionar(null)}>
            <SheetContent side="bottom" className="overflow-y-auto p-5 pt-12">
              <SheetTitle className="sr-only">Revisión de la entrega</SheetTitle>
              <SheetDescription className="sr-only">{tarea.titulo}</SheetDescription>
              {panel}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </>
  )
}
