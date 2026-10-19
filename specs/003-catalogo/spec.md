# Spec 003 — Catálogo de Productos y Repuestos

## 1. Contexto y Objetivo

### 1.1 Contexto

Laboratorio Diésel necesita que sus clientes puedan identificar repuestos y productos técnicos ofrecidos por el taller antes de iniciar una consulta comercial. El SRS define la búsqueda por código OEM, nombre, marca y compatibilidad vehicular, además de filtros por marca y categorías. La Spec 002 establece la experiencia institucional y la identidad visual con la que este catálogo debe convivir.

### 1.2 Objetivo

Ofrecer un catálogo público, claro y adaptable a dispositivos móviles para explorar productos diésel, revisar su información técnica y consultar precios. El visitante podrá iniciar una consulta individual desde la ficha de un producto o reunir varios productos en un carrito y enviar una única consulta a WhatsApp, sin crear una cuenta ni completar un formulario previo.

El catálogo busca reducir consultas ambiguas y facilitar que el taller reciba el detalle de los productos de interés. No constituye una compra confirmada ni garantiza disponibilidad.

### 1.3 Relación con especificaciones existentes

La experiencia deberá conservar la continuidad visual y funcional con el diseño institucional definido en las Specs 001 y 002, incluidos el layout público, la navegación, el pie de página y la paleta de colores. Esta especificación desarrolla los casos de uso de búsqueda y filtrado y de consulta por WhatsApp descritos en el SRS.

El catálogo comprende productos y repuestos, incluidos inyectores y bombas. Los servicios del taller seguirán presentándose en la sección institucional y no serán elementos cotizables del catálogo.

## 2. Usuarios

| Usuario | Necesidad |
|:---|:---|
| **Cliente final / visitante** | Encontrar una pieza o producto relevante, entender sus características y consultar al taller sin registrarse. |
| **Mecánico o transportista** | Buscar por referencias técnicas, marca o compatibilidad para identificar los productos que necesita. |
| **Administrador del taller** | Mantener información de productos y su visibilidad a través de las capacidades de gestión del catálogo previstas por el sistema; dicha gestión no forma parte de esta especificación. |

## 3. Historias de Usuario

- **HU-01:** Como cliente, quiero buscar por nombre, código OEM, marca o compatibilidad vehicular para encontrar rápidamente el producto que necesito.
- **HU-02:** Como cliente, quiero combinar filtros de marca y categoría para acotar los resultados a productos relevantes.
- **HU-03:** Como cliente, quiero revisar una ficha con la información técnica disponible para evaluar si el producto corresponde a mi necesidad.
- **HU-04:** Como cliente, quiero saber si el precio se publica o debe consultarse para iniciar la conversación con expectativas claras.
- **HU-05:** Como cliente interesado en un producto, quiero abrir una consulta de WhatsApp desde su ficha con el producto identificado en el mensaje.
- **HU-06:** Como cliente interesado en varios productos, quiero reunirlos en un carrito y enviar una sola consulta detallada a WhatsApp.
- **HU-07:** Como visitante desde un teléfono, quiero explorar el catálogo y completar una consulta sin perder la continuidad visual ni la facilidad de uso del sitio.

## 4. Requisitos Funcionales

### RF-01 — Integración con la experiencia institucional

**Criterios de aceptación (EARS):**

- **Cuando** un visitante acceda al catálogo, **el sistema deberá** presentarlo como parte de la experiencia pública de Laboratorio Diésel, manteniendo la navegación, el layout, el pie de página y la identidad visual establecidos por las Specs 001 y 002.
- **Cuando** el visitante use la navegación pública para cambiar entre el catálogo y las secciones institucionales, **el sistema deberá** conservar una experiencia coherente y comprensible.

### RF-02 — Listado de productos visibles

**Criterios de aceptación (EARS):**

- **Cuando** se muestre el catálogo, **el sistema deberá** incluir únicamente productos que estén publicados como visibles.
- **Cuando** un producto no esté visible, **el sistema deberá** excluirlo del listado público y de los resultados de búsqueda y filtrado.
- **Cuando** no haya productos visibles, **el sistema deberá** mostrar un estado informativo que indique que el catálogo no tiene productos para mostrar.
- **Cuando** falle la carga del catálogo, **el sistema deberá** mostrar el mensaje amigable “Error temporal al cargar el catálogo” y una acción para reintentar la carga mediante un Error Boundary del catálogo.

