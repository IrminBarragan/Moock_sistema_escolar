/** Formatos en español de México: fechas dd/mm/aaaa, moneda MXN y calificaciones 0–10. */
import { ahoraDemo, demoConfig } from '@/config/demo'

const zona = demoConfig.zonaHoraria

const fmtFecha = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: zona })
const fmtHora = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zona })
const fmtDiaSemana = new Intl.DateTimeFormat('es-MX', { weekday: 'long', timeZone: zona })
const fmtLargo = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: zona })
const fmtMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const fmtNumero = new Intl.NumberFormat('es-MX')
const fmtCalificacion = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Acepta 'aaaa-mm-dd' (fecha local) o un ISO completo. */
function aFecha(valor: string | Date): Date {
  if (valor instanceof Date) return valor
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T12:00:00-06:00`) : new Date(valor)
}

export function fecha(valor: string | Date): string {
  return fmtFecha.format(aFecha(valor))
}

export function fechaHora(valor: string | Date): string {
  const d = aFecha(valor)
  return `${fmtFecha.format(d)}, ${fmtHora.format(d)}`
}

export function hora(valor: string | Date): string {
  return fmtHora.format(aFecha(valor))
}

export function fechaLarga(valor: string | Date): string {
  const texto = fmtLargo.format(aFecha(valor))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function diaSemana(valor: string | Date): string {
  return fmtDiaSemana.format(aFecha(valor))
}

export function moneda(n: number): string {
  return fmtMoneda.format(n)
}

export function numero(n: number): string {
  return fmtNumero.format(n)
}

/** Calificación con un decimal; "—" si no hay valor. */
export function calificacion(n: number | null | undefined): string {
  return n === null || n === undefined ? '—' : fmtCalificacion.format(n)
}

export function tamanoArchivo(kb: number): string {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toLocaleString('es-MX', { maximumFractionDigits: 1 })} MB`
}

export function duracion(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = Math.floor(segundos % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Días naturales entre el "hoy" de la demo y la fecha indicada (negativo si ya pasó). */
export function diasHasta(valor: string | Date, ahora: Date = ahoraDemo()): number {
  const clave = (d: Date) => fmtFecha.format(d).split('/').reverse().join('-')
  const a = new Date(`${clave(ahora)}T00:00:00Z`).getTime()
  const b = new Date(`${clave(aFecha(valor))}T00:00:00Z`).getTime()
  return Math.round((b - a) / 86400000)
}

/** "Vence hoy", "Vence mañana", "Vence en 5 días", "Venció hace 2 días". */
export function vencimientoRelativo(valor: string | Date): string {
  const dias = diasHasta(valor)
  if (dias === 0) return `Vence hoy a las ${hora(valor)}`
  if (dias === 1) return `Vence mañana a las ${hora(valor)}`
  if (dias > 1 && dias < 7) return `Vence el ${diaSemana(valor)} ${fecha(valor)}`
  if (dias >= 7) return `Vence en ${dias} días`
  if (dias === -1) return 'Venció ayer'
  return `Venció hace ${-dias} días`
}

export function haceTiempo(valor: string | Date): string {
  const dias = -diasHasta(valor)
  if (dias <= 0) return `Hoy, ${hora(valor)}`
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  return fecha(valor)
}

export function nombreCompleto(p: { nombre: string; apellidoPaterno: string; apellidoMaterno: string }): string {
  return `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`
}

/** "Domínguez Treviño, Valeria" para listas ordenadas por apellido. */
export function nombreLista(p: { nombre: string; apellidoPaterno: string; apellidoMaterno: string }): string {
  return `${p.apellidoPaterno} ${p.apellidoMaterno}, ${p.nombre}`
}

export function iniciales(nombre: string): string {
  const partes = nombre
    .replace(/^(Mtro\.|Mtra\.|Lic\.|Ing\.|Prof\.|Profa\.|C\.P\.)\s+/, '')
    .split(/\s+/)
    .filter(Boolean)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}

export function plural(n: number, singular: string, pluralForma = `${singular}s`): string {
  return `${numero(n)} ${n === 1 ? singular : pluralForma}`
}
