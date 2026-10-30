import { ahoraDemo, ahoraDemoISO } from '@/config/demo'
import type { Boleta, BoletaMateria, CambioPlanilla, Entrega, Evaluacion, FilaPlanilla, PlanillaPeriodo } from '@/types'
import { registrarEnBitacora } from './bitacora.service'
import { calificacionPeriodo, estadoTarea, promedio, promedioTareas } from './calculos'
import {
  alumnosDeGrupo,
  aulaResumen,
  entregaDe,
  grupoVista,
  idEntrega,
  idEvaluacion,
  materiaVista,
  nombreDocente,
  periodoActual,
  periodosDeNivel,
  personaVista,
  tareasDeAula,
} from './consultas'
import { db, guardar, porId } from './db'
import { errorValidacion, noEncontrado, simular } from './http'

/** Calificación del periodo de un alumno en un aula (null si aún no hay datos). */
function finalDe(aulaId: string, periodoId: string, alumnoId: string, ahora: Date): number | null {
  const tareas = tareasDeAula(aulaId).filter((t) => t.periodoId === periodoId)
  const evaluacion = porId('evaluaciones', idEvaluacion(aulaId, periodoId, alumnoId))
  const tareasProm = promedioTareas(tareas, (id) => entregaDe(id, alumnoId), ahora)
  return calificacionPeriodo(tareasProm, evaluacion)
}

export function obtenerPlanilla(aulaId: string, periodoId?: string): Promise<PlanillaPeriodo> {
  return simular(() => {
    const aula = porId('aulas', aulaId) ?? noEncontrado('El aula')
    const nivelId = porId('grupos', aula.grupoId)!.nivelId
    const periodos = periodosDeNivel(nivelId)
    const periodo = periodos.find((p) => p.id === periodoId) ?? periodoActual(nivelId) ?? periodos[0]
    const tareas = tareasDeAula(aulaId).filter((t) => t.periodoId === periodo.id)
    const ahora = ahoraDemo()

    const filas: FilaPlanilla[] = alumnosDeGrupo(aula.grupoId).map((alumno) => {
      const evaluacion = porId('evaluaciones', idEvaluacion(aulaId, periodo.id, alumno.id))
      const notas: FilaPlanilla['notas'] = {}
      for (const t of tareas) {
        const e = entregaDe(t.id, alumno.id)
        notas[t.id] = { valor: e?.calificacion ?? null, estado: estadoTarea(t, e, ahora) }
      }
      const promedioT = promedioTareas(tareas, (id) => entregaDe(id, alumno.id), ahora)
      return {
        alumno: personaVista(alumno),
        notas,
        examen: evaluacion?.examen ?? null,
        participacion: evaluacion?.participacion ?? null,
        promedioTareas: promedioT,
        final: calificacionPeriodo(promedioT, evaluacion),
      }
    })

    return {
      aula: aulaResumen(aula),
      periodo,
      periodos,
      tareas,
      filas,
      editable: periodo.estado === 'en-curso',
      promedioGrupo: promedio(filas.map((f) => f.final)),
    }
  })
}

export function guardarPlanilla(aulaId: string, periodoId: string, cambios: CambioPlanilla[]): Promise<{ guardados: number }> {
  return simular(() => {
    const aula = porId('aulas', aulaId) ?? noEncontrado('El aula')
    const periodo = porId('periodos', periodoId) ?? noEncontrado('El periodo')
    for (const c of cambios) {
      if (c.valor !== null && !(c.valor >= 0 && c.valor <= 10)) errorValidacion('Todas las calificaciones deben estar entre 0 y 10.')
    }
    const ahora = ahoraDemoISO()
    for (const c of cambios) {
      const valor = c.valor === null ? null : Math.round(c.valor * 10) / 10
      if (c.campo === 'tarea' && c.tareaId) {
        const previa = entregaDe(c.tareaId, c.alumnoId)
        const entrega: Entrega = previa
          ? { ...previa, calificacion: valor, calificadaEl: valor === null ? null : ahora }
          : {
              // Trabajo entregado en papel: el docente lo registra directamente.
              id: idEntrega(c.tareaId, c.alumnoId),
              tareaId: c.tareaId,
              alumnoId: c.alumnoId,
              entregadaEl: ahora,
              texto: 'Entregada en clase (registro del docente).',
              archivos: [],
              calificacion: valor,
              comentario: '',
              calificadaEl: valor === null ? null : ahora,
            }
        guardar('entregas', entrega)
      } else {
        const id = idEvaluacion(aulaId, periodoId, c.alumnoId)
        const previa: Evaluacion = porId('evaluaciones', id) ?? {
          id,
          aulaId,
          alumnoId: c.alumnoId,
          periodoId,
          examen: null,
          participacion: null,
        }
        guardar('evaluaciones', { ...previa, [c.campo]: valor })
      }
    }
    registrarEnBitacora(
      'Calificaciones',
      'Actualizó calificaciones del periodo',
      `${materiaVista(aula.materiaId).nombre} · ${porId('grupos', aula.grupoId)!.nombre} · ${periodo.nombre} · ${cambios.length} cambios`,
    )
    return { guardados: cambios.length }
  })
}

/** Boleta del alumno: calificación por materia y periodo, con promedios. */
export function obtenerBoleta(alumnoId: string): Promise<Boleta> {
  return simular(() => {
    const alumno = porId('alumnos', alumnoId) ?? noEncontrado('El alumno')
    const grupo = grupoVista(alumno.grupoId)
    const periodos = periodosDeNivel(grupo.nivelId)
    const ahora = ahoraDemo()

    const materias: BoletaMateria[] = db()
      .aulas.filter((a) => a.grupoId === alumno.grupoId)
      .map((aula) => {
        const porPeriodo: Record<string, number | null> = {}
        for (const p of periodos) porPeriodo[p.id] = p.estado === 'proximo' ? null : finalDe(aula.id, p.id, alumnoId, ahora)
        return {
          aulaId: aula.id,
          materia: materiaVista(aula.materiaId),
          docente: nombreDocente(aula.docenteId),
          porPeriodo,
          promedio: promedio(Object.values(porPeriodo)),
        }
      })

    const promedioPorPeriodo: Record<string, number | null> = {}
    for (const p of periodos) promedioPorPeriodo[p.id] = promedio(materias.map((m) => m.porPeriodo[p.id]))

    return {
      alumno: { ...personaVista(alumno), matricula: alumno.matricula },
      grupo,
      periodos,
      materias,
      promedioPorPeriodo,
      promedioGeneral: promedio(materias.map((m) => m.promedio)),
    }
  })
}
