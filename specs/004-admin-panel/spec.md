# Especificación — Fase 4: Panel de Administración y Seguridad (Backoffice)

**Fase:** 004-admin-panel  
**Versión:** 1.2 (Auditada con resoluciones finales de Tech Lead & QA)  
**Fecha:** 2026-10-18  
**Basado en:** SRS v1.0 (Sección 5.4, CU-04 a CU-07), `constitution.md`, `AGENTS.MD`  
**Estado:** Especificación Final Consolidada

---

## 1. Contexto y Objetivo

### 1.1 Contexto

El proyecto Laboratorio Diésel (MVP) consta de tres subsistemas: Landing Page (Fase 2, completada), Catálogo Público (Fase 3, en desarrollo paralelo) y Panel de Administración/Backoffice (esta Fase 4).

El Backoffice es la interfaz privada y protegida donde el **Administrador** (propietario del taller o personal designado) gestiona el contenido que alimenta al Catálogo Público. Sin este módulo, el cliente no tiene autonomía operativa para mantener su catálogo digital actualizado (Objetivo 1.2.4 del SRS).

### 1.2 Objetivo de la Fase

Construir un módulo de administración **completo, funcional y aislado** que permita al Administrador:

1. **Autenticarse** de forma segura mediante un flujo de login simulado (mock) que replique fielmente el contrato de seguridad Zero-Trust definido en la constitución del proyecto, protegiendo todas las rutas administrativas tras un guard estricto.
2. **Gestionar el ciclo de vida completo** de:
   - **Productos**: crear, editar, alternar visibilidad (pausar/activar) y eliminar permanentemente, con validación de datos, fallback de imagen y persistencia relacional por IDs.
   - **Categorías y Subcategorías jerárquicas**: crear, editar y eliminar con bloqueo estricto por integridad referencial (máximo 1 nivel de anidamiento: Categoría Padre -> Subcategoría Hija) y prevención de ciclos jerárquicos.
   - **Marcas**: crear, editar, listar y eliminar marcas por nombre (alcance mínimo, sin logo), con resolución relacional por ID.
3. **Visualizar un dashboard** con métricas cuantitativas del estado del catálogo (productos totales, visibles, ocultos, categorías y marcas) y accesos directos de navegación.
4. **Aplicar validaciones robustas Fail-Fast** en el frontend (Zod en formularios y validación de metadata de archivos de imagen) con manejo de errores estandarizado.
5. **Garantizar la resiliencia en el arranque (Crash Early con Fallback de Desarrollo)** validando variables de entorno con Zod y notificando por consola si operan con defaults de entorno local.

Todo el estado es gestionado en memoria (React Context) con datos semilla precargados estructurados con identificadores UUIDv4 (`crypto.randomUUID()`), sin persistencia en `localStorage`, preparado para ser reemplazado por llamadas a API reales (`credentials: 'include'` y cabecera anti-CSRF) sin cambios estructurales en los componentes.

### 1.3 Decisiones de Diseño y Resoluciones Técnicas Consolidadas

