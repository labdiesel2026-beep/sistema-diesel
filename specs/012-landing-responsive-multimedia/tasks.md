# Tareas de Implementación — Fase 12: Auditoría y Optimización Responsive Mobile-First & Nueva Multimedia

**Fase:** 012-landing-responsive-multimedia  
**Versión:** 1.0  
**Fecha:** 2026-11-06  
**Basado en:** [specs/012-landing-responsive-multimedia/spec.md](file:///f:/INGENIERIA\GEPI\InyectoresDiesel\specs\012-landing-responsive-multimedia\spec.md), [specs/012-landing-responsive-multimedia/plan.md](file:///f:/INGENIERIA\GEPI\InyectoresDiesel\specs\012-landing-responsive-multimedia\plan.md)  
**Estado:** Tareas Planificadas para Ejecución  

---

## Bloque 1: Integración Multimedia de Segundo Banco

- [x] **Tarea 1.1: Registrar nuevos activos e integrar `2doBanco.mp4` y `Banco2.webp` en `BenchShowcaseSection` y `site-config.ts`**
  - **Archivos:** `src/config/site-config.ts`, `src/components/landing/BenchShowcaseSection.tsx`
  - **Descripción:** Importar `banco2Img` (`Banco2.webp`) y `segundoBancoVideo` (`2doBanco.mp4`). Agregar ficha destacada del Segundo Banco Computarizado en `BenchShowcaseSection.tsx` con reproductor de video en loop (`autoPlay`, `muted`, `loop`, `playsInline`, `poster`), badges técnicos y datos duros de doble puesto. Asignar `banco2Img` al servicio de Banco de Pruebas en `site-config.ts`.
  - **Cobertura:** RF-01, RNF-01, RNF-02
  - **Hecho cuando:** La sección exhiba la ficha del segundo banco con video funcional y poster sin errores de consola ni de TypeScript.

---

## Bloque 2: Optimización Responsive en Bento Grid de Servicios y Equipamiento

- [x] **Tarea 2.1: Refactorizar `ServicesSection.tsx` para colapso fluido en móvil**
  - **Archivos:** `src/components/landing/ServicesSection.tsx`
  - **Descripción:** Ajustar el contenedor Bento a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12` explícito. Modificar la cabecera de las tarjetas para que números romanos y badges colapsen con elegancia sin aplastarse en pantallas de 320px (`flex-col sm:flex-row`). Adaptar tipografía de títulos con `text-2xl sm:text-3xl md:text-5xl break-words` y alturas de imagen adaptativas.
  - **Cobertura:** RF-02, RNF-01
  - **Hecho cuando:** En resoluciones de 320px a 768px no existan desbordes, cortes de texto ni anomalías de grid.

- [x] **Tarea 2.2: Refactorizar `BenchShowcaseSection.tsx` con encuadre de maquinaria y escala móvil**
  - **Archivos:** `src/components/landing/BenchShowcaseSection.tsx`
  - **Descripción:** Sustituir alturas fijas de imagen (`h-[400px]`) por `aspect-video sm:aspect-[4/3] md:h-[550px] w-full object-cover` para evitar recortar la maquinaria en móvil. Ajustar la grilla de métricas a `gap-4 sm:gap-8` y `text-3xl sm:text-4xl md:text-5xl`. Reducir el espaciado vertical de `space-y-32` a `space-y-16 sm:space-y-24 md:space-y-32`.
  - **Cobertura:** RF-03, RNF-01
  - **Hecho cuando:** Las fotos y videos del banco se visualicen en formato panorámico completo en móvil y los números de métricas encajen limpiamente sin solaparse.

---

## Bloque 3: Optimización Responsive en Secciones Inferiores, Hero y Contenedor Raíz

- [x] **Tarea 3.1: Ajustar `WarrantySection.tsx`, `LocationSection.tsx` y `LandingFooter.tsx` para pantallas móviles estrechas**
  - **Archivos:** `src/components/landing/WarrantySection.tsx`, `src/components/landing/LocationSection.tsx`, `src/components/landing/LandingFooter.tsx`
  - **Descripción:** Reducir paddings verticales a `py-16 sm:py-24 md:py-32`. En `WarrantySection`, expandir botón de WhatsApp a `w-full sm:w-auto`. En `LocationSection`, reducir padding interno a `p-5 sm:p-8` y fijar altura del iframe a `h-[300px] sm:h-[380px] md:min-h-[420px]`. En `LandingFooter`, añadir `pb-24 lg:py-32` para no ser tapado por `MobileStickyBar`.
  - **Cobertura:** RF-04, RNF-01
  - **Hecho cuando:** Al hacer scroll hasta el final en móvil, todos los elementos sean legibles, el mapa no bloquee el gesto táctil y la barra fija no tape el copyright.

- [x] **Tarea 3.2: Blindar `src/routes/index.tsx` y `HeroSection.tsx` contra desborde horizontal**
  - **Archivos:** `src/routes/index.tsx`, `src/components/landing/HeroSection.tsx`
  - **Descripción:** Agregar `overflow-x-hidden w-full` al contenedor raíz y `<main>` en `src/routes/index.tsx`. En `HeroSection.tsx`, ajustar el título H1 a escala fluida (`text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[7rem]`) y botones a `w-full sm:w-auto` en móvil estrecho (320px). Ejecutar validaciones y tests del frontend.
  - **Cobertura:** RF-05, RNF-01
  - **Hecho cuando:** La página no tenga scroll horizontal involuntario en 320px y la suite de tests del frontend pase al 100%.
