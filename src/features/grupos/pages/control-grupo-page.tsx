import { ArrowLeftRight, UserCog } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CambiarGrupoDialog } from '@/features/alumnos/components/cambiar-grupo-dialog'
import { useTitulo } from '@/hooks/use-titulo'
import type { NivelId } from '@/types'
import { useGrupo } from '../hooks'

export default function ControlGrupoPage() {
  const { grupoId = '' } = useParams()
  const consulta = useGrupo(grupoId)
  const [mover, setMover] = useState<{ id: string; nombre: string; grupoId: string; nivelId: NivelId } | null>(null)
  useTitulo(consulta.data ? `Grupo ${consulta.data.grupo.nombre}` : 'Grupo')

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-6">
          <Skeleton className="h-16 w-1/2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
    >
      {({ grupo, alumnos, aulas }) => (
        <>
          <PageHeader
            regresar={{ to: '/control/grupos', etiqueta: 'Grupos' }}
            titulo={`Grupo ${grupo.nombre}`}
            descripcion={`${grupo.grado} · Salón ${grupo.salon} · ${grupo.inscritos} de ${grupo.capacidad} lugares ocupados`}
            acciones={
              <Button variant="outline" asChild>
                <Link to={`/control/asignaciones?grupo=${grupo.id}`}>
                  <UserCog aria-hidden="true" />
                  Asignar docentes
                </Link>
              </Button>
            }
          />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
            <section aria-labelledby="titulo-alumnos" className="overflow-hidden rounded-xl border bg-card">
              <h2 id="titulo-alumnos" className="border-b px-5 py-3.5 font-semibold">
                Alumnos inscritos
              </h2>
              <ol className="divide-y">
                {alumnos.map((a, i) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="w-5 text-right text-xs text-muted-foreground tabular">{i + 1}</span>
                    <Avatar className="size-8" aria-hidden="true">
                      <AvatarFallback>{a.iniciales}</AvatarFallback>
                    </Avatar>
                    <Link to={`/control/alumnos/${a.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary hover:underline">
                      {a.nombreLista}
                    </Link>
                    <span className="hidden text-xs text-muted-foreground tabular sm:inline">{a.matricula}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setMover({ id: a.id, nombre: a.nombre, grupoId: grupo.id, nivelId: grupo.nivelId })}
                      aria-label={`Cambiar de grupo a ${a.nombre}`}
                    >
                      <ArrowLeftRight aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ol>
            </section>
            <section aria-labelledby="titulo-materias" className="overflow-hidden rounded-xl border bg-card">
              <h2 id="titulo-materias" className="border-b px-5 py-3.5 font-semibold">
                Materias y docentes
              </h2>
              <ul className="divide-y">
                {aulas.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <MateriaIcono materia={a.materia} tamano="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{a.materia.nombre}</span>
                      <span className="block truncate text-xs text-muted-foreground">{a.docente}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <CambiarGrupoDialog alumno={mover} onCerrar={() => setMover(null)} />
        </>
      )}
    </Consulta>
  )
}
