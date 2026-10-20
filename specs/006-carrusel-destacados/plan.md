# Plan de Arquitectura e Implementación — Fase 6: Gestión Dinámica del Carrusel de Productos Destacados

**Fase:** 006-carrusel-destacados  
**Versión:** 1.0  
**Fecha:** 2026-10-20  
**Basado en:** [docs/constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md), [specs/006-carrusel-destacados/spec.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/006-carrusel-destacados/spec.md)  
**Estado:** Plan de Arquitectura Aprobado para Ejecución  

---

## 1. Estructura de Módulos y Archivos a Modificar / Crear

El diseño modular respeta el principio de separación estricta de responsabilidades entre el frontend (React 19 / Vite / TanStack Router) y el backend aislado (`/server` en Express / Prisma / PostgreSQL).

### 1.1 Backend (`/server`)

| Archivo | Tipo | Responsabilidad / Cambios Principales | Trazabilidad RF |
| :--- | :--- | :--- | :--- |
| `server/prisma/schema.prisma` | Modificación | Incorporar `isFeatured: Boolean @default(false)` y `featuredAt: DateTime?`, con índices compuestos `@@index([visible, isFeatured])` y `@@index([featuredAt])`. | RF-03, RF-05, RF-06 |
| `server/prisma/migrations/<timestamp>_add_featured_products/` | Creación | Migración SQL generada por Prisma Migrate para persistir las nuevas columnas e índices en PostgreSQL. | RF-03, RNF-01 |
| `server/src/schemas/product.schemas.ts` | Modificación | Actualizar `productFormSchema` con `isFeatured: z.boolean().default(false)`. Agregar `featuredPatchSchema` con `isFeatured: z.boolean()` en modo `.strict()`. | RF-01, RF-02, RNF-02 |
| `server/src/services/product.service.ts` | Modificación | Métodos transaccionales: `toggleFeatured(id, isFeatured)` con bloqueo y límite de 10; `getFeaturedProducts()` con filtro `visible: true` y orden LIFO; actualización de `updateProductVisibility` para excluir de consulta sin purgar flag. | RF-01, RF-03, RF-05, RF-06 |
| `server/src/controllers/product.controller.ts` | Modificación | Controladores para `PATCH /api/products/:id/featured` y `GET /api/products/featured`. Manejo de respuesta `409 Conflict` cuando se alcanza el límite. | RF-01, RF-03, RF-07 |
| `server/src/routes/product.routes.ts` | Modificación | Registrar endpoint público `GET /featured` y endpoint autenticado/CSRF `PATCH /:id/featured`. | RF-01, RF-07 |
| `server/src/services/metrics.service.ts` | Modificación | Calcular la métrica cuantitativa de productos destacados activos (`isFeatured: true AND visible: true`). | RF-04 (CA-04.1) |
| `server/src/controllers/metrics.controller.ts` | Modificación | Exponer `featuredProductsCount` dentro del payload JSON de `/api/admin/metrics`. | RF-04 (CA-04.1) |

### 1.2 Frontend — Panel de Administración (`src/components/admin`)

| Archivo | Tipo | Responsabilidad / Cambios Principales | Trazabilidad RF |
| :--- | :--- | :--- | :--- |
| `src/types/product.ts` (o `admin-products.tsx`) | Modificación | Añadir `isFeatured: boolean` y `featuredAt: string \| null` a las interfaces de dominio `Product` y `ProductFormData`. | RF-01 a RF-06 |
| `src/context/AdminContext.tsx` | Modificación | Métodos `toggleFeaturedProduct(id: string)` pesimista (spinner y llamada a API) y exposición del contador `featuredCount`. | RF-01, RF-03, RNF-04 |
| `src/components/admin/products/ProductToolbar.tsx` | Modificación | Añadir contador dinámico `"Destacados: X / 10"` y botón/chip de filtro rápido `"Solo Destacados"` con combinación lógica `AND`. | RF-04 (CA-04.2, CA-04.3) |
| `src/components/admin/products/ProductTable.tsx` | Modificación | Añadir columna de acción rápida con switch/estrella, control de estado *loading/disabled* en productos ocultos o en mutación, y manejo de toast ante rechazo 409. | RF-01, RF-03, RF-05 |
| `src/components/admin/products/ProductFormModal.tsx` | Modificación | Agregar conmutador "Mostrar en Carrusel de Inicio" (`isFeatured`), bloqueado (*disabled*) de entrada si el cupo está en 10/10 en alta de nuevo producto. | RF-02, RF-03 (CA-02.2) |
| `src/components/admin/dashboard/DashboardMetrics.tsx` | Modificación | Añadir la 6.ª tarjeta de métrica "Productos Destacados (X / 10)" con navegación o filtro directo a la grilla. | RF-04 (CA-04.1) |

