# Desglose de Tareas Técnicas — Spec 010: Retro-documentación y Refinamiento del Rediseño UI Premium

**Fase:** 010-rediseño-premium  
**Fecha:** 2026-10-22  
**Estado:** Plan de Tareas de Implementación Homologado  
**Basado en:** [specs/010-rediseño-premium/spec.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/010-redise%C3%B1o-premium/spec.md), [specs/010-rediseño-premium/plan.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/010-redise%C3%B1o-premium/plan.md) y [docs/constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md)  

---

## Fase 1: Tokens de Diseño y Fundamentos CSS (Cimientos)

- [x] **TASK-01: Configuración de Variables CSS Canónicas en `src/styles.css`**
  - **Descripción:** Definir formalmente las variables CSS en el bloque `:root` de `src/styles.css` para el entorno oscuro (`--surface-canvas: #0a0a0a`, `--surface-card: #111111`, `--surface-media: #1c1c1e`, `--accent-action: #ea580c`, `--accent-hover: #f97316`, `--shimmer-beam: rgba(255, 255, 255, 0.15)`, `--badge-refurbished: #71717a`, `--border-subtle: rgba(255,255,255,0.10)`) y para el entorno claro del panel admin (`--admin-bg: #f9fafb`, `--admin-surface: #ffffff`, `--admin-border: #e5e7eb`, `--admin-btn-primary: #ea580c`, `--admin-btn-primary-hover: #c2410c`, `--admin-btn-danger: #dc2626`).
  - **Cobertura:** RF-06, RF-08, RF-09, Apéndice 10, Principio 1 (SDD-First).
  - **Hecho cuando:** Al inspeccionar los estilos calculados en el navegador, todas las variables CSS anteriores existen en `:root` y reflejan con precisión los valores Hex/RGBA canónicos.

