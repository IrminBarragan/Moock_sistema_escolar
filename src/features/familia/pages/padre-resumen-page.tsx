import { AlertCircle, ArrowRight, ClipboardList, GraduationCap, PartyPopper, Wallet } from 'lucide-react'
import { Link } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { ListaAvisos } from '@/features/aulas/components/lista-avisos'
import { useAvisosAlumno } from '@/features/aulas/hooks'
import { useBoleta } from '@/features/calificaciones/hooks'
import { useEstadoCuenta } from '@/features/pagos/hooks'
import { TareaItem, TareaItemSkeleton } from '@/features/tareas/components/tarea-item'
import { useTareasAlumno } from '@/features/tareas/hooks'
import { useTitulo } from '@/hooks/use-titulo'
import { calificacion, moneda, plural } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useHijo } from '../hooks'

export default function PadreResumenPage() {
  const { hijo } = useHijo()
  const nombre = hijo.nombre.split(' ')[0]
  useTitulo(`Resumen de ${nombre}`)
  const boleta = useBoleta(hijo.id)
  const tareas = useTareasAlumno(hijo.id)
  const avisos = useAvisosAlumno(hijo.id)
  const cuenta = useEstadoCuenta(hijo.id)

  const pendientes = tareas.data?.filter((t) => t.estado === 'pendiente').sort((a, b) => a.tarea.fechaLimite.localeCompare(b.tarea.fechaLimite)) ?? []
  const vencidas = tareas.data?.filter((t) => t.estado === 'vencida').length ?? 0

  return (
    <>
      <PageHeader titulo={`Resumen de ${nombre}`} descripcion={`${hijo.grupo.nombre} · ${hijo.grupo.nivel} · Ciclo 2026–2027`} />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador
          to="/padre/calificaciones"
          icono={GraduationCap}
          etiqueta="Promedio general"
          cargando={boleta.isPending}
          valor={calificacion(boleta.data?.promedioGeneral)}
        />
        <Indicador
          to="/padre/tareas"
          icono={ClipboardList}
          etiqueta="Tareas pendientes"
          cargando={tareas.isPending}
          valor={String(pendientes.length)}
          detalle={vencidas > 0 ? plural(vencidas, 'vencida sin entregar', 'vencidas sin entregar') : undefined}
          detalleAlerta={vencidas > 0}
        />
        <Indicador
          to="/padre/estado-de-cuenta"
          icono={Wallet}
          etiqueta="Saldo vencido"
          cargando={cuenta.isPending}
          valor={moneda(cuenta.data?.resumen.vencido ?? 0)}
          alerta={(cuenta.data?.resumen.vencido ?? 0) > 0}
          detalle={(cuenta.data?.resumen.vencido ?? 0) > 0 ? 'Revisa el estado de cuenta' : 'Al corriente'}
        />
        <Indicador
          to="/padre/tareas?estado=calificadas"
          icono={GraduationCap}
          etiqueta="Tareas calificadas"
          cargando={tareas.isPending}
          valor={String(tareas.data?.filter((t) => t.estado === 'calificada').length ?? 0)}
          detalle="en el ciclo"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <section aria-labelledby="titulo-proximas">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="titulo-proximas" className="text-lg font-semibold">
              Próximas entregas
            </h2>
            <Link to="/padre/tareas" className="text-sm font-medium text-primary hover:underline">
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
            {() =>
              pendientes.length === 0 ? (
                <EmptyState icono={PartyPopper} titulo={`${nombre} está al día`} descripcion="No tiene tareas pendientes por ahora." compacto />
              ) : (
                <ul className="grid gap-2">
                  {pendientes.slice(0, 5).map((t) => (
                    <li key={t.tarea.id}>
                      <TareaItem item={t} to={`/padre/tareas/${t.tarea.id}`} />
                    </li>
                  ))}
                </ul>
              )
            }
          </Consulta>
        </section>

        <section aria-labelledby="titulo-avisos">
          <h2 id="titulo-avisos" className="mb-3 text-lg font-semibold">
            Avisos
          </h2>
          <Consulta consulta={avisos} esqueleto={<Skeleton className="h-40 rounded-xl" />}>
            {(lista) => <ListaAvisos avisos={lista} mostrarOrigen limite={4} />}
          </Consulta>
        </section>
      </div>
    </>
  )
}

interface PropsIndicador {
  to: string
  icono: typeof Wallet
  etiqueta: string
  valor: string
  detalle?: string
  alerta?: boolean
  /** Resalta solo el detalle, sin alarmar todo el indicador. */
  detalleAlerta?: boolean
  cargando: boolean
}

function Indicador({ to, icono: Icono, etiqueta, valor, detalle, alerta, detalleAlerta, cargando }: PropsIndicador) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors hover:border-primary/35 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
        alerta && 'border-danger/30 bg-danger-soft/50',
      )}
    >
      <span className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Icono className="size-4" aria-hidden="true" />
          {etiqueta}
        </span>
        <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </span>
      {cargando ? <Skeleton className="mt-1 h-8 w-20" /> : <span className={cn('text-2xl font-semibold tabular', alerta && 'text-danger')}>{valor}</span>}
      {detalle && !cargando && (
        <span className={cn('flex items-center gap-1 text-xs', alerta || detalleAlerta ? 'text-danger' : 'text-muted-foreground')}>
          {(alerta || detalleAlerta) && <AlertCircle className="size-3.5" aria-hidden="true" />}
          {detalle}
        </span>
      )}
    </Link>
  )
}
