import type { Alumno, Aula, Cargo, Docente, EntradaBitacora, Entrega, Materia, Pago, Tarea, Usuario } from '@/types'
import type { Aleatorio } from './random'

const dinero = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

interface Fuentes {
  usuarios: Usuario[]
  docentes: Docente[]
  alumnos: Alumno[]
  aulas: Aula[]
  materias: Materia[]
  tareas: Tarea[]
  entregas: Entrega[]
  cargos: Cargo[]
  pagos: Pago[]
}

/** Bitácora inicial construida a partir de los mismos datos ficticios, para que sea coherente. */
export function crearBitacora(r: Aleatorio, f: Fuentes): EntradaBitacora[] {
  const entradas: EntradaBitacora[] = []
  const alumno = new Map(f.alumnos.map((a) => [a.id, a]))
  const aula = new Map(f.aulas.map((a) => [a.id, a]))
  const materia = new Map(f.materias.map((m) => [m.id, m]))
  const tarea = new Map(f.tareas.map((t) => [t.id, t]))
  const cargo = new Map(f.cargos.map((c) => [c.id, c]))
  const docente = new Map(f.docentes.map((d) => [d.id, d]))
  const desde = '2027-01-07'
  const hasta = '2027-01-20T09:00:00-06:00'

  for (const p of f.pagos.filter((p) => p.confirmadoEl >= desde)) {
    if (!r.probabilidad(0.35)) continue
    const c = cargo.get(p.cargoId)!
    const a = alumno.get(c.alumnoId)!
    entradas.push({
      id: `bit-${p.id}`,
      fecha: p.confirmadoEl,
      usuario: p.confirmadoPor,
      rol: 'control',
      modulo: 'Pagos',
      accion: 'Confirmó un pago',
      detalle: `${c.descripcion} · ${a.nombre} ${a.apellidoPaterno} · ${dinero(p.monto)} · ${p.referencia}`,
    })
  }

  for (const e of f.entregas.filter((e) => e.calificadaEl && e.calificadaEl >= desde)) {
    if (!r.probabilidad(0.03)) continue
    const t = tarea.get(e.tareaId)!
    const au = aula.get(t.aulaId)!
    const d = docente.get(au.docenteId)!
    const a = alumno.get(e.alumnoId)!
    entradas.push({
      id: `bit-${e.id}`,
      fecha: e.calificadaEl!,
      usuario: `${d.titulo} ${d.nombre} ${d.apellidoPaterno} ${d.apellidoMaterno}`,
      rol: 'docente',
      modulo: 'Tareas',
      accion: 'Calificó una entrega',
      detalle: `${t.titulo} · ${materia.get(au.materiaId)!.nombre} · ${a.nombre} ${a.apellidoPaterno}: ${e.calificacion?.toFixed(1)}`,
    })
  }

  for (const t of f.tareas.filter((t) => t.publicadaEl >= desde && t.publicadaEl <= hasta)) {
    if (!r.probabilidad(0.25)) continue
    const au = aula.get(t.aulaId)!
    const d = docente.get(au.docenteId)!
    entradas.push({
      id: `bit-pub-${t.id}`,
      fecha: t.publicadaEl,
      usuario: `${d.titulo} ${d.nombre} ${d.apellidoPaterno} ${d.apellidoMaterno}`,
      rol: 'docente',
      modulo: 'Tareas',
      accion: 'Publicó una tarea',
      detalle: `${t.titulo} · ${materia.get(au.materiaId)!.nombre}`,
    })
  }

  const accesos = f.usuarios.filter((u) => u.ultimoAcceso && u.ultimoAcceso >= desde && u.rol !== 'alumno')
  for (const u of accesos) {
    if (!r.probabilidad(0.12)) continue
    entradas.push({
      id: `bit-ses-${u.id}`,
      fecha: u.ultimoAcceso!,
      usuario: u.nombre,
      rol: u.rol,
      modulo: 'Sesión',
      accion: 'Inició sesión',
      detalle: 'Acceso desde navegador web',
    })
  }

  entradas.push(
    { id: 'bit-cfg-1', fecha: '2027-01-08T10:14:00-06:00', usuario: 'Ing. Jorge Medina Solís', rol: 'sistema', modulo: 'Configuración', accion: 'Actualizó un periodo de evaluación', detalle: 'Parcial 3 (Preparatoria): cierre al 29/01/2027' },
    { id: 'bit-cfg-2', fecha: '2027-01-11T09:02:00-06:00', usuario: 'Ing. Jorge Medina Solís', rol: 'sistema', modulo: 'Usuarios', accion: 'Desactivó un usuario', detalle: 'Mtro. Francisco Luna Becerra (docente)' },
    { id: 'bit-alu-1', fecha: '2027-01-12T12:40:00-06:00', usuario: 'Leticia Ramos Méndez', rol: 'control', modulo: 'Alumnos', accion: 'Actualizó un expediente', detalle: 'Cambio de domicilio y teléfono de contacto' },
    { id: 'bit-gru-1', fecha: '2027-01-13T08:20:00-06:00', usuario: 'Lic. Patricia Navarro Cisneros', rol: 'control', modulo: 'Grupos', accion: 'Asignó un docente', detalle: 'Historia · 3ºA → Mtro. Raúl Valdez Herrera' },
  )

  return entradas.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}
