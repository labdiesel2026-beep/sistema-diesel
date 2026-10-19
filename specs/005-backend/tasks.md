# Tareas de Implementación: Backend, Base de Datos y Tubería de Archivos

**Fase:** 005-backend  
**Versión:** 1.0  
**Fecha:** 2026-10-19  
**Especificación:** [specs/005-backend/spec.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/005-backend/spec.md)  
**Plan Técnico:** [specs/005-backend/plan.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/005-backend/plan.md)  
**Marco Normativo:** [docs/constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md) y [AGENTS.MD](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/AGENTS.MD)  
**Estado:** Documento de Tareas de Ejecución

---

## Bloque 1: Inicialización del Entorno, Servidor y Base de Datos (Prisma)

- [x] **Tarea 1.1: Sincronización de Variables de Entorno en la Raíz** (Cubre: RF-11, 4.6, D-02)
  - **Acción:** Actualizar `.env.example` en la raíz incorporando las variables del backend (`PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `ADMIN_INITIAL_EMAIL`, `ADMIN_INITIAL_PASSWORD`), y reflejarlas en el archivo `.env` local para desarrollo.
  - **Hecho cuando:** `.env.example` contiene las secciones de Base de Datos, Backend y Frontend completas, y `.env` contiene credenciales locales válidas con `JWT_SECRET` $\ge 32$ caracteres.

- [x] **Tarea 1.2: Inicialización del Proyecto Aislado `/server`** (Cubre: D-01)
  - **Acción:** Crear el directorio `/server`, inicializar su propio `package.json` con `"type": "module"`, configurar `tsconfig.json` para Node/ESNext estricto, e instalar dependencias de producción (`express`, `cors`, `helmet`, `cookie-parser`, `dotenv`, `zod`, `argon2`, `jsonwebtoken`, `multer`, `sharp`, `file-type`, `express-rate-limit`, `@prisma/client`) y de desarrollo (`prisma`, `typescript`, `@types/node`, `@types/express`, `@types/cors`, `@types/cookie-parser`, `@types/jsonwebtoken`, `@types/multer`, `vitest`, `supertest`, `@types/supertest`, `tsx`).
  - **Hecho cuando:** `server/package.json` y `server/tsconfig.json` existen, `npm install` finaliza sin errores y `npx tsc --noEmit` ejecuta limpiamente dentro de `/server`.

- [x] **Tarea 1.3: Definición del Esquema Relacional de Prisma y Migración Inicial** (Cubre: RF-07, RF-08, RF-09, D-03, D-04, D-06)
  - **Acción:** Crear `server/prisma/schema.prisma` implementando los modelos `AdminUser`, `Brand`, `Category`, `Product` y la tabla pivote explícita `ProductCategory` con las directivas `@relation(onDelete: Restrict)` en categorías y marcas, clave primaria compuesta `@@id([productId, categoryId])` y precio como `Int?`. Ejecutar la migración inicial o sincronización contra el PostgreSQL del contenedor Docker `laboratorio_diesel_db`.
  - **Hecho cuando:** El comando `npx prisma db push` (o `prisma migrate dev --name init`) se ejecuta exitosamente contra PostgreSQL y las 5 tablas quedan creadas con sus restricciones foráneas activas.

- [x] **Tarea 1.4: Configuración de Entorno (Crash Early) y Cliente Prisma** (Cubre: 4.6, RF-01)
  - **Acción:** Crear `server/src/config/env.ts` utilizando Zod `.strict()` para validar en el arranque `PORT`, `DATABASE_URL`, `JWT_SECRET` (mínimo 32 caracteres) y `CORS_ORIGIN`, deteniendo el proceso con `process.exit(1)` si faltan variables. Crear `server/src/config/prisma.ts` instanciando un cliente singleton de Prisma conectado a la base de datos.
  - **Hecho cuando:** Una prueba de ejecución de `env.ts` sin variables falla de inmediato con código de salida 1, y con variables válidas inicializa el cliente Prisma sin excepciones.

- [x] **Tarea 1.5: Script de Aprovisionamiento Inicial (Seed) con Argon2id y Catálogo** (Cubre: RF-11, D-08)
  - **Acción:** Implementar `server/prisma/seed.ts` para leer `ADMIN_INITIAL_EMAIL` y `ADMIN_INITIAL_PASSWORD` del entorno, aplicar hashing estricto con `argon2.hash(..., { type: argon2.argon2id })`, realizar un *upsert* del usuario `AdminUser`, e insertar de forma idempotente las categorías, marcas y productos semilla iniciales basados en `src/lib/admin-seed-data.ts`.
  - **Hecho cuando:** El comando `npx prisma db seed` se ejecuta sin errores, y una consulta a la base de datos confirma la existencia del usuario administrador con hash Argon2id (`$argon2id$...`), 3 marcas, 6 categorías y 4 productos vinculados.

---

## Bloque 2: Arquitectura Base de Express, Middlewares de Seguridad y Manejo de Errores

- [x] **Tarea 2.1: Configuración del Servidor Express Base y Cabeceras de Seguridad** (Cubre: 4.1, 4.3, 4.4, D-01)
  - **Acción:** Crear `server/src/app.ts` configurando `express.json()`, `cookie-parser()`, `helmet()` (desactivando `X-Powered-By`), y `cors()` restringido estrictamente a `CORS_ORIGIN` con `credentials: true`. Crear `server/src/index.ts` que invoque la validación de entorno y levante el servidor en el puerto configurado (`PORT=3001`).
  - **Hecho cuando:** Al iniciar el servidor con `npm run dev`, responde en `http://localhost:3001` con cabeceras Helmet activas, sin exponer `X-Powered-By`, y bloqueando peticiones de orígenes no autorizados.

- [x] **Tarea 2.2: Middleware Genérico de Validación Fail-Fast (Zod)** (Cubre: 4.2)
  - **Acción:** Crear `server/src/middleware/validate.middleware.ts` que reciba esquemas Zod `.strict()` para `body`, `params` y `query`. Si la validación falla, debe retornar inmediatamente `400 Bad Request` con el formato estandarizado `{ error: "Datos de validación inválidos", details: [{ field: string, message: string }] }` sin invocar el controlador de negocio.
  - **Hecho cuando:** Al enviar un payload con campos desconocidos o inválidos a una ruta de prueba, el middleware responde `400 Bad Request` con los campos detallados y no ejecuta el siguiente middleware.

- [x] **Tarea 2.3: Middleware Defensivo Anti-CSRF** (Cubre: 4.3)
  - **Acción:** Crear `server/src/middleware/csrf.middleware.ts` que intercepte peticiones con métodos mutables (`POST`, `PUT`, `PATCH`, `DELETE`) y valide la presencia exacta de la cabecera `X-Requested-With: XMLHttpRequest`. Si está ausente, rechazar con `403 Forbidden` (`{ error: "Petición rechazada: encabezado anti-CSRF ausente" }`).
  - **Hecho cuando:** Peticiones mutables sin la cabecera son rechazadas con `403`, y peticiones que contienen la cabecera continúan su procesamiento.

- [x] **Tarea 2.4: Middleware Global de Manejo de Errores (Operativos vs. Opacos con UUID)** (Cubre: 4.5, D-07, Principio 6)
  - **Acción:** Crear `server/src/middleware/error.middleware.ts`. El middleware debe detectar errores operativos conocidos (instancias de `AppError` con códigos 400, 401, 404, 409) y devolver su mensaje legible. Para errores no controlados (500 o fallos de Prisma), debe generar un `crypto.randomUUID()`, registrar el error y su stack trace internamente en consola/logger, y retornar al cliente exclusivamente `{ error: "Error interno del servidor", referencia: "<uuid>" }`.
  - **Hecho cuando:** Al provocar intencionalmente una excepción no controlada (`throw new Error("DB Crash")`), el cliente recibe un JSON con código 500 conteniendo solo el mensaje genérico y el UUID de referencia, sin filtración del stack trace.

- [x] **Tarea 2.5: Middleware de Rate Limiting con Topología `trust proxy: 1`** (Cubre: 4.4, D-11)
  - **Acción:** Crear `server/src/middleware/rate-limit.middleware.ts` configurando `express-rate-limit` con `app.set('trust proxy', 1)`: un limitador estricto para autenticación (5 intentos / 15 min por IP) y un limitador dedicado para subidas de archivos (10 peticiones / 15 min por IP).
  - **Hecho cuando:** Al realizar 6 peticiones fallidas consecutivas a la ruta de login desde la misma IP, el servidor bloquea la 6ta petición respondiendo `429 Too Many Requests`.

---

## Bloque 3: Módulo de Autenticación y Sesiones Zero-Trust

- [x] **Tarea 3.1: Esquemas Zod y Servicio Criptográfico de Autenticación (Argon2id + JWT)** (Cubre: RF-01, 4.1, D-08)
  - **Acción:** Crear `server/src/schemas/auth.schemas.ts` con `loginSchema.strict()`. Crear `server/src/services/auth.service.ts` implementando las funciones de verificación de credenciales con `argon2.verify`, generación de token JWT firmado (con payload `{ id, email, role }` y expiración de 8 horas) y verificación de firma del token.
  - **Hecho cuando:** El servicio valida correctamente contraseñas hasheadas con Argon2id, rechaza contraseñas inválidas, y firma y decodifica tokens JWT con el secreto de entorno.

- [x] **Tarea 3.2: Middleware de Verificación de Sesión (`requireAuth`)** (Cubre: RF-01, RF-03, 4.1)
  - **Acción:** Crear `server/src/middleware/auth.middleware.ts` que extraiga la cookie de sesión (`req.cookies.session`), verifique la validez y expiración del JWT con `authService.verifyToken`, y adjunte el usuario decodificado a `req.user`. Si la cookie falta o no es válida, debe responder `401 Unauthorized` (`{ error: "Sesión no válida o expirada" }`).
  - **Hecho cuando:** Rutas protegidas con `requireAuth` rechazan peticiones sin cookie con `401`, y autorizan peticiones con cookie válida inyectando `req.user`.

- [x] **Tarea 3.3: Controlador y Rutas de Login (`POST /api/auth/login`)** (Cubre: RF-01, 4.1)
  - **Acción:** Implementar `server/src/controllers/auth.controller.ts` y `server/src/routes/auth.routes.ts`. Validar el body con `loginSchema`, verificar el usuario contra la base de datos vía Prisma, emitir la cabecera `Set-Cookie` con `session=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`, y devolver `200 OK` con `{ user: { id, email, role } }`. Si las credenciales fallan, responder `401 Unauthorized` (`{ error: "Credenciales inválidas" }`).
  - **Hecho cuando:** Una petición válida a `POST /api/auth/login` devuelve 200 OK, payload del usuario y cabecera `Set-Cookie` con las directivas de seguridad requeridas.

- [x] **Tarea 3.4: Controlador y Rutas de Logout y Sesión Silenciosa (`POST /logout` y `GET /me`)** (Cubre: RF-02, RF-03, D-07)
  - **Acción:** Implementar en `auth.controller.ts` los métodos:
    - `logout`: destruye la cookie seteando `session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` y responde `200 OK` con `{ success: true }`.
    - `me`: protegido por `requireAuth`, busca el usuario en PostgreSQL por `req.user.id` y devuelve `200 OK` con `{ id, email, role }`.
  - **Hecho cuando:** `POST /api/auth/logout` borra la cookie en el cliente, y `GET /api/auth/me` con cookie válida rehidrata el perfil del administrador sin requerir login manual.

- [x] **Tarea 3.5: Tests Automatizados de Integración de Autenticación** (Cubre: RF-01, RF-02, RF-03, 6.2.1)
  - **Acción:** Crear `server/tests/auth.test.ts` con Vitest y Supertest. Probar: login exitoso con cookie HttpOnly, login fallido (401), acceso a `/me` con cookie (200), acceso a `/me` sin cookie (401) y logout exitoso (destrucción de cookie).
  - **Hecho cuando:** La suite `auth.test.ts` se ejecuta con `npm test` dentro de `/server` y todos los tests pasan en verde.

---

## Bloque 4: Tubería Paranoica de Archivos (CDR) y Servicio Estático

- [x] **Tarea 4.1: Middleware Multer en Memoria RAM y Whitelist de Extensiones** (Cubre: RF-04)
  - **Acción:** Crear `server/src/middleware/upload.middleware.ts` configurando `multer({ storage: multer.memoryStorage(), limits: { fileSize: 5242880 } })` para capturar el campo `file`. Validar que la extensión pertenezca a la whitelist (`.jpg`, `.jpeg`, `.png`, `.webp`), respondiendo `400 Bad Request` si se excede el peso o la extensión es inválida.
  - **Hecho cuando:** Cargas mayores a 5 MB o con extensiones prohibidas (.exe, .pdf, .svg) son rechazadas de inmediato con `400 Bad Request` sin escribir en disco.

- [x] **Tarea 4.2: Servicio de Tubería CDR con Sharp y Prevención de Pixel Flood** (Cubre: RF-04, RF-05, D-08, D-09)
  - **Acción:** Implementar `server/src/services/cdr.service.ts`. Validar Magic Bytes con `file-type` (`image/jpeg`, `image/png`, `image/webp`). Pre-inspeccionar metadatos con `sharp(buffer).metadata()`: si `width > 4096` o `height > 4096`, arrojar `ValidationError` (Bomba de Descompresión). Aplicar resize acotado a $1080 \times 1080$ (`fit: 'inside'`, `withoutEnlargement: true`), re-codificar forzosamente a `.webp` con `quality: 80`, despojar metadatos EXIF y generar nombre UUIDv4 (`crypto.randomUUID() + ".webp"`).
  - **Hecho cuando:** Imágenes con Magic Bytes falsos o dimensiones $> 4096\text{ px}$ son rechazadas con 400; imágenes válidas se re-codifican a `.webp` sin metadatos EXIF.

- [x] **Tarea 4.3: Servicio de Almacenamiento Local y Limpieza Física Resiliente** (Cubre: RF-05, RF-06, D-05, D-10)
  - **Acción:** Implementar `server/src/services/file-storage.service.ts` con:
    - `saveBuffer(filename, buffer)`: escribe el archivo en `server/uploads/`.
    - `deleteFile(imageUrl)`: extrae estrictamente `path.basename(imageUrl)` para mitigar Path Traversal, valida que termine en `.webp` y ejecuta `fs.promises.unlink` dentro de un bloque `try/catch` que registre advertencias sin interrumpir el flujo ante errores de I/O o bloqueos en Windows (`EBUSY`).
  - **Hecho cuando:** Los archivos se escriben correctamente en `server/uploads/`, y `deleteFile` purga archivos existentes sin lanzar excepciones si el archivo no existe o está en uso.

- [x] **Tarea 4.4: Controlador de Subidas, Ruta y Servicio Estático Blindado** (Cubre: RF-04, RF-05, RF-06, D-12)
  - **Acción:** Implementar `server/src/controllers/upload.controller.ts` y `server/src/routes/upload.routes.ts` exponiendo `POST /api/uploads/product-image` protegido por `requireAuth` y el limitador de tasa de subidas. Configurar en `server/src/app.ts` el servicio estático `express.static('uploads')` bajo la ruta `/uploads` inyectando cabeceras `X-Content-Type-Options: nosniff` y `Cross-Origin-Resource-Policy: cross-origin`.
  - **Hecho cuando:** `POST /api/uploads/product-image` retorna `201 Created` con `{ imageUrl: "/uploads/<uuid>.webp" }`, y la imagen es accesible vía HTTP con cabecera `nosniff`.

- [x] **Tarea 4.5: Tests Automatizados de Integración para Tubería CDR** (Cubre: RF-04, RF-05, RF-06, 6.2.2)
  - **Acción:** Crear `server/tests/cdr-upload.test.ts`. Probar: subida de imagen válida PNG/JPEG (se genera `.webp` en disco), rechazo por Magic Bytes falsos, rechazo de imagen $> 4096\times 4096$ px, rechazo por archivo $> 5$ MB, y verificación de cabeceras en `/uploads/*`.
  - **Hecho cuando:** La suite `cdr-upload.test.ts` corre en verde y elimina los archivos temporales creados al finalizar.

---

## Bloque 5: CRUD de Taxonomías y Marcas con Integridad Referencial

- [x] **Tarea 5.1: Esquemas Zod, Servicio y Controlador de Marcas (`/api/brands`)** (Cubre: RF-09, D-04)
  - **Acción:** Crear `server/src/schemas/brand.schemas.ts` (`brandFormSchema.strict()`), `server/src/services/brand.service.ts` y `server/src/controllers/brand.controller.ts`. Implementar `GET /api/brands` (público), `POST /api/brands` (valida unicidad case-insensitive), `PUT /api/brands/:id` y `DELETE /api/brands/:id` (captura violación de `onDelete: Restrict` de Prisma y retorna `409 Conflict` si tiene productos vinculados).
  - **Hecho cuando:** Las marcas se pueden crear, listar, editar y eliminar; y cualquier intento de borrar una marca con productos retorna `409 Conflict`.

- [x] **Tarea 5.2: Esquemas Zod, Servicio y Controlador de Categorías (`/api/categories`)** (Cubre: RF-08, D-04)
  - **Acción:** Crear `server/src/schemas/category.schemas.ts` (`categoryFormSchema.strict()`), `server/src/services/category.service.ts` y `server/src/controllers/category.controller.ts`. Implementar:
    - `GET /api/categories`: lista categorías con `parentId`.
    - `POST /api/categories`: valida unicidad global case-insensitive y comprueba que `parentId` referenciado sea raíz (`parentId === null`).
    - `PUT /api/categories/:id`: previene auto-asignación (`parentId !== id`) y bloquea asignar padre si la categoría ya posee hijas.
    - `DELETE /api/categories/:id`: retorna `409 Conflict` si posee subcategorías hijas o si tiene productos vinculados en `ProductCategory` (`onDelete: Restrict`).
  - **Hecho cuando:** La taxonomía respeta el límite estricto de 1 nivel, impide ciclos jerárquicos y bloquea con 409 la eliminación de categorías en uso.

- [x] **Tarea 5.3: Tests Automatizados de Integración para Marcas y Categorías** (Cubre: RF-08, RF-09, 6.2.3)
  - **Acción:** Crear `server/tests/referential-integrity.test.ts`. Probar: creación y edición de marcas y categorías, validación de 1 solo nivel jerárquico, intento bloqueado de eliminar categoría con productos (409), intento bloqueado de eliminar categoría padre con hijas (409) e intento bloqueado de eliminar marca con productos (409).
  - **Hecho cuando:** La suite `referential-integrity.test.ts` pasa al 100% en verde demostrando la protección de integridad referencial.

---

## Bloque 6: CRUD de Catálogo de Productos y Métricas de Dashboard

- [x] **Tarea 6.1: Esquemas Zod y Servicio Transaccional de Productos** (Cubre: RF-07, D-03, D-05, D-06)
  - **Acción:** Crear `server/src/schemas/product.schemas.ts` con `productFormSchema.strict()` y `visibilityPatchSchema.strict()`. Crear `server/src/services/product.service.ts` implementando las operaciones sobre PostgreSQL utilizando transacciones interactivas de Prisma (`prisma.$transaction`) para sincronizar de forma atómica el registro en `Product` y las filas asociadas en la tabla intermedia `ProductCategory`.
  - **Hecho cuando:** La creación y actualización de un producto persiste atómicamente sus atributos y sus relaciones múltiples con categorías en `product_categories`.

- [x] **Tarea 6.2: DTO Serializer y Controlador de Listado (`GET /api/products`)** (Cubre: RF-07, D-05)
  - **Acción:** Implementar en `server/src/controllers/product.controller.ts` la función de transformación DTO que tome la entidad `Product` con su inclusión de `productCategories` y la aplane, entregando exactamente `categoryIds: string[]` y `brandId: string`. Montar la ruta pública `GET /api/products`.
  - **Hecho cuando:** `GET /api/products` responde con código 200 y una lista plana de productos que coincide exactamente con la interfaz y contratos del frontend de la Fase 4.

- [x] **Tarea 6.3: Endpoints de Creación (`POST`) y Edición (`PUT`) de Productos** (Cubre: RF-07, RF-06, D-10)
  - **Acción:** Implementar en `product.controller.ts` y `product.routes.ts`:
    - `POST /api/products`: protegido con `requireAuth` y Anti-CSRF, inserta el producto y sus categorías.
    - `PUT /api/products/:id`: protegido con `requireAuth` y Anti-CSRF, actualiza los datos y la relación `ProductCategory`. Si el `imageUrl` enviado es distinto al anterior, invoca `fileStorageService.deleteFile(oldImageUrl)` de forma asíncrona post-commit.
  - **Hecho cuando:** Se pueden dar de alta y editar productos, y al sustituir la foto de un producto, la imagen previa se elimina físicamente de `server/uploads/`.

- [x] **Tarea 6.4: Endpoints de Visibilidad (`PATCH`) y Eliminación (`DELETE`) de Productos** (Cubre: RF-07, RF-06, D-10)
  - **Acción:** Implementar en `product.controller.ts` y `product.routes.ts`:
    - `PATCH /api/products/:id/visibility`: valida body explícito `{ visible: boolean }` y actualiza el campo booleano.
    - `DELETE /api/products/:id`: elimina el producto (la clave foránea `Cascade` en `ProductCategory` purga las filas asociadas) y随后 invoca la eliminación física de su archivo `.webp` en disco.
  - **Hecho cuando:** El toggle de visibilidad responde con el producto actualizado, y el borrado de producto elimina el registro de PostgreSQL y su archivo `.webp` de `server/uploads/`.

- [x] **Tarea 6.5: Servicio y Endpoint de Métricas del Dashboard (`GET /api/admin/metrics`)** (Cubre: RF-10)
  - **Acción:** Crear `server/src/services/metrics.service.ts`, `server/src/controllers/metrics.controller.ts` y `server/src/routes/metrics.routes.ts`. Implementar consultas de agregación con `prisma.product.count(...)`, `prisma.category.count()`, y `prisma.brand.count()` para devolver `{ totalProducts, visibleProducts, hiddenProducts, totalCategories, totalBrands }`. Proteger la ruta con `requireAuth`.
  - **Hecho cuando:** `GET /api/admin/metrics` con sesión de admin devuelve el objeto JSON con los 5 contadores reales calculados desde PostgreSQL.

- [x] **Tarea 6.6: Tests Automatizados de Integración para Productos y Métricas** (Cubre: RF-07, RF-10, 6.2.4)
  - **Acción:** Crear `server/tests/catalog-crud.test.ts`. Probar: listado con formato plano (`categoryIds`), creación de producto, edición con purga de imagen anterior, patch de visibilidad explícito `{ visible: boolean }`, eliminación de producto con borrado físico de archivo, y consulta de métricas.
  - **Hecho cuando:** La suite `catalog-crud.test.ts` corre y pasa al 100% en verde.

---

## Bloque 7: Verificación Global y Orquestación

- [x] **Tarea 7.1: Configuración de Scripts de Orquestación en la Raíz** (Cubre: D-01, D-02)
  - **Acción:** Actualizar el `package.json` de la raíz del repositorio agregando los scripts:
    - `"server:dev"`: ejecuta el backend con `tsx watch server/src/index.ts`.
    - `"server:build"`: compila el código TypeScript del servidor.
    - `"server:test"`: ejecuta vitest dentro de `/server`.
    - `"dev:all"`: ejecuta concurrentemente frontend (`vite`) y backend (`server:dev`).
  - **Hecho cuando:** Al ejecutar `npm run dev:all` en la raíz, tanto el servidor Vite (puerto 5173) como el servidor Express (puerto 3001) levantan simultáneamente sin colisiones de consola.

- [x] **Tarea 7.2: Ejecución de la Suite Completa de Verificación y Auditoría de Cierre** (Cubre: RF-01 a RF-11)
  - **Acción:** Ejecutar todas las suites de prueba de backend (`npm run server:test`), verificar que la base de datos PostgreSQL en Docker mantenga consistencia, y auditar que ningún secreto quede expuesto en logs o respuestas HTTP.
  - **Hecho cuando:** El comando de testing reporta 100% de tests en verde en todas las suites (`auth.test.ts`, `cdr-upload.test.ts`, `referential-integrity.test.ts`, `catalog-crud.test.ts`) y la cobertura de los requisitos funcionales RF-01 a RF-11 queda verificada.

---

## Bloque 8: Integración Final Frontend-Backend (Conexión Real)

- [x] **Tarea 8.1: Configuración del Cliente HTTP Centralizado (`src/lib/api.ts`)**
  - **Acción:** Crear `src/lib/api.ts` implementando un cliente HTTP centralizado (wrapper de `fetch` o instancia de cliente) preconfigurado con `VITE_API_URL` (por defecto `http://localhost:3001`), que incluya automáticamente:
    - Envío y recepción de cookies de sesión (`credentials: "include"` / `withCredentials: true`).
    - Cabecera obligatoria de mitigación Anti-CSRF: `X-Requested-With: XMLHttpRequest`.
    - Cabecera `Content-Type: application/json` para payloads JSON (omitiéndola adecuadamente al transmitir `FormData` multipart).
    - Métodos convenientes `get`, `post`, `put`, `patch`, `delete` y `upload` con extracción estructurada de respuestas y errores operativos (400, 401, 403, 409, 500).
  - **Hecho cuando:** El cliente puede realizar peticiones al backend adjuntando cookies y cabeceras de seguridad sin código redundante en los componentes.

- [x] **Tarea 8.2: Refactorización del Módulo de Autenticación y Rehidratación Silenciosa**
  - **Acción:** Modificar el contexto y componentes de autenticación en el frontend (`src/context/AdminAuthContext.tsx` o equivalente):
    - Conectar la función de login para consumir `POST /api/auth/login` enviando `{ email, password }` mediante el cliente HTTP.
    - Implementar la rehidratación de sesión silenciosa en el montaje de la aplicación (`useEffect`) consumiendo `GET /api/auth/me` para restaurar el estado del administrador tras recargas de página (F5) sin requerir re-login.
    - Conectar la acción de cierre de sesión para consumir `POST /api/auth/logout`, limpiando el estado de React tras la expiración de la cookie.
  - **Hecho cuando:** Un administrador puede iniciar sesión con credenciales de PostgreSQL, recargar la página (F5) manteniendo la sesión activa mediante la cookie `HttpOnly`, y cerrar sesión invalidando la cookie tanto en frontend como en backend.

- [x] **Tarea 8.3: Integración de la Tubería CDR para Subida de Imágenes en Formulario**
  - **Acción:** Modificar el formulario de alta y edición de repuestos (`ProductFormModal.tsx` o componente de subida de imágenes):
    - Al seleccionar un archivo de imagen (`input[type="file"]`), encapsularlo en un objeto `FormData` con la clave `file`.
    - Enviar la petición multipart `POST /api/uploads/product-image` mediante el cliente HTTP y esperar la respuesta `201 Created`.
    - Extraer la ruta retornada `{ imageUrl: "/uploads/<uuid>.webp" }` y sincronizarla en el campo `imageUrl` del formulario de Zod / React Hook Form antes de proceder con el submit del producto.
    - Presentar indicador visual de carga durante el procesamiento Sharp del servidor y capturar errores si el archivo excede los 5 MB o supera las dimensiones máximas (4096px).
  - **Hecho cuando:** La selección de una imagen procesa el archivo a través de la tubería CDR de Node.js/Sharp y deja enlazada la URL final `.webp` en el formulario del producto.

- [x] **Tarea 8.4: Refactorización de `AdminContext` para Persistencia Real (CRUD Completo)**
  - **Acción:** Desvincular completamente el `AdminContext` (o stores equivalentes de catálogo, marcas y categorías) de los datos simulados en memoria (`admin-seed-data.ts`):
    - En el montaje inicial, ejecutar consultas paralelas a `GET /api/brands`, `GET /api/categories`, `GET /api/products` y `GET /api/admin/metrics` para poblar el estado de React directamente desde PostgreSQL.
    - Refactorizar las mutaciones de productos: `createProduct` (`POST /api/products`), `updateProduct` (`PUT /api/products/:id`), `toggleProductVisibility` (`PATCH /api/products/:id/visibility`) y `deleteProduct` (`DELETE /api/products/:id`).
    - Refactorizar las mutaciones de marcas y categorías: altas (`POST`), modificaciones (`PUT`) y eliminaciones (`DELETE`).
    - Actualizar el estado local de React exclusivamente tras recibir respuesta exitosa (200/201) del backend, y capturar errores operacionales (como el `409 Conflict` por restricciones `onDelete: Restrict`) desplegando notificaciones claras (toasts) en la interfaz.
  - **Hecho cuando:** `admin-seed-data.ts` ya no es utilizado para el estado operativo del Backoffice, y todas las operaciones CRUD en el panel de administración impactan de forma inmediata y verificable en la base de datos PostgreSQL.

- [x] **Tarea 8.5: Validación Integral y Prueba de Humo End-to-End**
  - **Acción:** Iniciar simultáneamente frontend y backend mediante `npm run dev:all` y comprobar el flujo completo de usuario en el navegador:
    - Login de administrador con sesión real.
    - Carga del catálogo, categorías, marcas y métricas del dashboard desde PostgreSQL.
    - Creación y edición de un producto con subida y previsualización de imagen `.webp`.
    - Eliminación de un producto y comprobación de la actualización inmediata de contadores en el dashboard.
    - Recarga con F5 manteniendo el estado de autenticación y los datos intactos.
  - **Hecho cuando:** El frontend y el backend operan sincronizados al 100%, sin errores de consola, con cookies seguras y sin depender de ningún mock o estado volátil en memoria.

---

*Fin del desglose de tareas de implementación técnica.*
