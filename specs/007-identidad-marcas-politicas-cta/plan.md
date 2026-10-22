# Plan de Arquitectura e Implementación — Spec 007: Identidad Fotográfica Real, Carrusel de Marcas, Políticas Comerciales y Rediseño de CTAs

**Fase:** 007-identidad-marcas-politicas-cta  
**Versión:** 1.0  
**Fecha:** 2026-10-21  
**Basado en:** [docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md), [specs/007-identidad-marcas-politicas-cta/spec.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/007-identidad-marcas-politicas-cta/spec.md) y [src/styles.css](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/src/styles.css)  
**Estado:** Plan de Arquitectura Aprobado para Ejecución  

---

## 1. Estructura de Componentes y Árbol de Activos

El diseño modular respeta la separación de responsabilidades y la Constitución del proyecto ([docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md)), garantizando que los nuevos componentes interactivos, esquemas de validación y activos optimizados se integren limpiamente sin acoplamientos innecesarios.

### 1.1 Árbol de Activos Multimedia (`src/assets/workshop/` y `src/assets/brands/`)
*Trazabilidad: Cubre RF-01.1, RF-01.2, RF-01.3, RF-02.1, RF-03.2, RNF-02, RNF-08, CL-01, CL-08*

Los archivos brutos provistos en formatos propietarios de alta densidad (`.HEIC` de hasta 4.7 MB y `.jpeg` no normalizados) son transcodificados offline a formato WebP moderno (`.webp`) con ancho máximo de 1920px, compresión 85% y descarte total de metadata EXIF (Principio 3 de la Constitución y RNF-08):

```
src/assets/
├── workshop/
│   ├── taller-hero.webp              # [Nuevo] Fondo Hero (1920x1080, ~280 KB) [Cubre RF-01.1]
│   ├── banco-pruebas.webp            # [Nuevo] Tarjeta Principal Bento Grid (1280x853, ~220 KB) [Cubre RF-02.1]
│   ├── diagnostico-electronico.webp  # [Nuevo] Tarjeta Diagnóstico Bento Grid (1280x853, ~210 KB) [Cubre RF-02.1]
│   ├── inyectores-detalle.webp       # [Nuevo] Tarjeta Common Rail Bento Grid + Poster video (1280x853, ~180 KB) [Cubre RF-01.2, RF-02.1]
│   ├── fachada-local.webp            # [Nuevo] Foto Fachada con numeración 1215 en Ubicación (1280x720, ~160 KB) [Cubre RF-01.3]
│   ├── banco-en-vivo.mp4             # [Existente] Video real de prueba en banco (3.1 MB, preload="metadata") [Cubre RF-01.2]
│   └── (Archivos brutos .HEIC/.jpeg preservados como backup en scratch, no referenciados por el código web)
└── brands/                           # [Nuevo] Directorio de logotipos vectoriales limpios
    ├── bosch.svg                     # [Nuevo] Logo vectorial Bosch Diesel Service [Cubre RF-03.2]
    ├── zexel.svg                     # [Nuevo] Logo vectorial Zexel [Cubre RF-03.2]
    ├── denso.svg                     # [Nuevo] Logo vectorial Denso [Cubre RF-03.2]
    ├── siemens-vdo.svg               # [Nuevo] Logo vectorial Siemens VDO [Cubre RF-03.2]
    ├── delphi.svg                    # [Nuevo] Logo vectorial Delphi [Cubre RF-03.2]
    ├── caterpillar.svg               # [Nuevo] Logo vectorial Caterpillar [Cubre RF-03.2]
    ├── cummins.svg                   # [Nuevo] Logo vectorial Cummins [Cubre RF-03.2]
    ├── stanadyne.svg                 # [Nuevo] Logo vectorial Stanadyne [Cubre RF-03.2]
    ├── diesel-kiki.svg               # [Nuevo] Logo vectorial Diesel Kiki [Cubre RF-03.2]
    └── perkins.svg                   # [Nuevo] Logo vectorial Perkins [Cubre RF-03.2]
```

---

### 1.2 Módulos y Componentes de la Aplicación a Modificar / Crear

