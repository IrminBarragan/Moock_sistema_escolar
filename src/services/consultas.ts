/**
 * Consultas internas reutilizadas por los servicios (equivalen a los "joins"
 * que haría el backend). No se exportan a las pantallas.
 */
import { ahoraDemo, demoConfig } from '@/config/demo'
import { iniciales, nombreCompleto, nombreLista } from '@/lib/format'
import type {
  Alumno,
  Aula,
  AulaResumen,
  Entrega,
  GrupoVista,
  MateriaVista,
  PeriodoVista,
  PersonaVista,
  Tarea,
} from '@/types'
import { estadoPeriodo, estadoTarea } from './calculos'
import { db, porId } from './db'

export const hoy = () => demoConfig.fechaHoy

export function idEntrega(tareaId: string, alumnoId: string) {
  return `ent-${tareaId}-${alumnoId}`
}

export function idEvaluacion(aulaId: string, periodoId: string, alumnoId: string) {
  return `ev-${aulaId}-${periodoId}-${alumnoId}`
}

export function entregaDe(tareaId: string, alumnoId: string): Entrega | undefined {
  return porId('entregas', idEntrega(tareaId, alumnoId))
}

export function materiaVista(materiaId: string): MateriaVista {
  const m = porId('materias', materiaId)!
  return { id: m.id, nombre: m.nombre, clave: m.clave, color: m.color }
}

export function grupoVista(grupoId: string): GrupoVista {
  const g = porId('grupos', grupoId)!
  return {
    id: g.id,
    nombre: g.nombre,
    nivelId: g.nivelId,
    nivel: porId('niveles', g.nivelId)!.nombre,
    grado: porId('grados', g.gradoId)!.nombre,
  }
}

export function periodoVista(periodoId: string): PeriodoVista {
  const p = porId('periodos', periodoId)!
  return { id: p.id, nombre: p.nombre, inicio: p.inicio, fin: p.fin, estado: estadoPeriodo(p, hoy()) }
}

export function periodosDeNivel(nivelId: string): PeriodoVista[] {
  return db()
    .periodos.filter((p) => p.nivelId === nivelId)
    .sort((a, b) => a.orden - b.orden)
    .map((p) => periodoVista(p.id))
}

export function periodoActual(nivelId: string): PeriodoVista | null {
  const lista = periodosDeNivel(nivelId)
  return lista.find((p) => p.estado === 'en-curso') ?? lista.filter((p) => p.estado === 'cerrado').at(-1) ?? null
}

/** Periodo al que pertenece una fecha límite dentro del nivel. */
export function periodoDeFecha(nivelId: string, fechaISO: string): string {
  const dia = fechaISO.slice(0, 10)
  const lista = db().periodos.filter((p) => p.nivelId === nivelId).sort((a, b) => a.orden - b.orden)
  return (lista.find((p) => dia >= p.inicio && dia <= p.fin) ?? (dia < lista[0].inicio ? lista[0] : lista.at(-1)!)).id
}

export function nombreDocente(docenteId: string): string {
  const d = porId('docentes', docenteId)
  return d ? `${d.titulo} ${d.nombre} ${d.apellidoPaterno} ${d.apellidoMaterno}` : 'Sin asignar'
}

export function personaVista(a: Pick<Alumno, 'id' | 'nombre' | 'apellidoPaterno' | 'apellidoMaterno'>): PersonaVista {
  return { id: a.id, nombre: nombreCompleto(a), nombreLista: nombreLista(a), iniciales: iniciales(`${a.nombre} ${a.apellidoPaterno}`) }
}

export function alumnosDeGrupo(grupoId: string): Alumno[] {
  return db().alumnos.filter((a) => a.grupoId === grupoId && a.estatus === 'activo')
}

export function tareasDeAula(aulaId: string): Tarea[] {
  return db()
    .tareas.filter((t) => t.aulaId === aulaId)
    .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite))
}

export function entregasDeTarea(tareaId: string): Entrega[] {
  return db().entregas.filter((e) => e.tareaId === tareaId)
}

export function aulaResumen(aula: Aula, opciones: { alumnoId?: string } = {}): AulaResumen {
  const grupo = grupoVista(aula.grupoId)
  const alumnos = alumnosDeGrupo(aula.grupoId)
  const tareas = tareasDeAula(aula.id)
  const ahora = ahoraDemo()
  const idsAlumnos = new Set(alumnos.map((a) => a.id))
  let porRevisar = 0
  let pendientes = 0
  let proximaTarea: AulaResumen['proximaTarea'] = null

  for (const t of tareas) {
    porRevisar += entregasDeTarea(t.id).filter((e) => e.calificacion === null && idsAlumnos.has(e.alumnoId)).length
    if (opciones.alumnoId) {
      const estado = estadoTarea(t, entregaDe(t.id, opciones.alumnoId), ahora)
      if (estado === 'pendiente') {
        pendientes++
        proximaTarea ??= { id: t.id, titulo: t.titulo, fechaLimite: t.fechaLimite }
      }
    } else if (!proximaTarea && new Date(t.fechaLimite) > ahora) {
      proximaTarea = { id: t.id, titulo: t.titulo, fechaLimite: t.fechaLimite }
    }
  }

  return {
    id: aula.id,
    materia: materiaVista(aula.materiaId),
    grupo,
    docente: { id: aula.docenteId, nombre: nombreDocente(aula.docenteId) },
    alumnos: alumnos.length,
    periodoActual: periodoActual(grupo.nivelId),
    porRevisar,
    pendientes,
    proximaTarea,
  }
}
