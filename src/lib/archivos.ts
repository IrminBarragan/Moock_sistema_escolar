import type { TipoArchivo } from '@/types'

export const nombreTipoArchivo: Record<TipoArchivo, string> = {
  pdf: 'PDF',
  word: 'Word',
  excel: 'Excel',
  powerpoint: 'PowerPoint',
  imagen: 'Imagen',
  video: 'Video',
  otro: 'Archivo',
}

/** Deduce el tipo a partir de la extensión del archivo que eligió el usuario. */
export function tipoDeArchivo(nombre: string): TipoArchivo {
  const ext = nombre.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext)) return 'word'
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'excel'
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) return 'powerpoint'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'svg'].includes(ext)) return 'imagen'
  if (['mp4', 'mov', 'webm', 'm4v'].includes(ext)) return 'video'
  return 'otro'
}

/** Convierte los archivos elegidos en el formulario a su descripción (no se suben de verdad). */
export function describirArchivos(lista: FileList | null) {
  return Array.from(lista ?? []).map((f) => ({
    nombre: f.name,
    tipo: tipoDeArchivo(f.name),
    tamanoKb: Math.max(1, Math.round(f.size / 1024)),
  }))
}