### RF-03 — Búsqueda de productos

**Criterios de aceptación (EARS):**

- **Cuando** el visitante ingrese un término de búsqueda, **el sistema deberá** encontrar coincidencias parciales, sin distinguir mayúsculas de minúsculas ni acentos, en el nombre del producto, el código OEM, la marca y la compatibilidad de marca o modelo de vehículo, cuando esos datos existan.
- **Cuando** un término coincida con el código OEM y con otros campos, **el sistema deberá** priorizar los productos coincidentes por código OEM en los resultados.
- **Cuando** el visitante modifique o limpie el término de búsqueda, **el sistema deberá** actualizar los resultados de acuerdo con el término vigente.
- **Cuando** haya un término de búsqueda activo y el visitante seleccione filtros, **el sistema deberá** combinar ambos criterios para determinar los resultados.

### RF-04 — Filtros de marca y categoría

**Criterios de aceptación (EARS):**

- **Cuando** el visitante seleccione una marca, **el sistema deberá** limitar los resultados a productos asociados con esa marca.
- **Cuando** el visitante seleccione una o más categorías o subcategorías, **el sistema deberá** incluir productos asociados con cualquiera de esas selecciones (OR entre categorías).
- **Cuando** el visitante combine una búsqueda, una marca y una o más selecciones de categoría, **el sistema deberá** aplicar AND entre el texto de búsqueda, la marca seleccionada y el conjunto de categorías seleccionadas.
- **Cuando** el visitante quite un filtro, **el sistema deberá** actualizar los resultados conservando los demás criterios vigentes.

### RF-05 — Estado sin resultados

**Criterios de aceptación (EARS):**

- **Cuando** la búsqueda o combinación de filtros no produzca coincidencias, **el sistema deberá** indicar claramente que no se encontraron productos.
- **Cuando** no haya resultados, **el sistema deberá** ofrecer una acción para consultar al taller por WhatsApp acerca de la pieza buscada.
- **Cuando** el visitante use esa acción, **el sistema deberá** iniciar una consulta que preserve el texto de búsqueda disponible, si lo hubiera, para dar contexto al taller.
- **Cuando** no haya resultados debido a filtros activos, **el sistema deberá** incluir en el contexto del mensaje las marcas y categorías o subcategorías filtradas.

### RF-06 — Tarjetas y ficha técnica

**Criterios de aceptación (EARS):**

- **Cuando** se muestren resultados, **el sistema deberá** presentar en cada tarjeta, como mínimo, la imagen del producto o un placeholder, el nombre, el código OEM cuando exista, el precio o la leyenda “Consultar precio” y un botón de acción.
- **Cuando** el visitante abra un producto visible, **el sistema deberá** mostrar su ficha técnica con los datos disponibles: nombre, imagen, descripción, marca, categoría o categorías, código OEM, compatibilidad vehicular y condición de la pieza.
- **Cuando** la imagen de un producto no esté disponible, **el sistema deberá** mostrar un placeholder genérico “Imagen no disponible” en formato SVG local.
- **Cuando** alguno de los demás datos opcionales no esté informado, **el sistema deberá** omitirlo o indicar que no fue informado sin presentar un valor inventado.
- **Cuando** el visitante solicite una consulta directa desde una ficha, **el sistema deberá** ofrecer una acción de WhatsApp identificada con ese producto.

### RF-07 — Presentación del precio

**Criterios de aceptación (EARS):**

- **Cuando** un producto tenga un precio cargado y habilitado para mostrarse, **el sistema deberá** presentar ese precio en pesos argentinos en la tarjeta y en la ficha.
- **Cuando** el precio no esté cargado o no esté habilitado para mostrarse, **el sistema deberá** presentar la leyenda **“Consultar precio”** en la tarjeta y en la ficha.
- **Cuando** un producto se agregue a una consulta sin precio público, **el sistema deberá** identificarlo como **“A cotizar”** en el resumen y en el mensaje preparado para WhatsApp.

### RF-08 — Carrito de consultas

