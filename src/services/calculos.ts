/**
 * Reglas de negocio puras (sin acceso a datos). En el sistema real vivirían en
 * el backend; aquí se centralizan para que todas las pantallas calculen igual.
 */
import type { Cargo, Entrega, EstadoCargo, EstadoPeriodo, EstadoTarea, Evaluacion, PeriodoEvaluacion, Tarea } from '@/types'

/** Ponderación de la calificación del periodo. */
export const PONDERACION = { tareas: 0.4, examen: 0.4, participacion: 0.2 } as const

export function estadoTarea(tarea: Tarea, entrega: Entrega | undefined, ahora: Date): EstadoTarea {
  if (entrega) {
    if (entrega.calificacion !== null) return 'calificada'
    return new Date(entrega.entregadaEl) > new Date(tarea.fechaLimite) ? 'tarde' : 'entregada'
  }
  return ahora > new Date(tarea.fechaLimite) ? 'vencida' : 'pendiente'
}

export function fueEntregaTardia(tarea: Tarea, entrega: Entrega): boolean {
  return new Date(entrega.entregadaEl) > new Date(tarea.fechaLimite)
}

export function redondear1(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * Promedio de tareas del periodo. Cuenta las calificadas y, como 0, las que
 * vencieron sin entrega. Las entregadas sin calificar aún no cuentan.
 */
export function promedioTareas(tareas: Tarea[], entregaDe: (tareaId: string) => Entrega | undefined, ahora: Date): number | null {
  const valores: number[] = []
  for (const t of tareas) {
    const e = entregaDe(t.id)
    if (e?.calificacion != null) valores.push(e.calificacion)
    else if (!e && ahora > new Date(t.fechaLimite)) valores.push(0)
  }
  return valores.length ? redondear1(valores.reduce((a, b) => a + b, 0) / valores.length) : null
}

/** Calificación del periodo con ponderación; si falta un componente, se reparte su peso. */
export function calificacionPeriodo(tareas: number | null, evaluacion: Pick<Evaluacion, 'examen' | 'participacion'> | undefined): number | null {
  const partes: [number | null, number][] = [
    [tareas, PONDERACION.tareas],
    [evaluacion?.examen ?? null, PONDERACION.examen],
    [evaluacion?.participacion ?? null, PONDERACION.participacion],
  ]
  const presentes = partes.filter((p): p is [number, number] => p[0] !== null)
  if (presentes.length === 0) return null
  const peso = presentes.reduce((a, [, w]) => a + w, 0)
  return redondear1(presentes.reduce((a, [v, w]) => a + v * w, 0) / peso)
}

export function promedio(valores: (number | null | undefined)[]): number | null {
  const v = valores.filter((x): x is number => typeof x === 'number')
  return v.length ? redondear1(v.reduce((a, b) => a + b, 0) / v.length) : null
}

export function estadoPeriodo(periodo: PeriodoEvaluacion, hoy: string): EstadoPeriodo {
  if (hoy > periodo.fin) return 'cerrado'
  if (hoy < periodo.inicio) return 'proximo'
  return 'en-curso'
}

export function estadoCargo(cargo: Cargo, hoy: string): EstadoCargo {
  if (cargo.pagoId) return 'pagado'
  return hoy > cargo.fechaVencimiento ? 'vencido' : 'pendiente'
}

export function totalCargo(cargo: Cargo): number {
  return cargo.monto - cargo.descuento
}
