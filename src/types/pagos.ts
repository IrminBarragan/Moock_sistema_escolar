/** Conceptos de cobro, cargos y pagos confirmados. */
import type { NivelId } from './escolar'

export type Periodicidad = 'mensual' | 'bimestral' | 'trimestral' | 'semestral' | 'anual' | 'personalizada'

export interface ConfiguracionCobro {
  periodicidad: Periodicidad
  /** Número de pagos en el ciclo cuando la periodicidad es personalizada. */
  numeroPagos: number
  diaVencimiento: number
  recargoPorcentaje: number
}

export interface ConceptoCobro {
  id: string
  nombre: string
  tipo: 'inscripcion' | 'colegiatura' | 'cuota'
  montos: Record<NivelId, number>
}

export interface Cargo {
  id: string
  alumnoId: string
  conceptoId: string
  descripcion: string
  monto: number
  descuento: number
  fechaVencimiento: string
  pagoId: string | null
}

export type EstadoCargo = 'pendiente' | 'pagado' | 'vencido'

export type MetodoPago = 'transferencia' | 'deposito' | 'efectivo' | 'tarjeta'

export interface Pago {
  id: string
  cargoId: string
  monto: number
  metodo: MetodoPago
  referencia: string
  fechaPago: string
  confirmadoPor: string
  confirmadoEl: string
}
