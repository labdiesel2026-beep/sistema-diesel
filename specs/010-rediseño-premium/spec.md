# Especificación — Spec 010: Retro-documentación y Refinamiento del Rediseño UI Premium

**Fase:** 010-rediseño-premium  
**Fecha:** 2026-10-22  
**Versión:** 10.0 (Definitiva, Inmutable, Sellada y Blindada — Aprobada para Planificación)  
**Estado:** Especificación de Requisitos Funcionales Aprobada, Cerrada y Bloqueada para Planificación  
**Basado en:** Constitución del Proyecto (`docs/constitution.md`), Especificaciones de Catálogo, Landing Page e Identidad Previa  

---

## 1. Contexto y Objetivo

### 1.1 Contexto
Durante el ciclo de desarrollo de la plataforma web de Laboratorio Diésel, el frontend evolucionó hacia un lenguaje visual oscuro de ingeniería automotriz de alta gama. Sin embargo, dicha renovación carecía de una sección homóloga en el SDD, generando una brecha documental con las especificaciones tempranas (Fases 002 a 007).

A través de nueve rondas exhaustivas de aseguramiento de calidad (QA) y auditoría técnica, se depuraron inconsistencias cromáticas (erradicando cualquier azul en favor del naranja industrial térmico), cinemáticas espaciales complejas (bucle porcentual dinámico al `-50%` con cobertura garantizada en pantallas 4K/Ultrawide y recálculo en `resize`), control de accesibilidad WCAG 2.2.2 con botón toggle y memoria de pausa, delimitación perimetral de barras móviles adaptativas (`min-h-[64px]` con `ResizeObserver` y ancho exacto de 48px para WhatsApp), estandarización de grillas cuadradas (1:1) para fotografía de repuestos con diferenciación semántica de badges ("Nuevo" vs. "Reacondicionado"), degradación elegante sin JavaScript, sincronía multi-pestaña por `BroadcastChannel` con fallback a `storage`, interceptor preventivo `beforeunload`, y la articulación matemática precisa del pipeline de validación Zod en frontera (hasta 8 MB brutos) con compresión Sharp orientada a `<= 500 KB` y transporte constitucional Zero-Trust mediante cookies `HttpOnly` con credenciales forzadas (`withCredentials: true`).

### 1.2 Objetivo
1. **Fijar la "Fuente de Verdad" Estética y Documental (SDD-First):** Formalizar en el SDD las directrices visuales, escalas, contrastes y tokens de diseño oficiales del rediseño oscuro, erradicando cualquier remanente cromático azul en favor de una paleta de **Hardware e Ingeniería Diésel** basada en superficies minerales oscuras y acentos en **Naranja Industrial/Técnico** (`#ea580c` / combustión y calor térmico).
2. **Especificar las 8 Mejoras y Correcciones Visuales:** Normar con precisión matemática y funcional el comportamiento de animaciones continuas, jerarquías de lectura sincronizadas en Hero, barras móviles dinámicas con soporte de *Safe Area Insets*, integración estándar de fotografía de repuestos y flujos de captura ergonómicos.
3. **Establecer una Dualidad de Entornos Nítida:**
   - **Área Pública (Landing Page y Catálogo):** Atmósfera inmersiva oscura de alto contraste, fotografía real vibrante, logos adaptados a siluetas de alta legibilidad y micro-interacciones de precisión con control universal accesible.
   - **Área Operativa (Panel de Administración):** Estrictamente en **Tema Claro (Light Mode)**, priorizando la ergonomía tabular con cabeceras opacas, la legibilidad de códigos alfanuméricos y la prevención de errores con confirmaciones tipadas en tareas prolongadas de gestión de inventario.

---

## 2. Usuarios y Roles

| Rol | Contexto de Uso | Necesidad en la Interfaz |
| :--- | :--- | :--- |
| **Visitante / Cliente Particular** | Accede al sitio web desde dispositivos móviles o de escritorio buscando solución técnica a fallas de inyección de su vehículo. | Percibir de inmediato seriedad, tecnología de diagnóstico de banco y orden técnico; identificar con claridad la acción principal sugerida ("Ver Catálogo") sin verse abrumado por elementos flotantes superpuestos en su teléfono. |
| **Mecánico Especialista / Bombista** | Busca componentes de reemplazo, bombas e inyectores específicos consultando códigos OEM. | Navegar un catálogo oscuro, limpio y contrastado, donde las imágenes de repuestos se aprecien en sus colores y acabados metálicos reales dentro de una cuadrícula cuadrada (1:1) uniforme, con badges cromáticos que distingan piezas nuevas de reacondicionadas, y las especificaciones técnicas se lean sin fatiga visual. |
| **Operador / Administrador del Taller** | Gestiona el inventario, actualiza precios, da de alta repuestos y revisa solicitudes de clientes. | Utilizar una consola de administración SaaS en modo claro con alta densidad de datos, cabeceras fijas opacas para escaneo vertical veloz, jerarquía inequívoca de botones de acción con confirmación de seguridad y formularios protegidos ante desconexiones de red, recargas accidentales (`beforeunload`) y expiración de sesión con refresh silencioso, retención de binarios y prevención de doble envío. |

---

## 3. Historias de Usuario

- **HU-01 (Confianza Visual e Identidad Tecnológica):** Como visitante del sitio, quiero visualizar las instalaciones, bancos de prueba y logos de fabricantes con máxima fidelidad de color y dinamismo suave, para certificar que se trata de un laboratorio de ingeniería automotriz de primer nivel.
- **HU-02 (Orientación Intuitiva al Catálogo):** Como usuario que navega la Landing Page en móvil o escritorio, quiero que la interfaz me indique de manera natural, atractiva y no invasiva que el siguiente paso recomendado es ingresar al catálogo de repuestos.
- **HU-03 (Exploración Fluida sin Sobresaltos):** Como usuario que explora la página hacia abajo, quiero que los bloques de contenido aparezcan de forma secuencial y suave, manteniendo un control visual predecible sin animaciones que se reinicien al retroceder la lectura.
- **HU-04 (Consulta Técnica en Catálogo Premium):** Como comprador o mecánico, quiero explorar las tarjetas de repuestos bajo una atmósfera técnica oscura y uniforme donde las fotos de inyectores y bombas resalten nítidamente en su color original y los datos de condición se distingan con claridad cromática inmediata.
- **HU-05 (Ergonomía y Carga Administrativa Segura):** Como administrador del taller, quiero operar una vista de inventario en tema claro con encabezados de tabla opacos siempre visibles, diferenciación estricta de botones de guardado vs. eliminación con confirmación tipada obligatoria y formularios protegidos ante caídas de red, recargas involuntarias y expiración de sesión con reintento automático de subida de archivos, para gestionar el stock con rapidez y sin equivocaciones.
- **HU-06 (Accesibilidad y Respeto a Preferencias de Movimiento y Control Universal):** Como usuario con sensibilidad visual, preferencias de movimiento reducido o navegación exclusiva por teclado, quiero pausar y reanudar voluntariamente cualquier animación continua mediante un botón interactivo y disfrutar de una experiencia estática y estable que recuerde mi elección.

