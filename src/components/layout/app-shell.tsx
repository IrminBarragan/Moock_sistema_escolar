import { CalendarDays, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router'

import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { demoConfig } from '@/config/demo'
import { navegacion, rolesConBarraInferior } from '@/config/navigation'
import { roles } from '@/config/roles'
import { useSesionActiva } from '@/hooks/use-sesion'
import { fecha, fechaLarga } from '@/lib/format'
import { AulasDocenteNav } from './aulas-docente-nav'
import { BottomNav } from './bottom-nav'
import { DemoMenu } from './demo-menu'
import { NavLinks } from './nav-links'
import { PrototypeBanner } from './prototype-banner'
import { RoleSwitcher } from './role-switcher'

export function AppShell() {
  const sesion = useSesionActiva()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const grupos = navegacion[sesion.rol]
  const conBarraInferior = rolesConBarraInferior.includes(sesion.rol)

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <PrototypeBanner />
      <div className="flex flex-1">
        <div className="hidden w-64 shrink-0 border-r bg-sidebar lg:block">
        <aside className="sticky top-7 flex h-[calc(100dvh-1.75rem)] flex-col">
          <Link to={roles[sesion.rol].inicio} className="flex h-16 items-center px-5" aria-label="Ir al inicio">
            <Logo subtitulo="Plataforma escolar" />
          </Link>
          <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-4">
            <NavLinks grupos={grupos} />
            {sesion.rol === 'docente' && <AulasDocenteNav />}
          </nav>
          <div className="border-t px-5 py-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground/80">Ciclo escolar 2026–2027</p>
            <p className="mt-0.5 flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Hoy en la demo: {fecha(demoConfig.fechaHoy)}
            </p>
          </div>
        </aside>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-7 z-30 flex h-16 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 lg:px-8">
            {!conBarraInferior && (
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            )}
            <Link to={roles[sesion.rol].inicio} className="min-w-0 lg:hidden" aria-label="Ir al inicio">
              <Logo conNombre={false} className="sm:hidden" />
              <Logo className="hidden sm:flex" />
            </Link>
            <p className="hidden text-sm text-muted-foreground lg:block">{fechaLarga(demoConfig.fechaHoy)}</p>
            <div className="ml-auto flex items-center gap-1 sm:gap-3">
              <RoleSwitcher compacto className="sm:hidden" />
              <RoleSwitcher className="hidden sm:flex" />
              <DemoMenu />
            </div>
          </header>

          <main
            id="contenido"
            tabIndex={-1}
            className={
              conBarraInferior
                ? 'mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 outline-none sm:px-6 lg:px-8 lg:pt-8 lg:pb-12'
                : 'mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-12 outline-none sm:px-6 lg:px-8 lg:pt-8'
            }
          >
            <Outlet />
          </main>
        </div>
      </div>

      {conBarraInferior && <BottomNav grupos={grupos} />}

      {!conBarraInferior && (
        <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
          <SheetContent side="left" className="gap-0 p-0">
            <SheetHeader className="border-b">
              <SheetTitle asChild>
                <div>
                  <Logo />
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">Menú de {roles[sesion.rol].nombre}</SheetDescription>
            </SheetHeader>
            <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks grupos={grupos} onNavegar={() => setMenuAbierto(false)} />
              {sesion.rol === 'docente' && <AulasDocenteNav onNavegar={() => setMenuAbierto(false)} />}
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
