/** Bitácora y estructuras comunes de respuesta. */
import type { Rol } from './personas'

export type ModuloBitacora =
  | 'Sesión'
  | 'Aulas'
  | 'Tareas'
  | 'Calificaciones'
  | 'Pagos'
  | 'Alumnos'
  | 'Grupos'
  | 'Usuarios'
  | 'Configuración'

export interface EntradaBitacora {
  id: string
  fecha: string
  usuario: string
  rol: Rol
  modulo: ModuloBitacora
  accion: string
  detalle: string
}

/** Página de resultados con la misma forma que usaría la API (estilo Spring Data). */
export interface Pagina<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ConsultaPaginada {
  page?: number
  size?: number
  q?: string
}

/** Error con forma de ProblemDetail (RFC 9457), como lo devolvería el backend. */
export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly detail: string

  constructor(status: number, title: string, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = detail
  }
}