---

## 4. Requisitos Funcionales (Notación EARS)

### Módulo A: Carrusel Continuo de Marcas Aliadas (Marquee)

- **RF-01 (Desplazamiento Infinito de Marcas, Cobertura 4K, Memoria de Pausa y Accesibilidad WCAG 2.2.2):**
  - *Ubicuo:* El sistema debe presentar una cinta continua de logotipos de fabricantes y marcas aliadas con desplazamiento horizontal ininterrumpido en sentido **de derecha a izquierda**, a una velocidad constante y exacta de **35 segundos por ciclo completo**.
  - *Ubicuo:* Para asegurar cobertura visual plena en monitores panorámicos y pantallas 4K / *ultrawide* sin importar la cantidad de marcas registradas en la base de datos, el contenedor debe utilizar dimensiones dinámicas (`fit-content`) y clonar el arreglo base de marcas de forma programática hasta superar un ancho mínimo equivalente al **200% del ancho del viewport (`min-width: 200vw`)**.
  - *Dirigido por eventos:* El sistema debe suscribir un escucha de eventos en el redimensionamiento de ventana (`window.addEventListener('resize')` con *debounce* de **250ms**). Si el ancho del viewport se incrementa superando la cobertura actual de los clones, el componente re-evaluará matemáticamente y añadirá los clones necesarios para preservar `min-width > 200vw`.
  - *Ubicuo:* La traslación CSS pura se ejecutará desplazando la pista exactamente la mitad de los elementos renderizados (`transform: translateX(-50%)` mediante `@keyframes`), garantizando un bucle infinito matemáticamente continuo sin saltos de fotograma al reiniciar.
  - *Ubicuo:* Los logotipos individuales dentro de la cinta deben estar restringidos a una altura máxima de **40px (`max-h-10`)** y un ancho máximo de **120px (`max-w-[120px]`)**, aplicando ajuste proporcional (`object-contain`), con una separación horizontal (*gap*) constante y uniforme de exactamente **48px** entre logotipos contiguos.
  - *Ubicuo:* Como excepción a la regla de fotografía a todo color (aplicable a recursos vectoriales y PNGs con fondo transparente), a los logotipos de marcas se les aplicará un filtro de luminancia monocromático (`brightness-0 invert opacity-70`) para garantizar su contraste visible como siluetas nítidas sobre el fondo oscuro `#0a0a0a`. Al pasar el cursor (*hover*), el logotipo alcanzará luminosidad plena (`opacity-100`).
  - *Basado en estado:* Mientras el usuario mantenga el cursor (*hover*) sobre cualquier sección del carrusel o mantenga pulsada la superficie táctil en un dispositivo móvil, el sistema debe pausar de inmediato el desplazamiento horizontal para permitir una lectura estática. No se admitirá desplazamiento manual táctil (*drag/swipe*); la cinta permanecerá fija mientras se mantenga el contacto.
  - *Dirigido por eventos:* Cuando el usuario retire el cursor o levante el dedo de la pantalla, el sistema debe reanudar suavemente el desplazamiento continuo sin saltos bruscos de posición, **siempre que el usuario no haya pausado la animación mediante el botón toggle accesible**.
  - *Ubicuo (Conformidad WCAG 2.2.2 Pause, Stop, Hide):* El contenedor del carrusel debe incluir un botón de control accesible tipo interruptor (*toggle*), posicionado al inicio del contenedor, que permanecerá visualmente oculto (`sr-only`) pero que **se hará plenamente visible en una esquina al recibir el foco del teclado (`:focus-visible`)**:
    - En estado activo: presenta el texto "Pausar animación" con `aria-pressed="false"`.
    - Al ser accionado mediante teclado (`Enter` o `Espacio`) o clic: detiene de inmediato la cinemática CSS, cambia su texto a "Reanudar animación" y actualiza a `aria-pressed="true"`. Una segunda pulsación reanuda suavemente el desplazamiento y restablece el estado.
    - **Memoria de Pausa Estricta:** La decisión de pausa manual tiene precedencia absoluta. Si el usuario activa la pausa, eventos secundarios de visibilidad de pestaña (`visibilitychange`) o blur/focus del navegador no reanudarán la animación; el carrusel permanecerá detenido hasta que el usuario pulse explícitamente "Reanudar animación".
    - Donde el sistema operativo del usuario tenga activa la preferencia `prefers-reduced-motion: reduce`, la animación nace estática por defecto y este botón **no se renderiza en el DOM**, evitando redundancia en el árbol de accesibilidad.
  - *Ubicuo:* El sistema debe aplicar una máscara de degradado translúcido en los extremos izquierdo y derecho del contenedor del carrusel, de modo que los logotipos emerjan y se oculten de forma gradual sin cortes visuales abruptos contra el fondo.
  - *Ubicuo:* El sistema debe presentar los logotipos estrictamente como distintivos de confianza institucional decorativos (*trust badges*), marcados con `aria-hidden="true"` y sin foco individual por teclado (`tabindex` deshabilitado), deshabilitando cualquier comportamiento de enlace, clic o filtrado.
  - *Opcional:* Donde la consulta a la base de datos de marcas aliadas devuelva un listado vacío (`[]`) o falle la llamada al endpoint correspondiente, el sistema debe **desmontar condicionalmente la sección completa** (`display: none`), evitando generar bloques vacíos o deformaciones en la estructura de la página.

