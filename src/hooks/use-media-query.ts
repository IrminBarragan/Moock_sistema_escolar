import { useSyncExternalStore } from 'react'

export function useMediaQuery(consulta: string): boolean {
  return useSyncExternalStore(
    (fn) => {
      const mq = window.matchMedia(consulta)
      mq.addEventListener('change', fn)
      return () => mq.removeEventListener('change', fn)
    },
    () => window.matchMedia(consulta).matches,
  )
}
