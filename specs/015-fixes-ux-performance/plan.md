# Plan de Implementación - Fase 015: Correcciones de Formulario Admin, Taxonomía y Rendimiento Multimedia

**Estado:** Aprobado  
**Enfoque:** Atómico, Zero Trust y Verificación Continua con Vitest  

---

## 1. Arquitectura de Cambios

### Componente 1: Esquemas de Datos y Formulario de Productos
- **Archivos:**
  - `server/src/schemas/product.schemas.ts`: Configurar `.nullable().optional().default("")` o normalizar a string vacío en `oem`, `oemCode`, `vehicleCompatibility`, `compatibility`.
  - `src/lib/validations/admin-schemas.ts`: Alinear esquemas con `.nullable().optional().default("")`.
  - `src/context/admin-context.tsx`: En `createProduct` y `updateProduct`, enviar `oem: input.oem ? input.oem.trim() : ""` (o permitir null gracias al schema).
  - `src/components/admin/products/ProductFormModal.tsx`: Asegurar que `validateField` y `handleSubmit` no exijan longitud mínima en OEM ni compatibilidad, y que ningún atributo HTML `required` esté presente.
  - Tests en `src/test/admin/ProductFormModal.featured.test.tsx` o nuevo `ProductFormModal.test.tsx`.

### Componente 2: Taxonomías Jerárquicas
- **Archivos:**
  - `src/components/admin/products/ProductFormModal.tsx`: En `toggleCategory`, si `targetCat.parentId` existe y se marca la categoría, auto-marcar `targetCat.parentId`. Si se desmarca una categoría raíz, desmarcar congruentemente todas las subcategorías con ese `parentId`.
  - `src/lib/catalog-filter.ts`: Garantizar que `expandCategoryIds` resuelva de manera confiable todas las subcategorías hijas directas e indirectas asociadas a las categorías seleccionadas.
  - `src/test/catalog/catalog-filter.test.ts`: Verificar test cases con categorías anidadas.

### Componente 3: Marcas y Optimización de Rendimiento de Video
- **Archivos:**
  - `src/components/landing/BrandsMarquee.tsx`: Reemplazar `bg-[#161B26] border border-slate-800/80 rounded-lg px-3 py-1.5 shadow-sm` por `bg-transparent border-none shadow-none px-3 py-1.5`.
  - `src/hooks/useViewportVideo.ts`: Crear hook personalizado `useViewportVideo` que administre un `IntersectionObserver`, gestione promesas de reproducción seguras con `.catch()`, pause inmediatamente cuando `!entry.isIntersecting` y configure `preload="metadata"`.
  - `src/components/landing/BenchShowcaseSection.tsx` y `src/components/landing/WarrantySection.tsx`: Integrar `useViewportVideo`, remover `autoPlay` estático no controlado, y desacoplar de wrappers con animaciones pesadas de traslación en Framer Motion.

---

## 2. Plan de Pruebas y Validación
- Pruebas unitarias de Zod en servidor (`server/tests/product-schemas.test.ts`).
- Pruebas unitarias del modal (`ProductFormModal`).
- Pruebas unitarias del filtro de catálogo (`catalog-filter.test.ts`).
- Pruebas de render de marcas (`BrandsMarquee.test.tsx`).
- Ejecución completa de suites Vitest en frontend (`npm test -- --run`).
- Compilación de TypeScript y bundle de producción en frontend y backend (`npm run build`).

