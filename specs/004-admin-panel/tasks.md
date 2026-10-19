# Lista de Tareas Técnicas: Panel de Administración y Seguridad (Backoffice)

**Fase:** 004-admin-panel  
**Versión:** 1.2 (Sincronizada con spec v1.2 y plan v1.2)  
**Fecha:** 2026-10-18  
**Especificación:** [specs/004-admin-panel/spec.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/004-admin-panel/spec.md)  
**Plan Técnico:** [specs/004-admin-panel/plan.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/004-admin-panel/plan.md)  
**Marco Normativo:** [docs/constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md) y [AGENTS.MD](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/AGENTS.MD)  
**Estado:** Listo para Ejecución  

> **Reglas Inquebrantables de Ejecución:**
> - Se ejecuta **estrictamente una sola tarea a la vez** respetando el orden secuencial de dependencias.
> - Cada tarea debe estar completada y validada según su criterio **"Hecho cuando:"** antes de marcar su checkbox `[x]` y avanzar a la siguiente.
> - Ningún criterio de finalización es subjetivo: todos deben ser verificables de forma binaria mediante la terminal (códigos de salida, comandos de test o inspección) o aserciones de pruebas automatizadas sobre el DOM.

---

## Bloque 1: Configuración de Entorno (Crash Early) y Contratos Tipados

- [x] **Tarea 1.1 — Validación de Variables de Entorno con Zod en Arranque (`src/config/env.ts`)** `(RF-14, CA-14.1, CA-14.2, CA-14.3)`
  - **Objetivo:** Implementar el módulo `src/config/env.ts` que valida `VITE_API_URL` y `VITE_CONTACT_WHATSAPP` usando Zod en modo `.strict()`. Debe aplicar fallback seguro con `console.warn` en entornos locales/CI y lanzar excepción fatal en producción. Crear su suite en `src/test/admin/env.test.ts`.
  - **Archivos involucrados:** `src/config/env.ts`, `src/test/admin/env.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/admin/env.test.ts` termine con código de salida 0 comprobando: 1) parseo exitoso con variables presentes, 2) fallback con advertencia en entorno de desarrollo/test, y 3) excepción arrojada en modo producción ante variables faltantes.

- [x] **Tarea 1.2 — Definición de Tipos de Dominio con Identificadores UUIDv4 (`src/types/admin.ts`)** `(RF-05, RF-10, RF-12, D-14)`
  - **Objetivo:** Crear `src/types/admin.ts` declarando los tipos e interfaces estrictas de las entidades administrativas (`AdminProduct`, `AdminCategory`, `AdminBrand`, `ProductCondition`), forzando el tipado de IDs relacionales planos (`categoryIds: string[]`, `brandId: string`, `parentId: string | null`).
  - **Archivos involucrados:** `src/types/admin.ts`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0 sin errores de compilación de tipos en `src/types/admin.ts`.

- [x] **Tarea 1.3 — Documentación Tipada de Contratos de Red Backend y Cabecera CSRF (`src/types/admin-contracts.ts`)** `(RF-03, RF-09, RF-13, D-16)`
  - **Objetivo:** Crear `src/types/admin-contracts.ts` documentando los contratos TypeScript de peticiones y respuestas para Auth, Upload CDR de imágenes y CRUD de Productos, estandarizando errores 400 (`{ error: string, details?: { field: string, message: string }[] }`), errores 500 opacos y cabecera anti-CSRF `X-Requested-With: XMLHttpRequest`.
  - **Archivos involucrados:** `src/types/admin-contracts.ts`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0 validando la consistencia estricta de las interfaces de contratos.

---

## Bloque 2: Esquemas de Validación Fail-Fast (Zod)

- [x] **Tarea 2.1 — Esquema de Validación de Login (`src/lib/validations/admin-schemas.ts`)** `(RF-01, CA-01.3, RNF-P4-02)`
  - **Objetivo:** Implementar en `src/lib/validations/admin-schemas.ts` el esquema `loginSchema` con validación estricta (`.strict()`), correo electrónico obligatorio y contraseña no vacía. Crear su suite en `src/test/admin/login-schema.test.ts`.
  - **Archivos involucrados:** `src/lib/validations/admin-schemas.ts`, `src/test/admin/login-schema.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/admin/login-schema.test.ts` termine con código de salida 0 verificando el rechazo de emails vacíos o mal formateados, rechazo de contraseñas vacías y rechazo por `.strict()` ante propiedades extras inyectadas.

