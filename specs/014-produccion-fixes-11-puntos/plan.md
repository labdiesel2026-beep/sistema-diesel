# Plan de Implementación — Fase 14: Correcciones de Aceptación en Producción

**Fase:** 014-produccion-fixes-11-puntos  
**Arquitectura:** React 19 / Express / Prisma / Tailwind CSS v4 / TanStack Router  
**Seguridad:** OWASP ASVS V5, Zero Trust, JWT HttpOnly, Validación Zod Fail-Fast (.strict())  

---

## 1. Arquitectura de Archivos y Componentes Modificados

```
server/
├── src/
│   ├── config/
│   │   └── env.ts                          <-- JWT_ACCESS_EXPIRATION default '12h'
│   ├── controllers/
│   │   └── auth.controller.ts             <-- Cookie maxAge 12h
│   ├── routes/
│   │   ├── product.routes.ts              <-- Cache-Control header
│   │   ├── category.routes.ts             <-- Cache-Control header
│   │   └── brand.routes.ts                <-- Cache-Control header
│   ├── schemas/
│   │   └── product.schemas.ts             <-- oem & vehicleCompatibility opcionales (default "")
│   └── services/
│       └── auth.service.ts                <-- 12h token expiration
└── tests/
    └── product-schemas.test.ts            <-- Validación de opcionales

src/
├── components/
│   ├── admin/products/
│   │   └── ProductFormModal.tsx           <-- Árbol jerárquico raíz -> hijas en Categorías Asociadas
│   ├── catalog/
│   │   ├── CartDrawer.tsx                 <-- Contraste precios, layout responsive mobile y snapshots
│   │   └── ProductCard.tsx                <-- Prevención "OEM " vacío
│   └── landing/
│       ├── BrandsMarquee.tsx              <-- Eliminación de backdrop-blur, will-change-transform
│       ├── FeaturedProductsCarousel.tsx   <-- "OEM S/N" ante oem vacío
│       ├── HeroSection.tsx                <-- h1 visible en SSR (LCP optimizado)
│       └── LandingPage.tsx                <-- Precarga pasiva del catálogo
├── context/
│   ├── AuthContext.tsx                    <-- Mensaje de inactividad en ReauthModal
│   └── catalog-cart-context.tsx           <-- Snapshot enriquecido en add()
├── hooks/
│   └── useCatalogData.ts                  <-- NUEVO: Hook singleton con stale-while-revalidate y sessionStorage
├── lib/
│   ├── api.ts                             <-- Silent refresh en request/upload y resolveImageUrl con Cloudinary
│   ├── cart-storage.ts                    <-- Validación flexible de snapshot en lastKnown
│   └── formatters.ts                      <-- NUEVO: Formateadores y transformaciones de Cloudinary w_160/w_600
├── routes/
│   ├── __root.tsx                         <-- Preconnect fonts, SEO meta tags, OpenGraph y JSON-LD
│   └── catalogo.tsx                       <-- Paginación progresiva (Load More) y botón Volver arriba
└── public/
    ├── robots.txt                         <-- Disallow /admin, Sitemap declaration
    └── sitemap.xml                        <-- Sitemap canónico para labdiesel.com.ar
```

---

## 2. Decisiones Técnicas y Justificación de Trade-offs

1. **Sesión de 12 Horas (`JWT_ACCESS_EXPIRATION: '12h'`):**
   - *Decisión:* Ampliar el valor por defecto de expiración de sesión a 12 horas y sincronizar la cookie HttpOnly con 43200s.
   - *Justificación:* En talleres mecánicos y operaciones de repuestos, los administradores mantienen la pestaña abierta durante toda la jornada. 12 horas cubre la jornada laboral completa sin requerir re-autenticaciones a mitad de carga de inventario, manteniendo el token protegido en cookie HttpOnly con SameSite estricto.

2. **Silent Refresh Transparente con Reintento Atómico:**
   - *Decisión:* Si `api.request()` o `api.upload()` reciben un `401`, antes de invalidar o arrojar error, invocan `POST /api/auth/refresh` con `credentials: 'include'`. Si es exitoso, actualizan el token y repiten la llamada original. Si falla, disparan `SHOW_REAUTH_MODAL`.
   - *Justificación:* Evita que subidas de imágenes o altas de productos se interrumpan bruscamente por expiración del token volátil, recuperando la sesión automáticamente si la cookie de refresco es válida.

3. **Flexibilización de `oem` y `vehicleCompatibility`:**
   - *Decisión:* Permitir cadenas vacías o ausencia de campo en `productFormSchema` del backend con `.optional().default('')`.
   - *Justificación:* No todos los repuestos diésel (e.g. insumos universales, arandelas de cobre, mangueras) poseen número de pieza OEM o compatibilidad vehicular unívoca. Obligar a completarlos forzaba al usuario a inventar texto o bloqueaba el alta.

4. **Snapshot de Ítems en Carrito:**
   - *Decisión:* Almacenar `{ id, name, oem, price, imageUrl, brandName, condition, showPrice }` dentro del snapshot del carrito en `localStorage`.
   - *Justificación:* Al abrir el carrito por primera vez o refrescar la página, el usuario ve inmediatamente los productos tal como los agregó, eliminando la sensación de rotura visual ("SIN IMAGEN" o "A COTIZAR") mientras se consulta la API en segundo plano.

5. **Transformación Dinámica de URLs de Cloudinary:**
   - *Decisión:* Interceptar URLs de `res.cloudinary.com` en `resolveImageUrl()` para inyectar `f_auto,q_auto,w_${width}`.
   - *Justificación:* Disminuye el peso de transferencia de imágenes de 2MB a ~30KB en miniaturas (`w_160`) y ~150KB en tarjetas (`w_600`), reduciendo drásticamente el consumo de ancho de banda y acelerando la interacción en redes móviles.

6. **SEO Estructurado con JSON-LD:**
   - *Decisión:* Inyectar Schema.org `AutoPartsStore` con `Laboratorio Diésel` y `LabDiesel` en `__root.tsx`.
   - *Justificación:* Maximiza el posicionamiento en Google Search para búsquedas locales y nacionales ("Laboratorio Diésel", "LabDiesel", "inyectores diésel", "Villa Mercedes", "San Luis").

