import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { buscarCargos, confirmarPago, obtenerEstadoCuenta, type DatosPago, type FiltrosCargos } from '@/services/pagos.service'

export function useEstadoCuenta(alumnoId: string | undefined) {
  return useQuery({ queryKey: ['pagos', 'cuenta', alumnoId], queryFn: () => obtenerEstadoCuenta(alumnoId!), enabled: Boolean(alumnoId) })
}

export function useCargos(filtros: FiltrosCargos) {
  return useQuery({ queryKey: ['pagos', 'cargos', filtros], queryFn: () => buscarCargos(filtros), placeholderData: (previo) => previo })
}

export function useConfirmarPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cargoId, ...datos }: DatosPago & { cargoId: string }) => confirmarPago(cargoId, datos),
    onSuccess: () => Promise.all(['pagos', 'panel', 'reportes', 'alumnos', 'bitacora'].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  })
}