---

### Módulo B: Botones de Captación de Atención ("Ver Catálogo")

- **RF-02 (Micro-interacción, Feedback Activo y Señalización Lumínica Interna):**
  - *Ubicuo:* El sistema debe mantener la posición física del contenedor del botón y la tipografía de su etiqueta completamente estáticas y ancladas en la interfaz durante el ciclo pasivo (evitando vibraciones o desenfoques en el Navbar, en el Hero y en la barra móvil).
  - *Ubicuo:* El sistema debe proyectar periódicamente un haz de luz interno (*shimmer*) que barra la superficie del botón con un ángulo diagonal exacto de **45°**, compuesto por el token canónico `--shimmer-beam: rgba(255, 255, 255, 0.15)` con un ancho equivalente al **25% del ancho total del botón**, ejecutando una fórmula temporal de **4.0 segundos de reposo + 1.2 segundos de barrido activo** (ciclo total de **5.2 segundos**) aplicando una función de aceleración orgánica `ease-in-out`.
  - *Ubicuo:* El sistema debe dotar al glifo o flecha direccional de navegación de un micro-desplazamiento horizontal continuo y autónomo (independiente del ciclo de shimmer), oscilando entre **0px y 4px en el eje X** mediante una curva de aceleración `ease-in-out` con un período de ciclo completo de ida y vuelta de exactamente **1.5 segundos**.
  - *Dirigido por eventos:* Cuando el usuario posicione el cursor (*hover*) o coloque el foco de teclado sobre el botón en dispositivos de escritorio, el sistema debe suspender el ciclo continuo (ocultando el destello y fijando la flecha direccional en su posición final extendida a 4px) para confirmar el estado de interacción activa.
  - *Dirigido por eventos:* En dispositivos de escritorio, al presionar el botón manteniendo el clic sostenido (estado `:active`), el sistema debe proveer retroalimentación física táctil mediante una compresión sutil de escala de **`scale-[0.98]`**, recuperando el tamaño completo al soltar el clic.
  - *Dirigido por eventos:* Cuando el usuario pulse el botón en una pantalla táctil entrando en estado activo (`:active`), el sistema debe detener instantáneamente la animación continua.
  - *Opcional:* Donde el usuario posea habilitada la preferencia de reducción de movimiento en su sistema operativo, el sistema debe cancelar el barrido de luz y el micro-movimiento de la flecha, renderizando el botón en estado estático con alto contraste.

---

### Módulo C: Jerarquía Tipográfica y Estructura del Hero

- **RF-03 (Orden de Lectura y Preservación de Dinámica en Hero):**
  - *Ubicuo:* El sistema debe presentar la jerarquía visual del bloque principal de la cabecera (Hero) en la siguiente secuencia vertical estricta:
    1. Título principal de máxima jerarquía: **"LABORATORIO DIÉSEL"**.
    2. Subtítulo complementario inmediatamente inferior: **"Especialistas en inyección diésel"**.
    3. Bloque de botones y acciones primarias de acceso al catálogo y contacto.
  - *Ubicuo:* El título principal "LABORATORIO DIÉSEL" debe ingresar mediante una animación de revelación sutil (*fade-in con slide-up*, opacidad de 0 a 1 y traslación vertical Y de **20px a 0**) con una duración de **0.8 segundos**, completándose antes del inicio del subtítulo.
  - *Ubicuo:* Inmediatamente tras finalizar la revelación del título principal, y mediando un retardo inicial de **800ms**, el subtítulo debe ejecutar su efecto de mecanografía técnica a una velocidad de **40ms a 60ms por carácter**, manteniendo al finalizar un **cursor parpadeante permanente** en glifo de barra vertical (`|`), con un ciclo de parpadeo de **1 segundo** (500ms visible, 500ms oculto) coloreado en **Naranja Técnico (`#ea580c`)** para generar contraste tecnológico contra el texto blanco.

---

### Módulo D: Tratamiento Fotográfico Fiel y Contraste WCAG

- **RF-04 (Fidelidad Cromática con Protección de Legibilidad):**
  - *Ubicuo:* El sistema debe renderizar todas las fotografías institucionales (bancos de prueba computarizados, herramientas de calibración, instalaciones del taller y componentes diésel) a todo color, erradicando cualquier filtro o capa general de desaturación a escala de grises.
  - *Ubicuo:* El sistema debe interponer una capa intermedia de degradado neutro u oscurecimiento localizado (*gradient overlay* con opacidad calibrada) entre la imagen fotográfica a todo color y los bloques de texto superpuestos en el Hero y banners de sección, garantizando el cumplimiento de la relación de contraste WCAG AA (mínimo 4.5:1 para texto normal y 3:1 para texto grande).

---

### Módulo E: Animaciones Progresivas al Desplazar la Página (Scroll)

- **RF-05 (Aparición Escalonada Unidireccional y Degradación Elegante):**
  - *Ubicuo:* El sistema debe aplicar un efecto de revelación visual suave compuesto por desvanecimiento con elevación vertical (*fade-in con slide-up*) a los diferentes bloques y módulos informativos al hacer scroll por la Landing Page.
  - *Ubicuo:* Para asegurar la degradación elegante (*graceful degradation*) ante condiciones de red inestable o fallos de ejecución de JavaScript, los elementos mantendrán visibilidad por defecto (`opacity: 1`). El estado inicial invisible (`opacity: 0`) para la animación solo se aplicará mediante CSS condicionado a la presencia de una clase de confirmación de scripts activos (`js-enabled`) en el elemento raíz `<html>`.
  - *Dirigido por eventos:* Cuando un elemento o sección ingrese en el área visible de la pantalla alcanzando un umbral de intersección (*threshold*) del **10%**, el sistema debe disparar la animación de revelación una única vez dentro del ciclo de vida del DOM (`once: true`).
  - *Ubicuo:* En la navegación interna de la aplicación (SPA), si el usuario transita hacia el Catálogo y regresa posteriormente a la Landing Page, los componentes mantendrán su estado final ya revelado, mostrándose de forma estática e inmediata sin re-ejecutar animaciones.
  - *Ubicuo:* En contenedores que agrupen múltiples tarjetas o unidades equivalentes (sección de servicios, pasos del proceso de diagnóstico, carrusel de destacados), el sistema debe ejecutar la revelación de los elementos de forma escalonada (*stagger* con intervalo de **0.1 a 0.2 segundos** entre elementos consecutivos), evitando la aparición en bloque simultáneo.
  - *Opcional:* Donde la preferencia de reducción de movimiento esté activa, el sistema debe desplegar todos los contenidos de forma inmediata con opacidad total y sin desfase de tiempo.

