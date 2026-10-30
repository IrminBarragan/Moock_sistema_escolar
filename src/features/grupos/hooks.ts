import { useMutation, useQuery } from '@tanstack/react-query'

import { useInvalidarControl } from '@/features/alumnos/hooks'
import { asignarDocente, listarDocentes, listarGrupos, obtenerGrupo } from '@/services/control.service'

export function useGrupos() {
  return useQuery({ queryKey: ['grupos', 'lista'], queryFn: listarGrupos, staleTime: 60_000 })
}

export function useGrupo(grupoId: string) {
  return useQuery({ queryKey: ['grupos', 'detalle', grupoId], queryFn: () => obtenerGrupo(grupoId), placeholderData: (p) => p })
}

export function useDocentes() {
  return useQuery({ queryKey: ['grupos', 'docentes'], queryFn: listarDocentes })
}

export function useAsignarDocente() {
  const invalidar = useInvalidarControl()
  return useMutation({ mutationFn: ({ aulaId, docenteId }: { aulaId: string; docenteId: string }) => asignarDocente(aulaId, docenteId), onSuccess: invalidar })
}
