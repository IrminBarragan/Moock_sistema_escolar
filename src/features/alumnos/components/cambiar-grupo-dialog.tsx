import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGrupos } from '@/features/grupos/hooks'
import type { NivelId } from '@/types'
import { useCambiarGrupo } from '../hooks'

interface Props {
  alumno: { id: string; nombre: string; grupoId: string; nivelId: NivelId } | null
  onCerrar: () => void
}

export function CambiarGrupoDialog({ alumno, onCerrar }: Props) {
  return (
    <Dialog open={alumno !== null} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent>{alumno && <Formulario alumno={alumno} onCerrar={onCerrar} />}</DialogContent>
    </Dialog>
  )
}

function Formulario({ alumno, onCerrar }: { alumno: NonNullable<Props['alumno']>; onCerrar: () => void }) {
  const grupos = useGrupos()
  const cambiar = useCambiarGrupo()
  const opciones = (grupos.data ?? []).filter((g) => g.nivelId === alumno.nivelId && g.id !== alumno.grupoId)
  const [destino, setDestino] = useState('')

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Cambiar de grupo</DialogTitle>
        <DialogDescription>
          {alumno.nombre} dejará su grupo actual. Sus calificaciones del ciclo se conservan en el expediente.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="grupo-destino">Grupo nuevo</Label>
        <Select value={destino} onValueChange={setDestino}>
          <SelectTrigger id="grupo-destino">
            <SelectValue placeholder={opciones.length ? 'Elige un grupo' : 'No hay otros grupos en este nivel'} />
          </SelectTrigger>
          <SelectContent>
            {opciones.map((g) => (
              <SelectItem key={g.id} value={g.id} disabled={g.inscritos >= g.capacidad}>
                {g.nombre} · {g.inscritos}/{g.capacidad} lugares{g.inscritos >= g.capacidad ? ' (lleno)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button
          disabled={!destino || cambiar.isPending}
          onClick={() =>
            cambiar.mutate(
              { alumnoId: alumno.id, grupoId: destino },
              {
                onSuccess: () => {
                  toast.success('Grupo actualizado', { description: `${alumno.nombre} ahora está en ${opciones.find((g) => g.id === destino)?.nombre}.` })
                  onCerrar()
                },
              },
            )
          }
        >
          {cambiar.isPending ? 'Guardando…' : 'Cambiar de grupo'}
        </Button>
      </DialogFooter>
    </div>
  )
}
