import type { Alumno, Cargo, MetodoPago, Pago } from '@/types'
import { conceptosCobro, grupos } from './catalogos'
import { IDS_DEMO } from './personas'
import type { Aleatorio } from './random'

const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** Colegiaturas del ciclo: de septiembre a junio, con vencimiento el día 10. */
const calendarioColegiaturas = [
  [2026, 9], [2026, 10], [2026, 11], [2026, 12],
  [2027, 1], [2027, 2], [2027, 3], [2027, 4], [2027, 5], [2027, 6],
] as const

const HOY = '2027-01-20'
const cajeros = ['C.P. Alberto Juárez Lara', 'Lic. Patricia Navarro Cisneros', 'Leticia Ramos Méndez']

function metodo(r: Aleatorio): MetodoPago {
  const x = r.siguiente()
  if (x < 0.55) return 'transferencia'
  if (x < 0.75) return 'deposito'
  if (x < 0.9) return 'tarjeta'
  return 'efectivo'
}

function referencia(r: Aleatorio, m: MetodoPago): string {
  const n = (d: number) => String(r.entero(10 ** (d - 1), 10 ** d - 1))
  switch (m) {
    case 'transferencia':
      return `SPEI ${n(10)}`
    case 'deposito':
      return `Folio ${n(7)}`
    case 'tarjeta':
      return `Aut. ${n(6)}`
    case 'efectivo':
      return `Recibo ${n(5)}`
  }
}

function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00-06:00`)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function crearPagos(r: Aleatorio, alumnos: Alumno[]): { cargos: Cargo[]; pagos: Pago[] } {
  const cargos: Cargo[] = []
  const pagos: Pago[] = []
  const nivelDe = new Map(grupos.map((g) => [g.id, g.nivelId]))
  const [insc, colegiatura, materiales] = conceptosCobro

  for (const alumno of alumnos) {
    const nivel = nivelDe.get(alumno.grupoId)!
    const x = r.siguiente()
    const perfil = x < 0.74 ? 'puntual' : x < 0.92 ? 'atrasado' : 'moroso'
    const propios: Cargo[] = [
      { id: `car-${alumno.id}-insc`, alumnoId: alumno.id, conceptoId: insc.id, descripcion: 'Inscripción ciclo 2026–2027', monto: insc.montos[nivel], descuento: 0, fechaVencimiento: '2026-08-14', pagoId: null },
      { id: `car-${alumno.id}-mat`, alumnoId: alumno.id, conceptoId: materiales.id, descripcion: 'Cuota de materiales 2026–2027', monto: materiales.montos[nivel], descuento: 0, fechaVencimiento: '2026-09-10', pagoId: null },
      ...calendarioColegiaturas.map(([anio, mes]) => ({
        id: `car-${alumno.id}-col-${anio}-${String(mes).padStart(2, '0')}`,
        alumnoId: alumno.id,
        conceptoId: colegiatura.id,
        descripcion: `Colegiatura ${meses[mes - 1]} ${anio}`,
        monto: colegiatura.montos[nivel],
        descuento: Math.round((colegiatura.montos[nivel] * alumno.beca) / 100),
        fechaVencimiento: `${anio}-${String(mes).padStart(2, '0')}-10`,
        pagoId: null,
      })),
    ]

    for (const cargo of propios) {
      if (cargo.fechaVencimiento > HOY) continue
      const esEnero = cargo.fechaVencimiento.startsWith('2027-01')
      const esDic = cargo.fechaVencimiento.startsWith('2026-12')
      const esNov = cargo.fechaVencimiento.startsWith('2026-11')
      let pagado = true
      if (perfil === 'puntual' && esEnero) pagado = r.probabilidad(0.8)
      if (perfil === 'atrasado' && esEnero) pagado = false
      if (perfil === 'atrasado' && esDic) pagado = r.probabilidad(0.5)
      if (perfil === 'moroso' && (esEnero || esDic || esNov)) pagado = false
      if (alumno.id === IDS_DEMO.alumno) pagado = true
      if (alumno.id === IDS_DEMO.hermano) pagado = !esEnero
      if (!pagado) continue

      const tardio = perfil !== 'puntual' && r.probabilidad(0.4)
      let fechaPago = sumarDias(cargo.fechaVencimiento, tardio ? r.entero(3, 18) : -r.entero(0, 9))
      if (fechaPago > HOY) fechaPago = sumarDias(HOY, -r.entero(1, 4))
      let confirmado = sumarDias(fechaPago, r.entero(0, 2))
      if (confirmado > HOY) confirmado = HOY
      const m = metodo(r)
      const pago: Pago = {
        id: `pag-${cargo.id.slice(4)}`,
        cargoId: cargo.id,
        monto: cargo.monto - cargo.descuento,
        metodo: m,
        referencia: referencia(r, m),
        fechaPago,
        confirmadoPor: r.elegir(cajeros),
        confirmadoEl: `${confirmado}T${String(r.entero(8, 18)).padStart(2, '0')}:${String(r.entero(0, 59)).padStart(2, '0')}:00-06:00`,
      }
      cargo.pagoId = pago.id
      pagos.push(pago)
    }
    cargos.push(...propios)
  }
  return { cargos, pagos }
}
