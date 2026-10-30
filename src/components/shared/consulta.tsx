import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ErrorState } from './error-state'

interface Props<T> {
  consulta: UseQueryResult<T>
  esqueleto: ReactNode
  /** Si devuelve true, se muestra `vacio` en lugar del contenido. */
  estaVacio?: (datos: T) => boolean
  vacio?: ReactNode
  children: (datos: T) => ReactNode
}

/** Resuelve los estados de una consulta: carga, error, vacío y contenido. */
export function Consulta<T>({ consulta, esqueleto, estaVacio, vacio, children }: Props<T>) {
  if (consulta.isPending) {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Cargando…</span>
        {esqueleto}
      </div>
    )
  }
  if (consulta.isError) return <ErrorState error={consulta.error} onReintentar={() => void consulta.refetch()} />
  if (estaVacio?.(consulta.data) && vacio) return <>{vacio}</>
  return <>{children(consulta.data)}</>
}