- [x] **TASK-02: Extensión de Breakpoints y Animaciones en `tailwind.config.js`**
  - **Descripción:** Extender la configuración de Tailwind con la matriz canónica de breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`) y registrar los colores del sistema y los `@keyframes` requeridos (`marquee-half` al `-50%`, `shimmer-slide` en ciclo de 5.2s a 45° y `arrow-oscillate` de 0 a 4px en 1.5s).
  - **Cobertura:** RF-01, RF-02, RF-07, Apéndice 10.3, Principio 1.
  - **Hecho cuando:** La compilación de Tailwind genera sin advertencias las utilidades de color `bg-canvas`, `bg-card`, `bg-media`, `text-industrial`, las clases de animación `animate-marquee`, `animate-shimmer`, `animate-arrow` y reconoce el breakpoint `md` a 768px.

- [x] **TASK-03: Implementación de la Clase Global `js-enabled` para Degradación Elegante**
  - **Descripción:** Modificar el layout raíz (`src/routes/__root.tsx` o plantilla HTML base) para inyectar la clase `js-enabled` en el elemento `<html>` al montar el frontend. Configurar en `src/styles.css` que los estados iniciales de animación de scroll (`opacity: 0; transform: translateY(20px)`) apliquen exclusivamente bajo `.js-enabled .scroll-reveal`, garantizando `opacity: 1` por defecto si falla JavaScript.
  - **Cobertura:** RF-05, Caso Límite 6.
  - **Hecho cuando:** Al deshabilitar JavaScript en el navegador, todos los bloques informativos de la Landing Page son legibles con `opacity: 1`, y al activarlo, el elemento `<html>` contiene la clase `js-enabled`.

---

## Fase 2: Pipeline Seguro de Backend y Contratos de Error (API)

- [x] **TASK-04: Esquema Zod en Frontera para Carga Binaria en `server/src/schemas/upload.schema.ts`**
  - **Descripción:** Crear el esquema Zod `uploadFileSchema` que valide en la frontera del endpoint que `req.file` contenga un `mimetype` permitido (`image/jpeg`, `image/png`, `image/webp`) y que su tamaño entrante no sobrepase los 8 MB (`size <= 8_000_000`).
  - **Cobertura:** RNF-04, Principio 2 (Fail-Fast).
  - **Hecho cuando:** Una prueba unitaria valida que archivos PDF, SVG o con tamaño de 8.1 MB sean rechazados inmediatamente con código HTTP 400 antes de invocar a Sharp.

- [x] **TASK-05: Pipeline Paranoico de Desinfección y Compresión Sharp en `server/src/middleware/upload.middleware.ts`**
  - **Descripción:** Actualizar el middleware de carga para recibir el buffer en memoria de Multer, ejecutar la validación Zod (`uploadFileSchema`), y procesar con Sharp: redimensionar a 1080px de ancho máximo, normalizar el espacio de color a sRGB descartando perfiles ICC y metadatos EXIF, renombrar a UUID v4 (`<uuid>.webp`), y ajustar dinámicamente la compresión WebP hasta asegurar un peso en disco `<= 500 KB`.
  - **Cobertura:** RNF-04, Principio 3 (Upload Paranoico).
  - **Hecho cuando:** Al subir una imagen JPEG cruda de 5 MB con metadatos EXIF, el archivo guardado en el servidor es un `.webp` con nombre UUID v4, peso `<= 500 KB`, ancho `<= 1080px`, sin metadatos EXIF ni perfiles ICC incrustados.

- [x] **TASK-06: Estandarización de Errores Opacos UUID en `server/src/middleware/error.middleware.ts`**
  - **Descripción:** Ajustar el manejador global de errores de Express para garantizar que ante cualquier fallo no capturado (500) o fallo de autenticación (401), la respuesta JSON al cliente sea única y taxativamente `{ "error": "Referencia: <uuid>" }`, confinando trazas técnicas y detalles a los logs estructurados internos.
  - **Cobertura:** Caso Límite 4, Caso Límite 13, Principio 6 (Errores Opacos).
  - **Hecho cuando:** Una prueba de integración que fuerza un error en el servidor o un fallo 401 recibe una respuesta JSON con la estructura `{ "error": "Referencia: <uuid>" }` sin exponer nombres de tablas, stacks ni motivos legibles.

---

## Fase 3: Componentes UI de Interacción y Cinemática

- [x] **TASK-07: Creación del Componente Unificado `CatalogCTAButton.tsx`**
  - **Descripción:** Crear `src/components/ui/CatalogCTAButton.tsx` conteniendo estructura y texto estáticos, haz de luz a 45° en ciclo de 5.2s (4.0s reposo + 1.2s barrido con curva `ease-in-out`), micro-desplazamiento autónomo de flecha direccional (0 a 4px en 1.5s), compresión física `scale-[0.98]` en estado `:active` de escritorio, pausa táctil al pulsar, y anulación total de animaciones ante `prefers-reduced-motion: reduce`.
  - **Cobertura:** RF-02.
  - **Hecho cuando:** El botón proyecta su barrido cada 5.2s, la flecha oscila suavemente, la animación se congela al hacer hover, y al emular `prefers-reduced-motion` no se proyecta ningún movimiento.

- [x] **TASK-08: Actualización del Marquee Dinámico y Accesible en `BrandsMarquee.tsx`**
  - **Descripción:** Modificar `src/components/landing/BrandsMarquee.tsx` implementando:
    1. Medición y clonación programática del array de marcas hasta superar `min-width: 200vw`.
    2. Suscripción a `window.resize` (con debounce de 250ms) para recalcular clones si la ventana crece.
    3. Traslación CSS pura al `-50%` (`transform: translateX(-50%)`) en 35 segundos de derecha a izquierda.
    4. Filtro monocromático `brightness-0 invert opacity-70` en logos (y `opacity-100` en hover) con dimensiones de máx. 40x120px y gap de 48px.
    5. Desmontaje condicional completo (`display: none`) si el listado de marcas es vacío.
  - **Cobertura:** RF-01, RNF-04.
  - **Hecho cuando:** La cinta se desplaza de forma fluida a 60 fps sin huecos en pantallas amplias, los logos se muestran como siluetas blancas contrastadas, y al pasar una lista vacía el componente no ocupa espacio en el DOM.

- [x] **TASK-09: Integración de Botón Accesible Toggle WCAG 2.2.2 en `BrandsMarquee.tsx`**
  - **Descripción:** Incorporar al inicio de `BrandsMarquee.tsx` un botón interactivo posicionado como `sr-only` que se hace visible en pantalla al recibir foco (`:focus-visible`). El botón alterna entre "Pausar animación" (`aria-pressed="false"`) y "Reanudar animación" (`aria-pressed="true"`), congelando la cinemática CSS. Si el usuario activa la pausa, la decisión prevalece con memoria estricta frente a eventos de cambio de pestaña. Si `prefers-reduced-motion` está activo, el botón no se renderiza.
  - **Cobertura:** RF-01, HU-06, WCAG 2.2.2.
  - **Hecho cuando:** Al navegar con teclado (`Tab`), el botón se hace visible, al presionar `Enter` detiene el carrusel y cambia a "Reanudar animación", y al cambiar de pestaña y regresar se mantiene pausado.

---

## Fase 4: Refinamiento de la Landing Page

- [x] **TASK-10: Reestructuración de Jerarquía y Cinemática del Hero en `HeroSection.tsx`**
  - **Descripción:** Reordenar el Hero para presentar primero "LABORATORIO DIÉSEL" con animación de revelación *fade-in slide-up* en 0.8s (Y: 20px a 0), seguido tras 800ms por el subtítulo "Especialistas en inyección diésel" con mecanografía técnica (40-60ms/char) y cursor parpadeante permanente en barra vertical (`|`) coloreado en Naranja Técnico (`#ea580c`). Integrar `CatalogCTAButton` como acción principal.
  - **Cobertura:** RF-03.
  - **Hecho cuando:** Al cargar la página, el título principal entra primero suavemente, y 800ms después se escribe el subtítulo con su cursor naranja parpadeando indefinidamente al terminar.

