import { useEffect } from 'react'

import { branding } from '@/config/branding'

/** Título del documento: ayuda a lectores de pantalla y al historial del navegador. */
export function useTitulo(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} · ${branding.nombre}`
  }, [titulo])
}
