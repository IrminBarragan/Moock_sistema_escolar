import { useSyncExternalStore } from 'react'

import { obtenerSesion, suscribirSesion } from '@/services/sesion'

export function useSesion() {
  return useSyncExternalStore(suscribirSesion, obtenerSesion)
}

/** Para pantallas dentro de un rol: la sesión siempre existe (la protege el guardia de ruta). */
export function useSesionActiva() {
  const sesion = useSesion()
  if (!sesion) throw new Error('No hay sesión activa')
  return sesion
}
