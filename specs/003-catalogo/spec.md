# Spec 003 — Catálogo de Productos y Repuestos

## 1. Contexto y Objetivo

### 1.1 Contexto

Laboratorio Diésel necesita que sus clientes (mecánicos, transportistas y particulares) puedan identificar con precisión técnica los inyectores, bombas y repuestos diésel ofrecidos por el taller antes de iniciar una consulta comercial. El SRS define la búsqueda por código OEM, nombre, marca y compatibilidad vehicular, además de filtros combinados por marca y categorías jerárquicas (padre/hija).

Las Specs 001 y 002 establecen la identidad visual institucional y los componentes públicos (`LandingNavbar`, `LandingFooter`, `site-config.ts`, `whatsapp-utils.ts`), mientras que las Specs 004 (Admin Panel) y 005 (Backend) definen los contratos reales de la API REST, la base de datos relacional PostgreSQL con Prisma y la gestión de visibilidad (`visible: true/false`), precios (`showPrice`) e imágenes sanitizadas en `/uploads/`.

### 1.2 Objetivo

Ofrecer un catálogo público, ágil y totalmente adaptado a dispositivos móviles (_Mobile-First_) para explorar repuestos diésel, verificar su compatibilidad y consultar precios. El visitante podrá iniciar una consulta directa desde la ficha de una pieza o agrupar múltiples productos en un carrito de consultas para enviar un pedido pre-estructurado a WhatsApp, sin necesidad de crear cuentas ni completar formularios previos.

El catálogo agiliza la atención comercial reduciendo consultas ambiguas. **No constituye una pasarela de pago ni garantiza reserva de existencias**: el cierre técnico y comercial se realiza exclusivamente a través de WhatsApp.

### 1.3 Relación con especificaciones existentes

- **Spec 001 y 002 (Landing Page e Identidad):** Conserva la continuidad visual y funcional utilizando `LandingNavbar`, `LandingFooter`, la paleta de colores azul institucional (`--primary`, `--hero`, `--card`) y los utilitarios de WhatsApp (`buildWhatsAppUrl`) y configuración centralizada (`SITE_CONFIG.phone`).
- **Spec 004 (Admin Panel):** Consume la misma estructura taxonómica de marcas y categorías jerárquicas (máximo 1 nivel) gestionadas en el backoffice.
- **Spec 005 (Backend y API REST):** Consume los endpoints reales expuestos en `/api` a través del cliente HTTP centralizado (`src/lib/api.ts`):
  - `GET /api/products`: listado de repuestos (filtrando en frontend `visible: true` para exhibición pública).
  - `GET /api/categories`: árbol jerárquico de categorías.
  - `GET /api/brands`: marcas de repuestos.
  - `GET /api/products/:id`: detalle individual de producto.
- **Constitución del Proyecto (`docs/constitution.md`):**
  - **Principio 2 (Fail-Fast Zod):** Validación estricta con Zod en search params de URL y en la caché del carrito.
  - **Principio 5 (Persistencia como fuente de verdad):** PostgreSQL es el único estado autoritativo. El `localStorage` del carrito es una caché efímera no autoritativa; al abrir el carrito o generar el mensaje de WhatsApp, los datos y precios se contrastan obligatoriamente contra el backend.
  - **Principio 6 (Errores Opacos):** Los fallos de red se presentan con mensajes funcionales amigables en español y opción de reintento, sin exponer datos técnicos internos.

---

## 2. Usuarios

| Usuario                        | Necesidad                                                                                                                                                                 |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cliente final / Particular** | Encontrar rápidamente la pieza que necesita para su vehículo, verificar si el precio está disponible y consultar al taller por WhatsApp sin registrarse.                  |
| **Mecánico o transportista**   | Buscar repuestos por Código OEM exacto, marca técnica o compatibilidad de motor, revisar especificaciones técnicas y cotizar lotes de piezas.                             |
| **Administrador del taller**   | Asegurar que los clientes solo vean repuestos activos (`visible: true`) y que cualquier cambio de precio o visibilidad en el panel se refleje en las consultas entrantes. |

---

## 3. Historias de Usuario

