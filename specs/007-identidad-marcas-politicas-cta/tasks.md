# Tareas de Implementación — Spec 007: Identidad Fotográfica Real, Carrusel de Marcas, Políticas Comerciales y Rediseño de CTAs

**Fase:** 007-identidad-marcas-politicas-cta  
**Versión:** 1.0  
**Fecha:** 2026-10-21  
**Basado en:** [docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md), [specs/007-identidad-marcas-politicas-cta/spec.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/007-identidad-marcas-politicas-cta/spec.md) y [specs/007-identidad-marcas-politicas-cta/plan.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/007-identidad-marcas-politicas-cta/plan.md)  
**Estado:** Tareas Planificadas para Ejecución Atómica  

---

## Bloque 1: Normalización de Activos Multimedia y Vectores de Marcas

- [x] **Tarea 1.1: Conversión y optimización offline de fotografías del taller a formato WebP**
  - **Archivos:** `src/assets/workshop/taller-hero.webp`, `src/assets/workshop/banco-pruebas.webp`, `src/assets/workshop/diagnostico-electronico.webp`, `src/assets/workshop/inyectores-detalle.webp`, `src/assets/workshop/fachada-local.webp`
  - **Descripción:** Procesar offline los archivos brutos `.HEIC` y `.jpeg` en `src/assets/workshop/` mediante Sharp/Node.js, normalizándolos a formato WebP (`.webp`) ligero con compresión de alta fidelidad (calidad 85%), descarte de metadatos EXIF y resolución máxima de 1920px (para Hero) y 1280px (para el resto), con peso individual ≤ 350 KB.
  - **Cobertura:** RF-01.1, RF-01.2, RF-01.3, RF-02.1, RNF-02, RNF-08, Principio 3 de la Constitución
  - **Hecho cuando:** Los cinco (5) archivos `.webp` existan en `src/assets/workshop/` con pesos individuales no superiores a 350 KB y sin metadatos EXIF.

- [x] **Tarea 1.2: Creación e integración de logotipos vectoriales de las 10 marcas oficiales**
  - **Archivos:** `src/assets/brands/` (o componentes SVG dedicados en `src/components/landing/brands/`)
  - **Descripción:** Crear e integrar los vectores SVG limpios, monocromáticos y de proporciones consistentes para las diez (10) marcas exactas autorizadas por el taller: Bosch (Bosch Diesel Service), Zexel, Denso, Siemens VDO, Delphi, Caterpillar, Cummins, Stanadyne, Diesel Kiki y Perkins.
  - **Cobertura:** RF-03.2, RNF-01
  - **Hecho cuando:** Los 10 logotipos vectoriales limpios SVG estén disponibles y se importen/rendericen limpiamente sin errores sintácticos ni de tipado.

---

## Bloque 2: Configuración Centralizada, Tokens de Estilo OKLCH y Variantes de Botón

- [x] **Tarea 2.1: Actualizar `src/config/site-config.ts` con servicios, marcas y políticas**
  - **Archivos:** `src/config/site-config.ts`
  - **Descripción:** Centralizar de forma inmutable los 4 bloques técnicos definitivos para el Bento Grid (título, descripción, badges técnicos, imagen asignada), la lista de las 10 marcas del carrusel (`workshopBrands`) y los textos completos de los 4 ejes normativos de políticas comerciales y garantía.
  - **Cobertura:** RF-02.2, RF-03.2, RF-04.1
  - **Hecho cuando:** `npx tsc --noEmit` compile sin errores de tipos y `SITE_CONFIG` exponga las nuevas estructuras tipadas sin advertencias.

