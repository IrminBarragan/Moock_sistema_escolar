import type {
  CicloEscolar,
  ColorMateria,
  ConceptoCobro,
  ConfiguracionCobro,
  Grado,
  Grupo,
  Materia,
  Nivel,
  NivelId,
  PeriodoEvaluacion,
} from '@/types'

export const CICLO_ACTUAL_ID = 'ciclo-2026-2027'

export const ciclos: CicloEscolar[] = [
  { id: 'ciclo-2025-2026', nombre: '2025–2026', inicio: '2025-08-25', fin: '2026-07-10', activo: false },
  { id: CICLO_ACTUAL_ID, nombre: '2026–2027', inicio: '2026-08-24', fin: '2027-07-09', activo: true },
]

export const niveles: Nivel[] = [
  { id: 'primaria', nombre: 'Primaria', orden: 1, tipoGrado: 'grado', nombrePeriodo: 'Trimestre' },
  { id: 'secundaria', nombre: 'Secundaria', orden: 2, tipoGrado: 'grado', nombrePeriodo: 'Trimestre' },
  { id: 'preparatoria', nombre: 'Preparatoria', orden: 3, tipoGrado: 'semestre', nombrePeriodo: 'Parcial' },
]

const ordinalSemestre = ['1er', '2º', '3er', '4º', '5º', '6º']

export const grados: Grado[] = [
  ...[1, 2, 3, 4, 5, 6].map((n) => ({
    id: `pri-${n}`,
    nivelId: 'primaria' as const,
    numero: n,
    nombre: `${n}º de primaria`,
  })),
  ...[1, 2, 3].map((n) => ({
    id: `sec-${n}`,
    nivelId: 'secundaria' as const,
    numero: n,
    nombre: `${n}º de secundaria`,
  })),
  ...[1, 2, 3, 4, 5, 6].map((n) => ({
    id: `pre-${n}`,
    nivelId: 'preparatoria' as const,
    numero: n,
    nombre: `${ordinalSemestre[n - 1]} semestre`,
  })),
]

export const grupos: Grupo[] = [
  { id: 'g-pri-4a', cicloId: CICLO_ACTUAL_ID, nivelId: 'primaria', gradoId: 'pri-4', nombre: '4ºA', salon: 'P-104', capacidad: 28 },
  { id: 'g-pri-5a', cicloId: CICLO_ACTUAL_ID, nivelId: 'primaria', gradoId: 'pri-5', nombre: '5ºA', salon: 'P-105', capacidad: 28 },
  { id: 'g-pri-6a', cicloId: CICLO_ACTUAL_ID, nivelId: 'primaria', gradoId: 'pri-6', nombre: '6ºA', salon: 'P-106', capacidad: 28 },
  { id: 'g-sec-1a', cicloId: CICLO_ACTUAL_ID, nivelId: 'secundaria', gradoId: 'sec-1', nombre: '1ºA', salon: 'S-201', capacidad: 30 },
  { id: 'g-sec-2a', cicloId: CICLO_ACTUAL_ID, nivelId: 'secundaria', gradoId: 'sec-2', nombre: '2ºA', salon: 'S-202', capacidad: 30 },
  { id: 'g-sec-3a', cicloId: CICLO_ACTUAL_ID, nivelId: 'secundaria', gradoId: 'sec-3', nombre: '3ºA', salon: 'S-203', capacidad: 30 },
  { id: 'g-pre-1a', cicloId: CICLO_ACTUAL_ID, nivelId: 'preparatoria', gradoId: 'pre-1', nombre: '1er sem. A', salon: 'B-301', capacidad: 32 },
  { id: 'g-pre-3a', cicloId: CICLO_ACTUAL_ID, nivelId: 'preparatoria', gradoId: 'pre-3', nombre: '3er sem. A', salon: 'B-303', capacidad: 32 },
]

/** Plan de estudios por grado: [nombre, clave, color, horas]. */
type FilaPlan = [string, string, ColorMateria, number]

const planPrimaria: FilaPlan[] = [
  ['Español', 'ESP', 'coral', 6],
  ['Matemáticas', 'MAT', 'azul', 6],
  ['Ciencias Naturales', 'CN', 'verde', 3],
  ['Historia', 'HIS', 'ambar', 2],
  ['Geografía', 'GEO', 'teal', 2],
  ['Formación Cívica y Ética', 'FCE', 'violeta', 2],
  ['Inglés', 'ING', 'indigo', 3],
  ['Educación Física', 'EF', 'naranja', 2],
]

