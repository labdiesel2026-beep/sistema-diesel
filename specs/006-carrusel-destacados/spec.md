# Especificación — Fase 6: Gestión Dinámica del Carrusel de Productos Destacados

**Fase:** 006-carrusel-destacados  
**Versión:** 1.1 (Consolidada con Resoluciones de Tech Lead, QA & AppSec)  
**Fecha:** 2026-10-20  
**Basado en:** [docs/constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md), Specs 004-admin-panel y 005-backend  
**Estado:** Especificación Final Auditada y Aprobada  

---

## 1. Contexto y Objetivo

### 1.1 Contexto
La Landing Page del taller cuenta con un componente de carrusel continuo (*marquee*) orientado a captar la atención de clientes potenciales y exhibir repuestos estratégicos. En el estado actual, dicho componente opera con datos estáticos simulados (*mocks*) en el cliente, impidiendo que el taller promocione piezas reales según la disponibilidad de stock, novedades comerciales o repuestos de alta demanda.

Asimismo, el Panel de Administración (Backoffice) centraliza la gestión del inventario, pero carece de un mecanismo para que el operador audite y determine de forma autoritativa qué productos deben recibir exposición preferencial en la vitrina principal.

### 1.2 Objetivo
Definir las especificaciones funcionales y de negocio para la selección, persistencia relacional, control de concurrencia y exposición dinámica de **Productos Destacados**, permitiendo al Administrador marcar hasta un máximo de diez (10) productos desde el Backoffice para alimentar automáticamente el carrusel de la Landing Page, garantizando:
1. Una única fuente de verdad relacional (PostgreSQL) con control atómico de cupo.
2. Preservación del orden cronológico de destaque mediante una marca temporal dedicada (`featuredAt`).
3. Navegación directa y unívoca tipo "cebo de clics" (*click-through*) desde la Landing Page hacia la ficha técnica del producto en `/catalogo/$productId`.
4. Resiliencia operativa frente a fallos de red o desbordes por concurrencia, respetando estrictamente los principios de la constitución del proyecto.

---

## 2. Usuarios y Roles

| Rol | Descripción | Interacción con la Funcionalidad |
| :--- | :--- | :--- |
| **Administrador del Taller** | Operador autenticado del Backoffice con permisos de administración de catálogo. | Monitorea el cupo mediante el contador y la 6.ª métrica del Dashboard, activa/desactiva productos para el carrusel (vía tabla o formulario con feedback de carga) y filtra la grilla para auditar los productos en vitrina. |
| **Visitante / Cliente Potencial** | Usuario público que navega la Landing Page buscando repuestos o servicios diésel. | Visualiza los productos destacados activos en el carrusel y hace clic en cualquier tarjeta para navegar directamente a la ficha técnica del repuesto en el catálogo. |

---

## 3. Historias de Usuario

### HU-01: Marcado rápido de producto destacado desde la tabla de inventario
> **Como** Administrador del taller,  
> **quiero** alternar la condición de "Destacado" de un producto directamente en su fila de la grilla con confirmación del servidor y estado de carga,  
> **para que** pueda renovar el escaparate de la Landing Page de forma ágil sin desincronizar el estado frente a la base de datos.

### HU-02: Gestión de destacado durante la creación o edición de un producto
> **Como** Administrador del taller,  
> **quiero** definir si un repuesto es destacado mientras completo su formulario de alta o modificación (con el conmutador bloqueado si el cupo está colmado),  
> **para que** un nuevo ingreso estratégico quede publicado en la vitrina en una sola operación controlada.

### HU-03: Control y auditoría de cupo disponible
> **Como** Administrador del taller,  
> **quiero** visualizar un contador dinámico `"Destacados: X / 10"`, una tarjeta de métrica en el Dashboard y un filtro rápido `"Solo Destacados"` con combinación lógica,  
> **para que** pueda auditar la vitrina actual y liberar cupo rápidamente ante un límite alcanzado.

### HU-04: Exposición dinámica y enlace directo al catálogo en la Landing Page
> **Como** Visitante del sitio web,  
> **quiero** ver los repuestos destacados actualizados sin saltos de maquetación (*layout shift*) y poder cliquear sobre cualquier tarjeta,  
> **para que** el sistema me dirija de inmediato a `/catalogo/$productId` para consultar precios, especificaciones y disponibilidad.

