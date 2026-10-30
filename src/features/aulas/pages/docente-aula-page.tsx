import { ClipboardCheck, FolderPlus, Megaphone, Plus, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Consulta } from '@/components/shared/consulta'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTitulo } from '@/hooks/use-titulo'
import { plural } from '@/lib/format'
import { TareasAulaDocente } from '@/features/tareas/components/tareas-aula-docente'
import type { Tema } from '@/types'
import { ListaAvisos } from '../components/lista-avisos'
import { ListaTemas } from '../components/lista-temas'
import { PublicarAviso } from '../components/publicar-aviso'
import { SubirMaterialDialog } from '../components/subir-material-dialog'
import { TemaDialog } from '../components/tema-dialog'
import { useAccionesAula, useAula, useAvisosAula } from '../hooks'

const pestanas = ['material', 'tareas', 'avisos'] as const

export default function DocenteAulaPage() {
  const { aulaId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const consulta = useAula(aulaId)
  const avisos = useAvisosAula(aulaId)
  const { moverTema } = useAccionesAula(aulaId)
  const [subir, setSubir] = useState<{ abierto: boolean; temaId: string | null }>({ abierto: false, temaId: null })
  const [temaDialogo, setTemaDialogo] = useState<{ abierto: boolean; tema: Tema | null }>({ abierto: false, tema: null })
  useTitulo(consulta.data ? `${consulta.data.materia.nombre} · ${consulta.data.grupo.nombre}` : 'Aula')

  const pestana = pestanas.find((p) => p === params.get('pestana')) ?? 'material'

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-6">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      }
    >
      {(aula) => (
        <>
          <PageHeader
            regresar={{ to: '/docente', etiqueta: 'Mis aulas' }}
            adorno={<MateriaIcono materia={aula.materia} tamano="lg" />}
            titulo={aula.materia.nombre}
            descripcion={`${aula.grupo.nombre} · ${aula.grupo.nivel} · ${plural(aula.alumnos, 'alumno')}${aula.periodoActual ? ` · ${aula.periodoActual.nombre} en curso` : ''}`}
            acciones={
              <>
                <Button variant="outline" asChild>
                  <Link to={`/docente/aulas/${aula.id}/calificaciones`}>
                    <ClipboardCheck aria-hidden="true" />
                    Calificaciones
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/docente/aulas/${aula.id}/tareas/nueva`}>
                    <Plus aria-hidden="true" />
                    Nueva tarea
                  </Link>
                </Button>
              </>
            }
          />

          <Tabs value={pestana} onValueChange={(v) => setParams({ pestana: v }, { replace: true })}>
            <TabsList aria-label="Secciones del aula">
              <TabsTrigger value="material">Temas y material</TabsTrigger>
              <TabsTrigger value="tareas">
                Tareas
                {aula.porRevisar > 0 && (
                  <span className="rounded-full bg-warning-soft px-1.5 text-xs font-semibold text-warning tabular">
                    {aula.porRevisar}
                    <span className="sr-only"> por revisar</span>
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
            </TabsList>

            <TabsContent value="material" className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {plural(aula.temas.length, 'tema')} · {plural(aula.temas.reduce((s, t) => s + t.materiales.length, 0), 'material', 'materiales')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setTemaDialogo({ abierto: true, tema: null })}>
                    <FolderPlus aria-hidden="true" />
                    Nuevo tema
                  </Button>
                  <Button onClick={() => setSubir({ abierto: true, temaId: null })}>
                    <Upload aria-hidden="true" />
                    Subir material
                  </Button>
                </div>
              </div>
              <ListaTemas
                temas={aula.temas}
                edicion={{
                  onEditar: (tema) => setTemaDialogo({ abierto: true, tema }),
                  onSubir: (temaId) => setSubir({ abierto: true, temaId }),
                  onMover: (temaId, direccion) =>
                    moverTema.mutate({ temaId, direccion }, { onSuccess: () => toast.success('Orden de temas actualizado') }),
                  moviendo: moverTema.isPending,
                }}
              />
            </TabsContent>

            <TabsContent value="tareas">
              <TareasAulaDocente aulaId={aula.id} />
            </TabsContent>

            <TabsContent value="avisos" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
              <PublicarAviso aulaId={aula.id} grupo={aula.grupo.nombre} />
              <section aria-labelledby="titulo-avisos-publicados">
                <h3 id="titulo-avisos-publicados" className="mb-3 flex items-center gap-2 font-semibold">
                  <Megaphone className="size-4 text-muted-foreground" aria-hidden="true" />
                  Avisos publicados
                </h3>
                <Consulta consulta={avisos} esqueleto={<Skeleton className="h-32 rounded-xl" />}>
                  {(lista) => <ListaAvisos avisos={lista} />}
                </Consulta>
              </section>
            </TabsContent>
          </Tabs>

          <SubirMaterialDialog
            aulaId={aula.id}
            temas={aula.temas}
            temaInicial={subir.temaId}
            abierto={subir.abierto}
            onCambio={(abierto) => setSubir((s) => ({ ...s, abierto }))}
          />
          <TemaDialog
            aulaId={aula.id}
            tema={temaDialogo.tema}
            abierto={temaDialogo.abierto}
            onCambio={(abierto) => setTemaDialogo((s) => ({ ...s, abierto }))}
          />
        </>
      )}
    </Consulta>
  )
}
