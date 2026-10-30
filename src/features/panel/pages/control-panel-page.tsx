import { AlertCircle, ArrowRight, ClipboardX, Receipt, Users } from 'lucide-react'
import { Link } from 'react-router'

import { Consulta } from '@/components/shared/consulta'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSesionActiva } from '@/hooks/use-sesion'
import { useTitulo } from '@/hooks/use-titulo'
import { fecha, moneda, numero } from '@/lib/format'
import { GraficaCobranza, GraficaSinEntregar } from '../components/graficas'
import { usePanel } from '../hooks'

export default function ControlPanelPage() {
  useTitulo('Panel de control escolar')
  const sesion = useSesionActiva()
  const consulta = usePanel()

  return (
    <>
      <PageHeader
        titulo="Panel"
        descripcion={`Buenos días, ${sesion.nombre.replace(/^(Lic\.|Mtra\.|C\.P\.)\s+/, '').split(' ')[0]}. Así va el ciclo escolar 2026–2027.`}
        acciones={
          <Button asChild>
            <Link to="/control/pagos">
              <Receipt aria-hidden="true" />
              Confirmar pagos
            </Link>
          </Button>
        }
      />
      <Consulta
        consulta={consulta}
        esqueleto={
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        }
      >
        {(p) => {
          const avance = Math.round((p.mes.pagados / Math.max(1, p.mes.total)) * 100)
          return (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <section className="rounded-xl border bg-card p-5" aria-labelledby="kpi-inscritos">
                  <h2 id="kpi-inscritos" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" aria-hidden="true" /> Alumnos inscritos
                  </h2>
                  <p className="mt-2 text-4xl font-semibold tabular">{numero(p.inscritos)}</p>
                  <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {p.porNivel.map((n) => (
                      <div key={n.nivel} className="flex gap-1.5">
                        <dt className="text-muted-foreground">{n.nivel}</dt>
                        <dd className="font-medium tabular">{n.alumnos}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section className="rounded-xl border bg-card p-5" aria-labelledby="kpi-pagos">
                  <h2 id="kpi-pagos" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Receipt className="size-4" aria-hidden="true" /> Pagos pendientes de {p.mes.etiqueta}
                  </h2>
                  <p className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tabular">{numero(p.mes.sinPagar)}</span>
                    <span className="text-sm text-muted-foreground">de {numero(p.mes.total)} colegiaturas</span>
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium text-danger tabular">{moneda(p.mes.montoSinPagar)}</span>
                    <span className="text-muted-foreground"> por cobrar · vencieron el 10/01</span>
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" role="meter" aria-label="Avance de cobranza del mes" aria-valuemin={0} aria-valuemax={100} aria-valuenow={avance}>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${avance}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{avance} % cobrado · {moneda(p.mes.montoCobrado)}</p>
                </section>

                <section className="rounded-xl border bg-card p-5" aria-labelledby="kpi-tareas">
                  <h2 id="kpi-tareas" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClipboardX className="size-4" aria-hidden="true" /> Tareas sin entregar
                  </h2>
                  <p className="mt-2 text-4xl font-semibold tabular">{numero(p.totalSinEntregar)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Vencidas en el periodo en curso, sumando todos los grupos.</p>
                  <Link to="/control/reportes?reporte=tareas" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Ver detalle <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </section>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Colegiaturas de {p.mes.etiqueta}</CardTitle>
                    <CardDescription>Pagadas y sin pagar por nivel.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GraficaCobranza datos={p.cobranzaPorNivel} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Tareas sin entregar por grupo</CardTitle>
                    <CardDescription>Entregas faltantes de tareas ya vencidas en el periodo en curso.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GraficaSinEntregar datos={p.tareasSinEntregar} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Adeudos más antiguos</CardTitle>
                  <CardDescription>Familias con cargos vencidos, empezando por el más antiguo.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y">
                    {p.vencidosAntiguos.map((v) => (
                      <li key={v.alumnoId} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <Link to={`/control/alumnos/${v.alumnoId}?pestana=pagos`} className="font-medium hover:text-primary hover:underline">
                            {v.alumno}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {v.grupo} · {v.cargos} {v.cargos === 1 ? 'cargo vencido' : 'cargos vencidos'} desde el {fecha(v.desde)}
                          </p>
                        </div>
                        <span className="flex items-center gap-1.5 font-semibold text-danger tabular">
                          <AlertCircle className="size-4" aria-hidden="true" />
                          {moneda(v.monto)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )
        }}
      </Consulta>
    </>
  )
}
