/**
 * Sesión simulada. En el sistema real vendría del backend (cookie httpOnly);
 * aquí solo se recuerda qué usuario de la demo está activo.
 */
import { demoConfig } from '@/config/demo'
import { IDS_DEMO } from '@/mocks'
import { ApiError, type Rol, type Usuario } from '@/types'
import { db, porId } from './db'
import { simular } from './http'

export interface Sesion {
  usuarioId: string
  rol: Rol
  personaId: string | null
  nombre: string
  correo: string
  puesto?: string
}

const CLAVE = `${demoConfig.claveAlmacen}:sesion`

export const usuarioDemoPorRol: Record<Rol, string> = {
  alumno: `usr-${IDS_DEMO.alumno}`,
  padre: `usr-${IDS_DEMO.tutor}`,
  docente: `usr-${IDS_DEMO.docente}`,
  control: IDS_DEMO.control,
  sistema: IDS_DEMO.sistema,
}

function leer(): Sesion | null {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as Sesion) : null
  } catch {
    return null
  }
}

let actual: Sesion | null = leer()
const suscriptores = new Set<() => void>()

function establecer(sesion: Sesion | null) {
  actual = sesion
  try {
    if (sesion) localStorage.setItem(CLAVE, JSON.stringify(sesion))
    else localStorage.removeItem(CLAVE)
  } catch {
    // Sin almacenamiento: la sesión dura mientras la pestaña esté abierta.
  }
  suscriptores.forEach((fn) => fn())
}

function aSesion(u: Usuario): Sesion {
  return { usuarioId: u.id, rol: u.rol, personaId: u.personaId, nombre: u.nombre, correo: u.correo, puesto: u.puesto }
}

export function obtenerSesion(): Sesion | null {
  return actual
}

export function suscribirSesion(fn: () => void) {
  suscriptores.add(fn)
  return () => {
    suscriptores.delete(fn)
  }
}

/** Entra con el usuario de demostración del rol indicado (accesos rápidos y selector de rol). */
export function entrarComo(rol: Rol): Sesion {
  const usuario = porId('usuarios', usuarioDemoPorRol[rol])!
  const sesion = aSesion(usuario)
  establecer(sesion)
  return sesion
}

/** Inicio de sesión con correo: acepta cualquier usuario activo de la demo y cualquier contraseña. */
export function iniciarSesion(correo: string, contrasena: string): Promise<Sesion> {
  return simular(() => {
    const usuario = db().usuarios.find((u) => u.correo.toLowerCase() === correo.trim().toLowerCase())
    if (!usuario || contrasena.length === 0) {
      throw new ApiError(401, 'No pudimos iniciar sesión', 'El correo o la contraseña no son correctos.')
    }
    if (!usuario.activo) {
      throw new ApiError(403, 'Cuenta desactivada', 'Esta cuenta está desactivada. Comunícate con control escolar.')
    }
    const sesion = aSesion(usuario)
    establecer(sesion)
    return sesion
  })
}

export function cerrarSesion() {
  establecer(null)
}

/** Quién realiza la acción, para la bitácora. */
export function actorActual(): { nombre: string; rol: Rol } {
  return actual ? { nombre: actual.nombre, rol: actual.rol } : { nombre: 'Sistema', rol: 'sistema' }
}
