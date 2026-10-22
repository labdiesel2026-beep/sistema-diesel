# Plan de Arquitectura e Implementación — Spec 009: Rediseño UI/UX Industrial Premium (Landing y Catálogo)

**Fase:** 009-rediseño-ui-premium  
**Versión:** 1.0  
**Fecha:** 2026-10-22  
**Basado en:** [docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md), [specs/009-rediseño-ui-premium/spec.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/009-rediseño-ui-premium/spec.md) y [src/styles.css](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/src/styles.css)  
**Estado:** Plan de Arquitectura Aprobado para Planificación de Tareas

---

## 1. Estructura de Integración CSS y Mapeo de Tokens OKLCH

*Trazabilidad: Cubre RF-01, RF-02, RNF-01, RNF-03 y Principio 1 de la Constitución*

Para cumplir con la directiva innegociable de `src/styles.css` (*"All colors MUST use oklch format"*) y evitar valores fijos no calibrados (ej. `zinc-950` o `#FFFFFF`), todo el rediseño se acopla a los tokens semánticos definidos en `@theme inline` y la clase `.dark`.

### 1.1 Mapeo de Tokens Semánticos OKLCH

```
┌──────────────────────────────────────┬──────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Token Semántico                      │ Valor Calibrado OKLCH                    │ Rol Visual en la Dirección de Arte                     │
├──────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ --color-background (dark)            │ oklch(0.129 0.042 264.695)               │ Fondo mineral oscuro inerte continuo para toda la web. │
│ --color-card (dark)                  │ oklch(0.208 0.042 265.755)               │ Superficie de tarjetas técnicas, Bento y paneles.      │
│ --color-border (dark)                │ oklch(1 0 0 / 10%)                       │ Hairlines divisorias de 1px translúcidas.              │
│ --color-border-hover (dark)          │ oklch(1 0 0 / 25%)                       │ Realce sutil de hairline al interactuar (hover/focus). │
│ --color-foreground (dark)            │ oklch(0.984 0.003 247.858)               │ Texto colosal macro y datos duros de alto contraste.   │
│ --color-muted-foreground (dark)      │ oklch(0.704 0.04 256.788)                │ Etiquetas técnicas, leyendas y datos secundarios.      │
│ --color-whatsapp                     │ oklch(0.55 0.16 160)                     │ Verde esmeralda industrial (único acento cromático).   │
│ --color-whatsapp-foreground          │ oklch(0.99 0 0)                          │ Texto blanco puro sobre botón WhatsApp (WCAG AAA 7:1). │
│ --color-whatsapp-hover               │ oklch(0.48 0.17 160)                     │ Estado activo/hover del CTA de cotización.             │
└──────────────────────────────────────┴──────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

### 1.2 Jerarquía Tipográfica y Clases Utilitarias

Se estandarizan dos familias tipográficas y dos escalas extremas para el Contraste Macro/Micro:

1. **Tipografía Macro (Títulos y Declaraciones de Impacto):**
   - Fuente: `var(--font-display)` (Barlow / Sans Compact).
   - Escala Fluida: `clamp(2.5rem, 6vw, 4.5rem)` (móvil: ~40px, desktop: ~72px).
   - Peso: `font-extrabold` (800).
   - Interlineado: `leading-[1.05]`.
   - *Tracking*: `tracking-[-0.04em]` (`tracking-tighter`).

2. **Tipografía Micro (Identificadores, Códigos OEM y Badges Técnicos):**
   - Fuente: `font-mono` (ui-monospace, monospace).
   - Escala: `text-[10px]` (`0.625rem`) fija y uniforme.
   - Peso: `font-semibold` (600).
   - Transformación: `uppercase`.
   - *Tracking*: `tracking-[0.2em]`.

3. **Hairlines Técnicas:**
   - Clase utilitaria base: `border border-border/80` (resuelve a `1px solid oklch(1 0 0 / 10%)`).
   - Radio de curvatura industrial: `rounded-lg` (máximo 8px, eliminando esquinas excesivamente redondeadas).

---

## 2. Estrategia de Aislamiento del Modo Oscuro (Público vs. `/admin`)

*Trazabilidad: Cubre RF-01, RNF-04, CL-05 y Principios 1 y 4 de la Constitución*

### 2.1 Diagnóstico de Aislamiento
Actualmente, `src/styles.css` define `:root` como tema claro (`--background: oklch(0.984 0.003 250)`) y `.dark` como tema oscuro. Si se forzara la clase `dark` a nivel global en la etiqueta `<html>`, el panel de administración (`/admin`) sufriría regresiones visuales severas e incompatibilidades con sus formularios operativos.

### 2.2 Arquitectura del Contenedor Raíz
Para garantizar un aislamiento absoluto sin destellos blancos (*FOUC*):

```
┌─────────────────────────────────────────────────────────────────────────┐
│ src/routes/__root.tsx (RootShell)                                       │
│ <html> (sin clase dark fija)                                            │
│   <body>                                                                │
│     <QueryClientProvider>                                               │
│       <CatalogCartProvider>                                             │
│                                                                         │
│         ┌─────────────────────────────────────────────────────────────┐ │
│         │ Discriminador de Ruta (useLocation)                         │ │
│         │                                                             │ │
│         │   SI pathname.startsWith('/admin')                         │ │
│         │   └── Renderiza <Outlet /> DIRECTO                         │ │
│         │       (Hereda :root CLARO, fondos nativos de admin)         │ │
│         │                                                             │ │
│         │   SI ES RUTA PÚBLICA ('/', '/catalogo', etc.)               │ │
│         │   └── Renderiza <PublicLayoutWrapper className="dark">      │ │
│         │         ├── <LandingNavbar />                               │ │
│         │         ├── <Outlet /> (Landing / Catálogo / Detalle)       │ │
│         │         ├── <CartDrawer /> (en z-40)                        │ │
│         │         └── <LandingFooter />                               │ │
│         │       </PublicLayoutWrapper>                                │ │
│         └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Garantía Anti-FOUC
Dado que TanStack Router evalúa la ruta sincrónicamente antes de pintar el árbol de componentes (tanto en SSR como en hidratación del cliente), el contenedor `PublicLayoutWrapper` inyecta la clase `.dark` de forma inmediata. Al no depender de una lectura asíncrona de `localStorage` ni de un switch de usuario, se erradica por completo cualquier parpadeo de fondo claro durante la navegación.

