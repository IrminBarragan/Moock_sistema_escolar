import { AlertCircle, CalendarClock, CheckCircle2, Hourglass, Paperclip, Send, Undo2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { ArchivoFila } from '@/components/shared/archivo-fila'
import { ArchivoIcono } from '@/components/shared/archivo-icono'
import { Consulta } from '@/components/shared/consulta'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { VistaPreviaArchivo, type ArchivoAPrevisualizar } from '@/components/shared/vista-previa-archivo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useTitulo } from '@/hooks/use-titulo'
import { describirArchivos } from '@/lib/archivos'
import { calificacion, fechaHora, plural, tamanoArchivo, vencimientoRelativo } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ArchivoNuevo, TareaAlumnoVista } from '@/types'
import { useEntregarTarea, useTareaAlumno } from '../hooks'
import { EstadoTareaBadge } from './estado-tarea-badge'

interface Props {
  tareaId: string
  alumnoId: string
  /** El padre ve la tarea en solo lectura. */
  soloLectura?: boolean
  regresar: { to: string; etiqueta: string }
  nombreAlumno?: string
}

export function DetalleTarea({ tareaId, alumnoId, soloLectura, regresar, nombreAlumno }: Props) {
  const consulta = useTareaAlumno(tareaId, alumnoId)
  const [vista, setVista] = useState<ArchivoAPrevisualizar | null>(null)
  useTitulo(consulta.data?.tarea.titulo ?? 'Tarea')

  return (
    <Consulta
      consulta={consulta}
      esqueleto={
        <div className="grid gap-6">
          <Skeleton className="h-20 w-3/4" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      }
    >
      {(item) => {
        const { tarea } = item
        return (
          <>
            <PageHeader
              regresar={regresar}
              adorno={<MateriaIcono materia={item.materia} />}
              titulo={tarea.titulo}
              descripcion={`${item.materia.nombre} · ${item.docente}`}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
              <article className="grid min-w-0 grid-cols-1 gap-5 rounded-xl border bg-card p-4 sm:p-6">
                <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">Estado</dt>
                    <dd className="mt-1">
                      <EstadoTareaBadge estado={item.estado} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Fecha límite</dt>
                    <dd className="mt-1 font-medium">{fechaHora(tarea.fechaLimite)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="mt-1 font-medium">{plural(tarea.puntos, 'punto')}</dd>
                  </div>
                </dl>
                {item.estado === 'pendiente' && (
                  <p className="flex items-center gap-2 rounded-lg bg-info-soft px-3 py-2 text-sm">
                    <CalendarClock className="size-4 text-info" aria-hidden="true" />
                    {vencimientoRelativo(tarea.fechaLimite)}
                  </p>
                )}
                <section aria-labelledby="titulo-instrucciones">
                  <h2 id="titulo-instrucciones" className="font-semibold">
                    Instrucciones
                  </h2>
                  <div className="mt-2 grid gap-3 text-[0.95rem] leading-relaxed whitespace-pre-line text-foreground/90">{tarea.instrucciones}</div>
                  <p className="mt-3 text-xs text-muted-foreground">Tema: {item.tema}</p>
                </section>
                {tarea.adjuntos.length > 0 && (
                  <section aria-labelledby="titulo-adjuntos">
                    <h2 id="titulo-adjuntos" className="mb-2 font-semibold">
                      Archivos de la tarea
                    </h2>
                    <ul className="grid gap-2">
                      {tarea.adjuntos.map((a) => (
                        <li key={a.id}>
                          <ArchivoFila archivo={a} onAbrir={() => setVista({ archivo: a })} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </article>

              <aside className="grid min-w-0 grid-cols-1 gap-4 lg:sticky lg:top-28">
                {item.estado === 'calificada' && item.entrega && <TarjetaCalificacion item={item} />}
                {soloLectura ? (
                  <EntregaLectura item={item} nombreAlumno={nombreAlumno} onAbrir={setVista} />
                ) : (
                  <PanelEntrega key={item.entrega?.id ?? 'sin-entrega'} item={item} alumnoId={alumnoId} onAbrir={setVista} />
                )}
              </aside>
            </div>
            <VistaPreviaArchivo item={vista} onCerrar={() => setVista(null)} />
          </>
        )
      }}
    </Consulta>
  )
}

function TarjetaCalificacion({ item }: { item: TareaAlumnoVista }) {
  const e = item.entrega!
  return (
    <section aria-labelledby="titulo-calificacion" className="rounded-xl border border-success/25 bg-success-soft/60 p-5">
      <h2 id="titulo-calificacion" className="text-sm font-medium text-muted-foreground">
        Calificación
      </h2>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tabular">{calificacion(e.calificacion)}</span>
        <span className="text-muted-foreground">/ 10</span>
      </p>
      {e.comentario ? (
        <figure className="mt-4 rounded-lg bg-card p-3.5">
          <blockquote className="text-[0.95rem] leading-relaxed">“{e.comentario}”</blockquote>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            {item.docente}
            {e.calificadaEl && ` · ${fechaHora(e.calificadaEl)}`}
          </figcaption>
        </figure>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Calificada sin comentarios.</p>
      )}
    </section>
  )
}

function ResumenEntrega({ item, onAbrir }: { item: TareaAlumnoVista; onAbrir: (a: ArchivoAPrevisualizar) => void }) {
  const e = item.entrega!
  const tarde = new Date(e.entregadaEl) > new Date(item.tarea.fechaLimite)
  return (
    <div className="grid gap-3">
      <p className="flex flex-wrap items-center gap-x-2 text-sm">
        {tarde ? <Hourglass className="size-4 text-warning" aria-hidden="true" /> : <CheckCircle2 className="size-4 text-success" aria-hidden="true" />}
        <span>
          Entregada el <span className="font-medium">{fechaHora(e.entregadaEl)}</span>
          {tarde ? ' (después de la fecha límite)' : ''}
        </span>
      </p>
      {e.texto && <blockquote className="rounded-lg border-l-4 border-primary/40 bg-muted/50 px-4 py-3 text-[0.95rem]">{e.texto}</blockquote>}
      {e.archivos.length > 0 && (
        <ul className="grid gap-2">
          {e.archivos.map((a) => (
            <li key={a.id}>
              <ArchivoFila archivo={a} onAbrir={() => onAbrir({ archivo: a })} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EntregaLectura({ item, nombreAlumno, onAbrir }: { item: TareaAlumnoVista; nombreAlumno?: string; onAbrir: (a: ArchivoAPrevisualizar) => void }) {
  return (
    <section aria-labelledby="titulo-entrega" className="grid gap-3 rounded-xl border bg-card p-5">
      <h2 id="titulo-entrega" className="font-semibold">
        Trabajo entregado
      </h2>
      {item.entrega ? (
        <ResumenEntrega item={item} onAbrir={onAbrir} />
      ) : (
        <p className="text-sm text-muted-foreground">
          {item.estado === 'vencida'
            ? `${nombreAlumno ?? 'El alumno'} no entregó esta tarea.`
            : `${nombreAlumno ?? 'El alumno'} todavía no entrega esta tarea. ${vencimientoRelativo(item.tarea.fechaLimite)}.`}
        </p>
      )}
    </section>
  )
}

function PanelEntrega({ item, alumnoId, onAbrir }: { item: TareaAlumnoVista; alumnoId: string; onAbrir: (a: ArchivoAPrevisualizar) => void }) {
  const { entregar, anular } = useEntregarTarea(item.tarea.id, alumnoId)
  const [texto, setTexto] = useState('')
  const [archivos, setArchivos] = useState<ArchivoNuevo[]>([])
  const [intentado, setIntentado] = useState(false)
  const [confirmarAnular, setConfirmarAnular] = useState(false)

  const vencidaSinTardia = item.estado === 'vencida' && !item.tarea.permiteEntregaTardia
  const error = intentado && !texto.trim() && archivos.length === 0 ? 'Adjunta al menos un archivo o escribe tu respuesta.' : null

  function enviar(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    if ((!texto.trim() && archivos.length === 0) || entregar.isPending) return
    entregar.mutate(
      { texto, archivos },
      { onSuccess: () => toast.success('¡Tarea entregada!', { description: `Tu docente ya puede ver «${item.tarea.titulo}».` }) },
    )
  }

  if (item.entrega) {
    return (
      <section aria-labelledby="titulo-tu-entrega" className="grid gap-4 rounded-xl border bg-card p-5">
        <h2 id="titulo-tu-entrega" className="font-semibold">
          Tu entrega
        </h2>
        <ResumenEntrega item={item} onAbrir={onAbrir} />
        {item.estado !== 'calificada' && (
          <>
            <p className="text-sm text-muted-foreground">Tu docente aún no la califica. Si te equivocaste de archivo, puedes anularla y volver a entregar.</p>
            <Button variant="outline" onClick={() => setConfirmarAnular(true)} disabled={anular.isPending}>
              <Undo2 aria-hidden="true" />
              Anular entrega
            </Button>
            <AlertDialog open={confirmarAnular} onOpenChange={setConfirmarAnular}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Anular tu entrega?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se quitarán tus archivos de «{item.tarea.titulo}». Tendrás que volver a entregar antes de la fecha límite ({fechaHora(item.tarea.fechaLimite)}).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Conservar entrega</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => anular.mutate(undefined, { onSuccess: () => toast.success('Entrega anulada', { description: 'Ya puedes volver a entregar.' }) })}
                  >
                    Anular entrega
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </section>
    )
  }

  if (vencidaSinTardia) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>La fecha límite ya pasó</AlertTitle>
        <AlertDescription>Tu docente no acepta entregas tardías en esta tarea. Si tuviste un problema, coméntaselo en clase.</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={enviar} noValidate aria-labelledby="titulo-entregar" className="grid gap-4 rounded-xl border bg-card p-5">
      <div>
        <h2 id="titulo-entregar" className="font-semibold">
          Entregar tarea
        </h2>
        {item.estado === 'vencida' && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-warning">
            <Hourglass className="size-4" aria-hidden="true" />
            Se registrará como entrega tardía.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium" id="etiqueta-archivos">
          Archivos
        </span>
        {archivos.length > 0 && (
          <ul className="grid gap-2" aria-labelledby="etiqueta-archivos">
            {archivos.map((a, i) => (
              <li key={`${a.nombre}-${i}`} className="flex items-center gap-3 rounded-lg border p-2.5">
                <ArchivoIcono tipo={a.tipo} className="size-9" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{a.nombre}</span>
                  <span className="text-xs text-muted-foreground">{tamanoArchivo(a.tamanoKb)}</span>
                </span>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => setArchivos((l) => l.filter((_, j) => j !== i))} aria-label={`Quitar ${a.nombre}`}>
                  <X aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <label
          className={cn(
            'flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent/50 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40',
            error && 'border-destructive',
          )}
        >
          <Paperclip className="size-4" aria-hidden="true" />
          {archivos.length > 0 ? 'Agregar otro archivo' : 'Adjuntar archivo o foto'}
          <input
            type="file"
            multiple
            className="sr-only"
            aria-describedby={error ? 'entrega-error' : undefined}
            onChange={(e) => {
              const nuevos = describirArchivos(e.target.files)
              setArchivos((l) => [...l, ...nuevos])
              e.target.value = ''
            }}
          />
        </label>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="entrega-texto">Respuesta o comentario (opcional)</Label>
        <Textarea
          id="entrega-texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={2000}
          placeholder="Escribe tu respuesta o un comentario para tu docente"
          aria-describedby={error ? 'entrega-error' : undefined}
        />
      </div>

      {error && (
        <p id="entrega-error" className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={entregar.isPending}>
        <Send aria-hidden="true" />
        {entregar.isPending ? 'Entregando…' : 'Entregar tarea'}
      </Button>
    </form>
  )
}
