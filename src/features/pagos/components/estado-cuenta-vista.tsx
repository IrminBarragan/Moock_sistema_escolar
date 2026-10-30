import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { fecha, moneda } from '@/lib/format'
import { cn } from '@/lib/utils'
import { nombreMetodo } from '@/services/pagos.service'
import type { CargoVista, EstadoCuenta } from '@/types'
import { EstadoCargoBadge } from './estado-cargo-badge'

/** Estado de cuenta de solo lectura (familia y expediente). */
export function EstadoCuentaVista({ cuenta, accion }: { cuenta: EstadoCuenta; accion?: (c: CargoVista) => ReactNode }) {
  const { resumen } = cuenta
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={cn('rounded-xl border p-4', resumen.vencido > 0 ? 'border-danger/30 bg-danger-soft/60' : 'bg-card')}>
          <p className="text-sm text-muted-foreground">Saldo vencido</p>
          <p className={cn('mt-1 text-2xl font-semibold tabular', resumen.vencido > 0 && 'text-danger')}>{moneda(resumen.vencido)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Próximo pago</p>
          {resumen.proximo ? (
            <>
              <p className="mt-1 text-2xl font-semibold tabular">{moneda(resumen.proximo.total)}</p>
              <p className="text-xs text-muted-foreground">
                {resumen.proximo.descripcion} · vence el {fecha(resumen.proximo.fechaVencimiento)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-2xl font-semibold">—</p>
          )}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pagado en el ciclo</p>
          <p className="mt-1 text-2xl font-semibold tabular">{moneda(resumen.pagado)}</p>
          {cuenta.alumno.beca > 0 && <p className="text-xs text-muted-foreground">Beca de {cuenta.alumno.beca} % en colegiatura</p>}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <ul className="divide-y">
          {cuenta.cargos.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.descripcion}</p>
                <p className="text-xs text-muted-foreground">
                  {c.pago
                    ? `Pagado el ${fecha(c.pago.fechaPago)} · ${nombreMetodo[c.pago.metodo]} · ${c.pago.referencia}`
                    : `Vence el ${fecha(c.fechaVencimiento)}`}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <EstadoCargoBadge estado={c.estado} />
                <span className="w-28 text-right font-semibold tabular">
                  {moneda(c.total)}
                  {c.descuento > 0 && <span className="block text-xs font-normal text-muted-foreground line-through">{moneda(c.monto)}</span>}
                </span>
                {accion?.(c)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function AvisoPagos() {
  return (
    <Alert variant="info">
      <Info aria-hidden="true" />
      <AlertDescription>
        Los pagos se realizan por transferencia, depósito o en caja. Control escolar los confirma en un máximo de dos días hábiles y aparecen aquí como
        pagados.
      </AlertDescription>
    </Alert>
  )
}

export function EstadoCuentaSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}