- [ ] **TASK-11: Restauración Fotográfica a Todo Color y Protección WCAG AA**
  - **Descripción:** Remover clases de filtro a escala de grises (`grayscale`, `filter`) en todas las secciones fotográficas de la Landing Page (`BenchShowcaseSection.tsx`, `HeroSection.tsx`, `LocationSection.tsx`, `WarrantySection.tsx`). Asegurar que las capas de oscurecimiento y degradados neutros (`from-black/80 to-transparent`) mantengan la relación de contraste WCAG AA (>= 4.5:1) sobre los textos blancos.
  - **Cobertura:** RF-04, RNF-01, HU-01.
  - **Hecho cuando:** Todas las fotografías de bancos de prueba e instalaciones se aprecian a todo color real, y una auditoría de contraste de Lighthouse arroja cumplimiento de accesibilidad WCAG AA en los encabezados.

- [x] **TASK-12: Implementación de Revelación Progresiva al Scroll (Stagger y Once)**
  - **Descripción:** Aplicar a los bloques de contenido de la Landing Page (servicios, pasos de diagnóstico, valores) la animación de entrada suave (*fade-in slide-up*) con umbral de intersección del 10% y activación única en el ciclo de vida del DOM (`once: true`). En contenedores de tarjetas múltiples, aplicar retraso escalonado (*stagger*) de 0.1s a 0.2s entre elementos consecutivos. Asegurar que ante scroll ultrarrápido los elementos ya cruzados aparezcan con opacidad total instantánea.
  - **Cobertura:** RF-05, Caso Límite 2.
  - **Hecho cuando:** Al hacer scroll por la Landing, las tarjetas emergen en cascada progresiva; al subir y volver a bajar, permanecen estáticas sin reiniciar la animación.

- [x] **TASK-13: Depuración Cromática del Footer y Créditos GEPI SOFTWARE en `LandingFooter.tsx`**
  - **Descripción:** Erradicar cualquier residuo de color azul en bordes, fondos e iconos de `LandingFooter.tsx`, adoptando los tokens canónicos oscuros (`#0a0a0a` / `#111111`) y acentos en naranja técnico (`#ea580c`). Añadir en la franja inferior el texto `"Desarrollada por GEPI SOFTWARE"` con enlace apuntando a `https://www.gepisoftware.com` abriendo en la misma pestaña (`target="_self"`).
  - **Cobertura:** RF-06.
  - **Hecho cuando:** El Footer carece de elementos azules, exhibe la firma institucional con su enlace funcionando en `_self`, y no genera advertencias de ventanas emergentes.

---

## Fase 5: Experiencia Adaptativa Móvil (Bottom Bar & Safe Areas)