---

### Módulo F: Armonización Visual del Pie de Página (Footer) y Créditos

- **RF-06 (Depuración Cromática y Firma Institucional):**
  - *Ubicuo:* El sistema debe erradicar cualquier tono azul o remanente cromático desalineado en el fondo, textos, bordes e iconos del Footer, unificándolo con la superficie mineral oscura (`#0a0a0a` / `#111111`) y los acentos en naranja técnico (`#ea580c`).
  - *Ubicuo:* El sistema debe incorporar en la franja inferior de cierre de página la mención explícita: **"Desarrollada por GEPI SOFTWARE"**.
  - *Ubicuo:* La mención de desarrollo debe presentarse con tipografía técnica monoespaciada de menor tamaño y tono atenuado (`#a1a1aa`), integrando en "GEPI SOFTWARE" un enlace apuntando a `https://www.gepisoftware.com` que abrirá en la **misma pestaña (`target="_self"`)**, evitando bloqueos por filtros de pop-ups del navegador.

---

### Módulo G: Reestructuración de Llamadas a la Acción (CTAs) Inferiores y Flotantes

- **RF-07 (Canalización Primaria al Catálogo, Barra Móvil con Borde Perimetral y Ancho Exacto):**
  - *Basado en estado:* Mientras el usuario navegue en un dispositivo móvil con ancho de pantalla inferior a **768px** (`< 768px`) y se encuentre estrictamente en la ruta de la **Landing Page (`pathname === '/'`)**, el sistema debe presentar una barra de navegación fija anclada en la parte inferior de la pantalla (*sticky bottom bar*) y retirar la burbuja flotante tradicional de WhatsApp.
  - *Ubicuo:* Para evitar solapamientos con el Footer en condiciones normales o ante zoom de accesibilidad, la barra móvil debe suscribirse a un **`ResizeObserver`** que calcule su altura real renderizada en el DOM y la inyecte dinámicamente en una variable CSS global (`--bottom-bar-height`). El layout inyectará condicionalmente en `pathname === '/'` el relleno compensatorio: `padding-bottom: calc(var(--bottom-bar-height, 64px) + env(safe-area-inset-bottom))`.
  - *Ubicuo:* La barra fija inferior móvil debe configurarse con una altura mínima flexible de **64px (`min-h-[64px]`)**, superficie en negro translúcido (`rgba(0, 0, 0, 0.80)`) con desenfoque de fondo (*backdrop-filter blur* / `backdrop-blur-md`), delimitación superior mediante un **borde perimetral translúcido de 1px (`border-t border-white/10`)**, espaciado perimetral lateral de **16px (`px-4`)**, espaciado interno (*gap*) de **8px a 12px**, y relleno de área segura: `padding-bottom: env(safe-area-inset-bottom)`, garantizando que los **44px de altura útil interactiva de los botones no se compriman**.
  - *Ubicuo:* En la barra fija móvil, el botón de acceso directo a WhatsApp debe poseer un **ancho exacto e inmutable de 48px (`w-12`)** y contener única y exclusivamente el **isotipo de WhatsApp perfectamente centrado (sin texto)**, asegurando el área táctil mínima de 44x44px exigida en RNF-03 con estilo secundario (*outline* verde o fondo oscuro con isotipo verde).
  - *Ubicuo:* En la barra fija móvil, el botón de acción principal **"Ir al catálogo"** debe expandirse ocupando todo el ancho restante disponible (`flex-1`), configurado con estilo sólido de máximo contraste y con el componente de animación (*shimmer* y flecha direccional activa).
  - *Basado en estado:* Mientras el usuario ingrese a las rutas del **Catálogo (`/catalogo`)** o a rutas institucionales secundarias (`/garantia`, `/politicas`, `/servicios`, `/empresa`), el sistema debe **ocultar la barra móvil fija**. En rutas secundarias se renderizará el botón flotante circular tradicional de WhatsApp en la esquina inferior derecha; en el Catálogo, prevalecerán las acciones comerciales de cotización y carrito.
  - *Basado en estado:* Mientras el usuario navegue en pantallas amplias de escritorio (`>= 768px`), el sistema debe ubicar el acceso directo a WhatsApp como una burbuja flotante en la esquina inferior derecha, y situar la acción de "Ir al catálogo" como el cierre de máxima prominencia visual al final de cada sección clave.

---

### Módulo H: Adaptación Integral del Catálogo Público

