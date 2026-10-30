/** Ícono y color de cada materia. */
import {
  Atom,
  BookOpen,
  Calculator,
  Dumbbell,
  Feather,
  FlaskConical,
  Globe2,
  HeartHandshake,
  Landmark,
  Languages,
  Leaf,
  type LucideIcon,
  Monitor,
  Palette,
  PenLine,
  Scale,
  Search,
} from 'lucide-react'
import type { CSSProperties } from 'react'

import type { ColorMateria } from '@/types'

const iconos: Record<string, LucideIcon> = {
  ESP: BookOpen,
  MAT: Calculator,
  CN: Leaf,
  BIO: Leaf,
  HIS: Landmark,
  HMX: Landmark,
  GEO: Globe2,
  FCE: Scale,
  ETI: HeartHandshake,
  ING: Languages,
  EF: Dumbbell,
  ART: Palette,
  FIS: Atom,
  QUI: FlaskConical,
  INF: Monitor,
  MET: Search,
  TLR: PenLine,
  LIT: Feather,
}

export function iconoDeMateria(clave: string): LucideIcon {
  const base = clave.split('-')[0].replace(/\d+$/, '')
  return iconos[base] ?? BookOpen
}

/** Variable CSS con el color de la materia, para usar en `style`. */
export function estiloMateria(color: ColorMateria): CSSProperties {
  return { '--materia': `var(--materia-${color})` } as CSSProperties
}