- [x] **TASK-14: Creación de la Barra Fija Móvil en `MobileStickyBar.tsx`**
  - **Descripción:** Crear `src/components/landing/MobileStickyBar.tsx` para renderizarse exclusivamente en `< 768px` y condicionado a `pathname === '/'`:
    - Altura mínima flexible `min-h-[64px]`.
    - Superficie `bg-black/80` con desenfoque `backdrop-blur-md` y delimitación superior `border-t border-white/10`.
    - Botón de WhatsApp icónico centrado de exactamente 48px (`w-12`), sin texto, con estilo secundario.
    - Botón "Ir al catálogo" (`CatalogCTAButton`) ocupando todo el ancho restante (`flex-1`).
    - Protección de área segura con `padding-bottom: env(safe-area-inset-bottom)`.
    - Ocultamiento automático ante modo landscape (`< 450px`) y re-evaluación al hacer blur.
  - **Cobertura:** RF-07, RNF-03, Caso Límite 1.
  - **Hecho cuando:** En emulación móvil (< 768px) en la Landing Page, la barra aparece fija en la parte inferior, WhatsApp mide 48px exactos, el botón del catálogo ocupa el resto, y en modo horizontal (< 450px) se oculta.

- [x] **TASK-15: Medición Dinámica con `ResizeObserver` y Compensación de Layout**
  - **Descripción:** Suscribir `MobileStickyBar.tsx` a un `ResizeObserver` que calcule la altura real de la barra en el DOM e inyecte dinámicamente el valor en la variable CSS `--bottom-bar-height`. Configurar en el layout principal que en `pathname === '/'` aplique el relleno inferior `padding-bottom: calc(var(--bottom-bar-height, 64px) + env(safe-area-inset-bottom))`. En rutas secundarias (`/catalogo`, `/garantia`, etc.), este padding no se aplica.
  - **Cobertura:** RF-07, Caso Límite 3.
  - **Hecho cuando:** Al aumentar el zoom del navegador en móvil apilando los botones verticalmente, la variable `--bottom-bar-height` crece en tiempo real y el final de la Landing Page añade el espacio compensatorio exacto, impidiendo que la barra tape el Footer.

---

## Fase 6: Adaptación Estética del Catálogo Público

- [x] **TASK-16: Estandarización de Grilla Cuadrada (1:1) y Polaroid en `ProductCard.tsx`**
  - **Descripción:** Modificar `src/components/catalog/ProductCard.tsx` para alojar la imagen del repuesto dentro de un contenedor oscuro `#1c1c1e` estrictamente cuadrado (`aspect-square` / 1:1) con marco interno (*padding*) uniforme de 16px.
    - Fotos transparentes: flotan de forma natural sobre `#1c1c1e`.
    - Fotos con fondo blanco opaco: utilizan `object-contain` llenando el área interna con bordes redondeados (`rounded-md`) tipo polaroid, descartando `mix-blend-mode: multiply`.
    - Hover de tarjeta: aplica resplandor perimetral sutil (`box-shadow` blanco al 5%) e incrementa la opacidad del borde translúcido de 10% a 25%, sin traslación vertical `translateY`.
  - **Cobertura:** RF-08.
  - **Hecho cuando:** Todas las tarjetas de productos en el catálogo exhiben exactamente la misma altura en la grilla, las fotos con fondo blanco lucen como polaroids técnicas nítidas con su brillo metálico intacto, y el hover no genera saltos en la cuadrícula.

- [x] **TASK-17: Contingencia de Isotipo Vectorial y Jerarquía de Badges en `ProductCard.tsx`**
  - **Descripción:** Actualizar `ProductCard.tsx` para:
    1. Proyectar por defecto dentro del contenedor cuadrado el isotipo vectorial monocromático de Laboratorio Diésel con opacidad estricta de `opacity-20` cuando el producto no posea foto (`imagen_url === null` o vacía) o cuando falle la carga de la imagen (error 404).
    2. Diferenciar cromáticamente los badges: condición "Nuevo" con borde y texto en Naranja Técnico (`#ea580c`); condición "Reacondicionado" con borde y texto en Gris Metalizado (`#71717a`).
  - **Cobertura:** RF-08.
  - **Hecho cuando:** Un producto sin imagen muestra de forma elegante el isotipo técnico atenuado al 20%, y el usuario distingue instantáneamente productos nuevos de reacondicionados por su color.

---

## Fase 7: Panel de Administración, Ergonomía y Sesión Zero-Trust

