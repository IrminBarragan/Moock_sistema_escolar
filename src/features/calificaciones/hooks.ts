import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidarAcademico } from '@/lib/consultas'
import { guardarPlanilla, obtenerBoleta, obtenerPlanilla } from '@/services/calificaciones.service'
import type { CambioPlanilla } from '@/types'

export function usePlanilla(aulaId: string, periodoId: string | undefined) {
  return useQuery({
    queryKey: ['planilla', aulaId, periodoId ?? 'actual'],
    queryFn: () => obtenerPlanilla(aulaId, periodoId),
    placeholderData: (previo) => previo,
  })
}

export function useGuardarPlanilla(aulaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ periodoId, cambios }: { periodoId: string; cambios: CambioPlanilla[] }) => guardarPlanilla(aulaId, periodoId, cambios),
    onSuccess: () => invalidarAcademico(qc),
  })
}

export function useBoleta(alumnoId: string | undefined) {
  return useQuery({ queryKey: ['boleta', alumnoId], queryFn: () => obtenerBoleta(alumnoId!), enabled: Boolean(alumnoId) })
}
