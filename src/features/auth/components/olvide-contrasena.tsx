import { MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Recuperación de contraseña simulada: no envía ningún correo. */
export function OlvideContrasena({ abierto, onCambio }: { abierto: boolean; onCambio: (v: boolean) => void }) {
  const [correo, setCorreo] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setTimeout(() => {
      setEnviando(false)
      setEnviado(true)
    }, 700)
  }

  function cambiar(v: boolean) {
    onCambio(v)
    if (!v) {
      setEnviado(false)
      setCorreo('')
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={cambiar}>
      <DialogContent>
        {enviado ? (
          <>
            <DialogHeader>
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-success-soft text-success">
                <MailCheck className="size-5" aria-hidden="true" />
              </span>
              <DialogTitle>Revisa tu correo</DialogTitle>
              <DialogDescription>
                Si <strong className="text-foreground">{correo}</strong> está registrado, recibirás un enlace para crear una nueva
                contraseña. El enlace vence en 30 minutos.
              </DialogDescription>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">En esta demo no se envía ningún correo.</p>
            <DialogFooter>
              <Button onClick={() => cambiar(false)}>Entendido</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={enviar} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Recuperar contraseña</DialogTitle>
              <DialogDescription>Escribe el correo con el que entras a la plataforma y te enviaremos un enlace.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="correo-recuperar">Correo electrónico</Label>
              <Input
                id="correo-recuperar"
                type="email"
                autoComplete="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => cambiar(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar enlace'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
