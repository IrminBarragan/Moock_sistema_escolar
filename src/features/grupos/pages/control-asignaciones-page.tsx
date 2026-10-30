import { useQueries } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Consulta } from '@/components/shared/consulta'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTitulo } from '@/hooks/use-titulo'
import { obtenerGrupo } from '@/services/control.service'
import { useAsignarDocente, useDocentes, useGrupos } from '../hooks'

export default function ControlAsignacionesPage() {
  useTitulo('Asignación de docentes')
  const [params, setParams] = useSearchParams()
  const grupos = useGrupos()
  const docentes = useDocentes()
  const asignar = useAsignarDocente()
  const grupoId = params.get('grupo') ?? 'todos'
  const ids = (grupos.data ?? []).filter((g) => grupoId === 'todos' || g.id === grupoId).map((g) => g.id)
  const detalles = useQueries({ queries: ids.map((id) => ({ queryKey: ['grupos', 'detalle', id], queryFn: () => obtenerGrupo(id) })) })
  const cargando = grupos.isPending || docentes.isPending || detalles.some((d) => d.isPending)

  function reasignar(aulaId: string, docenteId: string, anterior: string, etiqueta: string) {
    asignar.mutate(
      { aulaId, docenteId },
      {
        onSuccess: () =>
          toast.success('Docente asignado', {
            description: `${etiqueta} → ${docentes.data?.find((d) => d.id === docenteId)?.nombre}`,
            action: { label: 'Deshacer', onClick: () => asignar.mutate({ aulaId, docenteId: anterior }) },
          }),
      },
    )
  }

  return (
    <>
      <PageHeader
        titulo="Asignación de docentes"
        descripcion="Quién imparte cada materia en cada grupo. Los cambios se aplican de inmediato en las aulas."
        acciones={
          <Select value={grupoId} onValueChange={(v) => setParams(v === 'todos' ? {} : { grupo: v }, { replace: true })}>
            <SelectTrigger className="w-52" aria-label="Filtrar por grupo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los grupos</SelectItem>
              {grupos.data?.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.nombre} · {g.nivel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <Consulta consulta={grupos} esqueleto={<Skeleton className="h-[30rem] rounded-xl" />}>
        {() =>
          cargando ? (
            <Skeleton className="h-[30rem] rounded-xl" />
          ) : (
            <div className="grid gap-6">
              {detalles.map(({ data }) =>
                data ? (
                  <section key={data.grupo.id} aria-labelledby={`asig-${data.grupo.id}`} className="overflow-hidden rounded-xl border bg-card">
                    <h2 id={`asig-${data.grupo.id}`} className="border-b bg-muted/40 px-5 py-3 font-semibold">
                      {data.grupo.nombre} <span className="font-normal text-muted-foreground">· {data.grupo.nivel}</span>
                    </h2>
                    <Table>
                      <TableHeader className="sr-only">
                        <TableRow>
                          <TableHead>Materia</TableHead>
                          <TableHead>Docente</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.aulas.map((a) => {
                          const etiqueta = `${a.materia.nombre} · ${data.grupo.nombre}`
                          return (
                            <TableRow key={a.id}>
                              <TableCell className="w-1/2">
                                <span className="flex items-center gap-3 font-medium">
                                  <MateriaIcono materia={a.materia} tamano="sm" />
                                  {a.materia.nombre}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Select value={a.docenteId} onValueChange={(v) => reasignar(a.id, v, a.docenteId, etiqueta)} disabled={asignar.isPending}>
                                  <SelectTrigger className="max-w-sm" aria-label={`Docente de ${etiqueta}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {docentes.data
                                      ?.filter((d) => d.niveles.includes(data.grupo.nivelId) || d.id === a.docenteId)
                                      .map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                          {d.nombre} · {d.especialidad}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </section>
                ) : null,
              )}
            </div>
          )
        }
      </Consulta>
    </>
  )
}