- **HU-01:** Como cliente, quiero buscar por nombre, código OEM, marca o modelo de vehículo para localizar inmediatamente la pieza que requiere mi motor.
- **HU-02:** Como mecánico, quiero combinar filtros de marca y categoría/subcategoría para acotar los resultados a repuestos técnicos específicos.
- **HU-03:** Como cliente, quiero revisar la ficha detallada de un repuesto con su foto, descripción, marca, condición y compatibilidad para confirmar que es el adecuado.
- **HU-04:** Como cliente, quiero saber de forma transparente si el precio está publicado en ARS o si debe cotizarse al día para iniciar la consulta comercial con expectativas claras.
- **HU-05:** Como cliente interesado en una sola pieza, quiero abrir una consulta directa a WhatsApp desde su tarjeta o ficha técnica con los datos pre-cargados.
- **HU-06:** Como cliente interesado en múltiples repuestos, quiero reunirlos en un carrito de consultas y generar un único mensaje estructurado a WhatsApp sin llenar formularios ni ingresar tarjetas de crédito.
- **HU-07:** Como usuario desde un celular, quiero filtrar, explorar y enviar consultas con la misma agilidad y estética que en una computadora de escritorio.

---

## 4. Requisitos Funcionales

### RF-01 — Integración y continuidad con la experiencia institucional

**Criterios de aceptación (EARS):**

- **Cuando** un visitante acceda a la ruta del catálogo (`/catalogo`), **el sistema deberá** renderizar la página integrando los componentes estructurales compartidos `LandingNavbar` y `LandingFooter`, conservando la paleta de colores azul institucional y la tipografía del sitio.
- **Cuando** el visitante interactúe con los enlaces de navegación del navbar o footer, **el sistema deberá** permitir la navegación fluida entre las secciones institucionales (`/` con sus anclas `#servicios`, `#garantias`, etc.) y el catálogo (`/catalogo`).
- **Cuando** la interfaz se visualice en pantallas móviles (desde 320 px de ancho), **el sistema deberá** adaptar la disposición en columna única (_Mobile-First_) garantizando que ningún elemento desborde horizontalmente la pantalla.

### RF-02 — Listado de productos visibles y manejo de estados asíncronos

**Criterios de aceptación (EARS):**

- **Cuando** se cargue el catálogo, **el sistema deberá** solicitar la lista de repuestos a la API (`GET /api/products`) a través del cliente HTTP centralizado (`src/lib/api.ts`).
- **Cuando** la respuesta del backend contenga productos, **el sistema deberá** presentar en la grilla pública exclusivamente aquellos productos que tengan la propiedad `visible: true`, excluyendo del listado los borradores u ocultos (`visible: false`).
- **Mientras** se reciben los datos del backend, **el sistema deberá** mostrar un estado de carga visual mediante tarjetas esqueleto (_skeleton loader_) preservando la estructura de la grilla.
- **Cuando** el backend no contenga productos o ninguno tenga `visible: true`, **el sistema deberá** mostrar un estado vacío informativo indicando que actualmente no hay productos publicados en el catálogo.
- **Si** la petición al backend falla por desconexión o error HTTP, **el sistema deberá** capturar el error mediante un Error Boundary y mostrar el mensaje en español _“Error temporal al cargar el catálogo”_, acompañado de un botón visible para reintentar la carga.

### RF-03 — Búsqueda técnica global con priorización OEM

**Criterios de aceptación (EARS):**

- **Cuando** el visitante ingrese un texto en la barra de búsqueda, **el sistema deberá** evaluar coincidencias parciales insensibles a mayúsculas, minúsculas y acentos (normalización Unicode NFD) sobre los siguientes campos del producto: nombre (`name`), código OEM (`oem`), marca del repuesto (`brand.name`) y compatibilidad vehicular (`vehicleCompatibility`).
- **Cuando** el término de búsqueda coincida con el código OEM de uno o más productos y simultáneamente con otros campos de otros productos, **el sistema deberá** ordenar prioritariamente en los primeros lugares los productos cuya coincidencia se origine en el código OEM.
- **Cuando** el visitante limpie o modifique el término de búsqueda, **el sistema deberá** actualizar inmediatamente los resultados en pantalla.
- **Cuando** coexistan un término de búsqueda y filtros seleccionados de marca o categoría, **el sistema deberá** aplicar una condición de intersección lógica (operador `AND`) entre la búsqueda y los filtros activos.

### RF-04 — Filtros combinados de marcas y árbol de categorías

**Criterios de aceptación (EARS):**

