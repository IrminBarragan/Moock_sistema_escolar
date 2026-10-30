import { ClipboardList } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TareaItem, TareaItemSkeleton } from '@/features/tareas/components/tarea-item'
import { useTareasAulaAlumno } from '@/features/tareas/hooks'
import { useSesionActiva } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { ListaAvisos } from '../components/lista-avisos'
import { ListaTemas } from '../components/lista-temas'
import { useAula, useAvisosAula } from '../hooks'

const pestanas = ['material', 'tareas', 'avisos'] as const

export default function AlumnoAulaPage() {
  const { aulaId = '' } = useParams()
  const sesion = useSesionActiva()
  const alumnoId = sesion.personaId!
  const [params, setParams] = useSearchParams()
  const consulta = useAula(aulaId, alumnoId)
  const tareas = useTareasAulaAlumno(aulaId, alumnoId)
  const avisos = useAvisosAula(aulaId)
  useTitulo(consulta.data?.materia.nombre ?? 'Materia')
  const pestana = pestanas.find((p) => p === params.get('pestana')) ?? 'material'

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-6">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-11" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      }
    >
      {(aula) => (
        <>
          <PageHeader
            regresar={{ to: '/alumno/materias', etiqueta: 'Mis materias' }}
            adorno={<MateriaIcono materia={aula.materia} tamano="lg" />}
            titulo={aula.materia.nombre}
            descripcion={aula.docente.nombre}
          />
          <Tabs value={pestana} onValueChange={(v) => setParams({ pestana: v }, { replace: true })}>
            <TabsList aria-label="Secciones de la materia">
              <TabsTrigger value="material">Material</TabsTrigger>
              <TabsTrigger value="tareas">
                Tareas
                {aula.pendientes > 0 && (
                  <span className="rounded-full bg-primary/12 px-1.5 text-xs font-semibold text-primary tabular">
                    {aula.pendientes}
                    <span className="sr-only"> pendientes</span>
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
            </TabsList>
            <TabsContent value="material">
              <ListaTemas temas={aula.temas.filter((t) => t.materiales.length > 0 || t.totalTareas > 0)} />
            </TabsContent>
            <TabsContent value="tareas">
              <Consulta
                consulta={tareas}
                esqueleto={
                  <div className="grid gap-2">
                    {Array.from({ length: 4 }, (_, i) => (
                      <TareaItemSkeleton key={i} />
                    ))}
                  </div>
                }
                estaVacio={(l) => l.length === 0}
                vacio={<EmptyState icono={ClipboardList} titulo="Sin tareas en esta materia" descripcion="Cuando tu docente publique una tarea, aparecerá aquí." />}
              >
                {(lista) => (
                  <ul className="grid gap-2">
                    {lista.map((t) => (
                      <li key={t.tarea.id}>
                        <TareaItem item={t} to={`/alumno/tareas/${t.tarea.id}`} sinMateria />
                      </li>
                    ))}
                  </ul>
                )}
              </Consulta>
            </TabsContent>
            <TabsContent value="avisos">
              <Consulta consulta={avisos} esqueleto={<Skeleton className="h-40 rounded-xl" />}>
                {(lista) => <ListaAvisos avisos={lista} />}
              </Consulta>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Consulta>
  )
}
