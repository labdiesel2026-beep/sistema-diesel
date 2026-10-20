# Spec 001 — Lovable Detox y Reestructuración

**Fase:** 1 de 4  
**Alcance:** Infraestructura y Developer Experience  
**Autores:** Equipo GEPI  
**Estado:** BORRADOR v2 — Revisión QA integrada  
**Documento de diseño:** Esta spec actúa formalmente como el SDD (Software Design Document) para esta fase de refactorización de infraestructura, en conformidad con la Constitución #1 (SDD-First). No se requiere un documento SDD separado.  
**Documentos de referencia:**

- [SRS.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/SRS.md)
- [constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md)
- [AGENTS.MD](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/AGENTS.MD)

---

## 1. Contexto y Objetivo

### 1.1 Situación Actual

El código fuente del proyecto Laboratorio Diésel fue generado inicialmente por **Lovable** (plataforma de generación de código AI). El resultado es un proyecto TanStack Start + Nitro (SSR) encapsulado dentro de la subcarpeta `diesel-blue-spark-main/`, lo que genera tres problemas estructurales:

1. **Raíz contaminada:** La raíz del repositorio no refleja la aplicación real. Todo el código vive en una subcarpeta anidada, rompiendo las convenciones estándar de monorepo y dificultando scripts de CI/CD, Docker, y configuración de editores.
2. **Telemetría y acoplamiento propietario:** Lovable inyectó archivos de error reporting que transmiten datos a su plataforma (`lovable-error-reporting.ts`, `error-capture.ts`), un directorio de configuración interna (`.lovable/`), y un paquete opaco (`@lovable.dev/vite-tanstack-config`) que encapsula toda la configuración de Vite/TanStack/Nitro sin documentar su contenido.
3. **Tooling inconsistente:** El proyecto usa Bun como package manager (`bun.lock`, `bunfig.toml`), mientras que el stack objetivo del SRS es Node.js + Express para el backend futuro.

### 1.2 Objetivo

Extraer el código útil a la raíz del repositorio, erradicar todo rastro del generador Lovable, desacoplar la configuración de Vite del paquete propietario reemplazándolo con plugins estándar, migrar de Bun a npm, y dejar el proyecto en un estado **compilable, testeable y verificable** — listo para recibir las fases de negocio (Landing, Catálogo, Admin) sin deuda técnica heredada.

### 1.3 Inventario de Contaminación Lovable (Hallazgos del Audit)

| Archivo / Directorio                 | Tipo                                                          | Acción                                                                                                                                 |
| :----------------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| `.lovable/project.json`              | Config interna Lovable                                        | **Eliminar**                                                                                                                           |
| `src/lib/lovable-error-reporting.ts` | Telemetría a `window.__lovableEvents`                         | **Eliminar**                                                                                                                           |
| `src/lib/error-capture.ts`           | Monkey-patch de `console.error` + captura global              | **Eliminar** (utilidad `describeError()` descartada intencionalmente; se implementará logging estructurado con Pino/Winston en Fase 4) |
| `src/routes/__root.tsx` (L14, L43)   | Importa y llama a `reportLovableError`                        | **Refactorizar**                                                                                                                       |
| `src/server.ts` (L1, L3)             | Importa `consumeLastCapturedError` de `error-capture.ts`      | **Refactorizar**                                                                                                                       |
| `vite.config.ts`                     | Importa `defineConfig` de `@lovable.dev/vite-tanstack-config` | **Reescribir**                                                                                                                         |
| `package.json` → devDeps             | `@lovable.dev/vite-tanstack-config: "2.25.3"`                 | **Eliminar dep**                                                                                                                       |
| `package.json` → name                | `"tanstack_start_ts"` (nombre genérico de template)           | **Renombrar** a `"laboratorio-diesel-mvp"`                                                                                             |
| `package.json` → overrides           | `{ "rolldown": "1.2.1" }` (fijación propietaria)              | **Eliminar**                                                                                                                           |
| `AGENTS.md` (interno)                | Marcadores `<!-- LOVABLE:BEGIN -->` / `<!-- LOVABLE:END -->`  | **Descartar** (no se promueve)                                                                                                         |
| `README.md` (interno)                | Referencias a Lovable editor y sync                           | **Descartar** (no se promueve)                                                                                                         |
| `roadmap.md`                         | Roadmap generado por Lovable                                  | **Descartar**                                                                                                                          |
| `bun.lock`                           | Lockfile de Bun                                               | **Eliminar**                                                                                                                           |
| `bunfig.toml`                        | Configuración de Bun                                          | **Eliminar**                                                                                                                           |

