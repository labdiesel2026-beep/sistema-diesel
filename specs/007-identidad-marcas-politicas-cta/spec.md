# Especificación — Spec 007: Identidad Fotográfica Real, Carrusel de Marcas, Políticas Comerciales y Rediseño de CTAs

**Fase:** 007-identidad-marcas-politicas-cta  
**Versión:** 1.1 (Revisada y Blindada tras Auditoría QA & AppSec)  
**Fecha:** 2026-10-21  
**Basado en:** [docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md), [docs/SRS.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/SRS.md), [AGENTS.MD](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/AGENTS.MD), [Spec 002](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/002-landing-page/spec.md), [Spec 003](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/003-catalogo/spec.md), [Spec 006](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/006-carrusel-destacados/spec.md) y [src/styles.css](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/src/styles.css)  
**Estado:** Especificación Técnica Blindada Lista para Planificación  

---

## 1. Contexto y Objetivo

### 1.1 Contexto Actual
Laboratorio Diésel cuenta con una plataforma web estructurada con TanStack Start, Tailwind CSS v4, animaciones con Framer Motion y un catálogo comercial conectado a PostgreSQL mediante Express y Prisma. 

No obstante, la experiencia pública actual presenta cinco áreas de oportunidad críticas identificadas tras auditoría visual, técnica y de negocio:
1. **Activos Genéricos vs. Infraestructura Real:** Se utilizan imágenes de stock genéricas (ej. `diesel-injector.jpg` en el Hero) que no transmiten la escala, infraestructura técnica ni el instrumental de precisión real disponible en el taller de Villa Mercedes.
2. **Presentación de Servicios Subdimensionada:** La sección de servicios exhibe una grilla elemental basada únicamente en íconos SVG simples y descripciones breves, sin reflejar la capacidad de vanguardia del laboratorio (bancos de prueba computarizados, bombas rotativas/lineales, inyectores inductivos, piezoeléctricos, sistemas UPS/PLD y UIS).
3. **Falta de Reconocimiento de Marcas Especializadas:** El taller interviene componentes de marcas líderes a nivel mundial (Bosch, Delphi, Denso, Caterpillar, Cummins, etc.), pero la Landing Page carece de un espacio unificado de exhibición de fabricantes que valide su autoridad técnica.
4. **Vigencia y Alcance Comercial Ambigua:** El modelo de negocio se basa en solicitudes de cotización técnica y no en transacciones automáticas con pasarela de pagos. Los visitantes necesitan claridad inmediata sobre la vigencia de los precios orientativos, los términos de garantía de laboratorio, la procedencia de repuestos (originales vs. alternativos) y el protocolo de envíos/recepción con comisionistas.
5. **Déficit Estético en Botones CTA de WhatsApp del Catálogo:** Los botones de contacto en tarjetas, ficha técnica, carrito y estado sin resultados utilizan una tonalidad verde lima fosforescente con texto oscuro de bajo contraste (`--whatsapp`), carente de la jerarquía técnica, elegancia y contraste accesible (WCAG AAA) exigidos por el estándar del proyecto.

### 1.2 Objetivo
Definir con exhaustividad técnica, arquitectónica y de diseño los 5 pilares de modernización del escaparate público:
1. **Reemplazo Integral por Fotografía y Video Real:** Integrar los archivos reales capturados en el taller (`taller-hero.webp`, `banco-en-vivo.mp4`, `inyectores-detalle.webp`, `fachada-local.webp`) en el Hero, la sección de Garantía y la sección de Ubicación.
2. **Rediseño Fotográfico e Industrial de Servicios en Bento Grid:** Estructurar un Bento Grid técnico con fotografías reales (`taller-hero.webp`, `banco-pruebas.webp`, `diagnostico-electronico.webp`, `inyectores-detalle.webp`), micro-interacciones de hover, badges de calibración y detalle pormenorizado de la capacidad operativa multimarca.
3. **Carrusel Infinito de Marcas Trabajadas (`BrandsMarquee.tsx`):** Diseñar e implementar un componente de marquesina infinita horizontal con bordes en degradé difuminado, pausa interactiva por hover/touch no bloqueante, soporte para movimiento reducido y logotipos vectoriales limpios de las 10 marcas clave del taller, junto al subtítulo de marcas originales y alternativas.
4. **Sistema Integral de Políticas Comerciales y de Garantía:** Redactar y desplegar los 4 ejes normativos del taller mediante un banner flotante tipo panel inferior izquierdo (*dock card*) con validación de consentimiento Zod en `localStorage` resistente a desajustes de hidratación SSR, complementado con un enlace permanente en el footer y un modal dialog accesible con foco atrapado.
5. **Rediseño Premium de Botones CTA de Consulta en Catálogo:** Recalibrar los tokens semánticos oficiales OKLCH de WhatsApp en `src/styles.css` a verde esmeralda industrial profundo (`oklch(0.55 0.16 160)`) con texto blanco puro (`#FFFFFF`) con contraste WCAG AAA e ícono oficial optimizado en `ProductCard`, `catalogo.$productId`, `CartDrawer` y el estado sin resultados de `catalogo`.

### 1.3 Relación con el SRS y Especificaciones Previas
- **SRS Requisitos 5.1.1, 5.1.2, 5.1.3, 5.1.4:** Presentación del taller en tonos azules institucionales, mapa físico, políticas comerciales y canal directo de garantías por WhatsApp.
- **SRS Requisitos 5.2.4, 5.2.5, 5.3.4:** Claridad sobre precios de referencia / a cotizar y canalización de consultas a WhatsApp sin venta transaccional directa.
- **Spec 002 (Landing Page):** Extensión y mejora visual de `HeroSection.tsx`, `ServicesSection.tsx`, `WarrantySection.tsx`, `LocationSection.tsx` y `LandingFooter.tsx`.
- **Spec 003 (Catálogo):** Armonización de los puntos de contacto comercial en `ProductCard.tsx`, `catalogo.$productId.tsx`, `CartDrawer.tsx` y `catalogo.tsx`.
- **Spec 006 (Carrusel Destacados):** Coexistencia armónica en la Landing Page entre el carrusel dinámico de repuestos destacados y el nuevo carrusel infinito de marcas especializadas.

