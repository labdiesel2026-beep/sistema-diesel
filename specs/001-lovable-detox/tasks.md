# Lista de Tareas: Lovable Detox y Reestructuración de Raíz

**Fase:** 1 — Detox y Reestructuración  
**Especificación:** [specs/001-lovable-detox/spec.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/001-lovable-detox/spec.md)  
**Plan Técnico:** [specs/001-lovable-detox/plan.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/001-lovable-detox/plan.md)  
**Estado:** Listo para Ejecución

> **Reglas de Ejecución:**
>
> - Conforme a la Regla #6 de [AGENTS.MD](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/AGENTS.MD), se ejecuta **estrictamente una sola tarea a la vez**.
> - Cada tarea debe estar completada y validada según su criterio **"Hecho cuando:"** antes de marcar su checkbox `[x]` y solicitar confirmación para la siguiente.
> - No se puede alterar el orden de dependencia preestablecido.

---

## Bloque 1: Preparación y Snapshot

- [x] **Tarea 1.1 — Snapshot y comprobación de estado de Git** `(RF-01, RF-02)`
  - **Objetivo:** Verificar que el árbol de trabajo se encuentre en un estado limpio y controlado antes de realizar cualquier movimiento de archivos en disco.
  - **Archivos:** N/A (Árbol de Git).
  - **Hecho cuando:** `git status --porcelain` no muestre modificaciones no controladas fuera del directorio `specs/`.

---

## Bloque 2: Extracción y Promoción a la Raíz

- [x] **Tarea 2.1 — Mover directorio de código fuente `src/` a la raíz** `(RF-01)`
  - **Objetivo:** Trasladar la totalidad del directorio `diesel-blue-spark-main/src/` hacia la raíz del repositorio (`./src/`).
  - **Archivos involucrados:** `diesel-blue-spark-main/src/` → `./src/`.
  - **Hecho cuando:** En PowerShell, `Test-Path ./src/components, ./src/routes, ./src/lib` devuelva `True` para todas las rutas.

- [x] **Tarea 2.2 — Mover directorio de assets estáticos `public/` a la raíz** `(RF-01)`
  - **Objetivo:** Trasladar el directorio `diesel-blue-spark-main/public/` hacia la raíz del repositorio (`./public/`).
  - **Archivos involucrados:** `diesel-blue-spark-main/public/` → `./public/`.
  - **Hecho cuando:** En PowerShell, `Test-Path ./public/favicon.svg, ./public/robots.txt` devuelva `True` para ambos archivos.

- [x] **Tarea 2.3 — Promover archivos de configuración base a la raíz** `(RF-01, RF-02)`
  - **Objetivo:** Mover los archivos de herramientas `tsconfig.json`, `components.json`, `eslint.config.js`, `vitest.config.ts`, `.prettierrc` y `.prettierignore` desde `diesel-blue-spark-main/` a la raíz, asegurando que `README.md` y `AGENTS.MD` de la raíz del usuario no sean tocados ni sobreescritos.
  - **Archivos involucrados:** `diesel-blue-spark-main/` (configs) → `./` (raíz).
  - **Hecho cuando:** En PowerShell, `Test-Path tsconfig.json, components.json, eslint.config.js, vitest.config.ts, .prettierrc, .prettierignore` devuelva `True` para cada uno y `git diff README.md AGENTS.MD` esté completamente vacío.

---

## Bloque 3: Saneamiento de Configuración y Tooling

- [x] **Tarea 3.1 — Promover, auditar y reescribir `.gitignore`** `(RF-01b, RF-02)`
  - **Objetivo:** Mover y sanear `.gitignore` en la raíz eliminando menciones a Wrangler/Cloudflare (`.wrangler/`, `.dev.vars`), agregando `.lovable/`, `src/routeTree.gen.ts`, `.env*` y artefactos de compilación, y certificando que `docs/` y `specs/` permanezcan versionados en Git.
  - **Archivos involucrados:** `.gitignore` (raíz).
  - **Hecho cuando:** `git check-ignore docs/ specs/` devuelva vacío (no ignorados) y `git check-ignore src/routeTree.gen.ts .lovable/ .env` confirme que están ignorados.

