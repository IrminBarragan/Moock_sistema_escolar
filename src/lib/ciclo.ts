/** Meses del ciclo escolar 2026–2027 para filtros de cobranza. */
export const mesesCiclo = [
  '2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06',
].map((valor) => {
  const texto = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date(`${valor}-15T12:00:00`))
  return { valor, etiqueta: texto.charAt(0).toUpperCase() + texto.slice(1) }
})