### 1.4 Cumplimiento de la Constitución del Proyecto (`docs/constitution.md`)
- **Principio 1 (SDD-First):** Esta especificación formaliza cada detalle de diseño, interacción, accesibilidad, layouts CSS explícitos y persistencia antes de tocar una sola línea de código en `src/`.
- **Principio 2 (Fail-Fast Zod):** El almacenamiento del consentimiento de políticas en `localStorage` se valida estrictamente en frontera con un esquema Zod (`PoliciesConsentSchema`), purgando de inmediato cualquier dato corrupto o manipulado.
- **Principio 3 (Upload Paranoico y Optimización de Medios):** Todos los activos brutos (`.HEIC`, `.jpeg`) se procesan offline y se convierten a `.webp` optimizado (calidad 85%, ≤ 350 KB, sin metadata EXIF) antes de su incorporación a la aplicación.
- **Principio 5 (Persistencia como fuente de verdad):** La aceptación de políticas comerciales por parte del usuario se gestiona en el cliente mediante una bandera de consentimiento versionada en `localStorage` (`ld_policies_consent_v1`), manteniendo la base de datos PostgreSQL como única fuente autoritativa para el inventario de repuestos y taxonomías.
- **Principio 6 (Errores Opacos y Resiliencia en Frontera):** Cualquier degradación de medios (fallo de carga de video, imágenes o almacenamiento local) degrada de forma silenciosa e imperceptible para el usuario, sin exponer fallos técnicos ni interrumpir la navegación.

---

## 2. Usuarios y Roles

| Rol | Descripción | Interacción con la Funcionalidad |
| :--- | :--- | :--- |
| **Cliente Potencial / Particular** | Conductor o dueño de vehículo liviano buscando solución a fallas de inyección. | Aprecia la infraestructura física real del taller, lee el banner de políticas, comprende que las cotizaciones son a medida y consulta por WhatsApp con un botón legible y confiable. |
| **Mecánico de Taller / Bombista** | Profesional del rubro automotor que requiere diagnóstico o calibración en banco. | Identifica en el Bento Grid la capacidad para inyectores inductivos, piezoeléctricos, bombas lineales/rotativas, y reconoce las marcas trabajadas en el marquee. |
| **Transportista / Empresa de Flota** | Operador de camiones, utilitarios o maquinaria pesada/agrícola del interior del país. | Valida la ubicación física exacta mediante la fachada real, consulta las políticas de envío por comisionista y coordina la recepción de lotes de inyectores. |
| **Administrador del Taller** | Propietario de Laboratorio Diésel. | Se beneficia de clientes mejor informados sobre la validez de cotizaciones y requisitos de garantía, reduciendo reclamos indebidos y consultas ambiguas en WhatsApp. |

---

## 3. Historias de Usuario

- **HU-01:** Como visitante del sitio web, quiero ver imágenes y videos reales del equipamiento del taller en lugar de fotos genéricas de stock, para comprobar que se trata de un laboratorio físico establecido con instrumental computarizado real.
- **HU-02:** Como cliente que viaja al taller en Villa Mercedes, quiero ver la fotografía real de la fachada del local con su numeración (1215) para reconocer el edificio rápidamente al llegar por la avenida.
- **HU-03:** Como mecánico o transportista, quiero conocer en detalle la cobertura técnica del laboratorio (bombas lineales, rotativas, Common Rail inductivos, piezoeléctricos, sistemas UPS/UIS y marcas trabajadas) mediante una grilla visual enriquecida para confirmar si pueden procesar mis componentes específicos.
- **HU-04:** Como usuario que explora la Landing Page, quiero ver un carrusel fluido con los logotipos de las marcas mundiales que atiende el taller, con opción de pausarlo al pasar el mouse o tocar la pantalla sin trabar el desplazamiento vertical, para verificar la especialización de la firma.
- **HU-05:** Como comprador en línea, quiero ser notificado de manera transparente sobre el alcance de las cotizaciones y las condiciones de garantía mediante un panel no invasivo y un modal completo, pudiendo aceptar los términos sin bloqueos molestos de pantalla ni colisiones con los botones flotantes de contacto.
- **HU-06:** Como cliente que consulta repuestos en el catálogo o carrito, quiero interactuar con botones de WhatsApp de diseño industrial refinado en verde esmeralda profundo, tipografía nítida en blanco y contraste accesible AAA, para sentir confianza y comodidad visual al solicitar presupuestos.

---

## 4. Requisitos Funcionales (Notación EARS Estricta)

### 4.1 Pilar 1: Reemplazo de Activos Genéricos por Fotografía y Video Real del Taller

#### RF-01.1: Fotografía Real en Sección Hero (`HeroSection.tsx`)
- **Cuando** el visitante acceda a la Landing Page en la ruta `/`, **el sistema deberá** cargar como fondo de la sección Hero la fotografía real del taller `src/assets/workshop/taller-hero.webp` optimizada para la web.
- **Mientras** la fotografía del Hero se visualice en pantalla, **el sistema deberá** aplicar un marco técnico industrial compuesto por un borde perimetral sutil (`border-blue-500/20`), un gradiente superpuesto multidireccional (`bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-900/70`) que garantice una relación de contraste no inferior a 7:1 para todos los textos legibles, y una micro-animación de zoom ultralento continuo (`scale: 1` a `scale: 1.05` en bucle oscilante suave de exactamente 12 segundos con easing `easeInOut`).
- **Cuando** la interfaz se renderice en pantallas móviles de ancho inferior a 768px, **el sistema deberá** fijar la posición focal de la imagen exactamente en `object-position: center 35%` y establecer su opacidad en `opacity: 0.30` con overlay reforzado (`from-slate-950 via-slate-900/90 to-slate-900/80`), preservando la legibilidad del título y los botones de acción sin sobrecargar la pantalla táctil.

#### RF-01.2: Video Real de Instrumental y Banco en Garantía (`WarrantySection.tsx`)
- **Cuando** el usuario navegue hacia la sección `#garantias`, **el sistema deberá** renderizar la sección estructurada en dos columnas en desktop (`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`):
  1. **Columna Informativa (7 columnas en desktop):** Título, resumen institucional, lista de detalles de garantía con íconos de verificación y botón de soporte vía WhatsApp.
  2. **Columna Multimedia (5 columnas en desktop):** Contenedor industrial con bordes redondeados (`rounded-2xl border border-blue-500/20 bg-slate-950 overflow-hidden shadow-xl aspect-video lg:aspect-[4/3]`) que contenga el reproductor de video HTML5 en bucle con el archivo real `src/assets/workshop/banco-en-vivo.mp4`.
