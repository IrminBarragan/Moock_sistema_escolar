import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ordenRoles, roles } from '@/config/roles'
import { useSesionActiva } from '@/hooks/use-sesion'
import { cn } from '@/lib/utils'
import { entrarComo } from '@/services/sesion'
import type { Rol } from '@/types'

/** Selector para cambiar de rol durante una presentación sin cerrar sesión. */
export function RoleSwitcher({ className, compacto }: { className?: string; compacto?: boolean }) {
  const sesion = useSesionActiva()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  function cambiar(rol: string) {
    entrarComo(rol as Rol)
    queryClient.removeQueries({ queryKey: ['perfil'] })
    navigate(roles[rol as Rol].inicio)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!compacto && (
        <span id="etiqueta-rol" className="text-xs font-medium whitespace-nowrap text-muted-foreground">
          Ver como
        </span>
      )}
      <Select value={sesion.rol} onValueChange={cambiar}>
        <SelectTrigger
          size="sm"
          aria-labelledby={compacto ? undefined : 'etiqueta-rol'}
          aria-label={compacto ? 'Cambiar de rol' : undefined}
          className={cn('h-9 bg-card font-medium', compacto ? 'w-[9.5rem]' : 'w-[15rem]')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {ordenRoles.map((r) => (
            <SelectItem key={r} value={r}>
              {roles[r].nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
