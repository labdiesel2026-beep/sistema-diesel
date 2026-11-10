# Especificación — Fase 13: Mejoras Frontend (Modales de Producto, Políticas en Footer, Responsive Mobile Banner y Botón Volver Arriba)

**Fase:** 013-mejoras-frontend-dialogs-footer-mobile  
**Versión:** 1.0 (AppSec Architect & UI Tech Lead)  
**Fecha:** 2026-11-09  
**Basado en:** Specs 002-landing-page, 003-catalogo, 007-identidad-marcas-politicas-cta, 009-rediseño-ui-premium, 010-rediseño-premium  
**Estado:** Especificación Aprobada para Ejecución  

---

## 1. Contexto y Objetivos

El cliente ha solicitado cuatro mejoras específicas en la interfaz de usuario frontend (`sistema-diesel-main`), preservando con máxima fidelidad la estética oscura de ingeniería industrial (paleta de carbón mineral, bordes hairlines `border-white/10`, tipografía técnica mono/display, y componentes accesibles de `@radix-ui/react-dialog` vía `shadcn/ui`):

1. **Modal de Detalles de Producto en el Catálogo:** Proporcionar una visualización modal inmediata (`Dialog`) al hacer clic sobre la imagen o el título de un producto sin abandonar la vista del catálogo ni perder los filtros aplicados. Blindar la propagación de eventos (`e.stopPropagation()`) para que el botón existente "Agregar al Carrito" continúe operando de forma atómica sin disparar el modal.
2. **Modales de Políticas Institucionales en el Footer:** Incorporar modales accesibles (`Dialog`) para "Política de Privacidad" (conforme a Ley 25.326 de Protección de Datos Personales de Argentina) y "Aviso Legal y Términos" (precios orientativos, referencias OEM y garantía de calibración de 30 días), permitiendo su lectura directa sin recargar la página ni navegar a rutas secundarias.
3. **Optimización Responsive del Banner de Políticas en Mobile:** En dispositivos móviles, evitar la oclusión del banner de aceptación por la barra fija inferior (`MobileStickyBar`, altura 64px) y botones flotantes, elevando su posición (`bottom-24 md:bottom-6`) y jerarquía de capas (`z-50`).
4. **Transformación Estética del Botón "Volver Arriba":** Rediseñar el enlace del Footer para que adopte apariencia de control interactivo real mediante la especificación exacta de clases utilitarias de Tailwind.

---

## 2. Requerimientos Funcionales (RF)

### RF-01: Modal de Ficha Técnica Detallada de Producto (`ProductDetailModal`)
- **Disparador:** Clic sobre el contenedor multimedia de la imagen o sobre el título de producto en `ProductCard`.
- **Aislamiento de Eventos (AppSec & Event Bubble Defense):** El clic en "Agregar al Carrito" y "WhatsApp Directo" en `ProductCard` debe invocar `e.stopPropagation()` obligatoriamente para prevenir aperturas indeseadas del modal.
- **Estructura Visual:**
  - Encabezado con imagen destacada en proporción cuadrada/adaptable en contenedor mineral de alto contraste.
  - Título del producto (`DialogTitle`), Marca, Categoría, Condición técnica y SKU/Código interno (`oem` o identificador formateado).
  - Estado de Stock utilizando el componente `Badge` de `@/components/ui/badge` (con indicación de "En Stock / Disponible").
  - Bloque de precio formateado en ARS (`formatPrice`) si `price > 0 && showPrice`, o "Consultar precio" si es nulo o 0.
  - Descripción técnica completa (`product.description`) con soporte para saltos de línea legibles.
- **Acciones del Pie (Footer):**
  - **Botón Primario ("Agregar al pedido"):** Ejecuta `add(product)` contra el store centralizado `useCatalogCart`.
  - **Botón Secundario ("Consultar por WhatsApp"):** Enlace interactivo con ícono `FaWhatsapp` que abre en pestaña nueva (`target="_blank" rel="noopener noreferrer"`) la URL:
    `https://wa.me/5492657659108?text=Hola,%20quisiera%20consultar%20sobre%20el%20repuesto:%20[NOMBRE_PRODUCTO]%20(SKU:%20[SKU])` sanitizando y codificando parámetros mediante `encodeURIComponent`.

### RF-02: Modales de Políticas Legales y de Privacidad en Footer
- Sustitución de enlaces de navegación por disparadores de modales de diálogo:
  - **Modal "Política de Privacidad":** Contiene el texto regulatorio conforme a Ley 25.326 (Villa Mercedes, San Luis; uso exclusivo para presupuestos y soporte, sin cesión a terceros, derechos ARCO).
  - **Modal "Aviso Legal y Términos":** Contiene las 3 cláusulas normativas: 1) Precios y Stock orientativos sujetos a WhatsApp; 2) Referencias OEM estrictamente comparativas; 3) Garantía de calibración de 30 días.
- Estilo consistente con `PoliciesModal` existente: superficie `bg-zinc-950`, bordes `border-white/10`, tipografía `text-zinc-300` y botón de cierre accesible.

### RF-03: Posicionamiento y Capa Segura de `PoliciesBanner` en Dispositivos Móviles
- Modificar el contenedor de `PoliciesBanner` para que en pantallas móviles (`< 768px`) se sitúe en `bottom-24` con `z-50`.
- En pantallas de escritorio (`>= 768px`), preservar la posición anclada `md:bottom-6 md:left-6 md:max-w-md`.
- Garantizar que permanezca visible y clicleable sin superposición ni bloqueo por `MobileStickyBar` o `FloatingWhatsApp`.

### RF-04: Botón "Volver Arriba" con Estilo Botón Físico
- En `LandingFooter.tsx`, reemplazar las clases del enlace hacia `#inicio` por:
  `inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-white/20 bg-white/[0.03] hover:bg-white/10 hover:border-white/40 text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-all rounded-md cursor-pointer`
- Mantener icono `ArrowUp` y accesibilidad (`aria-label="Volver arriba de la página"`).

---

## 3. Requerimientos No Funcionales (RNF) y Seguridad (AppSec)

- **RNF-01: Zero Trust en Inyecciones de Texto / URL:** Al componer URLs hacia WhatsApp (`wa.me`), los valores `name` y `sku/oem` deben someterse a sanitización y `encodeURIComponent` para evitar roturas de protocolo o vulnerabilidades de inyección URI.
- **RNF-02: Compatibilidad de Rendimiento y Accesibilidad:** Todos los modales deben cumplir con WAI-ARIA (roles `dialog`, `title`, `description`, foco administrado automáticamente por Radix UI).
- **RNF-03: Cohesión de Diseño Oscuro:** No utilizar clases cromáticas claras ni estilos externos que violen la paleta mineral carbón `bg-zinc-950`, `bg-[#111111]`, `text-zinc-400`, `text-white` y acento `text-industrial`.