| # | Decisión / Resolución | Justificación y Regla de Negocio |
|---|-----------------------|----------------------------------|
| D-01 | **Credenciales fijas en Mock:** `admin@laboratoriodiesel.com` y `admin123`. Token simulado en memoria por pestaña. | Provee credenciales unificadas para testing. El token nunca se almacena en `localStorage` (Zero-Trust). Al presionar F5, la sesión se reinicia y vuelve al Login (comportamiento mock temporal y documentado). |
| D-02 | **Redirección de Login Flexible:** Redirigir a la ruta raíz administrativa `/admin`. | El enrutador de TanStack Router resuelve la vista por defecto (catálogo de productos). No se fuerza un dashboard rígido, permitiendo navegación coherente. |
| D-03 | **ABM de Marcas mínimo y relacional:** solo campo `nombre`. | Requisito SRS 5.4.5 cubierto. La entidad producto solo almacena `brandId`; el nombre de marca se resuelve relacionalmente para evitar desnormalización. |
| D-04 | **Validación de imágenes, preview y reemplazo:** archivos `.jpg`, `.jpeg`, `.png`, `.webp`, tamaño `<=` 5 MB (5.00 MB pasa, 5.01 MB falla). | Frontend actúa como primera línea de defensa. La selección de una nueva imagen sobrescribe la anterior. Tubería CDR con Sharp y Magic Bytes documentada para backend. |
| D-05 | **Rutas relativas y soporte de URLs en UI:** la interfaz soporta rutas relativas (`/uploads/...`) y Data URLs. | Permite que los componentes de imagen funcionen de forma idéntica en fase mock y en producción con servidor. |
| D-06 | **Componente de Fallback Gráfico:** presencia de placeholder ante fallo de carga (`onError`). | Si una imagen de producto falla al renderizar o se corrompe, se muestra un ícono/placeholder técnico neutro sin romper la grilla. |
| D-07 | **Riesgo asumido de rendimiento por Data URLs en Mock:** advertencia técnica documentada. | Convertir imágenes de 5 MB a Base64 en memoria del navegador consume memoria del heap; se asume este comportamiento para pruebas locales con pocas unidades hasta la llegada del almacenamiento físico en backend. |
| D-08 | **Profundidad de categorías y prevención de ciclos:** exactamente 1 nivel (Padre -> Hija). | Una subcategoría no puede ser padre. Si una categoría ya posee hijas, se inhabilita asignarle un padre para evitar segundos niveles de anidamiento o ciclos jerárquicos. |
| D-09 | **Integridad referencial estricta en categorías y marcas:** bloqueo absoluto si tiene >= 1 producto asociado. | Si una categoría o marca está vinculada a al menos 1 producto, su eliminación se bloquea impeditivamente, sin importar si el producto posee otras categorías. |
| D-10 | **Payload plano en categorías de producto:** envío de `categoryIds: string[]`. | El frontend envía únicamente la lista plana de IDs seleccionados; el backend se encarga de inferir la jerarquía sin exigir datos redundantes. |
| D-11 | **Validación híbrida con Zod y contratos estandarizados:** `onBlur` y `onSubmit`. | Errores 400 estandarizados a `{ error: string, details?: { field: string, message: string }[] }`. |
| D-12 | **Resiliencia de formularios (`finally` obligatorio):** | Todo submit asíncrono debe restablecer `isSubmitting: false` dentro de un bloque `finally`, evitando que excepciones no controladas congelen botones. |
| D-13 | **Búsqueda literal y sanitización de Regex:** | El motor de búsqueda client-side utiliza búsqueda literal o escapado de caracteres especiales (`[`, `*`, `\`, etc.) para evitar excepciones de RegExp. |
| D-14 | **Identificadores unívocos:** uso exclusivo de UUIDv4 (`crypto.randomUUID()`). | Elimina la disparidad de slugs o strings arbitrarios, anticipando el esquema relacional de PostgreSQL. |
| D-15 | **Arranque resiliente con Fallbacks en Desarrollo:** | Validación Zod de `VITE_API_URL` y `VITE_CONTACT_WHATSAPP` con valores por defecto y advertencia por consola si no existe `.env` en local/CI. |
| D-16 | **Capa de transporte preparada para Cookies y CSRF:** | Todo servicio cliente documenta el uso de `credentials: 'include'` y el envío del encabezado defensivo `X-Requested-With: XMLHttpRequest` en mutaciones. |
| D-17 | **Contratos de API CRUD planos (sin paginación en MVP):** | `GET /api/products` devuelve un array plano `[ { ... } ]`. La paginación compleja se pospone a la fase de backend. |

---

## 2. Historias de Usuario (Actor: Administrador)

### HU-01: Inicio de Sesión Seguro
> **Como** Administrador del taller,  
> **quiero** autenticarme en `/admin/login` con mis credenciales (`admin@laboratoriodiesel.com` / `admin123`),  
> **para que** el sistema me habilite el acceso a la gestión privada del catálogo y bloquee accesos no autorizados.

### HU-02: Visualización del Dashboard
> **Como** Administrador autenticado,  
> **quiero** ver un panel de control con contadores de productos (totales, visibles, ocultos), categorías y marcas,  
> **para que** pueda conocer el estado global del catálogo y acceder directamente a cada módulo ABM.

### HU-03: Gestión Completa de Productos
> **Como** Administrador,  
> **quiero** dar de alta productos con sus campos obligatorios (nombre, descripción, foto, categoría) y opcionales (OEM, marca, compatibilidad vehicular, condición, precio y visibilidad), editarlos, pausar/ocultar su publicación o eliminarlos definitivamente con confirmación,  
> **para que** la oferta mostrada en la web coincida con la disponibilidad real del taller.

### HU-04: Gestión de Categorías y Subcategorías (1 Nivel)
> **Como** Administrador,  
> **quiero** crear categorías principales y subcategorías anidadas (máximo 1 nivel), editarlas sin generar ciclos jerárquicos y eliminarlas únicamente si no tienen productos asociados,  
> **para que** los clientes puedan filtrar repuestos con una taxonomía clara sin riesgo de dejar productos huérfanos.

### HU-05: Gestión de Marcas
> **Como** Administrador,  
> **quiero** registrar, editar y eliminar marcas de repuestos por su nombre, manteniendo la integridad relacional con los productos,  
> **para que** los productos queden asociados a fabricantes reconocidos y habiliten el filtrado en el catálogo.

### HU-06: Cierre de Sesión Seguro
> **Como** Administrador,  
> **quiero** cerrar mi sesión de forma explícita destruyendo el estado de autenticación en memoria,  
> **para que** nadie pueda operar el backoffice en mi dispositivo tras retirarme.

---

## 3. Requisitos Funcionales

> **Convención:** Los criterios de aceptación usan notación **EARS** (Easy Approach to Requirements Syntax).  
> **Trazabilidad:** Cada RF referencia el requisito SRS v1.0 de origen.

### 3.1 Autenticación, Sesión y Protección de Rutas

**RF-01: Formulario de Inicio de Sesión** *(SRS 5.4.1)*

El sistema deberá proveer un formulario de autenticación en `/admin/login` para el acceso al Backoffice.

- **CA-01.1:** *When* el Administrador ingresa `admin@laboratoriodiesel.com` y `admin123` y presiona "Iniciar Sesión", *the system shall* autenticar la sesión, almacenar el estado en memoria (React Context), deshabilitar el botón mediante estado `isSubmitting`, y redirigir a la ruta raíz administrativa `/admin`.
- **CA-01.2:** *When* el Administrador ingresa credenciales erróneas, *the system shall* mostrar el mensaje claro "Credenciales incorrectas" sin detallar qué campo falló.
- **CA-01.3:** *When* el usuario interactúa con los campos del formulario, *the system shall* validar con Zod en `onBlur` y en `onSubmit`, bloqueando el envío si los campos están vacíos o no cumplen formato de correo.
- **CA-01.4:** *While* el usuario completa el formulario de login, *the system shall* permitir el autocompletado nativo del navegador y gestores de contraseñas (respetando ASVS 2.1.12).
- **CA-01.5:** *When* se procesa el formulario de login, *the system shall* estructurar el bloque de envío con un `finally` garantizando que `isSubmitting` se restablezca a `false` ante cualquier error o excepción.

**RF-02: Protección de Rutas (Guard de Administración)** *(SRS 5.4.2)*

El sistema deberá restringir todo acceso a las rutas `/admin/*` a usuarios autenticados.

- **CA-02.1:** *When* un usuario no autenticado navega directamente a cualquier ruta administrativa (`/admin`, `/admin/dashboard`, `/admin/categorias`, `/admin/marcas`), *the system shall* interceptar la navegación y redirigir a `/admin/login`.
- **CA-02.2:** *When* el Administrador realiza un refresco manual de página (F5), *the system shall* reiniciar el estado en memoria, destruyendo la sesión temporal y redirigiendo al usuario a `/admin/login` (comportamiento documentado de la fase mock).
- **CA-02.3:** *When* el Administrador hace clic en "Cerrar Sesión", *the system shall* invalidar el estado de autenticación en memoria y redirigir inmediatamente a `/admin/login`.

**RF-03: Contrato de API de Autenticación y Seguridad (Documentación para Backend)** *(constitution.md §4, AGENTS.MD §2, §5)*

La especificación documenta el contrato de autenticación para el backend:

- **Endpoint Login:** `POST /api/auth/login`
  - Headers: `Content-Type: application/json`, `X-Requested-With: XMLHttpRequest`
  - Credentials: `include`
  - Body: `{ email: string, password: string }`
  - Respuesta 200: Cookie `Set-Cookie: session=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/`. Body: `{ user: { id: string, email: string, role: "admin" } }`
  - Respuesta 401: `{ error: "Credenciales inválidas" }`
  - Respuesta 500: `{ error: "Error interno del servidor", referencia: "<uuid>" }`
- **Endpoint Logout:** `POST /api/auth/logout`
  - Headers: `X-Requested-With: XMLHttpRequest`
  - Credentials: `include`
  - Respuesta 200: Cookie invalidada (`Max-Age=0`). Body: `{ success: true }`

---

### 3.2 Dashboard Resumen

**RF-04: Métricas del Catálogo y Navegación Rápida** *(SRS 5.4.1)*

El sistema deberá presentar en `/admin/dashboard` los indicadores cuantitativos del catálogo calculados reactivamente a partir del contexto en memoria.

- **CA-04.1:** *When* el Administrador carga el Dashboard, *the system shall* calcular y exhibir:
  1. Total de productos registrados.
  2. Total de productos visibles (publicados en catálogo).
  3. Total de productos pausados/ocultos.
  4. Total de categorías registradas (padres e hijas).
  5. Total de marcas registradas.
- **CA-04.2:** *When* el Administrador hace clic en las tarjetas de métricas o botones de acción rápida ("Gestionar Productos", "Gestionar Categorías", "Gestionar Marcas"), *the system shall* navegar a la vista correspondiente.

---

### 3.3 ABM de Productos

**RF-05: Alta y Edición de Productos con Persistencia Relacional** *(SRS 5.4.6, 5.4.7, 5.4.8)*

El sistema deberá proveer un formulario modal/pantalla para crear y editar productos.

- **CA-05.1 (Campos obligatorios):** *When* el Administrador envía el formulario, *the system shall* exigir y validar con Zod:
  - **Nombre:** string no vacío (mínimo 3 caracteres).
  - **Descripción / Detalle:** string no vacío (mínimo 5 caracteres).
  - **Foto del producto:** exactamente una imagen cargada (validada según RF-08).
  - **Categorías:** al menos una (1) categoría o subcategoría seleccionada.
- **CA-05.2 (Campos opcionales):** *When* el formulario es completado, *the system shall* admitir opcionalmente:
  - **Código OEM:** string alfanumérico.
  - **Marca:** selección simple proveniente de las marcas registradas (almacenando exclusivamente el `brandId` UUID).
  - **Vehículo compatible:** string de texto libre simple (ej. "Toyota Hilux 2.8 TDI 2016-2022").
  - **Condición:** Enum estático con opciones exclusivas `['Nuevo', 'Reacondicionado', 'Usado']` (por defecto: 'Nuevo').
  - **Precio:** número `>= 0` en ARS (`z.number().nonnegative()`). El valor `$0` es válido.
  - **Mostrar/Ocultar precio:** toggle booleano. Si no hay precio ingresado, el catálogo asume "Consultar precio" sin importar el estado del toggle.
  - **Visibilidad general:** toggle booleano (Visible u Oculto). Por defecto: Visible.
- **CA-05.3 (Múltiples categorías planas):** *When* se asocian categorías, *the system shall* permitir tildar múltiples categorías o subcategorías, registrando un array plano `categoryIds: string[]` sin duplicación de jerarquías.
- **CA-05.4 (Validación de campos y submit seguro):** *When* un campo pierde el foco (`onBlur`) o se hace submit, *the system shall* ejecutar la validación Zod y mostrar los errores específicos. La mutación se encierra en un bloque `try/finally` para asegurar el reinicio de `isSubmitting: false`.

**RF-06: Visibilidad y Grilla con Fallback de Imagen** *(SRS 5.4.6, 5.4.9, CU-05)*

El sistema deberá listar los productos permitiendo alternar su visibilidad y garantizando resiliencia visual.

- **CA-06.1:** *When* el Administrador acciona el interruptor de visibilidad en la grilla, *the system shall* conmutar el estado entre `Visible` y `Oculto` inmediatamente en el Context.
- **CA-06.2:** *While* un producto se encuentre en estado `Oculto`, *the system shall* mostrar una insignia o distinción visual en la fila correspondiente indicando su estado inactivo.
- **CA-06.3 (Fallback de imagen):** *If* la imagen de un producto falla al renderizar (`onError`) o no puede cargarse desde la ruta relativa/Data URL, *then the system shall* renderizar automáticamente un componente de fallback gráfico (ícono de repuesto o placeholder neutro) sin romper el diseño de la grilla.
- **CA-06.4 (Búsqueda sanitizada):** *When* el Administrador escribe en la barra de búsqueda de productos, *the system shall* realizar una búsqueda literal insensible a mayúsculas/minúsculas (`String.includes`) o escapar caracteres especiales de expresiones regulares para evitar excepciones por sintaxis no válida.

**RF-07: Eliminación de Productos** *(SRS 5.4.9, CU-05)*

El sistema deberá permitir borrar permanentemente un producto.

- **CA-07.1:** *When* el Administrador presiona "Eliminar" en un producto, *the system shall* desplegar un diálogo modal de confirmación con botón de peligro en tono rojo.
- **CA-07.2:** *When* se confirma la eliminación, *the system shall* remover el producto del Context y actualizar los contadores del Dashboard de forma reactiva.

---

### 3.4 Manejo y Validación de Imágenes

**RF-08: Validación Client-Side y Compatibilidad de URLs** *(SRS RNF-05, constitution.md §3, AGENTS.MD §4)*

El sistema deberá filtrar estrictamente los archivos de imagen antes de incorporarlos al producto y soportar diferentes esquemas de ruta.

- **CA-08.1 (Formatos admitidos):** *When* el Administrador selecciona un archivo, *the system shall* validar que el MIME type corresponda a `image/jpeg`, `image/png` o `image/webp` (extensiones `.jpg`, `.jpeg`, `.png`, `.webp`). Archivos `.svg`, `.gif` u otros ejecutables deben ser rechazados con alerta visible.
- **CA-08.2 (Límite de tamaño inclusivo):** *When* el archivo se selecciona, *the system shall* validar que su tamaño sea `<= 5 * 1024 * 1024` bytes (5.00 MB inclusive). Si pesa 5.01 MB o más, *the system shall* rechazar el archivo con el mensaje "El archivo excede el tamaño máximo permitido de 5 MB".
- **CA-08.3 (Desacoplamiento de validación):** La metadata del archivo (`size`, `type`) se validará con Zod sin aplicar `.strict()` sobre la instancia nativa `File` del navegador.
- **CA-08.4 (Preview y sobrescritura):** *When* se selecciona un archivo válido, *the system shall* renderizar una previsualización inmediata. Si el usuario selecciona otro archivo posteriormente, este reemplazará al anterior.
- **CA-08.5 (Soporte de rutas y advertencia de memoria en mock):** Los componentes de renderizado de imagen deben aceptar tanto Data URLs absolutas (`data:image/...`) como rutas relativas de servidor (`/uploads/<uuid>.webp`). Se documenta que el almacenamiento de imágenes de 5 MB como Data URLs en memoria es una degradación aceptada del mock que se resolverá con el upload físico al backend.

**RF-09: Contrato de Upload para Backend (Tubería CDR y Cabeceras)** *(constitution.md §3, AGENTS.MD §4, §5)*

Se documenta el contrato de subida para la fase backend:

- **Endpoint:** `POST /api/uploads/product-image`
- **Headers:** `X-Requested-With: XMLHttpRequest`
- **Credentials:** `include`
- **Payload:** `multipart/form-data` con campo `file`
- **Tubería Backend:** Multer 5 MB -> Magic Bytes -> Sharp `.webp` `<= 500 KB` sin EXIF -> `crypto.randomUUID()`.
- **Respuesta 201:** `{ imageUrl: "/uploads/<uuid>.webp" }`
- **Respuesta 400:** `{ error: "Archivo inválido", details: [{ field: "file", message: "Formato no admitido" }] }`

---

### 3.5 ABM de Categorías y Subcategorías

**RF-10: Creación, Edición y Prevención de Ciclos (1 Nivel)** *(SRS 5.4.3, CU-06)*

El sistema deberá gestionar las categorías garantizando una jerarquía estricta de máximo 1 nivel sin ciclos.

- **CA-10.1 (Categoría Principal):** *When* se crea una categoría sin padre, *the system shall* registrarla como categoría raíz (`parentId: null`).
- **CA-10.2 (Subcategoría Hija):** *When* se crea una categoría seleccionando un padre, *the system shall* registrarla como subcategoría hija asignándole el UUID de la categoría raíz.
- **CA-10.3 (Límite estricto en selector):** El selector de "Categoría Padre" únicamente listará categorías raíz (`parentId === null`). Ninguna subcategoría hija puede ser seleccionada como padre.
- **CA-10.4 (Prevención de ciclos e inversión jerárquica):** *If* la categoría a editar ya posee subcategorías hijas vinculadas, *then the system shall* deshabilitar el selector de "Categoría Padre", impidiendo que una categoría padre se transforme en subcategoría hija de otra.
- **CA-10.5 (Unicidad de nombres):** *When* se ingresa un nombre idéntico a uno existente (comparación case-insensitive con `trim()`), *the system shall* bloquear el guardado indicando "Ya existe una categoría con este nombre".
- **CA-10.6 (Resiliencia de mutación):** Todo guardado de categoría implementa bloque `finally` para restablecer `isSubmitting: false`.

**RF-11: Eliminación con Bloqueo Estricto de Integridad** *(SRS 5.4.4, CU-07)*

El sistema deberá proteger la integridad referencial bloqueando la eliminación si existen productos vinculados.

- **CA-11.1 (Bloqueo estricto por productos):** *If* la categoría o subcategoría tiene 1 o más productos asociados, *then the system shall* **deshabilitar** o **bloquear** la eliminación con un modal de advertencia que liste los productos afectados, exigiendo su reasignación previa.
- **CA-11.2 (Bloqueo por subcategorías hijas):** *If* una categoría padre posee subcategorías hijas creadas, *then the system shall* impedir su eliminación hasta que las subcategorías sean reasignadas o eliminadas.
- **CA-11.3 (Eliminación exitosa):** *When* la categoría no posee subcategorías ni productos asociados y el Administrador confirma el modal, *the system shall* removerla del Context.

---

### 3.6 ABM de Marcas

**RF-12: Creación, Edición y Eliminación Relacional de Marcas** *(SRS 5.4.5)*

El sistema deberá gestionar las marcas de repuestos por nombre, manteniendo relaciones normalizadas por ID.

- **CA-12.1:** *When* se crea o edita una marca, *the system shall* requerir un nombre de mínimo 2 caracteres validado con Zod.
- **CA-12.2:** *When* se ingresa un nombre duplicado (case-insensitive con `trim()`), *the system shall* impedir el guardado por unicidad.
- **CA-12.3:** *If* la marca se encuentra asignada a 1 o más productos (`brandId`), *then the system shall* bloquear su eliminación e informar los productos vinculados.
- **CA-12.4:** *When* se renombra una marca, *the system shall* mantener el mismo identificador UUID; los productos que apuntan a dicha marca reflejarán el nuevo nombre inmediatamente en la interfaz mediante resolución relacional por ID.
- **CA-12.5:** *When* la marca está libre de vínculos y se confirma el diálogo modal, *the system shall* eliminarla del Context.

---

### 3.7 Contrato de Endpoints CRUD para Backend (Estandarizado)

**RF-13: Documentación de Contrato CRUD para Productos** *(Decisión D-11, D-17)*

Se documenta el contrato REST JSON para el recurso Productos:

```http
### Listar productos (Array plano para MVP)
GET /api/products
Headers: X-Requested-With: XMLHttpRequest
Credentials: include
Response 200: [ { "id": "uuid", "name": "...", "oem": "...", "brandId": "uuid", "categoryIds": ["uuid"], "price": 320000, "visible": true, ... } ]

### Obtener producto
GET /api/products/:id
Headers: X-Requested-With: XMLHttpRequest
Credentials: include
Response 200: { "id": "uuid", "name": "...", ... }
Response 404: { "error": "Producto no encontrado" }

### Crear producto
POST /api/products
Content-Type: application/json
Headers: X-Requested-With: XMLHttpRequest
Credentials: include
Request Body: { "name": "...", "description": "...", "imageUrl": "/uploads/uuid.webp", "categoryIds": ["uuid"], "brandId": "uuid", "condition": "Nuevo", "price": 1000, "visible": true }
Response 201: { "id": "uuid", "name": "...", ... }
Response 400: { "error": "Datos de validación inválidos", "details": [ { "field": "name", "message": "El nombre es obligatorio" } ] }

### Actualizar producto
PUT /api/products/:id
Content-Type: application/json
Headers: X-Requested-With: XMLHttpRequest
Credentials: include
Request Body: { "name": "...", ... }
Response 200: { "id": "uuid", ... }
Response 400: { "error": "Datos de validación inválidos", "details": [ ... ] }

### Eliminar producto
DELETE /api/products/:id
Headers: X-Requested-With: XMLHttpRequest
Credentials: include
Response 200: { "success": true }
Response 500: { "error": "Error interno del servidor", "referencia": "<uuid>" }
```

---

### 3.8 Resiliencia del Entorno Frontend (Crash Early con Fallback)

**RF-14: Validación de Variables de Entorno en el Arranque con Fallback** *(AGENTS.MD §3)*

El sistema deberá verificar las variables de entorno frontend obligatorias al iniciar la aplicación.

- **CA-14.1:** *When* la aplicación inicia, *the system shall* validar con Zod `VITE_API_URL` y `VITE_CONTACT_WHATSAPP`.
- **CA-14.2 (Fallback en Desarrollo/CI):** *If* alguna variable no está definida en `import.meta.env`, *the system shall* cargar valores por defecto de desarrollo seguro (`http://localhost:3000/api` y `5492657659108`) emitiendo una advertencia explícita en consola (`console.warn`), permitiendo que pipelines de prueba o entornos limpios ejecuten sin colapsar.
- **CA-14.3 (Fallo estricto en producción):** *If* el entorno corresponde a `import.meta.env.PROD` y faltan variables requeridas, *then the system shall* detener el renderizado arrojando excepción fatal.

---

### 3.9 Estado Inicial y Semillas Normalizadas

**RF-15: Datos Semilla en Contexto de Memoria con UUIDs** *(Decisión D-14)*

El sistema inicializará el contexto `AdminProvider` con entidades identificadas unívocamente mediante UUIDv4:

- **CA-15.1:** El contexto proveerá:
  - **Categorías:** 3 categorías principales y 2 subcategorías hijas asociadas por `parentId` (1 nivel exacto).
  - **Marcas:** 3 marcas líderes (Bosch, Delphi, Denso) con UUID propio.
  - **Productos:** 4 productos de prueba referenciando `brandId` y `categoryIds` por UUID, combinando estados (visibles, ocultos, con precio, sin precio y precio `$0`).
- **CA-15.2:** *When* se ejecuta cualquier operación ABM, el estado mutará reactivamente en memoria actualizando listas y contadores del Dashboard de forma instantánea.

---

## 4. Requisitos No Funcionales

### RNF-P4-01: Seguridad Zero-Trust en Frontend *(SRS RNF-04, constitution.md §4, AGENTS.MD §1, §2)*
- Prohibición absoluta de almacenar tokens, credenciales o flags de administración en `localStorage` o `sessionStorage`. La sesión reside exclusivamente en la memoria de React.
- Los route guards interceptan y deniegan por defecto todo acceso no autenticado.
- En caso de error de servidor (500), el mensaje presentado es estrictamente opaco acompañado de un identificador de referencia. En errores de validación de cliente (400, 401), se presentan mensajes legibles estandarizados.

### RNF-P4-02: Validación Fail-Fast con Zod *(constitution.md §2, AGENTS.MD §3)*
- Todos los formularios de alta/edición implementan esquemas Zod con validación híbrida (`onBlur` y `onSubmit`).
- Los esquemas Zod para payloads de datos se configuran con `.strict()`. Las propiedades no mapeadas o inesperadas se capturan arrojando el mensaje unificado "Datos inesperados en el formulario".
- La validación de archivos separa la metadata (`size`, `type`) de la estructura nativa del objeto `File`.

### RNF-P4-03: Usabilidad, Ergonomía y Coherencia Visual *(SRS RNF-02, RNF-03)*
- Interfaz optimizada para resolución de escritorio y tablet, preservando legibilidad en pantallas de taller automotriz.
- Adherencia a la paleta de colores institucional en tonos azules y grises técnicos.
- Acciones destructivas exigen confirmación en modal con botones diferenciados en color rojo de peligro.
- Todos los botones de envío cuentan con indicador visual de carga y estado deshabilitado (`isSubmitting`) durante el procesamiento, blindado mediante bloques `finally`.

---

## 5. Casos Límite y Escenarios Edge

| # | Escenario | Comportamiento Esperado |
|---|-----------|------------------------|
| CL-01 | Intento de subir una imagen de 5.00 MB exactos (`5242880` bytes) | El archivo es aceptado (límite inclusivo `<= 5 MB`). |
| CL-02 | Intento de subir una imagen de 5.01 MB (`5253360` bytes) | El archivo es rechazado de inmediato con mensaje indicando límite de 5 MB. |
| CL-03 | El usuario selecciona una foto y luego selecciona otra distinta antes de guardar | La segunda selección reemplaza totalmente a la primera en la previsualización y en el borrador del formulario. |
| CL-04 | Intento de crear una subcategoría seleccionando como padre otra subcategoría | Imposible en la interfaz: el selector de padre únicamente lista categorías principales de nivel raíz. |
| CL-05 | Intento de convertir una Categoría Padre en Subcategoría cuando ya tiene hijas asociadas | Imposible en la interfaz: el selector de padre se deshabilita para evitar ciclos jerárquicos o segundos niveles de anidamiento. |
| CL-06 | Intento de eliminar una categoría o marca que contiene 1 o más productos asociados | Bloqueo estricto e impeditivo (CA-11.1, CA-12.3). Se abre modal informativo listando los productos vinculados y denegando el borrado. |
| CL-07 | Creación de producto con precio `$0` y toggle "Mostrar precio" activado | El sistema acepta el precio `$0` (`z.number().nonnegative()`) y lo muestra en el catálogo como "$0 ARS". Si el precio está vacío/nulo, muestra "Consultar precio". |
| CL-08 | El usuario presiona F5 o recarga la página estando autenticado | Se pierde la sesión en memoria y el guard redirige a `/admin/login`. El estado vuelve a las semillas iniciales. |
| CL-09 | El Administrador edita el nombre de una marca vinculada a productos | La marca se actualiza por UUID; todos los productos reflejan automáticamente el nuevo nombre en la grilla sin desnormalizar datos. |
| CL-10 | Error o fallo de carga en la imagen de un producto en la grilla (`onError`) | Se activa automáticamente el fallback gráfico (ícono de repuesto o placeholder) sin romper la tabla ni desalinear columnas. |
| CL-11 | Búsqueda de repuestos ingresando caracteres especiales (`[`, `*`, `\`, `+`) | El motor de búsqueda utiliza búsqueda literal insensible a mayúsculas o escapa caracteres especiales, impidiendo excepciones de RegExp. |
| CL-12 | Ocurrencia de una excepción no capturada durante una mutación asíncrona | El bloque `finally` obligatorio restablece `isSubmitting: false`, permitiendo que el usuario reintente sin congelar el botón. |
| CL-13 | Cierre de sesión y uso del botón "Atrás" del navegador | El route guard detecta `isAuthenticated: false` y expulsa al usuario hacia `/admin/login`. |

---

## 6. Fuera de Alcance

1. **Catálogo Público y Carrito de Compras:** bajo desarrollo por el compañero de equipo en Fase 3.
2. **Landing Page Pública:** finalizada en Fase 2.
3. **Servidor Backend Real y Base de Datos:** persistencia real en PostgreSQL, ORM Prisma y hashing Argon2id pertenecen a la fase de Backend.
4. **Tubería CDR Real con Sharp en Servidor:** el procesamiento físico de imágenes se simula en frontend; su ejecución real será en el servidor Node.js.
5. **Logo o subida de imágenes para Marcas:** alcance acotado a solo campo de texto `nombre`.
6. **Múltiples roles o gestión de usuarios:** el sistema contempla un único usuario Administrador para el MVP.
7. **Paginación compleja en Backend:** el contrato MVP opera con arrays planos de datos.
8. **Control de stock, logística o pasarelas de pago:** excluido formalmente del MVP en SRS §1.1.

---

*Fin de la especificación técnica auditada y consolidada (v1.2).*
