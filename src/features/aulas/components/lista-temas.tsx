import { ArrowDown, ArrowUp, FolderOpen, MoreHorizontal, Pencil, Upload } from 'lucide-react'
import { useState } from 'react'

import { ArchivoFila } from '@/components/shared/archivo-fila'
import { VistaPreviaArchivo, type ArchivoAPrevisualizar } from '@/components/shared/vista-previa-archivo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { nombreTipoArchivo } from '@/lib/archivos'
import { fecha, plural } from '@/lib/format'
import type { Tema, TemaConMaterial } from '@/types'

interface Props {
  temas: TemaConMaterial[]
  /** Acciones del docente; si no se pasan, la lista es de solo lectura. */
  edicion?: {
    onEditar: (tema: Tema) => void
    onSubir: (temaId: string) => void
    onMover: (temaId: string, direccion: 'arriba' | 'abajo') => void
    moviendo: boolean
  }
}

export function ListaTemas({ temas, edicion }: Props) {
  const [vista, setVista] = useState<ArchivoAPrevisualizar | null>(null)

  return (
    <>
      <ol className="grid gap-4">
        {temas.map((tema, i) => (
          <li key={tema.id} className="min-w-0">
            <section aria-labelledby={`tema-${tema.id}`} className="rounded-xl border bg-card">
              <header className="flex items-start gap-3 border-b px-4 py-3.5 sm:px-5">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground tabular">
                  {tema.orden}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 id={`tema-${tema.id}`} className="leading-snug font-semibold">
                    {tema.titulo}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {plural(tema.materiales.length, 'material', 'materiales')}
                    {tema.totalTareas > 0 && ` · ${plural(tema.totalTareas, 'tarea')}`}
                  </p>
                </div>
                {edicion && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={`Opciones del tema ${tema.titulo}`}>
                        <MoreHorizontal aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => edicion.onSubir(tema.id)}>
                        <Upload aria-hidden="true" /> Subir material aquí
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => edicion.onEditar(tema)}>
                        <Pencil aria-hidden="true" /> Editar tema
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={i === 0 || edicion.moviendo} onSelect={() => edicion.onMover(tema.id, 'arriba')}>
                        <ArrowUp aria-hidden="true" /> Mover arriba
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={i === temas.length - 1 || edicion.moviendo}
                        onSelect={() => edicion.onMover(tema.id, 'abajo')}
                      >
                        <ArrowDown aria-hidden="true" /> Mover abajo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </header>
              <div className="p-3 sm:p-4">
                {tema.materiales.length > 0 ? (
                  <ul className="grid gap-2 md:grid-cols-2">
                    {tema.materiales.map((m) => (
                      <li key={m.id} className="min-w-0">
                        <ArchivoFila
                          archivo={m.archivo}
                          titulo={m.titulo}
                          detalle={`${nombreTipoArchivo[m.archivo.tipo]} · ${fecha(m.publicadoEl)}`}
                          onAbrir={() => setVista({ archivo: m.archivo, titulo: m.titulo, descripcion: m.descripcion })}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center sm:flex-row sm:text-left">
                    <FolderOpen className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <p className="flex-1 text-sm text-muted-foreground">
                      {edicion ? 'Este tema todavía no tiene material.' : 'Tu docente aún no publica material en este tema.'}
                    </p>
                    {edicion && (
                      <Button variant="outline" size="sm" onClick={() => edicion.onSubir(tema.id)}>
                        <Upload aria-hidden="true" />
                        Subir material
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </section>
          </li>
        ))}
      </ol>
      <VistaPreviaArchivo item={vista} onCerrar={() => setVista(null)} />
    </>
  )
}