### HU-05: Coexistencia entre visibilidad pública y retención de configuración
> **Como** Administrador del taller,  
> **quiero** que al pausar temporalmente la visibilidad general de un producto destacado, este se retire de la vitrina pública pero conserve su estado de destaque para cuando vuelva a activarse,  
> **para que** no pierda la configuración comercial previa ni su posición cronológica al reanudar su publicación.

---

## 4. Requisitos Funcionales

> **Convención:** Criterios de aceptación formulados en notación **EARS** (*Easy Approach to Requirements Syntax*).

### 4.1 Gestión en el Panel de Administración

#### RF-01: Acción rápida de destaque en la tabla de inventario
El sistema deberá proveer en la tabla de productos del Backoffice un control interactivo por cada fila (conmutador o estrella) para alternar el estado de destacado.

- **CA-01.1 (Actualización pesimista con spinner):** *When* el Administrador acciona el control de destacado en una fila, *the system shall* mostrar un indicador visual de carga (*spinner*) en dicho control y deshabilitar temporalmente la interacción de la fila hasta recibir la respuesta del backend.
- **CA-01.2 (Confirmación exitosa):** *When* el servidor confirma la mutación, *the system shall* conmutar el estado visual, actualizar el contador dinámico de cupo y notificar el éxito de la operación.
- **CA-01.3 (Reversión ante rechazo o error):** *When* la petición falle o sea rechazada por límite alcanzado o conflicto de concurrencia, *the system shall* restablecer el control a su estado previo sin alterar la grilla y desplegar una notificación emergente descriptiva.
- **CA-01.4 (Bloqueo en productos ocultos):** *While* un producto se encuentre en estado "Oculto", *the system shall* mantener el control de destacado deshabilitado (*disabled*) con una pista visual informativa.

#### RF-02: Control de destacado en el formulario de producto y manejo de cupo colmado
El sistema deberá incorporar un campo conmutable para gestionar el destaque dentro del modal/pantalla de alta y edición de productos.

- **CA-02.1 (Alta con cupo disponible):** *When* el Administrador crea un producto visible y activa el conmutador de destacado existiendo cupo (< 10), *the system shall* registrar el producto con `isFeatured: true` y asignarle la marca temporal actual en el campo dedicado `featuredAt`.
- **CA-02.2 (Alta con cupo saturado - Bloqueo preventivo):** *While* la base de datos registre diez (10) productos destacados activos y se abra el formulario de creación de un nuevo producto, *the system shall* renderizar el conmutador de destacado bloqueado (*disabled*) acompañado del texto: *"Límite de 10 destacados alcanzado. Desmarca uno primero desde la tabla"*.
- **CA-02.3 (Edición de producto ya destacado):** *While* se edite un producto que ya tiene `isFeatured: true`, *the system shall* mantener el conmutador habilitado para permitirle al usuario remover su condición de destacado sin importar que el cupo total esté en 10.

#### RF-03: Control estricto de cupo y prevención de condiciones de carrera (Persistencia atómica)
El sistema deberá garantizar que bajo ninguna circunstancia existan más de diez (10) productos con `isFeatured: true` de forma simultánea.

- **CA-03.1 (Transacción atómica de persistencia):** *When* se reciba una solicitud para marcar un producto como destacado, *the system shall* ejecutar la verificación del total de destacados actuales y la asignación dentro de una transacción de base de datos atómica e indivisible con bloqueo a nivel de fila (*row-level locking*), evitando lecturas sucias ante peticiones concurrentes.
- **CA-03.2 (Rechazo HTTP 409 Conflict):** *If* la cantidad de productos destacados ya es igual a 10 al momento de resolver la transacción, *then the system shall* abortar la mutación y responder con código HTTP `409 Conflict` y el cuerpo estandarizado `{ error: "Límite alcanzado. Desmarca un producto primero" }`.
- **CA-03.3 (Validación de frontera Fail-Fast):** Todo payload de actualización que involucre el estado de destacado deberá validarse contra un esquema Zod estricto en la frontera del controlador (Principio 2 de la Constitución).

