# DESIGN.md — Plataforma escolar (mock navegable)

## Brief
- **Usuarios:** alumnos y familias (sobre todo en celular), docentes y control escolar (sobre todo en computadora), administrador del sistema.
- **Tareas más frecuentes:** el alumno entrega tareas y consulta calificaciones; el docente publica material y califica; control escolar confirma pagos y consulta expedientes.
- **Carácter:** institucional, sereno y preciso. Contenido primero; una acción principal por pantalla.

## Tokens (src/index.css)
- Acento único de marca `--brand-primary` (claro) / `--brand-primary-dark` (oscuro), inyectado desde `src/config/branding.ts`.
- Neutros fríos en OKLCH; estados con pareja *fondo suave + texto fuerte*: `success`, `warning`, `danger`, `info`, `neutral`.
- **Elemento distintivo:** cada materia tiene color e ícono propios (`--materia-*`, `MateriaIcono`), y se repiten en tarjetas, listas, avisos y encabezados.
- Tipografía del sistema, cuerpo de 16 px, cifras tabulares en tablas. Radios: 6/8/10/14 px. Movimiento: 150–300 ms; se respeta `prefers-reduced-motion`.
- Modo claro y oscuro (clase `.dark`, por defecto según el sistema).

## Componentes
- `components/ui`: base de shadcn/ui (estilo *new-york*, escritos a mano con el mismo código del CLI).
- `components/layout`: `AppShell` (barra lateral en escritorio; barra inferior en móvil para alumno y padre; menú lateral para los demás roles), `RoleSwitcher`, `DemoMenu` (tema, simular error y reiniciar la demo), `PrototypeBanner` (franja fija).
- `components/shared`: `PageHeader`, `Consulta` (carga, error, vacío y contenido), `EmptyState`, `ErrorState`, `MateriaIcono`, `ArchivoFila`, `VistaPreviaArchivo` (PDF, Word, Excel, PowerPoint, imagen y video simulados).

## Decisiones
- **Fecha fija de la demo (20/01/2027)** en `src/config/demo.ts`, para que los vencimientos se vean igual en cualquier presentación.
- **Datos** generados con semilla fija (`src/mocks`). En `localStorage` solo se guardan los cambios, así que "Reiniciar demo" solo tiene que borrarlos.
- **Servicios** (`src/services`) con latencia simulada y errores con forma de ProblemDetail; las pantallas solo conocen los tipos de `src/types/vistas.ts`.
- **TanStack Query** para el caché y los estados. Cada acción invalida las vistas académicas relacionadas (`lib/consultas.ts`).
- Fechas `dd/mm/aaaa`, moneda MXN y calificaciones de 0 a 10 con un decimal (`lib/format.ts`).