### 1.4 Diferimientos Explícitos (Decisiones Arquitectónicas)

Las siguientes reglas de la Constitución y AGENTS.MD **no se implementan en esta fase** por decisión del Tech Lead:

| Regla                                                                | Diferida a               | Justificación                                                                                                                               |
| :------------------------------------------------------------------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| Constitución #6 — Errores Opacos (`{ error: "Referencia: <uuid>" }`) | Fase 4 (Backend + Admin) | Esta fase solo remueve wrappers propietarios. El manejo estricto de errores HTTP con UUID se implementará cuando exista el backend Express. |
| AGENTS.MD #3 — Crash early con Zod para `process.env`                | Fase 4 (Backend)         | Al ser frontend puro con SSR, no hay variables de entorno críticas en esta fase. Se creará un `.env.example` como placeholder.              |
| Logging estructurado (Pino/Winston reemplazando `describeError()`)   | Fase 4 (Backend)         | En esta fase, `console.error` estándar es suficiente.                                                                                       |

---

## 2. Historias de Usuario

> Enfocadas en Developer Experience (DX) y Arquitectura Limpia. No hay historias de usuario final en esta fase.

**HU-01:** Como desarrollador, quiero que el código fuente viva en la raíz del repositorio para que `npm run dev` funcione sin navegar a subcarpetas y las herramientas (ESLint, TypeScript, Docker) encuentren la configuración en la ubicación esperada.