| Archivo | Tipo | Responsabilidad / Cambios Principales | Trazabilidad RF / CL |
| :--- | :--- | :--- | :--- |
| `src/config/site-config.ts` | Modificación | Centralizar los 4 bloques técnicos definitivos de servicios (títulos, descripciones, badges, imágenes), lista inmutable de las 10 marcas del marquee y textos formales de los 4 ejes normativos. | RF-02.2, RF-03.2, RF-04.1 |
| `src/styles.css` | Modificación | Recalibrar tokens oficiales OKLCH: `--whatsapp: oklch(0.55 0.16 160)` y `--whatsapp-foreground: oklch(0.99 0 0)` en `:root` y `.dark`. Añadir keyframes `@keyframes marquee`. | RF-05.1, RNF-01 |
| `src/components/ui/button.tsx` | Modificación | Reforzar la variante `variant="whatsapp"` con ring reflectivo perimetral `ring-1 ring-emerald-400/20`, sombra sutil y `active:scale-[0.98]`. | RF-05.1 |
| `src/components/landing/HeroSection.tsx` | Modificación | Sustituir `diesel-injector.jpg` por `taller-hero.webp`. Ajustar marco industrial, overlay de contraste multidireccional, zoom ultralento continuo (12s) y posición focal móvil `object-position: center 35%` con opacidad `0.30`. | RF-01.1, CL-02 |
| `src/components/landing/WarrantySection.tsx` | Modificación | Reestructurar en dos columnas (`lg:grid-cols-12`). Integrar video `banco-en-vivo.mp4` con `aspect-video lg:aspect-[4/3]`, `poster="inyectores-detalle.webp"`, `preload="metadata"`, y fallback automático fotográfico ante conexión lenta (`Save-Data`) o bloqueo de autoplay. | RF-01.2, CL-01, CL-08 |
| `src/components/landing/LocationSection.tsx` | Modificación | Reestructurar en grilla de 12 columnas: columna de 5 cols con `fachada-local.webp` (numeración 1215), badge de reconocimiento y horarios; columna de 7 cols con mapa Google Maps (`min-h-[420px]`). | RF-01.3 |
| `src/components/landing/ServicesSection.tsx` | Modificación | Rediseñar en Bento Grid industrial (`lg:grid-cols-12`): Bloque 1 de 7 cols (`banco-pruebas.webp`), Bloque 2 de 5 cols (`taller-hero.webp`), Bloques 3 y 4 de 6 cols cada uno. Badges técnicos, micro-interacciones hover y cláusula de marcas originales/alternativas. | RF-02.1, RF-02.2, RF-02.3, CL-12 |
| `src/components/landing/BrandsMarquee.tsx` | Creación | Marquesina infinita con 20 nodos (duplicación del set de 10 marcas), animación CSS `marquee` (35s desktop / 25s móvil), gradientes laterales difuminados (`mask-image`), `touch-action: pan-y`, pausa no bloqueante y soporte `prefers-reduced-motion`. | RF-03.1, RF-03.2, RF-03.3, CL-02, CL-09 |
| `src/components/policies/policies-consent.ts` | Creación | Esquema Zod `PoliciesConsentSchema`, helpers de lectura/escritura blindados con purga Fail-Fast, emisor de eventos personalizados para sincronización reactiva y hook seguro `usePoliciesConsent()`. | RF-04.2, RNF-05, CL-03, CL-05, CL-13 |
| `src/components/policies/PoliciesBanner.tsx` | Creación | Panel flotante tipo dock card en esquina inferior izquierda (`z-45`, `sm:bottom-6 sm:left-6 sm:max-w-md`), retardo de 1000ms, animación suave `slide-up`/`fade-out`, botón *"Ver Políticas Completas"* y *"Aceptar y Continuar"*. | RF-04.2, RF-04.3, CL-06, CL-07 |
| `src/components/policies/PoliciesModal.tsx` | Creación | Diálogo accesible (`Dialog` de Radix UI en `z-50`) con los 4 ejes normativos en tarjetas técnicas estructuradas, scroll interno (`max-h-[70vh]`), trampa de foco, tecla `Escape` y botón de aceptación sincronizado. | RF-04.4, CL-04, CL-11 |
| `src/components/landing/LandingFooter.tsx` | Modificación | Integrar botón semántico accesible *"Políticas de Garantía y Cotización"* que dispara la apertura de `PoliciesModal`. | RF-04.4 |
| `src/components/landing/FloatingWhatsApp.tsx` | Modificación | Fijar en `z-40` y coordinar desplazamiento dinámico a `bottom-36` en móvil cuando el banner flotante esté activo, evitando toda colisión. | RF-04.3, CL-07 |
| `src/components/catalog/ProductCard.tsx` | Modificación | Botón secundario *"WhatsApp Directo"* adaptado con tokens OKLCH recalibrados, ícono oficial `FaWhatsapp` y tipografía blanca accesible (WCAG AAA). | RF-05.2 |
| `src/routes/catalogo.$productId.tsx` | Modificación | Reemplazar ícono `MessageCircle` de Lucide por `FaWhatsapp`, unificar estilos con token OKLCH y altura táctil ergonómica (`h-12`). | RF-05.3 |
| `src/components/catalog/CartDrawer.tsx` | Modificación | Botón de checkout *"Consultar por WhatsApp"* con token OKLCH esmeralda, tipografía en blanco puro `#FFFFFF`, shimmer sutil e ícono oficial `FaWhatsapp`. | RF-05.4 |
| `src/routes/catalogo.tsx` | Modificación | Botón en estado sin resultados actualizado con `FaWhatsapp` y tokens OKLCH. Botón flotante del carrito fijado en `z-40`, libre de interferencias con el dock card de políticas (`z-45`). | RF-05.5, CL-06 |
| `src/routes/index.tsx` | Modificación | Inserción de `BrandsMarquee` entre `FeaturedProductsCarousel` y `ServicesSection`. Montaje de `PoliciesBanner` y `PoliciesModal`. | RF-03.1, RF-04.2 |
| `src/routes/__root.tsx` | Modificación | Inclusión global del proveedor/contenedor de `PoliciesBanner` y `PoliciesModal` para garantizar persistencia y cobertura en `/`, `/catalogo` y `/catalogo/$productId`, excluyendo `/admin/*`. | RF-04.2, CL-06 |

