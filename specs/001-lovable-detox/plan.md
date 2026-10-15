# Plan Técnico de Implementación: Lovable Detox y Reestructuración de Raíz

**Fase:** 1 — Detox y Reestructuración  
**Especificación:** [specs/001-lovable-detox/spec.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/001-lovable-detox/spec.md)  
**Marco de Referencia:** [docs/constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md) y [AGENTS.MD](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/AGENTS.MD)  
**Estado:** Aprobado para Ejecución  

---

## 1. Topología de Directorios Objetivo `(RF-01, RF-02, RF-07, RF-10, RF-11)`

Tras la extracción de componentes funcionales, la purga de telemetría y la eliminación física de `diesel-blue-spark-main/` y `.lovable/`, la raíz del repositorio presentará la siguiente arquitectura limpia y unificada:

```
f:\INGENIERIA\GEPI\InyectoresDiesel\
├── .git/                                # Control de versiones Git
├── .gitignore                           # Exclusiones auditadas sin Wrangler (RF-01b)
├── .prettierrc                          # Configuración de formateo
├── .prettierignore                      # Exclusiones de formateo
├── .env.example                         # Plantilla de variables de entorno (RF-09)
├── AGENTS.MD                            # Reglas operativas y constitución del agente (Autoridad Usuario) (RF-02)
├── README.md                            # Documentación principal del repositorio (Autoridad Usuario) (RF-02)
├── components.json                      # Configuración de shadcn/ui
├── eslint.config.js                     # Reglas de linting
├── package.json                         # Configuración limpia npm (sin @lovable ni overrides) (RF-04, RF-04b, RF-05, RF-08)
├── package-lock.json                    # Lockfile estándar de npm (RF-08)
├── tsconfig.json                        # Configuración de TypeScript con alias @/*
├── vite.config.ts                       # Configuración nativa Vite + TanStack Start (RF-03)
├── vitest.config.ts                     # Configuración de pruebas unitarias
├── docs/                                # Documentación de arquitectura y negocio (Versionada) (RF-01b)
│   ├── SRS.md                           # Requerimientos de software
│   ├── SystemDescription.md             # Descripción general del sistema
│   └── constitution.md                  # Constitución innegociable del proyecto
├── specs/                               # Especificaciones SDD por fase (Versionada) (RF-01b)
│   └── 001-lovable-detox/
│       ├── spec.md                      # Especificación funcional aprobada
│       ├── plan.md                      # Este plan de implementación
│       └── tasks.md                     # Checklist atómico de tareas
├── public/                              # Assets estáticos servidos directamente (RF-01)
│   ├── favicon.svg
│   └── robots.txt
└── src/                                 # Código fuente desintoxicado (RF-01)
    ├── assets/
    │   └── diesel-injector.jpg          # Asset demostrativo de catálogo
    ├── components/                      # Componentes desacoplados de tracking (RNF-05)
    │   ├── AppHeader.tsx
    │   ├── HeroBanner.tsx
    │   ├── InjectorCard.tsx
    │   ├── QuickContact.tsx
    │   ├── WhatsAppButton.tsx
    │   └── ui/                          # Componentes shadcn/ui (46 primitivas Radix)
    ├── hooks/
    │   └── use-mobile.tsx
    ├── lib/
    │   ├── catalog-data.ts              # Mock data de inyectores retenida para UI (RF-07)
    │   ├── error-page.ts                # Componente visual genérico para HTTP 404/500 (RF-07)
    │   └── utils.ts                     # Funciones utilitarias (cn para Tailwind)
    │   # [PURGADO] lovable-error-reporting.ts (RF-06)
    │   # [PURGADO] error-capture.ts (RF-06)
    ├── routes/                          # Enrutamiento basado en archivos (TanStack Router)
    │   ├── __root.tsx                   # Root layout desvinculado de telemetría (RF-06, RF-06b)
    │   ├── admin.dashboard.tsx
    │   ├── admin.index.tsx
    │   ├── admin.iniciar-sesion.tsx
    │   ├── catalogo.tsx
    │   ├── index.tsx
    │   └── servicios.tsx
    ├── test/                            # Suite de pruebas unitarias
    │   ├── app-routing.test.tsx
    │   ├── catalog.test.ts
    │   └── setup.ts
    ├── router.tsx                       # Fábrica de instancia del Router
    ├── routeTree.gen.ts                 # Árbol de rutas auto-generado (en .gitignore) (RF-01b)
    ├── server.ts                        # Servidor TanStack Start purgado de tracking (RF-06)
    ├── start.ts                         # Entry client handler para TanStack Start (RF-07)
    └── styles.css                       # Directivas Tailwind CSS
```

