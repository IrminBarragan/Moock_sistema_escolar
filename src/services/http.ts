/**
 * Simula la latencia y los errores de una API real. Cada servicio envuelve su
 * lógica con `simular`, de modo que las pantallas manejan promesas, estados de
 * carga y errores igual que con el backend verdadero.
 */
import { demoConfig } from '@/config/demo'
import { ApiError } from '@/types'
import { leerPreferenciaDemo } from './preferencias'

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function simular<T>(operacion: () => T): Promise<T> {
  const { retrasoMinMs, retrasoMaxMs } = demoConfig
  await esperar(retrasoMinMs + Math.random() * (retrasoMaxMs - retrasoMinMs))
  if (leerPreferenciaDemo('simularErrores')) {
    throw new ApiError(
      503,
      'Servicio no disponible',
      'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    )
  }
  // Se devuelve una copia: igual que una respuesta HTTP, no comparte referencias con el almacén.
  return structuredClone(operacion())
}

/** Error de validación que el servidor devolvería con estado 422. */
export function errorValidacion(detalle: string): never {
  throw new ApiError(422, 'Datos no válidos', detalle)
}

export function noEncontrado(recurso: string): never {
  throw new ApiError(404, 'No encontrado', `${recurso} no existe o ya no está disponible.`)
}
