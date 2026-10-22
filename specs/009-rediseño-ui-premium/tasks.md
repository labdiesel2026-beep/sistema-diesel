# Tareas de Implementación — Spec 009: Rediseño UI/UX Industrial Premium (Landing y Catálogo)

**Fase:** 009-rediseño-ui-premium  
**Versión:** 1.0  
**Fecha:** 2026-10-22  
**Basado en:** [docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md), [specs/009-rediseño-ui-premium/spec.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/009-rediseño-ui-premium/spec.md) y [specs/009-rediseño-ui-premium/plan.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/009-rediseño-ui-premium/plan.md)  
**Estado:** Tareas Planificadas para Ejecución Atómica

---

## Fase 1: Configuración de Frontera (Tokens OKLCH, Aislamiento `.dark` y Z-Index)

- [x] **Tarea 1.1: Calibrar tokens OKLCH de superficie, hairlines y micro-tipografía en `src/styles.css`**
  - **Archivos:** `src/styles.css`
  - **Descripción:** Registrar en `@theme inline` y actualizar el bloque `.dark` con los tokens oficiales calibrados:
    - `--background: oklch(0.129 0.042 264.695)` (mineral oscuro inerte).
    - `--card: oklch(0.208 0.042 265.755)` (superficie de módulos técnicos y tarjetas).
    - `--border: oklch(1 0 0 / 10%)` (hairlines translúcidas de 1px).
    - Declarar clases utilitarias para la tipografía macro (`text-macro: clamp(2.5rem, 6vw, 4.5rem)`, `leading-[1.05]`, `tracking-[-0.04em]`) y micro (`text-micro: 10px`, `tracking-[0.2em]`, `font-mono`, `uppercase`).
  - **Cobertura:** RF-01, RF-02, RNF-01, RNF-03
  - **Hecho cuando:** `src/styles.css` compile limpiamente bajo Tailwind CSS v4 y las variables resuelvan exactamente en formato OKLCH verificado sin advertencias en consola.

- [x] **Tarea 1.2: Implementar contenedor `PublicLayoutWrapper` con clase `.dark` forzada**
  - **Archivos:** `src/components/layout/PublicLayoutWrapper.tsx`
  - **Descripción:** Crear el componente envoltorio para todas las vistas públicas (`/`, `/catalogo`, `/catalogo/$productId`), inyectando de forma determinista la clase `dark` y los estilos base (`min-h-screen bg-background text-foreground antialiased selection:bg-white/20 selection:text-white`).
  - **Cobertura:** RF-01, RF-12, RNF-04, Principio 1 de la Constitución
  - **Hecho cuando:** El componente exponga su interfaz `{ children: ReactNode }` y renderice el contenedor con la clase `.dark` fija sin dependencias asíncronas de almacenamiento local.

- [x] **Tarea 1.3: Integrar discriminación de rutas en `src/routes/__root.tsx` aislando `/admin`**
  - **Archivos:** `src/routes/__root.tsx`
  - **Descripción:** Modificar el componente raíz `RootComponent` evaluando `useLocation().pathname`. Si la ruta comienza con `/admin`, renderiza directamente `<Outlet />` conservando el contexto `:root` claro; en cualquier otra ruta pública, envuelve el contenido dentro de `<PublicLayoutWrapper>`.
  - **Cobertura:** RF-01, RF-12, CL-05, Principio 4 de la Constitución
  - **Hecho cuando:** Al navegar a `/` o `/catalogo` el elemento contenedor posea la clase `dark`, y al acceder a `/admin` o `/admin/login` la clase `dark` esté ausente y los fondos claros nativos de administración permanezcan inalterados.

- [x] **Tarea 1.4: Definir constantes y utilidades de apilamiento Z-Index Maestro**
  - **Archivos:** `src/styles.css` (o `src/config/site-config.ts`)
  - **Descripción:** Formalizar y registrar las clases y constantes utilitarias para los 6 niveles de elevación estricta: `z-50` (Navbar), `z-40` (Drawers/Modales), `z-35` (MobileFilterTrigger), `z-30` (WhatsApp/Banners flotantes), `z-20` (Sticky sidebars/consolas) y `z-10` (Tarjetas/Bento interactivos).
  - **Cobertura:** RF-10, RNF-04, CL-04
  - **Hecho cuando:** Todas las clases de apilamiento estén declaradas y accesibles en la configuración global sin valores ad-hoc no estandarizados.

---

## Fase 2: Refactorización de Componentes Base (Botones Ghost, Skeletons y Ficha Técnica)

