import { ChevronRight, FileSpreadsheet, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { CampoBusqueda } from '@/components/shared/campo-busqueda'
import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { FiltrosActivos, type FiltroActivo } from '@/components/shared/filtros-activos'
import { PageHeader } from '@/components/shared/page-header'
import { Paginacion } from '@/components/shared/paginacion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useGrupos } from '@/features/grupos/hooks'
import { useDebounce } from '@/hooks/use-debounce'
import { useTitulo } from '@/hooks/use-titulo'
import { moneda } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { NivelId } from '@/types'
import { useAlumnos } from '../hooks'

const niveles: { id: NivelId; nombre: string }[] = [
  { id: 'primaria', nombre: 'Primaria' },
  { id: 'secundaria', nombre: 'Secundaria' },
  { id: 'preparatoria', nombre: 'Preparatoria' },
]

export default function ControlAlumnosPage() {
  useTitulo('Alumnos')
  const [params, setParams] = useSearchParams()
  const [texto, setTexto] = useState(params.get('q') ?? '')
  const q = useDebounce(texto, 300)
  const nivelId = (params.get('nivel') ?? 'todos') as NivelId | 'todos'
  const grupoId = params.get('grupo') ?? 'todos'
  const adeudo = params.get('adeudo') === '1'
  const page = Number(params.get('pagina') ?? 0)
  const consulta = useAlumnos({ q, nivelId, grupoId, adeudo, page, size: 20 })
  const grupos = useGrupos()

  function cambiar(cambios: Record<string, string | null>) {
    const siguiente = new URLSearchParams(params)
    for (const [k, v] of Object.entries(cambios)) {
      if (v === null || v === 'todos' || v === '') siguiente.delete(k)
      else siguiente.set(k, v)
    }
    if (!('pagina' in cambios)) siguiente.delete('pagina')
    setParams(siguiente, { replace: true })
  }

  function buscar(valor: string) {
    setTexto(valor)
    cambiar({ q: valor })
  }

  const gruposDisponibles = (grupos.data ?? []).filter((g) => nivelId === 'todos' || g.nivelId === nivelId)
  const activos: FiltroActivo[] = []
  if (q) activos.push({ clave: 'q', etiqueta: `«${q}»`, onQuitar: () => buscar('') })
  if (nivelId !== 'todos') activos.push({ clave: 'nivel', etiqueta: niveles.find((n) => n.id === nivelId)!.nombre, onQuitar: () => cambiar({ nivel: null, grupo: null }) })
  if (grupoId !== 'todos') activos.push({ clave: 'grupo', etiqueta: `Grupo ${grupos.data?.find((g) => g.id === grupoId)?.nombre ?? ''}`, onQuitar: () => cambiar({ grupo: null }) })
  if (adeudo) activos.push({ clave: 'adeudo', etiqueta: 'Con adeudo vencido', onQuitar: () => cambiar({ adeudo: null }) })

  return (
    <>
      <PageHeader
        titulo="Alumnos"
        descripcion="Busca por nombre, matrícula o CURP y abre el expediente."
        acciones={
          <Button variant="outline" asChild>
            <Link to="/control/importar">
              <FileSpreadsheet aria-hidden="true" />
              Importar desde Excel
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] md:items-center">
        <CampoBusqueda valor={texto} onCambio={buscar} etiqueta="Buscar alumnos" placeholder="Nombre, matrícula o CURP" />
        <Select value={nivelId} onValueChange={(v) => cambiar({ nivel: v, grupo: null })}>
          <SelectTrigger aria-label="Nivel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los niveles</SelectItem>
            {niveles.map((n) => (
              <SelectItem key={n.id} value={n.id}>
                {n.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={grupoId} onValueChange={(v) => cambiar({ grupo: v })}>
          <SelectTrigger aria-label="Grupo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los grupos</SelectItem>
            {gruposDisponibles.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.nombre} · {g.nivel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 md:pl-2">
          <Checkbox id="solo-adeudo" checked={adeudo} onCheckedChange={(v) => cambiar({ adeudo: v === true ? '1' : null })} />
          <Label htmlFor="solo-adeudo" className="font-normal whitespace-nowrap">
            Con adeudo
          </Label>
        </div>
      </div>
      <FiltrosActivos filtros={activos} onLimpiar={() => { setTexto(''); setParams({}, { replace: true }) }} />

      <div className="mt-4">
        <Consulta
          consulta={consulta}
          esqueleto={<Skeleton className="h-[32rem] rounded-xl" />}
          estaVacio={(p) => p.totalElements === 0}
          vacio={
            <EmptyState
              icono={SearchX}
              titulo="No encontramos alumnos con esos filtros"
              descripcion="Revisa la ortografía o quita algún filtro."
              accion={
                <Button variant="outline" onClick={() => { setTexto(''); setParams({}, { replace: true }) }}>
                  Limpiar filtros
                </Button>
              }
            />
          }
        >
          {(pagina) => (
            <div className={cn('grid gap-4 transition-opacity', consulta.isPlaceholderData && 'opacity-60')}>
              <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Alumno</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead className="text-right">Saldo vencido</TableHead>
                      <TableHead>
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagina.content.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Link to={`/control/alumnos/${a.id}`} className="flex items-center gap-3 font-medium hover:text-primary hover:underline">
                            <Avatar className="size-8" aria-hidden="true">
                              <AvatarFallback>{a.iniciales}</AvatarFallback>
                            </Avatar>
                            {a.nombreLista}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular">{a.matricula}</TableCell>
                        <TableCell>
                          {a.grupo.nombre} <span className="text-muted-foreground">· {a.grupo.nivel}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{a.tutor}</TableCell>
                        <TableCell className="text-right">
                          {a.saldoVencido > 0 ? (
                            <Badge variant="danger" className="tabular">
                              {moneda(a.saldoVencido)}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Al corriente</span>
                          )}
                        </TableCell>
                        <TableCell className="w-10">
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link to={`/control/alumnos/${a.id}`} aria-label={`Ver expediente de ${a.nombre}`}>
                              <ChevronRight aria-hidden="true" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ul className="grid gap-2 md:hidden">
                {pagina.content.map((a) => (
                  <li key={a.id}>
                    <Link to={`/control/alumnos/${a.id}`} className="flex items-center gap-3 rounded-xl border bg-card p-3.5">
                      <Avatar className="size-9" aria-hidden="true">
                        <AvatarFallback>{a.iniciales}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{a.nombreLista}</span>
                        <span className="block text-xs text-muted-foreground">
                          {a.matricula} · {a.grupo.nombre} {a.grupo.nivel}
                        </span>
                      </span>
                      {a.saldoVencido > 0 && <Badge variant="danger">{moneda(a.saldoVencido)}</Badge>}
                    </Link>
                  </li>
                ))}
              </ul>
              <Paginacion
                pagina={pagina.page}
                totalPaginas={pagina.totalPages}
                totalElementos={pagina.totalElements}
                tamano={pagina.size}
                onCambio={(p) => cambiar({ pagina: String(p) })}
                sustantivo={['alumno', 'alumnos']}
              />
            </div>
          )}
        </Consulta>
      </div>
    </>
  )
}