- [x] **Tarea 2.2 — Esquema de Validación de Metadata de Imágenes (`imageMetadataSchema`)** `(RF-08, CA-08.1, CA-08.2, CA-08.3, CL-01, CL-02)`
  - **Objetivo:** Implementar en `src/lib/validations/admin-schemas.ts` el esquema `imageMetadataSchema` desacoplado del objeto `File`, validando límite inclusivo `<= 5242880` bytes (5.00 MB exactos) y tipos mime permitidos (`image/jpeg`, `image/png`, `image/webp`). Crear `src/test/admin/image-schema.test.ts`.
  - **Archivos involucrados:** `src/lib/validations/admin-schemas.ts`, `src/test/admin/image-schema.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/admin/image-schema.test.ts` termine con código de salida 0 validando: 1) aceptación de 5.00 MB (`5242880` bytes), 2) rechazo de 5.01 MB (`5253360` bytes) con mensaje exacto, y 3) rechazo de archivos `.svg`, `.gif` u otros no permitidos.

- [x] **Tarea 2.3 — Esquemas de Validación para Categorías y Marcas** `(RF-10, RF-12, CA-10.4, CA-12.1, RNF-P4-02)`
  - **Objetivo:** Implementar en `src/lib/validations/admin-schemas.ts` los esquemas `categoryFormSchema` (nombre mínimo 2 caracteres con `.trim()`, `parentId` UUID nullable) y `brandFormSchema` (nombre mínimo 2 caracteres con `.trim()`), ambos con `.strict()`. Crear `src/test/admin/taxonomy-schemas.test.ts`.
  - **Archivos involucrados:** `src/lib/validations/admin-schemas.ts`, `src/test/admin/taxonomy-schemas.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/admin/taxonomy-schemas.test.ts` termine con código de salida 0 comprobando validaciones de longitud mínima, saneado de espacios y rechazo de payloads con propiedades inesperadas.

- [x] **Tarea 2.4 — Esquema de Validación de Producto** `(RF-05, CA-05.1, CA-05.2, CA-05.3, CL-06, CL-07)`
  - **Objetivo:** Implementar en `src/lib/validations/admin-schemas.ts` el esquema `productFormSchema` con `.strict()`, validando nombre (min 3), descripción (min 5), `imageUrl` no vacía, `categoryIds` (array UUIDs min 1), `brandId` UUID, condición enum, precio `>= 0` (admitiendo `$0` y `null`), y banderas booleanas. Crear `src/test/admin/product-schema.test.ts`.
  - **Archivos involucrados:** `src/lib/validations/admin-schemas.ts`, `src/test/admin/product-schema.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/admin/product-schema.test.ts` termine con código de salida 0 comprobando: 1) aceptación de precio `$0`, 2) rechazo de precio negativo, 3) aceptación de `price: null`, 4) exigencia de al menos 1 categoría, y 5) rechazo ante campos extras inyectados.

---

## Bloque 3: Autenticación Zero-Trust y Protección de Rutas

- [x] **Tarea 3.1 — Contexto de Autenticación Zero-Trust en Memoria (`AdminAuthProvider`)** `(RF-01, RF-02, RNF-P4-01, D-01)`
  - **Objetivo:** Crear `src/context/admin-auth-context.tsx` proveyendo `isAuthenticated` y `user` exclusivamente en memoria volátil de React. Implementar `login(credentials)` con las credenciales demo `admin@laboratoriodiesel.com` / `admin123` y `logout()`. Prohibir estrictamente cualquier interacción con `localStorage` o `sessionStorage`. Crear `src/test/admin/admin-auth.test.tsx`.
  - **Archivos involucrados:** `src/context/admin-auth-context.tsx`, `src/test/admin/admin-auth.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/admin-auth.test.tsx` termine con código de salida 0 verificando autenticación exitosa con credenciales demo, rechazo ante datos incorrectos, reseteo de estado en `logout()` y aserción de que `localStorage.getItem` nunca es invocado.