- [x] **Tarea 2.1: Actualizar variantes de botón con estética industrial en `src/components/ui/button.tsx`**
  - **Archivos:** `src/components/ui/button.tsx`
  - **Descripción:** Refactorizar `buttonVariants` para incorporar:
    - Variante `ghost`: fondo transparente, borde hairline `border-white/10`, transición de 300ms *ease-out*, elevación de luminosidad en `:hover` y `:focus-visible` (`bg-white/5 border-white/25 text-white`).
    - Variante `whatsapp`: fondo esmeralda calibrado (`oklch(0.55 0.16 160)`), texto blanco puro (`#FFFFFF`), micro-transición `active:scale-[0.98]` y sombra técnica profunda sin halos fosforescentes.
  - **Cobertura:** RF-01, RF-05, RF-08, RNF-01
  - **Hecho cuando:** El componente `Button` admita las variantes actualizadas y supere pruebas de contraste visual con ratio > 7:1 en `variant="whatsapp"`.

- [x] **Tarea 2.2: Reconstruir `ProductGridSkeleton.tsx` con hairlines y geometría idéntica (CLS = 0)**
  - **Archivos:** `src/components/catalog/ProductGridSkeleton.tsx`
  - **Descripción:** Rediseñar la grilla de esqueletos de carga para que cada tarjeta ficticia reproduzca con precisión matemática la geometría final: contenedor con bordes hairlines de 1px sobre `bg-card`, imagen en proporción fija `16/10`, badges superiores, título de dos líneas, cuadrícula de datos duros y bloque de acciones empujado al fondo (`mt-auto`).
  - **Cobertura:** RF-08, RF-11, RNF-02, Principio 6 de la Constitución
  - **Hecho cuando:** La carga del esqueleto en `/catalogo` mantenga una métrica de desplazamiento de diseño acumulado `CLS === 0` al transicionar a los productos reales renderizados.

- [x] **Tarea 2.3: Rediseñar `ProductCard.tsx` bajo el patrón "Ficha Técnica Pura" con Flexbox `mt-auto`**
  - **Archivos:** `src/components/catalog/ProductCard.tsx`
  - **Descripción:** Reestructurar la tarjeta de repuesto con contenedor vertical flexible (`flex flex-col h-full rounded-lg border border-border/80 bg-card`):
    - Cabecera con imagen `aspect-[16/10]` y borde inferior hairline.
    - Badges de marca y condición técnica ("NUEVO" con borde continuo sólido; "REACONDICIONADO" con borde punteado técnico).
    - Título con `line-clamp-2` y `font-semibold text-sm`.
    - Cuadrícula de datos técnicos con código OEM principal y estado de stock.
    - Bloque de precio y botones de acción (carrito y WhatsApp) fijados en la base mediante `mt-auto`, garantizando alineación horizontal uniforme en toda la fila de la grilla.
  - **Cobertura:** RF-08, CL-01, CL-02
  - **Hecho cuando:** Las tarjetas del catálogo mantengan la base de botones perfectamente alineada en pantalla sin importar que los títulos varíen entre 1 y 2 líneas de texto.

- [x] **Tarea 2.4: Integrar esquema vectorial técnico para imágenes faltantes en `ProductImageWithFallback.tsx`**
  - **Archivos:** `src/components/catalog/ProductImageWithFallback.tsx`
  - **Descripción:** Modificar el fallback de imagen para que, ante fallas de carga o productos sin fotografía en base de datos, renderice un diagrama vectorial técnico estilizado de un inyector diésel en trazo fino monocrómico sobre fondo mineral, con la etiqueta monoespaciada `"ESQUEMA TÉCNICO REGISTRADO"` (erradicando imágenes de stock genéricas).
  - **Cobertura:** RF-11, Principio 6 de la Constitución
  - **Hecho cuando:** Un producto con `imageUrl: null` o ruta inválida renderice el esquema vectorial sobrio sin arrojar advertencias de imagen rota en consola.

---

## Fase 3: Estructuras Complejas (Bento Grid en Landing, Hero Edge-to-Edge y Filtros Móviles)

