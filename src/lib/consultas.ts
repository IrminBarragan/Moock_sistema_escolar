import type { QueryClient } from '@tanstack/react-query'

/**
 * Raíces de las claves de TanStack Query. Una acción académica (entregar,
 * calificar, publicar) afecta contadores en varias pantallas, así que se
 * invalidan todas las vistas relacionadas de una vez.
 */
export const RAICES_ACADEMICAS = ['aulas', 'aula', 'tareas', 'tarea', 'entregas', 'planilla', 'boleta', 'avisos', 'panel', 'reportes', 'bitacora'] as const

export function invalidarAcademico(qc: QueryClient) {
  return Promise.all(RAICES_ACADEMICAS.map((raiz) => qc.invalidateQueries({ queryKey: [raiz] })))
}
