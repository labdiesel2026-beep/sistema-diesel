# Tareas de Implementación — Fase 6: Gestión Dinámica del Carrusel de Productos Destacados

**Fase:** 006-carrusel-destacados  
**Versión:** 1.0  
**Fecha:** 2026-10-20  
**Basado en:** [docs/constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md), [specs/006-carrusel-destacados/spec.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/006-carrusel-destacados/spec.md), [specs/006-carrusel-destacados/plan.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/006-carrusel-destacados/plan.md)  
**Estado:** Tareas Planificadas para Ejecución  

---

## Bloque 1: Base de Datos y Persistencia Relacional

- [x] **Tarea 1.1: Actualizar el modelo de datos en Prisma Schema**
  - **Archivos:** `server/prisma/schema.prisma`
  - **Descripción:** Agregar al modelo `Product` los atributos `isFeatured: Boolean @default(false) @map("is_featured")` y `featuredAt: DateTime? @map("featured_at")`. Incorporar los índices compuestos `@@index([visible, isFeatured])` y `@@index([featuredAt(sort: Desc)])`.
  - **Cobertura:** RF-03, RF-05, RF-06, RNF-01
  - **Hecho cuando:** `npx --prefix server prisma validate` reporte éxito sintáctico y el schema contenga los nuevos campos e índices sin errores.

- [x] **Tarea 1.2: Generar y ejecutar la migración SQL en PostgreSQL**
  - **Archivos:** `server/prisma/migrations/<timestamp>_add_featured_products/migration.sql`
  - **Descripción:** Ejecutar `prisma migrate dev` para crear y aplicar la migración en la base de datos PostgreSQL del contenedor Docker, y regenerar el cliente Prisma en `server/node_modules/@prisma/client`.
  - **Cobertura:** RF-03, RNF-01, Principio 5 de la Constitución
  - **Hecho cuando:** `npx --prefix server prisma migrate status` confirme que la base de datos está al día con la migración aplicada exitosamente.

- [x] **Tarea 1.3: Actualizar el script de datos semilla (Seed)**
  - **Archivos:** `server/prisma/seed.ts`
  - **Descripción:** Modificar el seed para asegurar que los productos precargados contemplen los campos `isFeatured` y `featuredAt`, inicializando un subconjunto controlado (ej. 3 o 4 productos visibles) como destacados respetando el límite <= 10.
  - **Cobertura:** RF-03, RF-06
  - **Hecho cuando:** `npm --prefix server run seed` ejecute sin errores y verifique en BD que los productos destacados poseen marcas temporales coherentes.

---

## Bloque 2: Validación en Frontera con Zod y DTOs

- [x] **Tarea 2.1: Crear esquemas Zod para la gestión de productos destacados**
  - **Archivos:** `server/src/schemas/product.schemas.ts`
  - **Descripción:** Definir `featuredPatchSchema` con `{ isFeatured: z.boolean() }` en modo estricto `.strict()`. Extender `productFormSchema` para admitir `isFeatured: z.boolean().default(false)` garantizando la validación Fail-Fast.
  - **Cobertura:** RF-01, RF-02, RNF-02, Principio 2 de la Constitución
  - **Hecho cuando:** Se ejecuten pruebas unitarias sobre `featuredPatchSchema` confirmando que rechaza campos adicionales y tipos no booleanos.

- [x] **Tarea 2.2: Actualizar la función de serialización DTO de productos**
  - **Archivos:** `server/src/services/product.service.ts`
  - **Descripción:** Actualizar el transformador `toProductDto()` y la interfaz `ProductDto` para exponer los atributos `isFeatured: boolean` y `featuredAt: string | null` en todas las respuestas de catálogo.
  - **Cobertura:** RF-01, RF-06, RF-07, RNF-05
  - **Hecho cuando:** `npx --prefix server tsc --noEmit` compile sin errores de tipos en la serialización de productos.

---

## Bloque 3: Lógica de Servicios y Transaccionalidad Backend

- [x] **Tarea 3.1: Implementar la mutación atómica `toggleFeatured` en el servicio**
  - **Archivos:** `server/src/services/product.service.ts`
  - **Descripción:** Crear el método transaccional interactivo `toggleFeatured(id, isFeatured)` con `prisma.$transaction`. Si `isFeatured === true`, validar que el producto tenga `visible === true` (arrojando error 400 si está oculto), contar atómicamente los destacados actuales con bloqueo y rechazar con error 409 Conflict si ya hay 10. Al conmutar a `true`, estampar `featuredAt = new Date()`; al conmutar a `false`, asignar `featuredAt = null`.
  - **Cobertura:** RF-01, RF-03, RF-05, RF-06, RNF-01, RNF-03
  - **Hecho cuando:** Pruebas unitarias de `product.service.ts` comprueben el rechazo con 409 al superar 10 destacados y la correcta asignación de `featuredAt`.