- **RF-08 (Consistencia Técnica en Grilla 1:1 y Jerarquía Semántica de Badges):**
  - *Ubicuo:* El sistema debe aplicar el lenguaje estético oscuro canónico (definido en el Apéndice) a todos los componentes de la vista pública del catálogo de repuestos (consola de búsqueda, selectores de filtrado, grilla de productos, fichas de detalle y cajón lateral de cotizaciones).
  - *Ubicuo:* El sistema debe alojar las tarjetas de repuestos sobre superficies oscuras (`#111111`) delimitadas por bordes finos translúcidos de 1px (`rgba(255, 255, 255, 0.10)`).
  - *Dirigido por eventos:* Al posicionar el cursor (*hover*) sobre una tarjeta del catálogo, el sistema debe proyectar un resplandor perimetral sutil (*box-shadow glow* blanco al 5% de opacidad) e incrementar la opacidad del borde translúcido de **10% a 25%**, sin aplicar traslaciones físicas verticales (`translateY`) para evitar saltos en la cuadrícula.
  - *Ubicuo:* Para estandarizar la atmósfera de la grilla visual e impedir desalineaciones de altura, **todas las tarjetas de repuestos** deben alojar la fotografía dentro de un contenedor oscuro neutro (`#1c1c1e`) con relación de aspecto estrictamente cuadrada (**`aspect-square` / 1:1**) y un marco interno (*padding*) uniforme de **16px**:
    - Las fotografías con **fondo transparente** flotarán de forma natural sobre la superficie `#1c1c1e`.
    - Las fotografías con **fondo blanco opaco** utilizarán ajuste de escala proporcional (`object-contain`) llenando el área interior del contenedor con bordes sutilmente redondeados (`rounded-md`), integrándose como una ficha técnica tipo "polaroid instrumental", descartando cualquier modo de mezcla destructivo (`mix-blend-mode: multiply`) para proteger al 100% el brillo metálico y los acabados del inyector.
    - Donde un repuesto **carezca de fotografía en la base de datos (`imagen_url === null` o vacía)** o falle la carga de la imagen, el sistema renderizará por defecto dentro de la caja `#1c1c1e` el **isotipo vectorial técnico monocromático de Laboratorio Diésel** con una opacidad estricta de **`opacity-20`**, estandarizando de manera uniforme el tratamiento visual ante ausencias de imagen y errores de red sin competir con los datos técnicos.
  - *Ubicuo (Jerarquía Semántica de Badges):* El sistema debe diferenciar cromáticamente la condición física del componente mediante etiquetas sobrias de alta legibilidad:
    - **Condición "Nuevo":** Borde y texto en **Naranja Técnico (`#ea580c`)** sobre fondo oscuro atenuado, denotando componente original de fábrica a estrenar.
    - **Condición "Reacondicionado":** Borde y texto en **Gris Metalizado Técnico (`#71717a` / zinc-500)** o ámbar neutro sobre fondo oscuro atenuado, comunicando de manera instantánea que se trata de un componente calibrado en banco de pruebas con tolerancias OEM.

---

### Módulo I: Refinamiento Ergonómico del Panel de Administración

- **RF-09 (Optimización Operativa, Tabular y Seguridad con Validación Tipada):**
  - *Ubicuo:* El sistema debe operar el Panel de Administración estrictamente en **Tema Claro (Light Mode)**, configurando un fondo neutro claro (`#f9fafb`), superficies en blanco puro (`#ffffff`) y tipografías en grises oscuros de alto contraste (`#111827`), desacoplado deliberadamente del tema oscuro publicitario de la Landing Page.
  - *Ubicuo:* El sistema debe implementar cabeceras de tabla fijas (*sticky headers*) en las vistas de inventario y listados de repuestos con densidad de fila media (`py-3` a `py-4`) y **fondo 100% opaco (`#ffffff`)**, garantizando que los encabezados permanezcan siempre visibles durante el desplazamiento vertical, bloqueen visualmente el texto de las filas que pasan por debajo y queden claramente demarcados mediante una línea de sombra inferior estricta (`box-shadow: 0 1px 0 rgba(0, 0, 0, 0.10)`).
  - *Ubicuo:* El sistema debe formatear los códigos alfanuméricos técnicos (números de parte, códigos OEM primarios y secundarios) con tipografía monoespaciada de ancho uniforme y alto contraste para facilitar la inspección veloz sin fatiga ocular.
  - *Ubicuo:* El sistema debe aplicar una diferenciación visual jerárquica estricta e inequívoca en los botones de acción del panel:
    - **Acciones Primarias (Crear, Guardar Cambios):** Botón sólido destacado en naranja técnico (`#ea580c`) con respuesta interactiva en hover formalizada en `--admin-btn-primary-hover: #c2410c`.
    - **Acciones Secundarias (Cancelar, Volver, Filtrar):** Botón de contorno (*outline*) o tono neutro gris.
    - **Acciones Destructivas (Eliminar Repuesto, Desactivar):** Botón con tono de alerta rojo (`#dc2626`). Para confirmar la eliminación definitiva de un repuesto, el sistema debe desplegar un **Modal personalizado de la UI** donde el botón de confirmación iniciará deshabilitado, requiriendo obligatoriamente que el operador escriba de forma exacta la palabra **"ELIMINAR"** (validación estrictamente *case-sensitive* aplicando `.trim()` para depurar espacios accidentales).
    - *Dirigido por eventos:* El evento `onSubmit` del modal interceptará la tecla `Enter`, procediendo al borrado **exclusivamente si la validación del texto es exactamente idéntica a "ELIMINAR"**; ante cualquier discrepancia, bloqueará la propagación del evento (`e.preventDefault()`).
    - *Ubicuo:* El campo de texto de confirmación destructiva debe bloquear la intervención del teclado virtual y gestores de contraseñas mediante los atributos mandatorios: `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="characters"` y `spellCheck="false"`.
  - *Ubicuo:* El sistema debe estructurar los formularios de alta y edición de repuestos mediante agrupaciones temáticas diferenciadas (separando "Datos Técnicos de Inyección" de "Precios, Stock e Imágenes") con márgenes y espaciados internos amplificados que prevengan la captura errónea de datos.

---

## 5. Requisitos No Funcionales (RNF)

- **RNF-01 (Accesibilidad Visual WCAG AA):** Toda combinación de texto y fondo en la Landing Page, Catálogo y Panel de Administración debe garantizar una relación de contraste mínima de 4.5:1 para texto normal y de 3:1 para encabezados de gran escala.
- **RNF-02 (Conformidad con Preferencia de Movimiento Reducido):** Toda animación infinita, efecto de *shimmer*, desplazamiento horizontal continuo (*marquee*) y entrada en scroll debe desactivarse de forma inmediata e integral cuando el entorno del usuario informe `prefers-reduced-motion: reduce`, ofreciendo una experiencia funcional equivalente y estática.
- **RNF-03 (Ergonomía Táctil y Cero Fatiga en Administración):** Las áreas de captura e interacción en la Landing, Catálogo y Panel de Administración deben asegurar un área táctil mínima de 44x44px para evitar pulsaciones erróneas y garantizar una densidad tabular legible que no requiera desplazamiento horizontal para acceder a las acciones principales de la fila.
- **RNF-04 (Rendimiento a 60 FPS y Pipeline Zod + Sharp Innegociable — Principios 2 y 3):** Las animaciones no deben generar caídas por debajo de 60 fps. Conforme a los **Principios 2 (Fail-Fast) y 3 (Upload Paranoico)**:
  - Todo archivo binario subido en el endpoint se valida en la frontera con un **schema Zod** interceptando `req.file`: verifica formato MIME permitido (`image/jpeg`, `image/png`, `image/webp`) y tamaño bruto de entrada de hasta **8 MB (`size <= 8000000 bytes`)**. Dato inválido o que supere los 8 MB → código HTTP 400 instantáneo sin tocar la lógica de negocio ni invocar a Sharp.
  - **Ningún archivo elude a Sharp:** Incluso si una imagen subida ya se encuentra en formato `.webp` y pesa menos de 500 KB, el pipeline de Sharp la re-procesará obligatoriamente. Redimensionará la imagen a un ancho máximo de **1080px** (preservando su relación de aspecto original), **descartará obligatoriamente los perfiles de color ICC incrustados y normalizará el espacio de color a sRGB**, descartará de forma absoluta toda metadata EXIF y cualquier payload incrustado, reemplazará el nombre original por un identificador UUID v4 (`<uuid>.webp`) y comprimirá dinámicamente la calidad de salida hasta asegurar que el peso final en disco cumpla el límite constitucional estricto de **`<= 500 KB`**.