#### RF-04: Métrica en Dashboard, contador dinámico y filtro de auditoría combinable
El sistema deberá proveer herramientas de supervisión del cupo y búsqueda ágil de productos destacados.

- **CA-04.1 (6.ª Tarjeta en Dashboard):** *When* el Administrador carga el Dashboard principal (`/admin/dashboard`), *the system shall* exhibir una sexta tarjeta de métrica titulada "Productos Destacados" indicando el valor cuantitativo `"X / 10"`, complementando las 5 tarjetas preexistentes (Totales, Visibles, Ocultos, Categorías y Marcas).
- **CA-04.2 (Contador dinámico en barra de herramientas):** *While* el Administrador se encuentre en la vista de inventario, *the system shall* mostrar en la barra de herramientas un indicador en tiempo real con el formato `"Destacados: X / 10"`.
- **CA-04.3 (Filtro "Solo Destacados" con intersección lógica AND):** *When* el Administrador active el filtro o chip "Solo Destacados" en la tabla, *the system shall* filtrar la lista exhibiendo únicamente los productos con `isFeatured: true`. Si simultáneamente se ingresa un término de búsqueda o un filtro de categoría, el sistema deberá aplicar una intersección lógica (`AND`), respetando la paginación y ordenamiento vigentes.

#### RF-05: Coexistencia con la visibilidad general y purga física en borrado
El sistema deberá desacoplar la retención del estado de destacado frente a pausas de visibilidad, reservando la purga total a la eliminación definitiva.

- **CA-05.1 (Preservación de estado en producto oculto):** *When* un producto con `isFeatured: true` cambia su visibilidad a "Oculto" (`visible: false`), *the system shall* mantener almacenados sus valores de `isFeatured: true` y `featuredAt` en la base de datos, pero **excluirlo automáticamente** de la consulta pública del carrusel.
- **CA-05.2 (Restauración de visibilidad):** *When* un producto oculto que conservaba `isFeatured: true` vuelve a conmutarse a "Visible", *the system shall* reincorporarlo a la vitrina del carrusel conservando su orden cronológico original dictado por su `featuredAt`, siempre que no se vulnere la consistencia del catálogo.
- **CA-05.3 (Purga definitiva por eliminación):** *When* se elimine físicamente un producto de la base de datos (`DELETE /api/products/:id`), *the system shall* remover el registro dentro de una transacción atómica, liberando de forma irreversible su lugar en el cupo de destacados.

### 4.2 Exposición y Consumo en la Landing Page

#### RF-06: Orden cronológico descendente estricto (LIFO) con marca temporal dedicada
El orden de los productos en el carrusel se regirá exclusivamente por el momento en que fueron destacados.

- **CA-06.1 (Marca temporal dedicada `featuredAt`):** La entidad de producto dispondrá de un campo dedicado `featuredAt` (marca temporal nullable).
- **CA-06.2 (Inmutabilidad frente a ediciones ordinarias):** *When* se actualicen campos generales del producto (precio, condición, compatibilidad vehicular, stock o descripción), *the system shall* preservar inalterado el valor de `featuredAt`, garantizando que la posición del producto en el carrusel no sufra desplazamientos arbitrarios.
- **CA-06.3 (Asignación y reseteo de `featuredAt`):** *When* un producto transiciona de no-destacado a destacado, *the system shall* estampar la fecha y hora UTC actual en `featuredAt`. Si es desmarcado, `featuredAt` pasará a `null`.
- **CA-06.4 (Reordenamiento voluntario por ciclo de desmarcado):** *When* el Administrador desmarque y vuelva a marcar un producto, *the system shall* renovar su `featuredAt`, reubicándolo en la primera posición de la secuencia LIFO (`orderBy: { featuredAt: 'desc' }`).

#### RF-07: Resiliencia en Landing Page y enlace cebo al catálogo
El componente de carrusel en la Landing Page deberá hidratarse con datos dinámicos minimizando el impacto en la experiencia del usuario.

