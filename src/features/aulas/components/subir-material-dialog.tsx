import { UploadCloud } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { ArchivoIcono } from '@/components/shared/archivo-icono'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { describirArchivos, nombreTipoArchivo } from '@/lib/archivos'
import { tamanoArchivo } from '@/lib/format'
import type { ArchivoNuevo, Tema } from '@/types'
import { useAccionesAula } from '../hooks'

interface Props {
  aulaId: string
  temas: Tema[]
  temaInicial: string | null
  abierto: boolean
  onCambio: (v: boolean) => void
}

export function SubirMaterialDialog(props: Props) {
  return (
    <Dialog open={props.abierto} onOpenChange={props.onCambio}>
      <DialogContent>{props.abierto && <FormularioMaterial {...props} />}</DialogContent>
    </Dialog>
  )
}

function FormularioMaterial({ aulaId, temas, temaInicial, onCambio }: Props) {
  const { subirMaterial } = useAccionesAula(aulaId)
  const [temaId, setTemaId] = useState(temaInicial ?? temas[0]?.id ?? '')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [archivo, setArchivo] = useState<ArchivoNuevo | null>(null)
  const [intentado, setIntentado] = useState(false)
  const [progreso, setProgreso] = useState<number | null>(null)
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => {
    if (temporizador.current) clearInterval(temporizador.current)
  }, [])

  const errores = {
    titulo: intentado && !titulo.trim() ? 'Escribe un título para el material.' : null,
    archivo: intentado && !archivo ? 'Elige el archivo que quieres compartir.' : null,
  }
  const subiendo = progreso !== null

  function elegirArchivo(lista: FileList | null) {
    const [primero] = describirArchivos(lista)
    setArchivo(primero ?? null)
    if (primero && !titulo) setTitulo(primero.nombre.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '))
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    if (!titulo.trim() || !archivo || subiendo) return
    // Subida simulada: la barra avanza y al terminar se registra el material.
    let avance = 0
    setProgreso(0)
    temporizador.current = setInterval(() => {
      avance = Math.min(100, avance + 9 + Math.round(Math.random() * 10))
      setProgreso(avance)
      if (avance < 100) return
      if (temporizador.current) clearInterval(temporizador.current)
      temporizador.current = null
      subirMaterial.mutate(
        { temaId, titulo, descripcion, archivo: archivo.tipo === 'video' ? { ...archivo, duracionSeg: 480 } : archivo },
        {
          onSuccess: () => {
            toast.success('Material publicado', { description: `${titulo.trim()} ya está visible para el grupo.` })
            onCambio(false)
          },
          onError: () => setProgreso(null),
        },
      )
    }, 160)
  }

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Subir material</DialogTitle>
        <DialogDescription>Comparte presentaciones, guías, videos o imágenes con el grupo.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="material-archivo">Archivo</Label>
        {archivo ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <ArchivoIcono tipo={archivo.tipo} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{archivo.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {nombreTipoArchivo[archivo.tipo]} · {tamanoArchivo(archivo.tamanoKb)}
              </p>
            </div>
            {!subiendo && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setArchivo(null)}>
                Cambiar
              </Button>
            )}
          </div>
        ) : (
          <label
            htmlFor="material-archivo"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-7 text-center transition-colors hover:border-primary/50 hover:bg-accent/50 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40 aria-invalid:border-destructive"
            aria-invalid={errores.archivo ? true : undefined}
          >
            <UploadCloud className="size-6 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">Elige un archivo</span>
            <span className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint, imagen o video · hasta 200 MB</span>
          </label>
        )}
        <input
          id="material-archivo"
          type="file"
          className="sr-only"
          onChange={(e) => elegirArchivo(e.target.files)}
          aria-describedby={errores.archivo ? 'material-archivo-error' : undefined}
        />
        {errores.archivo && (
          <p id="material-archivo-error" className="text-sm text-danger">
            {errores.archivo}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="material-tema">Tema</Label>
        <Select value={temaId} onValueChange={setTemaId} disabled={subiendo}>
          <SelectTrigger id="material-tema">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {temas.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                Unidad {t.orden} · {t.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="material-titulo">Título</Label>
        <Input
          id="material-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={100}
          disabled={subiendo}
          aria-invalid={errores.titulo ? true : undefined}
          aria-describedby={errores.titulo ? 'material-titulo-error' : undefined}
        />
        {errores.titulo && (
          <p id="material-titulo-error" className="text-sm text-danger">
            {errores.titulo}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="material-descripcion">Indicaciones para el grupo (opcional)</Label>
        <Textarea
          id="material-descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={300}
          disabled={subiendo}
          className="min-h-20"
        />
      </div>

      {subiendo && (
        <div className="grid gap-2" aria-live="polite">
          <div className="flex justify-between text-sm">
            <span>{progreso < 100 ? 'Subiendo archivo…' : 'Publicando…'}</span>
            <span className="font-medium tabular">{progreso} %</span>
          </div>
          <Progress value={progreso} aria-label="Progreso de la subida" />
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onCambio(false)} disabled={subiendo}>
          Cancelar
        </Button>
        <Button type="submit" disabled={subiendo}>
          {subiendo ? 'Subiendo…' : 'Subir y publicar'}
        </Button>
      </DialogFooter>
    </form>
  )
}