---

## 2. Modelo de Persistencia y Esquema Zod para `localStorage`
*Trazabilidad: Cubre RF-04.2, RNF-05, CL-03, CL-05, CL-13 y Principios 2 y 5 de la Constitución*

Siguiendo el estándar Fail-Fast con Zod (`docs/constitution.md §2`), la persistencia en cliente se formaliza con validación estricta en frontera, erradicando lecturas de strings crudos propensos a corrupción o manipulación.

### 2.1 Clave y Esquema Zod (`src/components/policies/policies-consent.ts`)

```typescript
import { z } from "zod";

export const POLICIES_STORAGE_KEY = "ld_policies_consent_v1" as const;
export const CURRENT_POLICIES_VERSION = 1 as const;

export const PoliciesConsentSchema = z
  .object({
    version: z.literal(CURRENT_POLICIES_VERSION),
    accepted: z.boolean(),
    timestamp: z.number().positive(),
  })
  .strict();

export type PoliciesConsent = z.infer<typeof PoliciesConsentSchema>;
```

### 2.2 Ejemplo de Payload JSON Válido en `localStorage`

```json
{
  "version": 1,
  "accepted": true,
  "timestamp": 1729549800000
}
```

### 2.3 Lógica de Saneamiento y Purga Automática (Fail-Fast)
Si el valor recuperado en `localStorage.getItem(POLICIES_STORAGE_KEY)` es nulo, no es un JSON válido, o falla ante `PoliciesConsentSchema.safeParse` (por ejemplo, si contiene una versión anterior `version: 0`, campos adicionales debido al `.strict()`, o datos corruptos):
1. Se ejecuta `localStorage.removeItem(POLICIES_STORAGE_KEY)`.
2. Se asume inmediatamente el estado seguro por defecto: `{ version: 1, accepted: false, timestamp: 0 }`.
3. Se despliega el panel flotante para recabar la conformidad formal del usuario.

---

## 3. Lógica y Pseudocódigo para Puntos Críticos

### 3.1 Prevención de Fallos de Hidratación SSR al leer `localStorage`
*Trazabilidad: Cubre RF-04.2, RF-04.3, RNF-05*

**Problema:** Durante el renderizado en servidor (SSR) de TanStack Start no existe el objeto `window.localStorage`. Si el cliente lee el almacenamiento durante el render sincrónico inicial, el HTML resultante diferirá del generado por el servidor, desencadenando un error crítico de *hydration mismatch*.

**Solución Arquitectónica:**
Utilizar un patrón de inicialización en dos fases mediante el hook `useSyncExternalStore` o montaje diferido protegido:

```typescript
// Pseudocódigo: src/components/policies/use-policies-consent.ts

import { useState, useEffect, useCallback } from "react";
import { 
  POLICIES_STORAGE_KEY, 
  PoliciesConsentSchema, 
  CURRENT_POLICIES_VERSION,
  type PoliciesConsent 
} from "./policies-consent";

const CONSENT_EVENT = "ld:policies-consent-changed";

export function usePoliciesConsent() {
  // 1. Fase SSR / Primer Render: Estado seguro neutral garantizado idéntico en servidor y cliente
  const [isMounted, setIsMounted] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(true); // Asume true transitorio en SSR para no pintar banner

  const readConsent = useCallback((): boolean => {
    if (typeof window === "undefined") return true;
    try {
      const raw = localStorage.getItem(POLICIES_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      const result = PoliciesConsentSchema.safeParse(parsed);
      if (result.success && result.data.accepted) {
        return true;
      }
      // Purga fail-fast ante dato inválido
      localStorage.removeItem(POLICIES_STORAGE_KEY);
      return false;
    } catch {
      return false; // Modo incógnito estricto o JSON malformado
    }
  }, []);

  useEffect(() => {
    // 2. Fase Cliente Montado: Se lee el almacenamiento real y se activa reactividad
    setIsMounted(true);
    setHasAccepted(readConsent());

    const handleSync = () => {
      setHasAccepted(readConsent());
    };

    window.addEventListener(CONSENT_EVENT, handleSync);
    window.addEventListener("storage", handleSync); // Sincroniza entre pestañas
    return () => {
      window.removeEventListener(CONSENT_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [readConsent]);

  const acceptPolicies = useCallback(() => {
    try {
      const payload: PoliciesConsent = {
        version: CURRENT_POLICIES_VERSION,
        accepted: true,
        timestamp: Date.now(),
      };
      localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("No se pudo persistir consentimiento en localStorage:", err);
    }
    setHasAccepted(true);
    // Notifica a todos los componentes suscriptores en la ventana
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  }, []);

  return {
    isMounted,
    // El banner solo se muestra si el componente ya montó en cliente Y el usuario no aceptó
    shouldShowBanner: isMounted && !hasAccepted,
    hasAccepted,
    acceptPolicies,
  };
}
```