---

## 3. Reestructuración de Componentes UI

### 3.1 Landing Page: Bento Grid Determinista (`ServicesSection.tsx`)
*Trazabilidad: Cubre RF-04, RNF-01, RNF-02*

Se sustituye la grilla convencional de tarjetas por una matriz técnica asimétrica con separación métrica exacta:

- **Desktop (ancho ≥ 1024px):** `grid grid-cols-3 gap-6 auto-rows-[240px]`
  - **Módulo 1 (Banco de Pruebas Diésel Computarizado):** Ocupa 2 columnas y 2 filas (`col-span-2 row-span-2`). Fondo fotográfico real `banco-pruebas.webp` con viñeta sutil, métricas de presión de 2500 bar y codificación IMA/C2i/C3i.
  - **Módulo 2 (Inyectores Inductivos y Piezoeléctricos):** Ocupa 1 columna y 1 fila (`col-span-1 row-span-1`). Fondo `inyectores-detalle.webp`, datos de tolerancias de cono y aguja en micrones.
  - **Módulo 3 (Bombas de Alta Presión CP1/CP3/CP4 y Mecánicas):** Ocupa 1 columna y 1 fila (`col-span-1 row-span-1`). Especificaciones de estanqueidad y caudales de transferencia.
  - **Módulo 4 (Sistemas Pesados UIS / UPS / Inyector Bomba):** Ocupa 3 columnas horizontales (`col-span-3 row-span-1`). Detalle de cobertura para Scania PDE, Volvo HPI, Iveco Cursor y John Deere.
- **Móvil (ancho < 1024px):** `grid grid-cols-1 gap-4 auto-rows-auto`. Cada módulo se apila verticalmente con altura mínima ergonómica (`min-h-[220px]`).

### 3.2 Landing Page: Hero Edge-to-Edge con Contraste Localizado (`HeroSection.tsx`)
*Trazabilidad: Cubre RF-03, RNF-01, CL-04*

- **Estructura:** Contenedor de ancho completo (`min-h-[100dvh] relative overflow-hidden`).
- **Imagen Cruda:** `taller-hero.webp` ocupa el 100% absoluto sin recortes. El 75% superior se mantiene libre de veladuras completas.
- **Capa de Contraste Localizado:** Detrás del bloque de textos se aplica un gradiente direccional `bg-gradient-to-t from-black/90 via-black/60 to-transparent` acotado a la mitad inferior (`h-2/3 bottom-0`), complementado con `text-shadow: 0 2px 8px rgba(0,0,0,0.85)` sobre títulos macro y párrafos.

