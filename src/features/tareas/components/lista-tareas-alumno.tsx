import { ClipboardList } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { EstadoTarea, TareaAlumnoVista } from '@/types'
import { useTareasAlumno } from '../hooks'
import { TareaItem, TareaItemSkeleton } from './tarea-item'

type Filtro = 'pendientes' | 'entregadas' | 'calificadas' | 'vencidas'

const filtros: { valor: Filtro; etiqueta: string; estados: EstadoTarea[]; vacio: string }[] = [
  { valor: 'pendientes', etiqueta: 'Pendientes', estados: ['pendiente'], vacio: 'No hay tareas pendientes.' },
  { valor: 'entregadas', etiqueta: 'Entregadas', estados: ['entregada', 'tarde'], vacio: 'No hay entregas esperando calificación.' },
  { valor: 'calificadas', etiqueta: 'Calificadas', estados: ['calificada'], vacio: 'Aún no hay tareas calificadas.' },
  { valor: 'vencidas', etiqueta: 'Vencidas', estados: ['vencida'], vacio: 'No hay tareas vencidas. ¡Bien!' },
]

interface Props {
  alumnoId: string
  rutaTarea: (tareaId: string) => string
  /** Texto en tercera persona para la vista de la familia. */
  sujeto?: string
}

export function ListaTareasAlumno({ alumnoId, rutaTarea, sujeto }: Props) {
  const consulta = useTareasAlumno(alumnoId)
  const [params, setParams] = useSearchParams()
  const filtro = filtros.find((f) => f.valor === params.get('estado')) ?? filtros[0]
  const materia = params.get('materia') ?? 'todas'

  function actualizar(clave: string, valor: string) {
    const siguiente = new URLSearchParams(params)
    siguiente.set(clave, valor)
    setParams(siguiente, { replace: true })
  }

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-3">
          <div className="h-10" />
          {Array.from({ length: 5 }, (_, i) => (
            <TareaItemSkeleton key={i} />
          ))}
        </div>
      }
    >
      {(lista) => {
        const materias = [...new Map(lista.map((t) => [t.materia.id, t.materia])).values()]
        const deMateria = (t: TareaAlumnoVista) => materia === 'todas' || t.materia.id === materia
        const visibles = lista.filter((t) => filtro.estados.includes(t.estado) && deMateria(t))
        if (filtro.valor === 'pendientes') visibles.sort((a, b) => a.tarea.fechaLimite.localeCompare(b.tarea.fechaLimite))
        return (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" role="group" aria-label="Filtrar por estado">
                {filtros.map((f) => {
                  const cantidad = lista.filter((t) => f.estados.includes(t.estado) && deMateria(t)).length
                  const activo = f.valor === filtro.valor
                  return (
                    <button
                      key={f.valor}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => actualizar('estado', f.valor)}
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
              <Select value={materia} onValueChange={(v) => actualizar('materia', v)}>
                <SelectTrigger className="md:w-60" aria-label="Filtrar por materia">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las materias</SelectItem>
                  {materias.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {visibles.length === 0 ? (
              <EmptyState icono={ClipboardList} titulo={filtro.vacio} descripcion={sujeto ? `Revisa otra pestaña para ver el resto de las tareas de ${sujeto}.` : 'Revisa otra pestaña o cambia de materia.'} />
            ) : (
              <ul className="grid gap-2">
                {visibles.map((t) => (
                  <li key={t.tarea.id}>
                    <TareaItem item={t} to={rutaTarea(t.tarea.id)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      }}
    </Consulta>
  )
}
