# Tareas de Ejecución — Fase 14: Correcciones de Aceptación en Producción

**Fase:** 014-produccion-fixes-11-puntos  
**Regla:** Ejecutar de forma atómica y justificada, verificando tests y builds sin romper funcionalidades existentes.

---

- [x] **T-01: Extensión de Sesión Admin y Manejo de Expiración (401)**
  - Modificar `server/src/config/env.ts` para que `JWT_ACCESS_EXPIRATION` tenga valor por defecto `'12h'`.
  - Actualizar `server/src/services/auth.service.ts` y `server/src/controllers/auth.controller.ts` para usar 12 horas (43200s / 43200000ms).
  - En `src/lib/api.ts` y `src/lib/api-client.ts`, implementar el intento automático de silent refresh ante 401 en `request()` y `upload()` antes de emitir `SHOW_REAUTH_MODAL`.
  - En `src/context/AuthContext.tsx` (`ReauthModal`), incorporar la alerta visible indicando *"Tu sesión expiró por inactividad. Ingresa tu contraseña para continuar sin perder los cambios del formulario"*.

- [x] **T-02: Opcionales "Código OEM" y "Vehículo/Motor Compatible" en Backend y Frontend**
  - En `server/src/schemas/product.schemas.ts`, permitir string vacío `''` u omitido con `.optional().default('')` en `oem` / `oemCode` y `vehicleCompatibility` / `compatibility`.
  - Exportar `createProductSchema` y `updateProductSchema` garantizando compatibilidad.
  - En frontend (`ProductCard`, `CartDrawer`, `FeaturedProductsCarousel`, `ProductFormModal`), evitar el renderizado de `"OEM "` cuando el valor sea vacío, mostrando `"OEM S/N"` o badge oculto.
  - Actualizar pruebas en `server/tests/product-schemas.test.ts`.

- [x] **T-03: Contraste del Precio y Formato en `CartDrawer.tsx`**
  - Cambiar el subtotal del ítem a `text-white font-extrabold text-sm sm:text-base`.
  - Mantener `[A Cotizar]` en `text-amber-400 font-bold`.
  - Desplegar el precio unitario en una línea separada debajo cuando `quantity > 1` (`block text-[11px] font-mono text-slate-400 mt-0.5`): `(${formatPrice(item.price)} ARS c/u)`.

- [x] **T-04: Controles de Cantidad y Cabecera Responsive en `CartDrawer.tsx`**
  - Limpiar el `<SheetHeader>` usando un contenedor flex `flex items-center justify-between gap-2 pr-8`, con título y badge `shrink-0` a la izquierda y botón "Vaciar" `shrink-0 text-xs px-2.5 py-1.5` a la derecha.
  - En la fila inferior de cada tarjeta, usar `flex items-center justify-between gap-2 pt-2` con controles de cantidad `shrink-0` (botones `w-8 h-8` y visualizador de ancho `w-11`).

- [x] **T-05: Carga Instantánea de Imágenes/Datos en Carrito y Optimización Cloudinary**
  - Permitir guardar en `CartItemCache.lastKnown` los datos visuales (`name, oem, imageUrl, brandName, condition, price, showPrice`) en `src/lib/cart-storage.ts` y `src/context/catalog-cart-context.tsx`.
  - En `src/components/catalog/CartDrawer.tsx`, utilizar el snapshot inmediato para evitar mostrar *"SIN IMAGEN"* o *"A COTIZAR"* falsos antes de completar la consulta remota.
  - Crear `src/lib/formatters.ts` con `resolveImageUrl(imageUrl, options?: { width?: number })` que transforme URLs de Cloudinary con `f_auto,q_auto,w_${width || 600}`, y aplicarlo en `CartDrawer` (`w_160`) y catálogo (`w_600`).

- [x] **T-06: Carga Inmediata del Título Hero y Fuentes No Bloqueantes**
  - En `src/routes/__root.tsx`, agregar `preconnect` a Google Fonts y la etiqueta `<link rel="stylesheet">` con JetBrains Mono, Plus Jakarta Sans y Space Grotesk / Barlow / Manrope.
  - En `src/components/landing/HeroSection.tsx`, asegurar que el `<h1>` de "LABORATORIO DIÉSEL" no arranque con `opacity: 0` para optimizar el LCP de la landing.

- [x] **T-07: Aceleración de Catálogo y Caché Stale-While-Revalidate**
  - Crear `src/hooks/useCatalogData.ts` con caché singleton en memoria (staleTime 60s) y soporte de hidratación rápida desde `sessionStorage`.
  - En las rutas del backend (`product.routes.ts`, `category.routes.ts`, `brand.routes.ts`), agregar cabeceras `Cache-Control: public, max-age=60, stale-while-revalidate=300`.
  - En `LandingPage.tsx`, precargar en segundo plano los datos del catálogo.

- [x] **T-08: Paginación Progresiva ("Cargar Más") y Botón "Volver Arriba" en Catálogo**
  - En `src/routes/catalogo.tsx`, configurar `INITIAL_VISIBLE_COUNT = 9` y estado `visibleCount`.
  - Reiniciar `visibleCount` ante cambios en búsqueda o filtros.
  - Renderizar `filteredProducts.slice(0, visibleCount)` y el botón "Cargar más repuestos (+9)" con contador cuando haya más ítems.
  - Agregar botón flotante de "Volver arriba" al scrollear > 600px en el catálogo.

- [x] **T-09: Jerarquía de Categorías y Subcategorías en `ProductFormModal.tsx`**
  - En `src/components/admin/products/ProductFormModal.tsx`, agrupar categorías raíz (`parentId === null`) ordenadas alfabéticamente.
  - Renderizar inmediatamente debajo de cada raíz sus subcategorías hijas con indentación visual (`ml-6 pl-3 border-l-2 border-[#ea580c]/40`).

- [x] **T-10: Eliminación de Traba de Scroll en `BrandsMarquee.tsx`**
  - En `src/components/landing/BrandsMarquee.tsx`, remover cualquier `backdrop-blur-md` individual y emplear fondo sólido `bg-[#161B26] border border-slate-800/80`.
  - Añadir `will-change-transform` y `transform-gpu` (`transform: translate3d(0,0,0)`) en el riel de animación.
  - Asegurar `decoding="async"` en los logotipos.

- [x] **T-11: SEO Técnico, Robots.txt y Sitemap.xml para `labdiesel.com.ar`**
  - En `src/routes/__root.tsx`, configurar `<title>` con "Laboratorio Diésel (LabDiesel)", meta description, keywords, Open Graph y bloque `<script type="application/ld+json">` con Schema.org `AutoPartsStore`.
  - En `public/robots.txt`, permitir crawlers en `/` y `/catalogo`, bloquear `/admin` y apuntar al sitemap.
  - Crear `public/sitemap.xml` con las rutas canónicas del sitio.

- [x] **T-12: Verificación Integral de Compilación y Suite de Pruebas**
  - Ejecutar `npm test` en frontend y server.
  - Ejecutar `npm run build` en frontend y server verificando 0 errores de TypeScript y empaquetado.