- **CA-07.1 (Prevención de CLS durante la carga):** *While* la petición a la API de productos destacados se encuentre en estado pendiente (*loading*), *the system shall* renderizar un contenedor vacío de altura fija o un *skeleton* neutro preservando las dimensiones de la sección para evitar desplazamientos acumulados de diseño (*Cumulative Layout Shift - CLS*).
- **CA-07.2 (Degradación elegante ante fallos de API o 0 destacados):** *If* la API responde con una lista vacía (0 destacados), o si la petición falla por error de servidor (500) o tiempo de espera (*timeout*), *then the system shall* degradar silenciosamente desmontando la sección completa del carrusel, asegurando que la Landing Page continúe operativa sin mostrar áreas rotas o mensajes de error al visitante.
- **CA-07.3 (Enlace cebo unificado a `/catalogo/$productId`):** *When* el visitante hace clic sobre cualquier parte de una tarjeta en el carrusel, *the system shall* navegar a la ruta del catálogo `/catalogo/$productId` correspondiente a ese repuesto exacto.
- **CA-07.4 (Ajuste estructural de la tarjeta):** El componente de la tarjeta deberá ajustarse estructuralmente para envolver todo su contenido en un único enlace semántico accesible (`<Link to={`/catalogo/${product.id}`}>`), eliminando cualquier botón interactivo interno previo que compita con el evento de navegación.
- **CA-07.5 (Filtro público de destacados activos):** El endpoint público que suministre los repuestos para el carrusel deberá retornar únicamente productos que cumplan la condición lógica estricta: `visible: true` y `isFeatured: true`, limitando el resultado a un máximo de diez (10) elementos ordenados por `featuredAt DESC`.

---

## 5. Requisitos No Funcionales

### RNF-01: Integridad Transaccional y Única Fuente de Verdad _(constitution.md §5)_
- PostgreSQL es la única fuente de verdad autoritativa para el estado de los destacados.
- La validación del cupo de 10 productos debe resolverse en base de datos mediante transacciones con aislamiento y bloqueo de fila para neutralizar desbordes por condiciones de carrera concurrentes.

### RNF-02: Validación Fail-Fast en Frontera _(constitution.md §2)_
- Toda petición de mutación (`POST`, `PUT`, `PATCH`) que modifique la visibilidad o el estado de destacado debe ser interceptada y validada en frontera con esquemas Zod en modo estricto (`.strict()`). Parámetros inválidos desencadenan una respuesta inmediata `400 Bad Request` antes de alcanzar la capa de servicio.

### RNF-03: Errores Opacos y Respuestas Estandarizadas _(constitution.md §6)_
- Excesos de cupo por concurrencia o conflictos de estado deben responder con código HTTP `409 Conflict` y mensaje claro legible para la interfaz de administración (`{ error: string }`).
- Cualquier excepción no controlada a nivel de servidor debe enmascararse como error opaco `500 Internal Server Error` con identificador único `{ error: "Error interno del servidor", referencia: "<uuid>" }`, registrando el detalle técnico exclusivamente en los logs internos del sistema.

### RNF-04: Ergonomía de Interfaz y Prevención de Desincronización
- Queda prohibida la actualización puramente optimista en la grilla de productos para la propiedad de destacado. La interfaz debe reflejar el estado de espera (*loading*) y mutar únicamente tras la confirmación formal del backend, evitando discrepancias entre la pantalla del usuario y la persistencia real.

### RNF-05: Rendimiento y Eficiencia de Carga Pública
- La consulta pública del carrusel debe devolver un DTO liviano optimizado exclusivamente con los campos requeridos por las tarjetas (id, nombre, precio, imagen optimizada WebP, condición y marca), reduciendo la transferencia de datos y el tiempo de respuesta en la Landing Page.

---

## 6. Casos Límite y Reglas de Negocio Consolidadas

