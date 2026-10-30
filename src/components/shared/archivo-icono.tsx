import { File, FileImage, FileSpreadsheet, FileText, FileVideo, Presentation } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { TipoArchivo } from '@/types'

const estilos: Record<TipoArchivo, { icono: typeof File; clase: string }> = {
  pdf: { icono: FileText, clase: 'bg-danger-soft text-danger' },
  word: { icono: FileText, clase: 'bg-info-soft text-info' },
  excel: { icono: FileSpreadsheet, clase: 'bg-success-soft text-success' },
  powerpoint: { icono: Presentation, clase: 'bg-warning-soft text-warning' },
  imagen: { icono: FileImage, clase: 'bg-[color-mix(in_oklab,var(--materia-violeta)_15%,transparent)] text-[var(--materia-violeta)]' },
  video: { icono: FileVideo, clase: 'bg-[color-mix(in_oklab,var(--materia-rosa)_15%,transparent)] text-[var(--materia-rosa)]' },
  otro: { icono: File, clase: 'bg-muted text-muted-foreground' },
}

export function ArchivoIcono({ tipo, className }: { tipo: TipoArchivo; className?: string }) {
  const { icono: Icono, clase } = estilos[tipo]
  return (
    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', clase, className)} aria-hidden="true">
      <Icono className="size-5" />
    </span>
  )
}
