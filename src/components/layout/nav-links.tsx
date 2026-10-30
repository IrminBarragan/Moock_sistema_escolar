import { NavLink } from 'react-router'

import type { GrupoNavegacion } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function NavLinks({ grupos, onNavegar }: { grupos: GrupoNavegacion[]; onNavegar?: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      {grupos.map((grupo, i) => (
        <div key={grupo.titulo ?? i} className="flex flex-col gap-0.5">
          {grupo.titulo && (
            <p className="px-3 pb-1.5 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">{grupo.titulo}</p>
          )}
          {grupo.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exacta}
              onClick={onNavegar}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/15'
                    : 'text-foreground/80 hover:bg-accent hover:text-foreground',
                )
              }
            >
              <item.icono className="size-[1.125rem] shrink-0" aria-hidden="true" />
              <span className="truncate">{item.etiqueta}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  )
}