| # | Escenario | Comportamiento Esperado del Sistema |
| :--- | :--- | :--- |
| **CL-01** | Catálogo con cero (0) productos destacados activos. | La sección completa del carrusel en la Landing Page no se renderiza. No se generan alertas, espacios vacíos ni errores en consola. |
| **CL-02** | La API de destacados falla por error 500 o timeout de red al cargar la Landing Page. | El componente degrada de forma silenciosa y desmonta la sección del carrusel, preservando el resto de la Landing intacto (RNF-03). |
| **CL-03** | Intento de destacar un 11.º producto en la grilla o vía API. | La mutación es bloqueada bajo transacción atómica. La API responde `409 Conflict` y la interfaz del Backoffice emite una notificación: *"Límite alcanzado. Desmarca un producto primero"*. El switch vuelve a su estado inactivo. |
| **CL-04** | Peticiones concurrentes simultáneas intentando destacar productos cuando el cupo está en 9/10. | El bloqueo atómico de la base de datos procesa una solicitud como exitosa (cupo pasa a 10/10) y rechaza la segunda con `409 Conflict`, evitando inconsistencias de sobrecupo (11/10). |
| **CL-05** | Formulario de creación de producto cuando el cupo de destacados ya está en 10/10. | El conmutador de "Destacado" se presenta deshabilitado (*disabled*) de entrada con texto explicativo, evitando que el usuario complete el formulario para luego ser rechazado. |
| **CL-06** | Administrador cambia la visibilidad de un producto destacado a "Oculto". | El registro mantiene `isFeatured: true` y su valor `featuredAt`, pero el backend lo excluye de la consulta pública del carrusel por tener `visible: false`. El control de destacado en la fila de la grilla se bloquea (*disabled*). |
| **CL-07** | Administrador vuelve a hacer "Visible" un producto oculto que tenía `isFeatured: true`. | El producto reaparece automáticamente en el carrusel de la Landing Page conservando su orden dictado por su `featuredAt` histórico. |
| **CL-08** | Administrador elimina definitivamente un producto que figuraba como destacado. | El registro se elimina físicamente de la base de datos y su lugar en el cupo de 10 queda liberado de inmediato. |
| **CL-09** | Administrador edita el precio, nombre o descripción de un producto destacado. | El producto actualiza sus datos y su `updatedAt`, pero el campo `featuredAt` permanece idéntico. La tarjeta conserva exactamente su posición en el carrusel. |
| **CL-10** | Administrador desea adelantar un producto a la primera posición del carrusel. | Desmarca el producto (su `featuredAt` pasa a `null`) y lo vuelve a marcar (se asigna nuevo `featuredAt` con fecha actual UTC). Al consultar LIFO, el repuesto pasa al inicio de la vitrina. |
| **CL-11** | Uso combinado del filtro "Solo Destacados" con búsqueda de texto o filtro de categoría en la grilla. | La grilla ejecuta una intersección lógica (`AND`), mostrando únicamente aquellos productos destacados que coincidan con el texto y la categoría seleccionados. |
| **CL-12** | Producto destacado con precio `$0` o toggle "Mostrar precio" desactivado. | La tarjeta del carrusel respeta el formateador estándar del catálogo exhibiendo la etiqueta "Consultar precio" sin alterar el enlace directo a `/catalogo/$productId`. |

---

## 7. Delimitación del Alcance (Dentro y Fuera de Alcance)

### 7.1 Dentro de Alcance
1. **Persistencia y Modelo de Datos:** Incorporación de las columnas `isFeatured: Boolean` (por defecto `false`) y `featuredAt: DateTime?` en la entidad de producto en PostgreSQL vía Prisma.
2. **Lógica de Servidor y Transacciones:** Endpoints de actualización de productos y consulta pública con transacciones atómicas para el límite de 10 elementos, validación Zod estricta y ordenamiento LIFO (`featuredAt DESC`).
3. **Backoffice / Panel de Administración:**
   - Adición de la 6.ª tarjeta de métrica en el Dashboard ("Productos Destacados: X / 10").
   - Contador dinámico en la barra de herramientas de la tabla de inventario.
   - Conmutador con estado de carga pesimista en cada fila de la grilla de productos.
   - Conmutador de destacado en el formulario de alta y edición con bloqueo preventivo si el cupo está saturado.
   - Filtro de auditoría "Solo Destacados" combinable con búsqueda y taxonomía.