---

### 3.2 Algoritmo de Animación Infinita sin Saltos para `BrandsMarquee`
*Trazabilidad: Cubre RF-03.1, RF-03.2, RF-03.3, RNF-04, CL-02, CL-09, CL-13*

**Problema:** Animaciones controladas por JavaScript provocan caídas de frames en móviles de gama media. Los bucles CSS con traslación simple sufren "tirones" visuales al reiniciar la posición. Además, capturar eventos de touch puede trabar el scroll vertical de la página.

**Solución Arquitectónica:**
1. **Duplicación DOM del set:** Renderizar el array de las 10 marcas duplicado (`[...BRANDS, ...BRANDS]`, total 20 nodos).
2. **Traslación GPU en CSS:** Mover exactamente el 50% del ancho del track (`translateX(-50%)`) de forma infinita y lineal.
3. **Manejo Táctil y Scroll Vertical:** Aplicar `touch-action: pan-y` para no entorpecer el swipe vertical del usuario. Pausar la animación únicamente si el contacto táctil se sostiene de forma estática (> 250ms sin desplazamiento vertical).

```typescript
// Pseudocódigo: src/components/landing/BrandsMarquee.tsx

// 1. Declaración de las 10 marcas específicas autorizadas (RF-03.2)
const WORKSHOP_BRANDS = [
  { id: "bosch", name: "Bosch", subtitle: "Diesel Service", logo: BoschLogo },
  { id: "zexel", name: "Zexel", logo: ZexelLogo },
  { id: "denso", name: "Denso", logo: DensoLogo },
  { id: "siemens-vdo", name: "Siemens VDO", logo: SiemensVDOLogo },
  { id: "delphi", name: "Delphi", logo: DelphiLogo },
  { id: "caterpillar", name: "Caterpillar", logo: CatLogo },
  { id: "cummins", name: "Cummins", logo: CumminsLogo },
  { id: "stanadyne", name: "Stanadyne", logo: StanadyneLogo },
  { id: "diesel-kiki", name: "Diesel Kiki", logo: DieselKikiLogo },
  { id: "perkins", name: "Perkins", logo: PerkinsLogo },
] as const;

// 2. Duplicación para garantizar bucle cerrado sin saltos
const MARQUEE_ITEMS = [...WORKSHOP_BRANDS, ...WORKSHOP_BRANDS];

export function BrandsMarquee() {
  const [isTouchPaused, setIsTouchPaused] = useState(false);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Manejo táctil no intrusivo (CL-09, CL-13)
  const handleTouchStart = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    // Solo pausa si el toque dura más de 250ms (evita pausar durante scrolls verticales rápidos)
    touchTimerRef.current = setTimeout(() => {
      setIsTouchPaused(true);
    }, 250);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    // Reanudación suave con retardo de gracia de 1.5s
    resumeTimerRef.current = setTimeout(() => {
      setIsTouchPaused(false);
    }, 1500);
  };

  return (
    <section 
      aria-label="Marcas especializadas trabajadas por el taller"
      className="relative overflow-hidden py-10 bg-slate-900/60 border-y border-slate-800/80"
    >
      {/* Máscara de gradiente difuminado en bordes izquierdo y derecho (RF-03.3) */}
      <div className="pointer-events-none absolute inset-0 z-10 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" />

      {/* Track horizontal con touch-action pan-y */}
      <div 
        className="flex w-max touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div 
          className={`flex gap-12 sm:gap-16 items-center animate-marquee ${
            isTouchPaused ? "[animation-play-state:paused]" : ""
          } hover:[animation-play-state:paused] motion-reduce:[animation:none]`}
        >
          {MARQUEE_ITEMS.map((brand, index) => (
            <div 
              key={`${brand.id}-${index}`}
              className="flex items-center gap-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 select-none"
            >
              <brand.logo className="h-8 w-auto max-w-[120px] text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

```css
/* Reglas en src/styles.css */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 35s linear infinite;
}

