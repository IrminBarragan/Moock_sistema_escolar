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
              { path: '*', ...pagina(() => import('./not-found-page')) },
            ],
          },
        ],
      },
    ],
  },
])