- [x] **Tarea 3.2: Implementar la consulta pública `getFeaturedProducts` en el servicio**
  - **Archivos:** `server/src/services/product.service.ts`
  - **Descripción:** Crear el método `getFeaturedProducts()` que consulte la tabla `products` con condición estricta `WHERE visible = true AND isFeatured = true`, ordenado por `featuredAt: 'desc'` (LIFO), con `take: 10`, mapeando a DTO liviano con relaciones de marca aplanadas.
  - **Cobertura:** RF-06, RF-07, RNF-05
  - **Hecho cuando:** `getFeaturedProducts()` devuelva un array plano de máximo 10 elementos ordenados por frescura de destaque y excluya productos ocultos.

- [x] **Tarea 3.3: Adaptar las mutaciones generales de producto ante cambios de visibilidad**
  - **Archivos:** `server/src/services/product.service.ts`
  - **Descripción:** Ajustar `createProduct` y `updateProduct` para validar el límite de 10 destacados si se envía `isFeatured: true`. Confirmar que `updateProductVisibility` mantenga intactos `isFeatured` y `featuredAt` en base de datos para preservar el historial ante pausas de visibilidad.
  - **Cobertura:** RF-02, RF-03, RF-05, CL-06, CL-07
  - **Hecho cuando:** Un producto destacado cuya visibilidad se conmute a `false` conserve `isFeatured: true` en la base de datos pero deje de figurar en `getFeaturedProducts()`.

- [x] **Tarea 3.4: Actualizar el cálculo de métricas de catálogo**
  - **Archivos:** `server/src/services/metrics.service.ts`
  - **Descripción:** Incorporar al agregador `getMetrics()` la cuenta de `featuredProducts` calculada sobre los productos que cumplan `isFeatured: true AND visible: true`.
  - **Cobertura:** RF-04 (CA-04.1)
  - **Hecho cuando:** `metricsService.getMetrics()` incluya la propiedad `featuredProducts: number` en su respuesta JSON.

---

## Bloque 4: Controladores y Rutas de la API Backend

- [x] **Tarea 4.1: Crear controladores REST para endpoints de destacados**
  - **Archivos:** `server/src/controllers/product.controller.ts`
  - **Descripción:** Implementar `getFeaturedProducts` (responde 200 con array DTO) y `updateProductFeatured` (consume `featuredPatchSchema`, maneja `ConflictException` respondiendo 409 y captura fallos no controlados como 500 con UUID de referencia).
  - **Cobertura:** RF-01, RF-03, RF-07, RNF-03, Principio 6 de la Constitución
  - **Hecho cuando:** Peticiones HTTP a los controladores retornen los códigos de estado `200`, `400`, `409` y `500` estructurados según la especificación.

- [x] **Tarea 4.2: Registrar las rutas de productos destacados en Express**
  - **Archivos:** `server/src/routes/product.routes.ts`
  - **Descripción:** Registrar `GET /featured` como ruta pública antes de los parámetros dinámicos `/:id`. Registrar `PATCH /:id/featured` protegida con `requireAuth`, `csrfProtection` y validación Zod `{ params: uuidParamSchema, body: featuredPatchSchema }`.
  - **Cobertura:** RF-01, RF-07, RNF-01, RNF-02, Principio 4 de la Constitución
  - **Hecho cuando:** `npx --prefix server tsc --noEmit` verifique que las rutas y middlewares compilan sin inconsistencias de tipos.

- [x] **Tarea 4.3: Exponer métrica de destacados en el endpoint administrativo**
  - **Archivos:** `server/src/controllers/metrics.controller.ts`
  - **Descripción:** Asegurar que `GET /api/admin/metrics` serialice `featuredProducts` hacia el cliente administrativo.
  - **Cobertura:** RF-04 (CA-04.1)
  - **Hecho cuando:** Una solicitud `GET /api/admin/metrics` autenticada retorne el objeto con la clave `featuredProducts`.

---

## Bloque 5: Tipos y Capa de Datos en Frontend

- [x] **Tarea 5.1: Actualizar tipos TypeScript del producto en Frontend**
  - **Archivos:** `src/types/product.ts` (o módulos de tipos compartidos de catálogo y admin)
  - **Descripción:** Añadir `isFeatured: boolean` y `featuredAt?: string | null` a los contratos `Product` y `ProductFormData`.
  - **Cobertura:** RF-01 a RF-06
  - **Hecho cuando:** `npx tsc --noEmit` en la raíz del proyecto no reporte errores de asignación de tipos en las interfaces de producto.

