import { useSyncExternalStore } from 'react'

import { demoConfig } from '@/config/demo'

/** Hijo que el tutor está consultando; se recuerda entre pantallas y recargas. */
const CLAVE = `${demoConfig.claveAlmacen}:hijo`
const suscriptores = new Set<() => void>()

function leer(): string | null {
  try {
    return localStorage.getItem(CLAVE)
  } catch {
    return null
  }
}

let actual = leer()

export function elegirHijo(id: string) {
  actual = id
  try {
    localStorage.setItem(CLAVE, id)
  } catch {
    // Sin almacenamiento: la elección dura mientras la pestaña esté abierta.
  }
  suscriptores.forEach((fn) => fn())
}

export function useHijoGuardado() {
  return useSyncExternalStore(
    (fn) => {
      suscriptores.add(fn)
      return () => {
        suscriptores.delete(fn)
      }
    },
    () => actual,
  )
}