- **RNF-05 (Volatilidad de Estado en Cliente vs. Persistencia Autorizada):** La retención de datos de formularios en la memoria del cliente ante incidencias de transporte, desconexiones o expiración de sesión es puramente una optimización de experiencia de usuario (UX) efímera y volátil. Si el operador recarga voluntariamente la página (`F5`), el estado en memoria se destruye, rigiendo de forma irrestricta el **Principio 5 de la Constitución** (la base de datos PostgreSQL es la única fuente de verdad autoritativa).

---

## 6. Casos Límite y Contingencias

1. **Orientación Horizontal en Móviles (*Landscape*) y Evento Blur:** Si la altura del viewport es inferior a 450px (`< 450px`) o se detecta orientación horizontal mediante media query, la barra inferior fija se ocultará automáticamente para liberar espacio de lectura vertical. Al desenfocar el teclado virtual (`blur`), el sistema reevaluará dinámicamente `window.innerHeight`; si la altura continúa siendo inferior a 450px por permanecer en apaisado, la barra permanecerá oculta.
2. **Desplazamiento Ultrarrápido (*Fast Scrolling* / Teclas `Page Down` / `End`):** Si el usuario se desplaza de forma acelerada hacia el final de la página, los elementos que ya hayan traspasado el viewport cancelarán de inmediato su retraso escalonado (*stagger*), forzando su renderizado instantáneo con opacidad total para evitar huecos visuales en blanco.
3. **Zoom de Accesibilidad al 200% y 400% (WCAG 1.4.4):** Los contenedores interactivos y las barras móviles deben emplear unidades relativas (`rem`) y esquemas flexibles con ajuste de línea (`flex-wrap`). Al haber configurado la barra con altura mínima flexible (`min-h-[64px]`) acoplada a un `ResizeObserver`, si el incremento de zoom fuerza a que los botones se apilen verticalmente en múltiples líneas, el contenedor crecerá dinámicamente en altura sin desbordamientos y el layout actualizará su relleno compensatorio en tiempo real.
4. **Comportamiento de Cabeceras Fijas ante Listas Vacías o Errores del Servidor (Principio 6):** La cabecera fija de la tabla de inventario se mantendrá renderizada de forma permanente.
   - Mientras se reciben los datos: se proyectará un esqueleto de carga (*skeleton*).
   - Si la consulta devuelve cero coincidencias: se mostrará el mensaje "Sin resultados coincidentes".
   - Si la consulta a la base de datos falla con un error del servidor (HTTP 500): el cuerpo de la tabla renderizará estrictamente el mensaje constitucional opaco: `"Error del servidor. Referencia: <uuid>"`, protegiendo la cabecera fija y previniendo la exposición de trazas o mensajes técnicos no autorizados.
5. **Navegación Exclusiva por Teclado (`Tab` / `Shift+Tab`):** Todos los botones y enlaces activos deben proyectar un anillo de foco visible de alto contraste al recibir el foco del teclado, deteniendo cualquier animación secundaria que dificulte la lectura del control activo.
6. **Dispositivos sin Aplicación de WhatsApp Instalada:** La llamada a WhatsApp se delegará a la URL estándar `https://wa.me/<numero>`, gestionada por la plataforma de Meta. Si el dispositivo carece de la aplicación nativa y no soporta WhatsApp Web, el navegador desplegará la pantalla de contingencia oficial de Meta. El MVP no desarrollará formularios alternativos de mensajería.
7. **Suspensión de Animaciones por Inactividad de Pestaña (*Page Visibility API*):** Cuando el evento `visibilitychange` del navegador reporte que la pestaña no está visible (`document.hidden === true` o `document.visibilityState === 'hidden'`), el sistema debe pausar de inmediato los bucles de animación del Marquee continuo y del Shimmer para economizar CPU y batería, reanudándolos suavemente al volver al foco activo (siempre que el usuario no haya pausado manualmente el Marquee con el botón toggle accesible).
8. **Ciclo de Sesión Zero-Trust: Refresh Silencioso con `withCredentials` y Modal Bloqueante (Principio 4):**
   - Ante una respuesta HTTP 401, el interceptor HTTP del cliente intentará de forma transparente y en segundo plano un **refresh silencioso de sesión** contra el endpoint `/api/auth/refresh` **incluyendo obligatoriamente `withCredentials: true`** (`credentials: 'include'`) para que el navegador adjunte la cookie segura `HttpOnly`.
   - Si el refresh silencioso es exitoso (nuevo JWT emitido en cookie), la petición original fallida se reintentará de inmediato sin interrumpir al operador.
   - Si el endpoint de refresh devuelve un fallo del servidor (HTTP 500), el cliente no revocará la sesión local ni forzará el modal de login; mostrará un toast de "Error de comunicación temporal" y permitirá reintentar la acción.
   - **Únicamente si el refresh silencioso falla con 401/403 (cookie de refresh revocada o expirada)**, el sistema retendrá el estado del formulario y la referencia de tipo `File` en memoria de React y desplegará el modal de re-autenticación superpuesto estrictamente bloqueante (sin cierre por clic en el fondo ni por tecla `Esc`):
     - Al pulsar el botón de login, este pasará a estado deshabilitado (`disabled: true`) con indicador de carga (*spinner*) para bloquear envíos dobles (*double submit*).
     - Si el operador introduce credenciales inválidas, el modal **permanecerá en pantalla reteniendo el formulario en memoria**, y proyectará un mensaje de error visual dentro del diálogo (con tipografía de alerta roja y resaltado en los campos) permitiendo reintentar el acceso.
     - Tras la autenticación exitosa, el sistema re-empaquetará el `FormData` y re-transmitirá automáticamente la solicitud sin obligar al operador a seleccionar el archivo nuevamente.