- [x] **Tarea 2.2: Recalibrar tokens OKLCH de WhatsApp y keyframes en `src/styles.css`**
  - **Archivos:** `src/styles.css`
  - **Descripción:** Actualizar las variables oficiales del Design System bajo Tailwind CSS v4 `@theme inline`:
    - En `:root`: `--whatsapp: oklch(0.55 0.16 160);` y `--whatsapp-foreground: oklch(0.99 0 0);`
    - En `.dark`: `--whatsapp: oklch(0.52 0.17 160);` y `--whatsapp-foreground: oklch(0.99 0 0);`
    Registrar la regla `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }` y la clase utilitaria `.animate-marquee`.
  - **Cobertura:** RF-03.1, RF-05.1, RNF-01
  - **Hecho cuando:** Las variables OKLCH de WhatsApp en `src/styles.css` garanticen una relación de contraste calculada > 7:1 contra texto blanco y la animación `.animate-marquee` esté registrada.

- [x] **Tarea 2.3: Actualizar la variante `whatsapp` en `src/components/ui/button.tsx`**
  - **Archivos:** `src/components/ui/button.tsx`
  - **Descripción:** Reforzar la clase de la variante `whatsapp` en `buttonVariants` incorporando ring reflectivo sutil (`ring-1 ring-emerald-400/20`), transición al clic activo (`active:scale-[0.98]`) y sombra técnica profunda (`shadow-sm hover:brightness-105`).
  - **Cobertura:** RF-05.1
  - **Hecho cuando:** El componente `Button` renderice la variante `variant="whatsapp"` con las micro-interacciones especificadas y compile limpiamente.

---

## Bloque 3: Módulo de Persistencia y Validación Zod para Consentimiento de Políticas

- [x] **Tarea 3.1: Implementar esquema Zod y helpers de almacenamiento en `policies-consent.ts`**
  - **Archivos:** `src/components/policies/policies-consent.ts`
  - **Descripción:** Definir la constante `POLICIES_STORAGE_KEY = "ld_policies_consent_v1"` y el esquema Zod estricto `PoliciesConsentSchema` (`version: z.literal(1)`, `accepted: z.boolean()`, `timestamp: z.number().positive()`). Implementar la función de lectura `getPoliciesConsent()` con purga automática Fail-Fast (`localStorage.removeItem`) ante datos corruptos o versiones desactualizadas, y la función de escritura `savePoliciesConsent()`.
  - **Cobertura:** RF-04.2, RNF-05, CL-03, CL-05, CL-13, Principio 2 de la Constitución
  - **Hecho cuando:** La lectura de un JSON corrupto en `localStorage` purgue la clave y retorne de inmediato `{ accepted: false }` sin arrojar excepciones no controladas.

- [x] **Tarea 3.2: Implementar hook reactivo seguro `usePoliciesConsent`**
  - **Archivos:** `src/components/policies/use-policies-consent.ts`
  - **Descripción:** Implementar el hook de consentimiento con inicialización en dos fases para garantizar cero desajustes de hidratación SSR (*hydration mismatch*). El hook retornará `shouldShowBanner: false` durante el render inicial en servidor y sincronizará reactivamente tras el montaje en cliente escuchando eventos personalizados de ventana (`ld:policies-consent-changed`) y el evento `storage` entre pestañas.
  - **Cobertura:** RF-04.2, RF-04.3, RNF-05
  - **Hecho cuando:** El hook renderice consistentemente en SSR sin provocar errores de hidratación en consola y emita cambios de estado reactivos en cliente.

---

## Bloque 4: Rediseño Premium de Botones CTA de WhatsApp en el Catálogo

- [x] **Tarea 4.1: Rediseñar botón "WhatsApp Directo" en `ProductCard.tsx`**
  - **Archivos:** `src/components/catalog/ProductCard.tsx`
  - **Descripción:** Actualizar el botón secundario aplicando la variante `whatsapp` recalibrada, ícono oficial `FaWhatsapp` a 16px, tipografía `font-semibold text-xs tracking-wide uppercase` en blanco puro `#FFFFFF` y elevación suave al cursor (`hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25`).
  - **Cobertura:** RF-05.2
  - **Hecho cuando:** La tarjeta de producto en el catálogo renderice el botón de WhatsApp con contraste accesible y el ícono oficial `FaWhatsapp`.

