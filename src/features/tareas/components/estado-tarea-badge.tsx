import { AlertCircle, CheckCircle2, Clock, Hourglass, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { EstadoTarea } from '@/types'

const textos: Record<'alumno' | 'docente', Record<EstadoTarea, string>> = {
  alumno: {
    pendiente: 'Pendiente',
    vencida: 'Vencida',
    entregada: 'Entregada',
    tarde: 'Entregada tarde',
    calificada: 'Calificada',
  },
  docente: {
    pendiente: 'Sin entregar',
    vencida: 'No entregó',
    entregada: 'Por revisar',
    tarde: 'Por revisar · tarde',
    calificada: 'Calificada',
  },
}

const variantes = {
  pendiente: { variant: 'neutral', icono: Clock },
  vencida: { variant: 'danger', icono: AlertCircle },
  entregada: { variant: 'info', icono: CheckCircle2 },
  tarde: { variant: 'warning', icono: Hourglass },
  calificada: { variant: 'success', icono: Star },
} as const

export function EstadoTareaBadge({ estado, vista = 'alumno' }: { estado: EstadoTarea; vista?: 'alumno' | 'docente' }) {
  const { variant, icono: Icono } = variantes[estado]
  return (
    <Badge variant={variant}>
      <Icono aria-hidden="true" />
      {textos[vista][estado]}
    </Badge>
  )
}
