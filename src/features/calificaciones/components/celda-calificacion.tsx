import { calificacion } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  editable: boolean
  valor: string
  onCambio: (valor: string) => void
  invalida: boolean
  modificada: boolean
  /** Marca cuando no hay calificación: NE (no entregó) o PR (por revisar). */
  marca?: 'NE' | 'PR'
  etiqueta: string
}

export function CeldaCalificacion({ editable, valor, onCambio, invalida, modificada, marca, etiqueta }: Props) {
  if (!editable) {
    return (
      <span className="tabular">
        {valor !== '' ? calificacion(Number(valor)) : <span className="text-xs text-muted-foreground">{marca ?? '—'}</span>}
      </span>
    )
  }
  return (
    <input
      inputMode="decimal"
      autoComplete="off"
      value={valor}
      placeholder={marca ?? ''}
      onChange={(e) => onCambio(e.target.value)}
      aria-label={etiqueta}
      aria-invalid={invalida || undefined}
      className={cn(
        'h-9 w-14 rounded-md border border-transparent bg-transparent text-center tabular transition-colors outline-none placeholder:text-xs placeholder:text-muted-foreground hover:border-input focus:border-ring focus:bg-card focus:ring-[3px] focus:ring-ring/30',
        modificada && 'border-primary/40 bg-primary/8 font-semibold',
        invalida && 'border-destructive bg-danger-soft text-danger',
        marca === 'NE' && !valor && 'placeholder:text-danger',
      )}
    />
  )
}

/** Calificación final con color de apoyo; el número siempre se muestra. */
export function ColorCalificacion({ valor, className }: { valor: number | null; className?: string }) {
  return (
    <span
      className={cn(
        'text-base font-semibold tabular',
        valor === null && 'font-normal text-muted-foreground',
        valor !== null && valor < 6 && 'text-danger',
        valor !== null && valor >= 6 && valor < 7 && 'text-warning',
        className,
      )}
    >
      {calificacion(valor)}
    </span>
  )
}
