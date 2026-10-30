import { Eye } from 'lucide-react'

import { tamanoArchivo } from '@/lib/format'
import { nombreTipoArchivo } from '@/lib/archivos'
import { cn } from '@/lib/utils'
import type { Archivo } from '@/types'
import { ArchivoIcono } from './archivo-icono'

interface Props {
  archivo: Archivo
  titulo?: string
  detalle?: string
  onAbrir: () => void
  className?: string
}

/** Fila de archivo que abre la vista previa. Todo el renglón es el botón. */
export function ArchivoFila({ archivo, titulo, detalle, onAbrir, className }: Props) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/35 hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
        className,
      )}
    >
      <ArchivoIcono tipo={archivo.tipo} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{titulo ?? archivo.nombre}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {detalle ?? `${nombreTipoArchivo[archivo.tipo]} · ${tamanoArchivo(archivo.tamanoKb)}`}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary">
        <Eye className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Ver</span>
      </span>
    </button>
  )
}