---

## 2. Contrato de Configuración

### 2.1. `package.json` — Estructura Canónica `(RF-04, RF-04b, RF-05, RF-08)`

Se eliminan por completo las dependencias y referencias de Lovable, los overrides problemáticos de `rolldown`, los lockfiles de Bun, y se agregan las herramientas oficiales de generación de rutas requeridas por TanStack Start.

```json
{
  "name": "laboratorio-diesel-mvp",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "vite preview",
    "test": "vitest",
    "lint": "eslint ."
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@tanstack/react-query": "^5.56.2",
    "@tanstack/react-router": "^1.75.0",
    "@tanstack/start": "^1.76.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.3.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-resizable-panels": "^2.1.3",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "vinxi": "^0.5.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "@tanstack/devtools-vite": "^1.76.0",
    "@tanstack/router-generator": "^1.76.0",
    "@tanstack/router-vite-plugin": "^1.76.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.9",
    "globals": "^15.9.0",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.11",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.0.1",
    "vite": "^5.4.14",
    "vite-tsconfig-paths": "^5.0.1",
    "vitest": "^2.0.5"
  }
}
```

*Nota sobre purga en dependencias:*
- Se elimina `@lovable.dev/vite-tanstack-config` `(RF-05)`.
- Se eliminan los `overrides` que forzaban versiones inestables de `rolldown` `(RF-04)`.
- Se agregan `@tanstack/router-generator`, `@tanstack/router-vite-plugin` y `@tanstack/devtools-vite` en `devDependencies` `(RF-04b)`.

---

### 2.2. `vite.config.ts` — Configuración Nativa sin Abstracciones Ocultas `(RF-03)`

Reemplazo total del wrapper propietario `defineTanstackConfig` de Lovable por una configuración canónica estándar de Vite para aplicaciones TanStack Start:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePrefix: '-',
      quoteStyle: 'single',
    }),
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
```

*Garantías del nuevo `vite.config.ts`:*
- Cero telemetría ni comunicación remota hacia servidores de Lovable.
- Cero inyecciones automáticas de variables `VITE_*` no controladas.
- Soporte nativo para regenerar `routeTree.gen.ts` de forma idéntica ante cualquier cambio en `src/routes/`.
- Resolución explícita y robusta de imports mediante alias `@/` y `vite-tsconfig-paths`.

---

### 2.3. `.gitignore` — Contrato de Exclusiones Limpio `(RF-01b)`

El archivo `.gitignore` en la raíz se purga de Cloudflare/Wrangler y se asegura de ignorar artefactos de build y tooling temporal, garantizando el versionado de la documentación:

```gitignore
# Dependencias
node_modules/

# Compilados y Caches de Build
dist/
.output/
.vinxi/
.nitro/
.vite/
.tanstack/

# Generador de Rutas TanStack
src/routeTree.gen.ts

# Residuos y Metadatos de Lovable
.lovable/

# Variables de Entorno y Secretos
.env
.env*.local
*.local

# Archivos de Entorno de Pruebas y Cobertura
coverage/

# Logs y Caches de OS / IDE
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
Thumbs.db
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/