- **Mientras** el video se encuentre montado en el DOM, **el sistema deberá** forzar los atributos `muted`, `autoPlay`, `loop`, `playsInline`, `preload="metadata"` y el atributo `poster="src/assets/workshop/inyectores-detalle.webp"`, erradicando por completo cualquier parpadeo de pantalla negra antes del inicio de la reproducción.
- **Si** el navegador tiene activada la directiva `prefers-reduced-data`, la cabecera `Save-Data: on`, una conexión de red estimada lenta (`navigator.connection.effectiveType === '2g' | 'slow-2g'`) o si el reproductor detecta bloqueo de autoplay por ahorro de batería, **el sistema deberá** anular la reproducción del video y renderizar de forma nativa la fotografía de alta resolución `src/assets/workshop/inyectores-detalle.webp` con una insignia superpuesta *"Banco de Precisión Common Rail"*.

#### RF-01.3: Fotografía Real de Fachada en Sección Ubicación (`LocationSection.tsx`)
- **Cuando** el visitante acceda a la sección `#ubicacion`, **el sistema deberá** reestructurar la grilla de contenido en dos bloques equilibrados (`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch`):
  1. **Bloque de Reconocimiento Físico y Datos (5 columnas en desktop):**
     - Fotografía real de la fachada del local `src/assets/workshop/fachada-local.webp` en relación de aspecto `16/9` con esquinas redondeadas (`rounded-xl`), borde perimetral reflectivo (`border border-blue-500/20`), e insignia técnica flotante: *"Local a la Calle · Pres. Perón 1215"*.
     - Bloque contiguo inferior con los datos estructurados de dirección física, horarios de atención de lunes a viernes y botón de acción *"Cómo llegar en Google Maps"*.
  2. **Bloque de Navegación Cartográfica (7 columnas en desktop):** Iframe interactivo de Google Maps embebido con altura adaptada (`min-h-[420px] rounded-2xl border border-slate-200/80 dark:border-slate-800`).
- **Mientras** la fotografía de la fachada se visualice en pantalla, **el sistema deberá** asegurar que la numeración oficial 1215 sobre la fachada sea visible y nítida para facilitar la identificación visual inmediata por parte de conductores y clientes que arriban al taller.

---

### 4.2 Pilar 2: Rediseño Técnico y Fotográfico de la Sección de Servicios (`ServicesSection.tsx`)

#### RF-02.1: Estructura Explícita en Bento Grid Industrial
- **Cuando** el visitante visualice la sección `#servicios`, **el sistema deberá** reemplazar las tarjetas genéricas de íconos por un Bento Grid técnico industrial responsivo organizado con la siguiente plantilla CSS explícita:
  - **En desktop (`lg:grid-cols-12 gap-6`):**
    - **Tarjeta 1 (Principal - Banco de Pruebas):** Ocupa 7 columnas (`lg:col-span-7 min-h-[420px]`).
    - **Tarjeta 2 (Bombas Inyectoras):** Ocupa 5 columnas (`lg:col-span-5 min-h-[420px]`).
    - **Tarjeta 3 (Inyectores Common Rail):** Ocupa 6 columnas (`lg:col-span-6 min-h-[340px]`).
    - **Tarjeta 4 (Diagnóstico y Repuestos):** Ocupa 6 columnas (`lg:col-span-6 min-h-[340px]`).
  - **En tablet (`md:grid-cols-2 gap-6`):** Tarjeta 1 ocupa 2 columnas (`col-span-2`), Tarjetas 2 y 3 ocupan 1 columna cada una, y Tarjeta 4 ocupa 2 columnas (`col-span-2`).
  - **En móvil (`grid-cols-1 gap-5`):** Todas las tarjetas se apilan en columna única con altura mínima de `280px`.

#### RF-02.2: Contenido Técnico y Copys Definitivos de las Tarjetas
- **Mientras** se renderice el Bento Grid, **el sistema deberá** alimentar las tarjetas con los siguientes datos técnicos centralizados en `SITE_CONFIG.services`:
  1. **Tarjeta 1 (Principal):**
     - **Título:** *"Banco de Pruebas y Calibración Computarizada"*
     - **Descripción:** *"Ensayo dinámico y calibración milimétrica de caudal, retorno y curvas de presión bajo especificaciones estrictas de fabricante para bombas e inyectores diésel."*
     - **Imagen de fondo:** `banco-pruebas.webp` con overlay gradual de contraste.
     - **Badges técnicos:** `[Banco de Pruebas Computarizado]`, `[Calibración Milimétrica]`, `[Tolerancia OEM]`
  2. **Tarjeta 2:**
     - **Título:** *"Servicio Integral de Bombas Inyectoras"*
     - **Descripción:** *"Diagnóstico, desarme y ajuste de bombas electrónicas, bombas lineales y bombas rotativas multimarca para utilitarios, transporte pesado y maquinaria agrícola."*
     - **Imagen de fondo:** `taller-hero.webp` con overlay de contraste.
     - **Badges técnicos:** `[Bombas Lineales y Rotativas]`, `[Línea Pesada y Agrícola]`
  3. **Tarjeta 3:**
     - **Título:** *"Inyectores Electrónicos Common Rail"*
     - **Descripción:** *"Equipamiento y fuentes electrónicas de precisión para testear, reparar y calibrar inyectores inductivos, piezoeléctricos, bombeantes (UPS/PLD) e inyectores bomba (UIS)."*
     - **Imagen de fondo:** `inyectores-detalle.webp` con overlay de contraste.
     - **Badges técnicos:** `[Inductivos & Piezoeléctricos]`, `[Sistemas UPS / PLD]`, `[Sistemas UIS]`
  4. **Tarjeta 4:**
     - **Título:** *"Diagnóstico Electrónico y Provisión de Repuestos"*
     - **Descripción:** *"Escaneo en tiempo real de circuitos de combustible diésel y disponibilidad permanente de toberas, válvulas y conjuntos de recambio originales y alternativos seleccionados."*
     - **Imagen de fondo:** `diagnostico-electronico.webp` con overlay de contraste.
     - **Badges técnicos:** `[Diagnóstico en Tiempo Real]`, `[Originales & Alternativos]`

