import { ahoraDemoISO } from '@/config/demo'
import type { ArchivoNuevo, AulaDetalle, AulaResumen, AvisoVista, Material, Tema } from '@/types'
import { registrarEnBitacora } from './bitacora.service'
import { aulaResumen, materiaVista, tareasDeAula } from './consultas'
import { db, guardar, nuevoId, porId } from './db'
import { errorValidacion, noEncontrado, simular } from './http'
import { obtenerSesion } from './sesion'

const ordenNivel = (a: AulaResumen) => porId('niveles', a.grupo.nivelId)!.orden

export function listarAulasDocente(docenteId: string): Promise<AulaResumen[]> {
  return simular(() =>
    db()
      .aulas.filter((a) => a.docenteId === docenteId)
      .map((a) => aulaResumen(a))
      .sort((a, b) => ordenNivel(a) - ordenNivel(b) || a.grupo.nombre.localeCompare(b.grupo.nombre)),
  )
}

export function listarAulasAlumno(alumnoId: string): Promise<AulaResumen[]> {
  return simular(() => {
    const alumno = porId('alumnos', alumnoId) ?? noEncontrado('El alumno')
    return db()
      .aulas.filter((a) => a.grupoId === alumno.grupoId)
      .map((a) => aulaResumen(a, { alumnoId }))
  })
}

export function obtenerAula(aulaId: string, opciones: { alumnoId?: string } = {}): Promise<AulaDetalle> {
  return simular(() => {
    const aula = porId('aulas', aulaId) ?? noEncontrado('El aula')
    const tareas = tareasDeAula(aulaId)
    const materiales = db().materiales.filter((m) => m.aulaId === aulaId)
    const temas = db()
      .temas.filter((t) => t.aulaId === aulaId)
      .sort((a, b) => a.orden - b.orden)
      .map((t) => ({
        ...t,
        materiales: materiales.filter((m) => m.temaId === t.id).sort((a, b) => a.publicadoEl.localeCompare(b.publicadoEl)),
        totalTareas: tareas.filter((x) => x.temaId === t.id).length,
      }))
    return { ...aulaResumen(aula, opciones), descripcion: aula.descripcion, temas }
  })
}

function verificarDocente(aulaId: string) {
  const aula = porId('aulas', aulaId) ?? noEncontrado('El aula')
  const sesion = obtenerSesion()
  if (sesion?.rol === 'docente' && sesion.personaId !== aula.docenteId) errorValidacion('Solo el docente del aula puede modificarla.')
  return aula
}

function etiquetaAula(aulaId: string) {
  const aula = porId('aulas', aulaId)!
  return `${materiaVista(aula.materiaId).nombre} · ${porId('grupos', aula.grupoId)!.nombre}`
}

export function crearTema(aulaId: string, datos: { titulo: string; descripcion: string }): Promise<Tema> {
  return simular(() => {
    verificarDocente(aulaId)
    if (!datos.titulo.trim()) errorValidacion('El tema necesita un título.')
    const orden = Math.max(0, ...db().temas.filter((t) => t.aulaId === aulaId).map((t) => t.orden)) + 1
    const tema: Tema = { id: nuevoId(`${aulaId}-t`), aulaId, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim(), orden }
    guardar('temas', tema)
    registrarEnBitacora('Aulas', 'Creó un tema', `${tema.titulo} · ${etiquetaAula(aulaId)}`)
    return tema
  })
}

export function editarTema(temaId: string, datos: { titulo: string; descripcion: string }): Promise<Tema> {
  return simular(() => {
    const tema = porId('temas', temaId) ?? noEncontrado('El tema')
    verificarDocente(tema.aulaId)
    if (!datos.titulo.trim()) errorValidacion('El tema necesita un título.')
    const actualizado = { ...tema, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim() }
    guardar('temas', actualizado)
    return actualizado
  })
}

/** Intercambia el orden del tema con el anterior o el siguiente. */
export function moverTema(temaId: string, direccion: 'arriba' | 'abajo'): Promise<void> {
  return simular(() => {
    const tema = porId('temas', temaId) ?? noEncontrado('El tema')
    verificarDocente(tema.aulaId)
    const lista = db()
      .temas.filter((t) => t.aulaId === tema.aulaId)
      .sort((a, b) => a.orden - b.orden)
    const i = lista.findIndex((t) => t.id === temaId)
    const j = direccion === 'arriba' ? i - 1 : i + 1
    if (j < 0 || j >= lista.length) return
    const otro = lista[j]
    guardar('temas', { ...tema, orden: otro.orden })
    guardar('temas', { ...otro, orden: tema.orden })
  })
}

export function subirMaterial(
  aulaId: string,
  datos: { temaId: string; titulo: string; descripcion: string; archivo: ArchivoNuevo },
): Promise<Material> {
  return simular(() => {
    verificarDocente(aulaId)
    if (!datos.titulo.trim()) errorValidacion('El material necesita un título.')
    const material: Material = {
      id: nuevoId('mat'),
      aulaId,
      temaId: datos.temaId,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      archivo: { id: nuevoId('arc'), ...datos.archivo },
      publicadoEl: ahoraDemoISO(),
    }
    guardar('materiales', material)
    registrarEnBitacora('Aulas', 'Subió material', `${material.titulo} · ${etiquetaAula(aulaId)}`)
    return material
  })
}

export function listarAvisosAula(aulaId: string): Promise<AvisoVista[]> {
  return simular(() => {
    const aula = porId('aulas', aulaId) ?? noEncontrado('El aula')
    const materia = materiaVista(aula.materiaId)
    return db()
      .avisos.filter((a) => a.alcance.tipo === 'aula' && a.alcance.aulaId === aulaId)
      .sort((a, b) => b.publicadoEl.localeCompare(a.publicadoEl))
      .map((a) => ({ ...a, origen: materia.nombre, materia }))
  })
}

export function publicarAviso(aulaId: string, datos: { titulo: string; cuerpo: string; importante: boolean }): Promise<void> {
  return simular(() => {
    verificarDocente(aulaId)
    if (!datos.titulo.trim() || !datos.cuerpo.trim()) errorValidacion('El aviso necesita título y mensaje.')
    const aula = porId('aulas', aulaId)!
    guardar('avisos', {
      id: nuevoId('av'),
      titulo: datos.titulo.trim(),
      cuerpo: datos.cuerpo.trim(),
      importante: datos.importante,
      autor: obtenerSesion()?.nombre ?? 'Docente',
      alcance: { tipo: 'aula', aulaId: aula.id },
      publicadoEl: ahoraDemoISO(),
    })
    registrarEnBitacora('Aulas', 'Publicó un aviso', `${datos.titulo.trim()} · ${etiquetaAula(aulaId)}`)
  })
}
