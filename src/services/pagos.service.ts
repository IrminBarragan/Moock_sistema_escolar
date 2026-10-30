import { ahoraDemoISO } from '@/config/demo'
import { moneda, nombreCompleto } from '@/lib/format'
import type { Cargo, CargoVista, ConsultaPaginada, EstadoCargo, EstadoCuenta, MetodoPago, NivelId, Pagina, Pago } from '@/types'
import { registrarEnBitacora } from './bitacora.service'
import { estadoCargo, totalCargo } from './calculos'
import { grupoVista, hoy, personaVista } from './consultas'
import { db, guardar, nuevoId, porId } from './db'
import { errorValidacion, noEncontrado, simular } from './http'
import { paginar } from './paginar'
import { obtenerSesion } from './sesion'

export function cargoVista(c: Cargo): CargoVista {
  return {
    ...c,
    estado: estadoCargo(c, hoy()),
    total: totalCargo(c),
    pago: c.pagoId ? (porId('pagos', c.pagoId) ?? null) : null,
    concepto: porId('conceptosCobro', c.conceptoId)?.nombre ?? 'Cargo',
  }
}

export function estadoCuentaSinRetraso(alumnoId: string): EstadoCuenta {
  const alumno = porId('alumnos', alumnoId) ?? noEncontrado('El alumno')
  const cargos = db()
    .cargos.filter((c) => c.alumnoId === alumnoId)
    .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento))
    .map(cargoVista)
  const suma = (estado: EstadoCargo) => cargos.filter((c) => c.estado === estado).reduce((s, c) => s + c.total, 0)
  return {
    alumno: { ...personaVista(alumno), matricula: alumno.matricula, beca: alumno.beca },
    grupo: grupoVista(alumno.grupoId),
    cargos,
    resumen: {
      pagado: suma('pagado'),
      pendiente: suma('pendiente'),
      vencido: suma('vencido'),
      proximo: cargos.find((c) => c.estado === 'pendiente') ?? null,
    },
  }
}

export function obtenerEstadoCuenta(alumnoId: string): Promise<EstadoCuenta> {
  return simular(() => estadoCuentaSinRetraso(alumnoId))
}

export interface FilaCargo extends CargoVista {
  alumno: { id: string; nombre: string; matricula: string }
  grupo: string
  nivelId: NivelId
}

export interface FiltrosCargos extends ConsultaPaginada {
  estado?: EstadoCargo | 'todos'
  nivelId?: NivelId | 'todos'
  /** 'aaaa-mm' del vencimiento, o 'todos'. */
  mes?: string
}

export function buscarCargos(filtros: FiltrosCargos): Promise<Pagina<FilaCargo> & { totales: Record<EstadoCargo, number> }> {
  return simular(() => {
    const q = filtros.q?.trim().toLowerCase() ?? ''
    const alumnos = new Map(db().alumnos.map((a) => [a.id, a]))
    const grupos = new Map(db().grupos.map((g) => [g.id, g]))
    const filas: FilaCargo[] = []
    for (const c of db().cargos) {
      if (filtros.mes && filtros.mes !== 'todos' && !c.fechaVencimiento.startsWith(filtros.mes)) continue
      const a = alumnos.get(c.alumnoId)
      if (!a) continue
      const g = grupos.get(a.grupoId)!
      if (filtros.nivelId && filtros.nivelId !== 'todos' && g.nivelId !== filtros.nivelId) continue
      const nombre = nombreCompleto(a)
      if (q && !`${nombre} ${a.matricula}`.toLowerCase().includes(q)) continue
      filas.push({ ...cargoVista(c), alumno: { id: a.id, nombre, matricula: a.matricula }, grupo: g.nombre, nivelId: g.nivelId })
    }
    const totales = { pendiente: 0, pagado: 0, vencido: 0 }
    for (const f of filas) totales[f.estado]++
    const visibles = filas
      .filter((f) => !filtros.estado || filtros.estado === 'todos' || f.estado === filtros.estado)
      // Primero lo vencido y lo más antiguo: es lo que control escolar atiende antes.
      .sort((a, b) => (a.estado === 'vencido' ? 0 : 1) - (b.estado === 'vencido' ? 0 : 1) || a.fechaVencimiento.localeCompare(b.fechaVencimiento) || a.alumno.nombre.localeCompare(b.alumno.nombre))
    return { ...paginar(visibles, filtros), totales }
  })
}

export interface DatosPago {
  metodo: MetodoPago
  referencia: string
  fechaPago: string
}

export const nombreMetodo: Record<MetodoPago, string> = {
  transferencia: 'Transferencia (SPEI)',
  deposito: 'Depósito bancario',
  efectivo: 'Efectivo en caja',
  tarjeta: 'Tarjeta en terminal',
}

export function confirmarPago(cargoId: string, datos: DatosPago): Promise<Pago> {
  return simular(() => {
    const cargo = porId('cargos', cargoId) ?? noEncontrado('El cargo')
    if (cargo.pagoId) errorValidacion('Este cargo ya tiene un pago confirmado.')
    if (!datos.referencia.trim()) errorValidacion('Captura la referencia o folio del pago.')
    if (datos.fechaPago > hoy()) errorValidacion('La fecha de pago no puede ser posterior a hoy.')
    const pago: Pago = {
      id: nuevoId('pag'),
      cargoId,
      monto: totalCargo(cargo),
      metodo: datos.metodo,
      referencia: datos.referencia.trim(),
      fechaPago: datos.fechaPago,
      confirmadoPor: obtenerSesion()?.nombre ?? 'Control escolar',
      confirmadoEl: ahoraDemoISO(),
    }
    guardar('pagos', pago)
    guardar('cargos', { ...cargo, pagoId: pago.id })
    const alumno = porId('alumnos', cargo.alumnoId)!
    registrarEnBitacora('Pagos', 'Confirmó un pago', `${cargo.descripcion} · ${nombreCompleto(alumno)} · ${moneda(pago.monto)} · ${pago.referencia}`)
    return pago
  })
}
