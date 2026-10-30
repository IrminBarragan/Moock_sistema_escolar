import { BookOpen } from 'lucide-react'

import { Consulta } from '@/components/shared/consulta'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { useSesionActiva } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { AulaCard, AulaCardSkeleton } from '../components/aula-card'
import { useAulasAlumno } from '../hooks'

export default function AlumnoMateriasPage() {
  useTitulo('Mis materias')
  const sesion = useSesionActiva()
  const consulta = useAulasAlumno(sesion.personaId!)
  return (
    <>
      <PageHeader
        titulo="Mis materias"
        descripcion={consulta.data?.[0] ? `${consulta.data[0].grupo.nombre} · ${consulta.data[0].grupo.nivel} · ciclo 2026–2027` : 'Ciclo 2026–2027'}
      />
      <Consulta
        consulta={consulta}
        esqueleto={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <AulaCardSkeleton key={i} />
            ))}
          </div>
        }
        estaVacio={(l) => l.length === 0}
        vacio={<EmptyState icono={BookOpen} titulo="Aún no tienes materias" descripcion="Control escolar te inscribirá a tu grupo al inicio del ciclo." />}
      >
        {(aulas) => (
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {aulas.map((a) => (
              <li key={a.id} className="grid min-w-0">
                <AulaCard aula={a} to={`/alumno/materias/${a.id}`} vista="alumno" />
              </li>
            ))}
          </ul>
        )}
      </Consulta>
    </>
  )
}
