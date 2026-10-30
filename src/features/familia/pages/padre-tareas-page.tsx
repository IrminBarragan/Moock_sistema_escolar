import { PageHeader } from '@/components/shared/page-header'
import { ListaTareasAlumno } from '@/features/tareas/components/lista-tareas-alumno'
import { useTitulo } from '@/hooks/use-titulo'
import { useHijo } from '../hooks'

export default function PadreTareasPage() {
  const { hijo } = useHijo()
  const nombre = hijo.nombre.split(' ')[0]
  useTitulo(`Tareas de ${nombre}`)
  return (
    <>
      <PageHeader titulo={`Tareas de ${nombre}`} descripcion="Pendientes, entregadas y calificadas. Toca una tarea para ver las instrucciones y el trabajo entregado." />
      <ListaTareasAlumno key={hijo.id} alumnoId={hijo.id} rutaTarea={(id) => `/padre/tareas/${id}`} sujeto={nombre} />
    </>
  )
}
