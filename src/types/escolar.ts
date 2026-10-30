/** Estructura académica: ciclos, niveles, grados, grupos, materias y periodos. */

export type NivelId = 'primaria' | 'secundaria' | 'preparatoria'

export interface CicloEscolar {
  id: string
  nombre: string
  inicio: string
  fin: string
  activo: boolean
}

export interface Nivel {
  id: NivelId
  nombre: string
  orden: number
  /** Cómo se nombra cada grado del nivel. */
  tipoGrado: 'grado' | 'semestre'
  /** Nombre genérico de los periodos de evaluación (Trimestre, Parcial…). */
  nombrePeriodo: string
}

export interface Grado {
  id: string
  nivelId: NivelId
  numero: number
  nombre: string
}

export interface Grupo {
  id: string
  cicloId: string
  nivelId: NivelId
  gradoId: string
  /** Nombre corto: "5°A", "1er sem. A". */
  nombre: string
  salon: string
  capacidad: number
}

export type ColorMateria =
  | 'azul'
  | 'coral'
  | 'verde'
  | 'ambar'
  | 'teal'
  | 'violeta'
  | 'indigo'
  | 'naranja'
  | 'rosa'
  | 'cian'
  | 'oliva'
  | 'pizarra'

export interface Materia {
  id: string
  nombre: string
  clave: string
  nivelId: NivelId
  gradoId: string
  color: ColorMateria
  horasSemana: number
}

export interface PeriodoEvaluacion {
  id: string
  cicloId: string
  nivelId: NivelId
  nombre: string
  orden: number
  inicio: string
  fin: string
}

export type EstadoPeriodo = 'cerrado' | 'en-curso' | 'proximo'
