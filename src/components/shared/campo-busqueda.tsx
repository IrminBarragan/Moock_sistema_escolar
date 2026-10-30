import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Props {
  valor: string
  onCambio: (valor: string) => void
  etiqueta: string
  placeholder?: string
  className?: string
}

export function CampoBusqueda({ valor, onCambio, etiqueta, placeholder, className }: Props) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        aria-label={etiqueta}
        placeholder={placeholder}
        className="pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <button
          type="button"
          onClick={() => onCambio('')}
          className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Borrar búsqueda"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
