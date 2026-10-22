# Especificación — Spec 009: Rediseño UI/UX Industrial Premium (Landing y Catálogo)

**Fase:** 009-rediseño-ui-premium  
**Versión:** 2.0 (Blindada tras Auditoría QA, AppSec y Accesibilidad WCAG)  
**Fecha:** 2026-10-22  
**Basado en:** [docs/constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md), [docs/SRS.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/SRS.md), [Spec 002](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/002-landing-page/spec.md), [Spec 003](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/003-catalogo/spec.md), [Spec 006](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/006-carrusel-destacados/spec.md), [Spec 007](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/007-identidad-marcas-politicas-cta/spec.md) y [src/styles.css](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/src/styles.css)  
**Estado:** Especificación de Requisitos Blindada Lista para Planificación

---

## 1. Contexto y Objetivo

### 1.1 Contexto Actual
Laboratorio Diésel dispone de una plataforma web operativa con catálogo de repuestos de alta presión, conectada a PostgreSQL mediante Express y Prisma. Si bien la plataforma cuenta con fotografía real del taller y políticas comerciales, la experiencia estética actual exhibe convenciones de diseño web comercial generalista (tarjetas con sombras difusas, bloques descriptivos largos en prosa y acentos cromáticos dispersos). Este lenguaje visual no comunica adecuadamente la rigurosidad, calibración milimétrica ni la autoridad tecnológica propia de un centro de ingeniería diésel y banco de pruebas computarizado.

### 1.2 Objetivo Principal
Rediseñar y reestructurar de manera integral la **Landing Page**, el **Catálogo Público de Repuestos**, el **Cajón de Cotizaciones (Carrito)** y la **Ficha Técnica de Detalle de Producto** bajo una **Dirección de Arte de Hardware e Ingeniería Automotriz B2B de Alta Gama**.

Este rediseño no altera reglas de negocio existentes, no modifica esquemas de base de datos ni contratos de la API REST, y no añade datos ficticios; enfoca la jerarquía visual en datos duros, alto contraste y superficies técnicas de máxima legibilidad y precisión.

### 1.3 Los 5 Pilares de la Dirección de Arte Determinista
El rediseño se rige de forma estricta por cinco pilares estéticos y funcionales auditados:

1. **Contraste Tipográfico "Macro/Micro":** Coexistencia entre tipografía de escala colosal y espaciado ultra compacto (*clamp* de 2.5rem a 4.5rem, interlineado 1.05, *tracking* negativo de -0.04em) para encabezados principales, contrastada con micro-etiquetas técnicas monoespaciadas en mayúsculas de 10px (0.625rem) con espaciado expandido de +0.2em para códigos, metadatos y estados.
2. **Datos Duros sobre Párrafos:** Reemplazo de narrativas comerciales por matrices técnicas modulares (Bento Grid con métricas de presión, tolerancias e instrumental) en la Landing Page, y transformación de las tarjetas del catálogo en fichas técnicas de ingeniería pura con alineación vertical garantizada mediante Flexbox (`mt-auto`).
3. **Monocromatismo y Estructura por Hairlines en OKLCH:** Superficie inerte y continua en fondo mineral oscuro (`--background: oklch(0.129 0.042 264.695)`), delimitada por divisiones perimetrales de 1px translúcidas (`--border: oklch(1 0 0 / 10%)`). Se prohíben colores ad-hoc; el color queda reservado para la fotografía real y el botón de acción comercial verde esmeralda (`--whatsapp: oklch(0.55 0.16 160)`).
4. **Efecto "Ghost" con Tiempos Deterministas y Accesibilidad:** Logotipos de marcas y elementos secundarios en reposo con opacidad calibrada (45% en escritorio con ratón, 70% en dispositivos móviles para visibilidad en luz solar diurna). Transición suave a 100% de luminosidad en 300ms con aceleración *ease-out*, soporte completo para navegación por teclado (`:focus-visible`) y anulación de estados pegados en pantallas táctiles.
5. **Inmersión Edge-to-Edge con Contraste Localizado WCAG:** Contenedores multimedia de extremo a extremo (Hero y Garantía). La mayor parte de la fotografía (más del 70%) permanece cruda y libre de veladuras generales; la legibilidad y el contraste accesible (WCAG AA 4.5:1 / AAA 7:1) se garantizan exclusivamente mediante degradados neutros (`from-black/85 via-black/50 to-transparent`) y sombras de texto multicapa situadas estrictamente detrás de los bloques tipográficos.

