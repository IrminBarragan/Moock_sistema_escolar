import type {
  Alumno,
  Archivo,
  Aula,
  Aviso,
  Docente,
  Entrega,
  Evaluacion,
  Material,
  TipoArchivo,
  Tarea,
  Tema,
} from '@/types'
import { grupos, materias, periodos } from './catalogos'
import { docenteDeMateria, IDS_DEMO } from './personas'
import type { Aleatorio } from './random'
import { temasDe } from './temas'

const H = (fecha: string, hora = '23:59') => `${fecha}T${hora}:00-06:00`

/** Fechas límite de las tareas de cada periodo (la fecha de la demo es 20/01/2027). */
const calendarioTareas: Record<string, string[]> = {
  'p-primaria-1': ['2026-09-18', '2026-10-16', '2026-11-13'],
  'p-secundaria-1': ['2026-09-18', '2026-10-16', '2026-11-13'],
  'p-primaria-2': ['2026-12-11', '2027-01-15', '2027-01-22', '2027-01-29'],
  'p-secundaria-2': ['2026-12-11', '2027-01-15', '2027-01-22', '2027-01-29'],
  'p-preparatoria-1': ['2026-09-11', '2026-09-25'],
  'p-preparatoria-2': ['2026-10-16', '2026-10-30', '2026-11-06'],
  'p-preparatoria-3': ['2026-11-27', '2027-01-15', '2027-01-22', '2027-01-27'],
}

/** Ninguna entrega ficticia puede ser posterior a la mañana del "hoy" de la demo. */
const LIMITE_DEMO = new Date('2027-01-20T07:00:00-06:00')

const PERIODOS_ACTUALES = new Set(['p-primaria-2', 'p-secundaria-2', 'p-preparatoria-3'])

function restarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00-06:00`)
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

const minFecha = (a: string, b: string) => (a < b ? a : b)

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)
}

const extension: Record<TipoArchivo, string> = {
  pdf: 'pdf',
  word: 'docx',
  excel: 'xlsx',
  powerpoint: 'pptx',
  imagen: 'jpg',
  video: 'mp4',
  otro: 'zip',
}

let contadorArchivo = 0
function archivo(r: Aleatorio, nombreBase: string, tipo: TipoArchivo): Archivo {
  contadorArchivo++
  const tamanos: Record<TipoArchivo, [number, number]> = {
    pdf: [180, 2400],
    word: [40, 600],
    excel: [30, 420],
    powerpoint: [900, 8200],
    imagen: [350, 3200],
    video: [24000, 180000],
    otro: [100, 4000],
  }
  const [min, max] = tamanos[tipo]
  return {
    id: `arc-${contadorArchivo}`,
    nombre: `${slug(nombreBase)}.${extension[tipo]}`,
    tipo,
    tamanoKb: r.entero(min, max),
    ...(tipo === 'video' ? { duracionSeg: r.entero(240, 900) } : {}),
  }
}

const plantillasMaterial: [TipoArchivo, (tema: string) => string, (tema: string) => string][] = [
  ['video', (t) => `Video: ${t} en 10 minutos`, (t) => `Explicación en video con ejemplos resueltos sobre ${t.toLowerCase()}.`],
  ['pdf', (t) => `Guía de estudio — ${t}`, () => 'Resumen del tema con conceptos clave y ejercicios de práctica.'],
  ['powerpoint', (t) => `Presentación de clase: ${t}`, () => 'Diapositivas que usamos en clase. Úsalas para repasar.'],
  ['word', () => 'Hoja de ejercicios', () => 'Descárgala, resuélvela y guárdala en tu carpeta de evidencias.'],
  ['excel', () => 'Plantilla de registro de datos', () => 'Formato para registrar tus observaciones y resultados.'],
  ['imagen', () => 'Esquema resumen', (t) => `Mapa visual con las ideas principales de ${t.toLowerCase()}.`],
]

const plantillasTarea: [(tema: string) => string, (tema: string) => string][] = [
  [
    (t) => `Ejercicios: ${t}`,
    (t) =>
      `Revisa el material del tema «${t}» antes de comenzar.\n\n1. Resuelve los ejercicios de la hoja adjunta.\n2. Escribe el procedimiento completo, no solo el resultado.\n3. Sube tu trabajo en PDF o como fotografía legible.\n\nSe evaluará: procedimiento (50 %), resultado (30 %) y presentación (20 %).`,
  ],
  [
    (t) => `Mapa conceptual: ${t}`,
    (t) =>
      `Elabora un mapa conceptual sobre «${t}» con al menos 12 conceptos relacionados.\n\nPuedes hacerlo a mano o en computadora. Incluye conectores entre los conceptos y un título.\n\nSe evaluará: conceptos correctos (40 %), relaciones (40 %) y presentación (20 %).`,
  ],
  [
    (t) => `Investigación: ${t}`,
    (t) =>
      `Investiga en al menos dos fuentes confiables sobre «${t}».\n\nEntrega un texto de una cuartilla con: introducción, desarrollo, conclusión personal y las fuentes consultadas.\n\nNo se aceptan textos copiados; escribe con tus propias palabras.`,
  ],
  [
    (t) => `Cuestionario de repaso — ${t}`,
    (t) =>
      `Contesta el cuestionario adjunto sobre «${t}».\n\nResponde con oraciones completas. Si tienes dudas, revisa la guía de estudio del tema o pregúntame en clase.`,
  ],
  [
    (t) => `Proyecto breve: ${t}`,
    (t) =>
      `En equipos de máximo tres integrantes, preparen un producto (cartel, maqueta o presentación) que explique «${t}».\n\nCada integrante sube el mismo archivo y escribe en el comentario qué parte le tocó.\n\nSe evaluará: contenido (50 %), creatividad (25 %) y trabajo en equipo (25 %).`,
  ],
]

const textosEntrega = [
  'Adjunto mi tarea. Gracias.',
  'Aquí está mi trabajo, maestro(a).',
  'Tuve dudas en el ejercicio 4, lo resolví como lo vimos en clase.',
  'Envío mi tarea en PDF.',
  '',
  'Le comparto mi trabajo terminado.',
  'Subo las fotos de mi cuaderno.',
  '',
]

function comentarioPara(r: Aleatorio, calificacion: number): string {
  if (r.probabilidad(0.3)) return ''
  if (calificacion >= 9.5) return r.elegir(['Excelente trabajo, muy completo y bien presentado.', 'Muy bien. Tu procedimiento es claro y ordenado.', '¡Felicidades! Se nota tu esfuerzo.'])
  if (calificacion >= 8) return r.elegir(['Buen trabajo. Revisa la redacción de tus conclusiones.', 'Bien resuelto; cuida la limpieza en la presentación.', 'Buen avance. Te faltó citar una fuente.'])
  if (calificacion >= 7) return r.elegir(['Cumple con lo solicitado, pero faltó desarrollar el punto 3.', 'Revisa los errores marcados y corrígelos en tu cuaderno.'])
  return r.elegir(['Faltaron varios puntos. Acércate en asesoría para repasar el tema.', 'Entrega incompleta. Revisa las instrucciones con atención.'])
}

const redondearMedio = (n: number) => Math.min(10, Math.max(5, Math.round(n * 2) / 2))

export interface Academico {
  aulas: Aula[]
  temas: Tema[]
  materiales: Material[]
  tareas: Tarea[]
  entregas: Entrega[]
  evaluaciones: Evaluacion[]
  avisos: Aviso[]
}

export function crearAcademico(r: Aleatorio, alumnos: Alumno[], docentes: Docente[]): Academico {
  const aulas: Aula[] = []
  const temas: Tema[] = []
  const materiales: Material[] = []
  const tareas: Tarea[] = []
  const entregas: Entrega[] = []
  const evaluaciones: Evaluacion[] = []
  const avisos: Aviso[] = []
  contadorArchivo = 0

  // Perfil académico estable por alumno.
  const perfil = new Map(
    alumnos.map((a) => [
      a.id,
      {
        aptitud: a.id === IDS_DEMO.alumno ? 9.2 : a.id === IDS_DEMO.hermano ? 8.6 : Math.min(9.8, Math.max(6, r.normal(8.1, 0.9))),
        constancia: a.id === IDS_DEMO.alumno ? 0.97 : Math.min(1, Math.max(0.8, r.normal(0.95, 0.05))),
      },
    ]),
  )

  for (const grupo of grupos) {
    const alumnosGrupo = alumnos.filter((a) => a.grupoId === grupo.id)
    const periodosNivel = periodos.filter((p) => p.nivelId === grupo.nivelId)

    for (const materia of materias.filter((m) => m.gradoId === grupo.gradoId)) {
      const docenteId = docenteDeMateria(materia, grupo)
      const docente = docentes.find((d) => d.id === docenteId)!
      const aulaId = `aula-${grupo.id.slice(2)}-${materia.clave.split('-')[0].toLowerCase()}`
      const esAulaDemoDocente = docenteId === IDS_DEMO.docente
      aulas.push({
        id: aulaId,
        materiaId: materia.id,
        grupoId: grupo.id,
        docenteId,
        descripcion: `${materia.nombre} · ${grupo.nombre} · ciclo 2026–2027`,
      })

      const nombresTemas = temasDe(materia.nombre, grupo.gradoId)
      const temasAula = nombresTemas.map((titulo, i) => ({
        id: `${aulaId}-t${i + 1}`,
        aulaId,
        titulo,
        descripcion: `Unidad ${i + 1}. ${i % 2 === 0 ? 'Conceptos básicos y ejemplos.' : 'Aplicación y práctica.'}`,
        orden: i + 1,
      }))
      temas.push(...temasAula)

      periodosNivel.forEach((periodo, indicePeriodo) => {
        const fechas = calendarioTareas[periodo.id] ?? []
        const temasPeriodo = temasAula.slice(indicePeriodo * 2, indicePeriodo * 2 + 2)
        const esActual = PERIODOS_ACTUALES.has(periodo.id)

        // Material solo en temas de periodos que ya empezaron.
        if (fechas.length > 0) {
          temasPeriodo.forEach((tema, it) => {
            const cantidad = r.entero(2, 4)
            const elegidas = r.barajar(plantillasMaterial).slice(0, cantidad)
            elegidas.forEach(([tipo, titulo, descripcion], im) => {
              const publicado = restarDias(fechas[Math.min(it * 2, fechas.length - 1)], 9 - im)
              materiales.push({
                id: `${tema.id}-m${im + 1}`,
                aulaId,
                temaId: tema.id,
                titulo: titulo(tema.titulo),
                descripcion: descripcion(tema.titulo),
                archivo: archivo(r, titulo(tema.titulo), tipo),
                publicadoEl: H(publicado, '07:30'),
              })
            })
          })
        }

        fechas.forEach((fecha, indiceTarea) => {
          const tema = temasPeriodo[Math.min(Math.floor((indiceTarea * temasPeriodo.length) / fechas.length), temasPeriodo.length - 1)]
          const [titulo, instrucciones] = plantillasTarea[(indiceTarea + indicePeriodo + materia.horasSemana) % plantillasTarea.length]
          const tareaId = `${aulaId}-${periodo.id.slice(-1)}-${indiceTarea + 1}`
          const adjuntos: Archivo[] = []
          if (r.probabilidad(0.6)) adjuntos.push(archivo(r, `Instrucciones ${tema.titulo}`, r.elegir(['pdf', 'word'] as const)))
          if (r.probabilidad(0.3)) adjuntos.push(archivo(r, 'Rubrica de evaluacion', 'pdf'))
          const tarea: Tarea = {
            id: tareaId,
            aulaId,
            temaId: tema.id,
            periodoId: periodo.id,
            titulo: titulo(tema.titulo),
            instrucciones: instrucciones(tema.titulo),
            adjuntos,
            fechaLimite: H(fecha),
            puntos: r.elegir([10, 10, 20, 50, 100]),
            // Nada se publica después del "hoy" de la demo.
            publicadaEl: H(minFecha(restarDias(fecha, r.entero(6, 10)), '2027-01-19'), '08:00'),
            permiteEntregaTardia: r.probabilidad(0.7),
          }
          tareas.push(tarea)

          // Etapa de la tarea respecto al 20/01/2027.
          const etapa: 'calificada' | 'revision' | 'proxima' | 'futura' = !esActual
            ? 'calificada'
            : indiceTarea === 0
              ? 'calificada'
              : indiceTarea === 1
                ? 'revision'
                : indiceTarea === 2
                  ? 'proxima'
                  : 'futura'

          // En aulas ajenas a la demo, la tarea en revisión suele estar ya calificada.
          const revisionCalificada = etapa === 'revision' && !esAulaDemoDocente && r.probabilidad(0.55)

          alumnosGrupo.forEach((alumno, indiceAlumno) => {
            const p = perfil.get(alumno.id)!
            const esDemo = alumno.id === IDS_DEMO.alumno
            let entrega = etapa === 'calificada' || etapa === 'revision' ? r.probabilidad(p.constancia) : etapa === 'proxima' ? r.probabilidad(0.35) : r.probabilidad(0.05)
            let tarde = entrega && tarea.permiteEntregaTardia && (etapa === 'calificada' || etapa === 'revision') && r.probabilidad(0.07)

            // La alumna de la demo es constante: entrega todo lo que ya se calificó.
            if (esDemo && etapa === 'calificada') {
              entrega = true
              tarde = false
            }
            if (esDemo && esActual) {
              const base = materia.clave.split('-')[0]
              if (etapa === 'revision') {
                entrega = base !== 'HIS'
                tarde = base === 'FIS'
              }
              if (etapa === 'proxima') entrega = base === 'ESP'
              if (etapa === 'futura') entrega = false
            }
            if (!entrega) return

            const limite = new Date(tarea.fechaLimite)
            const entregada = new Date(limite)
            if (tarde) entregada.setHours(entregada.getHours() + r.entero(8, 40))
            else entregada.setHours(entregada.getHours() - r.entero(2, 90))
            if (entregada > LIMITE_DEMO) entregada.setTime(LIMITE_DEMO.getTime() - r.entero(1, 60) * 3600000)

            const calificar = etapa === 'calificada' || revisionCalificada || (etapa === 'revision' && esAulaDemoDocente && indiceAlumno < 12)
            const calificacion = calificar ? redondearMedio(r.normal(p.aptitud - (tarde ? 0.8 : 0), 0.8)) : null
            const nombreAlumno = alumno.nombre.split(' ')[0]
            const tipoEntrega = r.elegir(['pdf', 'pdf', 'word', 'imagen'] as const)
            const calificadaEl = calificar ? new Date(Math.min(limite.getTime() + r.entero(1, 5) * 86400000, new Date('2027-01-19T18:00:00-06:00').getTime())) : null

            entregas.push({
              id: `ent-${tareaId}-${alumno.id}`,
              tareaId,
              alumnoId: alumno.id,
              entregadaEl: entregada.toISOString(),
              texto: r.elegir(textosEntrega),
              archivos: [archivo(r, `${tarea.titulo.split(':')[0]} ${nombreAlumno} ${alumno.apellidoPaterno}`, tipoEntrega)],
              calificacion,
              comentario: calificacion !== null ? comentarioPara(r, calificacion) : '',
              calificadaEl: calificadaEl ? calificadaEl.toISOString() : null,
            })
          })
        })

        // Examen y participación: capturados en periodos cerrados; en el actual solo participación.
        if (fechas.length > 0) {
          for (const alumno of alumnosGrupo) {
            const p = perfil.get(alumno.id)!
            evaluaciones.push({
              id: `ev-${aulaId}-${periodo.id}-${alumno.id}`,
              aulaId,
              alumnoId: alumno.id,
              periodoId: periodo.id,
              examen: esActual ? null : redondearMedio(r.normal(p.aptitud - 0.2, 1)),
              participacion: redondearMedio(r.normal(p.aptitud + 0.3, 0.6)),
            })
          }
        }
      })

      // Avisos del docente en el aula.
      const temaActual = temasAula[grupo.nivelId === 'preparatoria' ? 4 : 2]
      const tareaProxima = tareas.find((t) => t.aulaId === aulaId && t.fechaLimite.startsWith('2027-01-22'))
      const nombreDocente = `${docente.titulo} ${docente.nombre} ${docente.apellidoPaterno}`
      avisos.push({
        id: `av-${aulaId}-1`,
        titulo: 'Material nuevo disponible',
        cuerpo: `Ya está disponible la presentación del tema «${temaActual.titulo}». Revísenla antes de la próxima clase y anoten sus dudas.`,
        autor: nombreDocente,
        alcance: { tipo: 'aula', aulaId },
        publicadoEl: H(`2027-01-${String(r.entero(11, 14)).padStart(2, '0')}`, '07:45'),
        importante: false,
      })
      if (tareaProxima && r.probabilidad(0.7)) {
        avisos.push({
          id: `av-${aulaId}-2`,
          titulo: 'Recordatorio de entrega',
          cuerpo: `Les recuerdo que «${tareaProxima.titulo}» vence el viernes 22/01/2027 a las 23:59. No se recibirán trabajos por correo; súbanlos a la plataforma.`,
          autor: nombreDocente,
          alcance: { tipo: 'aula', aulaId },
          publicadoEl: H('2027-01-18', '19:10'),
          importante: false,
        })
      }
    }
  }

  avisos.push(
    {
      id: 'av-esc-1',
      titulo: 'Suspensión de clases: lunes 1 de febrero',
      cuerpo: 'Con motivo del aniversario de la Constitución, el lunes 1 de febrero no habrá clases en ningún nivel. Las actividades se reanudan el martes 2 en el horario habitual.',
      autor: 'Dirección general',
      alcance: { tipo: 'escuela' },
      publicadoEl: H('2027-01-18', '09:00'),
      importante: true,
    },
    {
      id: 'av-esc-2',
      titulo: 'Colegiatura de enero',
      cuerpo: 'La colegiatura de enero venció el 10/01/2027. A partir de esa fecha se aplica un recargo de 5 %. Si ya realizaste tu pago por transferencia, conserva tu comprobante; control escolar lo confirmará en un máximo de dos días hábiles.',
      autor: 'Control escolar',
      alcance: { tipo: 'escuela' },
      publicadoEl: H('2027-01-12', '08:30'),
      importante: false,
    },
    {
      id: 'av-esc-3',
      titulo: 'Regreso a clases',
      cuerpo: 'Les damos la bienvenida de regreso. Recuerden que a partir del 7 de enero el horario de entrada es a las 7:30 en todos los niveles.',
      autor: 'Dirección general',
      alcance: { tipo: 'escuela' },
      publicadoEl: H('2027-01-05', '10:00'),
      importante: false,
    },
    {
      id: 'av-esc-4',
      titulo: 'Entrega de boletas del primer trimestre',
      cuerpo: 'Las boletas del primer trimestre ya pueden consultarse en la sección de calificaciones. Si tienen dudas, agenden una cita con el titular del grupo.',
      autor: 'Dirección general',
      alcance: { tipo: 'escuela' },
      publicadoEl: H('2026-12-09', '12:00'),
      importante: false,
    },
    {
      id: 'av-niv-sec',
      titulo: 'Feria de ciencias de secundaria',
      cuerpo: 'La feria de ciencias será el viernes 26 de febrero en el patio central. Cada grupo presentará tres proyectos; los equipos se registran con su docente de ciencias antes del 5 de febrero.',
      autor: 'Coordinación de secundaria',
      alcance: { tipo: 'nivel', nivelId: 'secundaria' },
      publicadoEl: H('2027-01-14', '13:00'),
      importante: false,
    },
    {
      id: 'av-niv-pri',
      titulo: 'Festival de lectura',
      cuerpo: 'Durante febrero cada grupo de primaria tendrá una sesión semanal de lectura en voz alta. Pedimos que los alumnos traigan un libro de su elección los viernes.',
      autor: 'Coordinación de primaria',
      alcance: { tipo: 'nivel', nivelId: 'primaria' },
      publicadoEl: H('2027-01-11', '12:30'),
      importante: false,
    },
    {
      id: 'av-niv-pre',
      titulo: 'Cierre del semestre',
      cuerpo: 'El tercer parcial cierra el 29 de enero. Los exámenes finales se aplicarán del 1 al 5 de febrero según el calendario que publicará cada docente.',
      autor: 'Coordinación de preparatoria',
      alcance: { tipo: 'nivel', nivelId: 'preparatoria' },
      publicadoEl: H('2027-01-13', '11:15'),
      importante: true,
    },
  )

  return { aulas, temas, materiales, tareas, entregas, evaluaciones, avisos }
}
