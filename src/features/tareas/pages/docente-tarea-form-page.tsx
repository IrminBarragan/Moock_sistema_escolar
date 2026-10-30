import { AlertCircle, Paperclip, X } from 'lucide-react'
import { useState, type FocusEvent, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { ArchivoIcono } from '@/components/shared/archivo-icono'
import { MateriaIcono } from '@/components/shared/materia-icono'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorState } from '@/components/shared/error-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { demoConfig } from '@/config/demo'
import { useAula } from '@/features/aulas/hooks'
import { useTitulo } from '@/hooks/use-titulo'
import { describirArchivos } from '@/lib/archivos'
import { fecha as fmtFecha, tamanoArchivo } from '@/lib/format'
import type { AulaDetalle, Tarea } from '@/types'
import { useGuardarTarea, useTarea } from '../hooks'

function sumarDias(fecha: string, dias: number) {
  const d = new Date(`${fecha}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export default function DocenteTareaFormPage() {
  const { aulaId = '', tareaId } = useParams()
  const aula = useAula(aulaId)
  const tarea = useTarea(tareaId)
  useTitulo(tareaId ? 'Editar tarea' : 'Nueva tarea')

  if (aula.isError || tarea.isError) {
    return <ErrorState error={aula.error ?? tarea.error} onReintentar={() => void (aula.isError ? aula.refetch() : tarea.refetch())} />
  }
  if (aula.isPending || (tareaId && tarea.isPending)) {
    return (
      <div className="mx-auto grid max-w-3xl gap-6" aria-busy="true">
        <Skeleton className="h-16 w-2/3" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    )
  }
  return <FormularioTarea key={tareaId ?? 'nueva'} aula={aula.data} tarea={tareaId ? (tarea.data ?? null) : null} />
}

type Campo = 'titulo' | 'temaId' | 'instrucciones' | 'fecha' | 'hora' | 'puntos'

function FormularioTarea({ aula, tarea }: { aula: AulaDetalle; tarea: Tarea | null }) {
  const navigate = useNavigate()
  const guardar = useGuardarTarea()
  const temaPorDefecto = aula.temas.find((t) => t.materiales.length > 0 && t.totalTareas < 3)?.id ?? aula.temas[0]?.id ?? ''

  const [valores, setValores] = useState({
    titulo: tarea?.titulo ?? '',
    temaId: tarea?.temaId ?? temaPorDefecto,
    instrucciones: tarea?.instrucciones ?? '',
    fecha: tarea?.fechaLimite.slice(0, 10) ?? sumarDias(demoConfig.fechaHoy, 7),
    hora: tarea?.fechaLimite.slice(11, 16) ?? '23:59',
    puntos: String(tarea?.puntos ?? 10),
    permiteEntregaTardia: tarea?.permiteEntregaTardia ?? true,
  })
  const [adjuntos, setAdjuntos] = useState(tarea?.adjuntos ?? [])
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({})
  const [enviado, setEnviado] = useState(false)

  const fechaOriginal = tarea?.fechaLimite.slice(0, 10)
  const errores: Partial<Record<Campo, string>> = {}
  if (!valores.titulo.trim()) errores.titulo = 'Escribe el título de la tarea.'
  if (!valores.temaId) errores.temaId = 'Elige el tema al que pertenece.'
  if (valores.instrucciones.trim().length < 10) errores.instrucciones = 'Escribe instrucciones claras (al menos 10 caracteres).'
  if (!valores.fecha) errores.fecha = 'Elige la fecha límite.'
  else if (valores.fecha < demoConfig.fechaHoy && valores.fecha !== fechaOriginal)
    errores.fecha = `La fecha límite no puede ser anterior a hoy (${fmtFecha(demoConfig.fechaHoy)}).`
  if (!valores.hora) errores.hora = 'Indica la hora límite.'
  const puntos = Number(valores.puntos)
  if (!Number.isInteger(puntos) || puntos < 1 || puntos > 100) errores.puntos = 'Los puntos deben ser un número entero entre 1 y 100.'

  const visible = (c: Campo) => (tocados[c] || enviado ? errores[c] : undefined)
  const listaErrores = Object.entries(errores) as [Campo, string][]

  function cambiar<K extends keyof typeof valores>(campo: K, valor: (typeof valores)[K]) {
    setValores((v) => ({ ...v, [campo]: valor }))
  }

  function salir(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setTocados((t) => ({ ...t, [e.target.name]: true }))
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviado(true)
    if (listaErrores.length > 0) {
      document.getElementById('resumen-errores')?.focus()
      return
    }
    if (guardar.isPending) return
    guardar.mutate(
      {
        id: tarea?.id,
        aulaId: aula.id,
        temaId: valores.temaId,
        titulo: valores.titulo,
        instrucciones: valores.instrucciones,
        adjuntos,
        fechaLimite: `${valores.fecha}T${valores.hora}:00-06:00`,
        puntos,
        permiteEntregaTardia: valores.permiteEntregaTardia,
      },
      {
        onSuccess: (t) => {
          toast.success(tarea ? 'Cambios guardados' : 'Tarea publicada', {
            description: tarea ? t.titulo : `${aula.grupo.nombre} ya puede ver «${t.titulo}».`,
          })
          navigate(`/docente/aulas/${aula.id}?pestana=tareas`)
        },
      },
    )
  }

  const etiquetas: Record<Campo, string> = {
    titulo: 'Título',
    temaId: 'Tema',
    instrucciones: 'Instrucciones',
    fecha: 'Fecha límite',
    hora: 'Hora límite',
    puntos: 'Puntos',
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        regresar={{ to: `/docente/aulas/${aula.id}?pestana=tareas`, etiqueta: `${aula.materia.nombre} · ${aula.grupo.nombre}` }}
        adorno={<MateriaIcono materia={aula.materia} />}
        titulo={tarea ? 'Editar tarea' : 'Nueva tarea'}
        descripcion={tarea ? 'Los cambios se reflejan de inmediato para el grupo.' : `Se publicará para los ${aula.alumnos} alumnos de ${aula.grupo.nombre}.`}
      />

      <form onSubmit={enviar} noValidate className="grid gap-6">
        {enviado && listaErrores.length > 0 && (
          <Alert variant="destructive" id="resumen-errores" tabIndex={-1}>
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Revisa {listaErrores.length === 1 ? 'un campo' : `${listaErrores.length} campos`} antes de publicar</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {listaErrores.map(([campo, mensaje]) => (
                  <li key={campo}>
                    <a href={`#tarea-${campo}`} className="underline underline-offset-2">
                      {etiquetas[campo]}
                    </a>
                    : {mensaje}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <section className="grid gap-5 rounded-xl border bg-card p-4 sm:p-6">
          <div className="grid gap-2">
            <Label htmlFor="tarea-titulo">Título</Label>
            <Input
              id="tarea-titulo"
              name="titulo"
              value={valores.titulo}
              onChange={(e) => cambiar('titulo', e.target.value)}
              onBlur={salir}
              maxLength={120}
              placeholder="Por ejemplo: Ejercicios de ecuaciones lineales"
              aria-invalid={visible('titulo') ? true : undefined}
              aria-describedby={visible('titulo') ? 'tarea-titulo-error' : undefined}
            />
            {visible('titulo') && <MensajeError id="tarea-titulo-error">{visible('titulo')}</MensajeError>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tarea-temaId">Tema</Label>
            <Select value={valores.temaId} onValueChange={(v) => cambiar('temaId', v)}>
              <SelectTrigger id="tarea-temaId" aria-invalid={visible('temaId') ? true : undefined}>
                <SelectValue placeholder="Elige un tema" />
              </SelectTrigger>
              <SelectContent>
                {aula.temas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    Unidad {t.orden} · {t.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {visible('temaId') && <MensajeError id="tarea-temaId-error">{visible('temaId')}</MensajeError>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tarea-instrucciones">Instrucciones</Label>
            <Textarea
              id="tarea-instrucciones"
              name="instrucciones"
              value={valores.instrucciones}
              onChange={(e) => cambiar('instrucciones', e.target.value)}
              onBlur={salir}
              className="min-h-40"
              maxLength={3000}
              aria-invalid={visible('instrucciones') ? true : undefined}
              aria-describedby={visible('instrucciones') ? 'tarea-instrucciones-error' : 'tarea-instrucciones-ayuda'}
            />
            {visible('instrucciones') ? (
              <MensajeError id="tarea-instrucciones-error">{visible('instrucciones')}</MensajeError>
            ) : (
              <p id="tarea-instrucciones-ayuda" className="text-xs text-muted-foreground">
                Explica qué deben hacer, cómo entregarlo y cómo se evaluará.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium" id="tarea-adjuntos-etiqueta">
              Adjuntos (opcional)
            </span>
            {adjuntos.length > 0 && (
              <ul className="grid gap-2" aria-labelledby="tarea-adjuntos-etiqueta">
                {adjuntos.map((a, i) => (
                  <li key={`${a.nombre}-${i}`} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <ArchivoIcono tipo={a.tipo} className="size-9" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.nombre}</span>
                      <span className="text-xs text-muted-foreground">{tamanoArchivo(a.tamanoKb)}</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setAdjuntos((l) => l.filter((_, j) => j !== i))}
                      aria-label={`Quitar ${a.nombre}`}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <label className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40">
              <Paperclip className="size-4" aria-hidden="true" />
              Adjuntar archivos
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const nuevos = describirArchivos(e.target.files).map((a, i) => ({ ...a, id: `nuevo-${Date.now()}-${i}` }))
                  setAdjuntos((l) => [...l, ...nuevos])
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </section>

        <section className="grid gap-5 rounded-xl border bg-card p-4 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[1fr_10rem_8rem]">
            <div className="grid content-start gap-2">
              <Label htmlFor="tarea-fecha">Fecha límite</Label>
              <Input
                id="tarea-fecha"
                name="fecha"
                type="date"
                min={demoConfig.fechaHoy}
                value={valores.fecha}
                onChange={(e) => cambiar('fecha', e.target.value)}
                onBlur={salir}
                aria-invalid={visible('fecha') ? true : undefined}
                aria-describedby={visible('fecha') ? 'tarea-fecha-error' : undefined}
              />
              {visible('fecha') && <MensajeError id="tarea-fecha-error">{visible('fecha')}</MensajeError>}
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor="tarea-hora">Hora</Label>
              <Input
                id="tarea-hora"
                name="hora"
                type="time"
                value={valores.hora}
                onChange={(e) => cambiar('hora', e.target.value)}
                onBlur={salir}
                aria-invalid={visible('hora') ? true : undefined}
              />
              {visible('hora') && <MensajeError id="tarea-hora-error">{visible('hora')}</MensajeError>}
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor="tarea-puntos">Puntos</Label>
              <Input
                id="tarea-puntos"
                name="puntos"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                value={valores.puntos}
                onChange={(e) => cambiar('puntos', e.target.value)}
                onBlur={salir}
                aria-invalid={visible('puntos') ? true : undefined}
                aria-describedby={visible('puntos') ? 'tarea-puntos-error' : undefined}
              />
            </div>
          </div>
          {visible('puntos') && <MensajeError id="tarea-puntos-error">{visible('puntos')}</MensajeError>}
          <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-4">
            <div>
              <Label htmlFor="tarea-tardia">Aceptar entregas tardías</Label>
              <p id="tarea-tardia-ayuda" className="mt-1 text-sm text-muted-foreground">
                Los alumnos podrán entregar después de la fecha límite; la entrega quedará marcada como tarde.
              </p>
            </div>
            <Switch
              id="tarea-tardia"
              checked={valores.permiteEntregaTardia}
              onCheckedChange={(v) => cambiar('permiteEntregaTardia', v)}
              aria-describedby="tarea-tardia-ayuda"
            />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardar.isPending} size="lg">
            {guardar.isPending ? 'Guardando…' : tarea ? 'Guardar cambios' : 'Publicar tarea'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function MensajeError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-sm text-danger">
      {children}
    </p>
  )
}