#### RF-02.3: Micro-interacciones de Hover y Cláusula de Transparencia
- **Cuando** el usuario pase el cursor o sitúe el foco sobre cualquiera de las tarjetas de servicio, **el sistema deberá** aplicar una elevación suave (`-translate-y-1.5`), un resplandor perimetral sutil (`ring-1 ring-blue-500/40`), y un zoom contenido de la fotografía de fondo (`scale-105` con duración de 400ms y curva `ease-out`).
- **Cuando** el usuario explore la sección de servicios, **el sistema deberá** exhibir un banner o pie de sección con la leyenda explícita: *"Trabajamos con repuestos legítimos de primer equipo (OEM) y líneas alternativas homologadas de máxima durabilidad, adecuándonos a la exigencia operativa de su vehículo o flota"*.

---

### 4.3 Pilar 3: Carrusel Infinito de Marcas Trabajadas (`BrandsMarquee.tsx`)

#### RF-03.1: Ubicación en el Flujo de la Página y Animación Continua
- **Cuando** se ensamble la Landing Page en la ruta `/`, **el sistema deberá** montar el componente `BrandsMarquee.tsx` estratégicamente **después de `FeaturedProductsCarousel` y antes de `ServicesSection`**, logrando una transición narrativa fluida: exhibición de repuestos destacados de catálogo, seguida del aval de marcas mundiales atendidas, dando paso a los servicios técnicos que se aplican sobre dichas marcas.
- **Mientras** no se reciba interacción del usuario, **el sistema deberá** desplazar horizontalmente los logotipos de izquierda a derecha mediante una animación CSS continua e infinita:
  - **Duración del ciclo completo:** Exactamente `35s` en pantallas desktop (≥ 768px) y `25s` en pantallas móviles (< 768px) con curva `linear infinite`.
  - **Técnica de continuidad:** El componente duplicará en el DOM el conjunto de las 10 marcas (`[...BRANDS, ...BRANDS]`, totalizando 20 nodos), aplicando traslación `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }` para garantizar un bucle imperceptible sin saltos.

#### RF-03.2: Exhibición de las 10 Marcas Oficiales Especializadas
- **Cuando** se ejecute la marquesina, **el sistema deberá** presentar exclusivamente los logotipos vectoriales limpios y homogéneos de las siguientes diez (10) marcas exactas:
  1. **Bosch (Bosch Diesel Service)**
  2. **Zexel**
  3. **Denso**
  4. **Siemens VDO**
  5. **Delphi**
  6. **Caterpillar**
  7. **Cummins**
  8. **Stanadyne**
  9. **Diesel Kiki**
  10. **Perkins**
- **Mientras** los logotipos transiten por la pantalla, **el sistema deberá** renderizarlos mediante componentes SVG integrados o assets estáticos vectoriales monocromáticos (`text-slate-400 dark:text-slate-500`), que al recibir el cursor (`hover`) transicionen a blanco puro o color institucional con brillo sutil (`text-slate-100 drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]`).

#### RF-03.3: Degradé Difuminado en Bordes y Manejo Táctil No Invasivo
- **Mientras** el carrusel se visualice en pantalla, **el sistema deberá** proyectar máscaras de gradiente difuminado lateral (*fade-out gradient*) de al menos 64px de ancho en los extremos izquierdo y derecho (`mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent)`).
- **Cuando** la interacción ocurra en pantallas táctiles, **el sistema deberá** aplicar `touch-action: pan-y` para no entorpecer ni bloquear el desplazamiento vertical de la página. La animación se pausará temporalmente únicamente si el usuario mantiene un toque estático prolongado (> 250ms sin desplazamiento vertical); al soltar el contacto (`touchend` o `touchcancel`), la animación se reanudará suavemente tras un tiempo de gracia de `1.5 segundos`.
- **Cuando** la interacción ocurra en computadoras de escritorio mediante mouse, **el sistema deberá** pausar la animación de inmediato durante el estado `:hover` (`animation-play-state: paused`).

---

### 4.4 Pilar 4: Sistema de Políticas Comerciales y de Garantía (Banner de Aceptación + Modal Accesible)

#### RF-04.1: Redacción Formal de los 4 Ejes Normativos del Laboratorio
El sistema deberá integrar de forma inmutable y centralizada en código los siguientes cuatro (4) ejes de políticas comerciales y de garantía:
1. **Eje 1: Alcance de Cotizaciones y Precios Publicados:**
   *Los precios exhibidos en el catálogo revisten carácter orientativo y referencial sujeto a variación cambiaria o de reposición de insumos. Toda consulta iniciada por WhatsApp o agregada al carrito representa una solicitud formal de presupuesto y asesoramiento técnico personalizado, no constituyendo en ningún caso una compra confirmada, reserva automática de stock físico ni obligación contractual exigible hasta tanto sea validada expresamente por el taller.*
2. **Eje 2: Garantía de Calibración y Laboratorio:**
   *Las reparaciones, calibraciones de caudal en banco computarizado e inyectores de recambio cuentan con garantía técnica de 30 días corridos sobre mano de obra y piezas reemplazadas. La validez de la garantía queda estrictamente sujeta a que el montaje en el vehículo sea ejecutado por personal idóneo, habiendo realizado la limpieza química completa del depósito y cañerías de combustible, drenaje del filtro de gasoil y sustitución de elementos filtrantes por nuevos bajo especificación original.*
3. **Eje 3: Repuestos Originales y Alternativos:**
   *Laboratorio Diésel mantiene una política de absoluta transparencia técnica. Se comercializan tanto repuestos legítimos de equipo original (OEM) de las principales marcas mundiales como líneas alternativas seleccionadas de probada confiabilidad. La procedencia, condición (nuevo o reacondicionado a nuevo) y garantía específica de cada pieza son notificadas de forma previa e inequívoca al cliente al emitir el presupuesto.*
4. **Eje 4: Recepción, Envíos y Comisionistas:**
   *Para clientes, transportistas y talleres mecánicos del interior de San Luis y provincias vecinas, se ofrece recepción y despacho diario de bombas e inyectores mediante comisionistas de confianza y empresas de encomienda habilitadas. Todo envío debe ser previamente coordinado por WhatsApp indicando datos de remitente y síntomas de falla.*

