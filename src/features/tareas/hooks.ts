import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidarAcademico } from '@/lib/consultas'
import type { ArchivoNuevo } from '@/types'
import {
  anularEntrega,
  calificarEntrega,
  entregarTarea,
  guardarTarea,
  listarEntregasTarea,
  listarTareasAlumno,
  listarTareasAula,
  listarTareasAulaAlumno,
  obtenerTarea,
  obtenerTareaAlumno,
  type DatosTarea,
} from '@/services/tareas.service'

export function useTareasAula(aulaId: string) {
  return useQuery({ queryKey: ['tareas', 'aula', aulaId], queryFn: () => listarTareasAula(aulaId) })
}

export function useTarea(tareaId: string | undefined) {
  return useQuery({ queryKey: ['tarea', tareaId], queryFn: () => obtenerTarea(tareaId!), enabled: Boolean(tareaId) })
}

export function useEntregasTarea(tareaId: string) {
  return useQuery({ queryKey: ['entregas', tareaId], queryFn: () => listarEntregasTarea(tareaId) })
}

export function useTareasAlumno(alumnoId: string) {
  return useQuery({ queryKey: ['tareas', 'alumno', alumnoId], queryFn: () => listarTareasAlumno(alumnoId) })
}

export function useTareasAulaAlumno(aulaId: string, alumnoId: string) {
  return useQuery({ queryKey: ['tareas', 'aula-alumno', aulaId, alumnoId], queryFn: () => listarTareasAulaAlumno(aulaId, alumnoId) })
}

export function useTareaAlumno(tareaId: string, alumnoId: string) {
  return useQuery({ queryKey: ['tarea', tareaId, 'alumno', alumnoId], queryFn: () => obtenerTareaAlumno(tareaId, alumnoId) })
}

export function useGuardarTarea() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (d: DatosTarea) => guardarTarea(d), onSuccess: () => invalidarAcademico(qc) })
}

export function useCalificarEntrega() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ entregaId, ...d }: { entregaId: string; calificacion: number; comentario: string }) => calificarEntrega(entregaId, d),
    onSuccess: () => invalidarAcademico(qc),
  })
}

export function useEntregarTarea(tareaId: string, alumnoId: string) {
  const qc = useQueryClient()
  return {
    entregar: useMutation({
      mutationFn: (d: { texto: string; archivos: ArchivoNuevo[] }) => entregarTarea(tareaId, alumnoId, d),
      onSuccess: () => invalidarAcademico(qc),
    }),
    anular: useMutation({ mutationFn: () => anularEntrega(tareaId, alumnoId), onSuccess: () => invalidarAcademico(qc) }),
  }
}
