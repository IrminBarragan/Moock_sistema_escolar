/** Personas y usuarios del sistema. */
import type { NivelId } from './escolar'

export type Rol = 'alumno' | 'padre' | 'docente' | 'control' | 'sistema'

export interface Persona {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  correo: string
  telefono: string
}

export interface Docente extends Persona {
  titulo: 'Mtro.' | 'Mtra.' | 'Lic.' | 'Ing.' | 'Prof.' | 'Profa.'
  especialidad: string
  niveles: NivelId[]
}

export type Sexo = 'H' | 'M'

export interface Alumno extends Persona {
  matricula: string
  /** CURP ficticia: usa la clave de entidad "XX", que no existe. */
  curp: string
  sexo: Sexo
  fechaNacimiento: string
  grupoId: string
  estatus: 'activo' | 'baja'
  fechaInscripcion: string
  tutorIds: string[]
  /** Porcentaje de beca sobre la colegiatura (0 si no tiene). */
  beca: number
  domicilio: string
}

export type Parentesco = 'Madre' | 'Padre' | 'Abuela' | 'Abuelo' | 'Tía' | 'Tío' | 'Tutor legal'

export interface Tutor extends Persona {
  parentesco: Parentesco
  ocupacion: string
  alumnoIds: string[]
}

export interface Usuario {
  id: string
  rol: Rol
  /** Id del alumno, tutor o docente relacionado; null para el personal. */
  personaId: string | null
  nombre: string
  correo: string
  activo: boolean
  ultimoAcceso: string | null
  /** Puesto, solo para personal administrativo. */
  puesto?: string
}
