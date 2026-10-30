import { Download, Pause, Play, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { nombreTipoArchivo } from '@/lib/archivos'
import { duracion, tamanoArchivo } from '@/lib/format'
import type { Archivo } from '@/types'
import { ArchivoIcono } from './archivo-icono'

export interface ArchivoAPrevisualizar {
  archivo: Archivo
  titulo?: string
  descripcion?: string
}

interface Props {
  item: ArchivoAPrevisualizar | null
  onCerrar: () => void
}

/** Vista previa simulada: dibuja una representación del documento sin descargar nada. */
export function VistaPreviaArchivo({ item, onCerrar }: Props) {
  const titulo = item ? (item.titulo ?? item.archivo.nombre) : ''
  return (
    <Dialog open={item !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="gap-0 p-0 sm:max-w-4xl">
        {item && (
          <>
            <DialogHeader className="flex-row items-center gap-3 border-b p-4 pr-14 sm:p-5 sm:pr-14">
              <ArchivoIcono tipo={item.archivo.tipo} />
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-base">{titulo}</DialogTitle>
                <DialogDescription className="truncate">
                  {item.archivo.nombre} · {nombreTipoArchivo[item.archivo.tipo]} · {tamanoArchivo(item.archivo.tamanoKb)}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => toast.info('Descarga simulada', { description: 'En la demo los archivos no se descargan.' })}
              >
                <Download aria-hidden="true" />
                Descargar
              </Button>
            </DialogHeader>
            <div className="bg-muted/60 p-3 sm:p-6">
              <Contenido archivo={item.archivo} titulo={titulo} />
            </div>
            {item.descripcion && <p className="border-t p-4 text-sm text-muted-foreground sm:px-6">{item.descripcion}</p>}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Contenido({ archivo, titulo }: { archivo: Archivo; titulo: string }) {
  switch (archivo.tipo) {
    case 'video':
      return <ReproductorVideo titulo={titulo} duracionSeg={archivo.duracionSeg ?? 420} />
    case 'excel':
      return <HojaCalculo />
    case 'powerpoint':
      return <Diapositivas titulo={titulo} />
    case 'imagen':
      return <Esquema titulo={titulo} />
    case 'otro':
      return (
        <div className="flex aspect-video items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
          Este tipo de archivo no tiene vista previa. Descárgalo para abrirlo.
        </div>
      )
    default:
      return <Documento titulo={titulo} esWord={archivo.tipo === 'word'} />
  }
}

const parrafos = [
  'En este material revisaremos los conceptos centrales del tema y los relacionaremos con situaciones cotidianas. Lee con atención y subraya las ideas que te parezcan más importantes.',
  'Antes de resolver los ejercicios, repasa los ejemplos resueltos. Observa cómo se plantea cada problema, qué datos se usan y por qué se elige cada procedimiento.',
  'Al terminar, escribe con tus propias palabras un resumen de no más de cinco renglones. Si te quedan dudas, anótalas para comentarlas en la siguiente clase.',
]

function Documento({ titulo, esWord }: { titulo: string; esWord: boolean }) {
  return (
    <div className="mx-auto max-h-[60dvh] max-w-2xl overflow-y-auto rounded-sm bg-white p-6 text-[#1d1d1f] shadow-md sm:p-10">
      {esWord && <div className="mb-6 h-1 w-16 rounded-full bg-[#2b5797]" aria-hidden="true" />}
      <p className="text-xs tracking-wider text-[#6b6b70] uppercase">Material de clase · Ciclo 2026–2027</p>
      <h3 className="mt-2 text-2xl font-semibold">{titulo}</h3>
      <h4 className="mt-6 font-semibold">1. Propósito</h4>
      <p className="mt-2 text-sm leading-relaxed">{parrafos[0]}</p>
      <h4 className="mt-5 font-semibold">2. Desarrollo</h4>
      <p className="mt-2 text-sm leading-relaxed">{parrafos[1]}</p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
        <li>Identifica los datos del problema.</li>
        <li>Elige el procedimiento adecuado y justifícalo.</li>
        <li>Resuelve paso a paso y verifica tu resultado.</li>
      </ol>
      <h4 className="mt-5 font-semibold">3. Cierre</h4>
      <p className="mt-2 text-sm leading-relaxed">{parrafos[2]}</p>
      <p className="mt-10 text-center text-xs text-[#6b6b70]">Página 1 de 3</p>
    </div>
  )
}

function HojaCalculo() {
  const columnas = ['A', 'B', 'C', 'D', 'E']
  const encabezados = ['No.', 'Fecha', 'Observación', 'Medición', 'Resultado']
  const filas = Array.from({ length: 10 }, (_, i) => [
    String(i + 1),
    `${String(11 + i).padStart(2, '0')}/01/2027`,
    ['Muestra A', 'Muestra B', 'Control', 'Repetición'][i % 4],
    (12.4 + i * 1.7).toFixed(1),
    (i % 3 === 0 ? 'Cumple' : 'Revisar'),
  ])
  return (
    <div className="max-h-[60dvh] overflow-auto rounded-sm border bg-white text-[#1d1d1f] shadow-md">
      <table className="w-full min-w-[32rem] border-collapse text-xs">
        <thead>
          <tr className="bg-[#f3f3f5] text-[#5f5f66]">
            <th className="w-10 border border-[#dcdce0] py-1 font-normal" aria-label="Fila" />
            {columnas.map((c) => (
              <th key={c} className="border border-[#dcdce0] py-1 font-normal">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-[#dcdce0] bg-[#f3f3f5] text-center text-[#5f5f66]">1</td>
            {encabezados.map((e) => (
              <td key={e} className="border border-[#dcdce0] bg-[#e8f3ec] px-2 py-1.5 font-semibold">
                {e}
              </td>
            ))}
          </tr>
          {filas.map((fila, i) => (
            <tr key={i}>
              <td className="border border-[#dcdce0] bg-[#f3f3f5] text-center text-[#5f5f66]">{i + 2}</td>
              {fila.map((v, j) => (
                <td key={j} className="border border-[#dcdce0] px-2 py-1.5">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Diapositivas({ titulo }: { titulo: string }) {
  const [actual, setActual] = useState(0)
  const diapositivas = [
    { titulo, puntos: ['Ciclo escolar 2026–2027', 'Material de apoyo para la clase'] },
    { titulo: '¿Qué vamos a aprender?', puntos: ['Conceptos clave del tema', 'Ejemplos resueltos', 'Ejercicios de práctica'] },
    { titulo: 'Ejemplo guiado', puntos: ['Leemos el problema', 'Identificamos los datos', 'Resolvemos y comprobamos'] },
    { titulo: 'Para practicar', puntos: ['Resuelve la hoja de ejercicios', 'Anota tus dudas para la clase'] },
  ]
  const d = diapositivas[actual]
  return (
    <div className="grid gap-3">
      <div className="mx-auto flex aspect-video w-full max-w-3xl flex-col justify-center rounded-sm bg-white p-8 text-[#1d1d1f] shadow-md sm:p-14">
        <div className="mb-5 h-1.5 w-14 rounded-full bg-[#c55a11]" aria-hidden="true" />
        <p className={actual === 0 ? 'text-2xl font-semibold sm:text-4xl' : 'text-xl font-semibold sm:text-3xl'}>{d.titulo}</p>
        <ul className="mt-4 space-y-1.5 text-sm sm:text-lg">
          {d.puntos.map((p) => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center gap-2" role="group" aria-label="Diapositivas">
        {diapositivas.map((x, i) => (
          <button
            key={x.titulo}
            type="button"
            onClick={() => setActual(i)}
            aria-label={`Diapositiva ${i + 1}`}
            aria-current={i === actual}
            className="flex h-10 w-16 items-center justify-center rounded-sm border bg-white text-[0.6rem] font-medium text-[#5f5f66] shadow-xs transition-shadow aria-[current=true]:ring-2 aria-[current=true]:ring-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

function Esquema({ titulo }: { titulo: string }) {
  const ramas = ['Definición', 'Características', 'Ejemplos', 'Aplicaciones']
  const posiciones = [
    [120, 70],
    [480, 70],
    [120, 250],
    [480, 250],
  ]
  return (
    <svg viewBox="0 0 600 320" className="mx-auto w-full max-w-3xl rounded-sm bg-white shadow-md" role="img" aria-label={`Esquema: ${titulo}`}>
      {posiciones.map(([x, y], i) => (
        <line key={i} x1="300" y1="160" x2={x} y2={y} stroke="#b9b9c2" strokeWidth="2" />
      ))}
      <rect x="185" y="132" width="230" height="56" rx="12" fill="#1f4e8c" />
      <text x="300" y="166" textAnchor="middle" fill="white" fontSize="15" fontWeight="600" fontFamily="system-ui, sans-serif">
        {titulo.length > 26 ? `${titulo.slice(0, 25)}…` : titulo}
      </text>
      {posiciones.map(([x, y], i) => (
        <g key={ramas[i]}>
          <rect x={x - 70} y={y - 22} width="140" height="44" rx="10" fill="#f3f3f5" stroke="#d4d4da" />
          <text x={x} y={y + 5} textAnchor="middle" fill="#1d1d1f" fontSize="14" fontFamily="system-ui, sans-serif">
            {ramas[i]}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** Reproductor de muestra: no carga video, simula la reproducción con una barra de avance. */
function ReproductorVideo({ titulo, duracionSeg }: { titulo: string; duracionSeg: number }) {
  const [reproduciendo, setReproduciendo] = useState(false)
  const [segundo, setSegundo] = useState(0)

  // Al llegar al final, la reproducción se detiene sin necesidad de otro estado.
  const enReproduccion = reproduciendo && segundo < duracionSeg

  useEffect(() => {
    if (!enReproduccion) return
    const id = setInterval(() => setSegundo((s) => Math.min(s + 1, duracionSeg)), 250)
    return () => clearInterval(id)
  }, [enReproduccion, duracionSeg])

  const avance = Math.round((segundo / duracionSeg) * 100)

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-lg bg-[#0d0f14] text-white shadow-md">
      <div className="relative flex aspect-video items-center justify-center">
        <svg className="absolute inset-0 size-full opacity-20" aria-hidden="true">
          <defs>
            <pattern id="puntos-video" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#puntos-video)" />
        </svg>
        <div className="relative px-6 text-center">
          <p className="text-xs tracking-wider text-white/60 uppercase">Video de muestra</p>
          <p className="mt-2 text-lg font-semibold text-balance sm:text-2xl">{titulo}</p>
          {!enReproduccion && (
            <button
              type="button"
              onClick={() => {
                if (segundo >= duracionSeg) setSegundo(0)
                setReproduciendo(true)
              }}
              className="mx-auto mt-6 flex size-16 items-center justify-center rounded-full bg-white/95 text-[#0d0f14] shadow-lg transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:outline-none"
              aria-label={segundo > 0 ? 'Continuar reproducción' : 'Reproducir video'}
            >
              <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={() => {
            if (!enReproduccion && segundo >= duracionSeg) setSegundo(0)
            setReproduciendo(!enReproduccion)
          }}
          aria-label={enReproduccion ? 'Pausar' : 'Reproducir'}
        >
          {enReproduccion ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
        <span className="text-xs text-white/80 tabular">
          {duracion(segundo)} / {duracion(duracionSeg)}
        </span>
        <Progress value={avance} aria-label="Avance del video" className="flex-1 bg-white/20 [&>[data-slot=progress-indicator]]:bg-white" />
        <Volume2 className="size-4 text-white/70" aria-hidden="true" />
      </div>
    </div>
  )
}