const planSecundaria: Record<number, FilaPlan[]> = {
  1: [
    ['Español', 'ESP', 'coral', 5],
    ['Matemáticas', 'MAT', 'azul', 5],
    ['Biología', 'BIO', 'verde', 4],
    ['Geografía', 'GEO', 'teal', 4],
    ['Historia', 'HIS', 'ambar', 3],
    ['Inglés', 'ING', 'indigo', 3],
    ['Artes', 'ART', 'rosa', 3],
    ['Educación Física', 'EF', 'naranja', 2],
  ],
  2: [
    ['Español', 'ESP', 'coral', 5],
    ['Matemáticas', 'MAT', 'azul', 5],
    ['Física', 'FIS', 'cian', 4],
    ['Historia', 'HIS', 'ambar', 4],
    ['Formación Cívica y Ética', 'FCE', 'violeta', 3],
    ['Inglés', 'ING', 'indigo', 3],
    ['Artes', 'ART', 'rosa', 3],
    ['Educación Física', 'EF', 'naranja', 2],
  ],
  3: [
    ['Español', 'ESP', 'coral', 5],
    ['Matemáticas', 'MAT', 'azul', 5],
    ['Química', 'QUI', 'oliva', 4],
    ['Historia', 'HIS', 'ambar', 4],
    ['Formación Cívica y Ética', 'FCE', 'violeta', 3],
    ['Inglés', 'ING', 'indigo', 3],
    ['Artes', 'ART', 'rosa', 3],
    ['Educación Física', 'EF', 'naranja', 2],
  ],
}

const planPreparatoria: Record<number, FilaPlan[]> = {
  1: [
    ['Matemáticas I', 'MAT1', 'azul', 5],
    ['Química I', 'QUI1', 'oliva', 4],
    ['Taller de Lectura y Redacción I', 'TLR1', 'coral', 4],
    ['Inglés I', 'ING1', 'indigo', 3],
    ['Informática I', 'INF1', 'cian', 3],
    ['Metodología de la Investigación', 'MET', 'pizarra', 3],
    ['Ética y Valores I', 'ETI1', 'violeta', 3],
  ],
  3: [
    ['Matemáticas III', 'MAT3', 'azul', 5],
    ['Física I', 'FIS1', 'cian', 4],
    ['Biología I', 'BIO1', 'verde', 4],
    ['Historia de México I', 'HMX1', 'ambar', 3],
    ['Inglés III', 'ING3', 'indigo', 3],
    ['Literatura I', 'LIT1', 'rosa', 3],
  ],
}

function materiasDe(nivelId: NivelId, gradoId: string, plan: FilaPlan[]): Materia[] {
  return plan.map(([nombre, clave, color, horasSemana]) => ({
    id: `m-${gradoId}-${clave.toLowerCase()}`,
    nombre,
    clave: `${clave}-${gradoId.split('-')[1]}`,
    nivelId,
    gradoId,
    color,
    horasSemana,
  }))
}

export const materias: Materia[] = [
  ...[4, 5, 6].flatMap((n) => materiasDe('primaria', `pri-${n}`, planPrimaria)),
  ...[1, 2, 3].flatMap((n) => materiasDe('secundaria', `sec-${n}`, planSecundaria[n])),
  ...[1, 3].flatMap((n) => materiasDe('preparatoria', `pre-${n}`, planPreparatoria[n])),
]

export const periodos: PeriodoEvaluacion[] = [
  ...(['primaria', 'secundaria'] as const).flatMap((nivelId) => [
    { id: `p-${nivelId}-1`, cicloId: CICLO_ACTUAL_ID, nivelId, nombre: 'Trimestre 1', orden: 1, inicio: '2026-08-24', fin: '2026-11-27' },
    { id: `p-${nivelId}-2`, cicloId: CICLO_ACTUAL_ID, nivelId, nombre: 'Trimestre 2', orden: 2, inicio: '2026-11-30', fin: '2027-03-12' },
    { id: `p-${nivelId}-3`, cicloId: CICLO_ACTUAL_ID, nivelId, nombre: 'Trimestre 3', orden: 3, inicio: '2027-03-15', fin: '2027-07-09' },
  ]),
  { id: 'p-preparatoria-1', cicloId: CICLO_ACTUAL_ID, nivelId: 'preparatoria', nombre: 'Parcial 1', orden: 1, inicio: '2026-08-24', fin: '2026-10-02' },
  { id: 'p-preparatoria-2', cicloId: CICLO_ACTUAL_ID, nivelId: 'preparatoria', nombre: 'Parcial 2', orden: 2, inicio: '2026-10-05', fin: '2026-11-13' },
  { id: 'p-preparatoria-3', cicloId: CICLO_ACTUAL_ID, nivelId: 'preparatoria', nombre: 'Parcial 3', orden: 3, inicio: '2026-11-16', fin: '2027-01-29' },
]

export const conceptosCobro: ConceptoCobro[] = [
  { id: 'c-inscripcion', nombre: 'Inscripción', tipo: 'inscripcion', montos: { primaria: 5200, secundaria: 5800, preparatoria: 6300 } },
  { id: 'c-colegiatura', nombre: 'Colegiatura', tipo: 'colegiatura', montos: { primaria: 3850, secundaria: 4400, preparatoria: 4950 } },
  { id: 'c-materiales', nombre: 'Cuota de materiales', tipo: 'cuota', montos: { primaria: 1450, secundaria: 1650, preparatoria: 1800 } },
]

export const configuracionCobro: ConfiguracionCobro = {
  periodicidad: 'mensual',
  numeroPagos: 10,
  diaVencimiento: 10,
  recargoPorcentaje: 5,
}