9. **Sincronización de Sesión Multi-Pestaña mediante `BroadcastChannel` con Fallback de Storage:** El cliente frontend sincronizará el estado de autenticación a través de la API `BroadcastChannel` (o escuchando el evento `window.addEventListener('storage')` como mecanismo de contingencia en entornos restrictivos). Si el operador cierra sesión o su sesión expira de forma definitiva en la Pestaña A, la Pestaña B detectará instantáneamente el evento, invalidando el estado administrativo sin esperar a que ocurra una petición fallida de red.
10. **Prevención de Pérdida Accidental de Trabajo mediante `beforeunload` (Admin):** Mientras un formulario contenga cambios sin guardar (*dirty state*) o mientras el modal de re-autenticación permanezca visible en pantalla, el sistema activará preventivamente un escucha sobre `window.addEventListener('beforeunload')`. Ante cualquier intento de recarga con `F5` o cierre de pestaña accidental, el navegador disparará el diálogo nativo de confirmación, previniendo la pérdida involuntaria de datos.
11. **Caída Total de Conexión de Red durante el Guardado en Admin (*Network Error*):** Ante una excepción de red local en el cliente (como `ERR_INTERNET_DISCONNECTED` o fallo de DNS sin código HTTP de respuesta), el sistema retendrá el estado completo del formulario y los archivos binarios en memoria (React State), proyectando una notificación flotante de advertencia ("Error de conexión de red"). El operador podrá aguardar la reconexión y pulsar nuevamente "Guardar" sin perder el trabajo ingresado.
12. **Secuencia de Validación Fail-Fast Zod vs. Sesión (Principio 2):** La validación con Zod opera estrictamente en el cliente antes de despachar la petición de red. Si los datos ingresados en el formulario son inválidos, el cliente informará los errores de validación de forma inmediata en la interfaz y no emitirá ninguna solicitud de red, posponiendo la detección de expiración de sesión hasta que los campos cumplan con el esquema requerido.
13. **Contrato Constitucional Exacto de Error HTTP 401 (Principio 6: Errores Opacos):** Ante un fallo de sesión en una solicitud protegida, el backend emitirá el código de estado HTTP 401 acompañado única y taxativamente de la carga JSON opaca formalizada en la Constitución: `{ "error": "Referencia: <uuid>" }`, sin filtrar explicaciones ni textos legibles al cliente. El middleware del cliente interceptará el código HTTP 401 para detonar el flujo de refresh silencioso o modal de re-autenticación.

---

## 7. Fuera de Alcance

- Modificación de esquemas de datos relacionales en PostgreSQL o modelos Prisma.
- Modificación de los contratos de endpoints de la API REST o lógica de cotizaciones en el backend.
- Modificación de las políticas comerciales existentes o inserción de datos de catálogo ficticios.
- Definición de tecnologías específicas de implementación de código, librerías accesorias o nombres de archivos fuente (aspectos reservados para el Plan Técnico).

---

## 8. Criterios de Finalización (Definition of Done)

Se considerará formalmente cumplida la especificación de la Fase 010 cuando:
1. El carrusel de marcas aliadas se desplace en bucle infinito de derecha a izquierda a 35s por ciclo mediante CSS puro porcentual (`-50%`), con `min-width: 200vw` dinámico y recálculo en `resize`, gap de 48px, logos de máximo 40x120px en silueta monocromática accesible, bordes desvanecidos, botón toggle de pausa/reanudación accesible por teclado (`:focus-visible` WCAG 2.2.2) con memoria de pausa frente a cambios de pestaña, supresión ante `prefers-reduced-motion` (con ocultamiento de botón), desmontaje ante listados vacíos y pausa en pestaña inactiva.
2. Los botones "Ver Catálogo" del Navbar y del Hero presenten su barrido diagonal a 45° (*shimmer*) con el token canónico `--shimmer-beam` al 25% del ancho en ciclo de 5.2s (4.0s reposo + 1.2s barrido con curva `ease-in-out`), compresión física `scale-[0.98]` en estado activo de escritorio (`:active`), y micro-desplazamiento autónomo de flecha de 0 a 4px en ciclo de 1.5s, pausándose al pasar el cursor, pulsar en pantalla táctil o ante pestaña inactiva.
3. El título "LABORATORIO DIÉSEL" ingrese con *fade-in slide-up* en 0.8s, precediendo al subtítulo "Especialistas en inyección diésel" que correrá con retardo de 800ms, tipeo a 40-60ms/carácter y cursor parpadeante permanente en Naranja Técnico (`#ea580c`).
4. Las fotografías institucionales y de repuestos se muestren a todo color, con degradados localizados de protección de contraste WCAG AA sobre textos; todas las fotos de repuestos se alojarán en cajas `#1c1c1e` cuadradas 1:1 con padding uniforme de 16px, integrando las fotos de fondo blanco como polaroids redondeadas sin `multiply`, proyectando el isotipo vectorial técnico al 20% de opacidad (`opacity-20`) ante ausencias de imagen o errores 404, y diferenciando cromáticamente badges "Nuevo" (Naranja Técnico) de "Reacondicionado" (Gris Metalizado).
5. Los bloques informativos aparezcan suavemente en cascada (*stagger* de 0.1s a 0.2s) con umbral del 10% al hacer scroll, activándose una única vez en el ciclo de vida del DOM y contando con degradación elegante a `opacity: 1` si JavaScript no está activo.
6. El Footer se encuentre libre de tonos azules residuales y exhiba la firma "Desarrollada por GEPI SOFTWARE" con hipervínculo a `https://www.gepisoftware.com` abriendo en la misma pestaña (`_self`).
7. En dispositivos móviles (`< 768px`) y exclusivamente en la Landing Page (`pathname === '/'`), se presente la barra fija inferior translúcida con borde superior `border-white/10`, altura mínima flexible `min-h-[64px]` acoplada a `ResizeObserver`, desenfoque, compensación de safe-area sin compresión de botones y relleno compensatorio dinámico de layout (botón WhatsApp icónico de 48px exactos y botón Catálogo en `flex-1`), ocultándose en horizontal.
8. El Catálogo adopte la atmósfera técnica oscura con resplandor en *hover*, y el Panel de Administración opere en Tema Claro con cabeceras fijas opacas demarcadas por sombra, códigos de alta legibilidad, sincronización multi-pestaña por `BroadcastChannel`/storage, protección preventiva contra recargas involuntarias mediante `beforeunload`, refresh silencioso JWT con `withCredentials: true` y fallback a modal bloqueante de re-autenticación con preservación de binarios y manejo de credenciales erróneas, retención ante caídas de red pura, confirmación tipada con palabra "ELIMINAR" (*case-sensitive* + *trim* y control de `Enter`), manejo opaco de errores 500 y validación preventiva Zod en frontera hasta 8 MB comprimiendo con Sharp a `<= 500 KB` con purga innegociable de perfiles ICC.