- [x] **Tarea 5.2: Integrar método pesimista `toggleFeaturedProduct` en el Context de Administración**
  - **Archivos:** `src/context/AdminContext.tsx` (o servicios asociados de cliente)
  - **Descripción:** Implementar la función `toggleFeaturedProduct(id: string, isFeatured: boolean)` realizando la petición `PATCH /api/products/:id/featured` con `credentials: 'include'`. Mantener estado de espera (*loading*), actualizar la lista de productos y el contador global tras la respuesta exitosa, o propagar el error 409 con notificación toast sin actualizar el estado local ante rechazo.
  - **Cobertura:** RF-01, RF-03, RNF-04, Principio 5 de la Constitución
  - **Hecho cuando:** La llamada al método invoque la API y actualice el estado únicamente tras recibir el código HTTP 200.

---

## Bloque 6: Componentes de la Interfaz del Backoffice

- [x] **Tarea 6.1: Añadir la 6.ª tarjeta de métrica en el Dashboard Administrativo**
  - **Archivos:** `src/components/admin/dashboard/DashboardMetrics.tsx` (o componente equivalente de métricas)
  - **Descripción:** Agregar la tarjeta "Productos Destacados" mostrando el indicador `"X / 10"` con ícono alusivo (estrella/destacado) y acceso directo a la tabla de productos.
  - **Cobertura:** RF-04 (CA-04.1)
  - **Hecho cuando:** La vista del Dashboard renderice 6 tarjetas cuantitativas reflejando el conteo dinámico de destacados activos.

- [x] **Tarea 6.2: Implementar contador dinámico y filtro rápido "Solo Destacados" en la Toolbar**
  - **Archivos:** `src/components/admin/products/ProductToolbar.tsx`
  - **Descripción:** Agregar el badge informativo `"Destacados: X / 10"` en la barra de herramientas. Incorporar un conmutador/botón de filtro rápido `"Solo Destacados"` con combinación lógica `AND` respecto al buscador de texto y categorías.
  - **Cobertura:** RF-04 (CA-04.2, CA-04.3), CL-11
  - **Hecho cuando:** Al activar "Solo Destacados", la tabla filtre instantáneamente mostrando solo repuestos con `isFeatured: true`, combinándose correctamente con búsquedas por texto.

- [x] **Tarea 6.3: Integrar columna de acción rápida con spinner y gestión de errores en la Tabla**
  - **Archivos:** `src/components/admin/products/ProductTable.tsx`
  - **Descripción:** Incorporar una columna con control interactivo (switch/estrella) para alternar el destaque. Implementar actualización pesimista mostrando mini-spinner durante la mutación, deshabilitar el conmutador si el producto está en estado "Oculto", y disparar notificación de alerta con `sonner` (`"Límite alcanzado. Desmarca un producto primero"`) ante rechazo 409.
  - **Cobertura:** RF-01, RF-03, RF-05, RNF-04, CL-02, CL-03
  - **Hecho cuando:** La acción sobre el switch muestre spinner, confirme el cambio en backend y muestre el toast de advertencia impidiendo el cambio ante el 11.º producto.

- [x] **Tarea 6.4: Agregar conmutador con validación preventiva en el Formulario de Producto**
  - **Archivos:** `src/components/admin/products/ProductFormModal.tsx`
  - **Descripción:** Añadir el conmutador "Mostrar en Carrusel de Inicio" dentro del formulario modal. Si se abre en modo creación y el cupo actual es 10/10, renderizar el conmutador bloqueado (*disabled*) con texto explicativo. Si se edita un producto ya destacado, mantenerlo habilitado para permitir desmarcarlo.
  - **Cobertura:** RF-02, RF-03, CL-05
  - **Hecho cuando:** En modo alta con 10 destacados el switch aparezca deshabilitado con el texto preventivo, y en modo edición permita desmarcar el producto.

---

## Bloque 7: Hidratación Dinámica y Ajuste Estructural en la Landing Page

- [x] **Tarea 7.1: Crear servicio de consulta para la Landing Page**
  - **Archivos:** `src/services/landing.service.ts`
  - **Descripción:** Implementar la función cliente `fetchFeaturedProducts()` que consuma `GET /api/products/featured`, con tipado estricto `FeaturedProductItem[]` y captura silenciosa de excepciones (retornando `[]` en caso de error de red o 500).
  - **Cobertura:** RF-07, RNF-03, RNF-05
  - **Hecho cuando:** `fetchFeaturedProducts()` retorne los productos destacados o `[]` sin arrojar excepciones no controladas.

