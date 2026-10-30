import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'

import { Providers } from '@/app/providers'
import { router } from '@/app/router'
import { branding } from '@/config/branding'
import './index.css'

// Colores de la marca, definidos en src/config/branding.ts.
const raiz = document.documentElement.style
raiz.setProperty('--brand-primary', branding.colores.primario)
raiz.setProperty('--brand-primary-dark', branding.colores.primarioOscuro)
document.title = branding.nombre

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