### 1.4 Cumplimiento de la Constitución del Proyecto (`docs/constitution.md`)
- **Principio 1 (SDD-First):** Toda directriz visual, escala tipográfica, apilamiento de capas y regla de contingencia se formaliza en este documento antes de planificar o codificar.
- **Principio 5 (Persistencia como fuente de verdad):** El inventario de PostgreSQL es la única fuente autoritativa. La coherencia de precios y códigos se mantiene intacta en el catálogo y carrito.
- **Principio 6 (Errores Opacos y Resiliencia en Frontera):** Ante fallas de conexión o imágenes ausentes, la interfaz reacciona con esquemas vectoriales técnicos y vistas neutras de contingencia con identificador de referencia opaco, sin romper la grilla ni exponer volcados técnicos.

---

## 2. Usuarios y Roles

| Rol | Descripción | Interacción con la Interfaz Rediseñada |
| :--- | :--- | :--- |
| **Mecánico Especialista / Bombista** | Profesional de inyección diésel que busca códigos OEM exactos y tolerancias de banco. | Lee datos técnicos sin prosa redundante, identifica códigos OEM primarios y alternativos de un vistazo y evalúa compatibilidades al instante. |
| **Transportista / Gestor de Flota** | Responsable de unidades pesadas o agrícolas que necesita cotizar repuestos con rapidez. | Reconoce la infraestructura física real del taller, explora marcas certificadas y solicita cotizaciones directas vía WhatsApp en un clic. |
| **Cliente Particular / Conductor** | Dueño de vehículo liviano con fallas de inyección en búsqueda de un laboratorio de máxima confiabilidad. | Percibe seriedad y precisión instrumental en el Hero y sección de Garantía; accede a políticas claras y ubicación física con numeración visible. |
| **Administrador del Taller** | Operador interno de Laboratorio Diésel que gestiona pedidos en WhatsApp y administra el catálogo. | Recibe solicitudes de presupuesto con códigos OEM precisos e ítems a cotizar claramente desglosados, manteniendo su panel de administración (`/admin`) en su entorno visual operativo aislado. |

---

## 3. Historias de Usuario

- **HU-01 (Autoridad de Ingeniería Inmediata):** Como visitante del sitio web, quiero que la interfaz me transmita rigurosidad y precisión técnica desde el primer segundo mediante tipografía de alto contraste y fotografía real sin velos artificiales, para confiar en la exactitud del diagnóstico de mi vehículo.
- **HU-02 (Fichas Técnicas de Rápida Comparación):** Como mecánico o comprador técnico, quiero que las tarjetas del catálogo exhiban códigos OEM primarios y cantidad de alternativas con alineación uniforme, para comparar componentes sin inconsistencias visuales en la grilla.
- **HU-03 (Consola de Filtros Fluida y Ergonómica):** Como usuario que busca entre decenas de repuestos, quiero operar una consola de filtros fija con desplazamiento interno independiente en mi computadora o un comando técnico deslizable en mi teléfono, para refinar búsquedas sin perder la posición de navegación.
- **HU-04 (Inspección de Marcas Accesible y Sin Fricción):** Como usuario de teclado o pantalla táctil, quiero interactuar con los logos de los fabricantes de forma accesible y nítida, sin animaciones bloqueantes ni efectos de hover pegados en mi teléfono.
- **HU-05 (Cotización Agrupada Clara con Precios Mixtos):** Como cliente que solicita presupuesto por varias piezas con y sin precio publicado, quiero que el carrito sume matemáticamente los ítems con precio y añada explícitamente "+ ÍTEMS A COTIZAR", para comprender con exactitud qué montos son firmes y cuáles requieren cotización del taller.
- **HU-06 (Integridad Visual y Cero Parpadeos):** Como usuario en cualquier dispositivo, quiero que el tema oscuro se aplique de forma homogénea en toda la experiencia pública sin destellos en blanco ni interferencias con el panel interno de gestión.

---

## 4. Requisitos Funcionales (Notación EARS)

### 4.1 Arquitectura Visual, Tokens OKLCH y Modo Oscuro

