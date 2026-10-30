/** Catálogos y parámetros que administra el administrador del sistema. */
import { fecha, moneda } from '@/lib/format'
import type { CicloEscolar, ColorMateria, ConfiguracionCobro, Grado, Materia, Nivel, PeriodoEvaluacion } from '@/types'
import { registrarEnBitacora } from './bitacora.service'
import { hoy } from './consultas'
import { db, guardar, nuevoId, porId } from './db'
import { errorValidacion, noEncontrado, simular } from './http'
import { estadoPeriodo } from './calculos'

export interface Configuracion {
  ciclos: CicloEscolar[]
  niveles: (Nivel & { grados: (Grado & { grupos: number; materias: number })[] })[]
  materias: (Materia & { grado: string; nivel: string; grupos: number })[]
  periodos: (PeriodoEvaluacion & { estado: ReturnType<typeof estadoPeriodo> })[]
  cobro: ConfiguracionCobro
  colegiaturas: { nivel: string; monto: number }[]
}

export function obtenerConfiguracion(): Promise<Configuracion> {
  return simular(() => {
    const d = db()
    return {
      ciclos: [...d.ciclos].sort((a, b) => b.inicio.localeCompare(a.inicio)),
      niveles: [...d.niveles]
        .sort((a, b) => a.orden - b.orden)
        .map((n) => ({
          ...n,
          grados: d.grados
            .filter((g) => g.nivelId === n.id)
            .sort((a, b) => a.numero - b.numero)
            .map((g) => ({ ...g, grupos: d.grupos.filter((x) => x.gradoId === g.id).length, materias: d.materias.filter((m) => m.gradoId === g.id).length })),
        })),
      materias: d.materias.map((m) => ({
        ...m,
        grado: porId('grados', m.gradoId)?.nombre ?? '—',
        nivel: porId('niveles', m.nivelId)?.nombre ?? '—',
        grupos: d.aulas.filter((a) => a.materiaId === m.id).length,
      })),
      periodos: [...d.periodos].sort((a, b) => a.nivelId.localeCompare(b.nivelId) || a.orden - b.orden).map((p) => ({ ...p, estado: estadoPeriodo(p, hoy()) })),
      cobro: d.configuracionCobro[0],
      colegiaturas: d.niveles.map((n) => ({ nivel: n.nombre, monto: d.conceptosCobro.find((c) => c.tipo === 'colegiatura')!.montos[n.id] })),
    }
  })
}

export function crearCiclo(datos: { nombre: string; inicio: string; fin: string }): Promise<CicloEscolar> {
  return simular(() => {
    if (!datos.nombre.trim()) errorValidacion('Escribe el nombre del ciclo, por ejemplo 2027–2028.')
    if (!datos.inicio || !datos.fin || datos.inicio >= datos.fin) errorValidacion('La fecha de inicio debe ser anterior a la de fin.')
    if (db().ciclos.some((c) => c.nombre === datos.nombre.trim())) errorValidacion(`Ya existe el ciclo ${datos.nombre.trim()}.`)
    const ciclo: CicloEscolar = { id: nuevoId('ciclo'), nombre: datos.nombre.trim(), inicio: datos.inicio, fin: datos.fin, activo: false }
    guardar('ciclos', ciclo)
    registrarEnBitacora('Configuración', 'Creó un ciclo escolar', `${ciclo.nombre} (${fecha(ciclo.inicio)} – ${fecha(ciclo.fin)})`)
    return ciclo
  })
}

export function guardarMateria(datos: { nombre: string; clave: string; gradoId: string; horasSemana: number; color: ColorMateria }): Promise<Materia> {
  return simular(() => {
    const grado = porId('grados', datos.gradoId) ?? noEncontrado('El grado')
    if (!datos.nombre.trim() || !datos.clave.trim()) errorValidacion('La materia necesita nombre y clave.')
    if (db().materias.some((m) => m.gradoId === grado.id && m.nombre.toLowerCase() === datos.nombre.trim().toLowerCase())) {
      errorValidacion(`${grado.nombre} ya tiene la materia ${datos.nombre.trim()}.`)
    }
    const materia: Materia = {
      id: nuevoId('m'),
      nombre: datos.nombre.trim(),
      clave: `${datos.clave.trim().toUpperCase()}-${grado.numero}`,
      nivelId: grado.nivelId,
      gradoId: grado.id,
      horasSemana: datos.horasSemana,
      color: datos.color,
    }
    guardar('materias', materia)
    registrarEnBitacora('Configuración', 'Creó una materia', `${materia.nombre} · ${grado.nombre}`)
    return materia
  })
}

export function guardarPeriodo(id: string, datos: { inicio: string; fin: string }): Promise<void> {
  return simular(() => {
    const periodo = porId('periodos', id) ?? noEncontrado('El periodo')
    if (!datos.inicio || !datos.fin || datos.inicio >= datos.fin) errorValidacion('La fecha de inicio debe ser anterior a la de cierre.')
    const traslape = db().periodos.find(
      (p) => p.nivelId === periodo.nivelId && p.id !== id && datos.inicio <= p.fin && datos.fin >= p.inicio,
    )
    if (traslape) errorValidacion(`Las fechas se cruzan con ${traslape.nombre} (${fecha(traslape.inicio)} – ${fecha(traslape.fin)}).`)
    guardar('periodos', { ...periodo, ...datos })
    registrarEnBitacora(
      'Configuración',
      'Actualizó un periodo de evaluación',
      `${periodo.nombre} (${porId('niveles', periodo.nivelId)!.nombre}): ${fecha(datos.inicio)} – ${fecha(datos.fin)}`,
    )
  })
}

export const pagosPorPeriodicidad: Record<Exclude<ConfiguracionCobro['periodicidad'], 'personalizada'>, number> = {
  mensual: 10,
  bimestral: 5,
  trimestral: 3,
  semestral: 2,
  anual: 1,
}

export function guardarCobro(cobro: ConfiguracionCobro): Promise<void> {
  return simular(() => {
    if (cobro.numeroPagos < 1 || cobro.numeroPagos > 12) errorValidacion('El número de pagos debe estar entre 1 y 12.')
    if (cobro.diaVencimiento < 1 || cobro.diaVencimiento > 28) errorValidacion('El día de vencimiento debe estar entre 1 y 28.')
    if (cobro.recargoPorcentaje < 0 || cobro.recargoPorcentaje > 20) errorValidacion('El recargo debe estar entre 0 % y 20 %.')
    guardar('configuracionCobro', { id: 'actual', ...cobro })
    const primaria = db().conceptosCobro.find((c) => c.tipo === 'colegiatura')!.montos.primaria * 10
    registrarEnBitacora(
      'Configuración',
      'Cambió la periodicidad de cobro',
      `${cobro.periodicidad} · ${cobro.numeroPagos} pagos · día ${cobro.diaVencimiento} · recargo ${cobro.recargoPorcentaje} % (primaria: ${moneda(primaria / cobro.numeroPagos)} por pago)`,
    )
  })
}
