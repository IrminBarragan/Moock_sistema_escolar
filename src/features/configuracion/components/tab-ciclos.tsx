import { CalendarPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fecha } from '@/lib/format'
import type { CicloEscolar } from '@/types'
import { useCrearCiclo } from '../hooks'

export function TabCiclos({ ciclos }: { ciclos: CicloEscolar[] }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <section className="grid gap-4" aria-labelledby="titulo-ciclos">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="titulo-ciclos" className="font-semibold">
            Ciclos escolares
          </h2>
          <p className="text-sm text-muted-foreground">Solo un ciclo puede estar activo. Los ciclos anteriores quedan de consulta.</p>
        </div>
        <Button onClick={() => setAbierto(true)}>
          <CalendarPlus aria-hidden="true" />
          Nuevo ciclo
        </Button>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {ciclos.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-xl border bg-card p-5">
            <div>
              <p className="text-lg font-semibold">Ciclo {c.nombre}</p>
              <p className="text-sm text-muted-foreground">
                Del {fecha(c.inicio)} al {fecha(c.fin)}
              </p>
            </div>
            {c.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="neutral">{c.inicio > '2027-01-20' ? 'En preparación' : 'Concluido'}</Badge>}
          </li>
        ))}
      </ul>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>{abierto && <FormularioCiclo onCerrar={() => setAbierto(false)} />}</DialogContent>
      </Dialog>
    </section>
  )
}

function FormularioCiclo({ onCerrar }: { onCerrar: () => void }) {
  const crear = useCrearCiclo()
  const [nombre, setNombre] = useState('2027–2028')
  const [inicio, setInicio] = useState('2027-08-23')
  const [fin, setFin] = useState('2028-07-07')
  const error = inicio && fin && inicio >= fin ? 'La fecha de inicio debe ser anterior a la de fin.' : null

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (error || crear.isPending) return
    crear.mutate(
      { nombre, inicio, fin },
      {
        onSuccess: (c) => {
          toast.success('Ciclo creado', { description: `${c.nombre} quedó en preparación. Podrás activarlo al cerrar el ciclo actual.` })
          onCerrar()
        },
      },
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Nuevo ciclo escolar</DialogTitle>
        <DialogDescription>Se crea en preparación para cargar grupos e inscripciones antes de que inicie.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="ciclo-nombre">Nombre</Label>
        <Input id="ciclo-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="ciclo-inicio">Inicio de clases</Label>
          <Input id="ciclo-inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ciclo-fin">Fin de clases</Label>
          <Input id="ciclo-fin" type="date" value={fin} onChange={(e) => setFin(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? 'ciclo-error' : undefined} />
        </div>
      </div>
      {error && (
        <p id="ciclo-error" className="text-sm text-danger">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={Boolean(error) || crear.isPending}>
          {crear.isPending ? 'Creando…' : 'Crear ciclo'}
        </Button>
      </DialogFooter>
    </form>
  )
}
