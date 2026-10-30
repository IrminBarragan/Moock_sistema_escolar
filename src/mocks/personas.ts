import { branding } from '@/config/branding'
import type { Alumno, Docente, Grupo, Materia, NivelId, Parentesco, Sexo, Tutor, Usuario } from '@/types'
import { grados, grupos } from './catalogos'
import {
  apellidos,
  calles,
  colonias,
  nombresAdultoHombre,
  nombresAdultoMujer,
  nombresHombre,
  nombresMujer,
  normalizarParaCorreo,
  ocupacionesHombre,
  ocupacionesMujer,
} from './nombres'
import type { Aleatorio } from './random'

/** Ids fijos de los personajes que se usan en los accesos rápidos de la demo. */
export const IDS_DEMO = {
  alumno: 'alu-demo',
  hermano: 'alu-demo-hermano',
  tutor: 'tut-demo',
  tutorPadre: 'tut-demo-padre',
  docente: 'doc-demo',
  control: 'usr-control-demo',
  sistema: 'usr-sistema-demo',
} as const

const dominio = branding.dominioCorreo

function telefono(r: Aleatorio): string {
  return `55 0${r.entero(100, 999)} ${r.entero(1000, 9999)}`
}

function correoDocente(nombre: string, apellido: string): string {
  return `${normalizarParaCorreo(nombre.split(' ')[0])}.${normalizarParaCorreo(apellido)}@${dominio}`
}

type FilaDocente = [string, Docente['titulo'], string, string, string, string, NivelId[]]

const filasDocentes: FilaDocente[] = [
  ['doc-pri-4', 'Profa.', 'Lorena', 'Esquivel', 'Ruiz', 'Educación primaria', ['primaria']],
  ['doc-pri-5', 'Mtra.', 'Gabriela', 'Arellano', 'Fuentes', 'Educación primaria', ['primaria']],
  ['doc-pri-6', 'Prof.', 'Héctor', 'Ibarra', 'Campos', 'Educación primaria', ['primaria']],
  ['doc-ing-pri', 'Mtra.', 'Diana', 'Becerra', 'Lara', 'Inglés', ['primaria']],
  ['doc-ef', 'Prof.', 'Armando', 'Zamora', 'Ríos', 'Educación física', ['primaria', 'secundaria']],
  [IDS_DEMO.docente, 'Mtro.', 'Andrés', 'Villaseñor', 'Paredes', 'Matemáticas y física', ['secundaria', 'preparatoria']],
  ['doc-esp-sec', 'Mtra.', 'Rocío', 'Cervantes', 'Luna', 'Lengua y literatura', ['secundaria']],
  ['doc-cien-sec', 'Mtra.', 'Mónica', 'Salazar', 'Ortiz', 'Ciencias naturales', ['secundaria']],
  ['doc-soc-sec', 'Mtro.', 'Raúl', 'Valdez', 'Herrera', 'Ciencias sociales', ['secundaria']],
  ['doc-ing-sec', 'Mtra.', 'Liliana', 'Ávila', 'Moreno', 'Inglés', ['secundaria', 'preparatoria']],
  ['doc-art', 'Lic.', 'Beatriz', 'Cortés', 'Medina', 'Artes visuales', ['secundaria']],
  ['doc-mat-pre', 'Ing.', 'Gustavo', 'Espinoza', 'Rangel', 'Matemáticas', ['preparatoria']],
  ['doc-qui-pre', 'Mtra.', 'Erika', 'Castro', 'Villarreal', 'Química y biología', ['preparatoria']],
  ['doc-letras', 'Mtra.', 'Adriana', 'Romero', 'Escobar', 'Letras hispánicas', ['preparatoria']],
  ['doc-inf', 'Ing.', 'Sergio', 'Guzmán', 'Reyes', 'Sistemas computacionales', ['preparatoria']],
  ['doc-hum', 'Mtro.', 'Eduardo', 'Rojas', 'Contreras', 'Humanidades', ['preparatoria']],
]

export function crearDocentes(r: Aleatorio): Docente[] {
  return filasDocentes.map(([id, titulo, nombre, apellidoPaterno, apellidoMaterno, especialidad, nivelesDocente]) => ({
    id,
    titulo,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    especialidad,
    niveles: nivelesDocente,
    correo: correoDocente(nombre, apellidoPaterno),
    telefono: telefono(r),
  }))
}