#### RF-04.2: Validación Zod Fail-Fast del Consentimiento en `localStorage`
- **Cuando** el cliente inicie la aplicación en cualquier ruta pública (`/`, `/catalogo`, `/catalogo/$productId`), **el sistema deberá** consultar la clave `ld_policies_consent_v1` en `localStorage` y validarla en frontera mediante el esquema Zod estricto:
  ```ts
  export const PoliciesConsentSchema = z.object({
    version: z.literal(1),
    accepted: z.boolean(),
    timestamp: z.number().positive(),
  }).strict();
  ```
- **Si** la clave no existe, o si `PoliciesConsentSchema.safeParse` devuelve error por datos corruptos o campos inválidos, **el sistema deberá** purgar inmediatamente el registro residual (`localStorage.removeItem('ld_policies_consent_v1')`), asumir estado de no aceptación (`accepted: false`) y activar el despliegue del banner flotante.
- **Si** la ruta actual pertenece al panel de administración (`/admin/*`) o a rutas internas de gestión, **el sistema deberá** omitir por completo la evaluación y el renderizado del banner de políticas.

#### RF-04.3: Banner Flotante Tipo Dock Card y Prevención de Colisión de Capas
- **Mientras** el consentimiento no haya sido otorgado (`accepted: false`), **el sistema deberá** renderizar el banner de políticas configurado como **tarjeta flotante tipo panel inferior izquierdo** (*dock card* / *toast*):
  - **Ubicación en desktop (`sm:left-6 sm:bottom-6 sm:max-w-md sm:right-auto`):** Se ancla en la esquina inferior izquierda con un ancho máximo de `420px`, dejando la esquina inferior derecha (`bottom-6 right-6`) 100% despejada para que el botón de WhatsApp (`FloatingWhatsApp`) o el botón del carrito (`floating-cart-button`) sigan totalmente visibles y clickeables.
  - **Ubicación en móvil (`inset-x-3 bottom-3`):** Se ancla con márgenes perimetrales de 12px; en la Landing Page, si el banner está desplegado, el botón flotante de WhatsApp se posiciona automáticamente con un desplazamiento superior seguro (`bottom-36`) para evitar toda superposición.
  - **Jerarquía de Capas (Z-Index):** El banner se sitúa en `z-45`. Los botones flotantes residen en `z-40`. El menú móvil, el Drawer del carrito (`CartDrawer`) y el modal dialog residen en `z-50`, asegurando que al abrir el carrito o el modal, sus backdrops oscuros cubran de forma natural el banner de políticas sin generar conflictos visuales.
  - **Animación de Entrada y Salida:** Aparece con un retardo (*delay*) de `1000ms` tras el montaje con animación de subida `slide-up` de `400ms` (`cubic-bezier(0.16, 1, 0.3, 1)`). Al pulsar *"Aceptar y Continuar"*, se oculta con transición de salida `fade-out` y `slide-down` de `300ms`.
- **Cuando** el usuario haga clic en *"Aceptar y Continuar"*, **el sistema deberá** escribir en `localStorage` el payload validado `{ version: 1, accepted: true, timestamp: Date.now() }` y desmontar el banner de forma reactiva en toda la aplicación.

#### RF-04.4: Enlace Permanente en Footer y Modal Dialog Accesible
- **Cuando** el visitante navegue al pie de página ([LandingFooter.tsx](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/src/components/landing/LandingFooter.tsx)), **el sistema deberá** exhibir un botón semántico accesible titulado: *"Políticas de Garantía y Cotización"*.
- **Cuando** el usuario accione dicho enlace del footer o presione el botón *"Ver Políticas Completas"* del banner flotante, **el sistema deberá** abrir un modal interactivo accesible (`Dialog` con Radix UI / shadcn en `z-50`).
- **Mientras** el modal de políticas permanezca abierto, **el sistema deberá**:
  1. Bloquear el scroll de fondo de la ventana principal (`overflow: hidden`).
  2. Atrapar el foco del teclado en su interior (*focus trap*).
  3. Permitir el cierre inmediato mediante la tecla `Escape`, clic en botón de cierre "X" o pulsando fuera del diálogo en el backdrop.
  4. Desplegar los cuatro (4) ejes normativos con formato estructurado de tarjetas técnicas dentro de un contenedor con scroll interno accesible (`max-h-[70vh] overflow-y-auto`).
  5. Si el usuario aún no aceptó las políticas, incluir en el pie del diálogo el botón de acción *"Aceptar y Continuar"*, el cual persiste el payload Zod en `localStorage`, oculta el banner flotante y cierra el modal en una única operación sincronizada.
  6. Si el usuario ya aceptó las políticas con anterioridad, mostrar en el pie del diálogo una insignia destacada: *"Políticas comerciales aceptadas previamente"*.

---

### 4.5 Pilar 5: Rediseño Premium de Botones CTA de Consulta por WhatsApp en el Catálogo

#### RF-05.1: Recalibración de Tokens OKLCH del Sistema de Diseño
- **Cuando** el sistema aplique estilos a la variante `variant="whatsapp"` en botones interactivos ([src/components/ui/button.tsx](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/src/components/ui/button.tsx)), **el sistema deberá** utilizar exclusivamente las variables semánticas oficiales recalibradas en [src/styles.css](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/src/styles.css):
  - **En `:root` (Modo Claro):**
    - `--whatsapp: oklch(0.55 0.16 160);` (Verde esmeralda industrial profundo)
    - `--whatsapp-foreground: oklch(0.99 0 0);` (Blanco puro `#FFFFFF`)
  - **En `.dark` (Modo Oscuro):**
    - `--whatsapp: oklch(0.52 0.17 160);` (Verde esmeralda técnico sólido)
    - `--whatsapp-foreground: oklch(0.99 0 0);` (Blanco puro `#FFFFFF`)
- **Mientras** se dibuje cualquier botón de WhatsApp, **el sistema deberá** garantizar una relación de contraste cromático superior a 7:1 entre el texto blanco y el fondo esmeralda (cumpliendo con la pauta WCAG 2.1 AAA), incorporando un borde reflectivo sutil (`ring-1 ring-emerald-400/20`), sombra técnica controlada y micro-animación en estado activo (`active:scale-[0.98]`).