@media (max-width: 768px) {
  .animate-marquee {
    animation-duration: 25s;
  }
}
```

---

### 3.3 Lógica de Fallback y Carga Eficiente del Video `.mp4`
*Trazabilidad: Cubre RF-01.2, RNF-02, CL-01, CL-08*

**Problema:** Un archivo de video de 3.1 MB penaliza severamente el ancho de banda y el LCP si se descarga indiscriminadamente. Si el navegador bloquea la reproducción automática o la red es deficiente, la pantalla puede parpadear en negro o quedar congelada.

**Solución Arquitectónica:**
1. Carga anticipada de póster ligero (`inyectores-detalle.webp`, ~180 KB).
2. Detección preventiva de la cabecera `Save-Data` o conexión estimada 2G/3G lenta (`navigator.connection`).
3. Intercepción del rechazo de la promesa `play()` de HTML5 y eventos `error` para conmutar transparentemente al fallback estático sin mostrar controles rotos.

```typescript
// Pseudocódigo: src/components/landing/WarrantyVideoPlayer.tsx

import { useState, useEffect, useRef } from "react";
import posterImage from "@/assets/workshop/inyectores-detalle.webp";
import videoSrc from "@/assets/workshop/banco-en-vivo.mp4";

export function WarrantyVideoPlayer() {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Verificación de ahorro de datos o conexión móvil lenta (CL-08)
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const isSlowConnection = conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
    const prefersReducedData = window.matchMedia("(prefers-reduced-data: reduce)").matches;

    if (isSlowConnection || prefersReducedData) {
      setShouldLoadVideo(false);
      return;
    }

    // 2. Intentar reproducción segura
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Bloqueo de autoplay por directiva de ahorro de energía o permisos de navegador (CL-01)
          setHasPlaybackError(true);
        });
      }
    }
  }, []);

  // Si se detecta modo ahorro o falla el reproductor, se sirve nativamente la fotografía
  if (!shouldLoadVideo || hasPlaybackError) {
    return (
      <div className="relative aspect-video lg:aspect-[4/3] w-full overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-950 shadow-xl">
        <img 
          src={posterImage} 
          alt="Banco de ensayo computarizado para inyectores Common Rail"
          className="size-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-3 left-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-sm border border-blue-500/30">
          Banco de Precisión Common Rail
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video lg:aspect-[4/3] w-full overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-950 shadow-xl">
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterImage}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        onError={() => setHasPlaybackError(true)}
        className="size-full object-cover"
        title="Ensayo dinámico en banco de pruebas"
      />
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-blue-950/80 px-3 py-1 text-[11px] font-bold text-blue-300 backdrop-blur-sm border border-blue-500/30">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        Ensayo en Tiempo Real
      </div>
    </div>
  );
}
```

---

## 4. Jerarquía Estricta de Z-Index Mapeada

Para erradicar definitivamente las colisiones visuales y de interacción detectadas en la auditoría QA (conflictos entre el banner inferior, el modal de políticas, el carrito lateral y los botones flotantes de WhatsApp), se define y bloquea la siguiente escala inmutable de capas:

```
┌────────────────────────────────────────────────────────────────────────┐
│ NIVEL 50: Superficies de Interrupción y Modales (z-50)                 │
│  - PoliciesModal.tsx (DialogContent + Backdrop)                        │
│  - CartDrawer.tsx (SheetContent + Backdrop)                            │
│  - LandingNavbar.tsx (Menú hamburguesa móvil desplegado)               │
├────────────────────────────────────────────────────────────────────────┤
│ NIVEL 45: Panel Flotante de Consentimiento (z-45)                      │
│  - PoliciesBanner.tsx (Dock Card anclado en esquina inferior izquierda)│
│    (Desktop: left-6 bottom-6 / Móvil: inset-x-3 bottom-3)              │
├────────────────────────────────────────────────────────────────────────┤
│ NIVEL 40: Puntos de Acción Flotantes Fijos (z-40)                      │
│  - FloatingWhatsApp.tsx (Landing: bottom-6 right-6 / móvil: bottom-36) │
│  - floating-cart-button (Catálogo: bottom-6 right-6)                   │
├────────────────────────────────────────────────────────────────────────┤
│ NIVEL 10 a 30: Encabezados y Controles Relativos (z-10 a z-30)         │
│  - LandingNavbar fijo en scroll (z-30)                                 │
│  - Máscaras difuminadas de gradientes (z-10)                           │
├────────────────────────────────────────────────────────────────────────┤
│ NIVEL 0: Flujo Ordinario del Documento (z-0)                           │
│  - Bento Grid, Hero, Mapa, Tarjetas de catálogo y Footer               │
└────────────────────────────────────────────────────────────────────────┘
```

### Reglas de Coexistencia Espacial Resueltas:
1. **Desacoplamiento Espacial en Desktop:** El botón flotante de WhatsApp y el botón del carrito residen permanentemente en la **esquina inferior derecha** (`right-6 bottom-6 z-40`). El panel de políticas (`PoliciesBanner`) se posiciona en la **esquina inferior izquierda** (`left-6 bottom-6 max-w-md z-45`). No existe solapamiento espacial.
2. **Desplazamiento Dinámico en Móvil:** En dispositivos móviles (< 640px), `PoliciesBanner` se ancla a 12px del borde inferior (`inset-x-3 bottom-3`). Para evitar tapar el disparador de WhatsApp de la Landing, `FloatingWhatsApp` reacciona dinámicamente elevando su posición a `bottom-36` mientras el banner esté visible, retornando a `bottom-6` tras la aceptación.
3. **Apertura de Modales / Drawers:** Cuando el usuario abre el `CartDrawer` o el `PoliciesModal` (ambos en `z-50`), sus backdrops oscuros cubren todo el viewport, incluyendo el banner de `z-45`, impidiendo interacciones cruzadas accidentales.

---

## 5. Decisiones Técnicas Justificadas y Alternativas Descartadas

### D-01: Conversión Offline a WebP/SVG vs. Carga de Archivos Brutos HEIC/PNG
*Cubre: RF-01.1, RF-01.3, RF-02.1, RNF-02, RNF-08 (Principio 3 de la Constitución)*

- **Decisión:** Los archivos de taller brutos (`.HEIC` de 3.7–4.7 MB) y `.jpeg` se procesan offline mediante un script de Sharp/Node.js, normalizándolos a formato moderno WebP (`.webp`) de ≤ 350 KB, resolución 1920px (Hero) o 1280px (Servicios/Ubicación), calidad 85% y descarte estricto de metadatos EXIF. Los logotipos de las marcas se implementan como vectores SVG limpios.
- **Alternativa Descartada:** Servir los archivos `.HEIC` directamente o transcodificarlos en runtime en el navegador. Se descartó porque Google Chrome, Mozilla Firefox y navegadores móviles en Android/Windows carecen de soporte nativo para HEIC, provocando imágenes rotas y violando flagrantemente los límites de rendimiento (LCP > 8s).

---

### D-02: Recalibración de Tokens Semánticos OKLCH vs. Clases CSS Hexadecimales Ad-Hoc
*Cubre: RF-05.1, RNF-01*

- **Decisión:** Recalibrar en [src/styles.css](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/src/styles.css) las variables oficiales del Design System dentro de `@theme inline`:
  - `--whatsapp: oklch(0.55 0.16 160);` (Verde esmeralda oscuro de alta solidez)
  - `--whatsapp-foreground: oklch(0.99 0 0);` (Blanco puro `#FFFFFF`)
  - En modo oscuro (`.dark`): `--whatsapp: oklch(0.52 0.17 160);` y `--whatsapp-foreground: oklch(0.99 0 0);`.
  Esto garantiza que todos los botones con `variant="whatsapp"` hereden automáticamente el contraste accesible WCAG AAA (ratio > 7:1) sin tocar clases locales dispersas.
