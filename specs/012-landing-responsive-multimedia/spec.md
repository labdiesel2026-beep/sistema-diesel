# Especificación — Fase 12: Auditoría y Optimización Responsive Mobile-First & Nueva Multimedia

**Fase:** 012-landing-responsive-multimedia  
**Versión:** 1.0 (AppSec & Mobile-First UX Lead)  
**Fecha:** 2026-11-06  
**Basado en:** Specs 002-landing-page, 009-rediseño-ui-premium, 010-rediseño-premium  
**Estado:** Especificación Aprobada para Ejecución  

---

## 1. Contexto y Objetivos

### 1.1 Contexto
La Landing Page es la vitrina digital de captación del taller. Tras una inspección de diseño responsivo, se detectaron desbordes visuales y desajustes de escala en pantallas móviles estrechas (320px a 375px), particularmente en la sección de **Servicios** (Bento Grid), en **Equipamiento de Calibración** (donde imágenes fijas de `400px` recortan la maquinaria) y en las secciones inferiores a medida que el usuario hace scroll hacia Garantías, Ubicación y Footer.  
Asimismo, se añadieron nuevos activos reales del taller en `src/assets/workshop/`: un nuevo video (`2doBanco.mp4`) y una nueva fotografía de alta resolución (`Banco2.webp`) correspondientes al segundo banco computarizado de pruebas, los cuales deben integrarse con un diseño sobrio, industrial y compatible con navegadores móviles estrictos (Safari iOS).

### 1.2 Objetivos
1. **Integración Multimedia de Segundo Banco:** Incorporar `2doBanco.mp4` y `Banco2.webp` en la sección de equipamiento/servicios de la Landing Page con atributos mandatorios (`autoPlay`, `muted`, `loop`, `playsInline`) y poster de respaldo para evitar bloqueos en iOS.
2. **Arquitectura Mobile-First Estricta (desde 320px):**
   - Asegurar que todas las grillas colapsen limpiamente a `grid-cols-1` o `flex-col` en `< 768px`.
   - Reemplazar alturas fijas arbitrarias (`h-[400px]`) por `aspect-video` o escalas relativas fluidas que preserven el encuadre de la maquinaria sin deformación (`object-cover`).
   - Evitar cualquier desborde horizontal (`overflow-x-hidden`) en el contenedor raíz y secciones hijas.
   - Ajustar tipografías gigantescas (`text-4xl`/`text-5xl`) para que escalen armónicamente en 320px/375px sin provocar salto de línea asimétrico o partición de palabras técnicas.
   - Proteger el espacio de la barra inferior fija (`MobileStickyBar`) para que no ocluya información del Footer.

---

## 2. Requerimientos Funcionales (RF)

- **RF-01: Integración Multimedia del Segundo Banco:**
  - `BenchShowcaseSection` debe incorporar la ficha técnica del Segundo Banco Computarizado de Inyección utilizando `2doBanco.mp4` con `Banco2.webp` como poster y fallback, garantizando `autoPlay`, `muted`, `loop`, `playsInline` y `preload="metadata"`.
  - `SITE_CONFIG.services` o la sección de Servicios debe actualizarse para aprovechar la fotografía de alta calidad `Banco2.webp` en el bloque de ensayos computarizados.
- **RF-02: Responsive en Bento Grid de Servicios (`ServicesSection`):**
  - En `< 768px`, las tarjetas deben presentarse apiladas en columna única continua (`grid-cols-1`) eliminando anomalías de spans de columnas.
  - El encabezado de cada tarjeta (número romano + badges técnicos) debe reorganizarse en pantallas estrechas para evitar compresión de etiquetas.
  - Tipografías de títulos de servicios deben usar escala fluida (`text-2xl sm:text-3xl md:text-5xl`) con `break-words`.
- **RF-03: Responsive en Equipamiento de Calibración (`BenchShowcaseSection`):**
  - Las imágenes y videos de los bancos deben utilizar `aspect-video sm:aspect-[4/3] md:h-[550px]` para que en teléfonos móviles no se fuercen proporciones verticales que recorten el 60% de los bancos.
  - La grilla de métricas técnicas (presión en bar, tolerancia, canales) debe reducir el gap y ajustar el tamaño del texto (`text-3xl sm:text-4xl md:text-5xl`) para que en 320px quepan 2 columnas holgadamente.
  - El espaciado vertical entre fichas debe reducirse de `space-y-32` a `space-y-16 sm:space-y-24 md:space-y-32`.
- **RF-04: Responsive en Garantías, Ubicación y Footer:**
  - `WarrantySection`: el video de ensayo en vivo y el texto descriptivo deben mantener `aspect-video` y botones en ancho completo (`w-full sm:w-auto`).
  - `LocationSection`: el padding interno de la tarjeta de datos debe reducirse de `p-8` a `p-5 sm:p-8` en móvil, y el mapa de Google Maps debe ajustarse a `h-[300px] sm:h-[380px] md:min-h-[420px]` para facilitar el scroll táctil vertical sin atrapar el gesto del usuario.
  - `LandingFooter`: debe incorporar padding inferior dinámico (`pb-24`) para evitar solapamiento con `MobileStickyBar`.
- **RF-05: Blindaje Anti-Overflow Horizontal:**
  - `src/routes/index.tsx` y su elemento `<main>` deben contar con `overflow-x-hidden w-full`.
  - `HeroSection` debe ajustar su título a `text-4xl sm:text-6xl md:text-8xl` para no desbordar en pantallas de 320px.

---

## 3. Requerimientos No Funcionales (RNF)

- **RNF-01 (Compatibilidad WebKit/iOS):** Obligatoriedad de `playsInline` y `muted` en todas las etiquetas `<video>` para permitir reproducción automática sin exigir pantalla completa nativa en Safari móvil.
- **RNF-02 (Rendimiento y LCP):** Uso de `loading="lazy"` en imágenes secundarias y `preload="metadata"` en videos para evitar congestión de ancho de banda en conexiones móviles.
- **RNF-03 (Accesibilidad WCAG 2.1 AA):** Ratios de contraste superiores a 4.5:1 en todos los textos sobre fondos minerales de zinc, y soporte de `prefers-reduced-motion`.

