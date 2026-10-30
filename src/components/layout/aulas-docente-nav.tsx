import { NavLink } from 'react-router'

import { MateriaPunto } from '@/components/shared/materia-icono'
import { Skeleton } from '@/components/ui/skeleton'
import { useAulasDocente } from '@/features/aulas/hooks'
import { useSesionActiva } from '@/hooks/use-sesion'
import { cn } from '@/lib/utils'

/** Accesos directos a cada aula del docente en la barra lateral. */
export function AulasDocenteNav({ onNavegar }: { onNavegar?: () => void }) {
  const sesion = useSesionActiva()
  const { data, isPending } = useAulasDocente(sesion.personaId ?? '')
  return (
    <div className="mt-6 flex flex-col gap-0.5">
      <p className="px-3 pb-1.5 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">Aulas</p>
      {isPending && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="mx-3 my-2 h-5" />)}
      {data?.map((a) => (
        <NavLink
          key={a.id}
          to={`/docente/aulas/${a.id}`}
          onClick={onNavegar}
          className={({ isActive }) =>
            cn(
              'flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
              isActive ? 'bg-primary/10 font-medium text-primary dark:bg-primary/15' : 'text-foreground/80 hover:bg-accent hover:text-foreground',
            )
          }
        >
          <MateriaPunto color={a.materia.color} className="ml-1" />
          <span className="min-w-0 flex-1 truncate">
            {a.materia.nombre} · {a.grupo.nombre}
          </span>
          {a.porRevisar > 0 && (
            <span className="rounded-full bg-warning-soft px-1.5 text-xs font-semibold text-warning tabular">
              {a.porRevisar}
              <span className="sr-only"> por revisar</span>
            </span>
          )}
        </NavLink>
      ))}
    </div>
  )
}