#### RF-01: Aislamiento del Modo Oscuro Público y Preservación del Panel Admin
- **El sistema deberá** aplicar el tema oscuro forzando la clase `.dark` exclusivamente en el contenedor de diseño raíz de las rutas públicas (Landing Page, Catálogo, Detalle y Carrito).
- **Mientras** se visualice cualquier vista pública, **el sistema deberá** resolver todos los colores y superficies a través de los tokens semánticos OKLCH registrados en `@theme inline` en `src/styles.css`:
  - Superficie base: `--color-background: var(--background)` (`oklch(0.129 0.042 264.695)`).
  - Superficie de tarjetas/contenedores: `--color-card: var(--card)` (`oklch(0.208 0.042 265.755)`).
  - Líneas perimetrales *hairlines*: `--color-border: var(--border)` (`oklch(1 0 0 / 10%)`).
  - Acento comercial WhatsApp: `--color-whatsapp: var(--whatsapp)` (`oklch(0.55 0.16 160)`).
  - Texto WhatsApp con contraste AAA: `--color-whatsapp-foreground: var(--whatsapp-foreground)` (`oklch(0.99 0 0)`).
- **Si** el usuario accede al Panel de Administración en la ruta `/admin`, **el sistema deberá** preservar el contexto `:root` claro original, impidiendo colisiones de estilo o alteraciones en los formularios internos de gestión.

#### RF-02: Jerarquía Tipográfica Determinista "Macro/Micro"
- **El sistema deberá** aplicar a los títulos colosales principales una escala fluida gobernada por `clamp(2.5rem, 6vw, 4.5rem)`, un interlineado compacto de `1.05`, peso visual de 800 (*extrabold*) y espaciado de caracteres negativo (*tracking* de `-0.04em`).
- **El sistema deberá** aplicar a las micro-etiquetas técnicas (códigos OEM, badges de estado, contadores de filtros y denominaciones de sistema) una tipografía monoespaciada con tamaño fijo de `10px` (`0.625rem`), mayúsculas obligatorias, peso seminegrita (600) y espaciado expandido (*tracking* de `+0.2em`).
- **Cuando** la interfaz se renderice en pantallas con ancho inferior a 768px, **el sistema deberá** limitar la escala macro superior para asegurar que los títulos no superen las tres líneas de texto en el primer pliegue de pantalla.

---

### 4.2 Página de Inicio (Landing Page)

#### RF-03: Sección Hero Edge-to-Edge con Contraste Localizado WCAG
- **Cuando** el usuario acceda a la ruta `/`, **el sistema deberá** desplegar la fotografía auténtica de las instalaciones del taller (`taller-hero.webp`) abarcando el 100% del ancho y alto del contenedor Hero sin recortes perimetrales.
- **El sistema deberá** mantener más del 70% de la superficie superior de la fotografía sin veladuras oscuras continuas ni filtros opacos generales.
- **Mientras** se visualicen los textos y llamados a la acción sobre la imagen, **el sistema deberá** garantizar una relación de contraste no inferior a 4.5:1 para párrafos y 7:1 para títulos mediante un gradiente neutro estrictamente delimitado al área del bloque de texto (`from-black/85 via-black/50 to-transparent`) complementado por sombras de texto multicapa (`text-shadow: 0 2px 10px rgba(0,0,0,0.8)`).
- **En pantallas móviles (ancho < 768px)**, **el sistema deberá** fijar el encuadre focal en `object-position: center 35%` y restringir el gradiente oscuro exclusivamente al tercio inferior donde residen los textos y botones.

