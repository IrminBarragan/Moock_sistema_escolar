import { Users } from 'lucide-react'
import { Outlet, useMatch, useNavigate } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSesionActiva } from '@/hooks/use-sesion'
import { cn } from '@/lib/utils'
import { elegirHijo, useHijoGuardado } from '../hijo-seleccionado'
import { useHijos } from '../hooks'

/** Envuelve las pantallas del padre con el selector de hijo. */
export default function PadreLayout() {
  const sesion = useSesionActiva()
  const consulta = useHijos(sesion.personaId!)
  const guardado = useHijoGuardado()
  const navigate = useNavigate()
  const enDetalleTarea = useMatch('/padre/tareas/:tareaId')

  function cambiarHijo(id: string) {
    elegirHijo(id)
    // Una tarea pertenece a un solo alumno: al cambiar de hijo se vuelve a la lista.
    if (enDetalleTarea) navigate('/padre/tareas')
  }

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-6">
          <Skeleton className="h-14 w-full max-w-md rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
      estaVacio={(h) => h.length === 0}
      vacio={
        <EmptyState
          icono={Users}
          titulo="No tienes alumnos vinculados"
          descripcion="Pide a control escolar que vincule tu cuenta con la de tus hijos."
        />
      }
    >
      {(hijos) => {
        const hijo = hijos.find((h) => h.id === guardado) ?? hijos[0]
        return (
          <>
            {hijos.length > 1 && (
              <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <div role="group" aria-label="Hijo que estás consultando" className="flex w-max gap-2 rounded-xl border bg-muted/50 p-1">
                  {hijos.map((h) => {
                    const activo = h.id === hijo.id
                    return (
                      <button
                        key={h.id}
                        type="button"
                        aria-pressed={activo}
                        onClick={() => cambiarHijo(h.id)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg py-1.5 pr-4 pl-1.5 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
                          activo ? 'bg-card shadow-xs' : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <Avatar className="size-9" aria-hidden="true">
                          <AvatarFallback className={cn(activo && 'bg-primary text-primary-foreground')}>{h.iniciales}</AvatarFallback>
                        </Avatar>
                        <span>
                          <span className="block text-sm font-medium text-foreground">{h.nombre.split(' ')[0]}</span>
                          <span className="block text-xs">
                            {h.grupo.nombre} · {h.grupo.nivel}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <Outlet context={{ hijo, hijos }} />
          </>
        )
      }}
    </Consulta>
  )
}
