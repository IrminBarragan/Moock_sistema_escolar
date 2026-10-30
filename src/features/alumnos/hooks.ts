import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  buscarAlumnos,
  cambiarGrupo,
  confirmarImportacion,
  obtenerExpediente,
  validarImportacion,
  type FilaImportacion,
  type FiltrosAlumnos,
} from '@/services/control.service'

export function useAlumnos(filtros: FiltrosAlumnos) {
  return useQuery({ queryKey: ['alumnos', 'lista', filtros], queryFn: () => buscarAlumnos(filtros), placeholderData: (previo) => previo })
}

export function useExpediente(alumnoId: string) {
  return useQuery({ queryKey: ['alumnos', 'expediente', alumnoId], queryFn: () => obtenerExpediente(alumnoId) })
}

const raicesControl = ['alumnos', 'grupos', 'panel', 'reportes', 'pagos', 'boleta', 'aulas', 'bitacora', 'usuarios']

export function useInvalidarControl() {
  const qc = useQueryClient()
  return () => Promise.all(raicesControl.map((k) => qc.invalidateQueries({ queryKey: [k] })))
}

export function useCambiarGrupo() {
  const invalidar = useInvalidarControl()
  return useMutation({ mutationFn: ({ alumnoId, grupoId }: { alumnoId: string; grupoId: string }) => cambiarGrupo(alumnoId, grupoId), onSuccess: invalidar })
}

export function useValidarImportacion() {
  return useMutation({ mutationFn: (archivo: string) => validarImportacion(archivo), meta: { silenciarError: true } })
}

export function useConfirmarImportacion() {
  const invalidar = useInvalidarControl()
  return useMutation({ mutationFn: (filas: FilaImportacion[]) => confirmarImportacion(filas), onSuccess: invalidar })
}
