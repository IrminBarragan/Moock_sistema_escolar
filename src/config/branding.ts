/**
 * Identidad de la escuela. Cambia estos valores para presentar la demo
 * con el nombre, logotipo y colores de la institución.
 *
 * - `logo`: ruta a un SVG o PNG dentro de `public/` (por ejemplo `/logo-escuela.svg`).
 *   Si es `null`, se muestra el monograma generado con las iniciales.
 * - `colores`: el acento principal en modo claro y oscuro. Verifica que el
 *   color claro tenga contraste de al menos 4.5:1 sobre blanco y el oscuro
 *   sobre un fondo casi negro.
 */
export const branding = {
  nombre: 'Colegio Demo',
  nombreCorto: 'Colegio Demo',
  lema: 'Primaria · Secundaria · Preparatoria',
  iniciales: 'CD',
  logo: null as string | null,
  dominioCorreo: 'colegiodemo.example',
  colores: {
    primario: '#1f4e8c',
    primarioOscuro: '#8db4f0',
    /** Color secundario del logotipo; solo se usa en el monograma. */
    acentoLogo: '#c08a2b',
  },
} as const