#### RF-05.2: Rediseño del Botón en Tarjeta de Producto (`ProductCard.tsx`)
- **Cuando** se renderice la tarjeta de repuesto en la grilla del catálogo, **el sistema deberá** estilizar el botón secundario *"WhatsApp Directo"* con la variante `whatsapp` recalibrada, ícono oficial `FaWhatsapp` a 16px, tipografía `font-semibold text-xs tracking-wide uppercase` en blanco puro y elevación suave al posar el cursor (`hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25`).

#### RF-05.3: Rediseño del Botón en Ficha Técnica (`catalogo.$productId.tsx`)
- **Cuando** el visitante consulte la ficha detallada de una pieza, **el sistema deberá** sustituir el ícono genérico por el ícono oficial `FaWhatsapp` a 18px en el botón *"WhatsApp Directo"*, configurando una altura ergonómica (`h-12`), tipografía `font-semibold text-sm tracking-wide` en blanco puro y micro-interacción suave al foco y hover.

#### RF-05.4: Rediseño del Botón de Cierre en Carrito (`CartDrawer.tsx`)
- **Cuando** el usuario abra el panel lateral del carrito de compras, **el sistema deberá** renderizar el botón principal *"Consultar por WhatsApp"* con la variante `whatsapp` recalibrada, efecto de brillo continuo reflectivo sutil (*shimmer animation*), ícono oficial `FaWhatsapp` a 20px y tipografía `font-bold text-sm tracking-wide` en blanco puro `#FFFFFF`.

#### RF-05.5: Rediseño del Botón en Estado Sin Resultados (`catalogo.tsx`)
- **Cuando** la búsqueda o combinación de filtros activos no arroje coincidencias, **el sistema deberá** presentar el botón *"Consultar pieza por WhatsApp"* con la misma identidad esmeralda industrial, ícono oficial `FaWhatsapp` y tipografía blanca de alto contraste, canalizando la consulta contextualizada del repuesto buscado.

---

## 5. Requisitos No Funcionales

| ID | Categoría | Requisito No Funcional |
| :--- | :--- | :--- |
| **RNF-01** | **Identidad Visual y Jerarquía Técnica** | La interfaz deberá mantener consistencia absoluta con la paleta de azules institucionales del taller (`--hero`, `--primary`), complementada armónicamente con acabados de metalcepillado, bordes de 1px con opacidades controladas y la variante esmeralda industrial recalibrada en OKLCH, erradicando colores chillones o discordantes. |
| **RNF-02** | **Rendimiento Multimedia y Core Web Vitals** | Los activos fotográficos WebP deberán suministrarse con compresión de alta fidelidad (calidad 85%) con tamaño individual ≤ 350 KB. El video `banco-en-vivo.mp4` deberá incluir `poster` obligatorio y no penalizar el tiempo de carga interactivo (*Largest Contentful Paint - LCP* < 2.5s). |
| **RNF-03** | **Accesibilidad (WCAG 2.1 AA / AAA)** | El contraste entre el texto y el fondo de todos los botones rediseñados de WhatsApp deberá superar estrictamente el ratio de 7:1 (WCAG AAA). El modal de políticas deberá contar con atributos `aria-labelledby`, `aria-describedby`, control de foco atrapado (*focus trap*) y soporte para navegación completa por teclado. |
| **RNF-04** | **Soporte para Movimiento Reducido (`prefers-reduced-motion`)** | Si el usuario tiene habilitada la preferencia de reducción de movimiento en su sistema operativo, el carrusel de marcas (`BrandsMarquee`) deberá detener de inmediato su desplazamiento continuo, presentándose como una grilla estática o carrusel con control manual accesible. Igualmente, las micro-animaciones del Hero deberán neutralizarse sin romper el diseño. |
| **RNF-05** | **Resiliencia de Persistencia y Cero Hydration Mismatch** | El acceso a `localStorage` para verificar y escribir `ld_policies_consent_v1` deberá realizarse de forma defensiva dentro de bloques protegidos tras el ciclo de montaje en el cliente (`useEffect` o hook seguro), validando con el esquema Zod `PoliciesConsentSchema` y erradicando al 100% errores de hidratación (*hydration mismatch*). |
| **RNF-06** | **Diseño Adaptable (Mobile-First)** | Todas las nuevas secciones (Bento Grid, marquesina de marcas, panel flotante de políticas, modal de términos y botones CTA) deberán ser 100% responsivas, usables y sin desbordes horizontales desde pantallas de 320px de ancho hasta monitores de escritorio ultrawide (4K). |
| **RNF-07** | **Modularidad y Tipado Estricto** | Todo el nuevo código deberá estructurarse en TypeScript estricto con interfaces explícitas, desacoplado de dependencias externas innecesarias y compatible con la suite de pruebas unitarias existente en Vitest. |
| **RNF-08** | **Pipeline de Normalización de Medios (Sharp / Offline)** | Los archivos originales de taller en formatos `.HEIC` y `.jpeg` en `src/assets/workshop/` deberán ser transcodificados offline y normalizados a formato estándar moderno WebP (`.webp`) con ancho máximo de 1920px, sin metadata EXIF y con compresión de alta calidad antes de su inclusión definitiva en el bundle web. |

---

## 6. Jerarquía de Capas Inmutable (Sistema de Z-Index)

Para erradicar colisiones entre elementos flotantes y modales, se establece la siguiente escala de capas arquitectónica:

| Nivel de Capa | Clases Tailwind | Componentes Asignados | Comportamiento y Reglas |
| :--- | :--- | :--- | :--- |
| **Base / Contenido** | `z-0` a `z-30` | Grillas, tarjetas de servicio, fotos, video, textos y mapas. | Flujo de documento normal. |
| **Acciones Flotantes Fijas** | `z-40` | - `FloatingWhatsApp.tsx` (`bottom-6 right-6`)<br>- Botón flotante de Carrito en Catálogo (`bottom-6 right-6`) | Puntos de contacto permanente en esquina inferior derecha. |
| **Panel Flotante de Políticas** | `z-45` | `PoliciesBanner.tsx` (`sm:bottom-6 sm:left-6 sm:max-w-md`) | Se ubica en la **esquina inferior izquierda**, no compite espacialmente con los botones de `z-40`. |
| **Superficies de Interrupción** | `z-50` | - `LandingNavbar.tsx` (Menú móvil abierto)<br>- `CartDrawer.tsx` (`SheetContent`)<br>- `PoliciesModal.tsx` (`DialogContent`) | Diálogos modales y paneles laterales con backdrop oscuro que cubren todo el viewport. |