- [x] **Tarea 4.2: Rediseñar botón de consulta en `catalogo.$productId.tsx`**
  - **Archivos:** `src/routes/catalogo.$productId.tsx`
  - **Descripción:** Sustituir el ícono genérico `MessageCircle` por el ícono oficial `FaWhatsapp` a 18px en el botón *"WhatsApp Directo"*, aplicando altura ergonómica (`h-12`), tipografía `font-semibold text-sm tracking-wide` en blanco puro y variante `whatsapp` recalibrada.
  - **Cobertura:** RF-05.3
  - **Hecho cuando:** La ficha técnica de producto renderice el botón esmeralda con `FaWhatsapp` y código TypeScript sin advertencias de tipos.

- [x] **Tarea 4.3: Rediseñar botón de checkout en `CartDrawer.tsx`**
  - **Archivos:** `src/components/catalog/CartDrawer.tsx`
  - **Descripción:** Actualizar el botón de checkout *"Consultar por WhatsApp"* con la variante `whatsapp` recalibrada, micro-animación de brillo continuo (*shimmer* sutil), ícono oficial `FaWhatsapp` a 20px y tipografía `font-bold text-sm tracking-wide` en blanco puro.
  - **Cobertura:** RF-05.4
  - **Hecho cuando:** El drawer del carrito muestre el botón de checkout con la nueva estética esmeralda profunda y contraste accesible.

- [x] **Tarea 4.4: Rediseñar botón en estado sin resultados de `catalogo.tsx`**
  - **Archivos:** `src/routes/catalogo.tsx`
  - **Descripción:** Reemplazar el ícono `MessageCircle` por `FaWhatsapp`, aplicar la variante `whatsapp` recalibrada en el estado sin resultados (`no-results-state`), y asegurar que el botón flotante del carrito conserve su capa `z-40` libre de interferencias espaciales con el dock card de políticas.
  - **Cobertura:** RF-05.5, CL-06
  - **Hecho cuando:** Al buscar un término sin resultados en `/catalogo`, el botón de asistencia por WhatsApp utilice el nuevo estilo esmeralda institucional.

---

## Bloque 5: Carrusel Continuo Infinito de Marcas Especializadas

- [x] **Tarea 5.1: Implementar el componente `BrandsMarquee.tsx`**
  - **Archivos:** `src/components/landing/BrandsMarquee.tsx`
  - **Descripción:** Crear el componente de marquesina infinita con duplicación en el DOM de las 10 marcas oficiales (20 nodos), máscaras laterales difuminadas (`mask-image: linear-gradient`), animación CSS continua de 35s en desktop y 25s en móvil, directiva `touch-action: pan-y` para no trabar el scroll táctil, pausa en touch sostenido (> 250ms) con reanudación a 1.5s, pausa en hover de mouse y anulación bajo `prefers-reduced-motion`. Incluir el subtítulo: *"Especialistas Multimarca · Trabajamos marcas originales como también alternativas"*.
  - **Cobertura:** RF-03.1, RF-03.2, RF-03.3, RNF-04, CL-02, CL-09, CL-13
  - **Hecho cuando:** El componente renderice el track continuo sin saltos visuales al completar el ciclo de traslación y no bloquee el desplazamiento vertical en pantallas táctiles.

- [x] **Tarea 5.2: Integrar `BrandsMarquee` en la Landing Page**
  - **Archivos:** `src/routes/index.tsx`
  - **Descripción:** Insertar `BrandsMarquee` en la ruta `/` ubicándolo estratégicamente **después de `FeaturedProductsCarousel` y antes de `ServicesSection`**, logrando una transición narrativa fluida y evitando el encadenamiento de dos carruseles consecutivos.
  - **Cobertura:** RF-03.1
  - **Hecho cuando:** La Landing Page renderice la marquesina de marcas entre los destacados y los servicios sin saltos de maquetación (*CLS = 0*).

---

## Bloque 6: Identidad Fotográfica Real y Resiliencia Multimedia en Landing Page