- **Cuando** se inicialice la vista del catálogo, **el sistema deberá** consultar las marcas (`GET /api/brands`) y las categorías jerárquicas (`GET /api/categories`) desde la API para poblar dinámicamente los paneles de filtros.
- **Cuando** el visitante seleccione una o más marcas, **el sistema deberá** filtrar los productos cuya marca (`brandId`) coincida con cualquiera de las marcas seleccionadas (operador `OR` entre marcas seleccionadas).
- **Cuando** el visitante seleccione una categoría raíz que posea subcategorías hijas, **el sistema deberá** incluir en los resultados los productos asociados directamente a dicha categoría padre así como los asociados a cualquiera de sus subcategorías hijas.
- **Cuando** el visitante seleccione múltiples categorías o subcategorías, **el sistema deberá** incluir los productos que pertenezcan a cualquiera de las selecciones realizadas (operador `OR` entre categorías).
- **Cuando** se combinen búsqueda de texto, una o más marcas y una o más categorías, **el sistema deberá** aplicar un `AND` estricto entre el bloque de texto, el bloque de marcas y el bloque de categorías.
- **Cuando** el visitante seleccione o deseleccione un filtro, **el sistema deberá** sincronizar de forma bidireccional el estado con los parámetros de búsqueda en la URL (`search params`: `q`, `brand`, `category`) mediante TanStack Router, permitiendo compartir enlaces y usar el historial de navegación (atrás/adelante).

### RF-05 — Estado sin resultados y consulta asistida por WhatsApp

**Criterios de aceptación (EARS):**

- **Cuando** la combinación de búsqueda y filtros activos no produzca ningún producto coincidente, **el sistema deberá** mostrar un estado informativo indicando que no se encontraron repuestos con los criterios aplicados.
- **Cuando** se visualice el estado sin resultados, **el sistema deberá** proveer un botón directo de consulta a WhatsApp hacia el número oficial (`SITE_CONFIG.phone`).
- **Cuando** el visitante presione dicho botón, **el sistema deberá** abrir WhatsApp con un mensaje pre-formateado que incluya el término de búsqueda ingresado y los nombres de las marcas y categorías que se encontraban filtradas, para contextualizar al vendedor sobre la pieza requerida.

### RF-06 — Tarjetas de producto, imágenes y ficha técnica detallada

**Criterios de aceptación (EARS):**

- **Cuando** se listen productos en la grilla, **el sistema deberá** renderizar en cada tarjeta: imagen resuelta mediante `resolveImageUrl()`, nombre del producto, código OEM (si existe), nombre de la marca, insignia (_badge_) de condición de la pieza ('Nuevo' | 'Reacondicionado' | 'Usado'), precio formateado en ARS o leyenda “Consultar precio”, botón para agregar al carrito y botón de WhatsApp directo.
- **Si** un producto no posee imagen (`imageUrl` vacío) o la imagen falla al cargar en el navegador (`onError`), **el sistema deberá** reemplazarla de inmediato por un placeholder vectorial SVG accesible con la leyenda _“Imagen no disponible”_.
- **Cuando** el visitante seleccione un producto para ver su detalle (en modal o en `/catalogo/$productId`), **el sistema deberá** desplegar su ficha técnica completa mostrando: nombre, foto en alta resolución, descripción detallada, marca, categorías vinculadas, código OEM, compatibilidad vehicular (`vehicleCompatibility`), condición y precio.
- **Si** alguno de los campos opcionales (`oem`, `vehicleCompatibility`) no estuviese cargado, **el sistema deberá** omitir dicho campo en la interfaz sin inventar valores ficticios.

### RF-07 — Presentación de precios y tratamiento de productos "A cotizar"

**Criterios de aceptación (EARS):**

- **Cuando** un producto tenga un valor numérico en `price` y la bandera `showPrice === true`, **el sistema deberá** exhibir el precio en la tarjeta y en la ficha técnica con formato de moneda nacional (ejemplo: `$320.000 ARS`).
- **Cuando** el producto tenga `price === null`, `price === 0` con `showPrice === false`, o `showPrice === false`, **el sistema deberá** mostrar de manera visible y destacada la leyenda **“Consultar precio”** tanto en la tarjeta como en la ficha técnica.
- **Cuando** un producto sin precio público sea agregado al carrito de consultas, **el sistema deberá** etiquetarlo obligatoriamente como **“A cotizar”** en el desglose del carrito y en el mensaje generado para WhatsApp.

### RF-08 — Carrito de consultas y persistencia efímera (Principio 5)

**Criterios de aceptación (EARS):**

