/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 * Con la misma semilla produce siempre la misma secuencia, por lo que los
 * datos ficticios son idénticos en cada carga de la demo.
 */
export function crearAleatorio(semilla: number) {
  let estado = semilla >>> 0

  function siguiente(): number {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    siguiente,
    entero(min: number, max: number): number {
      return Math.floor(siguiente() * (max - min + 1)) + min
    },
    elegir<T>(lista: readonly T[]): T {
      return lista[Math.floor(siguiente() * lista.length)]
    },
    probabilidad(p: number): boolean {
      return siguiente() < p
    },
    /** Número con distribución aproximadamente normal (Box-Muller). */
    normal(media: number, desviacion: number): number {
      const u = 1 - siguiente()
      const v = siguiente()
      return media + desviacion * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    },
    barajar<T>(lista: readonly T[]): T[] {
      const copia = [...lista]
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(siguiente() * (i + 1))
        ;[copia[i], copia[j]] = [copia[j], copia[i]]
      }
      return copia
    },
  }
}

export type Aleatorio = ReturnType<typeof crearAleatorio>
