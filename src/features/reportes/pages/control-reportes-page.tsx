import { FileDown, FileSearch } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { demoConfig } from '@/config/demo'
import { ColorCalificacion } from '@/features/calificaciones/components/celda-calificacion'
import { useGrupos } from '@/features/grupos/hooks'
import { EstadoCargoBadge } from '@/features/pagos/components/estado-cargo-badge'
import { useTitulo } from '@/hooks/use-titulo'
import { mesesCiclo } from '@/lib/ciclo'
import { exportarCsv } from '@/lib/exportar'
import { calificacion, fecha, fechaHora, moneda, numero, plural } from '@/lib/format'
import { useReporteCalificaciones, useReportePagos, useReporteSinEntregar } from '../hooks'

const reportes = ['calificaciones', 'tareas', 'pagados', 'pendientes'] as const

function exportar(nombre: string, encabezados: string[], filas: (string | number | null)[][]) {
  exportarCsv(nombre, encabezados, filas)
  toast.success('Archivo generado', { description: `${nombre}.csv (${plural(filas.length, 'fila')}). Se abre directamente en Excel.` })
}

function Barra({ filtros, resumen, onExportar, deshabilitado }: { filtros: ReactNode; resumen?: ReactNode; onExportar: () => void; deshabilitado?: boolean }) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {filtros}
        {resumen && <p className="text-sm text-muted-foreground">{resumen}</p>}
      </div>
      <Button variant="outline" onClick={onExportar} disabled={deshabilitado}>
        <FileDown aria-hidden="true" />
        Exportar a Excel
      </Button>
    </div>
  )
}

export default function ControlReportesPage() {
  useTitulo('Reportes')
  const [params, setParams] = useSearchParams()
  const reporte = reportes.find((r) => r === params.get('reporte')) ?? 'calificaciones'
  return (
    <>
      <PageHeader titulo="Reportes" descripcion="Consulta y exporta la información del ciclo 2026–2027." />
      <Tabs value={reporte} onValueChange={(v) => setParams({ reporte: v }, { replace: true })}>
        <TabsList aria-label="Tipo de reporte">
          <TabsTrigger value="calificaciones">Calificaciones por grupo</TabsTrigger>
          <TabsTrigger value="tareas">Tareas sin entregar</TabsTrigger>
          <TabsTrigger value="pagados">Pagos confirmados</TabsTrigger>
          <TabsTrigger value="pendientes">Pagos pendientes</TabsTrigger>
        </TabsList>
        <TabsContent value="calificaciones">
          <ReporteCalificaciones />
        </TabsContent>
        <TabsContent value="tareas">
          <ReporteTareas />
        </TabsContent>
        <TabsContent value="pagados">
          <ReportePagos estado="pagado" />
        </TabsContent>
        <TabsContent value="pendientes">
          <ReportePagos estado="pendientes" />
        </TabsContent>
      </Tabs>
    </>
  )
}

