import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { usePreferencias } from '@/hooks/use-preferencias'
import { ApiError } from '@/types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    // Error de cualquier acción: aviso no bloqueante con el detalle del "servidor".
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.silenciarError) return
      if (error instanceof ApiError) toast.error(error.title, { description: error.detail })
      else toast.error('No se pudo completar la acción', { description: 'Inténtalo de nuevo en unos segundos.' })
    },
  }),
})

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { silenciarError?: boolean }
  }
}

function TemaDocumento() {
  const { temaEfectivo } = usePreferencias()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', temaEfectivo === 'dark')
  }, [temaEfectivo])
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TemaDocumento />
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
