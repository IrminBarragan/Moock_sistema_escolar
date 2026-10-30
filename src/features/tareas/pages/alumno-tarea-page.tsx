import { useParams } from 'react-router'

import { useSesionActiva } from '@/hooks/use-sesion'
import { DetalleTarea } from '../components/detalle-tarea'

export default function AlumnoTareaPage() {
  const { tareaId = '' } = useParams()
  const sesion = useSesionActiva()
  return <DetalleTarea tareaId={tareaId} alumnoId={sesion.personaId!} regresar={{ to: '/alumno/tareas', etiqueta: 'Mis tareas' }} />
}