### 3.3 Landing Page: Marquesina de Marcas Ghost (`BrandsMarquee.tsx`)
*Trazabilidad: Cubre RF-05, RNF-04, CL-05*

- **Desktop:** Opacidad pasiva de 45% y `filter: grayscale(100%)`. Transición de 300ms `ease-out` a opacidad 100% y `grayscale(0%)` ante `:hover` o `:focus-visible`.
- **Móvil (Táctil):** Opacidad estática calibrada al 70% (`grayscale(100%)`), asegurando contraste bajo luz solar. Se desactiva la interacción pegada por `:hover`.
- **Accesibilidad:** Cada nodo cuenta con `tabindex={0}`, `role="img"` y `aria-label="Fabricante homologado: {marca}"`.

### 3.4 Catálogo: Tarjeta de Producto como "Ficha Técnica Pura" (`ProductCard.tsx`)
*Trazabilidad: Cubre RF-08, CL-01, CL-02*

La tarjeta se construye bajo el patrón vertical Flexbox con auto-margin inferior para garantizar que todos los botones de la grilla queden perfectamente nivelados:

```
┌────────────────────────────────────────────────────────┐
│ Contenedor Flexbox (flex flex-col h-full rounded-lg)   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Imagen de Repuesto (aspect-[16/10], border-b)      │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Badges: [MARCA] [NUEVO (sólido) / REAC. (punteado)]│ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Título de Repuesto (line-clamp-2, font-semibold)   │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Cuadrícula Técnica:                                │ │
│ │ OEM: 0445110369   [+2 ALTERNATIVOS]                │ │
│ │ ESTADO: DISPONIBLE                                 │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ mt-auto (Empuje Flexbox al fondo)                  │ │
│ │ Precio: $ 450.000,00  o  [A COTIZAR]               │ │
│ │ ┌───────────────────┬────────────────────────────┐ │ │
│ │ │ [+] Carrito       │ [WhatsApp Directo]         │ │ │
│ │ └───────────────────┴────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **Múltiples OEM:** Se renderiza el OEM principal. Si existen equivalencias secundarias, se monta un badge monoespaciado interactivo `+{N} ALTERNATIVOS` con ventana emergente descriptiva (`title` nativo accesible o popover).
- **OEM Faltante:** Se muestra `"—"` con tipografía monoespaciada neutra.
- **Precio Faltante:** Badge monoespaciado `"A COTIZAR"`.

### 3.5 Catálogo: Consola Lateral y Comando Móvil (`CatalogFilters.tsx` y `catalogo.tsx`)
*Trazabilidad: Cubre RF-07, CL-04*

- **Desktop (≥ 1024px):** Consola fija lateral `sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto` con scrollbar técnico oscurecido.
- **Móvil (< 1024px):** Botón flotante `FILTROS TÉCNICOS` en `z-35` fijado en la parte inferior de la pantalla (`bottom-6 left-1/2 -translate-x-1/2`), con micro-insignia del conteo de filtros activos. Al pulsarlo, abre `FilterDrawer` en `z-40` (`max-w-[340px]`).

---

## 4. Lógica en Pseudocódigo

### 4.1 Cálculo Dinámico del Carrito Mixto (`CartDrawer.tsx`)
*Trazabilidad: Cubre RF-09, CL-03 y Principio 5 de la Constitución*

```typescript
// ALGORITMO: Cálculo de Totales y Desglose Mixto en CartDrawer
function calculateCartTotals(items: EnrichedCartItem[]): CartSummary {
  let numericalTotal = 0;
  let hasPricedItems = false;
  let quoteItemsCount = 0;

  for (const item of items) {
    const isPriced = item.showPrice && item.price !== null && item.price > 0 && !item.requiresReconfirmation;

    if (isPriced) {
      numericalTotal += (item.price as number) * item.quantity;
      hasPricedItems = true;
    } else {
      quoteItemsCount += item.quantity;
    }
  }

  // Determinación de Leyenda del Footer
  let displayLabel = "";
  if (hasPricedItems && quoteItemsCount > 0) {
    displayLabel = `${formatCurrency(numericalTotal)} + ÍTEMS A COTIZAR`;
  } else if (hasPricedItems && quoteItemsCount === 0) {
    displayLabel = formatCurrency(numericalTotal);
  } else {
    displayLabel = "PRESUPUESTO A CONFIRMAR";
  }

  return { numericalTotal, hasPricedItems, quoteItemsCount, displayLabel };
}