- [x] **Tarea 6.1: Integrar fotografía real del taller en `HeroSection.tsx`**
  - **Archivos:** `src/components/landing/HeroSection.tsx`
  - **Descripción:** Sustituir la imagen genérica por `src/assets/workshop/taller-hero.webp`. Configurar marco industrial perimetral (`border-blue-500/20`), overlay de contraste multidireccional, micro-animación de zoom ultralento continuo (12s con `easeInOut`), y en móvil fijar `object-position: center 35%` con opacidad `0.30` y gradiente reforzado.
  - **Cobertura:** RF-01.1, CL-02
  - **Hecho cuando:** La sección Hero exhiba el taller real en el fondo y la micro-animación oscile suavemente sin comprometer la legibilidad de los textos y botones.

- [x] **Tarea 6.2: Reestructurar `WarrantySection.tsx` con video HTML5 resiliente y póster**
  - **Archivos:** `src/components/landing/WarrantySection.tsx`
  - **Descripción:** Reestructurar la sección en dos columnas en desktop (`lg:grid-cols-12`). Incorporar en la columna derecha el reproductor HTML5 con `banco-en-vivo.mp4`, `aspect-video lg:aspect-[4/3]`, `poster="src/assets/workshop/inyectores-detalle.webp"`, `preload="metadata"`, `muted autoPlay loop playsInline`, badge *"Ensayo en Tiempo Real"*, y degradación automática a fotografía estática si `Save-Data: on`, conexión lenta o rechazo de autoplay.
  - **Cobertura:** RF-01.2, RNF-02, CL-01, CL-08
  - **Hecho cuando:** El video se reproduzca con póster inicial erradicando parpadeos negros y degrade a la imagen fija si el navegador rechaza la reproducción automática.

- [x] **Tarea 6.3: Integrar fotografía real de fachada en `LocationSection.tsx`**
  - **Archivos:** `src/components/landing/LocationSection.tsx`
  - **Descripción:** Reestructurar en grilla de 12 columnas: columna izquierda de 5 cols incorporando `src/assets/workshop/fachada-local.webp` (mostrando nítidamente la numeración oficial 1215 en relación de aspecto 16/9 con badge *"Local a la Calle · Pres. Perón 1215"*), datos de contacto y horarios; y columna derecha de 7 cols para el mapa embebido de Google Maps (`min-h-[420px]`).
  - **Cobertura:** RF-01.3
  - **Hecho cuando:** La sección de ubicación presente la fotografía de fachada alineada armónicamente con los horarios y el mapa interactivo.

---

## Bloque 7: Rediseño Fotográfico de Servicios en Bento Grid Industrial

- [x] **Tarea 7.1: Implementar Bento Grid industrial en `ServicesSection.tsx`**
  - **Archivos:** `src/components/landing/ServicesSection.tsx`
  - **Descripción:** Reemplazar las tarjetas simples por la grilla Bento Grid de 12 columnas (`lg:col-span-7` para Banco de Pruebas, `lg:col-span-5` para Bombas Inyectoras, `lg:col-span-6` para Inyectores Common Rail, y `lg:col-span-6` para Diagnóstico y Repuestos). Vincular las fotografías reales (`banco-pruebas.webp`, `taller-hero.webp`, `inyectores-detalle.webp`, `diagnostico-electronico.webp`), badges técnicos y copys definitivos centralizados en `SITE_CONFIG.services`.
  - **Cobertura:** RF-02.1, RF-02.2, CL-12
  - **Hecho cuando:** La sección de servicios renderice el Bento Grid industrial con 4 tarjetas enriquecidas fotográficamente y micro-interacciones hover (`scale-105` y resplandor azul).

- [x] **Tarea 7.2: Agregar cláusula formal de marcas originales y alternativas**
  - **Archivos:** `src/components/landing/ServicesSection.tsx`
  - **Descripción:** Añadir al pie de la grilla de servicios la cláusula visible de transparencia técnica informando sobre el trabajo con repuestos legítimos OEM y opciones alternativas homologadas.
  - **Cobertura:** RF-02.3
  - **Hecho cuando:** La leyenda aclaratoria sobre repuestos originales y alternativos sea visible y legible con contraste WCAG AA.

---

## Bloque 8: Sistema de Políticas de Garantía y Cotización (Banner + Modal)

