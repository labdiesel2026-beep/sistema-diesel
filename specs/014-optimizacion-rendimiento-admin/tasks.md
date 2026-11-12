# Tareas de Ejecución — Fase 14: Optimización de Rendimiento y Escalabilidad del Admin

**Fase:** 014-optimizacion-rendimiento-admin  
**Regla Inquebrantable:** Ejecutar estrictamente **UNA tarea a la vez**, validar con la suite de pruebas (`vitest`), marcar la tarea como `[x]` y **DETENERSE**.

---

- [x] **T-01: Desbloqueo Operativo de Subidas, Eliminación de Doble CDR Sharp y Cotas Zod en Frontera**
  - En `server/src/middleware/rate-limit.middleware.ts`, incrementar `uploadRateLimiter` de `10` a `60` peticiones por ventana de 15 minutos (`UPLOAD_RATE_LIMIT_MAX = 60`).
  - En `server/src/middleware/upload.middleware.ts` y `server/src/controllers/upload.controller.ts`, unificar el redimensionamiento a `1080x1080` (`fit: "inside"`, `withoutEnlargement: true`, `effort: 4`) y evitar la segunda recodificación redundante con `sharp` mediante la marca `isSanitized` en `req.file`, manteniendo fallback defensivo Zero Trust.
  - En `server/src/schemas/product.schemas.ts` y `src/lib/validations/admin-schemas.ts`, agregar cotas máximas (`.max()`) para `name` (200), `description` (5000), `imageUrl` (2048), `oem` (100), `vehicleCompatibility` (500), `categoryIds` (50) y `price` (`2147483647` — `INT4_MAX` de PostgreSQL).
  - Actualizar y agregar pruebas unitarias en `server/tests/rate-limit-middleware.test.ts`, `server/tests/cdr-upload.test.ts` y `server/tests/product-schemas.test.ts`, ejecutando `vitest` para verificar que todo pase en verde.

- [x] **T-02: Paginación Clásica en Tabla de Administración y Memoización O(1) de Búsqueda y Filtros**
  - En `src/components/admin/products/ProductList.tsx` y `src/routes/admin.index.tsx`, optimizar la resolución de nombres de marcas con un `Map<string, string>` memoizado (`O(1)`) y envolver el filtrado multifaceta en `useMemo` para erradicar el doble filtrado en cada pulsación de tecla.
  - Implementar paginación clásica en `src/components/admin/products/ProductList.tsx` (tamaño por defecto: 25 filas por página, selector de 25 / 50 / 100, botones *Anterior* y *Siguiente*, indicador *"Mostrando X–Y de Z repuestos"* y reseteo automático a página 1 al cambiar cualquier filtro o búsqueda).
  - Crear pruebas unitarias en `src/test/admin/product-list-pagination.test.tsx` y validar que toda la suite existente de `ProductList` continúe en verde.

- [x] **T-03: Optimización de Miniaturas Cloudinary (`w_96,h_96,c_fill,q_auto,f_auto`) y Decodificación Asíncrona**
  - En `src/components/admin/products/ProductThumbnail.tsx`, implementar `getOptimizedThumbnailUrl(src)` para inyectar `/upload/c_fill,w_96,h_96,q_auto,f_auto/` en URLs de Cloudinary sin alterar rutas locales ni Data URLs, y añadir `decoding="async"` a la etiqueta `<img>`.
  - Crear pruebas unitarias en `src/test/admin/product-thumbnail.test.tsx` y validar con `vitest`.

- [x] **T-04: Indexación de Ordenamiento en Prisma, Sincronización Optimista de Métricas y Verificación Integral**
  - En `server/prisma/schema.prisma`, añadir `@@index([createdAt(sort: Desc)])` al modelo `Product`.
  - En `src/context/admin-context.tsx`, sincronizar automáticamente el objeto `metrics` en memoria cuando cambian `products`, `categories` o `brands` tras mutaciones exitosas, evitando disparar las 6 consultas `COUNT(*)` de `refreshMetrics()` en cada acción individual.
  - Ejecutar la suite completa de pruebas de backend y frontend (`vitest`) y verificar el build de producción (`npm run build`).
