import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'

import { numero } from '@/lib/format'

const eje = { fontSize: 12, fill: 'var(--muted-foreground)' }

function TooltipTarjeta({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" />
          {p.name}: <span className="font-medium text-foreground tabular">{numero(Number(p.value))}</span>
        </p>
      ))}
    </div>
  )
}

function Leyenda({ elementos }: { elementos: { color: string; texto: string }[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
      {elementos.map((e) => (
        <li key={e.texto} className="flex items-center gap-2">
          <span className="size-3 rounded-sm" style={{ background: e.color }} aria-hidden="true" />
          {e.texto}
        </li>
      ))}
    </ul>
  )
}

/** Colegiaturas del mes por nivel: pagadas frente a sin pagar (barras apiladas). */
export function GraficaCobranza({ datos }: { datos: { nivel: string; pagados: number; sinPagar: number }[] }) {
  return (
    <figure>
      <Leyenda
        elementos={[
          { color: 'var(--chart-1)', texto: 'Pagadas' },
          { color: 'var(--chart-4)', texto: 'Sin pagar' },
        ]}
      />
      <div className="h-56" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis dataKey="nivel" tick={eje} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
            <YAxis tick={eje} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<TooltipTarjeta />} cursor={{ fill: 'var(--muted)', opacity: 0.6 }} />
            <Bar dataKey="pagados" name="Pagadas" stackId="a" fill="var(--chart-1)" stroke="var(--card)" strokeWidth={2} maxBarSize={56} />
            <Bar dataKey="sinPagar" name="Sin pagar" stackId="a" fill="var(--chart-4)" stroke="var(--card)" strokeWidth={2} radius={[4, 4, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Colegiaturas del mes por nivel</caption>
        <thead>
          <tr>
            <th scope="col">Nivel</th>
            <th scope="col">Pagadas</th>
            <th scope="col">Sin pagar</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((d) => (
            <tr key={d.nivel}>
              <th scope="row">{d.nivel}</th>
              <td>{d.pagados}</td>
              <td>{d.sinPagar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

/** Tareas vencidas sin entregar por grupo en el periodo en curso (barras horizontales). */
export function GraficaSinEntregar({ datos }: { datos: { grupo: string; sinEntregar: number }[] }) {
  return (
    <figure>
      <div style={{ height: datos.length * 34 + 16 }} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 8 }} barCategoryGap="30%">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="grupo" tick={eje} tickLine={false} axisLine={false} width={84} />
            <Tooltip content={<TooltipTarjeta />} cursor={{ fill: 'var(--muted)', opacity: 0.6 }} />
            <Bar dataKey="sinEntregar" name="Sin entregar" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={18}>
              <LabelList dataKey="sinEntregar" position="right" style={{ fontSize: 12, fill: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Tareas sin entregar por grupo</caption>
        <thead>
          <tr>
            <th scope="col">Grupo</th>
            <th scope="col">Tareas sin entregar</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((d) => (
            <tr key={d.grupo}>
              <th scope="row">{d.grupo}</th>
              <td>{d.sinEntregar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
