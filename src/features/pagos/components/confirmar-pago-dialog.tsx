import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { demoConfig } from '@/config/demo'
import { fecha, moneda } from '@/lib/format'
import { nombreMetodo } from '@/services/pagos.service'
import type { MetodoPago } from '@/types'
import { useConfirmarPago } from '../hooks'

export interface CargoAConfirmar {
  id: string
  descripcion: string
  total: number
  fechaVencimiento: string
  alumno: string
}

const ayudaReferencia: Record<MetodoPago, string> = {
  transferencia: 'Clave de rastreo o número de referencia SPEI del comprobante.',
  deposito: 'Folio del comprobante de depósito.',
  efectivo: 'Número de recibo de caja.',
  tarjeta: 'Número de autorización de la terminal.',
}

export function ConfirmarPagoDialog({ cargo, onCerrar }: { cargo: CargoAConfirmar | null; onCerrar: () => void }) {
  return (
    <Dialog open={cargo !== null} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent>{cargo && <Formulario cargo={cargo} onCerrar={onCerrar} />}</DialogContent>
    </Dialog>
  )
}

function Formulario({ cargo, onCerrar }: { cargo: CargoAConfirmar; onCerrar: () => void }) {
  const confirmar = useConfirmarPago()
  const [metodo, setMetodo] = useState<MetodoPago>('transferencia')
  const [referencia, setReferencia] = useState('')
  const [fechaPago, setFechaPago] = useState<string>(demoConfig.fechaHoy)
  const [intentado, setIntentado] = useState(false)
  const errores = {
    referencia: intentado && !referencia.trim() ? 'Captura la referencia o folio para poder rastrear el pago.' : null,
    fecha: intentado && (!fechaPago || fechaPago > demoConfig.fechaHoy) ? `La fecha debe ser igual o anterior a hoy (${fecha(demoConfig.fechaHoy)}).` : null,
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    if (!referencia.trim() || !fechaPago || fechaPago > demoConfig.fechaHoy || confirmar.isPending) return
    confirmar.mutate(
      { cargoId: cargo.id, metodo, referencia, fechaPago },
      {
        onSuccess: () => {
          toast.success('Pago confirmado', { description: `${cargo.descripcion} · ${cargo.alumno} · ${moneda(cargo.total)}` })
          onCerrar()
        },
      },
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Confirmar pago</DialogTitle>
        <DialogDescription>Registra el pago que la familia ya realizó. La familia lo verá como pagado en su estado de cuenta.</DialogDescription>
      </DialogHeader>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg bg-muted/60 p-4 text-sm">
        <dt className="text-muted-foreground">Alumno</dt>
        <dd className="font-medium">{cargo.alumno}</dd>
        <dt className="text-muted-foreground">Concepto</dt>
        <dd>{cargo.descripcion}</dd>
        <dt className="text-muted-foreground">Vencimiento</dt>
        <dd>{fecha(cargo.fechaVencimiento)}</dd>
        <dt className="text-muted-foreground">Monto</dt>
        <dd className="text-base font-semibold tabular">{moneda(cargo.total)}</dd>
      </dl>
      <div className="grid gap-2">
        <Label htmlFor="pago-metodo">Método de pago</Label>
        <Select value={metodo} onValueChange={(v) => setMetodo(v as MetodoPago)}>
          <SelectTrigger id="pago-metodo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(nombreMetodo) as MetodoPago[]).map((m) => (
              <SelectItem key={m} value={m}>
                {nombreMetodo[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pago-referencia">Referencia o folio</Label>
        <Input
          id="pago-referencia"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          autoComplete="off"
          aria-invalid={errores.referencia ? true : undefined}
          aria-describedby={errores.referencia ? 'pago-referencia-error' : 'pago-referencia-ayuda'}
        />
        {errores.referencia ? (
          <p id="pago-referencia-error" className="text-sm text-danger">
            {errores.referencia}
          </p>
        ) : (
          <p id="pago-referencia-ayuda" className="text-xs text-muted-foreground">
            {ayudaReferencia[metodo]}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pago-fecha">Fecha de pago</Label>
        <Input
          id="pago-fecha"
          type="date"
          max={demoConfig.fechaHoy}
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
          aria-invalid={errores.fecha ? true : undefined}
          aria-describedby={errores.fecha ? 'pago-fecha-error' : undefined}
        />
        {errores.fecha && (
          <p id="pago-fecha-error" className="text-sm text-danger">
            {errores.fecha}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={confirmar.isPending}>
          {confirmar.isPending ? 'Confirmando…' : `Confirmar ${moneda(cargo.total)}`}
        </Button>
      </DialogFooter>
    </form>
  )
}
