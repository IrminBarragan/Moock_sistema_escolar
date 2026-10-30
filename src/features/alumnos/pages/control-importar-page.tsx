import { AlertCircle, Check, CheckCircle2, Download, FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTitulo } from '@/hooks/use-titulo'
import { exportarCsv } from '@/lib/exportar'
import { fecha, plural } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ApiError } from '@/types'
import type { FilaImportacion } from '@/services/control.service'
import { useConfirmarImportacion, useValidarImportacion } from '../hooks'

const pasos = ['Subir archivo', 'Revisar datos', 'Confirmar'] as const
const columnas = ['nombre', 'apellido_paterno', 'apellido_materno', 'curp', 'fecha_nacimiento', 'grupo', 'correo_tutor']

export default function ControlImportarPage() {
  useTitulo('Importar alumnos desde Excel')
  const validar = useValidarImportacion()
  const confirmar = useConfirmarImportacion()
  const [revision, setRevision] = useState<{ archivo: string; filas: FilaImportacion[] } | null>(null)
  const [importados, setImportados] = useState<number | null>(null)
  const [soloErrores, setSoloErrores] = useState(false)

  const paso = importados !== null ? 2 : revision ? 1 : 0

  function elegir(lista: FileList | null) {
    const archivo = lista?.[0]
    if (!archivo) return
    validar.mutate(archivo.name, { onSuccess: setRevision })
  }

  function reiniciar() {
    setRevision(null)
    setImportados(null)
    setSoloErrores(false)
    validar.reset()
  }

  const validas = revision?.filas.filter((f) => f.errores.length === 0) ?? []
  const conErrores = revision?.filas.filter((f) => f.errores.length > 0) ?? []

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        regresar={{ to: '/control/alumnos', etiqueta: 'Alumnos' }}
        titulo="Importar alumnos desde Excel"
        descripcion="Da de alta a varios alumnos a la vez. Revisamos cada fila antes de guardar."
      />

      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Pasos de la importación">
        {pasos.map((nombre, i) => (
          <li key={nombre} aria-current={i === paso ? 'step' : undefined} className="flex flex-col gap-2">
            <span className={cn('h-1 rounded-full', i <= paso ? 'bg-primary' : 'bg-muted')} aria-hidden="true" />
            <span className={cn('flex items-center gap-1.5 text-sm', i === paso ? 'font-semibold' : 'text-muted-foreground')}>
              {i < paso ? <Check className="size-4 text-primary" aria-hidden="true" /> : <span className="tabular">{i + 1}.</span>}
              {nombre}
            </span>
          </li>
        ))}
      </ol>

      {paso === 0 && (
        <div className="grid gap-5">
          {validar.error instanceof ApiError && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{validar.error.title}</AlertTitle>
              <AlertDescription>{validar.error.detail}</AlertDescription>
            </Alert>
          )}
          <label
            className={cn(
              'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-card px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-accent/40 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40',
              validar.isPending && 'pointer-events-none opacity-70',
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="size-6" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">{validar.isPending ? 'Revisando el archivo…' : 'Elige el archivo de Excel'}</span>
            <span className="max-w-md text-sm text-muted-foreground">
              Formatos .xlsx, .xls o .csv con una fila por alumno. En la demo puedes elegir cualquier archivo de Excel: se cargarán filas de ejemplo.
            </span>
            <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(e) => elegir(e.target.files)} disabled={validar.isPending} />
          </label>
          <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center" aria-labelledby="titulo-plantilla">
            <FileSpreadsheet className="size-8 shrink-0 text-success" aria-hidden="true" />
            <div className="flex-1">
              <h2 id="titulo-plantilla" className="font-medium">
                ¿No tienes el formato?
              </h2>
              <p className="text-sm text-muted-foreground">
                Columnas obligatorias: {columnas.join(', ')}. El grupo debe escribirse como aparece en la plataforma (por ejemplo, 5ºA o 1er sem. A).
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => exportarCsv('plantilla-importacion-alumnos', columnas, [['Ana', 'López', 'García', 'LOGA150301MXXPRN09', '2015-03-01', '5ºA', 'tutor@correo.example']])}
            >
              <Download aria-hidden="true" />
              Descargar plantilla
            </Button>
          </section>
        </div>
      )}

      {paso === 1 && revision && (
        <div className="grid gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-medium">
                <FileSpreadsheet className="size-4 text-success" aria-hidden="true" />
                {revision.archivo}
              </p>
              <p className="mt-1 flex flex-wrap gap-2 text-sm">
                <Badge variant="neutral">{plural(revision.filas.length, 'fila')}</Badge>
                <Badge variant="success">{plural(validas.length, 'válida')}</Badge>
                <Badge variant="danger">{conErrores.length} con errores</Badge>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="solo-errores" checked={soloErrores} onCheckedChange={setSoloErrores} />
              <Label htmlFor="solo-errores" className="font-normal">
                Mostrar solo filas con errores
              </Label>
            </div>
          </div>

          {conErrores.length > 0 && (
            <Alert variant="warning">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{plural(conErrores.length, 'fila tiene', 'filas tienen')} errores y no se importará{conErrores.length === 1 ? '' : 'n'}</AlertTitle>
              <AlertDescription>Puedes importar las filas válidas ahora y corregir las demás en el archivo para subirlas después.</AlertDescription>
            </Alert>
          )}

          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-14">Fila</TableHead>
                  <TableHead>Alumno</TableHead>
                  <TableHead>CURP</TableHead>
                  <TableHead>Nacimiento</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Correo del tutor</TableHead>
                  <TableHead>Revisión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(soloErrores ? conErrores : revision.filas).map((f) => (
                  <TableRow key={f.fila} className={cn(f.errores.length > 0 && 'bg-danger-soft/40 hover:bg-danger-soft/60')}>
                    <TableCell className="text-muted-foreground tabular">{f.fila}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {f.nombre} {f.apellidoPaterno} {f.apellidoMaterno}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{f.curp}</TableCell>
                    <TableCell className="whitespace-nowrap">{fecha(f.fechaNacimiento)}</TableCell>
                    <TableCell className="whitespace-nowrap">{f.grupo}</TableCell>
                    <TableCell className="text-muted-foreground">{f.correoTutor || '—'}</TableCell>
                    <TableCell className="min-w-56">
                      {f.errores.length === 0 ? (
                        <Badge variant="success">
                          <CheckCircle2 aria-hidden="true" /> Lista
                        </Badge>
                      ) : (
                        <ul className="grid gap-1 text-sm text-danger">
                          {f.errores.map((e) => (
                            <li key={e} className="flex gap-1.5">
                              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={reiniciar}>
              Elegir otro archivo
            </Button>
            <Button
              size="lg"
              disabled={validas.length === 0 || confirmar.isPending}
              onClick={() =>
                confirmar.mutate(revision.filas, {
                  onSuccess: ({ importados: n }) => {
                    setImportados(n)
                    toast.success('Importación terminada', { description: `${plural(n, 'alumno importado', 'alumnos importados')}.` })
                  },
                })
              }
            >
              {confirmar.isPending ? 'Importando…' : `Importar ${plural(validas.length, 'alumno válido', 'alumnos válidos')}`}
            </Button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold">Se importaron {plural(importados ?? 0, 'alumno', 'alumnos')}</h2>
          <p className="max-w-md text-muted-foreground">
            Ya aparecen en la lista de alumnos y en sus grupos.
            {conErrores.length > 0 && ` ${plural(conErrores.length, 'fila con errores no se importó', 'filas con errores no se importaron')}; corrígelas en el archivo y vuelve a subirlo.`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={reiniciar}>
              Importar otro archivo
            </Button>
            <Button asChild>
              <Link to="/control/alumnos">Ver alumnos</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
