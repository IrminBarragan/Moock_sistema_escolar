import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { MateriaIcono } from '@/components/shared/materia-icono'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { estiloMateria } from '@/lib/materias'
import type { Configuracion } from '@/services/configuracion.service'
import type { ColorMateria } from '@/types'
import { useGuardarMateria } from '../hooks'

const colores: { valor: ColorMateria; nombre: string }[] = [
  { valor: 'azul', nombre: 'Azul' },
  { valor: 'coral', nombre: 'Coral' },
  { valor: 'verde', nombre: 'Verde' },
  { valor: 'ambar', nombre: 'Ámbar' },
  { valor: 'teal', nombre: 'Verde azulado' },
  { valor: 'violeta', nombre: 'Violeta' },
  { valor: 'indigo', nombre: 'Índigo' },
  { valor: 'naranja', nombre: 'Naranja' },
  { valor: 'rosa', nombre: 'Rosa' },
  { valor: 'cian', nombre: 'Cian' },
  { valor: 'oliva', nombre: 'Oliva' },
  { valor: 'pizarra', nombre: 'Pizarra' },
]

export function TabMaterias({ config }: { config: Configuracion }) {
  const conGrupos = config.niveles.flatMap((n) => n.grados.filter((g) => g.grupos > 0))
  const [gradoId, setGradoId] = useState(conGrupos.find((g) => g.id === 'sec-2')?.id ?? conGrupos[0].id)
  const [abierto, setAbierto] = useState(false)
  const lista = config.materias.filter((m) => m.gradoId === gradoId)

  return (
    <section className="grid gap-4" aria-labelledby="titulo-materias">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="titulo-materias" className="font-semibold">
            Materias por grado
          </h2>
          <p className="text-sm text-muted-foreground">El color y el ícono identifican a la materia en toda la plataforma.</p>
        </div>
        <div className="flex gap-2">
          <Select value={gradoId} onValueChange={setGradoId}>
            <SelectTrigger className="w-52" aria-label="Grado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conGrupos.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setAbierto(true)}>
            <Plus aria-hidden="true" />
            Nueva materia
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Materia</TableHead>
              <TableHead>Clave</TableHead>
              <TableHead className="text-right">Horas por semana</TableHead>
              <TableHead className="text-right">Grupos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <span className="flex items-center gap-3 font-medium">
                    <MateriaIcono materia={m} tamano="sm" />
                    {m.nombre}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">{m.clave}</TableCell>
                <TableCell className="text-right tabular">{m.horasSemana}</TableCell>
                <TableCell className="text-right tabular">{m.grupos}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          {abierto && <FormularioMateria gradoId={gradoId} grado={conGrupos.find((g) => g.id === gradoId)!.nombre} onCerrar={() => setAbierto(false)} />}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function FormularioMateria({ gradoId, grado, onCerrar }: { gradoId: string; grado: string; onCerrar: () => void }) {
  const guardar = useGuardarMateria()
  const [nombre, setNombre] = useState('')
  const [clave, setClave] = useState('')
  const [horas, setHoras] = useState('2')
  const [color, setColor] = useState<ColorMateria>('teal')
  const [intentado, setIntentado] = useState(false)
  const error = intentado && (!nombre.trim() || !clave.trim()) ? 'Escribe el nombre y la clave de la materia.' : null

  function enviar(e: FormEvent) {
    e.preventDefault()
    setIntentado(true)
    if (!nombre.trim() || !clave.trim() || guardar.isPending) return
    guardar.mutate(
      { nombre, clave, gradoId, horasSemana: Number(horas) || 1, color },
      {
        onSuccess: (m) => {
          toast.success('Materia creada', { description: `${m.nombre} · ${grado}` })
          onCerrar()
        },
      },
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      <DialogHeader>
        <DialogTitle>Nueva materia</DialogTitle>
        <DialogDescription>Se agregará al plan de {grado}. Después asigna un docente en control escolar.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="materia-nombre">Nombre</Label>
        <Input id="materia-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Por ejemplo: Tecnología" aria-invalid={error && !nombre.trim() ? true : undefined} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="materia-clave">Clave</Label>
          <Input id="materia-clave" value={clave} onChange={(e) => setClave(e.target.value)} maxLength={4} placeholder="TEC" aria-invalid={error && !clave.trim() ? true : undefined} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="materia-horas">Horas por semana</Label>
          <Input id="materia-horas" type="number" min={1} max={10} value={horas} onChange={(e) => setHoras(e.target.value)} />
        </div>
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Color</legend>
        <div className="flex flex-wrap gap-2">
          {colores.map((c) => (
            <label key={c.valor} style={estiloMateria(c.valor)} className="relative cursor-pointer" title={c.nombre}>
              <input type="radio" name="color" value={c.valor} checked={color === c.valor} onChange={() => setColor(c.valor)} className="peer sr-only" />
              <span className="sr-only">{c.nombre}</span>
              <span
                aria-hidden="true"
                className="block size-8 rounded-full bg-[var(--materia)] ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
              />
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p className="text-sm text-danger">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardar.isPending}>
          {guardar.isPending ? 'Guardando…' : 'Crear materia'}
        </Button>
      </DialogFooter>
    </form>
  )
}
