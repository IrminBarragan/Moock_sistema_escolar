import { ahoraDemo, ahoraDemoISO } from '@/config/demo'
import { calificacion as fmtCalificacion, nombreCompleto } from '@/lib/format'
import type {
  ArchivoNuevo,
  Entrega,
  EntregasDeTarea,
  FilaEntrega,
  Tarea,
  TareaAlumnoVista,
  TareaDocenteFila,
} from '@/types'
import { registrarEnBitacora } from './bitacora.service'
import { estadoTarea } from './calculos'
import {
  alumnosDeGrupo,
  aulaResumen,
  entregaDe,
  entregasDeTarea,
  idEntrega,
  materiaVista,
  nombreDocente,
  periodoDeFecha,
  periodoVista,
  personaVista,
  tareasDeAula,
} from './consultas'
import { db, eliminar, guardar, nuevoId, porId } from './db'
import { errorValidacion, noEncontrado, simular } from './http'

// ───────────── Docente ─────────────

export function listarTareasAula(aulaId: string): Promise<TareaDocenteFila[]> {
  return simular(() => {
    const aula = porId('aulas', aulaId) ?? noEncontrado('El aula')
    const alumnos = new Set(alumnosDeGrupo(aula.grupoId).map((a) => a.id))
    return tareasDeAula(aulaId)
      .reverse()
      .map((tarea) => {
        const entregas = entregasDeTarea(tarea.id).filter((e) => alumnos.has(e.alumnoId))
        return {
          tarea,
          tema: porId('temas', tarea.temaId)?.titulo ?? 'Sin tema',
          periodo: periodoVista(tarea.periodoId),
          total: alumnos.size,
          entregadas: entregas.length,
          porRevisar: entregas.filter((e) => e.calificacion === null).length,
          calificadas: entregas.filter((e) => e.calificacion !== null).length,
        }
      })
  })
}

export function obtenerTarea(tareaId: string): Promise<Tarea> {
  return simular(() => porId('tareas', tareaId) ?? noEncontrado('La tarea'))
}

export interface DatosTarea {
  id?: string
  aulaId: string
  temaId: string
  titulo: string
  instrucciones: string
  adjuntos: { id?: string; nombre: string; tipo: ArchivoNuevo['tipo']; tamanoKb: number }[]
  fechaLimite: string
  puntos: number
  permiteEntregaTardia: boolean
}

export function guardarTarea(datos: DatosTarea): Promise<Tarea> {
  return simular(() => {
    const aula = porId('aulas', datos.aulaId) ?? noEncontrado('El aula')
    if (!datos.titulo.trim()) errorValidacion('La tarea necesita un título.')
    if (!datos.instrucciones.trim()) errorValidacion('Escribe las instrucciones de la tarea.')
    if (Number.isNaN(new Date(datos.fechaLimite).getTime())) errorValidacion('La fecha límite no es válida.')
    const nivelId = porId('grupos', aula.grupoId)!.nivelId
    const anterior = datos.id ? porId('tareas', datos.id) : undefined
    const tarea: Tarea = {
      id: anterior?.id ?? nuevoId(`${aula.id}-tarea`),
      aulaId: aula.id,
      temaId: datos.temaId,
      periodoId: periodoDeFecha(nivelId, datos.fechaLimite),
      titulo: datos.titulo.trim(),
      instrucciones: datos.instrucciones.trim(),
      adjuntos: datos.adjuntos.map((a) => ({ ...a, id: a.id ?? nuevoId('arc') })),
      fechaLimite: datos.fechaLimite,
      puntos: datos.puntos,
      publicadaEl: anterior?.publicadaEl ?? ahoraDemoISO(),
      permiteEntregaTardia: datos.permiteEntregaTardia,
    }
    guardar('tareas', tarea)
    registrarEnBitacora(
      'Tareas',
      anterior ? 'Editó una tarea' : 'Publicó una tarea',
      `${tarea.titulo} · ${materiaVista(aula.materiaId).nombre} · ${porId('grupos', aula.grupoId)!.nombre}`,
    )
    return tarea
  })
}

export function listarEntregasTarea(tareaId: string): Promise<EntregasDeTarea> {
  return simular(() => {
    const tarea = porId('tareas', tareaId) ?? noEncontrado('La tarea')
    const aula = porId('aulas', tarea.aulaId)!
    const ahora = ahoraDemo()
    const filas: FilaEntrega[] = alumnosDeGrupo(aula.grupoId).map((a) => {
      const entrega = entregaDe(tarea.id, a.id) ?? null
      return { alumno: personaVista(a), entrega, estado: estadoTarea(tarea, entrega ?? undefined, ahora) }
    })
    return { tarea, tema: porId('temas', tarea.temaId)?.titulo ?? 'Sin tema', aula: aulaResumen(aula), filas }
  })
}

