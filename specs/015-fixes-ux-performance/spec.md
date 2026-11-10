# Especificación Técnica - Fase 015: Correcciones de Formulario Admin, Taxonomía y Rendimiento Multimedia

**Estado:** Aprobado  
**Fecha:** 2026-11-10  
**Contexto:** Post-Aceptación en Producción (`labdiesel.com.ar`)  
**Autor:** Staff AppSec Architect & Tech Lead  

---

## 1. Objetivos y Alcance

Resolver quirúrgicamente 3 incidentes reportados en producción que afectan la operatividad del backoffice, la consistencia de navegación por categorías en el catálogo y la experiencia de usuario (fluidez y estética) en la landing page:

1. **Permitir creación y edición de productos sin Código OEM y sin Compatibilidad Vehicular:**
   - La causa raíz identificada es que `admin-context.tsx` transforma strings vacíos en `null` (`input.oem ? input.oem.trim() : null`), mientras que los esquemas Zod en `server/src/schemas/product.schemas.ts` y `src/lib/validations/admin-schemas.ts` usan `z.string().trim().max(...).optional().default("")` sin `.nullable()`, lo que causa que Zod rechace el payload con `Expected string, received null`.
   - Adaptar esquemas en frontend y backend para aceptar `string`, `null`, `undefined` o string vacío `""` (`.nullable().optional().default("")`).
   - Normalizar `ProductFormModal.tsx` y `admin-context.tsx` para enviar strings limpios y garantizar que `validateField` y `handleSubmit` no bloqueen el formulario si ambos campos están vacíos.

2. **Auto-marcado de Categoría Padre al seleccionar Subcategoría y Consistencia en Catálogo:**
   - En `ProductFormModal.tsx`, al marcar (`check`) cualquier subcategoría (categoría con `parentId !== null`), se debe agregar automáticamente el `id` de la subcategoría y su `parentId` al array de `categoryIds` seleccionados (utilizando `Set` para prevenir duplicados).
   - Al desmarcar (`uncheck`) una categoría padre, desmarcar congruentemente sus subcategorías hijas.
   - En `src/routes/catalogo.tsx` y `src/lib/catalog-filter.ts`, asegurar que la expansión de categorías (`expandCategoryIds`) garantice que los productos asociados a subcategorías aparezcan al filtrar por la categoría padre.

3. **Estética Transparente en Carrusel de Marcas y Fluidez de Videos en Landing:**
   - En `src/components/landing/BrandsMarquee.tsx`, reemplazar las clases de fondo y borde de las tarjetas (`bg-[#161B26] border border-slate-800/80 rounded-lg shadow-sm`) por `bg-transparent border-none shadow-none` para fundir los logos perfectamente con el fondo oscuro sin recuadros ni destellos azulados.
   - En los reproductores multimedia de la landing (`BenchShowcaseSection.tsx` y `WarrantySection.tsx`), implementar `IntersectionObserver` para que el método `.play()` solo se invoque cuando el elemento sea visible en el viewport (`isIntersecting === true`), y se ejecute `.pause()` inmediatamente al salir. Configurar `preload="metadata"`, `playsInline`, `muted`, y desacoplar de transformaciones CSS pesadas de Framer Motion.

---

## 2. Requerimientos Funcionales y No Funcionales

### RF-01: Flexibilidad de Atributos Opcionales en Catálogo
- Tanto en alta como en edición, `oem` / `oemCode` y `vehicleCompatibility` / `compatibility` deben ser estrictamente opcionales.
- Aceptan valores nulos, indefinidos o vacíos sin error de validación en frontend ni backend.

### RF-02: Auto-selección Jerárquica de Categorías
- Al seleccionar una subcategoría en `ProductFormModal.tsx`, el sistema añade automáticamente su `parentId` a `categoryIds`.
- La jerarquía de selección previene estados huérfanos donde un repuesto pertenezca a una subcategoría pero no a su familia raíz.

### RF-03: Integración de Filtros en Catálogo
- Al filtrar por una categoría raíz en el catálogo, se muestran los productos clasificados en dicha categoría raíz y en cualquiera de sus subcategorías descendientes.

### RF-04: Marcas Transparentes y Homogéneas
- El carrusel continuo de marcas (`BrandsMarquee.tsx`) no debe exhibir bordes, fondos de tarjeta ni contenedores visibles.

### RNF-01: Eficiencia Multimedia y Desempeño del Compositor
- Los videos en la landing solo deben decodificarse y reproducirse cuando están en el viewport.
- Fuera del viewport, los videos se pausan inmediatamente, liberando hilos de CPU y el decodificador por hardware del dispositivo móvil o de escritorio.

---

## 3. Seguridad y Zero Trust
- Los esquemas Zod en backend preservan `.strict()`, sanitización con `.trim()` y longitud máxima estricta (`.max(100)` para OEM y `.max(500)` para compatibilidad).
- No se expone información interna en errores de validación.

