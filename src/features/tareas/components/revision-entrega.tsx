import { CheckCircle2, ChevronRight, FileX2, Hourglass } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { ArchivoFila } from '@/components/shared/archivo-fila'
import { EmptyState } from '@/components/shared/empty-state'
import { VistaPreviaArchivo, type ArchivoAPrevisualizar } from '@/components/shared/vista-previa-archivo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { calificacion, fechaHora } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FilaEntrega, Tarea } from '@/types'
import { useCalificarEntrega } from '../hooks'
import { EstadoTareaBadge } from './estado-tarea-badge'

interface Props {
  tarea: Tarea
  fila: FilaEntrega
  /** Siguiente alumno por revisar, para calificar en secuencia. */
  onSiguiente: (() => void) | null
}

const atajos = [10, 9, 8, 7, 6]

export function RevisionEntrega({ tarea, fila, onSiguiente }: Props) {
  const [vista, setVista] = useState<ArchivoAPrevisualizar | null>(null)
  const { alumno, entrega, estado } = fila
  const nombreCorto = alumno.nombre.split(' ')[0]

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3">
        <Avatar className="size-11" aria-hidden="true">
          <AvatarFallback className="text-sm">{alumno.iniciales}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{alumno.nombre}</h2>
          <EstadoTareaBadge estado={estado} vista="docente" />
        </div>
      </div>

      {!entrega ? (
        <EmptyState
          icono={FileX2}
          titulo={estado === 'vencida' ? `${nombreCorto} no entregó esta tarea` : `${nombreCorto} aún no entrega`}
          descripcion={
            estado === 'vencida'
              ? 'La fecha límite ya pasó. Si te entregó el trabajo en papel, puedes registrar su calificación en la planilla del periodo.'
              : `Tiene hasta el ${fechaHora(tarea.fechaLimite)}.`
          }
          compacto
        />
      ) : (
        <>
          <section aria-label="Entrega" className="grid gap-3 rounded-xl border bg-muted/30 p-4">
            <p className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="text-muted-foreground">Entregada el</span>
              <span className="font-medium">{fechaHora(entrega.entregadaEl)}</span>
              {estado === 'tarde' || new Date(entrega.entregadaEl) > new Date(tarea.fechaLimite) ? (
                <span className="flex items-center gap-1 text-warning">
                  <Hourglass className="size-3.5" aria-hidden="true" /> después de la fecha límite
                </span>
              ) : (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" /> a tiempo
                </span>
              )}
            </p>
            {entrega.texto && (
              <blockquote className="rounded-lg border-l-4 border-primary/40 bg-card px-4 py-3 text-[0.95rem] leading-relaxed">
                {entrega.texto}
              </blockquote>
            )}
            {entrega.archivos.length > 0 ? (
              <ul className="grid gap-2">
                {entrega.archivos.map((a) => (
                  <li key={a.id}>
                    <ArchivoFila archivo={a} onAbrir={() => setVista({ archivo: a })} />
                  </li>
                ))}
              </ul>
            ) : (
              !entrega.texto && <p className="text-sm text-muted-foreground">Sin archivos adjuntos.</p>
            )}
          </section>
          <FormularioCalificacion key={entrega.id + (entrega.calificadaEl ?? '')} fila={fila} onSiguiente={onSiguiente} />
        </>
      )}
      <VistaPreviaArchivo item={vista} onCerrar={() => setVista(null)} />
    </div>
  )
}

function FormularioCalificacion({ fila, onSiguiente }: { fila: FilaEntrega; onSiguiente: (() => void) | null }) {
  const entrega = fila.entrega!
  const calificar = useCalificarEntrega()
  const [valor, setValor] = useState(entrega.calificacion !== null ? String(entrega.calificacion) : '')
  const [comentario, setComentario] = useState(entrega.comentario)
  const [intentado, setIntentado] = useState(false)
  const numero = Number(valor.replace(',', '.'))
  const error =
    valor.trim() === ''
      ? 'Escribe la calificación.'
      : Number.isNaN(numero) || numero < 0 || numero > 10
        ? 'La calificación va de 0 a 10.'
        : Math.round(numero * 10) !== numero * 10
          ? 'Usa como máximo un decimal (por ejemplo, 8.5).'
          : null
  const errorVisible = intentado ? error : null

  function guardar(e: FormEvent, continuar: boolean) {
    e.preventDefault()
    setIntentado(true)
    if (error || calificar.isPending) return
    calificar.mutate(
      { entregaId: entrega.id, calificacion: numero, comentario },
      {
        onSuccess: () => {
          toast.success('Calificación guardada', { description: `${fila.alumno.nombre}: ${calificacion(numero)}` })
          if (continuar) onSiguiente?.()
        },
      },
    )
  }

  return (
    <form onSubmit={(e) => guardar(e, false)} className="grid gap-4 rounded-xl border bg-card p-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="calificacion">Calificación</Label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-28">
            <Input
              id="calificacion"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="pr-10 text-lg font-semibold tabular"
              aria-invalid={errorVisible ? true : undefined}
              aria-describedby={errorVisible ? 'calificacion-error' : 'calificacion-ayuda'}
              autoComplete="off"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">/10</span>
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Calificaciones rápidas">
            {atajos.map((n) => (
              <Button
                key={n}
                type="button"
                variant="outline"
                size="sm"
                className={cn('w-10 tabular', String(n) === valor && 'border-primary bg-primary/10 text-primary')}
                onClick={() => setValor(String(n))}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>
        {errorVisible ? (
          <p id="calificacion-error" className="text-sm text-danger">
            {errorVisible}
          </p>
        ) : (
          <p id="calificacion-ayuda" className="text-xs text-muted-foreground">
            Escala de 0 a 10 con un decimal.
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comentario">Comentario para el alumno (opcional)</Label>
        <Textarea
          id="comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={500}
          placeholder="¿Qué hizo bien y qué puede mejorar?"
          className="min-h-20"
        />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" variant={onSiguiente ? 'outline' : 'default'} disabled={calificar.isPending}>
          {entrega.calificacion !== null ? 'Actualizar calificación' : 'Guardar calificación'}
        </Button>
        {onSiguiente && (
          <Button type="button" disabled={calificar.isPending} onClick={(e) => guardar(e, true)}>
            Guardar y siguiente
            <ChevronRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  )
}
