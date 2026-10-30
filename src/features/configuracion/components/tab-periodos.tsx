import { Pencil } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fecha } from '@/lib/format'
import type { Configuracion } from '@/services/configuracion.service'
import { useGuardarPeriodo } from '../hooks'

type Periodo = Configuracion['periodos'][number]

const estadoTexto = { cerrado: ['Cerrado', 'neutral'], 'en-curso': ['En curso', 'info'], proximo: ['Próximo', 'outline'] } as const

export function TabPeriodos({ config }: { config: Configuracion }) {
  const [editar, setEditar] = useState<Periodo | null>(null)
  return (
    <section className="grid gap-4" aria-labelledby="titulo-periodos">
      <div>
        <h2 id="titulo-periodos" className="font-semibold">
          Periodos de evaluación
        </h2>
        <p className="text-sm text-muted-foreground">Al cerrar un periodo, sus calificaciones quedan de solo lectura para los docentes.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {config.niveles.map((n) => (
          <article key={n.id} className="overflow-hidden rounded-xl border bg-card">
            <h3 className="border-b px-5 py-3.5 font-semibold">{n.nombre}</h3>
            <Table>
              <TableHeader className="sr-only">
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.periodos
                  .filter((p) => p.nivelId === n.id)
                  .map((p) => {
                    const [texto, variante] = estadoTexto[p.estado]
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="font-medium">{p.nombre}</p>
                          <p className="text-xs text-muted-foreground tabular">
                            {fecha(p.inicio)} – {fecha(p.fin)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={variante}>{texto}</Badge>
                        </TableCell>
                        <TableCell className="w-10">
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditar(p)} aria-label={`Editar fechas de ${p.nombre}, ${n.nombre}`}>
                            <Pencil aria-hidden="true" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </article>
        ))}
      </div>
      <Dialog open={editar !== null} onOpenChange={(v) => !v && setEditar(null)}>
        <DialogContent>{editar && <FormularioPeriodo periodo={editar} onCerrar={() => setEditar(null)} />}</DialogContent>
      </Dialog>
    </section>
  )
}

function FormularioPeriodo({ periodo, onCerrar }: { periodo: Periodo; onCerrar: () => void }) {
  const guardar = useGuardarPeriodo()
  const [inicio, setInicio] = useState(periodo.inicio)
  const [fin, setFin] = useState(periodo.fin)
  const error = inicio >= fin ? 'La fecha de inicio debe ser anterior a la de cierre.' : null

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (error || guardar.isPending) return
    guardar.mutate(
      { id: periodo.id, inicio, fin },
      {
        onSuccess: () => {
          toast.success('Periodo actualizado', { description: `${periodo.nombre}: ${fecha(inicio)} – ${fecha(fin)}` })
          onCerrar()
        },
      },
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Editar {periodo.nombre}</DialogTitle>
        <DialogDescription>Cambiar la fecha de cierre reabre o cierra la captura de calificaciones de este periodo.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="periodo-inicio">Inicio</Label>
          <Input id="periodo-inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="periodo-fin">Cierre</Label>
          <Input id="periodo-fin" type="date" value={fin} onChange={(e) => setFin(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? 'periodo-error' : undefined} />
        </div>
      </div>
      {error && (
        <p id="periodo-error" className="text-sm text-danger">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={Boolean(error) || guardar.isPending}>
          {guardar.isPending ? 'Guardando…' : 'Guardar fechas'}
        </Button>
      </DialogFooter>
    </form>
  )
}