**Criterios de aceptación (EARS):**

- **Cuando** el visitante agregue un producto visible al carrito, **el sistema deberá** incorporarlo al resumen de consulta, tanto si tiene precio publicado como si requiere cotización.
- **Cuando** el visitante agregue nuevamente un producto que ya está en el carrito, **el sistema deberá** incrementar su cantidad en una unidad y mantenerlo en una única línea.
- **Cuando** el visitante actualice la cantidad de un producto, **el sistema deberá** reflejar la cantidad elegida en el resumen.
- **Cuando** el visitante quite un producto o vacíe el carrito, **el sistema deberá** actualizar el resumen para reflejar el cambio.
- **Cuando** el visitante recargue la página, **el sistema deberá** conservar la selección del carrito para permitirle retomar la consulta.
- **Cuando** el carrito no contenga productos, **el sistema deberá** indicar que está vacío y no deberá ofrecer el envío de un pedido vacío.
- **Cuando** el visitante agregue o cambie cantidades, **el sistema no deberá** descontar, reservar ni limitar cantidades por existencias.
- **Cuando** el visitante agregue productos al carrito, **el sistema no deberá** imponer un límite máximo al número de productos distintos que puede contener.

### RF-09 — Consulta directa por un producto

**Criterios de aceptación (EARS):**

- **Cuando** el visitante elija consultar un producto desde su ficha, **el sistema deberá** abrir WhatsApp con un mensaje que identifique el producto y, cuando existan, su código OEM y su precio público o la indicación “A cotizar”.
- **Cuando** el visitante consulte directamente un producto desde su ficha, **el sistema deberá** asumir e incluir una cantidad de una unidad en el mensaje y no deberá solicitar que el visitante elija la cantidad en la ficha.
- **Cuando** el visitante inicie una consulta directa, **el sistema no deberá** exigirle crear una cuenta ni completar un formulario previo.

### RF-10 — Envío de una consulta desde el carrito

**Criterios de aceptación (EARS):**

- **Cuando** el visitante elija enviar un carrito no vacío, **el sistema deberá** abrir WhatsApp con un mensaje estructurado que incluya cada producto, su cantidad, su código OEM si existe y su precio unitario público o la indicación “A cotizar”.
- **Cuando** el sistema prepare el enlace de WhatsApp, **el sistema deberá** obtener los datos y precios vigentes de los productos desde la base de datos o desde una caché de catálogo actualizada al momento de preparar el enlace, y no deberá usar datos obsoletos del caché local del carrito.
- **Cuando** no se pueda obtener un precio vigente para un producto del carrito, **el sistema no deberá** reutilizar un precio posiblemente desactualizado y **deberá** identificarlo como “A cotizar”.
- **Cuando** el visitante envíe una consulta que exceda el límite de caracteres que WhatsApp admite, **el sistema no deberá** imponer un límite propio de productos; el límite y el comportamiento del mensaje corresponderán a WhatsApp.
- **Cuando** el visitante inicie el envío desde el carrito, **el sistema no deberá** exigirle crear una cuenta ni completar un formulario previo.
- **Cuando** el visitante elija la acción de envío, **el sistema deberá** dejar que WhatsApp presente el mensaje para que el visitante lo revise y decida enviarlo; el sitio no deberá comunicar que la consulta es una compra confirmada.

### RF-11 — Producto que deja de estar visible

**Criterios de aceptación (EARS):**

- **Cuando** un producto ya incorporado al carrito deje de estar visible en el catálogo, **el sistema deberá** mantenerlo en el resumen de esa consulta y señalar su “Vigencia en catálogo” como pendiente de reconfirmación con el taller, sin mostrar stock ni existencias.
- **Cuando** el visitante decida enviar un carrito que contiene un producto cuya vigencia en catálogo requiere reconfirmación, **el sistema deberá** conservar esa advertencia en el contexto de la consulta y permitir que el visitante la envíe a WhatsApp.
- **Cuando** el visitante acceda mediante enlace directo a un producto oculto, eliminado o inexistente, **el sistema deberá** mostrar una pantalla de “Producto no disponible” en lugar de la ficha y no deberá ofrecerlo para una nueva selección.

### RF-12 — Catálogo sin información pública de stock