- **Cuando** el visitante presione “Agregar al Carrito”, **el sistema deberá** incorporar el producto al estado del carrito, admitiendo tanto piezas con precio visible como piezas bajo la modalidad “Consultar precio”.
- **Cuando** se agregue un producto que ya figura en el carrito, **el sistema deberá** incrementar su cantidad en una unidad manteniéndolo en una única fila dentro de la lista.
- **Cuando** el visitante modifique la cantidad mediante los controles del carrito, **el sistema deberá** aceptar únicamente valores enteros mayores o iguales a 1, actualizando de forma reactiva los totales y desgloses.
- **Cuando** el visitante decida quitar un producto o vaciar el carrito, **el sistema deberá** remover el ítem del estado en memoria y sincronizar la caché local.
- **Cuando** el visitante recargue la página o cierre el navegador, **el sistema deberá** restaurar los ítems del carrito desde una caché efímera en `localStorage` (`CartCacheV1`), validada estrictamente con Zod.
- **En ningún momento** el sistema deberá restringir o validar cantidades contra inventario o stock, ni simular reservas de piezas.
- **Cuando** el carrito no contenga ningún producto, **el sistema deberá** mostrar el estado de carrito vacío y mantener inhabilitada la acción de finalización de compra.

### RF-09 — Consulta directa por WhatsApp desde la ficha de producto

**Criterios de aceptación (EARS):**

- **Cuando** el visitante presione el botón de consulta de WhatsApp en una tarjeta o ficha técnica individual, **el sistema deberá** generar una URL canónica hacia la API de WhatsApp (`buildWhatsAppUrl`) dirigida al número oficial de Laboratorio Diésel (`SITE_CONFIG.phone`).
- **Cuando** se componga el mensaje de consulta directa, **el sistema deberá** incluir el nombre del repuesto, marca, código OEM (si aplica), precio unitario visible o indicación “A cotizar”, y asumir automáticamente una cantidad de 1 unidad.
- **Cuando** el visitante accione esta consulta, **el sistema no deberá** solicitar registro de usuario ni exigir el llenado de formularios previos en la web.

### RF-10 — Cierre de pedido (Checkout) por WhatsApp con validación contra Backend

**Criterios de aceptación (EARS):**

- **Cuando** el visitante presione el botón “Enviar Pedido a WhatsApp” desde el carrito, **el sistema deberá** verificar los identificadores de los productos contra los datos autoritativos frescos del backend antes de emitir el mensaje, garantizando que los precios y nombres coincidan con la base de datos (Principio 5).
- **Cuando** se compile el mensaje final para WhatsApp, **el sistema deberá** estructurar un texto detallado que contenga:
  1. Saludo inicial y presentación del pedido desde la web de Laboratorio Diésel.
  2. Lista enumerada de productos con: `[Cantidad] × [Nombre] | Marca: [Marca] | OEM: [OEM] | [Precio ARS o 'A cotizar']`.
  3. Subtotal calculado exclusivamente sobre los productos que posean precio público vigente.
  4. Mención explícita solicitando cotización de los productos identificados como "A cotizar" (si existieran).
  5. Mensaje de cierre solicitando al vendedor la confirmación de compatibilidad técnica y disponibilidad de despacho.
- **Si** la lectura de validación contra el backend no puede completarse por caída de red, **el sistema deberá** preservar el contenido del carrito en pantalla, mostrar una alerta amigable y ofrecer la opción de reintentar sin romper el flujo.

### RF-11 — Tratamiento de productos que dejan de estar visibles o son eliminados

**Criterios de aceptación (EARS):**

- **Cuando** un producto almacenado previamente en la caché del carrito pase al estado `visible: false` en la base de datos o sea eliminado, **el sistema deberá** conservarlo en el desglose del carrito del visitante mostrando un aviso visual destacado: _“Vigencia en catálogo: requiere reconfirmación con el taller”_, sin mostrar indicadores de stock o existencias.
- **Cuando** el visitante envíe a WhatsApp un carrito que contiene productos pendientes de reconfirmación, **el sistema deberá** incluir una aclaración en el mensaje de WhatsApp especificando que dichos artículos requieren confirmación previa de vigencia por parte del taller, rotulando su precio como “A cotizar”.
- **Cuando** un usuario intente acceder por enlace directo (`/catalogo/$productId`) a un producto inexistente o configurado con `visible: false`, **el sistema deberá** mostrar una vista de _“Producto no disponible”_, impidiendo su agregado al carrito y ofreciendo un botón para regresar al listado público del catálogo.

### RF-12 — Ausencia absoluta de indicadores de inventario y stock

**Criterios de aceptación (EARS):**

