/** Control escolar: panel, alumnos, expediente, importación, grupos y asignaciones. */
import { ahoraDemo } from '@/config/demo'
import { nombreCompleto } from '@/lib/format'
import type { Alumno, ConsultaPaginada, GrupoVista, NivelId, Pagina, PersonaVista, Tutor } from '@/types'
import { registrarEnBitacora } from './bitacora.service'
import { estadoCargo, totalCargo } from './calculos'
import { alumnosDeGrupo, entregaDe, grupoVista, hoy, materiaVista, nombreDocente, periodoActual, personaVista } from './consultas'
import { db, guardar, nuevoId, porId } from './db'
import { errorValidacion, noEncontrado, simular } from './http'
import { paginar } from './paginar'

// ───────────── Panel ─────────────

export interface PanelControl {
  inscritos: number
  porNivel: { nivel: string; alumnos: number; grupos: number }[]
  mes: { etiqueta: string; total: number; pagados: number; sinPagar: number; montoSinPagar: number; montoCobrado: number }
  cobranzaPorNivel: { nivel: string; pagados: number; sinPagar: number }[]
  tareasSinEntregar: { grupo: string; nivel: string; sinEntregar: number }[]
  totalSinEntregar: number
  vencidosAntiguos: { alumnoId: string; alumno: string; grupo: string; cargos: number; monto: number; desde: string }[]
}

export function obtenerPanel(): Promise<PanelControl> {
  return simular(() => {
    const d = db()
    const alumnos = d.alumnos.filter((a) => a.estatus === 'activo')
    const grupoDe = new Map(d.grupos.map((g) => [g.id, g]))
    const nivelDe = (a: Alumno) => grupoDe.get(a.grupoId)!.nivelId
    const mesActual = hoy().slice(0, 7)

    const porNivel = d.niveles.map((n) => ({
      nivel: n.nombre,
      alumnos: alumnos.filter((a) => nivelDe(a) === n.id).length,
      grupos: d.grupos.filter((g) => g.nivelId === n.id).length,
    }))

    const alumnoDe = new Map(alumnos.map((a) => [a.id, a]))
    const delMes = d.cargos.filter((c) => c.fechaVencimiento.startsWith(mesActual) && alumnoDe.has(c.alumnoId))
    const pagados = delMes.filter((c) => c.pagoId)
    const sinPagar = delMes.filter((c) => !c.pagoId)
    const cobranzaPorNivel = d.niveles.map((n) => {
      const delNivel = delMes.filter((c) => nivelDe(alumnoDe.get(c.alumnoId)!) === n.id)
      return { nivel: n.nombre, pagados: delNivel.filter((c) => c.pagoId).length, sinPagar: delNivel.filter((c) => !c.pagoId).length }
    })

    // Tareas del periodo en curso que vencieron sin entrega.
    const ahora = ahoraDemo()
    const tareasSinEntregar = d.grupos.map((g) => {
      const periodo = periodoActual(g.nivelId)
      const aulas = new Set(d.aulas.filter((a) => a.grupoId === g.id).map((a) => a.id))
      const integrantes = alumnosDeGrupo(g.id)
      let sinEntregar = 0
      for (const t of d.tareas) {
        if (!aulas.has(t.aulaId) || t.periodoId !== periodo?.id || new Date(t.fechaLimite) > ahora) continue
        sinEntregar += integrantes.filter((a) => !entregaDe(t.id, a.id)).length
      }
      return { grupo: g.nombre, nivel: porId('niveles', g.nivelId)!.nombre, sinEntregar }
    })

    const vencidos = new Map<string, { cargos: number; monto: number; desde: string }>()
    for (const c of d.cargos) {
      if (!alumnoDe.has(c.alumnoId) || estadoCargo(c, hoy()) !== 'vencido') continue
      const v = vencidos.get(c.alumnoId) ?? { cargos: 0, monto: 0, desde: c.fechaVencimiento }
      v.cargos++
      v.monto += totalCargo(c)
      if (c.fechaVencimiento < v.desde) v.desde = c.fechaVencimiento
      vencidos.set(c.alumnoId, v)
    }
    const vencidosAntiguos = [...vencidos.entries()]
      .map(([alumnoId, v]) => {
        const a = alumnoDe.get(alumnoId)!
        return { alumnoId, alumno: nombreCompleto(a), grupo: grupoDe.get(a.grupoId)!.nombre, ...v }
      })
      .sort((a, b) => a.desde.localeCompare(b.desde) || b.monto - a.monto)
      .slice(0, 6)

    const mes = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date(`${hoy()}T12:00:00`))
    return {
      inscritos: alumnos.length,
      porNivel,
      mes: {
        etiqueta: mes,
        total: delMes.length,
        pagados: pagados.length,
        sinPagar: sinPagar.length,
        montoSinPagar: sinPagar.reduce((s, c) => s + totalCargo(c), 0),
        montoCobrado: pagados.reduce((s, c) => s + totalCargo(c), 0),
      },
      cobranzaPorNivel,
      tareasSinEntregar,
      totalSinEntregar: tareasSinEntregar.reduce((s, g) => s + g.sinEntregar, 0),
      vencidosAntiguos,
    }
  })
}