- [x] **Tarea 3.1: Implementar Bento Grid técnico determinista en `ServicesSection.tsx`**
  - **Archivos:** `src/components/landing/ServicesSection.tsx`
  - **Descripción:** Reemplazar la grilla de iconos por la matriz Bento Grid industrial:
    - Desktop (≥ 1024px): 3 columnas con `gap-6` y celdas asimétricas (Módulo 1 de Banco de Pruebas en `col-span-2 row-span-2`; Módulo 2 de Inyectores en `col-span-1 row-span-1`; Módulo 3 de Bombas en `col-span-1 row-span-1`; Módulo 4 de Sistemas Pesados en `col-span-3 row-span-1`).
    - Móvil (< 1024px): Columna única vertical continua (`grid-cols-1`) con `gap-4`.
    - Datos duros prominentes (2500 bar, micrones, IMA/C2i/C3i, estanqueidad) y fondos fotográficos auténticos con viñetas periféricas.
  - **Cobertura:** RF-04, RNF-01, RNF-02
  - **Hecho cuando:** La sección de servicios renderice la distribución asimétrica en pantallas de escritorio y colapse a una columna ordenada en móviles sin desbordamiento horizontal.

- [x] **Tarea 3.2: Reestructurar `HeroSection.tsx` con Inmersión Edge-to-Edge y Contraste Localizado WCAG**
  - **Archivos:** `src/components/landing/HeroSection.tsx`
  - **Descripción:** Ajustar el Hero para que `taller-hero.webp` ocupe el 100% del contenedor sin veladuras generales en el 75% superior. Aplicar gradiente oscuro localizado (`bg-gradient-to-t from-black/90 via-black/60 to-transparent`) estrictamente acotado detrás del bloque tipográfico inferior y sombras de texto multicapa (`text-shadow`) para asegurar ratios de contraste > 7:1 en títulos y > 4.5:1 en párrafos.
  - **Cobertura:** RF-03, RNF-01, CL-04
  - **Hecho cuando:** La fotografía real del taller se visualice nítida y luminosa en la parte superior del Hero y los textos superpuestos superen las pruebas de contraste WCAG AAA/AA.

- [x] **Tarea 3.3: Blindar `BrandsMarquee.tsx` con opacidad estática al 70% en pantallas táctiles y accesibilidad**
  - **Archivos:** `src/components/landing/BrandsMarquee.tsx`
  - **Descripción:** Actualizar la marquesina de marcas:
    - En escritorio con mouse: opacidad pasiva al 45% y desaturación completa, activando 100% de luminosidad en 300ms *ease-out* ante `:hover` o `:focus-visible`.
    - En dispositivos táctiles (detectados mediante `@media (hover: none)`): fijar la opacidad en 70% estático constante, eliminando transiciones pegadas al tocar la pantalla y garantizando contraste bajo luz solar.
    - Asignar `tabindex={0}`, `role="img"` y `aria-label="Fabricante homologado: {nombre}"` a cada logotipo.
  - **Cobertura:** RF-05, RNF-04, CL-05
  - **Hecho cuando:** La marquesina sea navegable por teclado iluminando el nodo enfocado, y en emulación móvil los logos permanezcan visibles al 70% sin estados de hover bloqueados.

- [x] **Tarea 3.4: Adaptar secciones de Garantía y Ubicación a la estética Edge-to-Edge**
  - **Archivos:** `src/components/landing/WarrantySection.tsx`, `src/components/landing/LocationSection.tsx`
  - **Descripción:** Ajustar los contenedores multimedia de video/fotografía de banco de pruebas en `WarrantySection` y fachada con numeración 1215 en `LocationSection` para que adopten la geometría de hairlines de 1px, relación de aspecto fija `16/9`, y fichas de datos técnicos compactas en lugar de bloques extensos de texto.
  - **Cobertura:** RF-06
  - **Hecho cuando:** Ambas secciones exhiban sus fotografías y videos reales integrados de borde a borde con marcos reflectivos de 1px y tipografía monoespaciada para las especificaciones.

- [x] **Tarea 3.5: Crear consola sticky con scroll interno en `CatalogFilters.tsx` y botón móvil en `catalogo.tsx`**
  - **Archivos:** `src/components/catalog/CatalogFilters.tsx`, `src/components/catalog/FilterDrawer.tsx`, `src/routes/catalogo.tsx`
  - **Descripción:**
    - En escritorio: fijar la consola de filtros con `sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto` y scrollbar estilizado para pantallas de laptops.
    - En móvil: crear el componente `FilterDrawer` en nivel `z-40` (`max-w-[340px]`) y el disparador flotante `MobileFilterTrigger` en nivel `z-35` fijado en la parte inferior de la pantalla con micro-insignia numérica de filtros activos.
  - **Cobertura:** RF-07, RF-10, CL-04
  - **Hecho cuando:** En pantallas de 1366x768 la consola de filtros de escritorio permita scroll interno completo sin cortar botones, y en móvil el botón `z-35` abra el drawer lateral sin colisionar con el botón de WhatsApp flotante.

---

## Fase 4: Lógica UI, Carrito Mixto y Casos Límite

