import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/layout/app-shell'
import { RolGuard, SesionGuard } from '@/components/layout/rol-guard'
import { CargaInicial } from './carga-inicial'
import { Inicio } from './inicio'
import { RootLayout } from './root-layout'

/** Carga diferida por ruta: cada pantalla se descarga solo cuando se visita. */
function pagina(cargar: () => Promise<{ default: ComponentType }>) {
  return { lazy: async () => ({ Component: (await cargar()).default }) }
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    hydrateFallbackElement: <CargaInicial />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/login', ...pagina(() => import('@/features/auth/pages/login-page')) },
      {
        element: <SesionGuard />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                path: 'alumno',
                element: <RolGuard rol="alumno" />,
                children: [
                  { index: true, ...pagina(() => import('@/features/inicio/pages/alumno-inicio-page')) },
                  { path: 'materias', ...pagina(() => import('@/features/aulas/pages/alumno-materias-page')) },
                  { path: 'materias/:aulaId', ...pagina(() => import('@/features/aulas/pages/alumno-aula-page')) },
                  { path: 'tareas', ...pagina(() => import('@/features/tareas/pages/alumno-tareas-page')) },
                  { path: 'tareas/:tareaId', ...pagina(() => import('@/features/tareas/pages/alumno-tarea-page')) },
                  { path: 'calificaciones', ...pagina(() => import('@/features/calificaciones/pages/alumno-calificaciones-page')) },
                ],
              },
              {
                path: 'padre',
                element: <RolGuard rol="padre" />,
                children: [
                  {
                    ...pagina(() => import('@/features/familia/pages/padre-layout')),
                    children: [
                      { index: true, ...pagina(() => import('@/features/familia/pages/padre-resumen-page')) },
                      { path: 'calificaciones', ...pagina(() => import('@/features/familia/pages/padre-calificaciones-page')) },
                      { path: 'tareas', ...pagina(() => import('@/features/familia/pages/padre-tareas-page')) },
                      { path: 'tareas/:tareaId', ...pagina(() => import('@/features/familia/pages/padre-tarea-page')) },
                      { path: 'estado-de-cuenta', ...pagina(() => import('@/features/familia/pages/padre-estado-cuenta-page')) },
                    ],
                  },
                ],
              },
              {
                path: 'docente',
                element: <RolGuard rol="docente" />,
                children: [
                  { index: true, ...pagina(() => import('@/features/aulas/pages/docente-aulas-page')) },
                  { path: 'aulas/:aulaId', ...pagina(() => import('@/features/aulas/pages/docente-aula-page')) },
                  { path: 'aulas/:aulaId/tareas/nueva', ...pagina(() => import('@/features/tareas/pages/docente-tarea-form-page')) },
                  { path: 'aulas/:aulaId/tareas/:tareaId/editar', ...pagina(() => import('@/features/tareas/pages/docente-tarea-form-page')) },
                  { path: 'aulas/:aulaId/tareas/:tareaId/entregas', ...pagina(() => import('@/features/tareas/pages/docente-entregas-page')) },
                  { path: 'aulas/:aulaId/calificaciones', ...pagina(() => import('@/features/calificaciones/pages/docente-calificaciones-page')) },
                ],
              },
              {
                path: 'control',
                element: <RolGuard rol="control" />,
                children: [
                  { index: true, ...pagina(() => import('@/features/panel/pages/control-panel-page')) },
                  { path: 'alumnos', ...pagina(() => import('@/features/alumnos/pages/control-alumnos-page')) },
                  { path: 'alumnos/:alumnoId', ...pagina(() => import('@/features/alumnos/pages/control-expediente-page')) },
                  { path: 'importar', ...pagina(() => import('@/features/alumnos/pages/control-importar-page')) },
                  { path: 'grupos', ...pagina(() => import('@/features/grupos/pages/control-grupos-page')) },
                  { path: 'grupos/:grupoId', ...pagina(() => import('@/features/grupos/pages/control-grupo-page')) },
                  { path: 'asignaciones', ...pagina(() => import('@/features/grupos/pages/control-asignaciones-page')) },
                  { path: 'pagos', ...pagina(() => import('@/features/pagos/pages/control-pagos-page')) },
                  { path: 'reportes', ...pagina(() => import('@/features/reportes/pages/control-reportes-page')) },
                ],
              },
              { path: '*', ...pagina(() => import('./not-found-page')) },
            ],
          },
        ],
      },
    ],
  },
])
