import { BookOpen, Inbox } from 'lucide-react'
import { Link } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { MateriaPunto } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useSesionActiva } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { plural } from '@/lib/format'
import { AulaCard, AulaCardSkeleton } from '../components/aula-card'
import { useAulasDocente } from '../hooks'

export default function DocenteAulasPage() {
  useTitulo('Mis aulas')
  const sesion = useSesionActiva()
  const consulta = useAulasDocente(sesion.personaId!)

  return (
    <>
      <PageHeader
        titulo="Mis aulas"
        descripcion={`Hola, ${sesion.nombre.split(' ').slice(0, 2).join(' ')}. Estas son las materias que impartes en el ciclo 2026–2027.`}
      />
      <Consulta
        consulta={consulta}
        esqueleto={
          <div className="grid gap-6">
            <Skeleton className="h-24 rounded-xl" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 4 }, (_, i) => (
                <AulaCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
        estaVacio={(aulas) => aulas.length === 0}
        vacio={
          <EmptyState
            icono={BookOpen}
            titulo="Aún no tienes aulas asignadas"
            descripcion="Control escolar te asignará tus materias y grupos al inicio del ciclo. Si crees que es un error, comunícate con la coordinación."
          />
        }
      >
        {(aulas) => {
          const porRevisar = aulas.filter((a) => a.porRevisar > 0).sort((a, b) => b.porRevisar - a.porRevisar)
          const total = porRevisar.reduce((s, a) => s + a.porRevisar, 0)
          return (
            <div className="grid gap-8">
              <section aria-labelledby="titulo-revisar" className="rounded-xl border bg-card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-warning-soft text-warning">
                      <Inbox className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 id="titulo-revisar" className="font-semibold">
                        {total > 0 ? `${plural(total, 'entrega')} por revisar` : 'No tienes entregas por revisar'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {total > 0 ? 'Califica para que alumnos y familias vean su avance.' : 'Las nuevas entregas aparecerán aquí.'}
                      </p>
                    </div>
                  </div>
                </div>
                {porRevisar.length > 0 && (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {porRevisar.map((a) => (
                      <li key={a.id}>
                        <Link
                          to={`/docente/aulas/${a.id}?pestana=tareas`}
                          className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                        >
                          <MateriaPunto color={a.materia.color} />
                          <span className="min-w-0 flex-1 truncate">
                            <span className="font-medium">{a.materia.nombre}</span>
                            <span className="text-muted-foreground"> · {a.grupo.nombre}</span>
                          </span>
                          <span className="font-semibold text-warning tabular">{a.porRevisar}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="titulo-aulas">
                <div className="mb-4 flex items-center justify-between">
                  <h2 id="titulo-aulas" className="text-lg font-semibold">
                    Materias y grupos
                  </h2>
                  <span className="text-sm text-muted-foreground">{plural(aulas.length, 'aula')}</span>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {aulas.map((aula) => (
                    <li key={aula.id} className="grid">
                      <AulaCard aula={aula} to={`/docente/aulas/${aula.id}`} vista="docente" />
                    </li>
                  ))}
                </ul>
              </section>

            </div>
          )
        }}
      </Consulta>
    </>
  )
}