4. **Hidratación y Ajuste Estructural en la Landing Page:**
   - Reemplazo de los datos de prueba (*mocks*) por la consulta a la API de destacados activos (`visible: true` y `isFeatured: true`).
   - Gestión de estados de carga con *skeleton* de altura fija para prevenir *CLS* y degradación silenciosa ante errores de red/API.
   - Ajuste en el componente de tarjeta existente para envolver su contenido íntegro en `<Link to={`/catalogo/${product.id}`}>` y remover botones secundarios internos.

### 7.2 Fuera de Alcance
1. **Rediseño estético y animaciones del carrusel:** Las animaciones continuas de *marquee*, la paleta de colores, la tipografía y los estilos responsivos ya implementados se conservan intactos.
2. **Reordenamiento manual arbitrario (*drag and drop* o índices numéricos):** Se descarta complejidad innecesaria; el ordenamiento obedece exclusivamente a la frescura de destaque (LIFO).
3. **Múltiples vitrinas o carruseles temáticos:** Existe una única vitrina global de repuestos destacados para la Landing Page.
4. **Acciones directas secundarias en la tarjeta del carrusel:** Se excluyen botones de compra directa, agregado al carrito o disparadores de WhatsApp dentro de la tarjeta; toda la tarjeta actúa unívocamente como enlace cebo al catálogo.
5. **Telemetría o analíticas de conversión (CTR):** La medición estadística de impresiones y clics no forma parte de este MVP.

---

## 8. Criterios de Finalización (Definition of Done)

- [ ] Esquema de base de datos migrado con los campos `isFeatured` y `featuredAt` en la tabla de productos.
- [ ] Endpoints de actualización y conmutación de productos protegidos con esquemas Zod en modo estricto (`.strict()`) y transacciones atómicas que impidan superar el límite de 10 elementos, retornando `409 Conflict` en caso de colisión.
- [ ] Manejo de errores opacos con UUID (`500`) ante excepciones no controladas en el backend.
- [ ] Conmutador en la grilla de productos del Backoffice operando con actualización pesimista (spinner temporal) y bloqueo deshabilitado en productos con visibilidad oculta.
- [ ] Conmutador en formulario de alta de producto deshabilitado de forma preventiva si la base de datos reporta 10 productos destacados activos.
- [ ] Incorporación de la 6.ª tarjeta de métrica en el Dashboard del Backoffice ("Productos Destacados: X / 10").
- [ ] Contador dinámico `"Destacados: X / 10"` y filtro de auditoría `"Solo Destacados"` funcionales en la grilla del Backoffice con soporte de filtros combinados (`AND`).
- [ ] Endpoint público que suministre los productos destacados activos (`visible: true` e `isFeatured: true`) ordenados de forma descendente por `featuredAt` (LIFO).
- [ ] Componente de carrusel en la Landing Page hidratado desde la API, con contenedor preventivo de *CLS* en carga, supresión silenciosa en caso de error/vacío y ajuste de la tarjeta como enlace semántico íntegro hacia `/catalogo/$productId`.

---

## 9. Resoluciones de Auditoría y Estado de Dudas

Todas las observaciones del informe de QA han sido resueltas formalmente e incorporadas a la especificación:
1. Marca temporal desacoplada mediante `featuredAt` (DateTime nullable) independiente de `updatedAt`.
2. Ruta formal hacia el catálogo: `/catalogo/$productId`.
3. Prevención de CLS con placeholder/skeleton y supresión silenciosa ante error 500 o timeout de API en la Landing Page.
4. Bloqueo preventivo (*disabled*) en formulario de alta cuando el cupo esté en 10/10.
5. Inclusión de la 6.ª tarjeta de métrica en el Dashboard.
6. Ajuste estructural explícito de la tarjeta como enlace unificado excluyendo botones secundarios.
7. Actualización pesimista con spinner en la grilla descartando desincronización por updates optimistas.
8. Preservación del estado de destaque en productos pausados (ocultos) para evitar pérdida de configuración comercial.
9. Control de concurrencia y transacciones atómicas con bloqueo a nivel de fila en PostgreSQL.
10. Validación Zod Fail-Fast, respuesta `409 Conflict` por colisión de cupo y errores 500 opacos con referencia UUID.

*No quedan dudas abiertas ni requerimientos ambiguos marcados como [NECESITA ACLARACIÓN]. La especificación se encuentra lista para la fase de diseño técnico y planificación.*
