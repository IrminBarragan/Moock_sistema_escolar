import { Navigate } from 'react-router'

import { roles } from '@/config/roles'
import { useSesion } from '@/hooks/use-sesion'

/** La raíz manda al inicio del rol activo o al inicio de sesión. */
export function Inicio() {
  const sesion = useSesion()
  return <Navigate to={sesion ? roles[sesion.rol].inicio : '/login'} replace />
}