- **En ningún punto** de la experiencia pública (tarjetas, fichas, carrito o mensajes generados) **el sistema deberá** exhibir contadores de existencias, etiquetas de "stock disponible" o mensajes de "agotado".
- **Cuando** el sistema presente los resúmenes del pedido o los textos de WhatsApp, **el sistema deberá** comunicar de manera explícita que la operación es una solicitud de cotización y presupuesto técnico, y no una compra confirmada ni una reserva de unidades.

---

## 5. Requisitos No Funcionales

| ID         | Categoría                              | Requisito                                                                                                                                                                                                                                             |
| :--------- | :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RNF-01** | **Identidad Visual**                   | Mantener una estética profesional de ingeniería automotriz en tonos azules (`--primary`), neutros y blancos, consistente con la Landing Page institucional.                                                                                           |
| **RNF-02** | **Diseño Adaptable (Responsive)**      | Interfaz utilizable y ergonómica en pantallas desde 320 px hasta resoluciones de escritorio 4K, con diseño táctil (_Mobile-First_) para botones y filtros.                                                                                            |
| **RNF-03** | **Rendimiento**                        | El motor de búsqueda y filtrado en frontend deberá procesar y actualizar la vista en menos de **2 segundos** bajo condiciones normales de navegación.                                                                                                 |
| **RNF-04** | **Accesibilidad y Semántica**          | Controles con etiquetas comprensibles (`aria-label`, `role="img"` en placeholders), navegación completa por teclado y contraste cromático adecuado según pautas WCAG 2.1 AA.                                                                          |
| **RNF-05** | **Seguridad y Validación (Fail-Fast)** | Los search params de la URL y la caché en `localStorage` deberán validarse mediante esquemas estrictos de Zod (`.strict()`). Datos corruptos deben descartarse de forma controlada sin romper la aplicación.                                          |
| **RNF-06** | **Idioma**                             | El 100% de la interfaz, mensajes de error, placeholders y plantillas de WhatsApp deberán estar redactados en español claro y profesional.                                                                                                             |
| **RNF-07** | **Persistencia Efímera Zero-Trust**    | `localStorage` almacena exclusivamente la intención de compra (`productId`, `quantity`, `lastKnown`). La base de datos PostgreSQL gobernada por el backend en Express/Prisma es la única fuente de verdad autoritativa de precios, marcas y vigencia. |

---

## 6. Casos Límite y Manejo de Excepciones

| ID        | Situación Límite                                                                             | Comportamiento Esperado del Sistema                                                                                                                                     |
| :-------- | :------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CL-01** | La base de datos no contiene productos con `visible: true`.                                  | Mostrar el estado vacío institucional del catálogo sin exponer registros en borrador u ocultos.                                                                         |
| **CL-02** | La búsqueda o combinación de filtros no produce coincidencias.                               | Mostrar el estado sin resultados y habilitar el botón de WhatsApp con el texto y filtros pre-cargados.                                                                  |
| **CL-03** | Un producto no tiene imagen cargada o falla su carga por red.                                | Renderizar inmediatamente el fallback SVG accesible _“Imagen no disponible”_. Si faltan campos opcionales (`oem`, compatibilidad), omitirlos sin mostrar textos vacíos. |
| **CL-04** | El producto tiene precio oculto (`showPrice === false`) o nulo.                              | Mostrar “Consultar precio” en catálogo/ficha y “A cotizar” en el carrito y mensaje de WhatsApp.                                                                         |
| **CL-05** | El visitante recarga la página o cierra la pestaña con productos en el carrito.              | Rehidratar los ítems desde `localStorage` preservando las cantidades seleccionadas.                                                                                     |
| **CL-06** | Un producto del carrito fue ocultado (`visible: false`) en el panel después de ser agregado. | Mantenerlo en el carrito con el aviso _“Vigencia en catálogo: requiere reconfirmación”_ y cotizarlo como “A cotizar” en el WhatsApp.                                    |
| **CL-07** | El visitante intenta enviar un carrito con 0 productos.                                      | Deshabilitar el botón de envío e indicar que debe agregar al menos un producto.                                                                                         |
| **CL-08** | El dispositivo del usuario no posee la app de WhatsApp instalada.                            | El navegador abrirá WhatsApp Web mediante la URL canónica `https://wa.me/...`. El sitio no afirma que el mensaje fue recibido.                                          |
| **CL-09** | El visitante ingresa una cantidad menor a 1 o texto no numérico en el carrito.               | Impedir la mutación, forzar el valor mínimo a 1 unidad y mantener la consistencia del estado.                                                                           |
| **CL-10** | Falla la conexión con el servidor al cargar el catálogo (`ApiError`).                        | El Error Boundary presenta el mensaje _“Error temporal al cargar el catálogo”_ con botón para reintentar la llamada HTTP.                                               |
| **CL-11** | Enlace directo a un producto inexistente o con `visible: false`.                             | Desplegar la vista _“Producto no disponible”_ con opción de retornar a `/catalogo`.                                                                                     |
| **CL-12** | La caché local de `localStorage` contiene JSON manipulado o corrupto.                        | El validador Zod falla de forma segura, limpia la clave corrupta e inicializa un carrito vacío sin arrojar errores fatales.                                             |
| **CL-13** | Un producto del carrito fue eliminado físicamente de la base de datos.                       | Usar el campo `lastKnown` para identificar el producto en la consulta, marcarlo como pendiente de reconfirmación y cotizarlo sin precio.                                |