- [x] **Tarea 8.1: Implementar el panel flotante dock card `PoliciesBanner.tsx`**
  - **Archivos:** `src/components/policies/PoliciesBanner.tsx`
  - **Descripción:** Crear el panel flotante tipo dock card en la esquina inferior izquierda (`z-45`, `sm:left-6 sm:bottom-6 sm:max-w-md`), con retardo de entrada de 1000ms, animación `slide-up`/`fade-out`, resumen de transparencia, botón secundario *"Ver Políticas Completas"* y botón primario *"Aceptar y Continuar"*. Conectar con `usePoliciesConsent()`.
  - **Cobertura:** RF-04.2, RF-04.3, CL-06, CL-07
  - **Hecho cuando:** El banner aparezca tras 1 segundo si no hay consentimiento, no colisione con el botón flotante de WhatsApp en la esquina derecha, y se oculte de inmediato al pulsar "Aceptar y Continuar".

- [x] **Tarea 8.2: Implementar el modal dialog accesible `PoliciesModal.tsx`**
  - **Archivos:** `src/components/policies/PoliciesModal.tsx`
  - **Descripción:** Crear el diálogo accesible (`Dialog` de Radix UI en `z-50`), estructurando los 4 ejes normativos en tarjetas técnicas con scroll interno (`max-h-[70vh]`), soporte para tecla `Escape`, trampa de foco y botón *"Aceptar y Continuar"* sincronizado que guarda en `localStorage` y cierra modal y banner a la vez.
  - **Cobertura:** RF-04.1, RF-04.4, RNF-03, CL-04, CL-11
  - **Hecho cuando:** El modal despliegue los 4 ejes completos, capture el foco del teclado, se cierre con `Escape` y sincronice reactivamente el consentimiento.

- [x] **Tarea 8.3: Integrar botón de políticas en `LandingFooter.tsx` y coordinar `FloatingWhatsApp.tsx`**
  - **Archivos:** `src/components/landing/LandingFooter.tsx`, `src/components/landing/FloatingWhatsApp.tsx`
  - **Descripción:** En `LandingFooter`, incorporar el botón semántico accesible *"Políticas de Garantía y Cotización"* que abre `PoliciesModal`. En `FloatingWhatsApp`, fijar su capa en `z-40` y coordinar su desplazamiento dinámico a `bottom-36` en pantallas móviles mientras el banner de políticas esté visible.
  - **Cobertura:** RF-04.3, RF-04.4, CL-07
  - **Hecho cuando:** El enlace permanente del footer abra el modal accesible en cualquier momento y el botón flotante de WhatsApp no sea tapado en móvil.

- [x] **Tarea 8.4: Integrar el proveedor/contenedor de políticas en las rutas públicas**
  - **Archivos:** `src/routes/index.tsx`, `src/routes/__root.tsx` (o rutas públicas)
  - **Descripción:** Montar `PoliciesBanner` y `PoliciesModal` de forma global para que protejan todas las rutas públicas (`/`, `/catalogo` y `/catalogo/$productId`), excluyendo formalmente las rutas privadas del panel `/admin/*`.
  - **Cobertura:** RF-04.2, CL-06
  - **Hecho cuando:** El banner de políticas se despliegue tanto en la Landing como en el catálogo y fichas de producto para nuevos visitantes, y no aparezca en `/admin`.

---

## Bloque 9: Suite de Pruebas Automatizadas

- [x] **Tarea 9.1: Crear pruebas unitarias para `policies-consent.ts`**
  - **Archivos:** `src/test/policies/policies-consent.test.ts`
  - **Descripción:** Escribir pruebas unitarias en Vitest para validar: (1) Validación Zod estricta ante payloads conformes; (2) Rechazo y purga inmediata en `localStorage` ante datos corruptos o versiones desactualizadas; (3) Manejo seguro ante excepciones de almacenamiento bloqueado (modo incógnito estricto).
  - **Cobertura:** RF-04.2, RNF-05, CL-03, CL-05, CL-13
  - **Hecho cuando:** `npx vitest run src/test/policies/policies-consent.test.ts` ejecute y pase al 100% en verde.

