import { ArrowLeftRight, Mail, Phone, Receipt } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { PageHeader } from '@/components/shared/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BoletaSkeleton, BoletaVista } from '@/features/calificaciones/components/boleta-vista'
import { useBoleta } from '@/features/calificaciones/hooks'
import { ConfirmarPagoDialog, type CargoAConfirmar } from '@/features/pagos/components/confirmar-pago-dialog'
import { EstadoCuentaSkeleton, EstadoCuentaVista } from '@/features/pagos/components/estado-cuenta-vista'
import { useEstadoCuenta } from '@/features/pagos/hooks'
import { useTitulo } from '@/hooks/use-titulo'
import { diasHasta, fecha, iniciales, nombreCompleto } from '@/lib/format'
import { CambiarGrupoDialog } from '../components/cambiar-grupo-dialog'
import { useExpediente } from '../hooks'

const pestanas = ['datos', 'tutores', 'calificaciones', 'pagos'] as const

export default function ControlExpedientePage() {
  const { alumnoId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const consulta = useExpediente(alumnoId)
  const boleta = useBoleta(alumnoId)
  const cuenta = useEstadoCuenta(alumnoId)
  const [cambiarGrupo, setCambiarGrupo] = useState(false)
  const [cargo, setCargo] = useState<CargoAConfirmar | null>(null)
  useTitulo(consulta.data ? `Expediente · ${nombreCompleto(consulta.data.alumno)}` : 'Expediente')
  const pestana = pestanas.find((p) => p === params.get('pestana')) ?? 'datos'

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-6">
          <Skeleton className="h-20 w-2/3" />
          <Skeleton className="h-11" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      }
    >
      {({ alumno, grupo, tutores, hermanos }) => {
        const nombre = nombreCompleto(alumno)
        const edad = Math.floor(-diasHasta(alumno.fechaNacimiento) / 365.25)
        const vencido = cuenta.data?.resumen.vencido ?? 0
        return (
          <>
            <PageHeader
              regresar={{ to: '/control/alumnos', etiqueta: 'Alumnos' }}
              adorno={
                <Avatar className="size-14" aria-hidden="true">
                  <AvatarFallback className="bg-primary/12 text-base text-primary">{iniciales(`${alumno.nombre} ${alumno.apellidoPaterno}`)}</AvatarFallback>
                </Avatar>
              }
              titulo={nombre}
              descripcion={
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  Matrícula {alumno.matricula} · {grupo.nombre} · {grupo.nivel}
                  <Badge variant={alumno.estatus === 'activo' ? 'success' : 'neutral'}>{alumno.estatus === 'activo' ? 'Activo' : 'Baja'}</Badge>
                  {vencido > 0 && <Badge variant="danger">Con adeudo vencido</Badge>}
                </span>
              }
              acciones={
                <Button variant="outline" onClick={() => setCambiarGrupo(true)}>
                  <ArrowLeftRight aria-hidden="true" />
                  Cambiar de grupo
                </Button>
              }
            />
            <Tabs value={pestana} onValueChange={(v) => setParams({ pestana: v }, { replace: true })}>
              <TabsList aria-label="Secciones del expediente">
                <TabsTrigger value="datos">Datos generales</TabsTrigger>
                <TabsTrigger value="tutores">Tutores</TabsTrigger>
                <TabsTrigger value="calificaciones">Calificaciones</TabsTrigger>
                <TabsTrigger value="pagos">Pagos</TabsTrigger>
              </TabsList>

              <TabsContent value="datos">
                <dl className="grid gap-x-8 gap-y-5 rounded-xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ['CURP (ficticia)', alumno.curp],
                    ['Fecha de nacimiento', `${fecha(alumno.fechaNacimiento)} · ${edad} años`],
                    ['Sexo', alumno.sexo === 'M' ? 'Mujer' : 'Hombre'],
                    ['Grupo', `${grupo.nombre} · ${grupo.grado}`],
                    ['Fecha de inscripción', fecha(alumno.fechaInscripcion)],
                    ['Beca', alumno.beca > 0 ? `${alumno.beca} % en colegiatura` : 'Sin beca'],
                    ['Correo institucional', alumno.correo],
                    ['Teléfono', alumno.telefono],
                    ['Domicilio', alumno.domicilio],
                  ].map(([t, v]) => (
                    <div key={t}>
                      <dt className="text-sm text-muted-foreground">{t}</dt>
                      <dd className="mt-1 font-medium break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>

              <TabsContent value="tutores" className="grid gap-4">
                <ul className="grid gap-4 md:grid-cols-2">
                  {tutores.map((t) => (
                    <li key={t.id} className="rounded-xl border bg-card p-5">
                      <p className="text-sm text-muted-foreground">{t.parentesco}</p>
                      <p className="mt-0.5 text-lg font-semibold">{nombreCompleto(t)}</p>
                      <p className="text-sm text-muted-foreground">{t.ocupacion}</p>
                      <div className="mt-4 grid gap-2 text-sm">
                        <a href={`mailto:${t.correo}`} className="flex items-center gap-2 text-primary hover:underline">
                          <Mail className="size-4" aria-hidden="true" />
                          {t.correo}
                        </a>
                        <a href={`tel:${t.telefono.replaceAll(' ', '')}`} className="flex items-center gap-2 text-primary hover:underline">
                          <Phone className="size-4" aria-hidden="true" />
                          {t.telefono}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
                {hermanos.length > 0 && (
                  <section className="rounded-xl border bg-card p-5" aria-labelledby="titulo-hermanos">
                    <h2 id="titulo-hermanos" className="font-semibold">
                      Hermanos en la escuela
                    </h2>
                    <ul className="mt-2 grid gap-1">
                      {hermanos.map((h) => (
                        <li key={h.id}>
                          <Link to={`/control/alumnos/${h.id}`} className="text-sm text-primary hover:underline">
                            {h.nombre} · {h.grupo}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="calificaciones">
                <Consulta consulta={boleta} esqueleto={<BoletaSkeleton />}>
                  {(b) => <BoletaVista boleta={b} />}
                </Consulta>
              </TabsContent>

              <TabsContent value="pagos">
                <Consulta consulta={cuenta} esqueleto={<EstadoCuentaSkeleton />}>
                  {(c) => (
                    <EstadoCuentaVista
                      cuenta={c}
                      accion={(x) =>
                        x.estado !== 'pagado' ? (
                          <Button
                            size="sm"
                            variant={x.estado === 'vencido' ? 'default' : 'outline'}
                            onClick={() => setCargo({ id: x.id, descripcion: x.descripcion, total: x.total, fechaVencimiento: x.fechaVencimiento, alumno: nombre })}
                          >
                            <Receipt aria-hidden="true" />
                            Confirmar pago
                          </Button>
                        ) : (
                          <span className="hidden w-[8.6rem] sm:block" aria-hidden="true" />
                        )
                      }
                    />
                  )}
                </Consulta>
              </TabsContent>
            </Tabs>
            <CambiarGrupoDialog
              alumno={cambiarGrupo ? { id: alumno.id, nombre, grupoId: alumno.grupoId, nivelId: grupo.nivelId } : null}
              onCerrar={() => setCambiarGrupo(false)}
            />
            <ConfirmarPagoDialog cargo={cargo} onCerrar={() => setCargo(null)} />
          </>
        )
      }}
    </Consulta>
  )
}
