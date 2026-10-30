import { Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAccionesAula } from '../hooks'

export function PublicarAviso({ aulaId, grupo }: { aulaId: string; grupo: string }) {
  const { publicarAviso } = useAccionesAula(aulaId)
  const [titulo, setTitulo] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [importante, setImportante] = useState(false)
  const [intentado, setIntentado] = useState(false)

  const errores = {
    titulo: intentado && !titulo.trim() ? 'Escribe un título breve.' : null,
    cuerpo: intentado && !cuerpo.trim() ? 'Escribe el mensaje del aviso.' : null,
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    if (!titulo.trim() || !cuerpo.trim() || publicarAviso.isPending) return
    publicarAviso.mutate(
      { titulo, cuerpo, importante },
      {
        onSuccess: () => {
          toast.success('Aviso publicado', { description: `Lo verán los alumnos de ${grupo} y sus familias.` })
          setTitulo('')
          setCuerpo('')
          setImportante(false)
          setIntentado(false)
        },
      },
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-4 rounded-xl border bg-card p-4 sm:p-5" noValidate>
      <div>
        <h3 className="font-semibold">Nuevo aviso</h3>
        <p className="text-sm text-muted-foreground">Lo verán los alumnos de {grupo} y sus familias.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="aviso-titulo">Título</Label>
        <Input
          id="aviso-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={80}
          aria-invalid={errores.titulo ? true : undefined}
          aria-describedby={errores.titulo ? 'aviso-titulo-error' : undefined}
        />
        {errores.titulo && (
          <p id="aviso-titulo-error" className="text-sm text-danger">
            {errores.titulo}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="aviso-cuerpo">Mensaje</Label>
        <Textarea
          id="aviso-cuerpo"
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          maxLength={600}
          aria-invalid={errores.cuerpo ? true : undefined}
          aria-describedby={errores.cuerpo ? 'aviso-cuerpo-error' : 'aviso-cuerpo-ayuda'}
        />
        {errores.cuerpo ? (
          <p id="aviso-cuerpo-error" className="text-sm text-danger">
            {errores.cuerpo}
          </p>
        ) : (
          <p id="aviso-cuerpo-ayuda" className="text-xs text-muted-foreground">
            {cuerpo.length}/600 caracteres
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Checkbox id="aviso-importante" checked={importante} onCheckedChange={(v) => setImportante(v === true)} />
          <Label htmlFor="aviso-importante" className="font-normal">
            Marcar como importante
          </Label>
        </div>
        <Button type="submit" disabled={publicarAviso.isPending}>
          <Send aria-hidden="true" />
          {publicarAviso.isPending ? 'Publicando…' : 'Publicar aviso'}
        </Button>
      </div>
    </form>
  )
}
