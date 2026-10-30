import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router'

import { listarHijos, type Hijo } from '@/services/familia.service'

export function useHijos(tutorId: string) {
  return useQuery({ queryKey: ['familia', tutorId], queryFn: () => listarHijos(tutorId) })
}

/** Hijo activo, entregado por el layout del padre a sus pantallas. */
export function useHijo() {
  return useOutletContext<{ hijo: Hijo; hijos: Hijo[] }>()
}
