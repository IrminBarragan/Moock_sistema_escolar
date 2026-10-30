import { FlaskConical } from 'lucide-react'

/** Franja permanente que recuerda que todo es demostrativo. */
export function PrototypeBanner() {
  return (
    <div className="sticky top-0 z-40 flex h-7 shrink-0 items-center justify-center gap-1.5 border-b border-warning/20 bg-warning-soft px-3 text-xs font-medium text-warning">
      <FlaskConical className="size-3.5" aria-hidden="true" />
      <span>Prototipo — datos ficticios</span>
    </div>
  )
}
