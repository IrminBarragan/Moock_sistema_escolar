import type { AvisoVista } from '@/types'
import { materiaVista } from './consultas'
import { db, porId } from './db'
import { noEncontrado, simular } from './http'

/** Avisos que le llegan a un alumno: escuela, su nivel, su grupo y sus aulas. */
export function listarAvisosAlumno(alumnoId: string): Promise<AvisoVista[]> {
  return simular(() => {
    const alumno = porId('alumnos', alumnoId) ?? noEncontrado('El alumno')
    const grupo = porId('grupos', alumno.grupoId)!
    const aulas = new Map(db().aulas.filter((a) => a.grupoId === grupo.id).map((a) => [a.id, a]))
    return db()
      .avisos.filter((a) => {
        const al = a.alcance
        return (
          al.tipo === 'escuela' ||
          (al.tipo === 'nivel' && al.nivelId === grupo.nivelId) ||
          (al.tipo === 'grupo' && al.grupoId === grupo.id) ||
          (al.tipo === 'aula' && aulas.has(al.aulaId))
        )
      })
      .sort((a, b) => b.publicadoEl.localeCompare(a.publicadoEl))
      .map((a) => {
        const aula = a.alcance.tipo === 'aula' ? aulas.get(a.alcance.aulaId) : undefined
        const materia = aula ? materiaVista(aula.materiaId) : null
        return { ...a, materia, origen: materia?.nombre ?? a.autor }
      })
  })
}
