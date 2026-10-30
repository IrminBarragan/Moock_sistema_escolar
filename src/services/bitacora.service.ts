import { ahoraDemoISO } from '@/config/demo'
import type { ConsultaPaginada, EntradaBitacora, ModuloBitacora, Pagina, Rol } from '@/types'
import { db, guardar, nuevoId } from './db'
import { simular } from './http'
import { paginar } from './paginar'
import { actorActual } from './sesion'

/** Registra una acción en la bitácora con el usuario de la sesión actual. */
export function registrarEnBitacora(modulo: ModuloBitacora, accion: string, detalle: string) {
  const actor = actorActual()
  guardar('bitacora', {
    id: nuevoId('bit'),
    fecha: ahoraDemoISO(),
    usuario: actor.nombre,
    rol: actor.rol,
    modulo,
    accion,
    detalle,
  })
}

export interface FiltrosBitacora extends ConsultaPaginada {
  modulo?: ModuloBitacora | 'todos'
  rol?: Rol | 'todos'
}

export function buscarBitacora(filtros: FiltrosBitacora): Promise<Pagina<EntradaBitacora>> {
  return simular(() => {
    const q = filtros.q?.trim().toLowerCase() ?? ''
    const lista = [...db().bitacora]
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      .filter(
        (e) =>
          (!filtros.modulo || filtros.modulo === 'todos' || e.modulo === filtros.modulo) &&
          (!filtros.rol || filtros.rol === 'todos' || e.rol === filtros.rol) &&
          (!q || `${e.usuario} ${e.accion} ${e.detalle}`.toLowerCase().includes(q)),
      )
    return paginar(lista, filtros)
  })
}
