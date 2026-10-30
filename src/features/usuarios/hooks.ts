import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { buscarUsuarios, cambiarEstadoUsuario, type FiltrosUsuarios } from '@/services/usuarios.service'

export function useUsuarios(filtros: FiltrosUsuarios) {
  return useQuery({ queryKey: ['usuarios', filtros], queryFn: () => buscarUsuarios(filtros), placeholderData: (p) => p })
}

export function useCambiarEstadoUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => cambiarEstadoUsuario(id, activo),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: ['usuarios'] }), qc.invalidateQueries({ queryKey: ['bitacora'] })]),
  })
}