- [x] **Tarea 3.2 — Componente de Formulario de Login con Resiliencia (`AdminLoginForm.tsx`)** `(RF-01, CA-01.1, CA-01.2, CA-01.3, CA-01.4, CA-01.5)`
  - **Objetivo:** Crear `src/components/admin/auth/AdminLoginForm.tsx` con campos para email y contraseña, autocompletado habilitado (ASVS 2.1.12), validación Zod en `onBlur` y `onSubmit`, feedback visual de error opaco ("Credenciales incorrectas") y manejo de envío asíncrono con bloque `finally` para garantizar `isSubmitting: false`. Crear `src/test/admin/AdminLoginForm.test.tsx`.
  - **Archivos involucrados:** `src/components/admin/auth/AdminLoginForm.tsx`, `src/test/admin/AdminLoginForm.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/AdminLoginForm.test.tsx` termine con código de salida 0 verificando: 1) visualización de errores inline ante campos vacíos, 2) mensaje de error opaco ante fallo de autenticación, y 3) deshabilitación temporal del botón y posterior restablecimiento.

- [x] **Tarea 3.3 — Ruta de Login en TanStack Router (`src/routes/admin.login.tsx`)** `(RF-01, D-02)`
  - **Objetivo:** Crear la ruta `src/routes/admin.login.tsx` que renderiza `AdminLoginForm` y, ante autenticación exitosa, redirige a la ruta administrativa raíz `/admin`.
  - **Archivos involucrados:** `src/routes/admin.login.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0 y el componente de ruta exporte `Route` compatible con TanStack Router.

- [x] **Tarea 3.4 — Componente Route Guard con Denegación por Defecto (`AdminGuard.tsx`)** `(RF-02, CA-02.1, CA-02.2, CA-02.3, CL-08, CL-13)`
  - **Objetivo:** Crear `src/components/admin/auth/AdminGuard.tsx` que intercepta accesos al árbol administrativo. Si `!isAuthenticated`, redirige inmediatamente a `/admin/login` con `replace: true`. Simular la pérdida de sesión ante F5 (el estado inicial arranca en false) y verificar el bloqueo. Crear `src/test/admin/AdminGuard.test.tsx`.
  - **Archivos involucrados:** `src/components/admin/auth/AdminGuard.tsx`, `src/test/admin/AdminGuard.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/AdminGuard.test.tsx` termine con código de salida 0 verificando que usuarios sin sesión son redirigidos a `/admin/login` y usuarios autenticados renderizan los componentes hijos.

---

## Bloque 4: Estado Global en Memoria y Datos Semilla Normalizados

- [x] **Tarea 4.1 — Datos Semilla Normalizados con UUIDv4 (`src/lib/admin-seed-data.ts`)** `(RF-15, CA-15.1, D-14)`
  - **Objetivo:** Crear `src/lib/admin-seed-data.ts` exportando los datos iniciales tipados con UUIDv4: 3 categorías padre y 2 hijas (1 nivel exacto), 3 marcas líderes y 4 productos con variedad de estados (visible, oculto, precio ARS, precio `$0` y precio `null` a cotizar). Crear `src/test/admin/admin-seed-data.test.ts`.
  - **Archivos involucrados:** `src/lib/admin-seed-data.ts`, `src/test/admin/admin-seed-data.test.ts`.
  - **Hecho cuando:** `npx vitest run src/test/admin/admin-seed-data.test.ts` termine con código de salida 0 validando que todos los IDs sean UUIDs válidos y que las relaciones foráneas (`brandId`, `categoryIds`, `parentId`) existan sin huérfanos.

- [x] **Tarea 4.2 — Store `AdminProvider` y Lógica de Integridad de Categorías (`src/context/admin-context.tsx`)** `(RF-10, RF-11, CA-11.1, CA-11.2, CL-04, CL-05)`
  - **Objetivo:** Iniciar `src/context/admin-context.tsx` implementando `categories` y las operaciones `createCategory`, `updateCategory` y `deleteCategory`. Aplicar las reglas de negocio: 1) límite de 1 nivel (selector solo acepta categorías raíz), 2) inhabilitar selector de padre si la categoría editada ya tiene hijas (prevención de ciclos), y 3) bloqueo estricto impeditivo de eliminación si tiene >= 1 producto o subcategorías vinculadas.
  - **Archivos involucrados:** `src/context/admin-context.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` compile sin errores y las funciones de categoría manejen el bloqueo retornando un objeto `{ success: boolean, reason?: string, affectedProducts?: string[] }`.

- [x] **Tarea 4.3 — Lógica de Integridad de Marcas y Productos en `AdminProvider`** `(RF-05, RF-06, RF-07, RF-12, CA-12.3, CA-12.4, CL-06, CL-09)`
  - **Objetivo:** Completar `src/context/admin-context.tsx` con `brands` y `products`. Implementar: 1) CRUD de marcas con bloqueo estricto de borrado si `brandId` está en uso, 2) renombrado de marcas por UUID sin desnormalizar productos, 3) CRUD de productos, y 4) conmutación reactiva de visibilidad (`toggleVisibility`). Crear `src/test/admin/admin-context.test.tsx`.
  - **Archivos involucrados:** `src/context/admin-context.tsx`, `src/test/admin/admin-context.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/admin-context.test.tsx` termine con código de salida 0 comprobando: 1) bloqueo de eliminación de categoría con productos, 2) bloqueo de eliminación de marca con productos, 3) renombrado de marca reflejado relacionalmente, y 4) toggle de visibilidad.

---

## Bloque 5: Layout Administrativo y Dashboard

- [x] **Tarea 5.1 — Layout Administrativo con Navegación y Logout (`src/routes/admin.tsx`)** `(RF-02, RNF-P4-03)`
  - **Objetivo:** Refactorizar `src/routes/admin.tsx` integrando `AdminGuard` y `AdminProvider`. Implementar layout responsivo con sidebar colapsable, enlaces de navegación hacia `/admin` (Productos), `/admin/dashboard`, `/admin/categorias`, `/admin/marcas`, enlace externo a `/catalogo`, y botón "Cerrar Sesión" conectado a `logout()`.
  - **Archivos involucrados:** `src/routes/admin.tsx`, `src/components/admin/layout/AdminSidebar.tsx`, `src/components/admin/layout/AdminHeader.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0 y el layout renderice el contenedor principal de administración.

