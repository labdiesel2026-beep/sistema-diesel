# Tareas de Implementación - Fase 015: Correcciones de Formulario Admin, Taxonomía y Rendimiento Multimedia

- [x] **TASK-01: Esquemas de Datos y Mutaciones Admin para Campos Opcionales**
  - Modificar `server/src/schemas/product.schemas.ts` y `src/lib/validations/admin-schemas.ts` para que `oem`, `oemCode`, `vehicleCompatibility`, `compatibility` admitan `.nullable().optional().default("")`.
  - Normalizar `src/context/admin-context.tsx` (`createProduct` y `updateProduct`) para enviar datos sanitizados sin fallos por `null` o strings vacíos.
  - Asegurar que `ProductFormModal.tsx` no bloquee el formulario cuando estos campos estén vacíos.
  - Actualizar y ejecutar `server/tests/product-schemas.test.ts` y crear/actualizar test en `src/test/admin/ProductFormModal.featured.test.tsx` verificando creación con campos vacíos.

- [x] **TASK-02: Auto-selección Jerárquica de Categorías en Admin y Filtro de Catálogo**
  - En `src/components/admin/products/ProductFormModal.tsx`, implementar en `toggleCategory` la selección automática de la categoría padre cuando se marca una subcategoría, y la deselección de hijas al desmarcar el padre.
  - En `src/lib/catalog-filter.ts`, validar y optimizar `expandCategoryIds` para asegurar que al seleccionar una categoría padre coincidan los productos clasificados con el padre o con cualquiera de sus subcategorías hijas.
  - Validar mediante tests unitarios en `src/test/catalog/catalog-filter.test.ts` y `src/test/admin/ProductFormModal.featured.test.tsx`.

- [x] **TASK-03: Estética Transparente de Marcas y Optimización de Videos con IntersectionObserver**
  - En `src/components/landing/BrandsMarquee.tsx`, eliminar fondo, bordes y sombras (`bg-transparent border-none shadow-none`) para que los logos queden fundidos con el fondo oscuro.
  - Crear hook reusable `src/hooks/useViewportVideo.ts` con `IntersectionObserver` (`.play()` en viewport, `.pause()` al salir, control de promesas y fallback).
  - Integrar `useViewportVideo` en `src/components/landing/BenchShowcaseSection.tsx` y `src/components/landing/WarrantySection.tsx`, con `preload="metadata"`, `muted`, `playsInline` y desacoplado de animaciones pesadas.
  - Validar con tests unitarios en `BrandsMarquee.test.tsx` y build completo de la aplicación.