- [x] **Tarea 9.2: Crear pruebas de integración para `PoliciesBanner` y `PoliciesModal`**
  - **Archivos:** `src/test/policies/Policies.integration.test.tsx`
  - **Descripción:** Probar: (1) Renderizado diferido del banner tras retardo de 1000ms; (2) Ocultación y persistencia al pulsar "Aceptar y Continuar"; (3) Apertura del modal desde banner y footer con trampa de foco y tecla `Escape`; (4) Aceptación desde el modal que sincroniza y cierra el banner.
  - **Cobertura:** RF-04.2, RF-04.3, RF-04.4, CL-04, CL-11
  - **Hecho cuando:** `npx vitest run src/test/policies/Policies.integration.test.tsx` pase exitosamente sin errores de hidratación simulada.

- [x] **Tarea 9.3: Crear pruebas de resiliencia del video en `WarrantySection`**
  - **Archivos:** `src/test/landing/WarrantySection.test.tsx`
  - **Descripción:** Probar: (1) Renderizado del elemento `<video>` con póster obligatorio y atributos muted/autoPlay; (2) Degradación ante rechazo de autoplay (`play().catch()`) montando la imagen `inyectores-detalle.webp`; (3) Renderizado directo de fotografía si `Save-Data: on` o conexión estimada 2G/3G lenta.
  - **Cobertura:** RF-01.2, CL-01, CL-08
  - **Hecho cuando:** `npx vitest run src/test/landing/WarrantySection.test.tsx` pase en verde.

- [x] **Tarea 9.4: Crear pruebas de componentes para `BrandsMarquee` y Botones CTA WhatsApp**
  - **Archivos:** `src/test/landing/BrandsMarquee.test.tsx`, `src/test/catalog/WhatsAppCTAs.test.tsx`
  - **Descripción:** En `BrandsMarquee`: verificar presencia de las 10 marcas duplicadas (20 nodos), directiva `touch-pan-y` y anulación bajo `prefers-reduced-motion`. En `WhatsAppCTAs`: verificar que los botones en `ProductCard`, `catalogo.$productId`, `CartDrawer` y estado sin resultados apliquen la variante `whatsapp` con tokens OKLCH, contraste accesible y el ícono oficial `FaWhatsapp`.
  - **Cobertura:** RF-03.1, RF-03.2, RF-05.1 a RF-05.5, RNF-03, RNF-04, CL-02
  - **Hecho cuando:** `npx vitest run src/test/landing/BrandsMarquee.test.tsx src/test/catalog/WhatsAppCTAs.test.tsx` apruebe todas las aserciones en verde.

---

## Bloque 10: Auditoría Final de Calidad, Tipado Estricto y Build

- [x] **Tarea 10.1: Verificación estática de tipos TypeScript**
  - **Archivos:** Todo el repositorio
  - **Descripción:** Ejecutar la verificación estática de tipos en todo el frontend para comprobar que las nuevas interfaces, esquemas Zod, componentes y props compilen limpiamente sin discrepancias.
  - **Cobertura:** RNF-07
  - **Hecho cuando:** `npx tsc --noEmit` finalice con código de salida 0.

- [x] **Tarea 10.2: Ejecución integral de la suite de pruebas Vitest**
  - **Archivos:** Todo el repositorio
  - **Descripción:** Ejecutar la suite completa de pruebas unitarias y de integración para asegurar que todos los tests preexistentes y nuevos pasen al 100% sin regresiones.
  - **Cobertura:** Criterios de Finalización
  - **Hecho cuando:** `npx vitest run` reporte 100% de tests en verde.

- [x] **Tarea 10.3: Verificación de compilación de producción**
  - **Archivos:** Bundle generado en `dist/`
  - **Descripción:** Ejecutar `npm run build` para garantizar que Vite y TanStack Start empaqueten la aplicación de producción sin advertencias de dependencias ni errores de empaquetado.
  - **Cobertura:** Criterios de Finalización
  - **Hecho cuando:** `npm run build` finalice con éxito generando el bundle de producción sin fallos.