- [x] **Tarea 4.1: Implementar lógica de cálculo dinámico para carrito mixto en `CartDrawer.tsx`**
  - **Archivos:** `src/components/catalog/CartDrawer.tsx`
  - **Descripción:** Actualizar el cálculo del subtotal en el cajón de cotizaciones:
    - Sumar matemáticamente de forma estricta los productos que posean precio publicado y válido.
    - Si conviven productos con precio y productos "A COTIZAR", mostrar en el pie del drawer la leyenda: `$ {SUBTOTAL} + ÍTEMS A COTIZAR`.
    - Si todos los productos carecen de precio publicado, mostrar `"PRESUPUESTO A CONFIRMAR"`.
    - Desglosar en el mensaje estructurado de WhatsApp los montos numéricos individuales y la etiqueta `[A Cotizar]` para los ítems sin precio.
  - **Cobertura:** RF-09, CL-03, Principio 5 de la Constitución
  - **Hecho cuando:** Al agregar un producto con precio y un producto a cotizar, el pie del drawer renderice la suma parcial más el texto explícito `+ ÍTEMS A COTIZAR` y el enlace de WhatsApp contenga la etiqueta `[A Cotizar]`.

- [x] **Tarea 4.2: Implementar manejo de múltiples códigos OEM (`+{N} ALTERNATIVOS`) en tarjetas y detalle**
  - **Archivos:** `src/components/catalog/ProductCard.tsx`, `src/routes/catalogo.$productId.tsx`
  - **Descripción:** Identificar el código OEM primario del fabricante de inyección para mostrarlo en la ficha técnica. Si el repuesto posee equivalencias adicionales, montar un badge técnico interactivo `+{N} ALTERNATIVOS` con tooltip nativo accesible que enumere los códigos restantes. Si carece de OEM, exhibir el guion neutro `"—"`.
  - **Cobertura:** RF-08, CL-02
  - **Hecho cuando:** Un producto con 3 códigos OEM muestre el principal y el badge `+2 ALTERNATIVOS`, y un producto sin código exhiba `"—"` sin desalinear la grilla.

- [x] **Tarea 4.3: Armonizar jerarquía de capas Z-Index y coordenadas de `FloatingWhatsApp.tsx`**
  - **Archivos:** `src/components/landing/FloatingWhatsApp.tsx`, `src/components/policies/PoliciesBanner.tsx`
  - **Descripción:** Asignar `z-30` a `FloatingWhatsApp` y al banner de políticas comerciales. Asegurar que en dispositivos móviles el botón de WhatsApp respete la posición lateral sin superponerse ni bloquear el botón de filtros `MobileFilterTrigger` (`z-35`).
  - **Cobertura:** RF-10, CL-04
  - **Hecho cuando:** En vista móvil de `/catalogo`, el botón de WhatsApp flotante (`z-30`) y el botón central de filtros (`z-35`) coexistan en pantalla permitiendo la interacción táctil independiente en ambos sin bloqueos de puntero.

- [x] **Tarea 4.4: Crear suite de pruebas unitarias para totales de carrito en `test/catalog-cart-totals.test.ts`**
  - **Archivos:** `src/test/catalog/catalog-cart-totals.test.ts`
  - **Descripción:** Crear tests automatizados con Vitest que validen:
    - Cálculo de total exclusivamente con productos con precio.
    - Cálculo de total exclusivamente con productos "A COTIZAR".
    - Cálculo mixto de total parcial más leyenda `+ ÍTEMS A COTIZAR`.
    - Formateo correcto del mensaje de salida para WhatsApp.
  - **Cobertura:** RF-09, RNF-04, Principio 1 de la Constitución
  - **Hecho cuando:** `npm run test` (o `npx vitest run src/test/catalog/catalog-cart-totals.test.ts`) se ejecute con 100% de aserciones pasando en verde.

- [x] **Tarea 4.5: Auditoría final de tipado, accesibilidad y prevención de FOUC**
  - **Archivos:** Toda la aplicación modificada
  - **Descripción:** Ejecutar validación estática completa del proyecto:
    - Compilación de TypeScript (`npm run typecheck` o `npx tsc --noEmit`).
    - Linter del proyecto (`npm run lint` si aplica).
    - Verificación manual en navegador de ausencia de destellos blancos en transiciones entre Landing, Catálogo y Administración.
  - **Cobertura:** RF-01, RF-12, RNF-01, RNF-02, RNF-03
  - **Hecho cuando:** `npx tsc --noEmit` termine con código de salida 0, sin errores ni advertencias de tipos, y la navegación entre rutas públicas y `/admin` conserve el aislamiento de temas sin parpadeos.