/** Quién imparte cada materia, según la clave base y el nivel. */
export function docenteDeMateria(materia: Materia, grupo: Grupo): string {
  const base = materia.clave.split('-')[0]
  if (materia.nivelId === 'primaria') {
    if (base === 'ING') return 'doc-ing-pri'
    if (base === 'EF') return 'doc-ef'
    return `doc-pri-${grupo.gradoId.split('-')[1]}`
  }
  if (materia.nivelId === 'secundaria') {
    const mapa: Record<string, string> = {
      ESP: 'doc-esp-sec',
      MAT: IDS_DEMO.docente,
      BIO: 'doc-cien-sec',
      FIS: 'doc-cien-sec',
      QUI: 'doc-cien-sec',
      GEO: 'doc-soc-sec',
      HIS: 'doc-soc-sec',
      FCE: 'doc-soc-sec',
      ING: 'doc-ing-sec',
      ART: 'doc-art',
      EF: 'doc-ef',
    }
    return mapa[base]
  }
  const mapa: Record<string, string> = {
    MAT1: 'doc-mat-pre',
    MAT3: 'doc-mat-pre',
    QUI1: 'doc-qui-pre',
    BIO1: 'doc-qui-pre',
    FIS1: IDS_DEMO.docente,
    TLR1: 'doc-letras',
    LIT1: 'doc-letras',
    ING1: 'doc-ing-sec',
    ING3: 'doc-ing-sec',
    INF1: 'doc-inf',
    MET: 'doc-hum',
    ETI1: 'doc-hum',
    HMX1: 'doc-hum',
  }
  return mapa[base]
}

interface Familia {
  id: string
  apellidoPaterno: string
  apellidoMaterno: string
  tutorIds: string[]
  hijos: { alumnoId: string; grupoId: string }[]
}

const consonantes = 'BCDFGHJKLMNPRSTVZ'

function curpFicticia(r: Aleatorio, a: Pick<Alumno, 'nombre' | 'apellidoPaterno' | 'apellidoMaterno' | 'fechaNacimiento' | 'sexo'>): string {
  const limpio = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
  const ap = limpio(a.apellidoPaterno)
  const vocal = ap.slice(1).match(/[AEIOU]/)?.[0] ?? 'X'
  const fecha = a.fechaNacimiento.slice(2).replaceAll('-', '')
  const c = () => consonantes[r.entero(0, consonantes.length - 1)]
  // "XX" no es una clave de entidad válida: la CURP no puede coincidir con una real.
  return `${ap[0]}${vocal}${limpio(a.apellidoMaterno)[0]}${limpio(a.nombre)[0]}${fecha}${a.sexo}XX${c()}${c()}${c()}0${r.entero(0, 9)}`
}

function edadBase(nivelId: NivelId, numero: number): number {
  if (nivelId === 'primaria') return 5 + numero
  if (nivelId === 'secundaria') return 11 + numero
  return 14 + Math.ceil(numero / 2)
}

export interface Comunidad {
  alumnos: Alumno[]
  tutores: Tutor[]
}

