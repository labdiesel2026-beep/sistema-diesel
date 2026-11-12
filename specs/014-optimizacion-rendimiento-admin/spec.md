# Especificación — Fase 14: Optimización de Rendimiento, Escalabilidad y Carga Masiva del Panel de Administración

**Fase:** 014-optimizacion-rendimiento-admin  
**Versión:** 1.0 (AppSec Architect & Staff Engineer)  
**Fecha:** 2026-11-12  
**Basado en:** Diagnóstico de escalabilidad del Panel de Administración (`src/routes/admin/`) y Backend (`server/src/`)  
**Estado:** Especificación Aprobada para Ejecución  

---

## 1. Contexto y Objetivos

Ante un escenario de carga masiva y operación continua con cientos o miles de productos (500 a +2.000 repuestos diésel con sus respectivas fotografías), el análisis arquitectónico identificó cuatro cuellos de botella críticos:

1. **Bloqueo Operativo y Doble Procesamiento CDR en Subida de Imágenes:**
   - El middleware `uploadRateLimiter` bloquea al administrador tras solo 10 imágenes subidas en 15 minutos (`HTTP 429`), impidiendo la carga fluida de catálogo.
   - Cada imagen subida atraviesa dos veces la tubería de recodificación de `sharp` (primero en `upload.middleware.ts` mediante `processSharpPipeline` y luego en `upload.controller.ts` mediante `sanitizeImageBuffer`), duplicando el consumo de CPU y memoria RAM en el contenedor de Railway.
   - Los esquemas Zod de producto (`productFormSchema`) carecen de cotas superiores (`.max()`) para campos de texto y para el límite de entero de 32 bits (`INT4_MAX`) de PostgreSQL en `price`.
2. **Sobrecarga del DOM y Doble Filtrado Lineal en Tabla de Administración:**
   - `ProductList.tsx` renderiza todas las filas filtradas simultáneamente en el DOM (~25.000 nodos DOM para 500 productos), degradando el hilo principal del navegador.
   - Cada pulsación en el buscador ejecuta dos veces el filtrado lineal sin memoización y resuelve nombres de marcas mediante búsquedas `O(N)`.
3. **Descarga de Imágenes Completas (1080×1080 px) en Miniaturas de 48×48 px:**
   - `ProductThumbnail.tsx` solicita la URL original de Cloudinary sin transformaciones de redimensionamiento y carece de `decoding="async"`, desperdiciando hasta un 96% de ancho de banda al hacer scroll.
4. **Consultas Redundantes de Métricas e Indexación de Ordenamiento:**
   - Cada mutación individual en `AdminContext` dispara `refreshMetrics()`, ejecutando 6 consultas `COUNT(*)` paralelas contra PostgreSQL (Neon), y el listado `ORDER BY created_at DESC` carece de índice dedicado en `schema.prisma`.

---

## 2. Requerimientos Funcionales (RF) y No Funcionales (RNF)

### RF-01: Desbloqueo de Rate Limiting para Carga Operativa de Imágenes
- Ampliar el límite de `uploadRateLimiter` (`POST /api/uploads/product-image`) de `10` a `60` peticiones por ventana de 15 minutos por IP (`UPLOAD_RATE_LIMIT_MAX = 60`), permitiendo un ritmo sostenido de carga administrativa sin sacrificar la protección contra abusos automatizados o ataques de agotamiento de recursos.

### RF-02: Unificación de la Tubería CDR con `sharp` (Zero-Double-Encoding)
- En `upload.middleware.ts`, `processSharpPipeline` debe garantizar el redimensionado proporcional dentro de `1080x1080 px` (`fit: "inside"`, `withoutEnlargement: true`), normalización `srgb`, purgado EXIF/ICC y compresión WebP (`effort: 4`), marcando el archivo en memoria como sanitizado (`isSanitized = true`).
- En `upload.controller.ts`, `uploadProductImage` debe transmitir directamente el buffer ya sanitizado a Cloudinary sin volver a invocar `sanitizeImageBuffer`, conservando `sanitizeImageBuffer` únicamente como fallback defensivo Zero Trust si el controlador fuese invocado fuera del middleware.

### RF-03: Cotas Superiores Estrictas (`.max()`) en Esquemas Zod de Producto
- Tanto en `server/src/schemas/product.schemas.ts` como en `src/lib/validations/admin-schemas.ts`, aplicar límites máximos explícitos:
  - `name`: `.max(200, "El nombre no puede superar los 200 caracteres")`
  - `description`: `.max(5000, "La descripción no puede superar los 5000 caracteres")`
  - `imageUrl`: `.max(2048, "La URL de la imagen es demasiado extensa")`
  - `oem`: `.max(100, "El código OEM no puede superar los 100 caracteres")`
  - `vehicleCompatibility`: `.max(500, "La compatibilidad vehicular no puede superar los 500 caracteres")`
  - `categoryIds`: `.max(50, "No puede seleccionar más de 50 categorías")`
  - `price`: `.max(2147483647, "El precio supera el límite máximo permitido")` (previniendo desbordamiento de `Int` de 32 bits en PostgreSQL).

### RF-04: Paginación Clásica y Memoización `O(1)` en la Tabla del Panel de Administración
- En `ProductList.tsx`, implementar paginación clásica del lado del cliente cuando el listado supere el tamaño de página (por defecto **25 productos por página**, con selector de 25, 50 o 100 por página).
- Incluir barra de paginación inferior accesible con indicador de rango (*"Mostrando X–Y de Z repuestos"*) y botones *Anterior* / *Siguiente*.
- Reiniciar automáticamente la página activa a `1` cuando cambie cualquier filtro (`searchQuery`, `selectedCategory`, `selectedBrand`, `selectedStatus`, `selectedFeatured`, `onlyFeatured`).
- Optimizar la resolución de marcas mediante un `Map<string, string>` memoizado (`O(1)`) y memoizar la lista filtrada con `useMemo` tanto en `ProductList.tsx` como en `admin.index.tsx`.

### RF-05: Transformación Automática de Miniaturas Cloudinary y `decoding="async"`
- En `ProductThumbnail.tsx`, transformar automáticamente las URLs de Cloudinary (`res.cloudinary.com/.../image/upload/...`) inyectando los parámetros `/upload/c_fill,w_96,h_96,q_auto,f_auto/` para servir miniaturas de ~3-5 KB adaptadas a pantallas Retina 2x (48×48 px CSS -> 96×96 px reales).
- Preservar sin cambios las rutas locales (`/uploads/...`), placeholders y Data URLs (`data:image/...`).
- Añadir `decoding="async"` junto con `loading="lazy"` en la etiqueta `<img>`.

### RF-06: Índice de Ordenamiento en BD y Actualización Optimista de Métricas
- Agregar `@@index([createdAt(sort: Desc)])` en el modelo `Product` de `server/prisma/schema.prisma`.
- En `src/context/admin-context.tsx`, calcular y actualizar el estado `metrics` localmente en memoria tras las mutaciones exitosas de productos, categorías y marcas, eliminando las llamadas redundantes por red a `GET /api/admin/metrics` en cada clic.