- [x] **TASK-18: Cabeceras de Tabla Fijas y Manejo de Errores en `ProductList.tsx`**
  - **Descripción:** Adaptar la tabla de inventario del Admin (`src/components/admin/products/ProductList.tsx`) para operar estrictamente en tema claro (`bg-admin-bg`, `text-admin-text-main`), con cabeceras fijas (*sticky headers*) con fondo 100% opaco blanco (`bg-white`) y delimitación inferior `box-shadow: 0 1px 0 rgba(0,0,0,0.10)`. Formatear códigos OEM con tipografía monoespaciada de alto contraste y aplicar a los botones primarios el naranja técnico `#ea580c` con hover `#c2410c`.
  - **Cobertura:** RF-09, Apéndice 10.2.
  - **Hecho cuando:** Al hacer scroll vertical en una lista extensa de repuestos, las cabeceras de la tabla permanecen ancladas bloqueando el texto inferior, y los códigos OEM se leen con máxima nitidez.

- [x] **TASK-19: Manejo Opaco de Errores 500 en Tablas de Administración**
  - **Descripción:** Modificar el estado de captura de datos de `ProductList.tsx` para que ante una falla HTTP 500 del servidor, el cuerpo de la tabla despliegue formalmente el mensaje constitucional: `"Error del servidor. Referencia: <uuid>"`, protegiendo la cabecera fija y previniendo la inyección de trazas técnicas al DOM.
  - **Cobertura:** Caso Límite 4, Principio 6.
  - **Hecho cuando:** Al simular una caída de base de datos en la carga de repuestos, la tabla muestra el mensaje opaco con su identificador UUID sin romper la estructura de cabeceras.

- [x] **TASK-20: Modal de Confirmación Destructiva con Validación Tipada en `DeleteConfirmModal.tsx`**
  - **Descripción:** Crear `src/components/admin/products/DeleteConfirmModal.tsx` como diálogo modal bloqueante. El botón de confirmación inicia deshabilitado y se habilita únicamente cuando el input recibe de forma exacta la palabra `"ELIMINAR"` (*case-sensitive* + `.trim()`). El evento `onSubmit` intercepta `Enter` y solo ejecuta el borrado si la palabra coincide. El campo incorpora `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="characters"` y `spellCheck="false"`.
  - **Cobertura:** RF-09.
  - **Hecho cuando:** No es posible eliminar un repuesto hasta tipear "ELIMINAR" en mayúsculas, presionar Enter con texto erróneo no ejecuta nada, y no aparecen sugerencias de autocompletado en el input.

- [x] **TASK-21: Hook de Prevención de Pérdida Accidental de Trabajo en `useUnsavedChangesWarning.ts`**
  - **Descripción:** Crear `src/hooks/useUnsavedChangesWarning.ts` y vincularlo al formulario de alta/edición de repuestos y al estado del modal de re-autenticación. Si el formulario contiene cambios sin guardar (*dirty state*) o el modal de sesión está abierto, suscribe el listener `beforeunload` para advertir al usuario si intenta recargar (F5) o cerrar la pestaña.
  - **Cobertura:** Caso Límite 10, RNF-05.
  - **Hecho cuando:** Al tener un formulario de repuesto con campos llenos y presionar F5 o cerrar la pestaña, el navegador abre el diálogo nativo advirtiendo que los cambios se perderán.

- [x] **TASK-22: Configuración de `withCredentials` y Manejo de Red en `api-client.ts`**
  - **Descripción:** Configurar en la instancia de Axios de `src/lib/api-client.ts` el parámetro global `withCredentials: true` para garantizar que toda petición transmita las cookies seguras `HttpOnly`. Agregar en el interceptor la captura de excepciones de red local (`ERR_INTERNET_DISCONNECTED` o fallos sin código HTTP) para emitir un evento de desconexión sin destruir el estado de sesión ni el formulario.
  - **Cobertura:** Caso Límite 11, Principio 4.
  - **Hecho cuando:** En las herramientas de desarrollador se comprueba que las solicitudes HTTP adjuntan las cookies de sesión, y al desconectar el cable de red, una petición de guardado no arroja 401 sino que retiene el formulario en memoria y lanza la notificación de error de conexión.

- [x] **TASK-23: Interceptor Axios para Refresh Silencioso JWT en `api-client.ts`**
  - **Descripción:** Implementar en el interceptor de respuestas de Axios la captura del código HTTP 401:
    1. Si la petición fallida no era el endpoint de refresh, encola las peticiones pendientes e invoca a `POST /api/auth/refresh` con `withCredentials: true`.
    2. Si el refresh responde 200 OK, reintenta transparentemente la petición original.
    3. Si el refresh responde 500, no revoca la sesión y notifica error temporal de comunicación.
    4. Si el refresh responde 401/403 (sesión expirada definitivamente), retiene la petición fallida (incluyendo su `FormData` y binarios `File`) y emite el evento global `SHOW_REAUTH_MODAL`.
  - **Cobertura:** Caso Límite 8, Principio 4.
  - **Hecho cuando:** Al expirar el token de acceso, una petición administrativa se completa con éxito tras bambalinas mediante el refresh silencioso sin interrumpir al usuario; y si el refresh expira, se dispara el modal de re-autenticación.