---

## 9. Dudas Abiertas

- *Todas las ambigüedades, contradicciones, casos límite y posibles desalineaciones con la Constitución identificadas durante las nueve rondas de auditoría de QA fueron analizadas, resueltas e incorporadas en su totalidad en esta versión.*  
- Estado actual de dudas abiertas: **Ninguna duda abierta pendiente.**

---

## 10. Apéndice: Design Tokens Canónicos (Fuente de Verdad SDD)

Para dar estricto cumplimiento al **Principio 1 de la Constitución (SDD-First)**, se establecen los valores canónicos del sistema de diseño para la plataforma, erradicando los tonos azules en favor del **Naranja Industrial/Técnico**:

### 10.1 Tokens del Entorno Público (Landing Page y Catálogo — Modo Oscuro Premium)

| Token Canónico | Valor Hex / RGBA | Aplicación en la Interfaz |
| :--- | :--- | :--- |
| `--surface-canvas` | `#0a0a0a` | Fondo base inerte de la página y estructura perimetral. |
| `--surface-card` | `#111111` | Fondo de tarjetas de repuestos, bloques modulares y contenedores. |
| `--surface-media` | `#1c1c1e` | Fondo de cajas contenedoras cuadradas (1:1) de fotos de repuestos. |
| `--border-subtle` | `rgba(255, 255, 255, 0.10)` | Divisiones de 1px entre tarjetas, líneas de navegación y borde superior de barra móvil. |
| `--border-hover` | `rgba(255, 255, 255, 0.25)` | Realce lumínico perimetral de tarjeta al pasar el cursor (*hover*). |
| `--shimmer-beam` | `rgba(255, 255, 255, 0.15)` | Haz de luz diagonal a 45° en botones de captación de atención. |
| `--text-primary` | `#f3f4f6` | Títulos principales, códigos de parte destacados y llamadas a la acción. |
| `--text-muted` | `#a1a1aa` | Subtítulos técnicos, especificaciones secundarias y créditos de footer. |
| `--accent-action` | `#ea580c` | **Naranja Industrial / Calor Diésel:** Botón principal ("Ver Catálogo"), foco activo y badge "Nuevo". |
| `--accent-hover` | `#f97316` | Estado activo y hover de botones principales. |
| `--badge-refurbished` | `#71717a` | **Gris Metalizado Técnico:** Borde y texto para condición "Reacondicionado". |
| `--channel-support` | `#22c55e` | Isotipo y detalles del canal de WhatsApp. |

### 10.2 Tokens del Entorno Operativo (Panel de Administración — Modo Claro SaaS)

| Token Canónico | Valor Hex / RGBA | Aplicación en la Interfaz |
| :--- | :--- | :--- |
| `--admin-bg` | `#f9fafb` | Fondo general de la consola administrativa y áreas de visualización. |
| `--admin-surface` | `#ffffff` | Fondo de tablas de inventario (100% opaco para sticky headers), tarjetas y modales. |
| `--admin-border` | `#e5e7eb` | Líneas divisorias de filas de tablas y bordes de inputs de formulario. |
| `--admin-header-shadow` | `0 1px 0 rgba(0, 0, 0, 0.10)` | Demarcación de sombra inferior de la cabecera fija de la tabla. |
| `--admin-text-main` | `#111827` | Texto principal de datos, encabezados y códigos alfanuméricos OEM. |
| `--admin-text-sub` | `#4b5563` | Rótulos de campos de formulario y metadatos secundarios. |
| `--admin-btn-primary` | `#ea580c` | Botones de acciones principales (Guardar, Crear Repuesto). |
| `--admin-btn-primary-hover` | `#c2410c` | Estado activo y hover de botones primarios en el Admin. |
| `--admin-btn-secondary` | `#6b7280` | Botones secundarios en formato outline o tono neutro (Cancelar, Volver). |
| `--admin-btn-danger` | `#dc2626` | Botones de acciones destructivas (Eliminar, Desactivar) previo a modal. |

### 10.3 Tokens Canónicos de Breakpoints Adaptativos

| Token Canónico | Ancho Mínimo de Pantalla | Comportamiento y Disposición de Layout |
| :--- | :--- | :--- |
| `--breakpoint-sm` | `640px` | Dispositivos móviles amplios y orientación vertical compacta. |
| `--breakpoint-md` | `768px` | **Límite Canónico:** Umbral de transición entre la barra inferior fija móvil y la barra de navegación/CTA de escritorio. |
| `--breakpoint-lg` | `1024px` | Pantallas de escritorio estándar, consolas y tabletas en orientación horizontal. |
| `--breakpoint-xl` | `1280px` | Pantallas de escritorio amplias y grilla de catálogo a 4 columnas. |
| `--breakpoint-2xl` | `1536px` | Monitores de alta resolución y pantallas panorámicas *ultrawide* (1440p / 4K). |
