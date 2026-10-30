import { useParams } from 'react-router'

import { DetalleTarea } from '@/features/tareas/components/detalle-tarea'
import { useHijo } from '../hooks'

export default function PadreTareaPage() {
  const { tareaId = '' } = useParams()
  const { hijo } = useHijo()
  return (
    <DetalleTarea
      tareaId={tareaId}
      alumnoId={hijo.id}
      soloLectura
      nombreAlumno={hijo.nombre.split(' ')[0]}
      regresar={{ to: '/padre/tareas', etiqueta: `Tareas de ${hijo.nombre.split(' ')[0]}` }}
    />
  )
}