#### RF-04: Bento Grid de Servicios e Infraestructura con Matriz Determinista
- **Cuando** el usuario visualice la sección `#servicios`, **el sistema deberá** renderizar los módulos de capacidad técnica en una matriz Bento Grid determinista:
  - **En pantallas de escritorio (ancho ≥ 1024px):** Matriz de 3 columnas con separación métrica exacta de `24px` (`gap-6`):
    - Módulo 1 (Banco de Pruebas Common Rail y Diagnóstico Computarizado): Ocupa 2 columnas y 2 filas (`col-span-2 row-span-2`), con fotografía real de fondo y datos duros de presión (hasta 2500 bar) y codificación IMA/C2i/C3i.
    - Módulo 2 (Inyectores Inductivos y Piezoeléctricos): Ocupa 1 columna (`col-span-1 row-span-1`), con métricas de tolerancia microscópica en micrones.
    - Módulo 3 (Bombas de Alta Presión CP1, CP3, CP4 y Mecánicas): Ocupa 1 columna (`col-span-1 row-span-1`), con rangos de caudal y prueba de estanqueidad.
    - Módulo 4 (Sistemas UIS / UPS / Inyector Bomba): Ocupa 3 columnas horizontales (`col-span-3 row-span-1`), con cobertura para líneas pesadas y agrícolas (Scania, Volvo, Iveco, John Deere).
  - **En pantallas móviles (ancho < 1024px):** Disposición vertical de 1 columna continua (`grid-cols-1`) con separación métrica exacta de `16px` (`gap-4`), manteniendo el orden de jerarquía técnica sin desbordamientos horizontales.
- **Mientras** el usuario interactúe con cualquier celda del Bento Grid mediante el puntero o el teclado, **el sistema deberá** elevar el brillo del borde hairline a `oklch(1 0 0 / 25%)` en una transición de 200ms sin alterar el layout.

#### RF-05: Marquesina de Marcas con Efecto Ghost Blindado y Accesible
- **El sistema deberá** presentar los logotipos de los fabricantes en un carrusel de desplazamiento continuo horizontal sin pausas bruscas ni saltos de fotogramas.
- **En pantallas de escritorio con ratón**, **el sistema deberá** mantener los logotipos en reposo con una opacidad del 45% y filtro desaturado (`filter: grayscale(100%)`). Al recibir el cursor (*hover*), el logotipo interactuado elevará su opacidad al 100% y removerá la desaturación en exactamente `300ms` con curva de aceleración `ease-out`, pausando la marquesina.
- **En dispositivos táctiles (pantallas móviles sin puntero fino)**, **el sistema deberá** anular el efecto *hover* para prevenir estados pegados, mostrando todos los logotipos con una visibilidad constante del 70% en escala de grises para asegurar legibilidad en exteriores bajo luz diurna, permitiendo el toque activo (*tap*) sin bloquear el desplazamiento vertical de la página.
- **El sistema deberá** dotar a cada logotipo de navegación por teclado (`tabindex="0"` y `aria-label="Fabricante homologado: {nombre}"`), aplicando foco visual con anillo visible (`ring-2 ring-white/40`) y 100% de luminosidad cuando reciba el foco de tabulación.
- **Si** el usuario tiene activada la preferencia de reducción de movimiento (`prefers-reduced-motion`), **el sistema deberá** detener la animación continua y permitir la inspección en una cuadrícula estática o mediante desplazamiento manual.

#### RF-06: Secciones de Garantía y Ubicación Edge-to-Edge
- **Cuando** el usuario visualice la sección `#garantias`, **el sistema deberá** exhibir el video o fotografía de banco de pruebas en proporción `16/9` ocupando el contenedor de extremo a extremo sin márgenes internos, escoltado por fichas de datos duros de certificación instrumental y sellado de garantía.
- **Cuando** se visualice la sección `#ubicacion`, **el sistema deberá** exhibir la fotografía de la fachada con la numeración oficial 1215 nítida, integrada en una cuadrícula de 2 columnas en escritorio (fotografía y mapa interactivo) con bordes hairlines de 1px.

---

### 4.3 Catálogo de Repuestos y Fichas Técnicas

#### RF-07: Consola de Filtros con Ergonomía Laptop y Cajón Deslizante Móvil
- **En pantallas de escritorio (ancho ≥ 1024px)**:
  - **El sistema deberá** situar los filtros en una columna lateral estructurada como consola técnica fija (*sticky*).
  - Para evitar que la consola desborde el *viewport* en computadoras portátiles o pantallas con altura menor a 900px, **el sistema deberá** acotar la altura máxima a `max-height: calc(100vh - 6rem)` e incorporar desplazamiento vertical interno independiente (`overflow-y-auto`) con barra de desplazamiento delgada en tonalidad mineral oscura.
  - La consola exhibirá badges monoespaciados con el conteo exacto de piezas disponibles por marca y categoría.
