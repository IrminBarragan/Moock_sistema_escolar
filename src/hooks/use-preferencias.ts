import { useSyncExternalStore } from 'react'

import { cambiarPreferencia, obtenerPreferencias, suscribirPreferencias } from '@/services/preferencias'

const consultaOscuro = '(prefers-color-scheme: dark)'

function suscribirSistema(fn: () => void) {
  const mq = window.matchMedia(consultaOscuro)
  mq.addEventListener('change', fn)
  return () => mq.removeEventListener('change', fn)
}

export function usePreferencias() {
  const preferencias = useSyncExternalStore(suscribirPreferencias, obtenerPreferencias)
  const sistemaOscuro = useSyncExternalStore(suscribirSistema, () => window.matchMedia(consultaOscuro).matches)
  const temaEfectivo: 'light' | 'dark' =
    preferencias.tema === 'oscuro' || (preferencias.tema === 'sistema' && sistemaOscuro) ? 'dark' : 'light'
  return { ...preferencias, temaEfectivo, cambiarPreferencia }
}