export function crearComunidad(r: Aleatorio): Comunidad {
  const alumnos: Alumno[] = []
  const tutores: Tutor[] = []
  const familias: Familia[] = []
  let consecutivo = 100

  function crearTutor(familia: Familia, id: string, sexo: Sexo, parentesco: Parentesco, nombre?: string, apellidoMaterno?: string): Tutor {
    const nombreTutor = nombre ?? r.elegir(sexo === 'M' ? nombresAdultoMujer : nombresAdultoHombre)
    const apellidoPaterno = sexo === 'H' && parentesco === 'Padre' ? familia.apellidoPaterno : familia.apellidoMaterno
    const tutor: Tutor = {
      id,
      nombre: nombreTutor,
      apellidoPaterno,
      apellidoMaterno: apellidoMaterno ?? r.elegir(apellidos),
      parentesco,
      ocupacion: r.elegir(sexo === 'M' ? ocupacionesMujer : ocupacionesHombre),
      correo: `${normalizarParaCorreo(nombreTutor.split(' ')[0])}.${normalizarParaCorreo(apellidoPaterno)}${r.entero(10, 99)}@correo.example`,
      telefono: telefono(r),
      alumnoIds: [],
    }
    tutores.push(tutor)
    return tutor
  }

  function nuevaFamilia(apellidoPaterno?: string, apellidoMaterno?: string): Familia {
    const familia: Familia = {
      id: `fam-${familias.length + 1}`,
      apellidoPaterno: apellidoPaterno ?? r.elegir(apellidos),
      apellidoMaterno: apellidoMaterno ?? r.elegir(apellidos),
      tutorIds: [],
      hijos: [],
    }
    familias.push(familia)
    return familia
  }

  function tutoresGenerados(familia: Familia) {
    const n = familias.length
    const variante = r.siguiente()
    if (variante < 0.8) {
      familia.tutorIds.push(crearTutor(familia, `tut-${n}-m`, 'M', 'Madre').id)
      familia.tutorIds.push(crearTutor(familia, `tut-${n}-p`, 'H', 'Padre').id)
    } else if (variante < 0.95) {
      familia.tutorIds.push(crearTutor(familia, `tut-${n}-m`, 'M', 'Madre').id)
    } else {
      familia.tutorIds.push(crearTutor(familia, `tut-${n}-a`, 'M', 'Abuela').id)
    }
  }

  // Familia de la demo: madre con dos hijos (secundaria y primaria).
  const familiaDemo = nuevaFamilia('Domínguez', 'Treviño')
  familiaDemo.tutorIds.push(crearTutor(familiaDemo, IDS_DEMO.tutor, 'M', 'Madre', 'Mariana', 'Lozano').id)
  familiaDemo.tutorIds.push(crearTutor(familiaDemo, IDS_DEMO.tutorPadre, 'H', 'Padre', 'Ricardo', 'Ávila').id)

  for (const grupo of grupos) {
    const grado = grados.find((g) => g.id === grupo.gradoId)!
    const edad = edadBase(grupo.nivelId, grado.numero)
    const anioIngreso = grupo.nivelId === 'primaria' ? 2026 - (grado.numero - 1) : grupo.nivelId === 'secundaria' ? 2026 - (grado.numero - 1) : 2026 - Math.floor((grado.numero - 1) / 2)

    for (let i = 0; i < 25; i++) {
      let familia: Familia
      let id = `alu-${grupo.id.slice(2)}-${String(i + 1).padStart(2, '0')}`
      let sexo: Sexo = r.probabilidad(0.5) ? 'M' : 'H'
      let nombre = r.elegir(sexo === 'M' ? nombresMujer : nombresHombre)

      if (grupo.id === 'g-sec-2a' && i === 0) {
        familia = familiaDemo
        id = IDS_DEMO.alumno
        sexo = 'M'
        nombre = 'Valeria'
      } else if (grupo.id === 'g-pri-5a' && i === 0) {
        familia = familiaDemo
        id = IDS_DEMO.hermano
        sexo = 'H'
        nombre = 'Emilio'
      } else {
        const candidatas = familias.filter(
          (f) => f !== familiaDemo && f.hijos.length < 3 && f.hijos.every((h) => h.grupoId !== grupo.id),
        )
        if (candidatas.length > 0 && r.probabilidad(0.09)) {
          familia = r.elegir(candidatas)
        } else {
          familia = nuevaFamilia()
          tutoresGenerados(familia)
        }
      }

      const mes = r.entero(1, 12)
      const dia = r.entero(1, 28)
      const anioNacimiento = 2026 - edad - (mes >= 9 ? 1 : 0)
      const fechaNacimiento = `${anioNacimiento}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      const base = {
        nombre,
        apellidoPaterno: familia.apellidoPaterno,
        apellidoMaterno: familia.apellidoMaterno,
        fechaNacimiento,
        sexo,
      }
      consecutivo += r.entero(1, 4)
      const alumno: Alumno = {
        id,
        ...base,
        matricula: `${anioIngreso}${String(consecutivo).padStart(4, '0')}`,
        curp: curpFicticia(r, base),
        correo: `${normalizarParaCorreo(nombre.split(' ')[0])}.${normalizarParaCorreo(familia.apellidoPaterno)}${String(consecutivo).slice(-3)}@alumnos.${dominio}`,
        telefono: telefono(r),
        grupoId: grupo.id,
        estatus: 'activo',
        fechaInscripcion: `${anioIngreso}-0${r.entero(6, 8)}-${String(r.entero(1, 28)).padStart(2, '0')}`,
        tutorIds: familia.tutorIds,
        beca: r.probabilidad(0.12) ? r.elegir([10, 15, 20, 25, 50]) : 0,
        domicilio: `${r.elegir(calles)} ${r.entero(12, 980)}, ${r.elegir(colonias)}`,
      }
      if (id === IDS_DEMO.alumno || id === IDS_DEMO.hermano) alumno.beca = 0
      familia.hijos.push({ alumnoId: id, grupoId: grupo.id })
      alumnos.push(alumno)
    }
  }

  for (const familia of familias) {
    for (const tutorId of familia.tutorIds) {
      const tutor = tutores.find((t) => t.id === tutorId)!
      // La alumna de la demo aparece primero en el selector de hijos.
      tutor.alumnoIds = familia.hijos.map((h) => h.alumnoId).sort((a, b) => Number(b === IDS_DEMO.alumno) - Number(a === IDS_DEMO.alumno))
    }
  }

  // Ordena los alumnos de cada grupo por apellido, como en una lista de asistencia.
  const ordenGrupo = new Map(grupos.map((g, i) => [g.id, i]))
  const claveLista = (a: Alumno) => `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombre}`
  alumnos.sort(
    (a, b) => ordenGrupo.get(a.grupoId)! - ordenGrupo.get(b.grupoId)! || claveLista(a).localeCompare(claveLista(b), 'es'),
  )

  return { alumnos, tutores: tutores.filter((t) => t.alumnoIds.length > 0) }
}

export function crearUsuarios(r: Aleatorio, docentes: Docente[], comunidad: Comunidad): Usuario[] {
  const accesoReciente = () => {
    if (r.probabilidad(0.08)) return null
    const dia = r.entero(1, 20)
    return `2027-01-${String(dia).padStart(2, '0')}T${String(r.entero(7, 22)).padStart(2, '0')}:${String(r.entero(0, 59)).padStart(2, '0')}:00-06:00`
  }

  const personal: Usuario[] = [
    { id: IDS_DEMO.control, rol: 'control', personaId: null, nombre: 'Lic. Patricia Navarro Cisneros', correo: `patricia.navarro@${dominio}`, activo: true, ultimoAcceso: '2027-01-20T08:12:00-06:00', puesto: 'Coordinadora de control escolar' },
    { id: 'usr-control-caja', rol: 'control', personaId: null, nombre: 'C.P. Alberto Juárez Lara', correo: `alberto.juarez@${dominio}`, activo: true, ultimoAcceso: '2027-01-19T17:40:00-06:00', puesto: 'Caja y cobranza' },
    { id: 'usr-control-aux', rol: 'control', personaId: null, nombre: 'Leticia Ramos Méndez', correo: `leticia.ramos@${dominio}`, activo: true, ultimoAcceso: '2027-01-20T07:55:00-06:00', puesto: 'Auxiliar administrativa' },
    { id: 'usr-direccion', rol: 'control', personaId: null, nombre: 'Mtra. Claudia Herrera Salazar', correo: `claudia.herrera@${dominio}`, activo: true, ultimoAcceso: '2027-01-18T12:03:00-06:00', puesto: 'Dirección general' },
    { id: IDS_DEMO.sistema, rol: 'sistema', personaId: null, nombre: 'Ing. Jorge Medina Solís', correo: `jorge.medina@${dominio}`, activo: true, ultimoAcceso: '2027-01-20T08:30:00-06:00', puesto: 'Administrador del sistema' },
  ]

  const deDocentes: Usuario[] = docentes.map((d) => ({
    id: `usr-${d.id}`,
    rol: 'docente',
    personaId: d.id,
    nombre: `${d.titulo} ${d.nombre} ${d.apellidoPaterno} ${d.apellidoMaterno}`,
    correo: d.correo,
    activo: true,
    ultimoAcceso: accesoReciente(),
  }))
  deDocentes.push({
    id: 'usr-doc-baja',
    rol: 'docente',
    personaId: null,
    nombre: 'Mtro. Francisco Luna Becerra',
    correo: `francisco.luna@${dominio}`,
    activo: false,
    ultimoAcceso: '2026-07-08T13:20:00-06:00',
  })

  const deTutores: Usuario[] = comunidad.tutores.map((t) => ({
    id: `usr-${t.id}`,
    rol: 'padre',
    personaId: t.id,
    nombre: `${t.nombre} ${t.apellidoPaterno} ${t.apellidoMaterno}`,
    correo: t.correo,
    activo: t.id === IDS_DEMO.tutor ? true : !r.probabilidad(0.03),
    ultimoAcceso: accesoReciente(),
  }))

  const deAlumnos: Usuario[] = comunidad.alumnos.map((a) => ({
    id: `usr-${a.id}`,
    rol: 'alumno',
    personaId: a.id,
    nombre: `${a.nombre} ${a.apellidoPaterno} ${a.apellidoMaterno}`,
    correo: a.correo,
    activo: true,
    ultimoAcceso: accesoReciente(),
  }))

  return [...personal, ...deDocentes, ...deTutores, ...deAlumnos]
}
