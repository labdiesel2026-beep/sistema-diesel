# Spec 002 — Landing Page y Sección Institucional

**Fase:** 2 de 4  
**Alcance:** Vista Pública Principal — Presentación Institucional y Contacto  
**Autores:** Equipo GEPI  
**Estado:** BORRADOR v1  
**Documentos de referencia:**  
- [SRS.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/SRS.md)  
- [constitution.md](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/docs/constitution.md)  
- [Spec 001 — Lovable Detox](file:///c:/Users/Usuario/Desktop/GEPI%20SOFTWARE%20-%20TRABAJOS/inyectores-diesel/InyectoresDiesel/specs/001-lovable-detox/spec.md) (base de código sobre la que se construye)

---

## 1. Contexto y Objetivo

### 1.1 Situación Actual

Tras la reestructuración de la Spec 001, el proyecto cuenta con una aplicación TanStack Start limpia, compilable y testeable, con rutas stub (`/`, `/catalogo`, `/servicios`, `/admin`) y componentes UI de shadcn/ui listos para usar. La ruta `/` actualmente renderiza un componente placeholder (`diesel-site.tsx`) sin contenido institucional real.

### 1.2 Objetivo

Construir la **vista pública principal** de Laboratorio Diésel como una **single-page con scroll suave** en la ruta `/`. Esta página funciona como carta de presentación digital del taller: comunica quiénes son, qué hacen, dónde están y cómo contactarlos. Todo el contacto comercial, de turnos y de posventa se canaliza exclusivamente a través de WhatsApp.

### 1.3 Relación con el SRS

Esta spec implementa los requisitos **5.1.1**, **5.1.2**, **5.1.3** y **5.1.4** del SRS, los casos de uso **CU-01** (Explorar Landing, Mapa y Políticas) y **CU-03** (Solicitar Garantía vía WhatsApp), y los requisitos no funcionales **RNF-02** (Responsive Mobile-First) y **RNF-03** (Identidad Visual en tonos azules).

### 1.4 Nota sobre la Base de Código

Esta spec se construye **sobre la UI y las rutas existentes** heredadas de la Spec 001. No se reescribe la aplicación desde cero; se extiende y se reemplaza el contenido placeholder de la ruta `/` con las secciones institucionales especificadas aquí.

### 1.5 Cambios sobre Rutas Existentes

La ruta stub `src/routes/servicios.tsx` creada durante la Spec 001 deberá ser **eliminada**. Los servicios se presentan como una sección áncora (`#servicios`) dentro de la Landing Page en la ruta `/`. Mantener ambas generaría una ruta huérfana y confusión en el router.

### 1.6 Exenciones Constitucionales

| Regla | Aplica | Justificación |
|:---|:---|:---|
| Constitución #2 — Fail-Fast (Zod) | **No aplica en esta spec** | El formulario de contacto (RF-06) es estrictamente frontend: no envía datos a ningún endpoint backend. Su única acción es componer una URL `wa.me` y abrir WhatsApp. La validación se realiza client-side con restricciones de longitud y `trim()`. Zod se aplicará cuando existan endpoints que reciban datos en fases posteriores. |

---

## 2. Usuarios

| Actor | Descripción | Relación con esta spec |
|:---|:---|:---|
| **Cliente Final (Visitante)** | Usuario público no autenticado. Mecánicos, transportistas, particulares que buscan información sobre el taller, sus servicios y cómo contactarlo. | Usuario primario. Navega toda la Landing Page y utiliza los puntos de contacto vía WhatsApp. |
| **Administrador** | Propietario de Laboratorio Diésel. | No interactúa directamente con la Landing en esta spec. Los contenidos son estáticos/hardcodeados. Reemplazará el texto placeholder de garantías antes de producción. |

---

## 3. Historias de Usuario

**HU-01:** Como cliente potencial, quiero ver una presentación profesional del taller al ingresar al sitio web para evaluar si es un proveedor confiable de inyectores y servicios diésel antes de contactarme.

**HU-02:** Como mecánico o transportista, quiero conocer el listado de servicios que ofrece el taller para saber si pueden resolver mi necesidad técnica específica (reparación, calibración, diagnóstico, etc.).

**HU-03:** Como cliente que ya compró un repuesto, quiero leer las políticas de garantía y poder iniciar un reclamo directamente por WhatsApp para agilizar la gestión de posventa sin llamadas telefónicas.

**HU-04:** Como visitante desde el interior del país, quiero ver la ubicación exacta del taller en un mapa para planificar mi visita o evaluar opciones de envío.

**HU-05:** Como cliente interesado, quiero completar un formulario de contacto con mi nombre y consulta y que eso me abra WhatsApp con un mensaje armado, para no tener que redactar el mensaje manualmente.

**HU-06:** Como visitante que navega desde el celular, quiero que la página se vea correctamente y sea fácil de usar en pantalla chica para poder consultar servicios y contactarme incluso desde la ruta o el taller mecánico.

---

## 4. Requisitos Funcionales

### RF-01 — Barra de navegación fija con enlaces áncora

**CUANDO** el visitante acceda a la ruta `/`, el sistema deberá mostrar una barra de navegación fija en la parte superior de la pantalla que contenga:

1. La denominación tipográfica "Laboratorio Diésel" como enlace al inicio de la página.
2. Enlaces áncora a cada sección de la Landing: Inicio, Servicios, Garantías, Ubicación, Contacto.
3. Un enlace de navegación al Catálogo (`/catalogo`) claramente diferenciado (botón o estilo destacado).

**Criterios de aceptación:**
- La barra de navegación permanece visible (posición fija) al hacer scroll en toda la página.
- Al hacer clic en un enlace áncora, la página se desplaza suavemente (smooth scroll) hasta la sección correspondiente.
- El enlace al catálogo navega a la ruta `/catalogo` mediante navegación client-side.
- En pantallas con ancho inferior a 768px (breakpoint `md` de Tailwind), la barra colapsa en un menú hamburguesa que despliega los mismos enlaces.
- Si la URL contiene un hash (ej. `/#contacto`), al cargar la página el sistema deberá hacer scroll automático a la sección correspondiente.

---

### RF-02 — Sección Hero (Inicio / Presentación)

**CUANDO** el visitante cargue la página, el sistema deberá mostrar como primera sección visible un bloque Hero que comunique:

1. La denominación tipográfica del taller: "Laboratorio Diésel".
2. El eslogan estático: **"Especialistas en inyección diésel"**.
3. Los textos de propuesta de valor provistos por el cliente: **"Más de 20 años en el rubro"** y **"Equipamiento de última generación para la reparación y calibración de bombas e inyectores"**.
4. Un llamado a la acción (CTA) principal que dirija al catálogo de productos.
5. Un llamado a la acción secundario que lleve a la sección de contacto (scroll a `#contacto`).

**Criterios de aceptación:**
- El Hero ocupa al menos el viewport completo (`100dvh`) en la carga inicial. Se usa `dvh` en lugar de `vh` para evitar recorte de contenido en navegadores móviles con barra de dirección dinámica.
- La identidad visual utiliza la paleta de colores azules definida en RNF-01.
- Los CTAs son claramente visibles y accionables tanto en desktop como en móvil.

---

### RF-03 — Sección de Servicios

**CUANDO** el visitante navegue a la sección de servicios (scroll o enlace `#servicios`), el sistema deberá mostrar un listado de los servicios que ofrece el taller.

Los servicios son contenido **estático hardcodeado** en el código fuente. Cada servicio muestra:

1. Un ícono o ilustración representativa.
2. El nombre del servicio.
3. Una descripción breve (1-2 oraciones).

**Criterios de aceptación:**
- Se muestran al menos 4 servicios representativos del taller.
- El contenido de los servicios está hardcodeado como datos constantes en el código, no proviene de base de datos ni de un panel administrable.
- La disposición es responsiva: grilla de tarjetas que se adapta de múltiples columnas (desktop) a una columna (móvil).
- Los textos y nombres de servicios específicos se definirán en la fase de implementación (plan.md), pudiendo usar textos representativos del rubro diésel como placeholder inicial si el cliente no provee los definitivos antes del desarrollo.

---

### RF-04 — Sección de Garantías y Políticas Comerciales

**CUANDO** el visitante navegue a la sección de garantías (scroll o enlace `#garantias`), el sistema deberá mostrar:

1. Un bloque de texto con las políticas comerciales, términos y condiciones de garantía del taller.
2. Un botón de acción "Solicitar Garantía / Soporte" que redirija a WhatsApp con un mensaje pre-formateado específico para reclamos de posventa.

**Contenido del texto:**
- En esta fase, el texto de garantías será un **placeholder estático** con estructura realista (ej. "La garantía cubre defectos de fabricación por [X] días...") que el propietario reemplazará con el texto definitivo antes del despliegue a producción.
- El texto debe estar centralizado en un único lugar del código para facilitar su reemplazo.

**Mensaje pre-formateado de WhatsApp para garantías:**
```
Hola, me contacto desde la web de Laboratorio Diésel.
Motivo: Consulta por garantía / soporte post-venta.
```

**Criterios de aceptación:**
- La sección muestra el texto de garantías de forma legible y bien formateada.
- El botón de garantía abre la URL de WhatsApp (`https://wa.me/<NUMERO>?text=<MENSAJE_ENCODED>`) en una nueva pestaña o en la app de WhatsApp del dispositivo.
- El número de WhatsApp del taller está definido como una constante centralizada (no hardcodeado en múltiples lugares), para facilitar su modificación.
- El mensaje llega pre-formateado al chat de WhatsApp del taller. El cursor queda posicionado al final del mensaje para que el usuario agregue detalles antes de enviar.

> **Nota sobre mensajes pre-formateados:** En todos los mensajes de WhatsApp de esta spec, el texto se envía tal cual al chat. No se incluyen placeholders literales; el cursor del usuario queda al final del mensaje para que escriba libremente antes de enviar.

---

### RF-05 — Sección de Ubicación (Mapa)

**CUANDO** el visitante navegue a la sección de ubicación (scroll o enlace `#ubicacion`), el sistema deberá mostrar:

1. La dirección física del taller: **Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis**.
2. Un mapa interactivo embebido (iframe de Google Maps) centrado en la ubicación del local.
3. Los horarios de atención: **Lunes a Viernes de 9:00 a 18:00 h**.

**Criterios de aceptación:**
- El mapa se carga como un iframe de Google Maps Embed sin requerir API Key paga (modo embed básico).
- El mapa es interactivo: el visitante puede hacer zoom y moverse dentro del iframe.
- El mapa se adapta responsivamente al ancho del contenedor sin desbordarse ni cortarse.
- Si la carga del iframe falla (conexión lenta, bloqueador), se muestra la dirección en texto como fallback visible.

---

### RF-06 — Sección de Contacto con Formulario → WhatsApp

**CUANDO** el visitante navegue a la sección de contacto (scroll o enlace `#contacto`), el sistema deberá mostrar:

1. Un formulario de contacto con los siguientes campos:
   - **Nombre** (obligatorio, texto libre).
   - **Teléfono o Email** (obligatorio, texto libre — el visitante elige qué dato compartir).
   - **Mensaje** (obligatorio, textarea).
2. Un botón de envío que componga un mensaje de WhatsApp con los datos del formulario y abra la URL de la API de WhatsApp.

**Validaciones del formulario:**
- Todos los campos se procesan con `.trim()` antes de validar (los espacios en blanco al inicio y final no cuentan como contenido).
- Todos los campos son obligatorios. El sistema impide el envío si alguno está vacío tras el `trim()`.
- Nombre: mínimo 2 caracteres, máximo 100 caracteres.
- Teléfono o Email: mínimo 5 caracteres, máximo 100 caracteres. No se valida formato específico (puede ser teléfono o email).
- Mensaje: mínimo 10 caracteres, máximo 1000 caracteres.
- Los mensajes de error de validación se muestran inline junto a cada campo.

**Mensaje pre-formateado de WhatsApp para contacto:**
```
Hola, me contacto desde la web de Laboratorio Diésel.
Nombre: {nombre}
Contacto: {teléfono/email}
Consulta: {mensaje}
```

> Los valores entre llaves `{}` representan la sustitución dinámica de los campos del formulario. No se envían como texto literal.

**El formulario NO persiste datos** en base de datos ni en ningún backend. Es exclusivamente un compositor de mensaje de WhatsApp.

**Criterios de aceptación:**
- El formulario impide el envío si hay campos vacíos o que no cumplen las restricciones de longitud (post-`trim()`), mostrando errores inline.
- Al presionar "Enviar", el sistema abre `https://wa.me/<NUMERO>?text=<MENSAJE_ENCODED>` con los datos del formulario.
- El formulario se limpia inmediatamente al hacer submit (on-click), sin esperar confirmación de la apertura de WhatsApp.
- El número de WhatsApp reutiliza la misma constante centralizada de RF-04.
- En móvil, el formulario es usable sin necesidad de zoom ni scroll horizontal.

---

### RF-07 — Botón flotante de WhatsApp (consulta general / turnos)

**CUANDO** el visitante esté en cualquier punto de la Landing Page, el sistema deberá mostrar un botón flotante de WhatsApp visible de forma permanente (posición fija en la esquina **inferior derecha**).

**Mensaje pre-formateado de WhatsApp para consulta general:**
```
Hola, me contacto desde la web de Laboratorio Diésel.
Motivo: Consulta general / solicitar turno.
```

**Criterios de aceptación:**
- El botón es visible en todas las secciones de la Landing sin obstruir contenido crítico.
- El botón abre `https://wa.me/<NUMERO>?text=<MENSAJE_ENCODED>` en nueva pestaña o app.
- El botón tiene un ícono reconocible de WhatsApp.
- En móvil, el botón no se superpone con la barra de navegación, ni con los CTAs del formulario de contacto (RF-06), ni con el botón de garantía (RF-04). Si hay riesgo de solapamiento en viewport pequeño, el botón flotante se oculta temporalmente cuando la sección `#garantias` o `#contacto` esté visible en pantalla.
- El número de WhatsApp reutiliza la misma constante centralizada de RF-04 y RF-06.

---

### RF-08 — Footer institucional

**CUANDO** el visitante llegue al final de la Landing Page, el sistema deberá mostrar un footer con:

1. La denominación tipográfica "Laboratorio Diésel" y el año actual.
2. La dirección del taller (reutilizando la constante centralizada de RNF-06).
3. Los enlaces áncora a las secciones de la página (duplicando la navegación del header para accesibilidad).
4. Enlace al catálogo (`/catalogo`).

**Criterios de aceptación:**
- El footer se renderiza al final de la página, después de todas las secciones.
- Los enlaces áncora del footer realizan scroll suave igual que los del header.
- El año se calcula dinámicamente (no hardcodeado).
- La dirección y el número de WhatsApp provienen de las constantes centralizadas (RNF-06), no se hardcodean en el componente del footer.

---

## 5. Requisitos No Funcionales

| ID | Categoría | Requisito |
|:---|:---|:---|
| **RNF-01** | Identidad Visual | La Landing Page deberá emplear la paleta de colores en tonos azules, neutros y blancos definida en el SRS (RNF-03). La paleta base utilizará clases estándar de Tailwind: `blue-600` como color primario, `blue-700`/`blue-800` para hover y acentos, `slate-900` para fondos oscuros, `slate-50`/`white` para fondos claros, y `slate-600` para texto secundario. La estética debe transmitir profesionalismo, limpieza técnica y confiabilidad. |
| **RNF-02** | Diseño Responsivo (Mobile-First) | La Landing Page deberá diseñarse con enfoque Mobile-First y adaptarse correctamente a smartphones (≥ 320px), tablets y monitores de escritorio, cumpliendo el SRS (RNF-02). |
| **RNF-03** | Rendimiento de carga | La Landing Page deberá cargar y ser interactiva (LCP) en menos de 3 segundos bajo conexión 4G estándar. Las imágenes deberán optimizarse en formato WebP o equivalente. |
| **RNF-04** | Accesibilidad básica | Las imágenes deberán tener atributos `alt` descriptivos. Los botones y enlaces deberán ser navegables por teclado. Los contrastes de texto deberán cumplir un ratio mínimo de 4.5:1 (WCAG AA). |
| **RNF-05** | SEO básico | La página deberá incluir: un `<title>` descriptivo, una `<meta description>` relevante, una estructura semántica de encabezados (`<h1>` único, jerarquía `<h2>`/`<h3>`), y datos de contacto accesibles para crawlers. |
| **RNF-06** | Centralización de datos de contacto (Configuración Inmutable) | El número de WhatsApp, la dirección física y los horarios del taller deberán estar definidos como **constantes de configuración inmutable** en un único archivo del código, reutilizadas por todos los componentes que las necesiten (formulario, botones, mapa, footer). Estos datos son configuración estática del MVP, no estado de negocio mutable, por lo que no contradicen la Constitución #5 (PostgreSQL como fuente de verdad para estado mutable del sistema). |

---

## 6. Casos Límite

| # | Caso | Comportamiento esperado |
|:---|:---|:---|
| CL-01 | El visitante tiene un bloqueador de iframes activo que impide cargar Google Maps. | Se muestra la dirección en texto plano como fallback visible. El resto de la página sigue funcional. |
| CL-02 | El visitante no tiene WhatsApp instalado en su dispositivo móvil ni WhatsApp Web abierto. | La URL `wa.me` es gestionada por el navegador/OS. Si no hay app disponible, el navegador mostrará su comportamiento por defecto (ofrecerá abrir WhatsApp Web o mostrará error del sistema). No se requiere manejo custom en la app. |
| CL-03 | El visitante intenta enviar el formulario de contacto con campos vacíos o con contenido que no cumple las restricciones de longitud. | El envío se bloquea. Se muestran mensajes de error inline junto a cada campo inválido. No se abre WhatsApp. |
| CL-04 | El visitante ingresa caracteres especiales o emojis en los campos del formulario. | Los caracteres se preservan tal cual y se codifican correctamente con `encodeURIComponent` en la URL de WhatsApp. No se sanitizan ni se rechazan (no hay persistencia en base de datos). |
| CL-05 | El visitante carga la página en un navegador muy antiguo que no soporta scroll-behavior: smooth. | La navegación por áncoras funciona igualmente (salto directo sin animación). No se requiere polyfill. |
| CL-06 | El visitante navega a un ancla inexistente (ej. `/#seccion-falsa`). | La página carga normalmente en la posición inicial. No se muestra error. |
| CL-07 | El mensaje pre-formateado de WhatsApp excede el límite de caracteres de la URL. | Dado que el campo Mensaje tiene un máximo de 1000 caracteres, el mensaje total (incluyendo los demás campos y el template) no debería superar los ~2000 caracteres, muy por debajo del límite práctico de URLs (~8000 caracteres). No se requiere truncamiento. |

---

## 7. Fuera de Alcance

Los siguientes ítems **NO** forman parte de esta especificación:

- ❌ Catálogo de productos, búsqueda y filtrado (será Spec 003 o posterior).
- ❌ Carrito de compras y checkout por WhatsApp (será spec de Catálogo).
- ❌ Panel de Administración y ABM de productos/categorías.
- ❌ Administración dinámica de los servicios mostrados en la Landing (los servicios son hardcodeados).
- ❌ Administración dinámica del texto de garantías desde el panel (es texto estático en código).
- ❌ Persistencia de datos del formulario de contacto en base de datos.
- ❌ Sistema de envío de emails (ni notificaciones al admin, ni confirmación al visitante).
- ❌ Integración con Google Maps API con API Key (se usa iframe embed básico sin costo).
- ❌ Internacionalización / multi-idioma (la Landing es exclusivamente en español).
- ❌ Animaciones complejas, parallax avanzado o microinteracciones elaboradas (se priorizan en una fase de polish posterior si hay tiempo).
- ❌ Blog, sección de novedades o testimonios de clientes.
- ❌ Autenticación de usuarios visitantes (la Landing es 100% pública).
- ❌ Generación de `plan.md` o `tasks.md` (se generan como paso siguiente tras aprobación de esta spec).

---

## 8. Criterios de Finalización (Definition of Done)

La Spec 002 se considera **completada** cuando se cumplen **todos** los siguientes checks:

| # | Check | Método de verificación |
|:---|:---|:---|
| ✅ 1 | La ruta `/` renderiza la Landing Page completa con todas las secciones. | Navegación manual en el browser. |
| ✅ 2 | La barra de navegación está fija y los enlaces áncora hacen scroll suave a cada sección. | Clic en cada enlace del menú y verificación visual del desplazamiento. |
| ✅ 3 | La sección Hero muestra el nombre del taller, propuesta de valor y CTAs funcionales. | Verificación visual y clic en los CTAs. |
| ✅ 4 | La sección de Servicios muestra al menos 4 servicios con ícono, nombre y descripción. | Verificación visual. |
| ✅ 5 | La sección de Garantías muestra texto placeholder y el botón de WhatsApp abre con mensaje de garantía pre-formateado. | Clic en el botón → verificar mensaje en WhatsApp/WhatsApp Web. |
| ✅ 6 | La sección de Ubicación muestra el iframe de Google Maps funcional y la dirección en texto. | Verificación visual, interacción con el mapa (zoom). |
| ✅ 7 | El formulario de contacto valida campos y, al enviar, abre WhatsApp con el mensaje compuesto. | Intento de envío con campos vacíos (debe bloquear). Envío exitoso → verificar mensaje en WhatsApp. |
| ✅ 8 | El botón flotante de WhatsApp es visible en todo momento y abre con mensaje de consulta general. | Scroll por toda la página, clic en el botón flotante. |
| ✅ 9 | El footer muestra la información requerida y los enlaces son funcionales. | Verificación visual y clic en enlaces. |
| ✅ 10 | La página es completamente responsiva y usable en viewport de 320px (móvil) y 1920px (desktop). | Prueba con DevTools en ambas resoluciones. |
| ✅ 11 | La identidad visual respeta la paleta de tonos azules del SRS. | Verificación visual. |
| ✅ 12 | El número de WhatsApp está definido en una única constante centralizada, reutilizada en todos los puntos de contacto. | Revisión de código: `grep` del número → un solo archivo de definición. |
| ✅ 13 | `npm run dev` y `npm run build` siguen pasando sin errores. | Ejecución de ambos comandos. |
| ✅ 14 | `npx tsc --noEmit` pasa sin errores de tipos. | Ejecución del comando. |
| ✅ 15 | `npm run test` pasa sin regresiones. | Ejecución de los tests existentes. |
| ✅ 16 | La ruta `/servicios` ya no existe como página independiente. | Navegar a `/servicios` → debe mostrar 404 o redirigir a `/#servicios`. |

---

## 9. Dudas Abiertas

| # | Duda | Estado |
|:---|:---|:---|
| DA-01 | ¿Cuál es el número de WhatsApp oficial de Laboratorio Diésel para configurar los enlaces `wa.me`? | **[NECESITA ACLARACIÓN]** — Se usará un placeholder `5491112345678` hasta que el cliente confirme el número real. |
| DA-02 | ¿Cuál es la dirección física exacta del taller para el mapa y el footer? | **[RESUELTO]** — Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis. |
| DA-03 | ¿El cliente tiene un logo o isotipo definido, o se usa exclusivamente la denominación tipográfica "Laboratorio Diésel"? | **[RESUELTO]** — No hay logotipo. Se usa la denominación tipográfica "Laboratorio Diésel". |
| DA-04 | ¿Cuál es la lista definitiva de servicios del taller para la sección de Servicios? | **[NECESITA ACLARACIÓN]** — Se usarán servicios representativos del rubro diésel como placeholder (reparación de inyectores, calibración en banco, diagnóstico electrónico, venta de repuestos) hasta que el cliente confirme la lista real. |
| DA-05 | ¿Los horarios de atención del taller deben mostrarse junto al mapa? De ser así, ¿cuáles son? | **[RESUELTO]** — Sí. Lunes a Viernes de 9:00 a 18:00 h. |