### 1.3 Frontend — Landing Page (`src/components/landing`)

| Archivo | Tipo | Responsabilidad / Cambios Principales | Trazabilidad RF |
| :--- | :--- | :--- | :--- |
| `src/services/landing.service.ts` | Creación | Cliente HTTP liviano con fetch/axios hacia `GET /api/products/featured` con tipado estricto y manejo de errores silencioso. | RF-07, RNF-03 |
| `src/components/landing/FeaturedProductsCarousel.tsx` | Modificación | Hidratación reactiva con datos de la API. *Skeleton* preventivo de CLS durante carga, desmontaje silencioso ante 0 elementos o error de red/500, y ajuste de `<Link to="/catalogo/$productId" params={{ productId: product.id }}>`. | RF-07, RNF-05 |
| `src/routes/index.tsx` | Modificación | Renderizado del componente hidratado dentro de la Landing Page sin alterar maquetación circundante. | RF-07 |

---

## 2. Modelo de Datos y Migración en Prisma

### 2.1 Modificación de Esquema en `server/prisma/schema.prisma`

Se actualiza el modelo `Product` agregando los atributos de destaque y optimizando los accesos con índices específicos:

```prisma
// server/prisma/schema.prisma (Extracto del modelo Product)

model Product {
  id                   String            @id @default(uuid()) @db.Uuid
  name                 String
  description          String            @db.Text
  imageUrl             String            @map("image_url")
  brandId              String            @map("brand_id") @db.Uuid
  brand                Brand             @relation(fields: [brandId], references: [id], onDelete: Restrict)
  vehicleCompatibility String?           @map("vehicle_compatibility")
  condition            String            // 'Nuevo' | 'Reacondicionado' | 'Usado'
  price                Int?              // Entero en pesos ARS (null = a cotizar)
  showPrice            Boolean           @default(true) @map("show_price")
  visible              Boolean           @default(true)
  oem                  String?
  
  // --- Nuevos Campos Fase 6 (RF-03, RF-05, RF-06) ---
  isFeatured           Boolean           @default(false) @map("is_featured")
  featuredAt           DateTime?         @map("featured_at")

  productCategories    ProductCategory[]
  createdAt            DateTime          @default(now()) @map("created_at")
  updatedAt            DateTime          @updatedAt @map("updated_at")

  @@index([visible])
  @@index([visible, isFeatured])        // Optimización para consulta pública del carrusel (RF-07)
  @@index([featuredAt(sort: Desc)])    // Optimización para orden LIFO del carrusel (RF-06)
  @@map("products")
}
```

### 2.2 Estrategia de Migración SQL
La migración generada mediante `npx prisma migrate dev --name add_featured_products` ejecutará:

```sql
-- DDL generado
ALTER TABLE "products" 
  ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "featured_at" TIMESTAMP(3);

CREATE INDEX "products_visible_is_featured_idx" ON "products"("visible", "is_featured");
CREATE INDEX "products_featured_at_idx" ON "products"("featured_at" DESC);
```

**Justificación de Integridad:**
- Los productos existentes en base de datos quedan inicializados con `is_featured = false` y `featured_at = NULL`, garantizando compatibilidad retrospectiva inmediata sin interrumpir catálogos preexistentes.

---

## 3. Contrato de API REST / Endpoints

En estricto cumplimiento de `docs/constitution.md`:
- **Principio 2 (Fail-Fast con Zod):** Todo endpoint valida payloads, queries y parámetros antes de invocar la capa de negocio.
- **Principio 4 (Sesión Zero-Trust):** Endpoints administrativos exigen cookie JWT HttpOnly y cabecera `X-Requested-With: XMLHttpRequest`.
- **Principio 5 (Persistencia como Única Fuente de Verdad):** Todas las validaciones de límite se resuelven en la base de datos PostgreSQL.
- **Principio 6 (Errores Opacos):** Respuestas de servidor inesperadas ocultan detalles y retornan `{ error: "Error interno del servidor", referencia: "<uuid>" }`.

### 3.1 `GET /api/products/featured` (Público)
*Cubre: RF-06, RF-07, RNF-03, RNF-05*

