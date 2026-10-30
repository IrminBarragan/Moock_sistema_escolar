/** Se muestra mientras se descarga la primera pantalla. */
export function CargaInicial() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-live="polite">
      <span className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