- [x] **TASK-24: Modal Bloqueante de Re-autenticación en `AuthContext.tsx`**
  - **Descripción:** Integrar en el contexto de autenticación la gestión del modal bloqueante:
    - Se despliega sobre el formulario activo sin destruirlo.
    - Es estrictamente bloqueante: no se cierra al hacer clic en el backdrop ni al presionar `Esc`.
    - Al enviar credenciales, el botón pasa a `disabled: true` con indicador de carga para bloquear doble envío (*double submit*).
    - Si las credenciales son incorrectas, muestra mensaje de error en rojo y permite reintentar reteniendo el formulario.
    - Tras login exitoso, cierra el modal, re-empaqueta el `FormData` retenido en memoria y re-transmite la petición original automáticamente.
  - **Cobertura:** Caso Límite 8, Principio 4.
  - **Hecho cuando:** Al vencer la sesión completa mientras se sube una foto pesada, aparece el modal bloqueante; al loguearse correctamente, el archivo se re-transmite de forma automática y se crea el repuesto sin pedir volver a seleccionar la imagen.

- [x] **TASK-25: Sincronización Multi-Pestaña de Sesión por `BroadcastChannel`**
  - **Descripción:** Implementar en `AuthContext.tsx` un canal `BroadcastChannel('auth_channel')` con fallback a listener sobre `storage` en `window`. Al detectarse un cierre de sesión voluntario o revocación definitiva en una pestaña, transmite el mensaje `SESSION_REVOKED` para que todas las demás pestañas abiertas invaliden su estado de inmediato.
  - **Cobertura:** Caso Límite 9.
  - **Hecho cuando:** Al tener dos pestañas del panel abiertas y cerrar sesión en la Pestaña A, la Pestaña B detecta el evento de forma instantánea y redirige a la vista de login.

---

## Fase 8: Pruebas Automatizadas y Validación Constitucional (DoD)

- [x] **TASK-26: Pruebas Unitarias de Esquemas Zod y Contratos de Validación**
  - **Descripción:** Crear tests en Vitest para `uploadFileSchema` validando tipos MIME permitidos, rechazo de archivos > 8 MB, y pruebas unitarias de validación para el texto `"ELIMINAR"` en el modal destructivo.
  - **Cobertura:** Principio 2 (Fail-Fast), RF-09.
  - **Hecho cuando:** `npm run test` ejecuta la suite de validación Zod y modal destructivo pasando al 100% sin advertencias.

- [x] **TASK-27: Pruebas de Integración para el Pipeline Sharp y Errores Opacos**
  - **Descripción:** Crear pruebas en el backend para enviar imágenes de prueba al pipeline Sharp, verificando en los archivos de salida: formato WebP, peso `<= 500 KB`, ancho `<= 1080px`, purga de EXIF/ICC y nombre UUID v4. Validar que errores 401 y 500 respondan con `{ "error": "Referencia: <uuid>" }`.
  - **Cobertura:** Principio 3 (Upload Paranoico), Principio 6 (Errores Opacos).
  - **Hecho cuando:** La suite de integración de Vitest en el backend valida la desinfección estricta de Sharp y los payloads opacos de error con éxito.

- [x] **TASK-28: Pruebas E2E de Flujo de Sesión y Regresión Visual Playwright**
  - **Descripción:** Implementar pruebas E2E en Playwright para:
    1. Flujo completo de re-autenticación bloqueante sin pérdida de datos en el formulario de repuestos.
    2. Comprobación de que la barra fija inferior móvil solo está presente en `/` y desaparece en `/catalogo`.
    3. Comprobación de navegación por teclado en el Marquee con botón toggle `:focus-visible` (WCAG 2.2.2).
  - **Cobertura:** DoD (Criterios 1 a 8 de finalización).
  - **Hecho cuando:** Todos los escenarios E2E pasan satisfactoriamente en los entornos emulados móvil y escritorio.