- [x] **Tarea 5.2 — Componente de Métricas del Dashboard (`DashboardMetrics.tsx`)** `(RF-04, CA-04.1, CA-04.2)`
  - **Objetivo:** Crear `src/components/admin/dashboard/DashboardMetrics.tsx` consumiendo `useAdmin` para calcular y mostrar reactivamente: 1) total de productos, 2) productos visibles, 3) productos ocultos, 4) total de categorías y 5) total de marcas. Incluir tarjetas interactivas y accesos directos hacia los 3 submódulos ABM. Crear `src/test/admin/DashboardMetrics.test.tsx`.
  - **Archivos involucrados:** `src/components/admin/dashboard/DashboardMetrics.tsx`, `src/test/admin/DashboardMetrics.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/DashboardMetrics.test.tsx` termine con código de salida 0 verificando el renderizado correcto de los 5 contadores y su reactividad ante cambios en el contexto.

- [x] **Tarea 5.3 — Vista de Dashboard en TanStack Router (`src/routes/admin.dashboard.tsx`)** `(RF-04)`
  - **Objetivo:** Refactorizar `src/routes/admin.dashboard.tsx` integrando `DashboardMetrics` con título accesible y metadatos de página.
  - **Archivos involucrados:** `src/routes/admin.dashboard.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0.

---

## Bloque 6: Módulo de Marcas (ABM Mínimo)

- [x] **Tarea 6.1 — Tabla de Listado de Marcas con Conteo Relacional (`BrandList.tsx`)** `(RF-12, CA-12.1, CL-09)`
  - **Objetivo:** Crear `src/components/admin/brands/BrandList.tsx` mostrando el listado de marcas, calculando en tiempo real la cantidad de productos asociados a cada `brand.id`, y proveyendo botones de acción para editar y eliminar.
  - **Archivos involucrados:** `src/components/admin/brands/BrandList.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0 y el componente liste marcas y su conteo de repuestos asociados.