// ───────────── Alumnos ─────────────

export interface FilaAlumno extends PersonaVista {
  matricula: string
  grupo: GrupoVista
  estatus: Alumno['estatus']
  saldoVencido: number
  tutor: string
}

export interface FiltrosAlumnos extends ConsultaPaginada {
  nivelId?: NivelId | 'todos'
  grupoId?: string | 'todos'
  adeudo?: boolean
}

export function buscarAlumnos(filtros: FiltrosAlumnos): Promise<Pagina<FilaAlumno>> {
  return simular(() => {
    const q = filtros.q?.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') ?? ''
    const d = db()
    const vencidoPor = new Map<string, number>()
    for (const c of d.cargos) if (estadoCargo(c, hoy()) === 'vencido') vencidoPor.set(c.alumnoId, (vencidoPor.get(c.alumnoId) ?? 0) + totalCargo(c))
    const grupos = new Map(d.grupos.map((g) => [g.id, grupoVista(g.id)]))
    const filas = d.alumnos
      .filter((a) => {
        const g = grupos.get(a.grupoId)!
        if (filtros.nivelId && filtros.nivelId !== 'todos' && g.nivelId !== filtros.nivelId) return false
        if (filtros.grupoId && filtros.grupoId !== 'todos' && a.grupoId !== filtros.grupoId) return false
        if (filtros.adeudo && !vencidoPor.get(a.id)) return false
        if (!q) return true
        const texto = `${nombreCompleto(a)} ${a.matricula} ${a.curp}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        return texto.includes(q)
      })
      .map((a) => {
        const tutor = a.tutorIds.map((id) => porId('tutores', id)).find(Boolean)
        return {
          ...personaVista(a),
          matricula: a.matricula,
          grupo: grupos.get(a.grupoId)!,
          estatus: a.estatus,
          saldoVencido: vencidoPor.get(a.id) ?? 0,
          tutor: tutor ? `${tutor.nombre} ${tutor.apellidoPaterno}` : '—',
        }
      })
    return paginar(filas, filtros)
  })
}

export interface Expediente {
  alumno: Alumno
  grupo: GrupoVista
  tutores: Tutor[]
  hermanos: { id: string; nombre: string; grupo: string }[]
}

export function obtenerExpediente(alumnoId: string): Promise<Expediente> {
  return simular(() => {
    const alumno = porId('alumnos', alumnoId) ?? noEncontrado('El alumno')
    const tutores = alumno.tutorIds.map((id) => porId('tutores', id)).filter((t): t is Tutor => Boolean(t))
    const hermanosIds = new Set(tutores.flatMap((t) => t.alumnoIds).filter((id) => id !== alumnoId))
    return {
      alumno,
      grupo: grupoVista(alumno.grupoId),
      tutores,
      hermanos: [...hermanosIds].map((id) => {
        const h = porId('alumnos', id)!
        return { id, nombre: nombreCompleto(h), grupo: porId('grupos', h.grupoId)!.nombre }
      }),
    }
  })
}

// ───────────── Importación desde Excel (simulada) ─────────────

export interface FilaImportacion {
  fila: number
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  curp: string
  fechaNacimiento: string
  grupo: string
  correoTutor: string
  errores: string[]
}

/** Filas de ejemplo que "contiene" el archivo; tres traen errores típicos de captura. */
const filasDeEjemplo: Omit<FilaImportacion, 'errores'>[] = [
  ['Sofía', 'Lara', 'Esquivel', 'LAES160412MXXRSF08', '2016-04-12', '4ºA', 'lucia.esquivel@correo.example'],
  ['Matías', 'Cortés', 'Rangel', 'CORM150903HXXRNT02', '2015-09-03', '5ºA', 'hector.cortes@correo.example'],
  ['Isabella', 'Fuentes', 'Navarro', 'FUNI140122MXXNVS05', '2014-01-22', '6ºA', 'carla.navarro@correo.example'],
  ['Leonardo', 'Ríos', 'Campos', 'RICL130615HXXSMN01', '2013-06-15', '1ºA', 'raul.rios@correo.example'],
  ['Valentina', 'Méndez', 'Solís', 'MESV120830MXXNLL03', '2012-08-30', '2ºA', ''],
  ['Gael', 'Herrera', 'Paz', 'HEPG110211HXXRZL09', '2011-02-11', '3ºA', 'diana.paz@correo.example'],
  ['Renata', 'Aguilar', 'Vega', 'AUVR10051', '2010-05-19', '1er sem. A', 'renata.vega@correo.example'],
  ['Diego', 'Salas', 'Ibarra', 'SAID090927HXXLBG04', '2009-09-27', '3er sem. A', 'laura.ibarra@correo.example'],
  ['Camila', 'Ortega', 'Luna', 'OELC160704MXXRNM06', '2016-07-04', '4ºB', 'pablo.ortega@correo.example'],
  ['Emiliano', 'Rosas', 'Medina', 'ROME150318HXXSDM07', '2015-03-18', '5ºA', 'gaby.medina@correo.example'],
  ['Ximena', 'Del Río', 'Paredes', 'RIPX140909MXXDRM02', '2014-09-09', '6ºA', 'alma.paredes@correo.example'],
  ['Santiago', 'Torres', 'Beltrán', 'TOBS120101HXXRLN05', '2012-01-01', '2ºA', 'mario.torres@correo.example'],
].map(([nombre, apellidoPaterno, apellidoMaterno, curp, fechaNacimiento, grupo, correoTutor], i) => ({
  fila: i + 2,
  nombre,
  apellidoPaterno,
  apellidoMaterno,
  curp,
  fechaNacimiento,
  grupo,
  correoTutor,
}))

export function validarImportacion(nombreArchivo: string): Promise<{ archivo: string; filas: FilaImportacion[] }> {
  return simular(() => {
    if (!/\.(xlsx|xls|csv)$/i.test(nombreArchivo)) errorValidacion('El archivo debe ser de Excel (.xlsx o .xls) o CSV.')
    const grupos = new Set(db().grupos.map((g) => g.nombre))
    const filas = filasDeEjemplo.map((f) => {
      const errores: string[] = []
      if (f.curp.length !== 18) errores.push('La CURP debe tener 18 caracteres.')
      if (!grupos.has(f.grupo)) errores.push(`El grupo «${f.grupo}» no existe en el ciclo 2026–2027.`)
      if (!f.correoTutor) errores.push('Falta el correo del tutor.')
      return { ...f, errores }
    })
    return { archivo: nombreArchivo, filas }
  })
}

export function confirmarImportacion(filas: FilaImportacion[]): Promise<{ importados: number }> {
  return simular(() => {
    const validas = filas.filter((f) => f.errores.length === 0)
    const grupoPorNombre = new Map(db().grupos.map((g) => [g.nombre, g.id]))
    let consecutivo = 9000 + db().alumnos.length
    for (const f of validas) {
      const tutorId = nuevoId('tut')
      const alumnoId = nuevoId('alu')
      consecutivo++
      guardar('tutores', {
        id: tutorId,
        nombre: f.correoTutor.split('.')[0].replace(/^./, (c) => c.toUpperCase()),
        apellidoPaterno: f.apellidoMaterno,
        apellidoMaterno: '',
        parentesco: 'Madre',
        ocupacion: '—',
        correo: f.correoTutor,
        telefono: '—',
        alumnoIds: [alumnoId],
      })
      guardar('alumnos', {
        id: alumnoId,
        nombre: f.nombre,
        apellidoPaterno: f.apellidoPaterno,
        apellidoMaterno: f.apellidoMaterno,
        curp: f.curp,
        fechaNacimiento: f.fechaNacimiento,
        sexo: f.curp[10] === 'M' ? 'M' : 'H',
        matricula: `2027${String(consecutivo).slice(-4)}`,
        correo: `${f.nombre.toLowerCase().split(' ')[0]}.${alumnoId.slice(-4)}@alumnos.example`,
        telefono: '—',
        grupoId: grupoPorNombre.get(f.grupo)!,
        estatus: 'activo',
        fechaInscripcion: hoy(),
        tutorIds: [tutorId],
        beca: 0,
        domicilio: 'Por capturar',
      })
    }
    registrarEnBitacora('Alumnos', 'Importó alumnos desde Excel', `${validas.length} alumnos importados; ${filas.length - validas.length} filas con errores omitidas`)
    return { importados: validas.length }
  })
}

// ───────────── Grupos y asignaciones ─────────────

export interface GrupoResumen extends GrupoVista {
  salon: string
  capacidad: number
  inscritos: number
  materias: number
  sinDocente: number
}

export function listarGrupos(): Promise<GrupoResumen[]> {
  return simular(() =>
    db().grupos.map((g) => ({
      ...grupoVista(g.id),
      salon: g.salon,
      capacidad: g.capacidad,
      inscritos: alumnosDeGrupo(g.id).length,
      materias: db().aulas.filter((a) => a.grupoId === g.id).length,
      sinDocente: db().aulas.filter((a) => a.grupoId === g.id && !porId('docentes', a.docenteId)).length,
    })),
  )
}

export interface DetalleGrupo {
  grupo: GrupoResumen
  alumnos: (PersonaVista & { matricula: string })[]
  aulas: { id: string; materia: ReturnType<typeof materiaVista>; docenteId: string; docente: string }[]
  gruposDestino: { id: string; nombre: string }[]
}

export function obtenerGrupo(grupoId: string): Promise<DetalleGrupo> {
  return simular(() => {
    const g = porId('grupos', grupoId) ?? noEncontrado('El grupo')
    const integrantes = alumnosDeGrupo(grupoId)
    return {
      grupo: {
        ...grupoVista(g.id),
        salon: g.salon,
        capacidad: g.capacidad,
        inscritos: integrantes.length,
        materias: 0,
        sinDocente: 0,
      },
      alumnos: integrantes.map((a) => ({ ...personaVista(a), matricula: a.matricula })),
      aulas: db()
        .aulas.filter((a) => a.grupoId === grupoId)
        .map((a) => ({ id: a.id, materia: materiaVista(a.materiaId), docenteId: a.docenteId, docente: nombreDocente(a.docenteId) })),
      gruposDestino: db()
        .grupos.filter((x) => x.id !== grupoId && x.nivelId === g.nivelId)
        .map((x) => ({ id: x.id, nombre: x.nombre })),
    }
  })
}

export function cambiarGrupo(alumnoId: string, grupoId: string): Promise<void> {
  return simular(() => {
    const alumno = porId('alumnos', alumnoId) ?? noEncontrado('El alumno')
    const destino = porId('grupos', grupoId) ?? noEncontrado('El grupo')
    if (alumnosDeGrupo(grupoId).length >= destino.capacidad) errorValidacion(`El grupo ${destino.nombre} ya está completo (${destino.capacidad} lugares).`)
    const origen = porId('grupos', alumno.grupoId)!
    guardar('alumnos', { ...alumno, grupoId })
    registrarEnBitacora('Grupos', 'Cambió de grupo a un alumno', `${nombreCompleto(alumno)}: ${origen.nombre} → ${destino.nombre}`)
  })
}

export function listarDocentes(): Promise<{ id: string; nombre: string; especialidad: string; niveles: NivelId[]; aulas: number }[]> {
  return simular(() =>
    db().docentes.map((d) => ({
      id: d.id,
      nombre: nombreDocente(d.id),
      especialidad: d.especialidad,
      niveles: d.niveles,
      aulas: db().aulas.filter((a) => a.docenteId === d.id).length,
    })),
  )
}

export function asignarDocente(aulaId: string, docenteId: string): Promise<void> {
  return simular(() => {
    const aula = porId('aulas', aulaId) ?? noEncontrado('El aula')
    if (!porId('docentes', docenteId)) noEncontrado('El docente')
    guardar('aulas', { ...aula, docenteId })
    registrarEnBitacora(
      'Grupos',
      'Asignó un docente',
      `${materiaVista(aula.materiaId).nombre} · ${porId('grupos', aula.grupoId)!.nombre} → ${nombreDocente(docenteId)}`,
    )
  })
}