- **En pantallas móviles (ancho < 1024px)**:
  - **El sistema deberá** condensar los filtros en un botón de comando técnico flotante con etiqueta monoespaciada `FILTROS TÉCNICOS`, fijado en la parte inferior central o superior accesible bajo el nivel de apilamiento `z-35`.
  - Si existen filtros activos, dicho botón deberá incluir una micro-insignia numérica con la cantidad de filtros seleccionados.
  - Al pulsar el botón, **el sistema deberá** desplegar un cajón lateral deslizante (`FilterDrawer`) bajo el nivel de apilamiento `z-40`, con un ancho máximo de `360px` (o 85% del ancho de pantalla en teléfonos compactos), velo de fondo translúcido oscurecido y botón de cierre claro.

#### RF-08: Tarjetas de Producto como Fichas Técnicas Puras (Flexbox y Múltiples OEM)
- **El sistema deberá** renderizar cada producto del catálogo como una Ficha Técnica Pura estructurada con contenedor vertical flexible (`display: flex; flex-direction: column`):
  1. Contenedor de imagen en proporción `16/10` con borde inferior hairline.
  2. Fila superior de badges monoespaciados: Marca oficial y Condición técnica (diferenciada sobria: "NUEVO" con borde sólido continuo y "REACONDICIONADO" con borde punteado/discontinuo técnico).
  3. Título del repuesto limitado a un máximo de dos líneas visibles (`line-clamp-2`), permitiendo que la tarjeta adapte su altura según la extensión del nombre.
  4. Cuadrícula de datos técnicos con código OEM principal y estado de disponibilidad en stock.
  5. Contenedor de acciones y precio anclado al fondo de la tarjeta mediante empuje vertical automático (`margin-top: auto`), asegurando que todos los botones de compra y cotización de una misma fila queden perfectamente alineados de forma matemática.
- **Si** un producto posee múltiples códigos OEM cruzados (ej. código de inyector Bosch y códigos de fabricantes vehiculares):
  - **El sistema deberá** priorizar y exhibir en la tarjeta el código del fabricante del sistema de inyección (Bosch, Delphi, Denso, etc.) como código principal.
  - **El sistema deberá** incorporar contiguo al código un badge técnico monoespaciado interactivo con el texto `+{N} ALTERNATIVOS`, indicando la cantidad de equivalencias adicionales. Al hacer clic o acceder a la ficha, se revelará la lista completa.
- **Si** un producto carece de código OEM registrado, **el sistema deberá** mostrar un guion técnico neutro (`"—"`).
- **Si** un producto posee precio en cero o no publicado, **el sistema deberá** renderizar el badge monoespaciado `"A COTIZAR"` en lugar del importe monetario.

#### RF-09: Carrito de Consultas con Cálculo Mixto de Precios
- **Cuando** el usuario abra el cajón lateral de consultas (`CartDrawer`), **el sistema deberá** desplegar la lista de piezas seleccionadas conservando sus códigos OEM y cantidades.
- **Si** el carrito contiene simultáneamente productos con precio monetario publicado y productos marcados como "A COTIZAR":
  - **El sistema deberá** calcular la suma matemática estricta exclusivamente de aquellos ítems que posean precio publicado.
  - **El sistema deberá** renderizar en el pie del cajón el total parcial calculado seguido explícitamente de la leyenda monoespaciada en mayúsculas: `+ ÍTEMS A COTIZAR` (ejemplo: `$ 1.250.000,00 + ÍTEMS A COTIZAR`).
  - Al generar el mensaje de WhatsApp, **el sistema deberá** desglosar el listado indicando el importe para las piezas con precio y la etiqueta explícita `[A Cotizar]` para las piezas sin precio, garantizando total transparencia comercial.
- **Si** todos los productos del carrito son "A COTIZAR", **el sistema deberá** mostrar como importe general la leyenda `"PRESUPUESTO A CONFIRMAR"`.

---

### 4.4 Apilamiento Maestro de Capas y Resiliencia en Frontera