---

## 7. Fuera de Alcance (Exclusiones de Fase)

- Pasarelas de cobro electrónico en línea (Mercado Pago, tarjetas de crédito/débito, transferencias bancarias dentro del sitio).
- Conteo, gestión, reserva o descuento de inventario/stock.
- Envío automático de encomiendas o integración con APIs logísticas (Andreani, Correo Argentino).
- Creación de cuentas, registro o autenticación de clientes finales.
- Facturación electrónica con ARCA / AFIP.
- Venta o cotización de servicios de taller en el catálogo (los servicios se mantienen como tarjetas informativas en la Landing Page).

---

## 8. Criterios de Finalización

La Spec 003 se considerará completamente satisfecha y lista para producción cuando:

1. El catálogo público `/catalogo` consuma la API real (`GET /api/products`, `GET /api/categories`, `GET /api/brands`) a través de `src/lib/api.ts` sin depender de ningún archivo de datos estáticos ni mocks en memoria.
2. La grilla filtre estrictamente los productos con `visible: true`, y maneje correctamente estados de carga (_skeleton_), estado vacío y Error Boundary con reintento.
3. El motor de búsqueda normalice acentos y mayúsculas, y otorgue prioridad en los resultados a las coincidencias por código OEM.
4. El árbol de categorías padre e hija se resuelva correctamente contra el array plano `categoryIds` de cada producto, aplicando `OR` entre categorías/marcas y `AND` entre bloques.
5. Los filtros se sincronicen de manera bidireccional con los search params de TanStack Router en la URL.
6. El estado sin resultados provea un CTA a WhatsApp contextualizado con la búsqueda y filtros activos.
7. Los precios respeten estrictamente la bandera `showPrice` y el valor numérico, exhibiendo "Consultar precio" / "A cotizar" cuando corresponda.
8. La persistencia efímera del carrito en `localStorage` respete la Constitución §5, revalidando datos y precios contra el backend al cargar o enviar el pedido.
9. Los productos ocultados o eliminados se marquen como _“Vigencia en catálogo: requiere reconfirmación”_ en el carrito y en el mensaje de WhatsApp.
10. Las consultas directas y del carrito generen URLs válidas de WhatsApp hacia `SITE_CONFIG.phone` utilizando `src/lib/whatsapp-utils.ts`.
11. Ningún componente o texto exhiba información de inventario o stock.
12. La totalidad de las suites de prueba en Vitest y TypeScript pasen al 100% (`npx vitest run`, `npx tsc --noEmit`).

---

## 9. Dudas Resueltas

| ID        | Duda                                                                      | Resolución Definitiva                                                                                                                                                                                                                           |
| :-------- | :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DA-01** | Canal y número oficial de WhatsApp para recepción de pedidos y consultas. | **Resuelta:** Se utiliza el número oficial centralizado en `SITE_CONFIG.phone` de `src/config/site-config.ts` (con fallback opcional en `ENV.VITE_CONTACT_WHATSAPP`), garantizando un único punto inmutable de contacto.                        |
| **DA-02** | Tratamiento de imágenes de productos y placeholders.                      | **Resuelta:** Las imágenes son servidas por el backend desde `/uploads/` procesadas en WebP ≤ 500 KB (Spec 005). El frontend las resuelve con `resolveImageUrl()` de `src/lib/api.ts` y provee un fallback SVG accesible ante fallo o ausencia. |
| **DA-03** | Comportamiento del filtro de categoría padre sobre subcategorías.         | **Resuelta:** Seleccionar una categoría padre en el filtro expande automáticamente la búsqueda para incluir productos asociados a dicha categoría padre o a cualquiera de sus subcategorías hijas.                                              |
