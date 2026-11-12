# Especificación — Fase 14: Correcciones de Aceptación en Producción (11 Puntos Críticos)

**Fase:** 014-produccion-fixes-11-puntos  
**Versión:** 1.0 (AppSec Architect & UI Tech Lead)  
**Fecha:** 2026-11-10  
**Dominio de Producción:** `https://labdiesel.com.ar`  
**Estado:** Especificación Aprobada para Ejecución  

---

## 1. Contexto y Objetivos

Tras la ejecución de pruebas de aceptación en el entorno de producción (`https://labdiesel.com.ar`), se han detectado 11 puntos de fricción operativa, inconsistencias de validación, degradación de contraste UI y oportunidades de posicionamiento orgánico (SEO). Esta fase implementa de manera quirúrgica y exhaustiva las correcciones requeridas, asegurando compatibilidad regresiva, validación Fail-Fast (.strict()), y cero regresiones en los tests automatizados.

---

## 2. Requerimientos Funcionales (RF)

### RF-01: Extensión de Sesión Admin y Resiliencia 401 (Silent Refresh)
- **Token JWT y Expiración:**
  - En `server/src/config/env.ts` y `server/src/services/auth.service.ts`, configurar el tiempo de vida de la sesión administrativa a 12 horas (`JWT_ACCESS_EXPIRATION: '12h'` / 43200s) tanto para el token firmado como para la cookie HttpOnly (`maxAge: 43200000ms`).
- **Resiliencia en Cliente HTTP (`src/lib/api.ts` y `src/lib/api-client.ts`):**
  - Si una petición recibe `401 Unauthorized` (y no es `/auth/login` ni `/auth/refresh`):
    1. Intenta renovar la sesión llamando a `POST /api/auth/refresh` con `credentials: 'include'`.
    2. Si devuelve un nuevo token, se actualiza en memoria volátil y se reintenta transparentemente la petición original.
    3. Si el refresh falla con 401/403, invoca el disparador de desautorización (`SHOW_REAUTH_MODAL`) y retiene la solicitud para que el usuario no pierda su trabajo.
  - Asegurar que `api.upload()` gestione 401 mediante este mismo pipeline resiliente.
- **Feedback Visual de Expiración:**
  - En `ReauthModal` (`src/context/AuthContext.tsx`), mostrar una alerta visible: *"Tu sesión expiró por inactividad. Ingresa tu contraseña para continuar sin perder los cambios del formulario"*.

### RF-02: Flexibilización de "Código OEM" y "Compatibilidad Vehicular"
- **Backend (`server/src/schemas/product.schemas.ts`):**
  - Permitir que `oem` (y alias `oemCode`) y `vehicleCompatibility` (y alias `compatibility`) sean opcionales y admitan cadena vacía `""` con `.optional().default('')`.
  - Asegurar que `productFormSchema`, `createProductSchema` y `updateProductSchema` no fallen cuando se envíen vacíos.
- **Frontend (`ProductCard`, `CartDrawer`, `FeaturedProductsCarousel`, `ProductFormModal`):**
  - Si `product.oem` o `product.oemCode` están vacíos o no tienen valor, no mostrar cadenas rotas como `"OEM "`. Mostrar `"OEM S/N"` o badge nulo/vacío según el componente.
  - Actualizar o añadir tests en `server/tests/product-schemas.test.ts`.

### RF-03: Contraste y Formato del Precio en `CartDrawer`
- En las tarjetas del carrito en `src/components/catalog/CartDrawer.tsx`:
  - Cambiar el color del subtotal del ítem a `text-white font-extrabold text-sm sm:text-base`.
  - Si el producto está pendiente de cotización, mostrar `[A Cotizar]` en `text-amber-400 font-bold`.
  - Cuando `item.quantity > 1`, presentar el precio unitario en una línea separada debajo (`block text-[11px] font-mono text-slate-400 mt-0.5`): `(${formatPrice(item.price)} ARS c/u)`.

### RF-04: Controles de Cantidad y Cabecera Responsive en Mobile (`CartDrawer`)
- En el header de `src/components/catalog/CartDrawer.tsx`:
  - Utilizar un contenedor flex limpio `flex items-center justify-between gap-2 pr-8` evitando superposiciones con el botón de cierre de la hoja.
  - Título con badge de cantidad `shrink-0` a la izquierda y botón "Vaciar" `shrink-0 text-xs px-2.5 py-1.5` a la derecha.