function SelectorGrupo({ valor, onCambio, conTodos }: { valor: string; onCambio: (v: string) => void; conTodos?: boolean }) {
  const grupos = useGrupos()
  return (
    <Select value={valor} onValueChange={onCambio}>
      <SelectTrigger className="w-52" aria-label="Grupo">
        <SelectValue placeholder="Grupo" />
      </SelectTrigger>
      <SelectContent>
        {conTodos && <SelectItem value="todos">Todos los grupos</SelectItem>}
        {grupos.data?.map((g) => (
          <SelectItem key={g.id} value={g.id}>
            {g.nombre} · {g.nivel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ReporteCalificaciones() {
  const [grupoId, setGrupoId] = useState('g-sec-2a')
  const [periodoId, setPeriodoId] = useState<string | undefined>()
  const consulta = useReporteCalificaciones(grupoId, periodoId)
  const d = consulta.data
  return (
    <>
      <Barra
        filtros={
          <>
            <SelectorGrupo
              valor={grupoId}
              onCambio={(v) => {
                setGrupoId(v)
                setPeriodoId(undefined)
              }}
            />
            <Select value={d?.periodo.id ?? ''} onValueChange={setPeriodoId}>
              <SelectTrigger className="w-56" aria-label="Periodo">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                {d?.periodos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                    {p.estado === 'en-curso' ? ' (en curso)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        deshabilitado={!d}
        onExportar={() =>
          d &&
          exportar(
            `calificaciones-${grupoId}-${d.periodo.nombre.replace(' ', '-').toLowerCase()}`,
            ['Matrícula', 'Alumno', ...d.materias.map((m) => m.nombre), 'Promedio'],
            d.filas.map((f) => [f.matricula, f.alumno, ...f.valores.map((v) => calificacion(v)), calificacion(f.promedio)]),
          )
        }
      />
      <Consulta consulta={consulta} esqueleto={<Skeleton className="h-[30rem] rounded-xl" />}>
        {(r) => (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[48rem] text-sm">
                <caption className="sr-only">Calificaciones de {r.periodo.nombre}</caption>
                <thead className="bg-muted/40">
                  <tr className="border-b">
                    <th scope="col" className="sticky left-0 bg-muted px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Alumno
                    </th>
                    {r.materias.map((m) => (
                      <th key={m.id} scope="col" className="px-2 py-3 text-center text-xs font-medium text-muted-foreground" title={m.nombre}>
                        {m.clave.split('-')[0]}
                        <span className="sr-only"> ({m.nombre})</span>
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-3 text-center text-xs font-semibold">
                      Promedio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {r.filas.map((f) => (
                    <tr key={f.alumnoId} className="border-b last:border-0 hover:bg-muted/40">
                      <th scope="row" className="sticky left-0 bg-card px-4 py-2.5 text-left font-medium whitespace-nowrap">
                        {f.alumno}
                      </th>
                      {f.valores.map((v, i) => (
                        <td key={r.materias[i].id} className="px-2 py-2.5 text-center tabular">
                          <ColorCalificacion valor={v} className="text-sm font-normal" />
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-center">
                        <ColorCalificacion valor={f.promedio} className="text-sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/40">
                  <tr>
                    <th scope="row" className="sticky left-0 bg-muted px-4 py-3 text-left">
                      Promedio del grupo
                    </th>
                    {r.promediosMateria.map((v, i) => (
                      <td key={r.materias[i].id} className="px-2 py-3 text-center font-semibold tabular">
                        {calificacion(v)}
                      </td>
                    ))}
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="border-t px-4 py-3 text-xs text-muted-foreground">
              Claves: {r.materias.map((m) => `${m.clave.split('-')[0]} = ${m.nombre}`).join(' · ')}
            </p>
          </div>
        )}
      </Consulta>
    </>
  )
}

function ReporteTareas() {
  const [grupoId, setGrupoId] = useState('todos')
  const consulta = useReporteSinEntregar(grupoId)
  return (
    <>
      <Barra
        filtros={<SelectorGrupo valor={grupoId} onCambio={setGrupoId} conTodos />}
        resumen={consulta.data && `${plural(consulta.data.length, 'entrega faltante', 'entregas faltantes')} en el periodo en curso`}
        deshabilitado={!consulta.data?.length}
        onExportar={() =>
          consulta.data &&
          exportar(
            'tareas-sin-entregar',
            ['Grupo', 'Alumno', 'Materia', 'Tarea', 'Fecha límite', 'Docente'],
            consulta.data.map((f) => [f.grupo, f.alumno, f.materia, f.tarea, fechaHora(f.fechaLimite), f.docente]),
          )
        }
      />
      <Consulta
        consulta={consulta}
        esqueleto={<Skeleton className="h-[30rem] rounded-xl" />}
        estaVacio={(l) => l.length === 0}
        vacio={<EmptyState icono={FileSearch} titulo="No hay tareas sin entregar" descripcion="Todos los alumnos entregaron sus tareas vencidas en el periodo en curso." />}
      >
        {(filas) => (
          <TablaSimple
            encabezados={['Grupo', 'Alumno', 'Materia', 'Tarea', 'Fecha límite']}
            filas={filas.slice(0, 200).map((f) => [f.grupo, f.alumno, f.materia, f.tarea, fecha(f.fechaLimite)])}
            nota={filas.length > 200 ? `Se muestran 200 de ${numero(filas.length)} filas; el archivo exportado las incluye todas.` : undefined}
          />
        )}
      </Consulta>
    </>
  )
}

function ReportePagos({ estado }: { estado: 'pagado' | 'pendientes' }) {
  const [mes, setMes] = useState(demoConfig.fechaHoy.slice(0, 7))
  const consulta = useReportePagos(estado, mes)
  const total = consulta.data?.reduce((s, f) => s + f.monto, 0) ?? 0
  return (
    <>
      <Barra
        filtros={
          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className="w-52" aria-label="Mes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo el ciclo</SelectItem>
              {mesesCiclo.map((m) => (
                <SelectItem key={m.valor} value={m.valor}>
                  {m.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        resumen={consulta.data && `${plural(consulta.data.length, 'cargo')} · ${moneda(total)}`}
        deshabilitado={!consulta.data?.length}
        onExportar={() =>
          consulta.data &&
          exportar(
            estado === 'pagado' ? `pagos-confirmados-${mes}` : `pagos-pendientes-${mes}`,
            ['Matrícula', 'Alumno', 'Grupo', 'Concepto', 'Vencimiento', 'Monto', 'Estado', 'Fecha de pago', 'Método', 'Referencia'],
            consulta.data.map((f) => [f.matricula, f.alumno, f.grupo, f.concepto, fecha(f.vencimiento), f.monto, f.estado, f.fechaPago ? fecha(f.fechaPago) : null, f.metodo, f.referencia]),
          )
        }
      />
      <Consulta
        consulta={consulta}
        esqueleto={<Skeleton className="h-[30rem] rounded-xl" />}
        estaVacio={(l) => l.length === 0}
        vacio={<EmptyState icono={FileSearch} titulo={estado === 'pagado' ? 'No hay pagos confirmados en ese mes' : 'No hay pagos pendientes en ese mes'} descripcion="Prueba con otro mes o con todo el ciclo." />}
      >
        {(filas) => (
          <TablaSimple
            encabezados={estado === 'pagado' ? ['Alumno', 'Grupo', 'Concepto', 'Monto', 'Pagado el', 'Referencia'] : ['Alumno', 'Grupo', 'Concepto', 'Vencimiento', 'Monto', 'Estado']}
            filas={filas.slice(0, 200).map((f) =>
              estado === 'pagado'
                ? [f.alumno, f.grupo, f.concepto, moneda(f.monto), f.fechaPago ? fecha(f.fechaPago) : '—', f.referencia ?? '—']
                : [f.alumno, f.grupo, f.concepto, fecha(f.vencimiento), moneda(f.monto), <EstadoCargoBadge key="e" estado={f.estado} />],
            )}
            nota={filas.length > 200 ? `Se muestran 200 de ${numero(filas.length)} filas; el archivo exportado las incluye todas.` : undefined}
          />
        )}
      </Consulta>
    </>
  )
}

function TablaSimple({ encabezados, filas, nota }: { encabezados: string[]; filas: ReactNode[][]; nota?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            {encabezados.map((e) => (
              <TableHead key={e}>{e}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((f, i) => (
            <TableRow key={i}>
              {f.map((c, j) => (
                <TableCell key={j} className={j === 0 ? 'font-medium' : undefined}>
                  {c}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {nota && <p className="border-t px-4 py-3 text-xs text-muted-foreground">{nota}</p>}
    </div>
  )
}
