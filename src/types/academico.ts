/** Aulas virtuales: temas, material, tareas, entregas, evaluaciones y avisos. */

/** Una materia impartida a un grupo por un docente. */
export interface Aula {
  id: string
  materiaId: string
  grupoId: string
  docenteId: string
  descripcion: string
}

export interface Tema {
  id: string
  aulaId: string
  titulo: string
  descripcion: string
  orden: number
}

export type TipoArchivo = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'imagen' | 'video' | 'otro'

export interface Archivo {
  id: string
  nombre: string
  tipo: TipoArchivo
  tamanoKb: number
  /** Solo para video. */
  duracionSeg?: number
}

export interface Material {
  id: string
  aulaId: string
  temaId: string
  titulo: string
  descripcion: string
  archivo: Archivo
  publicadoEl: string
}

export interface Tarea {
  id: string
  aulaId: string
  temaId: string
  periodoId: string
  titulo: string
  instrucciones: string
  adjuntos: Archivo[]
  fechaLimite: string
  /** Valor de la tarea en puntos; la calificación se expresa de 0 a 10. */
  puntos: number
  publicadaEl: string
  permiteEntregaTardia: boolean
}

export interface Entrega {
  id: string
  tareaId: string
  alumnoId: string
  entregadaEl: string
  texto: string
  archivos: Archivo[]
  calificacion: number | null
  comentario: string
  calificadaEl: string | null
}

export type EstadoTarea = 'pendiente' | 'vencida' | 'entregada' | 'tarde' | 'calificada'

/**
 * Componentes de evaluación que captura el docente por periodo.
 * El promedio de tareas se calcula a partir de las entregas.
 */
export interface Evaluacion {
  id: string
  aulaId: string
  alumnoId: string
  periodoId: string
  examen: number | null
  participacion: number | null
}

export type AlcanceAviso =
  | { tipo: 'escuela' }
  | { tipo: 'nivel'; nivelId: string }
  | { tipo: 'grupo'; grupoId: string }
  | { tipo: 'aula'; aulaId: string }

export interface Aviso {
  id: string
  titulo: string
  cuerpo: string
  autor: string
  alcance: AlcanceAviso
  publicadoEl: string
  importante: boolean
}
