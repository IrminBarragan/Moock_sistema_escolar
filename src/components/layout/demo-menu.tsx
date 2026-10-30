import { useQueryClient } from '@tanstack/react-query'
import { FlaskConical, LogOut, Monitor, Moon, RotateCcw, Sun, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { roles } from '@/config/roles'
import { usePreferencias } from '@/hooks/use-preferencias'
import { useSesionActiva } from '@/hooks/use-sesion'
import { iniciales } from '@/lib/format'
import { reiniciarDatos } from '@/services/db'
import type { PreferenciasDemo } from '@/services/preferencias'
import { cerrarSesion } from '@/services/sesion'

/** Menú de la cuenta: tema, opciones de la demo y cerrar sesión. */
export function DemoMenu() {
  const sesion = useSesionActiva()
  const { tema, simularErrores, cambiarPreferencia } = usePreferencias()
  const [confirmarReinicio, setConfirmarReinicio] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  function reiniciar() {
    reiniciarDatos()
    queryClient.resetQueries()
    toast.success('La demo volvió a sus datos iniciales')
  }

  function salir() {
    cerrarSesion()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 gap-2 px-1.5 sm:pr-2.5" aria-label={`Cuenta de ${sesion.nombre}`}>
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/12 text-primary">{iniciales(sesion.nombre)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-40 truncate text-sm font-medium xl:inline">{sesion.nombre}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <div className="px-2 py-2">
            <p className="truncate text-sm font-medium">{sesion.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">{sesion.correo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sesion.puesto ?? roles[sesion.rol].nombre}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={tema} onValueChange={(v) => cambiarPreferencia('tema', v as PreferenciasDemo['tema'])}>
            <DropdownMenuRadioItem value="sistema">
              <Monitor aria-hidden="true" /> Como el sistema
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="claro">
              <Sun aria-hidden="true" /> Claro
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oscuro">
              <Moon aria-hidden="true" /> Oscuro
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-1.5">
            <FlaskConical className="size-3.5" aria-hidden="true" /> Opciones de la demo
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={simularErrores}
            onCheckedChange={(v) => {
              cambiarPreferencia('simularErrores', v === true)
              queryClient.invalidateQueries()
            }}
          >
            <WifiOff aria-hidden="true" className="text-muted-foreground" /> Simular error de conexión
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem onSelect={() => setConfirmarReinicio(true)}>
            <RotateCcw aria-hidden="true" /> Reiniciar demo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={salir}>
            <LogOut aria-hidden="true" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmarReinicio} onOpenChange={setConfirmarReinicio}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reiniciar la demo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrarán las entregas, calificaciones, pagos y avisos que se hayan registrado en esta presentación, y todo volverá a
              los datos iniciales. Tu sesión se mantiene.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={reiniciar}>Reiniciar demo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
