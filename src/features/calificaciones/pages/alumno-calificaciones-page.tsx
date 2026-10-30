import { Consulta } from '@/components/shared/consulta'
import { PageHeader } from '@/components/shared/page-header'
import { useSesionActiva } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { BoletaSkeleton, BoletaVista } from '../components/boleta-vista'
import { useBoleta } from '../hooks'

export default function AlumnoCalificacionesPage() {
  useTitulo('Mis calificaciones')
  const sesion = useSesionActiva()
  const consulta = useBoleta(sesion.personaId!)
  return (
    <>
      <PageHeader
        titulo="Mis calificaciones"
        descripcion={consulta.data ? `${consulta.data.grupo.nombre} · ${consulta.data.grupo.nivel} · Ciclo 2026–2027` : 'Ciclo 2026–2027'}
      />
      <Consulta consulta={consulta} esqueleto={<BoletaSkeleton />}>
        {(boleta) => <BoletaVista boleta={boleta} />}
      </Consulta>
    </>
  )
}