#### RF-10: Jerarquía Z-Index Maestra
- **El sistema deberá** estructurar el apilamiento de capas en toda la aplicación pública siguiendo estrictamente esta escala numérica para erradicar cualquier colisión de interacción:
  - **`z-50` — Barra de Navegación Maestra (`LandingNavbar`):** Siempre visible sobre cualquier contenido en desplazamiento.
  - **`z-40` — Modales, Cajones y Diálogos de Pantalla Completa:** `CartDrawer`, `CommercialPoliciesModal` y el cajón móvil de filtros `FilterDrawer`, acompañados de sus respectivos fondos atenuadores (*backdrops*).
  - **`z-35` — Botón de Comando de Filtros Móvil:** Disparador flotante técnico en catálogo móvil, situado por debajo de los modales pero por encima del contenido y widgets persistentes.
  - **`z-30` — Widgets y Notificaciones Flotantes Persistentes:** Botón flotante `FloatingWhatsApp` y panel inferior de consentimiento de políticas comerciales (`CommercialPoliciesBanner`).
  - **`z-20` — Elementos Fijos Secundarios:** Consola lateral de filtros en escritorio (*sticky sidebar*) y cabeceras de tablas técnicas.
  - **`z-10` — Capas Interactivas Locales:** Tarjetas de producto, celdas de Bento Grid y menús desplegables locales.
  - **`z-0` — Superficie Base y Multimedia:** Fondos de página y fotografía cruda de instalaciones.

#### RF-11: Resiliencia Visual y Errores Opacos (Principio 6)
- **Si** un producto en el catálogo no dispone de imagen en el servidor, **el sistema deberá** renderizar un esquema técnico vectorial estilizado de un inyector diésel en trazo fino monocrómico sobre fondo mineral, acompañado del texto monoespaciado `"ESQUEMA TÉCNICO REGISTRADO"`, prohibiendo fotografías de stock o iconos rotos.
- **Si** se produce una falla de red o interrupción del backend al consultar productos (`CatalogErrorBoundary`), **el sistema deberá** desplegar un panel monocrómico delimitado por hairlines con el mensaje sobrio *"Servicio de Catálogo Temporalmente No Disponible"* y un identificador opaco en tipografía monoespaciada (ej. `REF: <UUID>`), proveyendo un botón de reintento y un enlace directo a WhatsApp sin exponer trazas de error de software ni mensajes crudos del servidor.

---

## 5. Requisitos No Funcionales (RNF)

- **RNF-01 (Accesibilidad Visual y Contraste WCAG):** Todo texto principal, código técnico y valor numérico deberá cumplir con un ratio de contraste mínimo de 4.5:1 contra su fondo adyacente (WCAG AA). Los encabezados principales sobre multimedia y los botones de acción principal verde esmeralda (`--whatsapp`) deberán satisfacer un ratio de contraste no inferior a 7:1 (WCAG AAA).
- **RNF-02 (Rendimiento y Tasa de Cuadros):** Las animaciones de apertura de cajones, transiciones del efecto *ghost* (300ms) y el desplazamiento de la marquesina deberán ejecutarse a una velocidad constante de 60 fotogramas por segundo, con una métrica de cambio de diseño acumulado (CLS) estrictamente igual a 0.
- **RNF-03 (Consistencia de Color OKLCH):** La totalidad de los estilos CSS públicos deberán utilizar el sistema de tokens semánticos definidos en OKLCH. Queda prohibida la inclusión de valores hexadecimales aislados, colores RGB no mapeados o utilidades directas no calibradas en el tema.
- **RNF-04 (Ergonomía Táctil y Puntos de Quiebre):** Todo elemento interactivo en pantallas táctiles (botones de filtro, disparadores de carrito y enlaces de marcas) deberá contar con un área de contacto mínima de `44x44` píxeles para garantizar operabilidad ergonómica sin pulsaciones accidentales.
- **RNF-05 (Respeto a Preferencias del Entorno):** La interfaz deberá detectar y acatar automáticamente las directivas del navegador `prefers-reduced-motion` (desactivando transiciones continuas) y `prefers-reduced-data` (sustituyendo videos por fotografías optimizadas).

---

## 6. Casos Límite y Manejo de Contingencias

1. **Denominación Técnica de Producto Ultra Larga:**
   - Si un repuesto contiene un título de 100 caracteres o más, el texto se acota a dos líneas con puntos suspensivos (`line-clamp-2`). La tarjeta asume la altura requerida y los botones inferiores se alinean rígidamente en la base mediante Flexbox (`mt-auto`).
2. **Productos con Más de Tres Códigos OEM Equivalentes:**
   - Se exhibe el código OEM principal y el badge `"+3 ALTERNATIVOS"`. Al tocar el badge en móvil o hacer hover en escritorio, se despliega una micro-tarjeta técnica con la lista completa sin forzar navegación externa.
