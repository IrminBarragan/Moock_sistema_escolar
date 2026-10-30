import type { Rol } from '@/types'

export const roles: Record<Rol, { nombre: string; descripcion: string; inicio: string }> = {
  alumno: { nombre: 'Alumno', descripcion: 'Tareas, materias y calificaciones', inicio: '/alumno' },
  padre: { nombre: 'Padre o tutor', descripcion: 'Seguimiento de sus hijos', inicio: '/padre' },
  docente: { nombre: 'Docente', descripcion: 'Aulas, tareas y evaluación', inicio: '/docente' },
  control: { nombre: 'Control escolar', descripcion: 'Alumnos, grupos y pagos', inicio: '/control' },
  sistema: { nombre: 'Administrador del sistema', descripcion: 'Configuración y usuarios', inicio: '/sistema' },
}

export const ordenRoles: Rol[] = ['alumno', 'padre', 'docente', 'control', 'sistema']