- **Descripción:** Retorna la lista pública de productos destacados activos para el carrusel de la Landing Page.
- **Headers Requeridos:** Ninguno (público).
- **Parámetros:** Ninguno.
- **Respuesta 200 OK:**
  ```json
  [
    {
      "id": "a5e8f492-2b63-4d89-9b12-9c1d0a5e8f11",
      "name": "Inyector Common Rail Bosch 0445110",
      "brandName": "Bosch",
      "oem": "0445110369",
      "condition": "Nuevo",
      "price": 320000,
      "showPrice": true,
      "vehicleCompatibility": "Toyota Hilux 2.8 / 3.0 D-4D",
      "imageUrl": "/uploads/a5e8f492-2b63-4d89-9b12-9c1d0a5e8f11.webp"
    }
  ]
  ```
- **Respuesta 200 OK (vacío):** `[]` (desencadena desmontaje silencioso de la sección en la Landing).
- **Respuesta 500:** `{ "error": "Error interno del servidor", "referencia": "<uuid>" }`

### 3.2 `PATCH /api/products/:id/featured` (Protegido - Backoffice)
*Cubre: RF-01, RF-03, RF-05, RNF-01, RNF-02, RNF-03*

- **Descripción:** Conmuta la condición de destacado de un producto individual de forma rápida desde la grilla.
- **Seguridad:** Cookie de sesión JWT HttpOnly (`requireAuth`) + cabecera `X-Requested-With: XMLHttpRequest` (`csrfProtection`).
- **Validación en Frontera (Zod Schema):**
  ```typescript
  // server/src/schemas/product.schemas.ts
  export const featuredPatchSchema = z
    .object({
      isFeatured: z.boolean({
        required_error: "El campo 'isFeatured' es obligatorio",
        invalid_type_error: "El campo 'isFeatured' debe ser booleano",
      }),
    })
    .strict();
  ```
- **Parámetros de Ruta:** `id` validado con `uuidParamSchema`.
- **Payload (`body`):** `{ "isFeatured": true }`
- **Respuesta 200 OK:**
  ```json
  {
    "id": "a5e8f492-2b63-4d89-9b12-9c1d0a5e8f11",
    "isFeatured": true,
    "featuredAt": "2026-10-20T20:30:00.000Z",
    "featuredCount": 7
  }
  ```
- **Respuesta 400 Bad Request:**
  - Si el producto tiene `visible: false` y se intenta enviar `isFeatured: true`:
    ```json
    {
      "error": "Operación inválida",
      "details": [{ "field": "isFeatured", "message": "No se puede destacar un producto con visibilidad oculta" }]
    }
    ```
- **Respuesta 404 Not Found:** `{ "error": "Producto no encontrado" }`
- **Respuesta 409 Conflict (Límite de Cupo Alcanzado):**
  ```json
  {
    "error": "Límite alcanzado. Desmarca un producto primero",
    "currentCount": 10,
    "maxLimit": 10
  }
  ```
- **Respuesta 500:** `{ "error": "Error interno del servidor", "referencia": "<uuid>" }`

### 3.3 `POST /api/products` y `PUT /api/products/:id` (Actualización de Contrato)
*Cubre: RF-02, RF-03, RF-05*

- Se extiende `productFormSchema` para admitir `isFeatured: z.boolean().default(false)`.
- En creación (`POST`), si `isFeatured: true`:
  - Se comprueba transaccionalmente el cupo (< 10). Si ya hay 10, responde `409 Conflict`.
  - Se asigna automáticamente `featuredAt = new Date()`.
- En edición (`PUT`):
  - Si transiciona de `false` a `true`: verifica cupo y estampa `featuredAt = new Date()`.
  - Si transiciona de `true` a `false`: asigna `featuredAt = null`.
  - Si se mantiene en `true`: **no** se altera `featuredAt` (preservación de LIFO).

### 3.4 `GET /api/admin/metrics` (Actualización de Contrato)
*Cubre: RF-04 (CA-04.1)*

- **Respuesta 200 OK:**
  ```json
  {
    "totalProducts": 48,
    "visibleProducts": 42,
    "hiddenProducts": 6,
    "featuredProducts": 7,
    "totalCategories": 12,
    "totalBrands": 8
  }
  ```

---

## 4. Decisiones Técnicas Justificadas y Alternativas Descartadas

### D-01: Control de Concurrencia mediante Transacciones con Bloqueo a Nivel de Fila
*Cubre: RF-03, RNF-01 (Principio 5 de la Constitución)*