- [x] **Tarea 6.2 — Modal de Creación y Edición de Marca (`BrandFormModal.tsx`)** `(RF-12, CA-12.1, CA-12.2, D-12)`
  - **Objetivo:** Crear `src/components/admin/brands/BrandFormModal.tsx` con formulario validado por `brandFormSchema`, control de duplicados case-insensitive contra el store, y manejo asíncrono con `finally` para restablecer `isSubmitting`.
  - **Archivos involucrados:** `src/components/admin/brands/BrandFormModal.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0.

- [x] **Tarea 6.3 — Modal de Eliminación con Bloqueo Referencial (`BrandDeleteModal.tsx`)** `(RF-12, CA-12.3, CA-12.5)`
  - **Objetivo:** Crear `src/components/admin/brands/BrandDeleteModal.tsx`. Si la marca tiene productos vinculados, debe mostrar una alerta de bloqueo impeditivo listando los productos afectados. Si está libre, debe mostrar diálogo de confirmación con botón rojo destructivo. Crear suite integrada `src/test/admin/brands.test.tsx`.
  - **Archivos involucrados:** `src/components/admin/brands/BrandDeleteModal.tsx`, `src/test/admin/brands.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/brands.test.tsx` termine con código de salida 0 validando: 1) alta de marca, 2) rechazo de duplicados, 3) bloqueo de borrado con productos asociados, y 4) eliminación exitosa cuando está libre.

- [x] **Tarea 6.4 — Vista de Marcas en TanStack Router (`src/routes/admin.marcas.tsx`)** `(RF-12)`
  - **Objetivo:** Crear la ruta `src/routes/admin.marcas.tsx` integrando los componentes del módulo de marcas (`BrandList`, `BrandFormModal`, `BrandDeleteModal`) con botón "Nueva Marca".
  - **Archivos involucrados:** `src/routes/admin.marcas.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0.

---

## Bloque 7: Módulo de Categorías y Subcategorías (1 Nivel)

- [x] **Tarea 7.1 — Lista Jerárquica de Categorías con Indentación Visual (`CategoryList.tsx`)** `(RF-10, CA-10.1, CA-10.2)`
  - **Objetivo:** Crear `src/components/admin/categories/CategoryList.tsx` organizando visualmente las categorías raíz y sus subcategorías hijas indentadas, mostrando el conteo de productos asociados a cada ID y botones para editar y eliminar.
  - **Archivos involucrados:** `src/components/admin/categories/CategoryList.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0 y el árbol visual distinga jerarquías correctamente.

- [x] **Tarea 7.2 — Modal de Creación y Edición con Prevención de Ciclos (`CategoryFormModal.tsx`)** `(RF-10, CA-10.3, CA-10.4, CL-04, CL-05, D-12)`
  - **Objetivo:** Crear `src/components/admin/categories/CategoryFormModal.tsx` validado con `categoryFormSchema`. El selector de "Categoría Padre" solo debe mostrar categorías raíz (`parentId === null`). Si la categoría que se está editando ya tiene hijas vinculadas, el selector de padre debe inhabilitarse por completo (CL-05). Manejar submit con `finally`.
  - **Archivos involucrados:** `src/components/admin/categories/CategoryFormModal.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0.