**HU-02:** Como desarrollador, quiero que no exista ningún archivo que transmita telemetría a terceros para tener certeza de que ningún dato del proyecto sale del entorno controlado (Principio constitucional #6 — Errores Opacos).

**HU-03:** Como desarrollador, quiero que la configuración de Vite use exclusivamente plugins estándar y documentados públicamente para poder entender, depurar y extender el pipeline de build sin reverse-engineering de paquetes opacos.

**HU-04:** Como desarrollador, quiero que el package manager sea npm para que sea coherente con el stack Node.js/Express definido en el SRS y no obligue al equipo a instalar un runtime adicional.

**HU-05:** Como desarrollador, quiero que el proyecto pase `npm run dev`, `npm run build`, `npm run test`, `tsc --noEmit` y `npm run lint` sin errores tras la reestructuración, para tener garantía de que no se introdujeron regresiones.

---

## 3. Requisitos Funcionales

### RF-01 — Promoción de código fuente a la raíz

**CUANDO** se ejecute la reestructuración, el sistema deberá mover las siguientes carpetas y archivos desde `diesel-blue-spark-main/` hacia la raíz del repositorio:

- **Carpetas:** `src/`, `public/`
- **Archivos de configuración:** `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `components.json`

**Criterios de aceptación:**

- `src/`, `public/` y todos los archivos listados son hijos directos de la raíz del repositorio.
- Las carpetas `docs/` y `specs/` pre-existentes en la raíz permanecen intactas.
- El `routeTree.gen.ts` se regenera automáticamente al ejecutar `npm run dev` y está excluido de Git (ver RF-01b).

---

### RF-01b — Auditoría y reescritura de `.gitignore`

**CUANDO** se promueva `.gitignore` a la raíz, el sistema deberá auditarlo y modificarlo para:

1. **Eliminar** entradas de Wrangler/Cloudflare: `.wrangler/`, `.dev.vars`.
2. **Agregar / Asegurar** las siguientes entradas:
   - `routeTree.gen.ts` (auto-generado por TanStack Router)
   - `.lovable/` (directorio de configuración del generador)
   - `.env`, `.env*.local` (variables locales)
   - `.vite/`, `dist/`, `.output/`, `.vinxi/`, `.nitro/` (artefactos de compilación)
3. **Conservar** entradas relevantes: `node_modules/`, `*.local`, editor ignores.
4. **Garantizar que NO se ignoren:** Las carpetas `docs/` y `specs/` DEBEN versionarse en Git obligatoriamente como la columna vertebral de conocimiento del proyecto.

**Criterios de aceptación:**

- `.gitignore` no contiene referencias a Wrangler ni Cloudflare.
- `routeTree.gen.ts` y `.lovable/` están listados en `.gitignore`.
- `docs/` y `specs/` NO están en `.gitignore` y permanecen versionados.
- `package-lock.json` **no** está en `.gitignore` (debe versionarse).

---

### RF-02 — Resolución de conflictos de archivos raíz

**CUANDO** exista un archivo en la raíz del repositorio con el mismo nombre que uno dentro de `diesel-blue-spark-main/` (casos conocidos: `README.md`, `AGENTS.MD`), el sistema deberá conservar exclusivamente la versión de la raíz, descartando la de Lovable sin migración de contenido.

**Criterios de aceptación:**

- El contenido de `README.md` y `AGENTS.MD` en la raíz es idéntico al que existía antes de la reestructuración.
- No existen archivos `AGENTS.md` (Lovable), `README.md` (Lovable) ni `roadmap.md` (Lovable) residuales en ninguna ubicación del repositorio.

---

### RF-03 — Eliminación del directorio `.lovable/`

El sistema deberá eliminar permanentemente el directorio `.lovable/` y todo su contenido (`project.json`).

**Criterios de aceptación:**

- El directorio `.lovable/` no existe en ninguna ubicación del repositorio.
- Ningún archivo del proyecto contiene una referencia de importación o ruta hacia `.lovable/`.

---

### RF-04 — Eliminación de archivos de telemetría

El sistema deberá eliminar permanentemente los siguientes archivos de telemetría del generador:

1. `src/lib/lovable-error-reporting.ts` — Reporter que transmite errores a `window.__lovableEvents` y `window.__lovableReportRuntimeError`.
2. `src/lib/error-capture.ts` — Módulo que hace monkey-patch de `console.error` y captura errores globales. **Nota:** La función utilitaria `describeError()` contenida en este archivo se descarta intencionalmente en esta fase. El logging estructurado con expansión de cause-chains se implementará en la Fase 4 con Pino/Winston.

**Criterios de aceptación:**

- Ninguno de los dos archivos existe en el repositorio.
- `grep -ri "lovable" src/` devuelve cero resultados.
- `grep -ri "error-capture" src/` devuelve cero resultados (excluyendo este documento de spec).

---

### RF-05 — Refactorización de `__root.tsx` (Error Boundary limpio)

**CUANDO** se eliminen los archivos de telemetría (RF-04), el sistema deberá refactorizar `src/routes/__root.tsx` para:

1. Eliminar la importación `import { reportLovableError } from "../lib/lovable-error-reporting"` (línea 14).
2. Eliminar la llamada `reportLovableError(error, { boundary: "tanstack_root_error_component" })` dentro del `useEffect` del `ErrorComponent` (línea 43).
3. Conservar el `useEffect` con un `console.error(error)` estándar como reemplazo.
4. Conservar intactos: el componente `NotFoundComponent`, el `RootShell`, el `RootComponent`, la metadata SEO, y las Google Fonts.

**Criterios de aceptación:**

- El `ErrorComponent` no referencia ningún módulo de Lovable.
- Los errores de renderizado se registran en la consola del navegador vía `console.error`.
- La página de error mantiene su funcionalidad de "Try again" y "Go home".

---

### RF-06 — Refactorización de `server.ts` (desacoplamiento de error-capture)

**CUANDO** se elimine `error-capture.ts` (RF-04), el sistema deberá refactorizar `src/server.ts` para:

1. Eliminar `import "./lib/error-capture"` (línea 1 — side-effect import).
2. Eliminar `import { consumeLastCapturedError } from "./lib/error-capture"` (línea 3).
3. En la función `normalizeCatastrophicSsrResponse`, reemplazar la línea que usa `consumeLastCapturedError()` por un `console.error` directo del body parseado del error h3 (ej. `console.error(new Error(\`h3 swallowed SSR error: ${body}\`))`).
4. Conservar intacta la lógica de detección de errores h3 swallowed (`isH3SwallowedErrorBody`) y el renderizado de `error-page.ts`.

**Criterios de aceptación:**

- `server.ts` no importa ni referencia `error-capture.ts`.
- Los errores SSR catastróficos siguen siendo interceptados y renderizan la página de error estática.
- Los errores se registran en `console.error` del servidor.
- `start.ts` sigue funcionando sin modificaciones (comparte dependencia con `error-page.ts`, que permanece intacto).

---

### RF-07 — Conservación de archivos limpios

El sistema deberá conservar los siguientes archivos sin modificaciones funcionales, tras verificar que no contienen tracking de Lovable:

1. `src/lib/error-page.ts` — Renderiza HTML estático de error para SSR. No contiene telemetría.
2. `src/start.ts` — Middleware de errores y CSRF de TanStack Start. Importa `error-page.ts` (limpio).
3. `src/lib/catalog-data.ts` — Datos mock hardcodeados (4 productos). **Se conservan intencionalmente** porque las Fases 2 y 3 dependen de ellos para maquetar la UI.
4. `src/lib/utils.ts` — Utilidad `cn()` de shadcn/ui. Estándar.

**Criterios de aceptación:**

- Los cuatro archivos existen en la raíz del proyecto bajo `src/`.
- `start.ts` conserva el `errorMiddleware` y el `csrfMiddleware` funcionales.
- `error-page.ts` sigue exportando `renderErrorPage()`.
- `catalog-data.ts` conserva los 4 productos mock y las funciones `formatPrice` y `filterProducts`.

---

### RF-08 — Reescritura de `vite.config.ts` con plugins estándar

El sistema deberá reescribir `vite.config.ts` reemplazando la importación propietaria `@lovable.dev/vite-tanstack-config` con plugins estándar equivalentes:

| Funcionalidad requerida       | Plugin estándar                                                            |
| :---------------------------- | :------------------------------------------------------------------------- |
| TanStack Start integration    | `@tanstack/react-start/plugin` (o API pública de TanStack Start para Vite) |
| React transform               | `@vitejs/plugin-react`                                                     |
| Tailwind CSS v4               | `@tailwindcss/vite`                                                        |
| tsconfig paths (`@/` alias)   | `vite-tsconfig-paths`                                                      |
| TanStack Devtools (dev-only)  | `@tanstack/devtools-vite`                                                  |
| File-based routing generation | `@tanstack/router-vite-plugin` + `@tanstack/router-generator`              |
| Server entry override         | `tanstackStart({ server: { entry: "server" } })` (o equivalente)           |

**Funcionalidades del paquete Lovable descartadas intencionalmente:**

| Funcionalidad propietaria                | Decisión                                                                                       |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------- |
| React/TanStack dedupe                    | **Descartada** — Vite resuelve deduplicación nativamente.                                      |
| `VITE_*` env injection personalizada     | **Descartada** — Se usa el comportamiento nativo de Vite para `import.meta.env`.               |
| Sandbox detection (port/host/strictPort) | **Descartada** — Configuración específica del editor Lovable, irrelevante en desarrollo local. |
| Error logger plugins propietarios        | **Descartada** — Reemplazada por `console.error` estándar.                                     |

**Criterios de aceptación:**

- `vite.config.ts` no contiene ninguna referencia a `@lovable.dev`.
- `npm run dev` levanta el servidor de desarrollo con hot reload funcional.
- `npm run build` produce un bundle SSR sin errores.
- El file-based routing de TanStack Router genera `routeTree.gen.ts` automáticamente al iniciar dev.

---

### RF-09 — Limpieza y actualización de `package.json`

El sistema deberá modificar `package.json` para:

1. Renombrar `"name"` de `"tanstack_start_ts"` a `"laboratorio-diesel-mvp"`.
2. Establecer `"version"` en `"1.0.0"`.
3. Eliminar `@lovable.dev/vite-tanstack-config` de `devDependencies`.
4. Eliminar la sección `"overrides": { "rolldown": "1.2.1" }` completa.
5. Agregar como `devDependencies` explícitas los plugins que antes venían empaquetados:
   - `@tanstack/router-generator` (dependencia fantasma que llegaba transitivamente vía Lovable)
   - `@tanstack/router-vite-plugin` (integración de file-based routing con Vite)
   - `@tanstack/devtools-vite` (devtools para debug en Fases 2 y 3)
6. Conservar todas las `dependencies` de producción intactas (Radix, TanStack, Zod, Tailwind, shadcn/ui, etc.).

**Criterios de aceptación:**

- `grep "lovable" package.json` devuelve cero resultados.
- `"name"` es `"laboratorio-diesel-mvp"` y `"version"` es `"1.0.0"`.
- No existe la sección `"overrides"`.
- `@tanstack/router-generator`, `@tanstack/router-vite-plugin` y `@tanstack/devtools-vite` están listados en `devDependencies`.
- Todas las dependencias de producción del `package.json` original siguen presentes.
- `npm install` ejecuta sin errores ni warnings de peer dependencies no resueltos.

---

### RF-10 — Migración de Bun a npm

El sistema deberá:

1. Eliminar `bun.lock` y `bunfig.toml`.
2. Generar `package-lock.json` mediante `npm install`.

**Criterios de aceptación:**

- No existen `bun.lock` ni `bunfig.toml` en el repositorio.
- Existe un `package-lock.json` válido en la raíz.
- `npm install` ejecuta limpiamente sin errores.

---

### RF-11 — Creación de `.env.example`

El sistema deberá crear un archivo `.env.example` en la raíz del repositorio como placeholder para las variables de entorno que se definirán en fases posteriores.

**Contenido mínimo:**

```env
# Variables de entorno — Laboratorio Diésel MVP
# Copiar este archivo como .env y completar los valores.
# La validación estricta con Zod se implementará en la Fase 4 (Backend).

# VITE_API_URL=http://localhost:3001
```

**Criterios de aceptación:**

- El archivo `.env.example` existe en la raíz del repositorio.
- `.env` está listado en `.gitignore` (no se versiona el archivo real).

---

### RF-12 — Auditoría de seguridad de componentes shadcn/ui

El sistema deberá auditar el directorio `src/components/ui/` (46 archivos) y `src/components/` (5 archivos) en busca de tracking oculto o comunicación con dominios externos que Lovable pudiera haber inyectado.

**Criterios de aceptación:**

- `grep -rEi "(fetch|XMLHttpRequest|navigator\.sendBeacon|new Image)" src/components/` devuelve cero resultados sospechosos (excluyendo usos legítimos documentados).
- `grep -rEi "lovable|lovable\.dev|sentry|analytics|telemetry|tracking" src/components/` devuelve cero resultados.
- Si se detecta tracking, el archivo afectado se limpia en esta spec antes de marcar la tarea como completa.

---

### RF-13 — Verificación de alias en `vitest.config.ts`

**CUANDO** se promueva `vitest.config.ts` a la raíz, el sistema deberá verificar que el alias `@/` siga resolviendo correctamente a `./src/` desde la nueva ubicación.

**Contexto técnico:** El archivo usa `path.resolve(__dirname, "./src")` para resolver el alias. Dado que `__dirname` apuntará a la nueva raíz (un nivel arriba de antes), y `src/` sigue siendo hijo directo de la raíz, la resolución **debería** ser correcta sin cambios. Verificar empíricamente.

**Criterios de aceptación:**

- `npm run test` ejecuta sin errores de resolución de módulos.
- Los tests existentes (`app-routing.test.tsx`, `catalog.test.ts`) pasan. Si se rompen por el movimiento de carpetas, deben corregirse en esta spec.

---

### RF-14 — Eliminación de la carpeta contenedora

**CUANDO** se hayan completado todos los requisitos anteriores (RF-01 a RF-13), el sistema deberá eliminar permanentemente el directorio `diesel-blue-spark-main/` y todo su contenido residual.

**Criterios de aceptación:**

- El directorio `diesel-blue-spark-main/` no existe en el repositorio.
- Ningún archivo del proyecto contiene una referencia a `diesel-blue-spark-main`.

---

## 4. Requisitos No Funcionales

| ID         | Categoría              | Requisito                                                                                                                                                               |
| :--------- | :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RNF-01** | Integridad de stack    | TanStack Start, TanStack Router, React 19, Tailwind CSS v4 y shadcn/ui (Radix) deben conservarse funcionales tras la reestructuración.                                  |
| **RNF-02** | Alias de rutas         | El alias `@/*` → `./src/*` definido en `tsconfig.json`, `components.json` y `vitest.config.ts` debe seguir resolviendo correctamente tras mover los archivos a la raíz. |
| **RNF-03** | Zero telemetría        | Tras la purga, ningún código del repositorio debe transmitir datos a dominios externos no explícitamente autorizados. Esto incluye componentes UI (RF-12).              |
| **RNF-04** | Reproducibilidad       | Un desarrollador debe poder clonar el repo, ejecutar `npm install` y `npm run dev`, y tener el proyecto corriendo sin pasos manuales adicionales.                       |
| **RNF-05** | Datos mock preservados | Los datos mock de `catalog-data.ts` deben permanecer intactos para servir como fixture de maquetación en las Fases 2 y 3.                                               |

---

## 5. Casos Límite

| #     | Caso                                                                        | Mitigación                                                                                                                                                                                                                        |
| :---- | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CL-01 | `routeTree.gen.ts` queda desactualizado tras mover `src/routes/`            | El plugin de TanStack Router (`@tanstack/router-vite-plugin`) lo regenera automáticamente al ejecutar `npm run dev`. Se agrega a `.gitignore` (RF-01b).                                                                           |
| CL-02 | Imports con rutas relativas rotas al promover (`../lib/`, `../components/`) | Las rutas relativas internas a `src/` no cambian porque la estructura interna se preserva íntegra. Solo cambia el padre de `src/`. Verificar con `tsc --noEmit`.                                                                  |
| CL-03 | `components.json` (shadcn) contiene paths relativos (`src/styles.css`)      | El path es relativo al project root. Al promover `components.json` a la nueva raíz, la relación con `src/styles.css` se preserva porque `src/` también se promueve al mismo nivel.                                                |
| CL-04 | Dependencias peer del paquete Lovable removido dejan de satisfacerse        | Se agregan las dependencias que antes eran transitivas como devDeps explícitas (RF-09): `@tanstack/router-generator`, `@tanstack/router-vite-plugin`, `@tanstack/devtools-vite`. Verificar con `npm ls`.                          |
| CL-05 | `error-page.ts` tiene textos en inglés ("This page didn't load")            | Fuera de alcance de esta spec. Se localizará a español en la Fase 2 (Landing).                                                                                                                                                    |
| CL-06 | Tests rotos tras el movimiento de carpetas                                  | Si `npm run test` falla, los tests deben corregirse dentro de esta misma spec (RF-13). No es aceptable diferir tests rotos.                                                                                                       |
| CL-07 | `vitest.config.ts` usa `__dirname` para resolver alias `@/`                 | `__dirname` apunta al directorio del archivo. Al mover `vitest.config.ts` a la raíz con `src/` como hijo directo, `path.resolve(__dirname, "./src")` sigue resolviendo correctamente. Verificar empíricamente con `npm run test`. |

---

## 6. Fuera de Alcance

Los siguientes ítems **NO** forman parte de esta especificación:

- ❌ Implementación de lógica de negocio (catálogo, carrito, admin, búsqueda).
- ❌ Configuración de base de datos (PostgreSQL, Prisma).
- ❌ Setup del backend Node.js/Express (viene en specs posteriores).
- ❌ Cambios visuales o de UI en los componentes existentes.
- ❌ Remoción de Tailwind CSS o shadcn/ui (no son propietarios de Lovable).
- ❌ Localización de textos a español (Fase 2).
- ❌ Configuración de CI/CD, Docker o dominio de producción.
- ❌ Creación de la cuenta de admin semilla o variables de entorno de producción.
- ❌ Implementación de errores opacos con UUID (Constitución #6 — diferido a Fase 4, ver §1.4).
- ❌ Validación de `process.env` con Zod en arranque (AGENTS.MD #3 — diferido a Fase 4, ver §1.4).
- ❌ Logging estructurado con Pino/Winston (diferido a Fase 4, ver §1.4).
- ❌ Generación de `plan.md` o `tasks.md` (se generan como paso siguiente tras aprobación de esta spec).

---

## 7. Criterios de Finalización (Definition of Done)

La Fase 1 se considera **completada** cuando se cumplen **todos** los siguientes checks:

| #     | Check                                 | Comando de verificación                                                                                                                   |
| :---- | :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ 1  | `npm install` ejecuta sin errores     | `npm install`                                                                                                                             |
| ✅ 2  | Servidor de desarrollo levanta        | `npm run dev` → responde en `localhost`                                                                                                   |
| ✅ 3  | Rutas existentes renderizan sin crash | Navegar a `/`, `/catalogo`, `/admin` en el navegador                                                                                      |
| ✅ 4  | Build de producción compila           | `npm run build` → exit code 0                                                                                                             |
| ✅ 5  | TypeScript sin errores de tipos       | `npx tsc --noEmit` → exit code 0                                                                                                          |
| ✅ 6  | Lint sin warnings críticos            | `npm run lint` → exit code 0                                                                                                              |
| ✅ 7  | Tests pasan                           | `npm run test` → exit code 0                                                                                                              |
| ✅ 8  | Cero referencias textuales a Lovable  | `grep -ri "lovable" . --include="*.ts" --include="*.tsx" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git` → 0 resultados |
| ✅ 9  | Cero tracking oculto en componentes   | `grep -rEi "fetch\|XMLHttpRequest\|sendBeacon\|new Image" src/components/` → 0 sospechosos                                                |
| ✅ 10 | Carpeta contenedora eliminada         | `diesel-blue-spark-main/` no existe                                                                                                       |
| ✅ 11 | Archivos Bun eliminados               | `bun.lock` y `bunfig.toml` no existen                                                                                                     |
| ✅ 12 | `.env.example` existe                 | Archivo presente en la raíz                                                                                                               |
| ✅ 13 | `package.json` limpio                 | `name` = `"laboratorio-diesel-mvp"`, sin `overrides`, sin deps de Lovable                                                                 |

---

## 8. Dudas Abiertas

| #     | Duda                                                                 | Estado                                                                                                                                                              |
| :---- | :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DA-01 | `.gitignore`: ¿Deben versionarse los directorios `specs/` y `docs/`? | **[RESUELTO]** — Ambos directorios (`docs/`, `specs/`) DEBEN versionarse en Git como columna vertebral de conocimiento del proyecto. NO se agregan al `.gitignore`. |