**Criterios de aceptación (EARS):**

- **Cuando** el visitante navegue el catálogo o el carrito, **el sistema no deberá** mostrar cantidades de existencias ni indicadores públicos de stock o disponibilidad.
- **Cuando** el sistema informe que un producto dejó de estar visible, **el sistema deberá** describir únicamente su vigencia en el catálogo y no deberá presentarla como información de stock o existencias.
- **Cuando** el visitante envíe una consulta, **el sistema deberá** comunicar que se trata de una solicitud de información y no de una reserva de existencias.

## 5. Requisitos No Funcionales

| ID | Categoría | Requisito |
|:---|:---|:---|
| **RNF-01** | Identidad visual | La experiencia del catálogo deberá mantener la paleta azul, neutra y blanca, y el lenguaje visual profesional establecidos para el sitio institucional. |
| **RNF-02** | Diseño adaptable | El listado, los filtros, las fichas y el carrito deberán ser utilizables en teléfonos, tabletas y equipos de escritorio, con un enfoque de diseño móvil primero y un ancho mínimo de pantalla de 320 px. |
| **RNF-03** | Rendimiento percibido | En condiciones normales de conexión, la búsqueda y la aplicación de filtros deberán actualizar y mostrar resultados en menos de 2 segundos. |
| **RNF-04** | Accesibilidad y claridad | Los controles de búsqueda, filtros, cantidades y consulta deberán tener nombres comprensibles, permitir su uso mediante teclado y presentar estados, errores y cambios de resultados de manera perceptible. Las imágenes deberán contar con descripciones alternativas apropiadas. |
| **RNF-05** | Comunicación veraz | El catálogo y el mensaje de WhatsApp deberán distinguir una consulta de una compra confirmada, no prometer existencias y presentar precios únicamente bajo las condiciones definidas en RF-07. |
| **RNF-06** | Idioma | Los textos, mensajes de estado y acciones del catálogo deberán estar redactados en español. |
| **RNF-07** | Persistencia efímera del carrito | El estado del carrito podrá conservarse en una caché efímera del navegador, por ejemplo `localStorage`, para permitir retomar una consulta. Esa persistencia será descartable y no autoritativa; no reemplazará ni contradecirá la base de datos como fuente de verdad. Los datos vigentes de productos y precios se actualizarán al preparar el enlace de WhatsApp. |

## 6. Casos Límite

| ID | Situación | Comportamiento esperado |
|:---|:---|:---|
| **CL-01** | No existen productos visibles. | Mostrar el estado vacío del catálogo sin presentar productos ocultos. |
| **CL-02** | La búsqueda o los filtros no encuentran coincidencias. | Mostrar el estado sin resultados y ofrecer una consulta por WhatsApp contextualizada con el término de búsqueda cuando exista. |
| **CL-03** | Un producto no tiene imagen o alguno de sus datos opcionales. | Si falta la imagen, mostrar el placeholder SVG local “Imagen no disponible”. Para los demás datos opcionales, no inventar ni mostrar información vacía como si fuera un dato real. |
| **CL-04** | El precio del producto no se publica. | Mostrar “Consultar precio” en tarjeta y ficha; al incluirlo en una consulta, identificarlo como “A cotizar”. |
| **CL-05** | El visitante recarga la página con productos en el carrito. | La selección debe conservarse para que pueda retomar la consulta. |
| **CL-06** | Un producto del carrito deja de estar visible. | Conservarlo en el resumen de consulta, mostrar “Vigencia en catálogo: requiere reconfirmación” y permitir incluirlo en el mensaje de WhatsApp, sin exponer stock ni existencias. |
| **CL-07** | El visitante intenta enviar un carrito vacío. | No iniciar un envío de pedido y mostrar que primero debe agregar productos. |
| **CL-08** | WhatsApp no está instalado o no está disponible en el dispositivo. | El sitio no debe afirmar que el mensaje fue entregado; debe dejar que el dispositivo o navegador gestione la apertura del enlace y mantener accesible la información del carrito en el sitio. |
| **CL-09** | El contenido del mensaje contiene caracteres especiales o excede el límite aceptado por WhatsApp. | El contenido debe conservarse de forma legible al iniciar la consulta; el sitio no debe alterar nombres o referencias técnicas ni imponer un límite propio de productos. WhatsApp determina el límite de caracteres y el comportamiento de la apertura del mensaje. |
| **CL-10** | El visitante ingresa una cantidad no válida o menor que una unidad. | No permitir que se use esa cantidad en el resumen o en el mensaje de consulta; informar cómo corregirla. |
| **CL-11** | Falla la carga del catálogo. | Mostrar “Error temporal al cargar el catálogo” y una acción para reintentar la carga mediante el Error Boundary del catálogo. |
| **CL-12** | El visitante accede por enlace directo a un producto oculto, eliminado o inexistente. | Mostrar la pantalla “Producto no disponible” y no presentar la ficha técnica ni permitir una nueva selección. |
| **CL-13** | Un producto del carrito fue eliminado o sus datos ya no están disponibles en el catálogo vigente. | Mantenerlo identificable en la consulta, marcar su vigencia en catálogo para reconfirmación y no reutilizar precios locales posiblemente desactualizados. |