- **Decisión:** Para evaluar y modificar el límite máximo de 10 productos destacados, se utiliza una transacción Prisma interactiva (`prisma.$transaction`) ejecutando un recuento y actualización atómica bajo aislamiento Serializable o con bloqueo explícito:
  ```typescript
  return await prisma.$transaction(async (tx) => {
    // 1. Verificar estado actual del producto objetivo
    const product = await tx.product.findUniqueOrThrow({ where: { id } });
    if (!product.visible && isFeatured) {
      throw new BadRequestException("No se puede destacar un producto oculto");
    }

    if (isFeatured && !product.isFeatured) {
      // 2. Conteo atómico de destacados actuales
      const currentFeaturedCount = await tx.product.count({
        where: { isFeatured: true }
      });

      if (currentFeaturedCount >= 10) {
        throw new ConflictException("Límite alcanzado. Desmarca un producto primero");
      }
    }

    // 3. Mutación
    return await tx.product.update({
      where: { id },
      data: {
        isFeatured,
        featuredAt: isFeatured ? (product.isFeatured ? product.featuredAt : new Date()) : null
      }
    });
  });
  ```
- **Alternativa Descartada:** Validación previa en memoria del servidor sin transacción (`count()` previo seguido de `update()`). Se descartó porque ante dos peticiones simultáneas (dos administradores o pestañas) cuando el contador está en 9, ambas leen 9 concurrentemente y ambas proceden, provocando una condición de carrera que almacena 11 destacados en PostgreSQL.

### D-02: Columna Dedicada `featuredAt` para Ordenamiento LIFO
*Cubre: RF-06*

- **Decisión:** Crear una columna `featuredAt DateTime?` en la tabla `products` que se actualiza única y exclusivamente cuando el producto transiciona a `isFeatured: true`. La consulta del carrusel ordena por `featuredAt: 'desc'`.
- **Alternativa Descartada:** Reutilizar `updatedAt: 'desc'`. Se descartó formalmente (Hallazgo 1 de QA) porque cualquier edición rutinaria del producto (actualización de precios en ARS, corrección de descripción o stock) actualizaba `updatedAt`, alterando arbitrariamente el escaparate de la Landing Page sin que el administrador lo deseara.

### D-03: Preservación de Estado de Destaque al Pausar Visibilidad
*Cubre: RF-05, CL-06, CL-07*

- **Decisión:** Si un producto pasa a `visible: false`, se mantiene intacto su valor `isFeatured: true` y su `featuredAt`. La consulta pública del carrusel filtra por `WHERE visible = true AND isFeatured = true`. Al volver a hacerlo visible, el producto reaparece automáticamente en el carrusel en su posición cronológica histórica.
- **Alternativa Descartada:** Sobrescribir forzosamente `isFeatured = false` al ocultar el producto. Se descartó (Hallazgo 8 de QA) porque obligaba al administrador a reconfigurar los destacados tras pausas temporales de catálogo (ej. por mantenimiento de precios o falta transitoria de stock).

### D-04: Actualización Pesimista con Spinner en la Grilla del Backoffice
*Cubre: RF-01, RNF-04*

- **Decisión:** Al accionar el switch de destacado en la tabla de productos, el componente entra en estado `loading` local (muestra un mini spinner en el switch y bloquea la fila). El estado visual de la fila solo se actualiza formalmente cuando la promesa de red se resuelve con `200 OK`. Si responde `409 Conflict`, el switch vuelve a su posición original y se lanza un toast de error con `sonner`.
- **Alternativa Descartada:** Actualización optimista inmediata en cliente. Se descartó (Hallazgo 7 de QA) porque violaría el Principio 5 de la Constitución si la operación es rechazada en la base de datos por sobrecupo o error de red, generando una falsa ilusión de éxito en el usuario.

### D-05: Envoltura Unificada de Tarjeta y Prevención de CLS en Landing Page
*Cubre: RF-07, RNF-03, RNF-05*

- **Decisión:** La tarjeta del componente `FeaturedProductsCarousel.tsx` envuelve todo su contenido visual dentro de un `<Link to="/catalogo/$productId" params={{ productId: product.id }}>`. Durante la carga de la API, se renderiza un contenedor con la misma altura calculada (`min-h-[460px]`) para que el navegador reserve el espacio vertical exacto y la métrica CLS se mantenga en 0. Si la petición devuelve 0 elementos o falla (500), el componente desmonta la sección de forma limpia.
- **Alternativa Descartada:** Renderizar botones secundarios de WhatsApp dentro de la tarjeta o mostrar una alerta de error en la Landing Page si la API falla. Se descartó porque compite con la conversión de tráfico hacia el catálogo completo y daña la estética de la portada pública del taller.

