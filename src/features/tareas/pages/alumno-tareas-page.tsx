import { PageHeader } from '@/components/shared/page-header'
import { useSesionActiva } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { ListaTareasAlumno } from '../components/lista-tareas-alumno'

export default function AlumnoTareasPage() {
  useTitulo('Mis tareas')
  const sesion = useSesionActiva()
  return (
    <>
      <PageHeader titulo="Mis tareas" descripcion="Todas tus tareas del ciclo, de todas tus materias." />
      <ListaTareasAlumno alumnoId={sesion.personaId!} rutaTarea={(id) => `/alumno/tareas/${id}`} />
    </>
  )
}
