import { AlertTriangle, Lock, Save, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'

import { Consulta } from '@/components/shared/consulta'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTitulo } from '@/hooks/use-titulo'
import { calificacion, fecha } from '@/lib/format'
import { cn } from '@/lib/utils'
import { calificacionPeriodo, PONDERACION, promedio, redondear1 } from '@/services/calculos'
import type { CambioPlanilla, FilaPlanilla, PlanillaPeriodo } from '@/types'
import { CeldaCalificacion, ColorCalificacion } from '../components/celda-calificacion'
import { useGuardarPlanilla, usePlanilla } from '../hooks'

export default function DocenteCalificacionesPage() {
  const { aulaId = '' } = useParams()
  const [periodoId, setPeriodoId] = useState<string | undefined>()
  const consulta = usePlanilla(aulaId, periodoId)
  useTitulo(consulta.data ? `Calificaciones · ${consulta.data.aula.materia.nombre} ${consulta.data.aula.grupo.nombre}` : 'Calificaciones')

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-6">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-10 w-full max-w-lg" />
          <Skeleton className="h-[30rem] rounded-xl" />
        </div>
      }
    >
      {(planilla) => (
        <Planilla
          key={`${planilla.aula.id}-${planilla.periodo.id}`}
          planilla={planilla}
          cargando={consulta.isFetching && consulta.isPlaceholderData}
          onPeriodo={setPeriodoId}
        />
      )}
    </Consulta>
  )
}

/** Clave de una celda editable. */
const clave = (alumnoId: string, campo: CambioPlanilla['campo'], tareaId = '') => `${alumnoId}|${campo}|${tareaId}`

function aNumero(texto: string): number | null {
  return texto.trim() === '' ? null : Number(texto.replace(',', '.'))
}

/** Las calificaciones se muestran siempre con un decimal (8.0, 9.5). */
function aTexto(valor: number | null): string {
  return valor === null ? '' : valor.toFixed(1)
}

function esValida(texto: string) {
  const n = aNumero(texto)
  return n === null || (!Number.isNaN(n) && n >= 0 && n <= 10 && Math.round(n * 10) === n * 10)
}