- [x] **Tarea 7.3 — Modal de Eliminación con Bloqueo Estricto de Productos (`CategoryDeleteModal.tsx`)** `(RF-11, CA-11.1, CA-11.2, CA-11.3)`
  - **Objetivo:** Crear `src/components/admin/categories/CategoryDeleteModal.tsx`. Si la categoría tiene productos vinculados o subcategorías hijas, muestra alerta impeditiva listando los elementos afectados y deshabilitando el borrado. Si está libre, permite eliminar. Crear suite integrada `src/test/admin/categories.test.tsx`.
  - **Archivos involucrados:** `src/components/admin/categories/CategoryDeleteModal.tsx`, `src/test/admin/categories.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/categories.test.tsx` termine con código de salida 0 comprobando: 1) creación de categoría y subcategoría, 2) inhabilitación de selector de padre si tiene hijas, 3) bloqueo de eliminación con productos asociados, y 4) eliminación exitosa de categoría vacía.

- [x] **Tarea 7.4 — Vista de Categorías en TanStack Router (`src/routes/admin.categorias.tsx`)** `(RF-10, RF-11)`
  - **Objetivo:** Refactorizar `src/routes/admin.categorias.tsx` conectando `CategoryList`, `CategoryFormModal` y `CategoryDeleteModal` con botón "Nueva Categoría".
  - **Archivos involucrados:** `src/routes/admin.categorias.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0.

---

## Bloque 8: Módulo de Productos (Subida de Imágenes y ABM Atómico)

- [x] **Tarea 8.1 — Componente de Fallback Gráfico de Imagen (`ProductThumbnail.tsx`)** `(RF-06, CA-06.3, CL-10)`
  - **Objetivo:** Crear `src/components/admin/products/ProductThumbnail.tsx` que renderice la imagen desde URL relativa o Data URL y, ante el evento `onError`, conmute automáticamente a un fallback visual neutro (ícono de inyector/repuesto con aria-label descriptivo) sin alterar las dimensiones de la celda. Crear `src/test/admin/ProductThumbnail.test.tsx`.
  - **Archivos involucrados:** `src/components/admin/products/ProductThumbnail.tsx`, `src/test/admin/ProductThumbnail.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/ProductThumbnail.test.tsx` termine con código de salida 0 verificando el renderizado de la imagen y la conmutación al componente de fallback al disparar `fireEvent.error`.

- [x] **Tarea 8.2 — Componente de Carga y Validación Client-Side de Fotos (`ProductImageUpload.tsx`)** `(RF-08, CA-08.1 a CA-08.4, CL-01, CL-02, CL-03)`
  - **Objetivo:** Crear `src/components/admin/products/ProductImageUpload.tsx` con input tipo file (`accept=".jpg,.jpeg,.png,.webp"`). Al seleccionar archivo, valida tamaño (`<= 5MB` exactos) y formato con `imageMetadataSchema`. Si es válido, genera previsualización Data URL; si el usuario selecciona otro archivo, lo sobrescribe limpiamente. Crear `src/test/admin/ProductImageUpload.test.tsx`.
  - **Archivos involucrados:** `src/components/admin/products/ProductImageUpload.tsx`, `src/test/admin/ProductImageUpload.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/ProductImageUpload.test.tsx` termine con código de salida 0 validando: 1) aceptación de 5.00 MB, 2) rechazo de 5.01 MB, 3) renderizado de preview, y 4) reemplazo ante nueva selección.

- [x] **Tarea 8.3 — Grilla de Productos, Búsqueda Sanitizada y Toggle de Visibilidad** `(RF-06, CA-06.1, CA-06.2, CA-06.4, CL-11)`
  - **Objetivo:** Crear `src/components/admin/products/ProductTable.tsx` y `ProductToolbar.tsx`. Implementar búsqueda literal insensible a mayúsculas que no lance excepciones ante caracteres especiales de RegExp (`[`, `*`, `\`). Renderizar filas con `ProductThumbnail`, marca resuelta por `brandId`, badge visible/oculto, conmutador directo de visibilidad, y botones de edición y eliminación.
  - **Archivos involucrados:** `src/components/admin/products/ProductTable.tsx`, `src/components/admin/products/ProductToolbar.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0 y el componente resuelva nombres de marca relacionales por ID.

- [x] **Tarea 8.4 — Modal de Creación y Edición de Producto con Bloque Finally (`ProductFormModal.tsx`)** `(RF-05, CA-05.1 a CA-05.4, CL-06, CL-07, CL-12)`
  - **Objetivo:** Crear `src/components/admin/products/ProductFormModal.tsx` validado con `productFormSchema`. Integrar `ProductImageUpload`, selector múltiple de categorías (guardando array plano `categoryIds`), selector de marca por UUID, condición enum, precio `>= 0` (admitiendo `$0`), toggles de visibilidad y precio, y submit blindado con bloque `finally` para `isSubmitting`.
  - **Archivos involucrados:** `src/components/admin/products/ProductFormModal.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0.

- [x] **Tarea 8.5 — Modal de Eliminación de Producto y Suite de Integración** `(RF-07, CA-07.1, CA-07.2)`
  - **Objetivo:** Crear `src/components/admin/products/ProductDeleteModal.tsx` con confirmación explícita y botón de peligro en tono rojo. Crear la suite integrada `src/test/admin/products.test.tsx` cubriendo el ciclo completo de producto.
  - **Archivos involucrados:** `src/components/admin/products/ProductDeleteModal.tsx`, `src/test/admin/products.test.tsx`.
  - **Hecho cuando:** `npx vitest run src/test/admin/products.test.tsx` termine con código de salida 0 validando: 1) creación de producto con campos obligatorios, 2) toggle de visibilidad en grilla, 3) búsqueda con caracteres especiales, 4) admisión de precio `$0`, y 5) eliminación permanente.

- [x] **Tarea 8.6 — Ensamblar la Vista `/admin` de Productos (`src/routes/admin.index.tsx`)** `(RF-05, RF-06, RF-07)`
  - **Objetivo:** Refactorizar `src/routes/admin.index.tsx` integrando `ProductToolbar`, `ProductTable`, `ProductFormModal` y `ProductDeleteModal` como punto de entrada principal del backoffice.
  - **Archivos involucrados:** `src/routes/admin.index.tsx`.
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0.

---

## Bloque 9: Integración Global de Rutas y Verificación del Definition of Done (DoD)

- [x] **Tarea 9.1 — Regeneración del Árbol de Rutas de TanStack Router (`src/routeTree.gen.ts`)** `(RF-01, RF-02, RF-10, RF-12)`
  - **Objetivo:** Ejecutar el generador de rutas de TanStack Router para registrar formalmente las nuevas rutas (`/admin/login`, `/admin/marcas`, `/admin/categorias`, `/admin/dashboard`, `/admin/`) asegurando tipado estricto en la navegación.
  - **Archivos involucrados:** `src/routeTree.gen.ts`.
  - **Hecho cuando:** `npx tsr generate` o el build de Vite regenere `src/routeTree.gen.ts` conteniendo todas las rutas de `/admin` sin errores de resolución.

- [x] **Tarea 9.2 — Verificación Estricta de Tipos TypeScript** `(DoD Final)`
  - **Objetivo:** Ejecutar la verificación estática de tipos en todo el proyecto asegurando cero errores de compilación.
  - **Archivos involucrados:** Todo el código fuente en `src/`.
  - **Hecho cuando:** `npx tsc --noEmit` devuelva código de salida 0 con 0 errores reportados en la terminal.

- [x] **Tarea 9.3 — Ejecución de la Suite Completa de Tests Automatizados** `(DoD Final)`
  - **Objetivo:** Ejecutar toda la suite de pruebas unitarias y de integración de la aplicación con Vitest.
  - **Archivos involucrados:** Todo `src/test/`.
  - **Hecho cuando:** `npm run test` termine con código de salida 0 y el 100% de los tests del proyecto (landing y admin) aprueben en verde.

- [x] **Tarea 9.4 — Compilación del Bundle de Producción (Cero Regresiones)** `(DoD Final)`
  - **Objetivo:** Validar que la aplicación empaqueta para producción sin advertencias de rutas huérfanas, dependencias circulares o errores de empaquetado.
  - **Archivos involucrados:** Todo el proyecto.
  - **Hecho cuando:** `npm run build` termine con código de salida 0 generando el bundle de producción en `dist/`.

---

*Fin de la lista de tareas de implementación.*