# IMPORTANTE: docs/ y specs/ NUNCA se ignoran (Permanecen versionados en Git)
```

---

## 3. Algoritmo de Migración (Pseudocódigo de DevOps) `(RF-01, RF-02, RF-06, RF-08, RF-10, RF-11)`

El siguiente procedimiento describe la secuencia idempotente para ejecutar la extracción, saneamiento y purga física sin romper el historial de Git ni alterar los archivos del usuario:

```text
INICIO PROCEDIMIENTO: LovableDetox(WorkspaceRoot)

  // 1. Verificación de Estado Inicial (RF-01)
  VALIDAR que WorkspaceRoot/.git existe
  VALIDAR que WorkspaceRoot/diesel-blue-spark-main existe
  REGISTRAR estado actual en git (git status --porcelain)

  // 2. Extracción de Código Fuente y Assets Funcionales (RF-01)
  MOVER WorkspaceRoot/diesel-blue-spark-main/src/      -> WorkspaceRoot/src/
  MOVER WorkspaceRoot/diesel-blue-spark-main/public/   -> WorkspaceRoot/public/

  // 3. Extracción de Configuraciones (RF-01, RF-02)
  CONFIG_FILES = [
    "tsconfig.json", "components.json", "eslint.config.js",
    "vitest.config.ts", ".prettierrc", ".prettierignore",
    "package.json", "vite.config.ts", ".gitignore"
  ]
  PARA CADA archivo EN CONFIG_FILES:
    MOVER WorkspaceRoot/diesel-blue-spark-main/[archivo] -> WorkspaceRoot/[archivo]

  // 4. Descarte de Archivos Propietarios / Duplicados en Subcarpeta (RF-02)
  DISCARD_FILES = ["README.md", "AGENTS.md", "roadmap.md"]
  PARA CADA archivo EN DISCARD_FILES:
    ELIMINAR WorkspaceRoot/diesel-blue-spark-main/[archivo]

  // 5. Purga de Telemetría y Código Propietario en src/ (RF-06, RF-06b, RF-07)
  ELIMINAR WorkspaceRoot/src/lib/lovable-error-reporting.ts
  ELIMINAR WorkspaceRoot/src/lib/error-capture.ts

  // Refactorizar src/routes/__root.tsx
  REESCRIBIR WorkspaceRoot/src/routes/__root.tsx:
    REMOVER import { reportLovableError } from '@/lib/lovable-error-reporting'
    REEMPLAZAR llamada a reportLovableError(error) por manejo estándar en consola/ErrorBoundary nativo

  // Refactorizar src/server.ts
  REESCRIBIR WorkspaceRoot/src/server.ts:
    REMOVER import './lib/error-capture'

  // 6. Auditoría y Reescritura de Configuración Raíz (RF-01b, RF-03, RF-04, RF-04b, RF-05, RF-09)
  REESCRIBIR WorkspaceRoot/vite.config.ts (según Contrato Sección 2.2)
  REESCRIBIR WorkspaceRoot/package.json (según Contrato Sección 2.1)
  REESCRIBIR WorkspaceRoot/.gitignore (según Contrato Sección 2.3)
  CREAR WorkspaceRoot/.env.example con configuración base documentada

  // 7. Eliminación Física de Contenedor y Residuos (RF-08, RF-10, RF-11)
  ELIMINAR WorkspaceRoot/diesel-blue-spark-main/bun.lock
  ELIMINAR WorkspaceRoot/diesel-blue-spark-main/bunfig.toml
  ELIMINAR_RECURSIVO WorkspaceRoot/diesel-blue-spark-main/.lovable/
  ELIMINAR_RECURSIVO WorkspaceRoot/diesel-blue-spark-main/

  // 8. Instalación y Generación de Lockfile Estándar (RF-08)
  EJECUTAR en WorkspaceRoot: npm install

  // 9. Batería de Validación y Smoke Test (DoD)
  EJECUTAR en WorkspaceRoot: npx tsc --noEmit
  EJECUTAR en WorkspaceRoot: npm run lint
  EJECUTAR en WorkspaceRoot: npm run test
  EJECUTAR en WorkspaceRoot: npm run build
  AUDITAR: Cero coincidencias de texto "lovable" en código fuente y dependencias

