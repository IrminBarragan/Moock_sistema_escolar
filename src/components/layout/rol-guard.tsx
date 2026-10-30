import { ShieldAlert } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation } from 'react-router'

import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { roles } from '@/config/roles'
import { useSesion } from '@/hooks/use-sesion'
import type { Rol } from '@/types'

/**
 * Protege las rutas de un rol. En el sistema real el backend devolvería 403;
 * aquí solo se oculta lo que el rol no puede ver.
 */
export function RolGuard({ rol }: { rol: Rol }) {
  const sesion = useSesion()
  const ubicacion = useLocation()
  if (!sesion) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  if (sesion.rol !== rol) {
    return (
      <EmptyState
        icono={ShieldAlert}
        titulo="No tienes acceso a esta sección"
        descripcion={`Esta página es para ${roles[rol].nombre.toLowerCase()}. Cambia de rol con el selector de arriba o regresa a tu inicio.`}
        accion={
          <Button asChild>
            <Link to={roles[sesion.rol].inicio}>Ir a mi inicio</Link>
          </Button>
        }
        className="mt-8"
      />
    )
  }
  return <Outlet />
}

/** Exige sesión para mostrar el layout de la aplicación. */
export function SesionGuard() {
  const sesion = useSesion()
  const ubicacion = useLocation()
  if (!sesion) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  return <Outlet />
}
