import { Badge } from '@/components/ui/badge'
import type { Configuracion } from '@/services/configuracion.service'

export function TabNiveles({ niveles }: { niveles: Configuracion['niveles'] }) {
  return (
    <section className="grid gap-4" aria-labelledby="titulo-niveles">
      <div>
        <h2 id="titulo-niveles" className="font-semibold">
          Niveles, grados y semestres
        </h2>
        <p className="text-sm text-muted-foreground">Estructura académica de la escuela. Los grados sin grupos no aparecen en inscripciones.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {niveles.map((n) => (
          <article key={n.id} className="rounded-xl border bg-card">
            <header className="border-b px-5 py-4">
              <h3 className="text-lg font-semibold">{n.nombre}</h3>
              <p className="text-sm text-muted-foreground">
                Organizado por {n.tipoGrado === 'grado' ? 'grados' : 'semestres'} · evaluación por {n.nombrePeriodo.toLowerCase()}s
              </p>
            </header>
            <ul className="divide-y">
              {n.grados.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <span className="font-medium">{g.nombre}</span>
                  {g.grupos > 0 ? (
                    <span className="text-muted-foreground">
                      {g.grupos} {g.grupos === 1 ? 'grupo' : 'grupos'} · {g.materias} materias
                    </span>
                  ) : (
                    <Badge variant="neutral">Sin grupos este ciclo</Badge>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
