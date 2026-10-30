import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidarAcademico } from '@/lib/consultas'
import {
  crearTema,
  editarTema,
  listarAulasAlumno,
  listarAulasDocente,
  listarAvisosAula,
  moverTema,
  obtenerAula,
  publicarAviso,
  subirMaterial,
} from '@/services/aulas.service'
import { listarAvisosAlumno } from '@/services/avisos.service'

export function useAulasDocente(docenteId: string) {
  return useQuery({ queryKey: ['aulas', 'docente', docenteId], queryFn: () => listarAulasDocente(docenteId) })
}

export function useAulasAlumno(alumnoId: string) {
  return useQuery({ queryKey: ['aulas', 'alumno', alumnoId], queryFn: () => listarAulasAlumno(alumnoId) })
}

export function useAula(aulaId: string, alumnoId?: string) {
  return useQuery({ queryKey: ['aula', aulaId, alumnoId ?? null], queryFn: () => obtenerAula(aulaId, { alumnoId }) })
}

export function useAvisosAula(aulaId: string) {
  return useQuery({ queryKey: ['avisos', 'aula', aulaId], queryFn: () => listarAvisosAula(aulaId) })
}

export function useAccionesAula(aulaId: string) {
  const qc = useQueryClient()
  const alTerminar = () => invalidarAcademico(qc)
  return {
    crearTema: useMutation({ mutationFn: (d: Parameters<typeof crearTema>[1]) => crearTema(aulaId, d), onSuccess: alTerminar }),
    editarTema: useMutation({
      mutationFn: ({ temaId, ...d }: { temaId: string; titulo: string; descripcion: string }) => editarTema(temaId, d),
      onSuccess: alTerminar,
    }),
    moverTema: useMutation({
      mutationFn: ({ temaId, direccion }: { temaId: string; direccion: 'arriba' | 'abajo' }) => moverTema(temaId, direccion),
      onSuccess: alTerminar,
    }),
    subirMaterial: useMutation({ mutationFn: (d: Parameters<typeof subirMaterial>[1]) => subirMaterial(aulaId, d), onSuccess: alTerminar }),
    publicarAviso: useMutation({ mutationFn: (d: Parameters<typeof publicarAviso>[1]) => publicarAviso(aulaId, d), onSuccess: alTerminar }),
  }
}

export function useAvisosAlumno(alumnoId: string | undefined) {
  return useQuery({ queryKey: ['avisos', 'alumno', alumnoId], queryFn: () => listarAvisosAlumno(alumnoId!), enabled: Boolean(alumnoId) })
}