---

## 7. Casos Límite y Manejo de Excepciones

| ID | Situación Límite | Comportamiento Esperado del Sistema |
| :--- | :--- | :--- |
| **CL-01** | El navegador bloquea la reproducción automática del video en `WarrantySection` por modo ahorro de energía o políticas de autoplay. | Gracias al atributo `poster="src/assets/workshop/inyectores-detalle.webp"`, no se produce parpadeo de pantalla negra. El sistema degrada elegantemente a la fotografía fija sin arrojar errores en consola. |
| **CL-02** | El usuario tiene activada la directiva del sistema operativo `prefers-reduced-motion: reduce`. | La animación de la marquesina de marcas se detiene de inmediato (`animation: none`); los logotipos se organizan en una fila accesible con scroll horizontal nativo; la animación de zoom continuo del Hero se desactiva. |
| **CL-03** | El visitante navega en modo privado/incógnito estricto con cookies y `localStorage` bloqueados por el navegador. | Las llamadas a `localStorage` se encuentran encapsuladas en bloques `try/catch`. El estado de consentimiento se preserva en la memoria del componente durante la sesión activa para no insistir al usuario; al recargar, la aplicación opera sin excepciones fatales. |
| **CL-04** | El usuario hace clic en el enlace permanente de políticas del footer mientras el panel inferior sigue desplegado. | Se abre el modal `PoliciesModal` en capa `z-50` cubriendo el viewport. Al pulsar *"Aceptar y Continuar"* dentro del modal, se guarda el consentimiento con Zod en `localStorage` y se cierran tanto el modal como el panel inferior simultáneamente. |
| **CL-05** | La versión de las políticas cambia en una futura actualización (ej. `version: 2`). | El validador Zod rechaza payloads con versiones anteriores a la requerida, purgando la clave y volviendo a mostrar el panel flotante para recabar la conformidad de los usuarios. |
| **CL-06** | El usuario accede directamente a una URL profunda del catálogo con parámetros (`/catalogo?q=denso` o `/catalogo/$productId`). | El panel flotante de políticas se despliega en la esquina inferior izquierda (`z-45`) sin superponerse con el botón flotante del carrito en la derecha (`z-40`), permitiendo utilizar los filtros y consultar el repuesto sin interferencias. |
| **CL-07** | Dispositivo móvil con viewport muy reducido (320px de ancho) y panel de políticas desplegado. | El panel flotante compacta su padding a 12px y distribuye los botones en columna vertical (`flex-col`), asegurando zonas táctiles mínimas de 44px por botón. En la Landing Page, el botón de WhatsApp se desplaza automáticamente a `bottom-36`. |
| **CL-08** | Fallo momentáneo de red en la carga del video MP4 o conexión con cabecera `Save-Data: on`. | El componente detecta la restricción de red y desmonta el elemento `<video>`, renderizando exclusivamente la fotografía de precisión `inyectores-detalle.webp` con su insignia técnica correspondiente. |
| **CL-09** | El usuario hace scroll vertical táctil sobre la zona del carrusel de marcas en un celular. | Gracias a `touch-action: pan-y`, el gesto de deslizamiento vertical de la página no se traba ni se interrumpe. El carrusel suspende la animación únicamente ante toques sostenidos sin desplazamiento, reanudándose suavemente tras 1.5 segundos al retirar el dedo. |
| **CL-10** | Un producto del catálogo se encuentra sin precio público (`showPrice === false` o a cotizar). | El botón rediseñado de WhatsApp en la tarjeta y ficha conserva su estética esmeralda premium en OKLCH y envía el mensaje pre-estructurado solicitando cotización al día. |
| **CL-11** | El usuario abre el modal de políticas y navega utilizando únicamente el tabulador del teclado. | El foco avanza ordenadamente por los elementos accionables del modal (botones de navegación, cierre y aceptación), retornando al primer elemento al llegar al final y devolviendo el foco al botón disparador al cerrarse. |
| **CL-12** | La tarjeta de Bento Grid se visualiza en un monitor 4K. | La grilla respeta el contenedor institucional (`site-container` con ancho máximo de 1200px), evitando que los textos y fotos se estiren de forma desproporcionada. |
| **CL-13** | La clave `ld_policies_consent_v1` en `localStorage` contiene JSON manipulado o corrupto. | `PoliciesConsentSchema.safeParse` falla de forma controlada, purga el registro con `localStorage.removeItem`, e inicializa el estado como no aceptado sin romper la aplicación. |
| **CL-14** | El usuario interactúa con el botón de WhatsApp con conexión offline. | La apertura de la URL canónica `https://wa.me/...` es delegada al sistema operativo/navegador, mostrándose la pantalla estándar de conectividad del dispositivo sin corromper el estado de la aplicación. |

---

## 8. Fuera de Alcance (Exclusiones de Fase)

Los siguientes ítems quedan explícita y formalmente **fuera del alcance** de esta especificación:
- ❌ **Pasarela de pagos en línea o cobro electrónico:** La plataforma continúa operando bajo el modelo de cotización técnica con cierre asistido vía WhatsApp.
- ❌ **Firma digital o contratos vinculantes en línea:** La aceptación de políticas es una confirmación de conocimiento de condiciones comerciales por parte del cliente, no un contrato de adhesión con validez de firma electrónica avanzada.
- ❌ **Administración de políticas desde el Backoffice:** Las políticas comerciales y de garantía son estáticas e inmutables para esta versión, centralizadas en el código del frontend institucional.
- ❌ **Modificación de esquemas de base de datos o endpoints de API REST:** No se requieren migraciones de PostgreSQL ni cambios en controladores de Express en esta fase.
- ❌ **Gestión o cálculo automático de costos de envío:** Los envíos y comisionistas se coordinan manualmente entre el cliente y el personal del taller a través de WhatsApp.
- ❌ **Redacción o redefinición de marcas fuera de las 10 especificadas:** El carrusel se enfoca exclusivamente en las diez marcas autorizadas por el taller (Bosch, Zexel, Denso, Siemens VDO, Delphi, Caterpillar, Cummins, Stanadyne, Diesel Kiki, Perkins).
- ❌ **Generación de código de aplicación en `src/` o `server/`:** Esta fase concluye estrictamente con la aprobación y blindaje de esta especificación.

