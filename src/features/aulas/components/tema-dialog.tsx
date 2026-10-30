import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Tema } from '@/types'
import { useAccionesAula } from '../hooks'

interface Props {
  aulaId: string
  /** Tema a editar; si es null se crea uno nuevo. */
  tema: Tema | null
  abierto: boolean
  onCambio: (v: boolean) => void
}

export function TemaDialog(props: Props) {
  return (
    <Dialog open={props.abierto} onOpenChange={props.onCambio}>
      <DialogContent>{props.abierto && <FormularioTema {...props} />}</DialogContent>
    </Dialog>
  )
}

function FormularioTema({ aulaId, tema, onCambio }: Props) {
  const acciones = useAccionesAula(aulaId)
  const [titulo, setTitulo] = useState(tema?.titulo ?? '')
  const [descripcion, setDescripcion] = useState(tema?.descripcion ?? '')
  const [intentado, setIntentado] = useState(false)
  const mutacion = tema ? acciones.editarTema : acciones.crearTema
  const errorTitulo = intentado && !titulo.trim() ? 'Escribe el título del tema.' : null

  function enviar(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    if (!titulo.trim() || mutacion.isPending) return
    const alTerminar = {
      onSuccess: () => {
        toast.success(tema ? 'Tema actualizado' : 'Tema creado', { description: titulo.trim() })
        onCambio(false)
      },
    }
    if (tema) acciones.editarTema.mutate({ temaId: tema.id, titulo, descripcion }, alTerminar)
    else acciones.crearTema.mutate({ titulo, descripcion }, alTerminar)
  }

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>{tema ? 'Editar tema' : 'Nuevo tema'}</DialogTitle>
        <DialogDescription>Los temas organizan el material y las tareas del aula por unidades.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="tema-titulo">Título</Label>
        <Input
          id="tema-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={80}
          aria-invalid={errorTitulo ? true : undefined}
          aria-describedby={errorTitulo ? 'tema-titulo-error' : undefined}
        />
        {errorTitulo && (
          <p id="tema-titulo-error" className="text-sm text-danger">
            {errorTitulo}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tema-descripcion">Descripción (opcional)</Label>
        <Textarea id="tema-descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={200} className="min-h-20" />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onCambio(false)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutacion.isPending}>
          {mutacion.isPending ? 'Guardando…' : tema ? 'Guardar cambios' : 'Crear tema'}
        </Button>
      </DialogFooter>
    </form>
  )
}
