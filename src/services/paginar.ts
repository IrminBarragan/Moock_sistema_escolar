import type { ConsultaPaginada, Pagina } from '@/types'

/** Corta una lista como lo haría Spring Data con page (base 0) y size. */
export function paginar<T>(lista: T[], { page = 0, size = 20 }: ConsultaPaginada): Pagina<T> {
  const totalPages = Math.max(1, Math.ceil(lista.length / size))
  const actual = Math.min(page, totalPages - 1)
  return {
    content: lista.slice(actual * size, actual * size + size),
    page: actual,
    size,
    totalElements: lista.length,
    totalPages,
  }
}