- **Alternativa Descartada:** Utilizar estilos en línea o clases de utilidad hexadecimales (`bg-[#059669] text-white`). Se descartó porque rompe la coherencia del diseño con Tailwind v4, desacopla los componentes del sistema de temas (.dark) e infringe las directrices de mantenimiento del proyecto.

---

### D-03: Panel Flotante Dock Card en Esquina Inferior Izquierda vs. Banner Full-Width Inferior
*Cubre: RF-04.2, RF-04.3, RNF-06, CL-06, CL-07*

- **Decisión:** Implementar el banner como una tarjeta flotante (*dock card* / panel compacto) de máximo 420px de ancho anclada a la izquierda (`sm:left-6 sm:bottom-6 z-45`).
- **Alternativa Descartada:** Barra fija a pantalla completa en la parte inferior (`inset-x-0 bottom-0`). Se descartó formalmente (Hallazgos 10, 11 y 12 de QA) porque colisionaba inevitablemente con los botones flotantes de WhatsApp y del carrito de compras en la esquina derecha, tapaba los filtros del catálogo y consumía más del 35% del viewport vertical en dispositivos móviles pequeños.

---

## 6. Estrategia de Pruebas Automatizadas (Testing Suite)

La estrategia de pruebas en Vitest y Testing Library valida la consistencia lógica de la persistencia, el aislamiento de fallos de red y la correcta experiencia de usuario sin desajustes.

### 6.1 Pruebas Unitarias de Persistencia y Validación Zod (`policies-consent.test.ts`)
*Cubre: RF-04.2, RNF-05, CL-03, CL-05, CL-13*

1. **Validación de Esquema Exitoso:**
   - Comprobar que `PoliciesConsentSchema.safeParse` valide correctamente `{ version: 1, accepted: true, timestamp: Date.now() }`.