FIN PROCEDIMIENTO
```

---

## 4. Decisiones Técnicas Justificadas

### 4.1. Manejo del Alias de Módulo `@/` `(RF-03)`
- **Decisión Elegida:** Combinación dual: configuración explícita en `resolve.alias` de `vite.config.ts` (`path.resolve(__dirname, './src')`) acompañada del plugin `vite-tsconfig-paths` alineado con `compilerOptions.paths` en `tsconfig.json`.
- **Alternativa Descartada:** Usar únicamente `vite-tsconfig-paths` sin alias explícito en Vite, o depender de rutas relativas (`../../`).
- **Justificación:** `vite-tsconfig-paths` asegura que TypeScript y las herramientas de análisis estático resuelvan idénticamente los módulos, mientras que el alias explícito en `vite.config.ts` blinda a herramientas de bundling (`vite build`) y testing (`vitest`) ante discrepancias en la resolución de rutas sin importar el entorno de ejecución.

### 4.2. Retención de Mock Data de UI (`catalog-data.ts`) `(RF-07)`
- **Decisión Elegida:** Conservar intacto el archivo `src/lib/catalog-data.ts` que almacena los inyectores, servicios y categorías de prueba.
- **Alternativa Descartada:** Purgar el archivo por considerarlo "código generado" o reemplazarlo inmediatamente por llamadas a base de datos / API REST.
- **Justificación:** En esta Fase 1, el backend en Express/PostgreSQL aún no existe (Fase 4). Eliminar los datos mock causaría la rotura inmediata del renderizado de las vistas (`/`, `/catalogo`, `/admin`) y de los tests unitarios pre-existentes (`catalog.test.ts`), impidiendo validar visualmente la UI y violando el principio de modularidad paso a paso del SDD. La desconexión y sustitución por Prisma se ejecutará de forma planificada en la Fase 3.

### 4.3. Resolución de Dependencias Fantasma y Ocultas `(RF-04, RF-04b, RF-05, RF-08)`
- **Decisión Elegida:** Declarar explícitamente `@tanstack/router-generator`, `@tanstack/router-vite-plugin` y `@tanstack/devtools-vite` en `devDependencies` de `package.json`, eliminando el paquete comodín `@lovable.dev/vite-tanstack-config` y descartando el override de `rolldown`.
- **Alternativa Descartada:** Intentar mantener el paquete de Lovable o asumir que Vite resolverá la generación de rutas dinámicas a través de `vinxi` de manera implícita sin plugins declarados.
- **Justificación:** El paquete `@lovable.dev/vite-tanstack-config` actuaba como una "caja negra" que agrupaba dependencias transitivas e inyectaba scripts de monitoreo. Para lograr independencia total y reproducibilidad en cualquier máquina con npm sin runtime Bun, las dependencias de generación de rutas deben ser transparentes, explícitas y canónicas en el `package.json`.

---

## 5. Estrategia de Tests y Verificación `(DoD)`

Para certificar con rigor técnico que la desintoxicación fue exitosa y que el proyecto es 100% operativo sin regresiones, se aplicará la siguiente batería de pruebas escalonadas:

| Nivel de Verificación | Comando / Acción | Criterio de Éxito / DoD | RF Vinculado |
|:---|:---|:---|:---|
| **1. Resolución de Paquetes** | `npm install` | Salida exitosa (código 0). Generación limpia de `package-lock.json`. Cero advertencias críticas de resolución. | `RF-04`, `RF-04b`, `RF-05`, `RF-08` |
| **2. Chequeo de Tipos Estricto** | `npx tsc --noEmit` | Salida limpia con código de salida 0. Ningún import roto, ningún tipo huérfano por eliminación de telemetría. | `RF-01`, `RF-03`, `RF-06` |
| **3. Análisis Estático (Linter)** | `npm run lint` | Salida con código 0. Código cumple las normas de estilo y orden de imports sin errores. | `RF-01` |
| **4. Suite de Pruebas Unitarias** | `npm run test` | `vitest` ejecuta y aprueba el 100% de los tests pre-existentes (`catalog.test.ts`, `app-routing.test.tsx`). | `RF-07` |
| **5. Smoke Test de Compilación** | `npm run build` | Compilación de Vite completa en exit code 0. Generación exitosa de los bundles en `.output/` o `dist/`. | `RF-03`, `RF-04` |
| **6. Servidor de Desarrollo** | `npm run dev` | Servidor inicia en `localhost:3000`. Regenera dinámicamente `routeTree.gen.ts`. Rutas `/`, `/catalogo` y `/admin` responden HTTP 200. | `RF-01b`, `RF-03` |
| **7. Auditoría de Cero Rastro (Grepping)** | Búsqueda regex exhaustiva | Cero coincidencias en todo el código fuente: `grep -ri "lovable" src/ public/ package.json vite.config.ts` devuelve 0 resultados. | `RF-05`, `RF-06`, `RNF-05` |
| **8. Auditoría Física de Archivos** | Inspección en disco | No existe `diesel-blue-spark-main/`, no existe `.lovable/`, no existe `bun.lock` ni `bunfig.toml`. | `RF-10`, `RF-11`, `RF-08` |
| **9. Integridad de Documentación** | Verificación Git | `docs/` y `specs/` permanecen bajo control de versiones y NO aparecen listados en `.gitignore`. | `RF-01b`, `RF-02` |
