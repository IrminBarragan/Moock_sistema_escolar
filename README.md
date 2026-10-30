# Plataforma escolar — mock navegable

Prototipo **solo de frontend** con datos ficticios para presentar a la dirección de la escuela una plataforma propia que reemplaza a Google Classroom y suma control escolar, portal para padres y confirmación de pagos.

> No hay backend, autenticación real ni base de datos. Todo vive en el navegador.

## Ejecutar

Requisitos: Node 22 o superior y pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

Verificaciones:

```bash
pnpm lint                 # ESLint sin errores ni advertencias
pnpm exec tsc --noEmit    # tipos de src
pnpm build                # tipos de src y vite.config + compilación de producción
pnpm preview              # sirve la compilación de dist/
```

## Recorrido sugerido para la presentación

En la pantalla de inicio de sesión usa los **accesos rápidos "Entrar como…"**. Dentro de la app, el selector **"Ver como"** cambia de rol sin salir.

| Rol | Persona | Qué mostrar |
|---|---|---|
| Alumno | Valeria Domínguez · 2ºA secundaria | Inicio, una materia con material (video y vista previa de archivos), entregar y anular una tarea, calificaciones. Mejor en celular. |
| Padre o tutor | Mariana Treviño · mamá de Valeria y Emilio | Selector de hijo, resumen, calificaciones, tareas entregadas y estado de cuenta (Emilio tiene enero vencido). |
| Docente | Mtro. Andrés Villaseñor · Matemáticas y Física | Mis aulas, subir material, publicar aviso, crear tarea, revisar y calificar entregas, planilla del periodo. |
| Control escolar | Lic. Patricia Navarro | Panel, alumnos y expediente, importación desde Excel, grupos, asignación de docentes, confirmación de pagos, reportes y exportación. |
| Administrador del sistema | Ing. Jorge Medina | Ciclos, niveles, materias, periodos, periodicidad de cobro, usuarios y bitácora. |

También se puede entrar con el correo de cualquier usuario ficticio (están en *Usuarios y permisos*) y cualquier contraseña.

**Opciones de la demo** (menú de la cuenta, arriba a la derecha):

- Tema claro u oscuro.
- **Simular error de conexión**, para mostrar los estados de error.
- **Reiniciar demo**, que regresa todo a los datos iniciales.

Las acciones (entregar, calificar, confirmar pagos, publicar avisos, etc.) se guardan en `localStorage` y sobreviven a una recarga.

## Adaptarlo a la escuela

- **Marca:** `src/config/branding.ts` define el nombre, el lema, las iniciales, el logotipo y los colores.
  - Para usar un logotipo, coloca el archivo en `public/` y pon su ruta en `logo`.
  - Verifica que el color principal tenga contraste de al menos 4.5:1 sobre blanco.
- **Fecha de la demo:** `src/config/demo.ts`. Está fija en el 20/01/2027 para que los vencimientos se vean igual en cualquier presentación.

## Estructura

```
src/
  app/          rutas (carga diferida por pantalla), providers, guardias
  config/       marca, parámetros de la demo, roles y menús
  types/        tipos del dominio y de las respuestas de los servicios (vistas.ts)
  mocks/        generadores deterministas de datos ficticios (ciclo 2026–2027)
  services/     capa de datos simulada: promesas con retraso y errores tipo ProblemDetail
  lib/          formatos es-MX (fechas dd/mm/aaaa, MXN, calificaciones 0–10), utilidades
  hooks/        sesión, preferencias, debounce, media queries
  components/   ui (shadcn/ui), layout, shared (estados, encabezados, archivos)
  features/<módulo>/  aulas, tareas, calificaciones, familia, alumnos, grupos, pagos,
                      panel, reportes, configuracion, usuarios, bitacora, auth, inicio
```

Diseño y decisiones visuales: [`DESIGN.md`](DESIGN.md).

## Conectar la API real

Las pantallas solo conocen los servicios de `src/services/*.service.ts` y los tipos de `src/types/vistas.ts`. Para conectar el backend:

1. Reemplaza el cuerpo de cada función de servicio por una llamada HTTP que devuelva la misma forma.
   - Las listas ya usan la paginación de Spring Data (`page`, `size`, `totalElements`).
   - Los errores usan el formato ProblemDetail (`title`, `detail`, `status`).
2. Elimina `src/mocks`, `services/db.ts` y `services/http.ts`.
3. Sustituye la sesión simulada (`services/sesion.ts`) por la autenticación real: cookie httpOnly. El control de permisos real debe estar en el backend.

## Notas técnicas

- **TypeScript 7 y ESLint:** `typescript-eslint` aún no soporta la API de TS 7. El archivo `.pnpmfile.cjs` hace que las herramientas de lint usen la API de TypeScript 6 (`@typescript/typescript6`), mientras el proyecto compila con TS 7. Cuando `typescript-eslint` soporte TS 7, basta con borrar ese archivo y reinstalar.
- `eslint-plugin-jsx-a11y` 6.10.2 (última versión) declara compatibilidad hasta ESLint 9; funciona con ESLint 10, pero pnpm muestra una advertencia de *peer dependency*.
- **shadcn/ui:** los componentes de `src/components/ui` se escribieron siguiendo el código del CLI (estilo *new-york*), porque el registro no estaba accesible. `components.json` está listo para usar `pnpm dlx shadcn add` en el sistema real.
- **Exportar a Excel** genera un CSV con BOM UTF-8, que Excel abre directamente. La importación desde Excel es simulada: el archivo no se lee y se muestran filas de ejemplo.

## Fuera de alcance

Este prototipo no incluye, ni siquiera simulados: sitio público, admisiones en línea, pago en línea, facturación CFDI, exámenes con temporizador, clases en vivo ni app móvil nativa.
