/**
 * "Exportar a Excel" de la demo: genera un CSV que Excel abre directamente.
 * Se antepone la marca BOM para que Excel respete los acentos (UTF-8).
 */
export function exportarCsv(nombreArchivo: string, encabezados: string[], filas: (string | number | null)[][]) {
  const celda = (v: string | number | null) => {
    const texto = v === null ? '' : String(v)
    return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
  }
  const contenido = [encabezados, ...filas].map((f) => f.map(celda).join(',')).join('\r\n')
  const blob = new Blob(['﻿', contenido], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `${nombreArchivo}.csv`
  enlace.click()
  URL.revokeObjectURL(url)
}
