import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  History,
  House,
  LayoutDashboard,
  type LucideIcon,
  Receipt,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'

import type { Rol } from '@/types'

export interface ItemNavegacion {
  to: string
  etiqueta: string
  /** Etiqueta corta para la barra inferior en móvil. */
  corta?: string
  icono: LucideIcon
  /** Coincidir solo con la ruta exacta (para la página de inicio del rol). */
  exacta?: boolean
}

export interface GrupoNavegacion {
  titulo?: string
  items: ItemNavegacion[]
}

export const navegacion: Record<Rol, GrupoNavegacion[]> = {
  alumno: [
    {
      items: [
        { to: '/alumno', etiqueta: 'Inicio', icono: House, exacta: true },
        { to: '/alumno/materias', etiqueta: 'Mis materias', corta: 'Materias', icono: BookOpen },
        { to: '/alumno/tareas', etiqueta: 'Mis tareas', corta: 'Tareas', icono: ClipboardList },
        { to: '/alumno/calificaciones', etiqueta: 'Mis calificaciones', corta: 'Calificaciones', icono: GraduationCap },
      ],
    },
  ],
  padre: [
    {
      items: [
        { to: '/padre', etiqueta: 'Resumen', icono: House, exacta: true },
        { to: '/padre/calificaciones', etiqueta: 'Calificaciones', icono: GraduationCap },
        { to: '/padre/tareas', etiqueta: 'Tareas', icono: ClipboardList },
        { to: '/padre/estado-de-cuenta', etiqueta: 'Estado de cuenta', corta: 'Pagos', icono: Wallet },
      ],
    },
  ],
  docente: [
    {
      items: [{ to: '/docente', etiqueta: 'Mis aulas', icono: BookOpen, exacta: true }],
    },
  ],
  control: [
    {
      items: [{ to: '/control', etiqueta: 'Panel', icono: LayoutDashboard, exacta: true }],
    },
    {
      titulo: 'Comunidad escolar',
      items: [
        { to: '/control/alumnos', etiqueta: 'Alumnos', icono: Users },
        { to: '/control/importar', etiqueta: 'Importar desde Excel', icono: FileSpreadsheet },
        { to: '/control/grupos', etiqueta: 'Grupos e inscripciones', icono: ClipboardCheck },
        { to: '/control/asignaciones', etiqueta: 'Asignación de docentes', icono: UserCog },
      ],
    },
    {
      titulo: 'Administración',
      items: [
        { to: '/control/pagos', etiqueta: 'Confirmación de pagos', icono: Receipt },
        { to: '/control/reportes', etiqueta: 'Reportes', icono: BarChart3 },
      ],
    },
  ],
  sistema: [
    {
      items: [
        { to: '/sistema', etiqueta: 'Configuración', icono: Settings, exacta: true },
        { to: '/sistema/usuarios', etiqueta: 'Usuarios y permisos', icono: ShieldCheck },
        { to: '/sistema/bitacora', etiqueta: 'Bitácora', icono: History },
      ],
    },
  ],
}

/** Roles que usan barra inferior en móvil (uso principal en celular). */
export const rolesConBarraInferior: Rol[] = ['alumno', 'padre']
