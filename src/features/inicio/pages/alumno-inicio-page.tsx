import { ArrowRight, PartyPopper } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { demoConfig } from '@/config/demo'
import { useAulasAlumno, useAvisosAlumno } from '@/features/aulas/hooks'
import { ListaAvisos } from '@/features/aulas/components/lista-avisos'
import { TareaItem, TareaItemSkeleton } from '@/features/tareas/components/tarea-item'
import { useTareasAlumno } from '@/features/tareas/hooks'
import { useSesionActiva } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { fechaLarga, plural } from '@/lib/format'

export default function AlumnoInicioPage() {
  useTitulo('Inicio')
  const sesion = useSesionActiva()
  const alumnoId = sesion.personaId!
  const tareas = useTareasAlumno(alumnoId)
  const avisos = useAvisosAlumno(alumnoId)
  const aulas = useAulasAlumno(alumnoId)
  const [todosLosAvisos, setTodosLosAvisos] = useState(false)

  return (
    <>
      <PageHeader titulo={`Hola, ${sesion.nombre.split(' ')[0]}`} descripcion={fechaLarga(demoConfig.fechaHoy)} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="grid gap-8">
          <section aria-labelledby="titulo-por-entregar">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id="titulo-por-entregar" className="text-lg font-semibold">
                Por entregar
              </h2>
              <Link to="/alumno/tareas" className="text-sm font-medium text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            <Consulta
              consulta={tareas}
              esqueleto={
                <div className="grid gap-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <TareaItemSkeleton key={i} />
                  ))}
                </div>
              }
            >
              {(lista) => {
                const pendientes = lista
                  .filter((t) => t.estado === 'pendiente')
                  .sort((a, b) => a.tarea.fechaLimite.localeCompare(b.tarea.fechaLimite))
                if (pendientes.length === 0) {
                  return (
                    <EmptyState
                      icono={PartyPopper}
                      titulo="¡Estás al día!"
                      descripcion="No tienes tareas pendientes. Cuando tus docentes publiquen una nueva, aparecerá aquí."
                      compacto
                    />
                  )
                }
                return (
                  <>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Tienes {plural(pendientes.length, 'tarea pendiente', 'tareas pendientes')}. Empieza por la que vence primero.
                    </p>
                    <ul className="grid gap-2">
                      {pendientes.slice(0, 5).map((t) => (
                        <li key={t.tarea.id}>
                          <TareaItem item={t} to={`/alumno/tareas/${t.tarea.id}`} />
                        </li>
                      ))}
                    </ul>
                  </>
                )
              }}
            </Consulta>
          </section>

          <Consulta consulta={tareas} esqueleto={null}>
            {(lista) => {
              const recientes = lista
                .filter((t) => t.estado === 'calificada' && t.entrega?.calificadaEl)
                .sort((a, b) => b.entrega!.calificadaEl!.localeCompare(a.entrega!.calificadaEl!))
                .slice(0, 3)
              if (recientes.length === 0) return null
              return (
                <section aria-labelledby="titulo-calificadas">
                  <h2 id="titulo-calificadas" className="mb-3 text-lg font-semibold">
                    Calificadas recientemente
                  </h2>
                  <ul className="grid gap-2">
                    {recientes.map((t) => (
                      <li key={t.tarea.id}>
                        <TareaItem item={t} to={`/alumno/tareas/${t.tarea.id}`} />
                      </li>
                    ))}
                  </ul>
                </section>
              )
            }}
          </Consulta>
        </div>

        <div className="grid gap-8">
          <section aria-labelledby="titulo-avisos">
            <h2 id="titulo-avisos" className="mb-3 text-lg font-semibold">
              Avisos recientes
            </h2>
            <Consulta consulta={avisos} esqueleto={<Skeleton className="h-40 rounded-xl" />}>
              {(lista) => (
                <>
                  <ListaAvisos avisos={lista} mostrarOrigen limite={todosLosAvisos ? undefined : 3} />
                  {lista.length > 3 && (
                    <Button variant="ghost" className="mt-2 w-full" onClick={() => setTodosLosAvisos((v) => !v)}>
                      {todosLosAvisos ? 'Ver menos' : `Ver los ${lista.length} avisos`}
                    </Button>
                  )}
                </>
              )}
            </Consulta>
          </section>

          <section aria-labelledby="titulo-materias">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="titulo-materias" className="text-lg font-semibold">
                Mis materias
              </h2>
              <Link to="/alumno/materias" className="text-sm font-medium text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            <Consulta
              consulta={aulas}
              esqueleto={<Skeleton className="h-48 rounded-xl" />}
            >
              {(lista) => (
                <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                  {lista.map((a) => (
                    <li key={a.id}>
                      <Link
                        to={`/alumno/materias/${a.id}`}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 focus-visible:bg-accent focus-visible:outline-none"
                      >
                        <MateriaIcono materia={a.materia} tamano="sm" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.materia.nombre}</span>
                        {a.pendientes > 0 && (
                          <span className="rounded-full bg-muted px-2 text-xs font-medium tabular">
                            {a.pendientes}
                            <span className="sr-only"> pendientes</span>
                          </span>
                        )}
                        <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Consulta>
          </section>
        </div>
      </div>
    </>
  )
}
