import { Consulta } from '@/components/shared/consulta'
import { PageHeader } from '@/components/shared/page-header'
import { BoletaSkeleton, BoletaVista } from '@/features/calificaciones/components/boleta-vista'
import { useBoleta } from '@/features/calificaciones/hooks'
import { useTitulo } from '@/hooks/use-titulo'
import { useHijo } from '../hooks'

export default function PadreCalificacionesPage() {
  const { hijo } = useHijo()
  const nombre = hijo.nombre.split(' ')[0]
  useTitulo(`Calificaciones de ${nombre}`)
  const consulta = useBoleta(hijo.id)
  return (
    <>
      <PageHeader titulo={`Calificaciones de ${nombre}`} descripcion={`${hijo.grupo.nombre} · ${hijo.grupo.nivel} · Ciclo 2026–2027`} />
      <Consulta consulta={consulta} esqueleto={<BoletaSkeleton />}>
        {(boleta) => <BoletaVista boleta={boleta} />}
      </Consulta>
    </>
  )
}
