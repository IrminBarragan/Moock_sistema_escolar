/**
 * Parámetros de la demo.
 *
 * La fecha está fija para que los vencimientos y estados se vean igual
 * sin importar el día en que se presente: con la fecha real, un
 * "vence mañana" se convertiría en "vencida hace semanas".
 */
export const demoConfig = {
  /** "Hoy" dentro de la demo (hora del centro de México). */
  fechaHoy: '2027-01-20',
  zonaHoraria: 'America/Mexico_City',
  /** Retraso simulado de cada petición, en milisegundos. */
  retrasoMinMs: 250,
  retrasoMaxMs: 650,
  /** Prefijo de las claves de localStorage. Cambiarlo invalida datos guardados. */
  claveAlmacen: 'colegio-demo:v1',
} as const

/** Fecha y hora "actual" de la demo: la fecha fija con la hora real del reloj. */
export function ahoraDemo(): Date {
  const real = new Date()
  const [y, m, d] = demoConfig.fechaHoy.split('-').map(Number)
  const fecha = new Date(real)
  fecha.setFullYear(y, m - 1, d)
  return fecha
}

export function ahoraDemoISO(): string {
  return ahoraDemo().toISOString()
}