export function calificarEntrega(entregaId: string, datos: { calificacion: number; comentario: string }): Promise<Entrega> {
  return simular(() => {
    const entrega = porId('entregas', entregaId) ?? noEncontrado('La entrega')
    if (!(datos.calificacion >= 0 && datos.calificacion <= 10)) errorValidacion('La calificación debe estar entre 0 y 10.')
    const actualizada: Entrega = {
      ...entrega,
      calificacion: Math.round(datos.calificacion * 10) / 10,
      comentario: datos.comentario.trim(),
      calificadaEl: ahoraDemoISO(),
    }
    guardar('entregas', actualizada)
    const tarea = porId('tareas', entrega.tareaId)!
    const alumno = porId('alumnos', entrega.alumnoId)!
    registrarEnBitacora(
      'Tareas',
      'Calificó una entrega',
      `${tarea.titulo} · ${nombreCompleto(alumno)}: ${fmtCalificacion(actualizada.calificacion)}`,
    )
    return actualizada
  })
}

// ───────────── Alumno ─────────────

function vistaAlumno(tarea: Tarea, alumnoId: string, ahora: Date): TareaAlumnoVista {
  const aula = porId('aulas', tarea.aulaId)!
  const entrega = entregaDe(tarea.id, alumnoId) ?? null
  return {
    tarea,
    aulaId: aula.id,
    materia: materiaVista(aula.materiaId),
    docente: nombreDocente(aula.docenteId),
    tema: porId('temas', tarea.temaId)?.titulo ?? 'Sin tema',
    estado: estadoTarea(tarea, entrega ?? undefined, ahora),
    entrega,
  }
}

/** Todas las tareas del alumno en sus aulas, de la más reciente a la más antigua. */
export function listarTareasAlumno(alumnoId: string): Promise<TareaAlumnoVista[]> {
  return simular(() => {
    const alumno = porId('alumnos', alumnoId) ?? noEncontrado('El alumno')
    const aulas = new Set(db().aulas.filter((a) => a.grupoId === alumno.grupoId).map((a) => a.id))
    const ahora = ahoraDemo()
    return db()
      .tareas.filter((t) => aulas.has(t.aulaId))
      .sort((a, b) => b.fechaLimite.localeCompare(a.fechaLimite))
      .map((t) => vistaAlumno(t, alumnoId, ahora))
  })
}

export function listarTareasAulaAlumno(aulaId: string, alumnoId: string): Promise<TareaAlumnoVista[]> {
  return simular(() => {
    const ahora = ahoraDemo()
    return tareasDeAula(aulaId)
      .reverse()
      .map((t) => vistaAlumno(t, alumnoId, ahora))
  })
}

export function obtenerTareaAlumno(tareaId: string, alumnoId: string): Promise<TareaAlumnoVista> {
  return simular(() => {
    const tarea = porId('tareas', tareaId) ?? noEncontrado('La tarea')
    const alumno = porId('alumnos', alumnoId) ?? noEncontrado('El alumno')
    const aula = porId('aulas', tarea.aulaId)!
    if (aula.grupoId !== alumno.grupoId) noEncontrado('La tarea')
    return vistaAlumno(tarea, alumnoId, ahoraDemo())
  })
}

export function entregarTarea(tareaId: string, alumnoId: string, datos: { texto: string; archivos: ArchivoNuevo[] }): Promise<Entrega> {
  return simular(() => {
    const tarea = porId('tareas', tareaId) ?? noEncontrado('La tarea')
    if (!datos.texto.trim() && datos.archivos.length === 0) errorValidacion('Adjunta un archivo o escribe tu respuesta antes de entregar.')
    const ahora = ahoraDemo()
    if (ahora > new Date(tarea.fechaLimite) && !tarea.permiteEntregaTardia) {
      errorValidacion('La fecha límite ya pasó y el docente no acepta entregas tardías.')
    }
    const previa = entregaDe(tareaId, alumnoId)
    if (previa?.calificacion != null) errorValidacion('Esta tarea ya fue calificada; no se puede volver a entregar.')
    const entrega: Entrega = {
      id: idEntrega(tareaId, alumnoId),
      tareaId,
      alumnoId,
      entregadaEl: ahora.toISOString(),
      texto: datos.texto.trim(),
      archivos: datos.archivos.map((a) => ({ id: nuevoId('arc'), ...a })),
      calificacion: null,
      comentario: '',
      calificadaEl: null,
    }
    guardar('entregas', entrega)
    const alumno = porId('alumnos', alumnoId)!
    registrarEnBitacora('Tareas', 'Entregó una tarea', `${tarea.titulo} · ${nombreCompleto(alumno)}`)
    return entrega
  })
}

/** Retira una entrega aún no calificada (por ejemplo, para corregir el archivo). */
export function anularEntrega(tareaId: string, alumnoId: string): Promise<void> {
  return simular(() => {
    const entrega = entregaDe(tareaId, alumnoId) ?? noEncontrado('La entrega')
    if (entrega.calificacion !== null) errorValidacion('La tarea ya fue calificada; no se puede anular la entrega.')
    eliminar('entregas', entrega.id)
  })
}
