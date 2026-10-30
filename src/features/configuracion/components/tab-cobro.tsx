import { Info } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { moneda } from '@/lib/format'
import { cn } from '@/lib/utils'
import { pagosPorPeriodicidad, type Configuracion } from '@/services/configuracion.service'
import type { Periodicidad } from '@/types'
import { useGuardarCobro } from '../hooks'

const opciones: { valor: Periodicidad; nombre: string; detalle: string }[] = [
  { valor: 'mensual', nombre: 'Mensual', detalle: '10 pagos, de septiembre a junio' },
  { valor: 'bimestral', nombre: 'Bimestral', detalle: '5 pagos, cada dos meses' },
  { valor: 'trimestral', nombre: 'Trimestral', detalle: '3 pagos, al inicio de cada trimestre' },
  { valor: 'semestral', nombre: 'Semestral', detalle: '2 pagos, en septiembre y febrero' },
  { valor: 'anual', nombre: 'Anual', detalle: 'Un solo pago al inicio del ciclo' },
  { valor: 'personalizada', nombre: 'Otra', detalle: 'Define el número de pagos' },
]

const meses = ['sep', 'oct', 'nov', 'dic', 'ene', 'feb', 'mar', 'abr', 'may', 'jun']

export function TabCobro({ config }: { config: Configuracion }) {
  const guardar = useGuardarCobro()
  const [periodicidad, setPeriodicidad] = useState<Periodicidad>(config.cobro.periodicidad)
  const [personalizados, setPersonalizados] = useState(String(config.cobro.numeroPagos))
  const [dia, setDia] = useState(String(config.cobro.diaVencimiento))
  const [recargo, setRecargo] = useState(String(config.cobro.recargoPorcentaje))

  const numeroPagos = periodicidad === 'personalizada' ? Number(personalizados) : pagosPorPeriodicidad[periodicidad]
  const errores = {
    pagos: !Number.isInteger(numeroPagos) || numeroPagos < 1 || numeroPagos > 12 ? 'Entre 1 y 12 pagos.' : null,
    dia: !(Number(dia) >= 1 && Number(dia) <= 28) ? 'Del 1 al 28, para que exista en todos los meses.' : null,
    recargo: !(Number(recargo) >= 0 && Number(recargo) <= 20) ? 'Entre 0 % y 20 %.' : null,
  }
  const valido = !errores.pagos && !errores.dia && !errores.recargo
  const calendario = valido ? Array.from({ length: numeroPagos }, (_, i) => meses[Math.floor((i * 10) / numeroPagos)]) : []

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!valido || guardar.isPending) return
    guardar.mutate(
      { periodicidad, numeroPagos, diaVencimiento: Number(dia), recargoPorcentaje: Number(recargo) },
      { onSuccess: () => toast.success('Periodicidad de cobro guardada', { description: `${numeroPagos} ${numeroPagos === 1 ? 'pago' : 'pagos'} al ciclo, con vencimiento el día ${dia}.` }) },
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start" noValidate>
      <div className="grid gap-6 rounded-xl border bg-card p-5">
        <div>
          <h2 className="font-semibold">Periodicidad de cobro de la colegiatura</h2>
          <p className="text-sm text-muted-foreground">Define cada cuánto se generan los cargos de colegiatura para las familias.</p>
        </div>
        <RadioGroup value={periodicidad} onValueChange={(v) => setPeriodicidad(v as Periodicidad)} className="grid gap-2 sm:grid-cols-2" aria-label="Periodicidad">
          {opciones.map((o) => (
            <Label
              key={o.valor}
              htmlFor={`per-${o.valor}`}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 font-normal transition-colors hover:bg-accent/50',
                periodicidad === o.valor && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem id={`per-${o.valor}`} value={o.valor} className="mt-0.5" />
              <span>
                <span className="block font-medium">{o.nombre}</span>
                <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{o.detalle}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          {periodicidad === 'personalizada' && (
            <div className="grid content-start gap-2">
              <Label htmlFor="cobro-pagos">Número de pagos</Label>
              <Input id="cobro-pagos" type="number" min={1} max={12} value={personalizados} onChange={(e) => setPersonalizados(e.target.value)} aria-invalid={errores.pagos ? true : undefined} aria-describedby="cobro-pagos-ayuda" />
              <p id="cobro-pagos-ayuda" className={cn('text-xs', errores.pagos ? 'text-danger' : 'text-muted-foreground')}>
                {errores.pagos ?? 'Entre 1 y 12.'}
              </p>
            </div>
          )}
          <div className="grid content-start gap-2">
            <Label htmlFor="cobro-dia">Día de vencimiento</Label>
            <Input id="cobro-dia" type="number" min={1} max={28} value={dia} onChange={(e) => setDia(e.target.value)} aria-invalid={errores.dia ? true : undefined} aria-describedby="cobro-dia-ayuda" />
            <p id="cobro-dia-ayuda" className={cn('text-xs', errores.dia ? 'text-danger' : 'text-muted-foreground')}>
              {errores.dia ?? 'Del mes en que se cobra.'}
            </p>
          </div>
          <div className="grid content-start gap-2">
            <Label htmlFor="cobro-recargo">Recargo por atraso (%)</Label>
            <Input id="cobro-recargo" type="number" min={0} max={20} value={recargo} onChange={(e) => setRecargo(e.target.value)} aria-invalid={errores.recargo ? true : undefined} aria-describedby="cobro-recargo-ayuda" />
            <p id="cobro-recargo-ayuda" className={cn('text-xs', errores.recargo ? 'text-danger' : 'text-muted-foreground')}>
              {errores.recargo ?? 'Se aplica después del vencimiento.'}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!valido || guardar.isPending}>
            {guardar.isPending ? 'Guardando…' : 'Guardar periodicidad'}
          </Button>
        </div>
      </div>

      <aside className="grid gap-4 rounded-xl border bg-card p-5" aria-labelledby="titulo-vista-previa">
        <h2 id="titulo-vista-previa" className="font-semibold">
          Vista previa
        </h2>
        {valido ? (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Calendario de pagos</p>
              <ol className="mt-2 flex flex-wrap gap-1.5">
                {calendario.map((m, i) => (
                  <li key={i} className="rounded-md bg-muted px-2 py-1 text-xs font-medium tabular">
                    {dia} {m}
                  </li>
                ))}
              </ol>
            </div>
            <dl className="grid gap-2 text-sm">
              {config.colegiaturas.map((c) => (
                <div key={c.nivel} className="flex justify-between border-b pb-2 last:border-0">
                  <dt className="text-muted-foreground">{c.nivel}</dt>
                  <dd className="font-medium tabular">
                    {moneda((c.monto * 10) / numeroPagos)} <span className="font-normal text-muted-foreground">por pago</span>
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Corrige los datos para ver el calendario.</p>
        )}
        <Alert variant="info">
          <Info aria-hidden="true" />
          <AlertDescription>El cambio aplica a los cargos que se generen a partir de ahora. Los cargos ya emitidos en el ciclo actual no se modifican.</AlertDescription>
        </Alert>
      </aside>
    </form>
  )
}
