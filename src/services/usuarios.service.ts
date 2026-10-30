import type { ConsultaPaginada, Pagina, Rol, Usuario } from '@/types'
import { registrarEnBitacora } from './bitacora.service'
import { db, guardar, porId } from './db'
import { errorValidacion, noEncontrado, simular } from './http'
import { paginar } from './paginar'
import { obtenerSesion } from './sesion'

export interface FiltrosUsuarios extends ConsultaPaginada {
  rol?: Rol | 'todos'
  estado?: 'activos' | 'inactivos' | 'todos'
}

export function buscarUsuarios(filtros: FiltrosUsuarios): Promise<Pagina<Usuario> & { porRol: Record<Rol, number> }> {
  return simular(() => {
    const q = filtros.q?.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') ?? ''
    const porRol = { alumno: 0, padre: 0, docente: 0, control: 0, sistema: 0 }
    for (const u of db().usuarios) porRol[u.rol]++
    const orden: Record<Rol, number> = { sistema: 0, control: 1, docente: 2, padre: 3, alumno: 4 }
    const lista = db()
      .usuarios.filter(
        (u) =>
          (!filtros.rol || filtros.rol === 'todos' || u.rol === filtros.rol) &&
          (!filtros.estado || filtros.estado === 'todos' || (filtros.estado === 'activos') === u.activo) &&
          (!q || `${u.nombre} ${u.correo}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)),
      )
      .sort((a, b) => orden[a.rol] - orden[b.rol] || a.nombre.localeCompare(b.nombre, 'es'))
    return { ...paginar(lista, filtros), porRol }
  })
}

export function cambiarEstadoUsuario(id: string, activo: boolean): Promise<Usuario> {
  return simular(() => {
    const usuario = porId('usuarios', id) ?? noEncontrado('El usuario')
    if (!activo && obtenerSesion()?.usuarioId === id) errorValidacion('No puedes desactivar tu propia cuenta.')
    if (!activo && usuario.rol === 'sistema' && db().usuarios.filter((u) => u.rol === 'sistema' && u.activo).length <= 1) {
      errorValidacion('Debe quedar al menos un administrador del sistema activo.')
    }
    const actualizado = { ...usuario, activo }
    guardar('usuarios', actualizado)
    registrarEnBitacora('Usuarios', activo ? 'Activó un usuario' : 'Desactivó un usuario', `${usuario.nombre} (${usuario.correo})`)
    return actualizado
  })
}
