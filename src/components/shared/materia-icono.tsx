import { createElement } from 'react'

import { cn } from '@/lib/utils'
import { estiloMateria, iconoDeMateria } from '@/lib/materias'
import type { ColorMateria } from '@/types'

interface Props {
  materia: { clave: string; color: ColorMateria }
  tamano?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Ícono de la materia sobre su color: el elemento distintivo que se repite en toda la plataforma. */
export function MateriaIcono({ materia, tamano = 'md', className }: Props) {
  return (
    <span
      style={estiloMateria(materia.color)}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--materia)_16%,transparent)] text-[var(--materia)]',
        tamano === 'sm' && 'size-8 [&_svg]:size-4',
        tamano === 'md' && 'size-10 [&_svg]:size-5',
        tamano === 'lg' && 'size-14 rounded-xl [&_svg]:size-7',
        className,
      )}
      aria-hidden="true"
    >
      {createElement(iconoDeMateria(materia.clave), { strokeWidth: 2 })}
    </span>
  )
}

export function MateriaPunto({ color, className }: { color: ColorMateria; className?: string }) {
  return (
    <span
      style={estiloMateria(color)}
      className={cn('inline-block size-2.5 shrink-0 rounded-full bg-[var(--materia)]', className)}
      aria-hidden="true"
    />
  )
}