---

## 5. Estrategia de Pruebas (Testing Suite)

Se diseñará una suite de pruebas automatizadas cubriendo los tres niveles de la pirámide de pruebas (Unitarias, Integración y Componentes).

### 5.1 Pruebas Unitarias Backend (Vitest / Jest en `/server`)
*Cubre: RF-01, RF-02, RF-03, RF-05, RF-06*

1. **`product.schemas.test.ts`**:
   - Validar que `featuredPatchSchema` acepte `{ isFeatured: true }` y `{ isFeatured: false }`.
   - Validar que `featuredPatchSchema` rechace con error Zod propiedades adicionales (`.strict()`) o tipos no booleanos.
   - Validar que `productFormSchema` acepte opcionalmente `isFeatured` por defecto en `false`.
2. **`product.service.unit.test.ts`**:
   - Mockear cliente Prisma.
   - Verificar que al invocar `toggleFeatured(id, true)` cuando el conteo actual es 10, arroje `ConflictException` (HTTP 409).
   - Verificar que al destacar un producto que tiene `visible: false`, arroje `BadRequestException` (HTTP 400).
   - Verificar que al desmarcar un producto (`isFeatured: false`), asigne `featuredAt: null`.
   - Verificar que al marcarlo por primera vez, asigne `featuredAt: expect.any(Date)`.

### 5.2 Pruebas de Integración Backend (Supertest + DB Test Container en `/server`)
*Cubre: RF-01, RF-03, RF-05, RF-06, RF-07, RNF-01*

1. **`featured-products.integration.test.ts`**:
   - **Flujo de Cupo Máximo:** Insertar 10 productos destacados en la BD. Enviar `PATCH /api/products/:id/featured` con `{ isFeatured: true }` para el 11.º producto. Esperar respuesta `409 Conflict` con `{ error: "Límite alcanzado. Desmarca un producto primero" }`.
   - **Prueba de Concurrencia Real:** Simular 5 peticiones concurrentes simultáneas (`Promise.all`) intentando destacar productos distintos cuando el cupo está en 9/10. Verificar que exactamente 1 petición responda `200 OK` y las 4 restantes respondan `409 Conflict`. La BD debe registrar exactamente 10 productos destacados.
   - **Orden LIFO en Endpoint Público:** Destacar Producto A a las 10:00, Producto B a las 10:05 y Producto C a las 10:10. Llamar a `GET /api/products/featured`. Verificar que el array retornado tenga el orden `[Producto C, Producto B, Producto A]`.
   - **Exclusión por Visibilidad Oculta:** Tomar Producto C (destacado) y cambiar su visibilidad a `false` (`PATCH /api/products/:id/visibility`). Llamar a `GET /api/products/featured`. Verificar que el array retorne solo `[Producto B, Producto A]`, pero que la consulta en BD confirme que Producto C mantiene `is_featured = true`.
   - **Limpieza Definitiva por Eliminación:** Borrar Producto B (`DELETE /api/products/:id`). Verificar que el cupo se reduzca y `GET /api/admin/metrics` reporte `featuredProducts: 1`.

### 5.3 Pruebas de Componentes Frontend (Vitest + React Testing Library)
*Cubre: RF-01, RF-02, RF-04, RF-07*

1. **`ProductTable.featured.test.tsx`**:
   - Renderizar la grilla con productos mockeados.
   - Verificar que el switch de destacado aparezca deshabilitado en filas de productos con visibilidad oculta.
   - Simular clic en el switch: verificar que aparezca el estado de carga (*loading*) en el control.
   - Mockear respuesta de error 409 de la API: verificar que el switch vuelva a su posición apagada y se dispare el toast de error de `sonner`.
2. **`ProductToolbar.featured.test.tsx`**:
   - Verificar que renderice el badge `"Destacados: 4 / 10"`.
   - Simular activación del filtro `"Solo Destacados"`: verificar que emita el evento para filtrar la tabla mostrando únicamente los productos con `isFeatured: true`.
   - Verificar la combinación con el buscador de texto (`AND`).
3. **`ProductFormModal.featured.test.tsx`**:
   - Renderizar el modal en modo creación pasando `featuredCount = 10`. Verificar que el switch de destacado esté `disabled` y muestre el mensaje preventivo de límite alcanzado.
   - Renderizar el modal en modo edición para un producto que ya es destacado: verificar que el switch esté `enabled` para permitir remover el destaque.
