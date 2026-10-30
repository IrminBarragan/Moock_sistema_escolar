import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface FiltroActivo {
  clave: string
  etiqueta: string
  onQuitar: () => void
}

/** Filtros aplicados como etiquetas que se pueden quitar una por una. */
export function FiltrosActivos({ filtros, onLimpiar }: { filtros: FiltroActivo[]; onLimpiar: () => void }) {
  if (filtros.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
      {filtros.map((f) => (
        <span key={f.clave} className="inline-flex h-8 items-center gap-1 rounded-full border bg-accent pr-1 pl-3 text-sm">
          {f.etiqueta}
          <button
            type="button"
            onClick={f.onQuitar}
            className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
            aria-label={`Quitar filtro: ${f.etiqueta}`}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </span>
      ))}
      <Button variant="link" size="sm" onClick={onLimpiar} className="h-8 px-1">
        Limpiar filtros
      </Button>
    </div>
  )
}