---

## 9. Criterios de Finalización (Definition of Done)

La Spec 007 se considerará completamente satisfecha cuando se cumplan **todos** los siguientes criterios verificables:

- [ ] **Pilar 1 (Activos Reales y Video Resiliente):**
  - La sección Hero renderiza `taller-hero.webp` con marco industrial, overlay de contraste legible (ratio > 7:1) y micro-animación fluida de zoom ultralento (12s).
  - La sección de Garantía reproduce `banco-en-vivo.mp4` en columna dedicada con atributos `muted autoPlay loop playsInline`, `poster="src/assets/workshop/inyectores-detalle.webp"` y fallback automático ante modo ahorro o conexiones lentas.
  - La sección de Ubicación exhibe la fotografía de la fachada real `fachada-local.webp` (mostrando la numeración 1215) integrada en la columna de datos junto a los horarios y el mapa.
- [ ] **Pilar 2 (Servicios en Bento Grid Industrial):**
  - La sección de Servicios presenta el Bento Grid industrial bajo la grilla CSS explícita (`lg:grid-cols-12`) con los 4 bloques técnicos y sus copys definitivos.
  - Cada bloque técnico cuenta con su fotografía real asignada, badges de ingeniería y micro-interacciones de hover (`scale-105` y resplandor azul).
  - La leyenda aclaratoria de marcas originales y alternativas se encuentra visible y legible al pie de la sección.
- [ ] **Pilar 3 (Carrusel de Marcas Optimizado):**
  - El componente `BrandsMarquee.tsx` se encuentra desplegado en la Landing Page entre `FeaturedProductsCarousel` y `ServicesSection` con desplazamiento continuo horizontal infinito (35s desktop / 25s móvil).
  - Se visualizan con nitidez los logotipos de las 10 marcas específicas: Bosch, Zexel, Denso, Siemens VDO, Delphi, Caterpillar, Cummins, Stanadyne, Diesel Kiki y Perkins.
  - La animación se pausa en hover de mouse y sostiene `touch-action: pan-y` para no trabar el scroll táctil, desactivándose bajo `prefers-reduced-motion`.
  - Los extremos izquierdo y derecho presentan máscaras difuminadas de gradiente (*fade-out*).
- [ ] **Pilar 4 (Políticas y Garantía sin Colisiones):**
  - El panel flotante `PoliciesBanner.tsx` se renderiza en la esquina inferior izquierda (`z-45`) si no existe un consentimiento válido en `localStorage`, conviviendo en armonía espacial con los botones flotantes de la esquina derecha (`z-40`).
  - La lectura y escritura en `localStorage` está blindada mediante el esquema `PoliciesConsentSchema` de Zod, purgando registros corruptos de inmediato.
  - `LandingFooter.tsx` incluye el botón semántico permanente *"Políticas de Garantía y Cotización"*.
  - El modal dialog accesible (`Dialog` en `z-50`) despliega íntegramente los 4 ejes normativos del taller, con soporte para tecla `Escape`, trampa de foco y sincronización de aceptación.
- [ ] **Pilar 5 (Rediseño de CTAs en OKLCH):**
  - Los tokens `--whatsapp` y `--whatsapp-foreground` en `src/styles.css` se encuentran recalibrados en espacio de color OKLCH a verde esmeralda profundo de alto contraste accesible (WCAG AAA ≥ 7:1).
  - Los botones de WhatsApp en `ProductCard.tsx`, `catalogo.$productId.tsx`, `CartDrawer.tsx` y el estado sin resultados de `catalogo.tsx` adoptan esta identidad visual unificada e integran el ícono oficial `FaWhatsapp`.
- [ ] **Normalización de Medios:**
  - Los activos brutos `.HEIC` han sido convertidos offline a formato WebP (`.webp`) ligero (≤ 350 KB), listos para el consumo web.
- [ ] **Calidad de Código y Validación Automatizada:**
  - `npx tsc --noEmit` ejecuta limpiamente sin ningún error de tipos en TypeScript.
  - La suite de pruebas de Vitest (`npm test` o `npx vitest run`) pasa al 100% sin regresiones.
  - `npm run build` genera el bundle de producción exitosamente.

---

## 10. Resoluciones de Auditoría Técnica y Estado de Dudas

Todas las observaciones de la auditoría QA han sido resueltas formalmente e incorporadas a la especificación:

1. **Grilla Bento Grid Explícita:** Definida en CSS con 12 columnas en desktop, 2 columnas en tablet y 1 columna en móvil, con copys técnicos definitivos asignados a `SITE_CONFIG.services`.
2. **Jerarquía Inmutable de Z-Index y Eliminación de Colisiones:** El banner de políticas se traslada a la esquina inferior izquierda (`z-45`) como panel dock card, respetando los botones flotantes de WhatsApp y carrito en la esquina inferior derecha (`z-40`), mientras modales y drawers operan en `z-50`.
3. **Resiliencia de Video con Poster y Ahorro de Datos:** Se incorpora `poster="src/assets/workshop/inyectores-detalle.webp"`, `preload="metadata"`, aspect-ratio definido y fallback automático ante modo ahorro de datos o conexiones lentas.
4. **Scroll Táctil Protegido en Marquee:** Se implementa `touch-action: pan-y` y reanudación con retardo de 1.5s, permitiendo el scroll vertical sin trabas.
5. **Validación Zod Fail-Fast:** Implementación de `PoliciesConsentSchema` para `ld_policies_consent_v1` con purga inmediata de datos corruptos.
6. **Tokens OKLCH Nativos:** Recalibración de `--whatsapp` a `oklch(0.55 0.16 160)` y texto blanco puro `#FFFFFF`, preservando la arquitectura de diseño de Tailwind v4 y garantizando contraste WCAG AAA.
7. **Conversión Offline de Activos HEIC:** Se formaliza el requisito RNF-08 de transcodificación offline a `.webp`.
8. **No quedan dudas abiertas ni requerimientos marcados como `[NECESITA ACLARACIÓN]`. La especificación se encuentra 100% blindada y lista para la elaboración del plan de implementación (`plan.md`).**