// ALGORITMO: Generación del Mensaje de WhatsApp Estructurado
function buildWhatsAppCartMessage(items: EnrichedCartItem[], summary: CartSummary): string {
  let message = "Hola Laboratorio Diésel, solicito cotización para el siguiente pedido:\n\n";

  items.forEach((item, index) => {
    const isPriced = item.showPrice && item.price !== null && item.price > 0;
    const priceText = isPriced 
      ? `${formatCurrency(item.price! * item.quantity)} (${formatCurrency(item.price!)} c/u)` 
      : "[A Cotizar]";
    
    message += `${index + 1}. ${item.name}\n`;
    message += `   - Cantidad: ${item.quantity}\n`;
    message += `   - OEM: ${item.oem || "N/A"}\n`;
    message += `   - Monto: ${priceText}\n\n`;
  });

  message += `*TOTAL ESTIMADO:* ${summary.displayLabel}\n`;
  message += "\nPor favor confirmar disponibilidad, plazos y medios de envío.";

  return encodeURIComponent(message);
}
```

### 4.2 Botón de Comando de Filtros Móvil Sticky (`catalogo.tsx`)
*Trazabilidad: Cubre RF-07, RF-10*

```typescript
// ALGORITMO: Renderizado Condicional del Botón Móvil de Filtros
function MobileFilterTrigger({ activeCount, onOpen }: { activeCount: number; onOpen: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-35 lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card/95 border border-white/20 text-foreground font-mono text-[11px] font-semibold tracking-wider uppercase shadow-2xl backdrop-blur-md active:scale-95 transition-transform"
        aria-label="Abrir panel de filtros técnicos"
      >
        <FilterIcon className="size-3.5 text-whatsapp" />
        <span>Filtros Técnicos</span>
        {activeCount > 0 && (
          <span className="flex items-center justify-center size-4 rounded-full bg-whatsapp text-white text-[9px] font-bold">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}
```

### 4.3 Esqueletos de Carga con Hairlines (`ProductGridSkeleton.tsx`)
*Trazabilidad: Cubre RF-08, RNF-02 y Principio 6 de la Constitución*

```typescript
// ALGORITMO: Esqueleto de Ficha Técnica con Pulso Neutro (Sin Desplazamiento CLS)
function TechnicalCardSkeleton() {
  return (
    <article className="flex flex-col h-full rounded-lg border border-border/80 bg-card overflow-hidden animate-pulse">
      {/* Contenedor de Imagen 16/10 */}
      <div className="aspect-[16/10] w-full bg-white/5 border-b border-border/80" />
      
      {/* Cuerpo Técnico */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Badges superiores */}
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-3 w-12 bg-white/10 rounded" />
        </div>
        
        {/* Título (2 líneas) */}
        <div className="space-y-1.5">
          <div className="h-4 w-5/6 bg-white/10 rounded" />
          <div className="h-4 w-3/5 bg-white/10 rounded" />
        </div>
        
        {/* Cuadrícula de Datos Duros */}
        <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-2">
          <div className="h-2.5 w-full bg-white/5 rounded" />
          <div className="h-2.5 w-4/6 bg-white/5 rounded" />
        </div>
        
        {/* Acciones inferiores mt-auto */}
        <div className="mt-auto pt-3 flex gap-2 items-center">
          <div className="h-9 w-10 bg-white/10 rounded-md" />
          <div className="h-9 flex-1 bg-white/10 rounded-md" />
        </div>
      </div>
    </article>
  );
}
```

---

## 5. Mapa Estricto de Jerarquía Z-Index

*Trazabilidad: Cubre RF-10, RNF-04, CL-04*

Para erradicar cualquier colisión o solapamiento entre la navegación, modales, banners de consentimiento y botones flotantes, se establece un apilamiento no negociable:

```
┌───────┬──────────────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Nivel │ Componentes Mapeados                                 │ Comportamiento y Aislamiento                           │
├───────┼──────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ z-50  │ LandingNavbar                                        │ Barra de navegación maestra anclada en la parte alta.  │
├───────┼──────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ z-40  │ CartDrawer                                           │ Modales, cajones y velos oscuros (backdrops).          │
│       │ CommercialPoliciesModal                              │ Atrapan el foco y bloquean el scroll de la página.    │
│       │ FilterDrawer (móvil)                                 │                                                        │
├───────┼──────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ z-35  │ MobileFilterTrigger                                  │ Disparador de filtros flotante en catálogo móvil.      │
│       │                                                      │ Situado debajo de modales, pero sobre widgets.         │
├───────┼──────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ z-30  │ FloatingWhatsApp                                     │ Botón flotante de mensajería y dock card de políticas. │
│       │ CommercialPoliciesBanner                             │ No interceptan toques del botón de filtros z-35.       │
├───────┼──────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ z-20  │ CatalogFilters (Sticky en Desktop)                   │ Consolas laterales de navegación y cabeceras fijas.    │
├───────┼──────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ z-10  │ ProductCard, Bento Modules, Menús Locales            │ Tarjetas técnicas interactivas y capas con hover.      │
├───────┼──────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ z-0   │ Superficie Base (--background), Fotos Crudas         │ Fondo mineral inerte y capas fotográficas inferiores.  │
└───────┴──────────────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 6. Decisiones Técnicas Justificadas y Alternativas Descartadas

### 6.1 Aislamiento de Modo Oscuro vía Contenedor de Ruta vs. Inversión en `:root`
- **Decisión Adoptada:** Envolver las rutas públicas en un componente con la clase `.dark` explícita, preservando `:root` claro para `/admin`.
- **Justificación:** Protege de forma inmediata y sin riesgo de regresiones todos los componentes y tablas del panel de administración, evitando tener que reescribir docenas de formularios internos.
- **Alternativa Descartada:** Invertir `:root` a oscuro y aplicar una clase `.light` en `/admin`. Se descartó porque Tailwind v4 y los componentes Shadcn/Radix existentes en `/admin` fueron concebidos asumiendo `:root` claro por defecto.

### 6.2 Contraste en Hero mediante Gradientes Localizados vs. Veladura Completa
- **Decisión Adoptada:** Mantener el 75% superior de la foto completamente cruda y usar gradiente oscuro restringido detrás de los textos.
- **Justificación:** Cumple con el Pilar 5 de Inmersión Edge-to-Edge y satisface las pautas WCAG (7:1 / 4.5:1) sin arruinar la autenticidad ni el impacto visual de las instalaciones del taller.
- **Alternativa Descartada:** Aplicar una capa translúcida oscura al 60% en todo el contenedor. Se descartó porque genera un aspecto "apagado" y de plantilla genérica que destruye el propósito del rediseño.

### 6.3 Alineación de Botones en Grilla vía Flexbox `mt-auto` vs. Altura Fija de Tarjeta
- **Decisión Adoptada:** Contenedor flexible con `mt-auto` en el bloque de acciones y `line-clamp-2` en el título.
- **Justificación:** Permite acomodar títulos técnicos largos sin que el texto desborde la tarjeta y asegura matemáticamente que los botones de WhatsApp y carrito queden alineados a la misma altura en toda la fila horizontal.
- **Alternativa Descartada:** Fijar la altura de las tarjetas a `h-[460px]`. Se descartó porque en pantallas móviles genera espacios vacíos antiestéticos en productos con títulos cortos y recorta información en pantallas estrechas.

### 6.4 Múltiples OEM con Badge Compacto `+{N} ALTERNATIVOS` vs. Lista Desplegada
- **Decisión Adoptada:** Mostrar el código primario del fabricante de inyección y un badge compacto con el conteo de equivalencias.
- **Justificación:** Mantiene la tarjeta como una ficha técnica limpia y legible, evitando que piezas con 6 códigos OEM deformen la grilla.
- **Alternativa Descartada:** Renderizar todos los códigos en la tarjeta principal. Se descartó porque satura visualmente la tarjeta y convierte la grilla en un bloque confuso de texto alfanumérico.

---

## 7. Estrategia de Pruebas (Tests y Prevención de FOUC)

*Trazabilidad: Cubre RNF-01, RNF-02, RNF-04 y Principio 1 de la Constitución*

### 7.1 Pruebas Unitarias de Lógica Comercial (Vitest)
Se crearán o actualizarán suites de prueba automatizadas para blindar la lógica de cotizaciones:

1. **`test/catalog-cart-totals.test.ts`:**
   - **Caso 1 (Solo productos con precio):** Verifica que la suma matemática sea exacta y la leyenda muestre solo el monto monetario.
   - **Caso 2 (Solo productos "A COTIZAR"):** Verifica que el total numérico sea 0 y la leyenda sea `"PRESUPUESTO A CONFIRMAR"`.
   - **Caso 3 (Carrito Mixto):** Verifica que la suma matemática sume solo los ítems con precio y la leyenda concatene exactamente `"+ ÍTEMS A COTIZAR"`.
   - **Caso 4 (Mensaje de WhatsApp):** Verifica que los ítems sin precio lleven la marca explícita `[A Cotizar]` y los ítems con precio lleven su desglose numérico.

### 7.2 Pruebas de Prevención de FOUC y Regresiones en `/admin`
1. **Verificación de Inyección de Clase `.dark`:** Comprobar mediante test de renderizado que la ruta `/` y `/catalogo` montan el contenedor con la clase `.dark`, mientras que la ruta `/admin` y `/admin/login` no poseen dicha clase en sus ancestros inmediatos.
2. **Auditoría de Contraste Automatizada (Axe / Playwright):** Ejecutar comprobación de contraste en el Hero y Fichas Técnicas del Catálogo, validando el cumplimiento del ratio 7:1 en títulos y 4.5:1 en micro-etiquetas.
3. **Prueba de No Ruptura de Grilla (CLS = 0):** Verificar que los esqueletos de carga posean exactamente las mismas proporciones (relación 16/10 en imagen y altura base) que las tarjetas renderizadas finales.

---

## 8. Mapeo Completo de Trazabilidad (RF / CL vs. Componentes del Plan)

```
┌──────────┬────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Requisito│ Componente / Módulo del Plan               │ Sección del Plan Donde se Resuelve                     │
├──────────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ RF-01    │ PublicLayoutWrapper, src/styles.css        │ Sección 1.1 (Tokens OKLCH) y Sección 2 (Aislamiento)   │
│ RF-02    │ src/styles.css, Tipografía Macro/Micro     │ Sección 1.2 (Escala Tipográfica Determinista)          │
│ RF-03    │ HeroSection.tsx                            │ Sección 3.2 (Hero Edge-to-Edge y Contraste Localizado) │
│ RF-04    │ ServicesSection.tsx                        │ Sección 3.1 (Bento Grid Determinista 3 cols / 1 col)   │
│ RF-05    │ BrandsMarquee.tsx                          │ Sección 3.3 (Marquesina Ghost con Opacidad 70% Móvil)  │
│ RF-06    │ WarrantySection.tsx, LocationSection.tsx   │ Sección 3.2 y Sección 5 (Z-Index)                      │
│ RF-07    │ CatalogFilters.tsx, catalogo.tsx           │ Sección 3.5 (Consola Sticky y Botón z-35)              │
│ RF-08    │ ProductCard.tsx                            │ Sección 3.4 (Patrón Ficha Técnica y Flexbox mt-auto)   │
│ RF-09    │ CartDrawer.tsx                             │ Sección 4.1 (Pseudocódigo de Cálculo Mixto)            │
│ RF-10    │ Toda la aplicación                         │ Sección 5 (Mapa Estricto de Jerarquía Z-Index)         │
│ RF-11    │ ProductGridSkeleton.tsx, ErrorBoundary     │ Sección 4.3 (Esqueleto Técnico)                        │
│ RF-12    │ src/routes/__root.tsx, src/routes/admin.tsx│ Sección 2 (Aislamiento Público vs Admin)               │
│ CL-01    │ ProductCard.tsx                            │ Sección 3.4 (Títulos largos line-clamp-2 y mt-auto)    │
│ CL-02    │ ProductCard.tsx                            │ Sección 3.4 (Múltiples OEM con +X ALTERNATIVOS)        │
│ CL-03    │ CartDrawer.tsx                             │ Sección 4.1 (Manejo de carrito mixto con precios)      │
│ CL-04    │ CatalogFilters.tsx                         │ Sección 3.5 (Scroll interno en pantallas laptops)      │
│ CL-05    │ BrandsMarquee.tsx                          │ Sección 3.3 (Opacidad 70% táctil bajo luz diurna)      │
└──────────┴────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```
