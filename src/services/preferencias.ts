/** Preferencias de la demo (no son datos de negocio): tema y simulación de errores. */
import { demoConfig } from '@/config/demo'

export interface PreferenciasDemo {
  simularErrores: boolean
  tema: 'sistema' | 'claro' | 'oscuro'
}

const CLAVE = `${demoConfig.claveAlmacen}:preferencias`
const valoresIniciales: PreferenciasDemo = { simularErrores: false, tema: 'sistema' }

function leer(): PreferenciasDemo {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? { ...valoresIniciales, ...(JSON.parse(crudo) as Partial<PreferenciasDemo>) } : valoresIniciales
  } catch {
    return valoresIniciales
  }
}

let actuales = leer()
const suscriptores = new Set<() => void>()

export function leerPreferenciaDemo<K extends keyof PreferenciasDemo>(clave: K): PreferenciasDemo[K] {
  return actuales[clave]
}

export function obtenerPreferencias(): PreferenciasDemo {
  return actuales
}

export function cambiarPreferencia<K extends keyof PreferenciasDemo>(clave: K, valor: PreferenciasDemo[K]) {
  actuales = { ...actuales, [clave]: valor }
  try {
    localStorage.setItem(CLAVE, JSON.stringify(actuales))
  } catch {
    // Sin almacenamiento: la preferencia dura solo esta sesión.
  }
  suscriptores.forEach((fn) => fn())
}

export function suscribirPreferencias(fn: () => void) {
  suscriptores.add(fn)
  return () => {
    suscriptores.delete(fn)
  }
}