2. **Rechazo y Purga Fail-Fast:**
   - Comprobar que payloads con versiones desactualizadas (`version: 0` o `version: 2`) sean rechazados.
   - Comprobar que objetos con propiedades extra no declaradas sean rechazados debido a `.strict()`.
   - Simular `localStorage` conteniendo basura o strings corruptos y verificar que la función de lectura ejecute `removeItem` y devuelva `accepted: false`.
3. **Manejo de Entorno Restringido:**
   - Simular lanzamiento de `SecurityError` al invocar `localStorage.getItem` (modo incógnito estricto en Safari/Firefox) y comprobar que capture la excepción y degrade a memoria sin arrojar errores no controlados.

---

### 6.2 Pruebas de Componentes: Banner y Modal de Políticas (`Policies.integration.test.tsx`)
*Cubre: RF-04.2, RF-04.3, RF-04.4, CL-04, CL-11*

1. **Renderizado Condicional:**
   - Con `localStorage` vacío: verificar que tras el montaje y retardo (timer mock) el componente `PoliciesBanner` se renderice en el DOM.
   - Con consentimiento previamente almacenado: verificar que `PoliciesBanner` retorne `null`.
2. **Acción de Aceptación:**
   - Simular clic en el botón primario *"Aceptar y Continuar"* del banner: verificar que se invoque `localStorage.setItem` con el payload validado, se emita el evento `ld:policies-consent-changed` y el banner se desmonte.
3. **Apertura y Accesibilidad del Modal:**
   - Simular clic en *"Ver Políticas Completas"* o en el enlace del footer: verificar que se abra el diálogo en `z-50`, atrape el foco, muestre los 4 ejes normativos y permita el cierre presionando `Escape`.
   - Si se acepta desde el interior del modal, verificar que persista en `localStorage` y se cierren tanto el modal como el banner inferior.

---

### 6.3 Pruebas de Resiliencia Multimedia en Garantía (`WarrantySection.test.tsx`)
*Cubre: RF-01.2, CL-01, CL-08*

1. **Renderizado Inicial Seguro:**
   - Verificar que el elemento `<video>` posea los atributos obligatorios `poster`, `muted`, `autoPlay`, `loop`, `playsInline` y `preload="metadata"`.
2. **Degradación ante Bloqueo de Autoplay o Error de Stream:**
   - Simular que `HTMLMediaElement.prototype.play` rechaza la promesa (bloqueo por ahorro de batería): verificar que el componente monte el fallback fotográfico `inyectores-detalle.webp` con su badge técnico.
3. **Degradación ante Ahorro de Datos (`Save-Data`):**
   - Mockear `navigator.connection = { saveData: true }`: verificar que el componente descarte el video y monte directamente la fotografía optimizada.

---

### 6.4 Pruebas de Estilo y Accesibilidad en Botones CTA (`WhatsAppCTAs.test.tsx`)
*Cubre: RF-05.1, RF-05.2, RF-05.3, RF-05.4, RF-05.5, RNF-03*

1. **Contraste y Variante Unificada:**
   - Verificar en `ProductCard`, `catalogo.$productId`, `CartDrawer` y `catalogo.tsx` (estado vacío) que los botones de WhatsApp apliquen la clase de variante `bg-whatsapp text-whatsapp-foreground`.
   - Verificar la presencia del ícono oficial `FaWhatsapp` en todos los puntos de contacto directo.

---

## 7. Matriz de Trazabilidad Requisitos vs. Plan

