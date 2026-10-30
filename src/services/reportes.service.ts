/** Reportes de control escolar. Devuelven filas listas para tabla y exportación. */
import { ahoraDemo } from '@/config/demo'
import { nombreCompleto, nombreLista } from '@/lib/format'
import type { EstadoCargo, PeriodoVista } from '@/types'
import { calificacionPeriodo, estadoCargo, promedio, promedioTareas, totalCargo } from './calculos'
import { alumnosDeGrupo, entregaDe, hoy, idEvaluacion, materiaVista, periodosDeNivel, tareasDeAula } from './consultas'
import { db, porId } from './db'
import { noEncontrado, simular } from './http'
import { nombreMetodo } from './pagos.service'

export interface ReporteCalificaciones {
  periodo: PeriodoVista
  periodos: PeriodoVista[]
  materias: { id: string; nombre: string; clave: string }[]
  filas: { alumnoId: string; alumno: string; matricula: string; valores: (number | null)[]; promedio: number | null }[]
  promediosMateria: (number | null)[]
}

export function reporteCalificaciones(grupoId: string, periodoId?: string): Promise<ReporteCalificaciones> {
  return simular(() => {
    const grupo = porId('grupos', grupoId) ?? noEncontrado('El grupo')
    const periodos = periodosDeNivel(grupo.nivelId).filter((p) => p.estado !== 'proximo')
    const periodo = periodos.find((p) => p.id === periodoId) ?? periodos.at(-1)!
    const aulas = db().aulas.filter((a) => a.grupoId === grupoId)
    const ahora = ahoraDemo()
    const filas = alumnosDeGrupo(grupoId).map((a) => {
      const valores = aulas.map((aula) => {
        const tareas = tareasDeAula(aula.id).filter((t) => t.periodoId === periodo.id)
        const pt = promedioTareas(tareas, (id) => entregaDe(id, a.id), ahora)
        return calificacionPeriodo(pt, porId('evaluaciones', idEvaluacion(aula.id, periodo.id, a.id)))
      })
      return { alumnoId: a.id, alumno: nombreLista(a), matricula: a.matricula, valores, promedio: promedio(valores) }
    })
    return {
      periodo,
      periodos,
      materias: aulas.map((a) => {
        const m = materiaVista(a.materiaId)
        return { id: a.id, nombre: m.nombre, clave: m.clave }
      }),
      filas,
      promediosMateria: aulas.map((_, i) => promedio(filas.map((f) => f.valores[i]))),
    }
  })
}

export interface FilaSinEntregar {
  grupo: string
  materia: string
  tarea: string
  fechaLimite: string
  alumno: string
  docente: string
}

export function reporteTareasSinEntregar(grupoId: string | 'todos'): Promise<FilaSinEntregar[]> {
  return simular(() => {
    const ahora = ahoraDemo()
    const filas: FilaSinEntregar[] = []
    for (const g of db().grupos) {
      if (grupoId !== 'todos' && g.id !== grupoId) continue
      const periodo = periodosDeNivel(g.nivelId).find((p) => p.estado === 'en-curso')
      const integrantes = alumnosDeGrupo(g.id)
      for (const aula of db().aulas.filter((a) => a.grupoId === g.id)) {
        const docente = porId('docentes', aula.docenteId)
        for (const t of tareasDeAula(aula.id)) {
          if (t.periodoId !== periodo?.id || new Date(t.fechaLimite) > ahora) continue
          for (const a of integrantes) {
            if (entregaDe(t.id, a.id)) continue
            filas.push({
              grupo: g.nombre,
              materia: materiaVista(aula.materiaId).nombre,
              tarea: t.titulo,
              fechaLimite: t.fechaLimite,
              alumno: nombreLista(a),
              docente: docente ? `${docente.titulo} ${docente.nombre} ${docente.apellidoPaterno}` : '—',
            })
          }
        }
      }
    }
    return filas.sort((a, b) => a.grupo.localeCompare(b.grupo) || a.alumno.localeCompare(b.alumno, 'es'))
  })
}

export interface FilaReportePago {
  alumno: string
  matricula: string
  grupo: string
  concepto: string
  vencimiento: string
  monto: number
  estado: EstadoCargo
  fechaPago: string | null
  metodo: string | null
  referencia: string | null
}

export function reportePagos(estado: 'pagado' | 'pendientes', mes: string): Promise<FilaReportePago[]> {
  return simular(() => {
    const filas: FilaReportePago[] = []
    for (const c of db().cargos) {
      if (mes !== 'todos' && !c.fechaVencimiento.startsWith(mes)) continue
      const e = estadoCargo(c, hoy())
      if (estado === 'pagado' ? e !== 'pagado' : e === 'pagado') continue
      if (estado === 'pendientes' && e === 'pendiente' && c.fechaVencimiento.slice(0, 7) > hoy().slice(0, 7)) continue
      const a = porId('alumnos', c.alumnoId)
      if (!a) continue
      const pago = c.pagoId ? porId('pagos', c.pagoId) : undefined
      filas.push({
        alumno: nombreCompleto(a),
        matricula: a.matricula,
        grupo: porId('grupos', a.grupoId)!.nombre,
        concepto: c.descripcion,
        vencimiento: c.fechaVencimiento,
        monto: totalCargo(c),
        estado: e,
        fechaPago: pago?.fechaPago ?? null,
        metodo: pago ? nombreMetodo[pago.metodo] : null,
        referencia: pago?.referencia ?? null,
      })
    }
    return filas.sort((a, b) => a.vencimiento.localeCompare(b.vencimiento) || a.alumno.localeCompare(b.alumno, 'es'))
  })
}
