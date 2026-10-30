/**
 * Almacén en memoria que hace las veces de base de datos de la demo.
 *
 * Los datos iniciales se generan de forma determinista; en localStorage solo
 * se guardan los cambios (altas, modificaciones y bajas) hechos durante la
 * sesión. Así el almacenamiento ocupa poco y "Reiniciar demo" basta con
 * borrar esos cambios.
 */
import { demoConfig } from '@/config/demo'
import { crearDatosIniciales, type BaseDatos } from '@/mocks'

export type Coleccion = keyof BaseDatos
export type RegistroDe<C extends Coleccion> = BaseDatos[C][number]

interface CambiosColeccion {
  upserts: Record<string, unknown>
  deletes: string[]
}
type Cambios = Partial<Record<Coleccion, CambiosColeccion>>

const CLAVE_CAMBIOS = `${demoConfig.claveAlmacen}:cambios`

let datos: BaseDatos | null = null
let cambios: Cambios = {}
let version = 0
const indices = new Map<Coleccion, { version: number; mapa: Map<string, unknown> }>()

function leerCambios(): Cambios {
  try {
    const crudo = localStorage.getItem(CLAVE_CAMBIOS)
    return crudo ? (JSON.parse(crudo) as Cambios) : {}
  } catch {
    return {}
  }
}

function persistir() {
  try {
    localStorage.setItem(CLAVE_CAMBIOS, JSON.stringify(cambios))
  } catch {
    // Sin almacenamiento disponible (modo privado o cuota llena): la demo sigue en memoria.
  }
}

function aplicarCambios(base: BaseDatos, delta: Cambios): BaseDatos {
  for (const nombre of Object.keys(delta) as Coleccion[]) {
    const { upserts = {}, deletes = [] } = delta[nombre] ?? {}
    const lista = base[nombre] as { id: string }[]
    const porId = new Map(lista.map((r, i) => [r.id, i]))
    for (const [id, registro] of Object.entries(upserts)) {
      const i = porId.get(id)
      if (i === undefined) lista.push(registro as { id: string })
      else lista[i] = registro as { id: string }
    }
    if (deletes.length > 0) {
      const borrar = new Set(deletes)
      ;(base as Record<Coleccion, { id: string }[]>)[nombre] = lista.filter((r) => !borrar.has(r.id))
    }
  }
  return base
}

export function db(): BaseDatos {
  if (!datos) {
    cambios = leerCambios()
    datos = aplicarCambios(crearDatosIniciales(), cambios)
  }
  return datos
}

/** Busca un registro por id usando un índice que se reconstruye solo cuando hay cambios. */
export function porId<C extends Coleccion>(coleccion: C, id: string): RegistroDe<C> | undefined {
  let indice = indices.get(coleccion)
  if (!indice || indice.version !== version) {
    const lista = db()[coleccion] as { id: string }[]
    indice = { version, mapa: new Map(lista.map((r) => [r.id, r])) }
    indices.set(coleccion, indice)
  }
  return indice.mapa.get(id) as RegistroDe<C> | undefined
}

/** Inserta o reemplaza un registro y guarda el cambio. */
export function guardar<C extends Coleccion>(coleccion: C, registro: RegistroDe<C>) {
  const lista = db()[coleccion] as { id: string }[]
  const r = registro as { id: string }
  const i = lista.findIndex((x) => x.id === r.id)
  if (i === -1) lista.push(r)
  else lista[i] = r
  const entrada: CambiosColeccion = (cambios[coleccion] ??= { upserts: {}, deletes: [] })
  entrada.upserts[r.id] = r
  entrada.deletes = entrada.deletes.filter((id) => id !== r.id)
  version++
  persistir()
}

export function eliminar(coleccion: Coleccion, id: string) {
  const base = db() as unknown as Record<Coleccion, { id: string }[]>
  base[coleccion] = base[coleccion].filter((x) => x.id !== id)
  const entrada: CambiosColeccion = (cambios[coleccion] ??= { upserts: {}, deletes: [] })
  delete entrada.upserts[id]
  entrada.deletes.push(id)
  version++
  persistir()
}

/** Regresa todos los datos a su estado inicial. */
export function reiniciarDatos() {
  cambios = {}
  try {
    localStorage.removeItem(CLAVE_CAMBIOS)
  } catch {
    // Ignorado: no hay almacenamiento disponible.
  }
  datos = crearDatosIniciales()
  version++
}

let secuencia = 0
/** Genera un id único para registros creados durante la demo. */
export function nuevoId(prefijo: string): string {
  secuencia++
  return `${prefijo}-${Date.now().toString(36)}${secuencia.toString(36)}`
}