| Requisito / Caso Límite | Componente / Archivo | Mecanismo de Implementación en Plan | Prueba Asociada |
| :--- | :--- | :--- | :--- |
| **RF-01.1** (Hero real) | `HeroSection.tsx` | Imagen `taller-hero.webp`, zoom 12s, overlay > 7:1 y posición focal móvil `center 35%`. | Inspección visual / Lighthouse |
| **RF-01.2** (Video y fallback) | `WarrantySection.tsx` | Layout 2 cols, video con `poster`, degradación ante `Save-Data` y fallback fotográfico. | `WarrantySection.test.tsx` |
| **RF-01.3** (Fachada 1215) | `LocationSection.tsx` | Layout 12 cols: columna de 5 cols con foto `fachada-local.webp` y mapa en 7 cols. | Inspección visual |
| **RF-02.1 a 02.3** (Bento Grid) | `ServicesSection.tsx` | Grilla CSS `lg:grid-cols-12`, 4 fotos reales, copys definitivos en `site-config.ts` y badges. | Inspección visual |
| **RF-03.1 a 03.3** (Marquee) | `BrandsMarquee.tsx` | Duplicación de 10 marcas (20 nodos), animación 35s/25s, `touch-action: pan-y`, fade lateral. | `BrandsMarquee.test.tsx` |
| **RF-04.1** (4 Ejes) | `site-config.ts`, `PoliciesModal.tsx` | Redacción formal centralizada de Cotizaciones, Garantía, Repuestos y Envíos. | `Policies.integration.test.tsx` |
| **RF-04.2** (Persistencia Zod) | `policies-consent.ts` | `PoliciesConsentSchema` estricto en frontera con purga automática de datos corruptos. | `policies-consent.test.ts` |
| **RF-04.3** (Banner dock card) | `PoliciesBanner.tsx` | Ubicación en esquina inferior izquierda (`z-45`), libre de colisiones con WhatsApp (`z-40`). | `Policies.integration.test.tsx` |
| **RF-04.4** (Modal y Footer) | `PoliciesModal.tsx`, `LandingFooter.tsx` | Botón accesible en footer y diálogo Radix `z-50` con trampa de foco y sincronización. | `Policies.integration.test.tsx` |
| **RF-05.1 a 05.5** (CTAs WhatsApp) | `styles.css`, `button.tsx`, Catálogo | Recalibración OKLCH esmeralda (`0.55 0.16 160`) con texto `#FFFFFF` (WCAG AAA) y `FaWhatsapp`. | `WhatsAppCTAs.test.tsx` |
| **RNF-08** (Normalización Media) | `src/assets/workshop/` | Conversión offline de `.HEIC` a `.webp` (calidad 85%, ≤ 350 KB, sin EXIF). | Build bundle check |
| **CL-01** (Bloqueo Autoplay) | `WarrantySection.tsx` | Captura de promesa `play().catch()` con transición a póster sin flash negro. | `WarrantySection.test.tsx` |
| **CL-02** (Reduced Motion) | `BrandsMarquee.tsx`, `HeroSection.tsx` | Directiva `@media (prefers-reduced-motion: reduce)` anulando animaciones continuas. | `BrandsMarquee.test.tsx` |
| **CL-06, CL-07** (Móvil y Rutas) | `PoliciesBanner.tsx`, `FloatingWhatsApp.tsx` | Separación de capas, padding compacto y elevación a `bottom-36` de WhatsApp en móvil. | Inspección visual responsive |
| **CL-13** (JSON Corrupto) | `policies-consent.ts` | `safeParse` captura error y purga `localStorage.removeItem`. | `policies-consent.test.ts` |

---

## 8. Plan de Ejecución Secuencial (Fases de Implementación)

1. **Fase 1: Normalización de Activos y Tokens de Diseño:**
   - Ejecutar la conversión offline y optimización de los activos `.HEIC`/`.jpeg` a `.webp` en `src/assets/workshop/`.
   - Integrar los 10 logotipos vectoriales limpios SVG en `src/assets/brands/`.
   - Recalibrar los tokens semánticos OKLCH `--whatsapp` y `--whatsapp-foreground` en `src/styles.css` y registrar los `@keyframes marquee`.
2. **Fase 2: Rediseño Premium de CTAs en Catálogo:**
   - Actualizar `variant="whatsapp"` en `src/components/ui/button.tsx`.
   - Adaptar `ProductCard.tsx`, `catalogo.$productId.tsx`, `CartDrawer.tsx` y el estado sin resultados de `catalogo.tsx`.
3. **Fase 3: Carrusel Infinito de Marcas Especializadas:**
   - Crear el componente `BrandsMarquee.tsx` con manejo táctil no invasivo (`touch-action: pan-y`) y máscaras difuminadas.
   - Montar `BrandsMarquee` en `src/routes/index.tsx` entre `FeaturedProductsCarousel` y `ServicesSection`.
4. **Fase 4: Identidad Fotográfica y Bento Grid en Landing Page:**
   - Actualizar `HeroSection.tsx` con `taller-hero.webp` y micro-animación de 12s.
   - Actualizar `WarrantySection.tsx` con el reproductor de video resiliente, póster y fallback.
   - Actualizar `LocationSection.tsx` con la fotografía de fachada `fachada-local.webp` (numeración 1215).
   - Reemplazar la grilla de `ServicesSection.tsx` por el Bento Grid de 12 columnas con fotos y copys definitivos.
5. **Fase 5: Sistema de Políticas Comerciales y de Garantía:**
   - Crear el módulo de persistencia y validación Zod `policies-consent.ts`.
   - Implementar el panel flotante dock card `PoliciesBanner.tsx` en esquina inferior izquierda (`z-45`).
   - Implementar el modal dialog accesible `PoliciesModal.tsx` (`z-50`).
   - Vincular el botón semántico en `LandingFooter.tsx` y sincronizar el desplazamiento en `FloatingWhatsApp.tsx`.
6. **Fase 6: Testing Automatizado y Auditoría de Build:**
   - Ejecutar la suite completa de pruebas unitarias y de integración en Vitest (`npm test`).
   - Verificar ausencia de errores de tipos con `npx tsc --noEmit`.
   - Ejecutar `npm run build` confirmando que la aplicación compila limpiamente para producción.