- [x] **Tarea 3.2 — Promover y sanear `package.json`** `(RF-04, RF-04b, RF-05, RF-08)`
  - **Objetivo:** Mover `package.json` a la raíz, renombrar el proyecto a `"laboratorio-diesel-mvp"`, fijar versión `"1.0.0"`, eliminar la clave `overrides` de `rolldown`, remover `@lovable.dev/vite-tanstack-config`, y agregar `@tanstack/router-generator`, `@tanstack/router-vite-plugin` y `@tanstack/devtools-vite` en `devDependencies`.
  - **Archivos involucrados:** `package.json` (raíz).
  - **Hecho cuando:** `node -e "const p = require('./package.json'); if (p.name === 'laboratorio-diesel-mvp' && !p.overrides && !p.devDependencies['@lovable.dev/vite-tanstack-config'] && p.devDependencies['@tanstack/router-vite-plugin']) process.exit(0); else process.exit(1);"` termine con código de salida 0.

- [x] **Tarea 3.3 — Promover y reescribir `vite.config.ts` sobre plugins nativos** `(RF-03)`
  - **Objetivo:** Mover `vite.config.ts` a la raíz y reescribirlo para descartar el wrapper `defineTanstackConfig` de Lovable, configurando los plugins canónicos de Vite (`TanStackRouterVite`, `@vitejs/plugin-react`, `tsconfigPaths`) y el alias `@/` apuntando a `./src`.
  - **Archivos involucrados:** `vite.config.ts` (raíz).
  - **Hecho cuando:** `grep -i "lovable" vite.config.ts` no arroje ninguna coincidencia (código 1 de grep).

- [x] **Tarea 3.4 — Crear plantilla de variables de entorno `.env.example`** `(RF-09)`
  - **Objetivo:** Generar el archivo `.env.example` en la raíz documentando las variables requeridas para el entorno de desarrollo local (puerto de servicio, etc.).
  - **Archivos involucrados:** `.env.example` (raíz).
  - **Hecho cuando:** En PowerShell, `Test-Path ./.env.example` devuelva `True`.

---

## Bloque 4: Purga de Telemetría en Código Fuente

- [x] **Tarea 4.1 — Eliminar módulos físicos de telemetría y tracking** `(RF-06, RF-07)`
  - **Objetivo:** Eliminar físicamente `src/lib/lovable-error-reporting.ts` y `src/lib/error-capture.ts`, verificando que los archivos funcionales y de mock (`src/lib/catalog-data.ts`, `src/lib/error-page.ts`, `src/lib/utils.ts`, `src/start.ts`) se preserven intactos.
  - **Archivos involucrados:** `src/lib/lovable-error-reporting.ts`, `src/lib/error-capture.ts`.
  - **Hecho cuando:** En PowerShell, `!(Test-Path src/lib/lovable-error-reporting.ts) -and !(Test-Path src/lib/error-capture.ts) -and (Test-Path src/lib/catalog-data.ts)` devuelva `True`.

- [x] **Tarea 4.2 — Desacoplar telemetría de `src/routes/__root.tsx`** `(RF-06, RF-06b)`
  - **Objetivo:** Remover el import y la invocación de `reportLovableError` en `src/routes/__root.tsx`, reemplazándolo por un manejo local estándar en consola/ErrorBoundary de React.
  - **Archivos involucrados:** `src/routes/__root.tsx`.
  - **Hecho cuando:** `grep -i "reportLovableError" src/routes/__root.tsx` no devuelva resultados.

- [x] **Tarea 4.3 — Desacoplar telemetría de `src/server.ts`** `(RF-06)`
  - **Objetivo:** Remover la importación de `./lib/error-capture` en `src/server.ts`.
  - **Archivos involucrados:** `src/server.ts`.
  - **Hecho cuando:** `grep -i "error-capture" src/server.ts` no devuelva resultados.

- [x] **Tarea 4.4 — Auditoría de componentes contra inyecciones ocultas** `(RNF-05)`
  - **Objetivo:** Inspeccionar todos los archivos dentro de `src/components/` para confirmar la ausencia de llamadas a APIs de tracking, beacons o scripts externos no declarados.
  - **Archivos involucrados:** `src/components/**/*`.
  - **Hecho cuando:** `grep -rEi "sendBeacon|XMLHttpRequest|new Image" src/components/` devuelva 0 resultados.

---

## Bloque 5: Purgado de Residuos y Erradicación del Contenedor

