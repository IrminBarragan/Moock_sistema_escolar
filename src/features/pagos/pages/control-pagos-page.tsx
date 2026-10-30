import { Receipt, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { CampoBusqueda } from '@/components/shared/campo-busqueda'
import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Paginacion } from '@/components/shared/paginacion'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { demoConfig } from '@/config/demo'
import { useDebounce } from '@/hooks/use-debounce'
import { mesesCiclo } from '@/lib/ciclo'
import { useTitulo } from '@/hooks/use-titulo'
import { fecha, moneda, numero } from '@/lib/format'
import { cn } from '@/lib/utils'
import { nombreMetodo } from '@/services/pagos.service'
import type { EstadoCargo, NivelId } from '@/types'
import { ConfirmarPagoDialog, type CargoAConfirmar } from '../components/confirmar-pago-dialog'
import { EstadoCargoBadge } from '../components/estado-cargo-badge'
import { useCargos } from '../hooks'

const estados: { valor: EstadoCargo | 'todos'; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'vencido', etiqueta: 'Vencidos' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'pagado', etiqueta: 'Pagados' },
]

export default function ControlPagosPage() {
  useTitulo('Confirmación de pagos')
  const [params, setParams] = useSearchParams()
  const [texto, setTexto] = useState(params.get('q') ?? '')
  const q = useDebounce(texto, 300)
  const estado = (params.get('estado') ?? 'todos') as EstadoCargo | 'todos'
  const mes = params.get('mes') ?? demoConfig.fechaHoy.slice(0, 7)
  const nivelId = (params.get('nivel') ?? 'todos') as NivelId | 'todos'
  const page = Number(params.get('pagina') ?? 0)
  const consulta = useCargos({ q, estado, mes, nivelId, page, size: 25 })
  const [cargo, setCargo] = useState<CargoAConfirmar | null>(null)

  function cambiar(cambios: Record<string, string | null>) {
    const s = new URLSearchParams(params)
    for (const [k, v] of Object.entries(cambios)) {
      if (v === null) s.delete(k)
      else s.set(k, v)
    }
    if (!('pagina' in cambios)) s.delete('pagina')
    setParams(s, { replace: true })
  }

  const totales = consulta.data?.totales

  return (
    <>
      <PageHeader titulo="Confirmación de pagos" descripcion="Registra los pagos que las familias hicieron por transferencia, depósito o en caja." />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por estado">
        {estados.map((e) => {
          const activo = e.valor === estado
          const cantidad = totales ? (e.valor === 'todos' ? totales.pagado + totales.pendiente + totales.vencido : totales[e.valor]) : null
          return (
            <button
              key={e.valor}
              type="button"
              aria-pressed={activo}
              onClick={() => cambiar({ estado: e.valor === 'todos' ? null : e.valor })}
              className={cn(
                'flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
                activo ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent',
              )}
            >
              {e.etiqueta}
              {cantidad !== null && (
                <span className={cn('rounded-full px-1.5 text-xs tabular', activo ? 'bg-white/20' : 'bg-muted text-muted-foreground')}>{numero(cantidad)}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_12rem]">
        <CampoBusqueda
          valor={texto}
          onCambio={(v) => {
            setTexto(v)
            cambiar({ q: v || null })
          }}
          etiqueta="Buscar por alumno o matrícula"
          placeholder="Alumno o matrícula"
        />
        <Select value={mes} onValueChange={(v) => cambiar({ mes: v })}>
          <SelectTrigger aria-label="Mes de vencimiento">
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
        <Select value={nivelId} onValueChange={(v) => cambiar({ nivel: v === 'todos' ? null : v })}>
          <SelectTrigger aria-label="Nivel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los niveles</SelectItem>
            <SelectItem value="primaria">Primaria</SelectItem>
            <SelectItem value="secundaria">Secundaria</SelectItem>
            <SelectItem value="preparatoria">Preparatoria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Consulta
        consulta={consulta}
        esqueleto={<Skeleton className="h-[32rem] rounded-xl" />}
        estaVacio={(p) => p.totalElements === 0}
        vacio={<EmptyState icono={SearchX} titulo="No hay cargos con esos filtros" descripcion="Prueba con otro mes, estado o nivel." />}
      >
        {(p) => (
          <div className={cn('grid gap-4 transition-opacity', consulta.isPlaceholderData && 'opacity-60')}>
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Acción</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {p.content.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link to={`/control/alumnos/${c.alumno.id}?pestana=pagos`} className="font-medium hover:text-primary hover:underline">
                          {c.alumno.nombre}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {c.alumno.matricula} · {c.grupo}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{c.descripcion}</TableCell>
                      <TableCell className="tabular">{fecha(c.fechaVencimiento)}</TableCell>
                      <TableCell className="text-right font-medium tabular">{moneda(c.total)}</TableCell>
                      <TableCell>
                        <EstadoCargoBadge estado={c.estado} />
                      </TableCell>
                      <TableCell className="text-right">
                        {c.pago ? (
                          <span className="block text-xs text-muted-foreground">
                            {fecha(c.pago.fechaPago)} · {nombreMetodo[c.pago.metodo]}
                            <span className="block">{c.pago.referencia}</span>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={c.estado === 'vencido' ? 'default' : 'outline'}
                            onClick={() => setCargo({ id: c.id, descripcion: c.descripcion, total: c.total, fechaVencimiento: c.fechaVencimiento, alumno: c.alumno.nombre })}
                          >
                            <Receipt aria-hidden="true" />
                            Confirmar pago
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Paginacion
              pagina={p.page}
              totalPaginas={p.totalPages}
              totalElementos={p.totalElements}
              tamano={p.size}
              onCambio={(n) => cambiar({ pagina: String(n) })}
              sustantivo={['cargo', 'cargos']}
            />
          </div>
        )}
      </Consulta>
      <ConfirmarPagoDialog cargo={cargo} onCerrar={() => setCargo(null)} />
    </>
  )
}