function Planilla({ planilla, cargando, onPeriodo }: { planilla: PlanillaPeriodo; cargando: boolean; onPeriodo: (id: string) => void }) {
  const { aula, periodo, tareas, filas, editable } = planilla
  const guardar = useGuardarPlanilla(aula.id)
  const [ediciones, setEdiciones] = useState<Record<string, string>>({})
  const [periodoPendiente, setPeriodoPendiente] = useState<string | null>(null)

  const original = (f: FilaPlanilla, campo: CambioPlanilla['campo'], tareaId?: string) =>
    campo === 'tarea' ? f.notas[tareaId!].valor : campo === 'examen' ? f.examen : f.participacion

  const texto = (f: FilaPlanilla, campo: CambioPlanilla['campo'], tareaId?: string) => {
    const k = clave(f.alumno.id, campo, tareaId)
    if (k in ediciones) return ediciones[k]
    return aTexto(original(f, campo, tareaId))
  }

  const cambios: CambioPlanilla[] = []
  let invalidas = 0
  for (const [k, t] of Object.entries(ediciones)) {
    const [alumnoId, campo, tareaId] = k.split('|') as [string, CambioPlanilla['campo'], string]
    const fila = filas.find((f) => f.alumno.id === alumnoId)!
    if (!esValida(t)) {
      invalidas++
      continue
    }
    const valor = aNumero(t)
    if (valor !== original(fila, campo, tareaId || undefined)) cambios.push({ alumnoId, campo, tareaId: tareaId || undefined, valor })
  }

  /** Recalcula en vivo el promedio con lo que el docente va escribiendo. */
  function calcular(f: FilaPlanilla) {
    const valores: number[] = []
    for (const t of tareas) {
      const n = aNumero(texto(f, 'tarea', t.id))
      if (n !== null && !Number.isNaN(n)) valores.push(n)
      else if (f.notas[t.id].estado === 'vencida') valores.push(0)
    }
    const promT = valores.length ? redondear1(valores.reduce((a, b) => a + b, 0) / valores.length) : null
    const num = (c: 'examen' | 'participacion') => {
      const n = aNumero(texto(f, c))
      return n === null || Number.isNaN(n) ? null : n
    }
    return { promT, final: calificacionPeriodo(promT, { examen: num('examen'), participacion: num('participacion') }) }
  }

  const calculos = filas.map(calcular)
  const promedioGrupo = promedio(calculos.map((c) => c.final))
  const enRiesgo = calculos.filter((c) => c.final !== null && c.final < 7).length

  function editar(k: string, valor: string) {
    setEdiciones((e) => ({ ...e, [k]: valor }))
  }

  function guardarCambios() {
    if (invalidas > 0 || cambios.length === 0 || guardar.isPending) return
    guardar.mutate(
      { periodoId: periodo.id, cambios },
      {
        onSuccess: ({ guardados }) => {
          toast.success('Calificaciones guardadas', { description: `${guardados} ${guardados === 1 ? 'cambio' : 'cambios'} en ${periodo.nombre}.` })
          setEdiciones({})
        },
      },
    )
  }

  function pedirPeriodo(id: string) {
    if (id === periodo.id) return
    if (cambios.length > 0 || invalidas > 0) setPeriodoPendiente(id)
    else onPeriodo(id)
  }

  const hayPendientes = cambios.length > 0 || invalidas > 0

  return (
    <>
      <PageHeader
        regresar={{ to: `/docente/aulas/${aula.id}`, etiqueta: `${aula.materia.nombre} · ${aula.grupo.nombre}` }}
        adorno={<MateriaIcono materia={aula.materia} />}
        titulo="Calificaciones del periodo"
        descripcion={`${aula.materia.nombre} · ${aula.grupo.nombre} · ${aula.grupo.nivel}`}
      />

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/50 p-1" role="group" aria-label="Periodo de evaluación">
          {planilla.periodos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pedirPeriodo(p.id)}
              aria-pressed={p.id === periodo.id}
              disabled={p.estado === 'proximo'}
              className="flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-xs"
            >
              {p.nombre}
              {p.estado === 'cerrado' && <Lock className="size-3.5" aria-label="cerrado" />}
              {p.estado === 'en-curso' && <span className="size-1.5 rounded-full bg-success" aria-label="en curso" />}
            </button>
          ))}
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-muted-foreground">Promedio del grupo</dt>
            <dd className="text-lg font-semibold tabular">{calificacion(promedioGrupo)}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-muted-foreground">Por debajo de 7.0</dt>
            <dd className={cn('text-lg font-semibold tabular', enRiesgo > 0 && 'text-danger')}>{enRiesgo}</dd>
          </div>
        </dl>
      </div>

      {!editable && (
        <Alert className="mb-4">
          <Lock aria-hidden="true" />
          <AlertDescription>
            {periodo.nombre} cerró el {fecha(periodo.fin)}. Las calificaciones son de solo lectura; para corregir una, solicítalo a control escolar.
          </AlertDescription>
        </Alert>
      )}

      <div className={cn('overflow-hidden rounded-xl border bg-card transition-opacity', cargando && 'opacity-60')}>
        <div className="max-h-[calc(100dvh-16rem)] overflow-auto">
          <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-sm">
            <caption className="sr-only">
              Calificaciones de {aula.grupo.nombre} en {aula.materia.nombre}, {periodo.nombre}
            </caption>
            <thead className="sticky top-0 z-20 bg-card">
              <tr>
                <th scope="col" className="sticky left-0 z-30 min-w-56 border-b bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Alumno
                </th>
                {tareas.map((t, i) => (
                  <th key={t.id} scope="col" className="border-b px-2 py-3 text-center text-xs font-medium text-muted-foreground" title={t.titulo}>
                    <span aria-hidden="true">T{i + 1}</span>
                    <span className="sr-only">{t.titulo}</span>
                  </th>
                ))}
                <th scope="col" className="border-b border-l px-2 py-3 text-center text-xs font-medium text-muted-foreground">
                  Prom. tareas
                </th>
                <th scope="col" className="border-b px-2 py-3 text-center text-xs font-medium text-muted-foreground">
                  Examen
                </th>
                <th scope="col" className="border-b px-2 py-3 text-center text-xs font-medium text-muted-foreground">
                  Particip.
                </th>
                <th scope="col" className="border-b border-l bg-muted/40 px-3 py-3 text-center text-xs font-semibold text-foreground">
                  Calificación
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, fi) => {
                const { promT, final } = calculos[fi]
                return (
                  <tr key={f.alumno.id} className="group">
                    <th scope="row" className="sticky left-0 z-10 border-b bg-card px-4 py-2 text-left font-medium group-hover:bg-muted/60">
                      <span className="flex items-center gap-3">
                        <span className="w-5 text-right text-xs text-muted-foreground tabular">{fi + 1}</span>
                        <span className="truncate">{f.alumno.nombreLista}</span>
                      </span>
                    </th>
                    {tareas.map((t) => {
                      const k = clave(f.alumno.id, 'tarea', t.id)
                      return (
                        <td key={t.id} className="border-b px-1.5 py-1.5 text-center group-hover:bg-muted/40">
                          <CeldaCalificacion
                            editable={editable}
                            valor={texto(f, 'tarea', t.id)}
                            onCambio={(v) => editar(k, v)}
                            invalida={!esValida(texto(f, 'tarea', t.id))}
                            modificada={k in ediciones && texto(f, 'tarea', t.id) !== aTexto(original(f, 'tarea', t.id))}
                            marca={f.notas[t.id].estado === 'vencida' ? 'NE' : f.notas[t.id].estado === 'entregada' || f.notas[t.id].estado === 'tarde' ? 'PR' : undefined}
                            etiqueta={`${t.titulo}, ${f.alumno.nombre}`}
                          />
                        </td>
                      )
                    })}
                    <td className="border-b border-l px-2 py-1.5 text-center text-muted-foreground tabular group-hover:bg-muted/40">{calificacion(promT)}</td>
                    {(['examen', 'participacion'] as const).map((campo) => {
                      const k = clave(f.alumno.id, campo)
                      return (
                        <td key={campo} className="border-b px-1.5 py-1.5 text-center group-hover:bg-muted/40">
                          <CeldaCalificacion
                            editable={editable}
                            valor={texto(f, campo)}
                            onCambio={(v) => editar(k, v)}
                            invalida={!esValida(texto(f, campo))}
                            modificada={k in ediciones && texto(f, campo) !== aTexto(original(f, campo))}
                            etiqueta={`${campo === 'examen' ? 'Examen' : 'Participación'}, ${f.alumno.nombre}`}
                          />
                        </td>
                      )
                    })}
                    <td className="border-b border-l bg-muted/40 px-3 py-1.5 text-center">
                      <ColorCalificacion valor={final} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
        <p>
          <span className="font-medium text-foreground">Ponderación:</span> tareas {PONDERACION.tareas * 100} %, examen {PONDERACION.examen * 100} % y
          participación {PONDERACION.participacion * 100} %. Si falta un componente, su peso se reparte entre los demás.
        </p>
        <p>
          <Badge variant="neutral" className="mr-1">
            NE
          </Badge>
          No entregó (cuenta como 0)
          <Badge variant="neutral" className="mr-1 ml-3">
            PR
          </Badge>
          Entregada, por revisar
        </p>
        {tareas.length > 0 && (
          <ol className="grid gap-0.5 sm:col-span-2">
            {tareas.map((t, i) => (
              <li key={t.id}>
                <span className="font-medium text-foreground">T{i + 1}</span> · {t.titulo} · límite {fecha(t.fechaLimite)}
              </li>
            ))}
          </ol>
        )}
      </div>

      {editable && hayPendientes && (
        <div className="sticky bottom-4 z-30 mt-6 flex flex-col gap-3 rounded-xl border bg-popover p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between" role="region" aria-label="Cambios sin guardar">
          <p className="flex items-center gap-2 text-sm">
            {invalidas > 0 ? (
              <>
                <AlertTriangle className="size-4 text-danger" aria-hidden="true" />
                <span>
                  {invalidas === 1 ? 'Hay una celda' : `Hay ${invalidas} celdas`} con un valor no válido (0 a 10, un decimal).
                </span>
              </>
            ) : (
              <span>
                <span className="font-semibold tabular">{cambios.length}</span> {cambios.length === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEdiciones({})} disabled={guardar.isPending}>
              <Undo2 aria-hidden="true" />
              Descartar
            </Button>
            <Button onClick={guardarCambios} disabled={invalidas > 0 || cambios.length === 0 || guardar.isPending}>
              <Save aria-hidden="true" />
              {guardar.isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={periodoPendiente !== null} onOpenChange={(v) => !v && setPeriodoPendiente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tienes cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Si cambias de periodo se perderán los cambios que hiciste en {periodo.nombre}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir editando</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => periodoPendiente && onPeriodo(periodoPendiente)}>
              Descartar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