- [x] **Tarea 5.1 — Purgar archivos de Bun y metadatos de Lovable** `(RF-08, RF-11)`
  - **Objetivo:** Eliminar `bun.lock`, `bunfig.toml` y el directorio de configuración `.lovable/` en `diesel-blue-spark-main/` (o raíz si quedaron residuos).
  - **Archivos involucrados:** `bun.lock`, `bunfig.toml`, `.lovable/`.
  - **Hecho cuando:** En PowerShell, `!(Test-Path diesel-blue-spark-main/bun.lock) -and !(Test-Path diesel-blue-spark-main/bunfig.toml) -and !(Test-Path diesel-blue-spark-main/.lovable)` devuelva `True`.

- [x] **Tarea 5.2 — Descartar archivos duplicados y eliminar contenedor `diesel-blue-spark-main/`** `(RF-02, RF-10)`
  - **Objetivo:** Descartar los archivos residuales de Lovable (`README.md`, `AGENTS.md`, `roadmap.md`) y eliminar por completo la carpeta contenedora `diesel-blue-spark-main/`.
  - **Archivos involucrados:** Directorio `diesel-blue-spark-main/`.
  - **Hecho cuando:** En PowerShell, `Test-Path ./diesel-blue-spark-main` devuelva `False`.

---

## Bloque 6: Instalación, Compilación y Batería de Validación (DoD)

- [x] **Tarea 6.1 — Instalación limpia de dependencias con npm** `(RF-08)`
  - **Objetivo:** Instalar el árbol de dependencias resuelto en `package.json` mediante npm y generar el archivo `package-lock.json` oficial del proyecto.
  - **Comando:** `npm install`
  - **Hecho cuando:** `npm install` termine con código de salida 0 y en PowerShell `Test-Path ./package-lock.json` devuelva `True`.

- [x] **Tarea 6.2 — Validación de tipado estricto con TypeScript** `(RF-01, RF-03, RF-06)`
  - **Objetivo:** Ejecutar la comprobación estática de tipos en todo el proyecto asegurando que no existen tipos rotos ni imports huérfanos.
  - **Comando:** `npx tsc --noEmit`
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0.

- [x] **Tarea 6.3 — Verificación estática con Linter** `(RF-01)`
  - **Objetivo:** Correr ESLint para comprobar que el código en la raíz cumple las directivas de sintaxis y buenas prácticas sin errores.
  - **Comando:** `npm run lint`
  - **Hecho cuando:** `npm run lint` termine con código de salida 0.

- [x] **Tarea 6.4 — Ejecución de suite de pruebas unitarias** `(RF-07)`
  - **Objetivo:** Ejecutar la batería de tests existente con Vitest comprobando la funcionalidad de enrutamiento y catálogo (`catalog.test.ts`, `app-routing.test.tsx`).
  - **Comando:** `npm run test -- --run`
  - **Hecho cuando:** `npm run test -- --run` termine con código de salida 0 y todas las pruebas pasen en verde.

- [x] **Tarea 6.5 — Smoke Test de compilación de producción** `(RF-03, RF-04)`
  - **Objetivo:** Compilar la aplicación para verificar la integridad del bundle de producción sin errores de empaquetado.
  - **Comando:** `npm run build`
  - **Hecho cuando:** `npm run build` termine con código de salida 0 y genere los archivos compilados en la carpeta de distribución.

- [x] **Tarea 6.6 — Prueba del servidor de desarrollo y auto-generación de rutas** `(RF-01b, RF-03)`
  - **Objetivo:** Comprobar que el servidor de desarrollo local arranca correctamente y que el generador de TanStack actualiza `src/routeTree.gen.ts`.
  - **Comando:** Iniciar `npm run dev` y validar generación de rutas.
  - **Hecho cuando:** En PowerShell, `Test-Path ./src/routeTree.gen.ts` devuelva `True` y el servidor dev responda sin arrojar excepciones en consola.

- [x] **Tarea 6.7 — Auditoría final de cero residuos de Lovable** `(RF-05, RF-06, RF-10, RF-11)`
  - **Objetivo:** Búsqueda recursiva global en todos los archivos de código fuente, configuraciones y assets para certificar la erradicación total de referencias a Lovable.
  - **Comando:** `grep -ri "lovable" src/ public/ package.json vite.config.ts` (en `.gitignore` se conserva la regla preventiva `.lovable/` estipulada en RF-01b).
  - **Hecho cuando:** El comando `grep -ri "lovable" src/ public/ package.json vite.config.ts` devuelva exactamente 0 coincidencias (exit code 1).
