import { NavLink } from 'react-router'

import type { GrupoNavegacion } from '@/config/navigation'
import { cn } from '@/lib/utils'

/** Barra inferior para alumno y padre en el celular. */
export function BottomNav({ grupos }: { grupos: GrupoNavegacion[] }) {
  const items = grupos.flatMap((g) => g.items)
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-card/85 lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.exacta}
              className={({ isActive }) =>
                cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                      isActive && 'bg-primary/12',
                    )}
                  >
                    <item.icono className="size-5" aria-hidden="true" />
                  </span>
                  {item.corta ?? item.etiqueta}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