- [x] **Tarea 7.2: Hidratar el componente del carrusel con prevención de CLS y enlace directo**
  - **Archivos:** `src/components/landing/FeaturedProductsCarousel.tsx`
  - **Descripción:** Reemplazar el array mock por la consulta reactiva a `fetchFeaturedProducts()`. Renderizar un contenedor con altura de reserva mínima (`min-h-[460px]`) durante la carga para evitar *CLS*. Si el array está vacío (0 destacados) o hay error, retornar `null` desmontando la sección silenciosamente. Envolver cada tarjeta en `<Link to="/catalogo/$productId" params={{ productId: product.id }}>` eliminando cualquier botón secundario incompatible.
  - **Cobertura:** RF-06, RF-07, RNF-03, RNF-05, CL-01, CL-02
  - **Hecho cuando:** La Landing Page renderice los productos reales del backend, la tarjeta navegue a `/catalogo/$productId`, y la sección completa desaparezca limpiamente si no hay productos destacados.

---

## Bloque 8: Suite de Pruebas Automatizadas y Validación

- [x] **Tarea 8.1: Escribir pruebas unitarias del backend para esquemas y servicio**
  - **Archivos:** `server/src/test/product.schemas.test.ts`, `server/src/test/product.service.test.ts`
  - **Descripción:** Testear que `featuredPatchSchema` valide con Zod en modo `.strict()`. Testear que `productService.toggleFeatured` lance excepción 409 ante exceso de cupo y 400 en productos ocultos.
  - **Cobertura:** RF-01, RF-02, RF-03, RNF-02
  - **Hecho cuando:** `npm --prefix server test` ejecute y apruebe todas las pruebas unitarias de validación y servicio.

- [x] **Tarea 8.2: Escribir pruebas de integración y concurrencia en la API Backend**
  - **Archivos:** `server/src/test/featured-products.integration.test.ts`
  - **Descripción:** Testear con Supertest: (1) Inserción hasta 10 elementos y rechazo con HTTP 409 ante el 11.º; (2) Peticiones concurrentes simultáneas (`Promise.all`) con cupo en 9/10 verificando que solo una triunfe; (3) Ordenamiento LIFO estricto en `GET /api/products/featured`; (4) Exclusión de la consulta pública al pasar a visibilidad oculta.
  - **Cobertura:** RF-01, RF-03, RF-05, RF-06, RF-07, RNF-01, CL-04
  - **Hecho cuando:** `npm --prefix server test -- featured-products.integration.test.ts` apruebe al 100% las aserciones de integración y concurrencia.

- [x] **Tarea 8.3: Escribir pruebas de componentes de interfaz del Backoffice**
  - **Archivos:** `src/test/admin/ProductTable.featured.test.tsx`, `src/test/admin/ProductToolbar.featured.test.tsx`, `src/test/admin/ProductFormModal.featured.test.tsx`
  - **Descripción:** Probar: (1) Conmutador con spinner y toast ante error 409 en `ProductTable`; (2) Badge `"Destacados: X / 10"` y filtro `"Solo Destacados"` con lógica `AND` en `ProductToolbar`; (3) Bloqueo preventivo en creación con cupo lleno en `ProductFormModal`.
  - **Cobertura:** RF-01, RF-02, RF-03, RF-04, RNF-04
  - **Hecho cuando:** `npm test -- src/test/admin/` apruebe todas las pruebas de componentes del Backoffice.

- [x] **Tarea 8.4: Escribir pruebas de integración para el carrusel de la Landing Page**
  - **Archivos:** `src/test/landing/FeaturedProductsCarousel.test.tsx`
  - **Descripción:** Probar: (1) Supresión total del componente cuando la API retorna 0 elementos; (2) Degradación silenciosa ante error 500; (3) Renderizado correcto de enlaces accesibles hacia `/catalogo/$productId` para cada tarjeta cuando hay productos destacados.
  - **Cobertura:** RF-07, RNF-03, RNF-05, CL-01, CL-02
  - **Hecho cuando:** `npm test -- src/test/landing/FeaturedProductsCarousel.test.tsx` pase exitosamente en verde.

- [x] **Tarea 8.5: Validación global de tipado, formateo y linter**
  - **Archivos:** Todo el repositorio
  - **Descripción:** Ejecutar las comprobaciones estáticas en frontend y backend para garantizar que no existan advertencias ni desajustes de tipado TypeScript.
  - **Cobertura:** RNF-01 a RNF-05
  - **Hecho cuando:** `npm run check` (o `npx tsc --noEmit` y `npx --prefix server tsc --noEmit`) finalicen con código de salida 0.
