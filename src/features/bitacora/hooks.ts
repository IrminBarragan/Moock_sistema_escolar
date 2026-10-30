import { useQuery } from '@tanstack/react-query'

import { buscarBitacora, type FiltrosBitacora } from '@/services/bitacora.service'

export function useBitacora(filtros: FiltrosBitacora) {
  return useQuery({ queryKey: ['bitacora', filtros], queryFn: () => buscarBitacora(filtros), placeholderData: (p) => p })
}
