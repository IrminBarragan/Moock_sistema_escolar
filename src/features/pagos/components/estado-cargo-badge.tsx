import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { EstadoCargo } from '@/types'

const config = {
  pagado: { variant: 'success', icono: CheckCircle2, texto: 'Pagado' },
  pendiente: { variant: 'neutral', icono: Clock, texto: 'Pendiente' },
  vencido: { variant: 'danger', icono: AlertCircle, texto: 'Vencido' },
} as const

export function EstadoCargoBadge({ estado }: { estado: EstadoCargo }) {
  const { variant, icono: Icono, texto } = config[estado]
  return (
    <Badge variant={variant}>
      <Icono aria-hidden="true" />
      {texto}
    </Badge>
  )
}