- En los controles inferiores de cada tarjeta:
  - Fila con `flex items-center justify-between gap-2 pt-2`.
  - Grupo de botones de cantidad con `shrink-0`, botones de ancho `w-8 h-8` y número/input legible de `w-11` sin desbordes en pantallas de 320px-375px.

### RF-05: Carga Instantánea del Carrito (Snapshot) y Optimización Cloudinary
- **Caché en Storage (`cart-storage.ts`, `catalog-cart-context.tsx`, `CartDrawer.tsx`):**
  - Permitir persistir en `lastKnown` / snapshot los atributos de renderizado (`name, oem, imageUrl, brandName, condition, price, showPrice`) para que al abrir el carrito no aparezca "SIN IMAGEN" ni "A COTIZAR" mientras se revalidan datos.
- **Optimización Cloudinary (`src/lib/formatters.ts` / `src/lib/api.ts`):**
  - Implementar en `resolveImageUrl(url, options?: { width?: number })` la inyección automática de transformaciones Cloudinary: `/upload/f_auto,q_auto,w_${width || 600}/`.
  - Usar `width: 160` en miniaturas del carrito y admin, y `width: 600` en catálogo general.

### RF-06: Carga Inmediata del Título en Hero y Fuentes Web No Bloqueantes
- En `src/routes/__root.tsx`:
  - Enlaces preconnect a `https://fonts.googleapis.com` y `https://fonts.gstatic.com`.
  - Carga de fuentes vía `<link rel="stylesheet">` de Google Fonts.
- En `HeroSection.tsx`:
  - Evitar que `<h1>` inicie en `opacity: 0` que oculte el Largest Contentful Paint (LCP) durante la hidratación.

### RF-07: Aceleración de Catálogo y Caché Stale-While-Revalidate
- En `src/hooks/useCatalogData.ts`:
  - Caché singleton en memoria con revalidación en segundo plano y fallback en `sessionStorage` para productos, marcas y categorías.
- En el backend (`product.routes.ts`, `category.routes.ts`, `brand.routes.ts`):
  - Inyectar cabeceras `Cache-Control: public, max-age=60, stale-while-revalidate=300` en rutas públicas de consulta.
- En `LandingPage.tsx`:
  - Precarga pasiva de los datos del catálogo en segundo plano.

### RF-08: Paginación Progresiva ("Cargar Más") y Botón "Volver Arriba" en Catálogo
- En `src/routes/catalogo.tsx`:
  - Renderizado paginado con `INITIAL_VISIBLE_COUNT = 9` (o `12`).
  - Reinicio del contador ante cambios en filtros o búsqueda.
  - Botón "Cargar más repuestos (+9)" con contador "Mostrando X de Y repuestos".
  - Botón flotante suave de "Volver arriba" al scrollear > 600px en el catálogo.

### RF-09: Jerarquía de Categorías en Formulario de Producto
- En `ProductFormModal.tsx` (`src/components/admin/products/ProductFormModal.tsx`):
  - Agrupar y ordenar alfabéticamente las categorías raíz (`parentId === null`), y anidar debajo de cada raíz sus subcategorías hijas (`cat.parentId === root.id`) con sangría visual clara (`ml-6 pl-3 border-l-2 border-[#FF6B00]/40`).

### RF-10: Optimización de Rendimiento de Scroll en `BrandsMarquee`
- En `BrandsMarquee.tsx`:
  - Eliminar clases de coste excesivo en GPU (`backdrop-blur-md`) de las tarjetas individuales en favor de un fondo sólido eficiente `bg-[#161B26] border border-slate-800/80`.
  - Incorporar `will-change-transform` y `transform-gpu` al riel continuo.
  - Asegurar `decoding="async"` y carga fluida de logos.

### RF-11: SEO Técnico y Posicionamiento para `labdiesel.com.ar`
- En `src/routes/__root.tsx`:
  - `<title>` optimizado con "Laboratorio Diésel (LabDiesel)".
  - Metadatos completos: descripción, keywords con términos clave diésel y ubicación Villa Mercedes, San Luis, Argentina.
  - Open Graph y Canonical URL hacia `https://labdiesel.com.ar`.
  - JSON-LD con Schema.org `AutoPartsStore` / `AutomotiveBusiness`.
- En `public/robots.txt`:
  - Crawlers permitidos en `/` y `/catalogo`, bloqueo de `/admin`, enlace a Sitemap.
- En `public/sitemap.xml`:
  - Declaración canónica de rutas principales para Google Search Console.

