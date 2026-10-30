import { ChevronRight, DoorOpen, Users } from 'lucide-react'
import { Link } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useTitulo } from '@/hooks/use-titulo'
import { cn } from '@/lib/utils'
import { useGrupos } from '../hooks'

export default function ControlGruposPage() {
  useTitulo('Grupos e inscripciones')
  const consulta = useGrupos()
  return (
    <>
      <PageHeader titulo="Grupos e inscripciones" descripcion="Ciclo escolar 2026–2027. Abre un grupo para ver a sus alumnos o moverlos de grupo." />
      <Consulta
        consulta={consulta}
        esqueleto={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        }
      >
        {(grupos) => {
          const niveles = [...new Set(grupos.map((g) => g.nivel))]
          return (
            <div className="grid gap-8">
              {niveles.map((nivel) => (
                <section key={nivel} aria-labelledby={`nivel-${nivel}`}>
                  <h2 id={`nivel-${nivel}`} className="mb-3 text-lg font-semibold">
                    {nivel}
                  </h2>
                  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {grupos
                      .filter((g) => g.nivel === nivel)
                      .map((g) => {
                        const ocupacion = Math.round((g.inscritos / g.capacidad) * 100)
                        return (
                          <li key={g.id}>
                            <Link
                              to={`/control/grupos/${g.id}`}
                              className="group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/35 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-xl font-semibold">{g.nombre}</p>
                                  <p className="text-sm text-muted-foreground">{g.grado}</p>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm">
                                  <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Users className="size-4" aria-hidden="true" /> Inscritos
                                  </span>
                                  <span className="font-medium tabular">
                                    {g.inscritos} / {g.capacidad}
                                  </span>
                                </div>
                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="meter" aria-label={`Ocupación de ${g.nombre}`} aria-valuemin={0} aria-valuemax={g.capacidad} aria-valuenow={g.inscritos}>
                                  <div className={cn('h-full rounded-full', ocupacion >= 100 ? 'bg-danger' : 'bg-primary')} style={{ width: `${Math.min(100, ocupacion)}%` }} />
                                </div>
                              </div>
                              <p className="mt-auto flex items-center gap-1.5 text-sm text-muted-foreground">
                                <DoorOpen className="size-4" aria-hidden="true" /> Salón {g.salon} · {g.materias} materias
                              </p>
                            </Link>
                          </li>
                        )
                      })}
                  </ul>
                </section>
              ))}
            </div>
          )
        }}
      </Consulta>
    </>
  )
}
