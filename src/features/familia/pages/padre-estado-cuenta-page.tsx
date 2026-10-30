import { Consulta } from '@/components/shared/consulta'
import { PageHeader } from '@/components/shared/page-header'
import { AvisoPagos, EstadoCuentaSkeleton, EstadoCuentaVista } from '@/features/pagos/components/estado-cuenta-vista'
import { useEstadoCuenta } from '@/features/pagos/hooks'
import { useTitulo } from '@/hooks/use-titulo'
import { useHijo } from '../hooks'

export default function PadreEstadoCuentaPage() {
  const { hijo } = useHijo()
  const nombre = hijo.nombre.split(' ')[0]
  useTitulo(`Estado de cuenta de ${nombre}`)
  const consulta = useEstadoCuenta(hijo.id)
  return (
    <>
      <PageHeader
        titulo="Estado de cuenta"
        descripcion={consulta.data ? `${hijo.nombre} · Matrícula ${consulta.data.alumno.matricula} · Ciclo 2026–2027` : hijo.nombre}
      />
      <div className="grid gap-5">
        <AvisoPagos />
        <Consulta consulta={consulta} esqueleto={<EstadoCuentaSkeleton />}>
          {(cuenta) => <EstadoCuentaVista cuenta={cuenta} />}
        </Consulta>
      </div>
    </>
  )
}
