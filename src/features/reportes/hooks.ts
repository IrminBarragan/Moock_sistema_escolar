import { useQuery } from '@tanstack/react-query'

import { reporteCalificaciones, reportePagos, reporteTareasSinEntregar } from '@/services/reportes.service'

export function useReporteCalificaciones(grupoId: string, periodoId?: string) {
  return useQuery({
    queryKey: ['reportes', 'calificaciones', grupoId, periodoId ?? 'ultimo'],
    queryFn: () => reporteCalificaciones(grupoId, periodoId),
    placeholderData: (p) => p,
  })
}

export function useReporteSinEntregar(grupoId: string) {
  return useQuery({ queryKey: ['reportes', 'sin-entregar', grupoId], queryFn: () => reporteTareasSinEntregar(grupoId), placeholderData: (p) => p })
}

export function useReportePagos(estado: 'pagado' | 'pendientes', mes: string) {
  return useQuery({ queryKey: ['reportes', 'pagos', estado, mes], queryFn: () => reportePagos(estado, mes), placeholderData: (p) => p })
}
