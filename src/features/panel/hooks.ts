import { useQuery } from '@tanstack/react-query'

import { obtenerPanel } from '@/services/control.service'

export function usePanel() {
  return useQuery({ queryKey: ['panel', 'control'], queryFn: obtenerPanel })
}
