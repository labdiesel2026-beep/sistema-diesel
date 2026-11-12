# Plan de Implementación — Fase 14: Optimización de Rendimiento y Escalabilidad del Admin

**Fase:** 014-optimizacion-rendimiento-admin  
**Arquitectura:** Node.js / Express / Sharp / Prisma (PostgreSQL) + React 19 / Vite / Tailwind CSS  
**Regla de Ejecución:** SDD & Zero Trust (Ejecución atómica tarea por tarea con validación en Vitest)  

---

## 1. Arquitectura de Archivos a Modificar

```
server/
├── prisma/
│   └── schema.prisma                         <-- T-04: Índice @@index([createdAt(sort: Desc)]) en Product
├── src/
│   ├── controllers/
│   │   └── upload.controller.ts              <-- T-01: Evitar doble pasada de Sharp si req.file ya fue sanitizado
│   ├── middleware/
│   │   ├── rate-limit.middleware.ts          <-- T-01: Elevar uploadRateLimiter a 60 req / 15 min
│   │   └── upload.middleware.ts              <-- T-01: Unificar resize 1080x1080 (fit: inside, effort: 4) y flag isSanitized
│   └── schemas/
│       └── product.schemas.ts                <-- T-01: Cotas máximas (.max()) de strings e INT4_MAX en price
└── tests/
    ├── rate-limit-middleware.test.ts         <-- T-01: Validar nuevo umbral de 60 peticiones
    ├── cdr-upload.test.ts                    <-- T-01: Verificar ejecución única de Sharp en subida
    └── product-schemas.test.ts               <-- T-01: Pruebas unitarias de cotas máximas (.max())

src/
├── components/
│   └── admin/
│       └── products/
│           ├── ProductList.tsx               <-- T-02: useMemo, Map O(1) de marcas y controles de paginación (25/50/100)
│           └── ProductThumbnail.tsx          <-- T-03: Transformación URL Cloudinary (w_96,h_96,c_fill,q_auto,f_auto) + decoding="async"
├── context/
│   └── admin-context.tsx                     <-- T-04: Sincronización local de métricas sin llamadas redundantes a /api/admin/metrics
├── lib/
│   └── validations/
│       └── admin-schemas.ts                  <-- T-01: Sincronizar cotas máximas (.max()) con backend
├── routes/
│   └── admin.index.tsx                       <-- T-02: Memoizar conteos con useMemo y Map O(1)
└── test/
    └── admin/
        ├── product-list-pagination.test.tsx  <-- T-02: Pruebas de paginación, cambio de página y reseteo por filtros
        └── product-thumbnail.test.tsx        <-- T-03: Pruebas de transformación Cloudinary y decoding="async"
```

---

## 2. Decisiones Arquitectónicas y Justificación de Trade-offs

1. **Unificación de CDR en `uploadSingleImage` con Fallback Zero-Trust en `uploadProductImage`:**
   - *Trade-off:* Eliminar la validación de `upload.controller.ts` por completo podría debilitar la seguridad si el controlador se reutilizara en otra ruta sin el middleware; mantener ambas tal cual duplica el uso de CPU y RAM con `sharp`.
   - *Decisión:* Marcar el objeto `req.file` con una bandera interna (`isSanitized: true`) al finalizar `processSharpPipeline` en `upload.middleware.ts`. En `upload.controller.ts`, si `isSanitized` es verdadero, se envía el buffer directamente al stream de Cloudinary; si no, se ejecuta `sanitizeImageBuffer(req.file.buffer)`. Así obtenemos **0% de trabajo duplicado en producción** y **100% de seguridad Zero Trust en llamadas directas**.

2. **Paginación Clásica en Cliente (25/50/100 filas) frente a Paginación Server-Side o Virtualización:**
   - *Trade-off:* Implementar paginación Server-Side en `GET /api/products` obligaría a cambiar el contrato REST (de `ProductDto[]` a `{ items, total, page }`), rompiendo el catálogo público y las validaciones de integridad referencial en `AdminContext` (`canDeleteCategory`, `canDeleteBrand` que inspeccionan `products` en memoria).
   - *Decisión:* Con 500 a 2.000 productos, el payload JSON comprimido es de ~70-150 KB (se descarga una sola vez en < 300 ms). El cuello de botella real está en montar 25.000 nodos DOM en la tabla. La **paginación clásica en `ProductList.tsx`** acota el DOM a un máximo de 25 filas (~1.200 nodos), mantiene los filtros combinados y búsquedas en 0 ms de latencia, y no rompe ningún contrato existente.

3. **Transformaciones On-the-Fly de Cloudinary en `ProductThumbnail.tsx`:**
   - *Trade-off:* Generar y guardar dos archivos distintos en el backend al subir (imagen principal + thumbnail) duplicaría las llamadas a Cloudinary en la subida y complicaría la purga en `deleteFile`.
   - *Decisión:* Aprovechar el CDN de Cloudinary insertando `/upload/c_fill,w_96,h_96,q_auto,f_auto/` dinámicamente en la URL de la miniatura en el frontend. Reduce el peso de cada miniatura de ~150 KB a ~4 KB sin tocar la base de datos ni el flujo de subida.

4. **Sincronización Local de Métricas en `AdminContext`:**
   - *Trade-off:* Llamar a `refreshMetrics()` (`GET /api/admin/metrics`) después de cada mutación ejecuta 6 queries `COUNT(*)` en PostgreSQL.
   - *Decisión:* Derivar o actualizar las métricas directamente a partir de los estados `products`, `categories` y `brands` en memoria cuando se completan mutaciones exitosas, reservando la consulta de red a la carga inicial (`refreshData`) o invocación manual de `refreshMetrics`.

