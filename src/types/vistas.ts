/**
 * Formas de las respuestas de los servicios (equivalentes a los DTO de la API).
 * Las pantallas dependen de estos tipos, no de la estructura interna de los datos.
 */
import type { Archivo, Aviso, Entrega, EstadoTarea, Material, Tarea, Tema } from './academico'
import type { ColorMateria, EstadoPeriodo, NivelId } from './escolar'
import type { Cargo, EstadoCargo, Pago } from './pagos'

export interface MateriaVista {
  id: string
  nombre: string
  clave: string
  color: ColorMateria
}

export interface GrupoVista {
  id: string
  nombre: string
  nivelId: NivelId
  nivel: string
  grado: string
}

export interface PeriodoVista {
  id: string
  nombre: string
  inicio: string
  fin: string
  estado: EstadoPeriodo
}

export interface PersonaVista {
  id: string
  nombre: string
  /** "Apellidos, Nombre" para listas. */
  nombreLista: string
  iniciales: string
}

export interface AulaResumen {
  id: string
  materia: MateriaVista
  grupo: GrupoVista
  docente: { id: string; nombre: string }
  alumnos: number
  periodoActual: PeriodoVista | null
  /** Entregas sin calificar (vista del docente). */
  porRevisar: number
  /** Tareas sin entregar del alumno (vista del alumno). */
  pendientes: number
  proximaTarea: { id: string; titulo: string; fechaLimite: string } | null
}

export interface TemaConMaterial extends Tema {
  materiales: Material[]
  totalTareas: number
}

export interface AulaDetalle extends AulaResumen {
  descripcion: string
  temas: TemaConMaterial[]
}

export interface TareaDocenteFila {
  tarea: Tarea
  tema: string
  periodo: PeriodoVista
  total: number
  entregadas: number
  porRevisar: number
  calificadas: number
}

export interface FilaEntrega {
  alumno: PersonaVista
  estado: EstadoTarea
  entrega: Entrega | null
}

export interface EntregasDeTarea {
  tarea: Tarea
  tema: string
  aula: AulaResumen
  filas: FilaEntrega[]
}

export interface TareaAlumnoVista {
  tarea: Tarea
  aulaId: string
  materia: MateriaVista
  docente: string
  tema: string
  estado: EstadoTarea
  entrega: Entrega | null
}

export interface NotaPlanilla {
  valor: number | null
  estado: EstadoTarea
}

export interface FilaPlanilla {
  alumno: PersonaVista
  notas: Record<string, NotaPlanilla>
  examen: number | null
  participacion: number | null
  promedioTareas: number | null
  final: number | null
}

export interface PlanillaPeriodo {
  aula: AulaResumen
  periodo: PeriodoVista
  periodos: PeriodoVista[]
  tareas: Tarea[]
  filas: FilaPlanilla[]
  editable: boolean
  promedioGrupo: number | null
}

export interface CambioPlanilla {
  alumnoId: string
  campo: 'tarea' | 'examen' | 'participacion'
  tareaId?: string
  valor: number | null
}

export interface AvisoVista extends Aviso {
  origen: string
  materia: MateriaVista | null
}

export interface BoletaMateria {
  aulaId: string
  materia: MateriaVista
  docente: string
  porPeriodo: Record<string, number | null>
  promedio: number | null
}

export interface Boleta {
  alumno: PersonaVista & { matricula: string }
  grupo: GrupoVista
  periodos: PeriodoVista[]
  materias: BoletaMateria[]
  promedioPorPeriodo: Record<string, number | null>
  promedioGeneral: number | null
}

export interface CargoVista extends Cargo {
  estado: EstadoCargo
  total: number
  pago: Pago | null
  concepto: string
}

export interface EstadoCuenta {
  alumno: PersonaVista & { matricula: string; beca: number }
  grupo: GrupoVista
  cargos: CargoVista[]
  resumen: { pagado: number; pendiente: number; vencido: number; proximo: CargoVista | null }
}

export interface ArchivoNuevo {
  nombre: string
  tipo: Archivo['tipo']
  tamanoKb: number
  duracionSeg?: number
}