## 7. Fuera de Alcance

- Compra y pago en línea.
- Gestión de envíos, entregas o seguimiento de pedidos.
- Creación de cuentas o autenticación de clientes.
- Control, publicación o reserva de existencias; el catálogo no muestra cantidades ni disponibilidad.
- Servicios del taller como elementos del catálogo cotizable; se mantienen en la sección institucional.
- Gestión administrativa de productos, marcas, categorías, precios o visibilidad, que corresponde a las capacidades de administración del catálogo y no a esta experiencia pública.
- Descuentos, promociones, impuestos o cálculo de totales como compromiso comercial.
- Confirmación automática de pedidos o garantía de disponibilidad mediante WhatsApp.

## 8. Criterios de Finalización

La especificación se considerará implementada cuando se verifique que:

1. El catálogo conserva el layout, la navegación, el pie de página y la identidad visual de las Specs 001 y 002.
2. Solo aparecen productos visibles, y el estado vacío se presenta correctamente cuando no hay productos publicados.
3. La búsqueda parcial ignora mayúsculas, minúsculas y acentos, y prioriza coincidencias por código OEM.
4. Los filtros por marca y categoría funcionan individualmente y combinados con AND entre búsqueda y marca y OR entre las categorías seleccionadas.
5. El estado sin resultados ofrece una consulta contextualizada con el término y, cuando correspondan, las marcas y categorías filtradas.
6. Las tarjetas muestran imagen o placeholder, nombre, OEM cuando exista, precio o “Consultar precio” y un botón de acción; la ficha muestra los datos disponibles.
7. El precio se muestra solo cuando está habilitado; en los demás casos se muestra “Consultar precio” y el carrito identifica el producto como “A cotizar”.
8. El visitante puede iniciar una consulta directa asumiendo una unidad, o reunir varios productos en un carrito, modificar cantidades y quitar productos.
9. Al volver a agregar un producto al carrito, se incrementa su cantidad en una única línea; no existe un límite impuesto por el sistema al número de productos distintos.
10. La selección del carrito sobrevive a una recarga mediante caché local efímera y no autoritativa; un carrito vacío no puede enviarse como pedido.
11. Antes de preparar el enlace de WhatsApp se actualizan los datos y precios con la información vigente disponible, y el mensaje no presenta la consulta como compra confirmada.
12. Un producto que deja de estar visible permanece en el carrito con advertencia de vigencia en catálogo; un acceso directo a producto oculto, eliminado o inexistente muestra “Producto no disponible”.
13. No se publica información de stock ni se reservan existencias.
14. Si falla la carga del catálogo, se muestra el mensaje de error temporal y la acción de reintento.
15. Los estados de error y los controles son comprensibles y usables en móvil y escritorio, mediante teclado y tecnologías de asistencia.
16. La búsqueda y los filtros cumplen el objetivo de actualización de resultados definido en RNF-03 bajo condiciones normales de conexión.

## 9. Dudas Abiertas

| ID | Duda | Estado |
|:---|:---|:---|
| **DA-01** | Número oficial de WhatsApp para las consultas. | **Resuelta:** se utilizará el número de la constante inmutable definida en `site-config.ts` en la Spec 002. |
