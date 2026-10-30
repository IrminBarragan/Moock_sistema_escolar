import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { numero } from '@/lib/format'

interface Props {
  pagina: number
  totalPaginas: number
  totalElementos: number
  tamano: number
  onCambio: (pagina: number) => void
  sustantivo?: [string, string]
}

/** Paginación con la forma de Spring Data (página base 0). */
export function Paginacion({ pagina, totalPaginas, totalElementos, tamano, onCambio, sustantivo = ['registro', 'registros'] }: Props) {
  if (totalElementos === 0) return null
  const desde = pagina * tamano + 1
  const hasta = Math.min(totalElementos, desde + tamano - 1)
  return (
    <nav aria-label="Paginación" className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
      <p className="text-muted-foreground" aria-live="polite">
        {numero(desde)}–{numero(hasta)} de {numero(totalElementos)} {totalElementos === 1 ? sustantivo[0] : sustantivo[1]}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onCambio(pagina - 1)} disabled={pagina === 0}>
          <ChevronLeft aria-hidden="true" />
          Anterior
        </Button>
        <span className="px-2 text-muted-foreground tabular">
          {pagina + 1} / {totalPaginas}
        </span>
        <Button variant="outline" size="sm" onClick={() => onCambio(pagina + 1)} disabled={pagina >= totalPaginas - 1}>
          Siguiente
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
