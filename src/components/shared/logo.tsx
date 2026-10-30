import { branding } from '@/config/branding'
import { cn } from '@/lib/utils'

/** Antepone la ruta base para que el logotipo cargue también en GitHub Pages. */
const rutaPublica = (ruta: string) => (ruta.startsWith('/') ? `${import.meta.env.BASE_URL}${ruta.slice(1)}` : ruta)

/** Logotipo de la escuela; si no hay archivo, se dibuja un monograma con las iniciales. */
export function Logo({ className, conNombre = true, subtitulo = branding.lema }: { className?: string; conNombre?: boolean; subtitulo?: string }) {
  return (
    <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
      {branding.logo ? (
        <img src={rutaPublica(branding.logo)} alt="" className="size-9 shrink-0 object-contain" />
      ) : (
        <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
          <path d="M20 2 36 8v12c0 9.5-6.6 16-16 18C10.6 36 4 29.5 4 20V8Z" className="fill-primary" />
          <path d="M20 2 36 8v12c0 9.5-6.6 16-16 18Z" fill={branding.colores.acentoLogo} opacity="0.9" />
          <text
            x="20"
            y="24.5"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="white"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.5"
          >
            {branding.iniciales}
          </text>
        </svg>
      )}
      {conNombre && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[0.95rem] font-semibold tracking-tight">{branding.nombre}</span>
          <span className="truncate text-xs text-muted-foreground">{subtitulo}</span>
        </span>
      )}
    </span>
  )
}
