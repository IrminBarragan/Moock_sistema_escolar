import { crearAcademico } from './academico'
import { crearBitacora } from './bitacora'
import {
  ciclos,
  conceptosCobro,
  configuracionCobro,
  grados,
  grupos,
  materias,
  niveles,
  periodos,
} from './catalogos'
import { crearPagos } from './pagos'
import { crearComunidad, crearDocentes, crearUsuarios } from './personas'
import { crearAleatorio } from './random'

export { IDS_DEMO } from './personas'
export { CICLO_ACTUAL_ID } from './catalogos'

/**
 * Genera la base de datos ficticia completa. Es determinista: con la misma
 * semilla devuelve exactamente los mismos registros, así que "Reiniciar demo"
 * siempre regresa al mismo punto de partida.
 */
export function crearDatosIniciales() {
  const r = crearAleatorio(20262027)
  const docentes = crearDocentes(r)
  const comunidad = crearComunidad(r)
  const usuarios = crearUsuarios(r, docentes, comunidad)
  const academico = crearAcademico(r, comunidad.alumnos, docentes)
  const { cargos, pagos } = crearPagos(r, comunidad.alumnos)
  const bitacora = crearBitacora(r, {
    usuarios,
    docentes,
    alumnos: comunidad.alumnos,
    aulas: academico.aulas,
    materias,
    tareas: academico.tareas,
    entregas: academico.entregas,
    cargos,
    pagos,
  })

  return {
    ciclos: structuredClone(ciclos),
    niveles: structuredClone(niveles),
    grados: structuredClone(grados),
    grupos: structuredClone(grupos),
    materias: structuredClone(materias),
    periodos: structuredClone(periodos),
    conceptosCobro: structuredClone(conceptosCobro),
    configuracionCobro: [{ id: 'actual', ...configuracionCobro }],
    docentes,
    alumnos: comunidad.alumnos,
    tutores: comunidad.tutores,
    usuarios,
    ...academico,
    cargos,
    pagos,
    bitacora,
  }
}

export type BaseDatos = ReturnType<typeof crearDatosIniciales>