4. **`FeaturedProductsCarousel.integration.test.tsx`**:
   - **Caso 0 destacados:** Mockear respuesta `[]` de la API: verificar que el componente retorne `null` y la sección no exista en el DOM.
   - **Caso Error 500:** Mockear error 500: verificar que el componente degrade de forma silenciosa sin romper el árbol de React.
   - **Caso Éxito:** Mockear 3 productos: verificar que las tarjetas estén envueltas en links a `/catalogo/$productId` y muestren badges de marca y condición.

---

## 6. Matriz de Trazabilidad Requisitos vs. Plan

| Requisito Funcional (Spec) | Componente / Archivo | Mecanismo de Implementación en Plan | Prueba Asociada |
| :--- | :--- | :--- | :--- |
| **RF-01** (Acción rápida en tabla) | `ProductTable.tsx`, `product.routes.ts` | Endpoint `PATCH /:id/featured` con actualización pesimista y spinner. | `ProductTable.featured.test.tsx`, `featured-products.integration.test.ts` |
| **RF-02** (Control en formulario) | `ProductFormModal.tsx`, `product.schemas.ts` | Extensión de `productFormSchema` y switch con bloqueo si el cupo está saturado. | `ProductFormModal.featured.test.tsx` |
| **RF-03** (Límite estricto de 10) | `product.service.ts`, `ProductTable.tsx` | Transacción atómica Prisma con bloqueo de fila y retorno `409 Conflict`. | `featured-products.integration.test.ts` (concurrencia) |
| **RF-04** (Métricas, contador y filtro) | `DashboardMetrics.tsx`, `ProductToolbar.tsx` | 6.ª tarjeta en dashboard, contador `"Destacados: X / 10"` y chip filtro con lógica `AND`. | `ProductToolbar.featured.test.tsx` |
| **RF-05** (Coexistencia con visibilidad) | `product.service.ts` | Preservación de flag en base de datos; filtrado estricto `visible: true AND isFeatured: true` en consulta pública. | `featured-products.integration.test.ts` |
| **RF-06** (Orden LIFO con `featuredAt`) | `schema.prisma`, `product.service.ts` | Campo `featuredAt: DateTime?` independiente de `updatedAt`, ordenado por `featuredAt DESC`. | `featured-products.integration.test.ts` (LIFO) |
| **RF-07** (Consumo y enlace en Landing) | `FeaturedProductsCarousel.tsx`, `landing.service.ts` | Hidratación desde `GET /featured`, prevención de CLS, desmontaje si es 0 y enlace a `/catalogo/$productId`. | `FeaturedProductsCarousel.integration.test.tsx` |

---

## 7. Plan de Ejecución Paso a Paso

1. **Paso 1 (Persistencia):** Modificar `server/prisma/schema.prisma` y ejecutar la migración SQL `add_featured_products`.
2. **Paso 2 (Validación y DTOs):** Crear `featuredPatchSchema` y actualizar `productFormSchema` en `server/src/schemas/product.schemas.ts`.
3. **Paso 3 (Servicio Backend):** Implementar la lógica transaccional atómica en `product.service.ts` y el cálculo de métricas en `metrics.service.ts`.
4. **Paso 4 (Controladores y Rutas):** Exponer `PATCH /api/products/:id/featured`, `GET /api/products/featured` y actualizar `/api/admin/metrics`.
5. **Paso 5 (Testing Backend):** Ejecutar las pruebas unitarias y de integración de concurrencia y límites en `/server`.
6. **Paso 6 (Backoffice UI):**
   - Integrar la 6.ª tarjeta en `DashboardMetrics.tsx`.
   - Incorporar contador y filtro `"Solo Destacados"` en `ProductToolbar.tsx`.
   - Agregar columna de switch con spinner y toast en `ProductTable.tsx`.
   - Agregar conmutador con validación preventiva en `ProductFormModal.tsx`.
7. **Paso 7 (Landing Page UI):**
   - Conectar `FeaturedProductsCarousel.tsx` a `landing.service.ts`.
   - Ajustar el contenedor con altura de reserva (anti-CLS) y fallback silencioso.
   - Envolver las tarjetas en `<Link to="/catalogo/$productId" params={{ productId: product.id }}>`.
8. **Paso 8 (Testing Frontend & E2E):** Ejecutar la suite completa de pruebas de componentes y validar la experiencia visual sin desajustes.
