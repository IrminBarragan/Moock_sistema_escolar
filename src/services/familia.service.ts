import type { GrupoVista, PersonaVista } from '@/types'
import { grupoVista, personaVista } from './consultas'
import { porId } from './db'
import { noEncontrado, simular } from './http'

export interface Hijo extends PersonaVista {
  grupo: GrupoVista
}

export function listarHijos(tutorId: string): Promise<Hijo[]> {
  return simular(() => {
    const tutor = porId('tutores', tutorId) ?? noEncontrado('El tutor')
    return tutor.alumnoIds
      .map((id) => porId('alumnos', id))
      .filter((a) => a !== undefined && a.estatus === 'activo')
      .map((a) => ({ ...personaVista(a!), grupo: grupoVista(a!.grupoId) }))
  })
}