3. **Mezcla Heterogénea en Carrito de Productos con Precio y Sin Precio:**
   - La sumatoria matemática opera exclusivamente sobre los valores cuantitativos y concatena la aclaración `"+ ÍTEMS A COTIZAR"`, trasladando la distinción al mensaje estructurado final de WhatsApp.
4. **Pantallas Portátiles con Altura Reducida (Laptops 1366x768):**
   - La consola lateral fija activa su scroll interno suave (`overflow-y-auto`) a partir de los `calc(100vh - 6rem)`, impidiendo que los botones de reseteo de filtros o las categorías inferiores queden fuera del alcance visual del usuario.
5. **Uso de Pantallas Táctiles Bajo Luz Solar Directa:**
   - La anulación de la opacidad reducida en móviles (fijada al 70% estático) asegura que los logotipos de marcas y etiquetas secundarias sean perfectamente identificables bajo luz ambiente intensa sin requerir interacción previa del usuario.

---

## 7. Fuera de Alcance

Quedan expresamente excluidos de esta especificación técnica:
1. **Panel de Administración (`/admin`):** No sufre ninguna alteración de diseño ni de maquetación, preservando su tema `:root` claro y componentes funcionales.
2. **Modificaciones en Base de Datos y Backend:** No se crean tablas, columnas ni se modifican los esquemas Prisma ni los controladores de Express.
3. **Pasarela de Pagos Transaccional:** La plataforma permanece como herramienta de consulta, cotización y enlace comercial a WhatsApp sin transacciones bancarias directas.
4. **Alta o Modificación de Contenido de Repuestos:** La intervención se enfoca exclusivamente en la capa de interfaz y presentación visual.

---

## 8. Criterios de Finalización (Definition of Done)

Para declarar formalmente implementada y aprobada la Spec 009, se deberán auditar y validar los siguientes criterios:

- [ ] La clase `.dark` se aplica de forma aislada a las rutas públicas, manteniendo el modo claro intacto en `/admin`.
- [ ] Todos los colores utilizados derivan estrictamente de los tokens semánticos OKLCH definidos en `src/styles.css`.
- [ ] La escala tipográfica "Macro/Micro" opera con fluid clamp y espaciados calibrados (-0.04em en títulos y +0.2em en monoespaciados).
- [ ] El Hero y Garantía ocupan el 100% del contenedor con más del 70% de la fotografía libre de veladuras, asegurando contraste accesible (7:1 / 4.5:1) mediante degradados localizados.
- [ ] El Bento Grid de Servicios se organiza en 3 columnas en escritorio (`gap-6`) y 1 columna en móvil (`gap-4`).
- [ ] La marquesina de marcas opera con transiciones deterministas de 300ms ease-out en escritorio, 70% de opacidad estática en pantallas táctiles y soporte de foco por teclado.
- [ ] Las tarjetas de producto funcionan como Fichas Técnicas Puras con alineación de botones garantizada por Flexbox (`mt-auto`).
- [ ] Los productos con múltiples códigos OEM muestran el código principal y el badge `"+X ALTERNATIVOS"`.
- [ ] Los productos sin precio exhiben el badge `"A COTIZAR"` sin alterar la geometría de la fila.
- [ ] El carrito de consultas calcula la suma matemática de los ítems con precio y agrega explícitamente `"+ ÍTEMS A COTIZAR"` ante compras mixtas.
- [ ] La consola de filtros de escritorio posee desplazamiento interno independiente para pantallas de altura reducida.
- [ ] El disparador de filtros móvil opera bajo el nivel `z-35` y despliega un cajón lateral accesible en `z-40`.
- [ ] La jerarquía Z-Index Maestra (`z-50` a `z-0`) se respeta sin colisiones entre WhatsApp flotante, banners, navbar y modales.
- [ ] Los estados de error y productos sin foto despliegan diagramas técnicos y códigos opacos sin exponer volcados de software.

---

## 9. Dudas Abiertas

- **No existen dudas abiertas pendientes:** Las 18 vulnerabilidades detectadas en la auditoría QA han sido completamente resueltas y normalizadas en las secciones 4, 5 y 6 de esta especificación técnica.
