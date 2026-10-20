# Plan Técnico de Implementación: Backend, Base de Datos y Tubería de Archivos

**Fase:** 005-backend  
**Versión:** 1.0  
**Fecha:** 2026-10-19  
**Especificación:** [specs/005-backend/spec.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/005-backend/spec.md)  
**Marco Normativo:** [docs/constitution.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/docs/constitution.md) y [AGENTS.MD](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/AGENTS.MD)  
**Contratos Previos:** [specs/004-admin-panel/plan.md](file:///f:/INGENIERIA/GEPI/InyectoresDiesel/specs/004-admin-panel/plan.md) (Sección 4)  
**Estado:** Documento de Planificación de Arquitectura Técnica

---

## 1. Estructura de Directorios del Servidor (`/server`)

Para garantizar el aislamiento arquitectónico, modularidad y prevenir colisiones de tipado o dependencias con el frontend de Vite (`D-01`, `RF-01` a `RF-11`), el backend se organiza de forma autónoma en el directorio `/server` con su propio `package.json` y `tsconfig.json`:

```
server/
├── prisma/
│   ├── schema.prisma                  <-- Esquema relacional PostgreSQL (Modelos, FKs y Restrict) (RF-07 a RF-09)
│   ├── seed.ts                        <-- Script de aprovisionamiento inicial (Argon2id + Catálogo) (RF-11)
│   └── migrations/                    <-- Historial de migraciones SQL versionadas
├── uploads/                           <-- Directorio local de almacenamiento de imágenes sanitizadas (.webp) (RF-05, RF-06)
│   └── .gitkeep
├── src/
│   ├── config/
│   │   ├── env.ts                     <-- Validación Fail-Fast Zod de variables de entorno (Crash Early) (RF-01, 4.6)
│   │   └── prisma.ts                  <-- Instancia única del cliente PrismaClient con logs estructurados
│   ├── middleware/
│   │   ├── auth.middleware.ts         <-- Verificación de JWT en cookie HttpOnly (RF-01, RF-03)
│   │   ├── csrf.middleware.ts         <-- Verificación obligatoria de X-Requested-With (4.3)
│   │   ├── rate-limit.middleware.ts   <-- Limitadores de tasa para Auth y Uploads con trust proxy (RF-04, 4.4)
│   │   ├── validate.middleware.ts     <-- Middleware genérico de validación Zod con .strict() (4.2)
│   │   ├── upload.middleware.ts       <-- Multer en memoria (5 MB) + extensión whitelist (RF-04)
│   │   └── error.middleware.ts        <-- Manejador global: 400/401/409 legibles vs 500 opacos con UUID (RF-01, 4.5)
│   ├── schemas/
│   │   ├── auth.schemas.ts            <-- Esquemas Zod para login (RF-01)
│   │   ├── product.schemas.ts         <-- Esquemas Zod para creación, edición y visibility patch (RF-07)
│   │   ├── category.schemas.ts        <-- Esquemas Zod para taxonomías y verificación 1 nivel (RF-08)
│   │   └── brand.schemas.ts           <-- Esquemas Zod para fabricantes de repuestos (RF-09)
│   ├── services/
│   │   ├── auth.service.ts            <-- Lógica de negocio de autenticación y Argon2id (RF-01, RF-03)
│   │   ├── cdr.service.ts             <-- Tubería Sharp (metadatos, 4096px bomb, resize 1080px, quality 80) (RF-04, RF-05)
│   │   ├── file-storage.service.ts    <-- Escritura a disco y purga física segura con path.basename (RF-05, RF-06)
│   │   ├── product.service.ts         <-- Transacciones Prisma para productos y ProductCategory (RF-07)
│   │   ├── category.service.ts        <-- Lógica relacional de categorías y prevención de ciclos (RF-08)
│   │   ├── brand.service.ts           <-- Lógica relacional de marcas (RF-09)
│   │   └── metrics.service.ts         <-- Consultas agregadas del catálogo para Dashboard (RF-10)
│   ├── controllers/
│   │   ├── auth.controller.ts         <-- Endpoints /api/auth/* (login, logout, me) (RF-01 a RF-03)
│   │   ├── upload.controller.ts       <-- Endpoint /api/uploads/product-image (RF-04, RF-05)
│   │   ├── product.controller.ts      <-- Endpoints /api/products/* y DTO flattener de categoryIds (RF-07)
│   │   ├── category.controller.ts     <-- Endpoints /api/categories/* (RF-08)
│   │   ├── brand.controller.ts        <-- Endpoints /api/brands/* (RF-09)
│   │   └── metrics.controller.ts      <-- Endpoint /api/admin/metrics (RF-10)
│   ├── routes/
│   │   ├── auth.routes.ts             <-- Enrutador de autenticación
│   │   ├── upload.routes.ts           <-- Enrutador de carga de archivos (con rate limiter específico)
│   │   ├── product.routes.ts          <-- Enrutador de productos (públicos GET, protegidos mutaciones)
│   │   ├── category.routes.ts         <-- Enrutador de categorías (públicos GET, protegidos mutaciones)
│   │   ├── brand.routes.ts            <-- Enrutador de marcas (públicos GET, protegidos mutaciones)
│   │   ├── metrics.routes.ts          <-- Enrutador de métricas del dashboard
│   │   └── index.ts                   <-- Montaje central bajo el prefijo /api
│   ├── app.ts                         <-- Configuración de Express (Helmet, CORS, CookieParser, Static) (4.1 a 4.5)
│   └── index.ts                       <-- Punto de entrada del servidor (Validación ENV -> Listen) (4.6)
├── tests/
│   ├── helpers/
│   │   └── reset-db.ts                <-- Script de limpieza truncada entre tests de integración
│   ├── auth.test.ts                   <-- Pruebas de integración para login, logout, me y cookies HttpOnly
│   ├── cdr-upload.test.ts             <-- Pruebas de tubería de imagen, Magic Bytes y bombas de descompresión
│   ├── catalog-crud.test.ts           <-- Pruebas de productos, DTO aplanador y tabla intermedia
│   └── referential-integrity.test.ts  <-- Pruebas de restricción onDelete: Restrict en categorías y marcas
├── package.json
└── tsconfig.json
```

---

## 2. Modelo de Base de Datos (`server/prisma/schema.prisma`) `(RF-07, RF-08, RF-09, D-03, D-04, D-06)`

El esquema define la persistencia relacional estricta en PostgreSQL 15. Aplica la tabla pivote explícita `ProductCategory` para que PostgreSQL imponga `onDelete: Restrict` en el lado de `Category`, evitando que una categoría con productos asociados pueda ser eliminada a nivel de base de datos (`D-03`).

```prisma
// server/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// 1. Usuario Administrador (RF-01, RF-03, RF-11)
// ----------------------------------------------------
model AdminUser {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         String   @default("admin")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("admin_users")
}

// ----------------------------------------------------
// 2. Marcas de Repuestos (RF-09)
// ----------------------------------------------------
model Brand {
  id        String    @id @default(uuid()) @db.Uuid
  name      String    @unique
  products  Product[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("brands")
}

// ----------------------------------------------------
// 3. Categorías y Subcategorías (1 Nivel) (RF-08, D-04)
// ----------------------------------------------------
model Category {
  id                String            @id @default(uuid()) @db.Uuid
  name              String            @unique
  parentId          String?           @map("parent_id") @db.Uuid
  parent            Category?         @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Restrict)
  children          Category[]        @relation("CategoryHierarchy")
  productCategories ProductCategory[]
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  @@map("categories")
}

// ----------------------------------------------------
// 4. Catálogo de Productos (RF-07, D-06)
// ----------------------------------------------------
model Product {
  id                   String            @id @default(uuid()) @db.Uuid
  name                 String
  description          String            @db.Text
  imageUrl             String            @map("image_url")
  brandId              String            @map("brand_id") @db.Uuid
  brand                Brand             @relation(fields: [brandId], references: [id], onDelete: Restrict)
  vehicleCompatibility String?           @map("vehicle_compatibility")
  condition            String            // 'Nuevo' | 'Reacondicionado' | 'Usado'
  price                Int?              // Entero en pesos ARS (admite null para 'A cotizar' o 0)
  showPrice            Boolean           @default(true) @map("show_price")
  visible              Boolean           @default(true)
  oem                  String?
  productCategories    ProductCategory[]
  createdAt            DateTime          @default(now()) @map("created_at")
  updatedAt            DateTime          @updatedAt @map("updated_at")

  @@index([visible])
  @@map("products")
}

// ----------------------------------------------------
// 5. Tabla Pivote Explícita Producto-Categoría (D-03)
// ----------------------------------------------------
model ProductCategory {
  productId  String   @map("product_id") @db.Uuid
  categoryId String   @map("category_id") @db.Uuid
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  createdAt  DateTime @default(now()) @map("created_at")

  @@id([productId, categoryId])
  @@map("product_categories")
}
```

---

## 3. Arquitectura de la Tubería Paranoica CDR (Desarme y Reconstrucción) `(RF-04, RF-05, RF-06, D-08, D-09, D-10, D-11)`

La tubería de procesamiento de archivos sanitiza rigurosamente cualquier imagen entrante para anular vectores de ataque basados en políglotas, ejecución remota de código, inyección de scripts embebidos en metadatos y ataques de denegación de servicio por consumo de memoria (Pixel Flood).

```mermaid
flowchart TD
    Req[Petición POST /api/uploads/product-image] --> RateLimit{Rate Limit <= 10 req/15min}
    RateLimit -- Superado --> E429[429 Too Many Requests]
    RateLimit -- OK --> Multer[Fase 1: Multer memoryStorage <= 5 MB]
    
    Multer -- Excede 5 MB o sin archivo --> E400[400 Bad Request]
    Multer -- Buffer en RAM --> ExtCheck{Fase 2: Extensión en whitelist}
    
    ExtCheck -- Inválida --> E400
    ExtCheck -- Válida --> MagicBytes{Fase 3: file-type Magic Bytes}
    
    MagicBytes -- MIME Mismatch o Corrupto --> E400
    MagicBytes -- Coincide JPEG/PNG/WebP --> DecompBomb{Fase 4a: sharp.metadata width/height <= 4096 px}
    
    DecompBomb -- Dimensiones > 4096 px --> E400Bomb[400 Bad Request: Pixel Flood detectado]
    DecompBomb -- Dimensiones Seguras --> SharpRebuild[Fase 4b: Sharp Reconstrucción: resize max 1080x1080, quality 80 WebP, strip EXIF]
    
    SharpRebuild --> UUIDName[Fase 5: Generar crypto.randomUUID + .webp]
    UUIDName --> WriteDisk[Guardar en server/uploads/uuid.webp]
    WriteDisk --> Res201[Retornar 201 Created: imageUrl: /uploads/uuid.webp]
```

### 3.1 Pseudocódigo de Procesamiento de la Tubería CDR (`server/src/services/cdr.service.ts`)

```typescript
import sharp from "sharp";
import { fromBuffer } from "file-type";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs/promises";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_DIMENSION_PX = 4096; // Protección contra Bomba de Descompresión (D-08)
const TARGET_MAX_WIDTH = 1080;
const TARGET_MAX_HEIGHT = 1080;
const WEBP_QUALITY = 80;

export async function processImageUpload(fileBuffer: Buffer, uploadsDir: string): Promise<string> {
  // 1. Verificación de Magic Bytes con file-type (CA-04.5)
  const detectedType = await fromBuffer(fileBuffer);
  if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType.mime)) {
    throw new ValidationError("El archivo no corresponde a una imagen válida (JPEG, PNG, WebP)");
  }

  // 2. Pre-inspección de metadatos para mitigar Bomba de Descompresión (CA-04.6, D-08)
  const imageInstance = sharp(fileBuffer);
  const metadata = await imageInstance.metadata();

  if (!metadata.width || !metadata.height) {
    throw new ValidationError("No se pudieron determinar las dimensiones del archivo");
  }

  if (metadata.width > MAX_DIMENSION_PX || metadata.height > MAX_DIMENSION_PX) {
    throw new ValidationError(`Dimensiones de imagen excesivas (${metadata.width}x${metadata.height}). Límite: ${MAX_DIMENSION_PX}px`);
  }

  // 3. Desarme y Reconstrucción: Resize acotado + eliminación total de EXIF + WebP (CA-05.1, CA-05.2, D-09)
  const sanitizedBuffer = await imageInstance
    .resize({
      width: TARGET_MAX_WIDTH,
      height: TARGET_MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  // 4. Renombramiento opaco con UUID criptográfico (CA-05.3)
  const fileUuid = crypto.randomUUID();
  const safeFilename = `${fileUuid}.webp`;
  const absoluteDestination = path.join(uploadsDir, safeFilename);

  // 5. Persistencia física en disco
  await fs.writeFile(absoluteDestination, sanitizedBuffer);

  return `/uploads/${safeFilename}`;
}
```

### 3.2 Manejo de Limpieza Física Segura (`fs.unlink`) `(RF-06, D-10)`

```typescript
export async function safelyDeleteImage(imageUrl: string, uploadsDir: string): Promise<void> {
  // Mitigación estricta de Path Traversal (D-10): extraer solo el nombre de archivo seguro
  const basename = path.basename(imageUrl);
  if (!basename.endsWith(".webp")) {
    return; // Ignora rutas mock de fallback u orígenes externos
  }

  const absoluteFilePath = path.join(uploadsDir, basename);

  try {
    await fs.unlink(absoluteFilePath);
  } catch (error: any) {
    // Aislamiento de error EBUSY en Windows o archivo ya inexistente (CA-06.4, D-10)
    console.warn(`[FileStorage Warning] No se pudo eliminar físicamente el archivo ${basename}: ${error.message}`);
    // No relanza la excepción: la transacción de base de datos ya tuvo éxito y manda la lógica de negocio
  }
}
```

---

## 4. Mapeo de Endpoints REST, Esquemas Zod y Cobertura de Requisitos

Alineado con `constitution.md` §2, `AGENTS.MD` §3 y `specs/004-admin-panel/plan.md` §4:

| Método | Ruta | Esquema Zod de Validación | Seguridad / Middleware | RF Cubierto | Descripción / Payload |
|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | `loginSchema.strict()` | Rate Limit (5 req/15m), Anti-CSRF | `RF-01` | Autentica con Argon2id y emite cookie `HttpOnly` con JWT (8h). |
| `POST` | `/api/auth/logout` | Ninguno | Anti-CSRF | `RF-02` | Destruye cookie `session` (`Max-Age=0`). |
| `GET` | `/api/auth/me` | Ninguno | `requireAuth` (Cookie JWT) | `RF-03` | Sesión silenciosa: rehidrata `{ id, email, role }` al montar/F5. |
| `POST` | `/api/uploads/product-image` | `imageUploadSchema` (Filtro Multer) | `requireAuth`, Rate Limit (10 req/15m) | `RF-04, RF-05` | Tubería CDR completa, devuelve `{ imageUrl: "/uploads/<uuid>.webp" }`. |
| `GET` | `/api/products` | `productQuerySchema` (opcional) | Público | `RF-07` | Lista catálogo plano con `categoryIds: string[]` normalizado por DTO. |
| `POST` | `/api/products` | `productCreateSchema.strict()` | `requireAuth`, Anti-CSRF | `RF-07` | Inserta Producto y vincula filas en `ProductCategory` en transacción. |
| `PUT` | `/api/products/:id` | `uuidParamSchema`, `productUpdateSchema.strict()` | `requireAuth`, Anti-CSRF | `RF-07` | Actualiza producto y sincroniza `ProductCategory`. Purgado seguro de imagen previa. |
| `PATCH` | `/api/products/:id/visibility` | `uuidParamSchema`, `visibilityPatchSchema.strict()` | `requireAuth`, Anti-CSRF | `RF-07` | Alterna visibilidad recibiendo body explícito `{ visible: boolean }`. |
| `DELETE` | `/api/products/:id` | `uuidParamSchema` | `requireAuth`, Anti-CSRF | `RF-07` | Elimina producto en DB (cascade en `ProductCategory`) y purga `.webp`. |
| `GET` | `/api/categories` | Ninguno | Público | `RF-08` | Lista categorías ordenadas con `id`, `name`, `parentId`. |
| `POST` | `/api/categories` | `categoryFormSchema.strict()` | `requireAuth`, Anti-CSRF | `RF-08` | Crea categoría verificando unicidad global CI y límite de 1 nivel. |
| `PUT` | `/api/categories/:id` | `uuidParamSchema`, `categoryFormSchema.strict()` | `requireAuth`, Anti-CSRF | `RF-08` | Actualiza categoría previniendo auto-asignación y ciclos jerárquicos. |
| `DELETE` | `/api/categories/:id` | `uuidParamSchema` | `requireAuth`, Anti-CSRF | `RF-08` | Elimina categoría. Retorna `409 Conflict` si tiene productos o hijas (`Restrict`). |
| `GET` | `/api/brands` | Ninguno | Público | `RF-09` | Lista marcas ordenadas alfabéticamente. |
| `POST` | `/api/brands` | `brandFormSchema.strict()` | `requireAuth`, Anti-CSRF | `RF-09` | Crea marca con validación de unicidad insensible a mayúsculas. |
| `PUT` | `/api/brands/:id` | `uuidParamSchema`, `brandFormSchema.strict()` | `requireAuth`, Anti-CSRF | `RF-09` | Edita nombre de marca con unicidad CI. |
| `DELETE` | `/api/brands/:id` | `uuidParamSchema` | `requireAuth`, Anti-CSRF | `RF-09` | Elimina marca. Retorna `409 Conflict` si tiene productos vinculados (`Restrict`). |
| `GET` | `/api/admin/metrics` | Ninguno | `requireAuth` | `RF-10` | Agregaciones de catálogo: totales, visibles, ocultos, categorías y marcas. |

---

## 5. Decisiones Técnicas Justificadas (Trade-Offs y Alternativas)

### 5.1 Tabla Pivote Explícita (`ProductCategory`) vs. Relación Implícita de Prisma `(D-03, RF-07, RF-08)`
* **Decisión Adoptada:** Modelar una entidad explícita `model ProductCategory { productId, categoryId, @@id(...) }`.
* **Alternativa Descartada:** Uso de la relación M:N implícita de Prisma (`categories Category[]`).
* **Justificación del Descarte:** La relación implícita de Prisma autogenera una tabla oculta en PostgreSQL y aplica forzosamente `onDelete: Cascade` en ambas direcciones. Esto significa que si un administrador ejecutase la eliminación de una categoría, PostgreSQL desvincularía silenciosamente todos los productos asociados sin emitir error, vulnerando el requisito Zero-Trust de que la base de datos sea la última línea defensiva (`onDelete: Restrict`). La tabla explícita permite definir `onDelete: Restrict` en la relación hacia `Category` y `onDelete: Cascade` únicamente desde `Product`.

### 5.2 Algoritmo de Hashing: Argon2id vs. Bcrypt / SHA-256 `(D-08, RF-01, RF-11)`
* **Decisión Adoptada:** Implementación exclusiva de `argon2` variante Argon2id (configuración recomendada OWASP: 64 MB RAM, 3 iteraciones, 1 hilo).
* **Alternativa Descartada:** Uso de `bcrypt` o algoritmos de digest rápido.
* **Justificación del Descarte:** Bcrypt es vulnerable a ataques acelerados mediante matrices de GPUs masivas y hardware ASIC dedicado debido a su bajo requerimiento de memoria. Argon2id es el ganador del Password Hashing Competition (PHC) y está especificado de manera innegociable en `AGENTS.MD` §2 por su resistencia combinada a ataques por canal lateral (*side-channel*) y fuerza bruta masiva paralela en memoria.

### 5.3 Almacenamiento Local con Tubería CDR vs. Cloud Object Storage (AWS S3 / Cloudinary) `(D-05, D-09, D-12, RF-05)`
* **Decisión Adoptada:** Almacenamiento local en disco en el contenedor (`server/uploads/`) protegido mediante reconstrucción obligatoria Sharp a `.webp`.
* **Alternativa Descartada:** Subida directa a buckets de AWS S3 o servicios SaaS como Cloudinary.
* **Justificación del Descarte:** Para el alcance del MVP del taller, la integración con S3 añade dependencias de red externas, credenciales de nube adicionales (AWS IAM) y costos fijos innecesarios. Al mismo tiempo, las subidas directas a servicios externos suelen tentar al desarrollador a omitir la sanitización local de archivos (Magic Bytes y stripping EXIF). El almacenamiento local con Sharp garantiza control 100% soberano del archivo y cumplimiento de la Constitución §3 sin costo operativo adicional.

### 5.4 Formato de Errores: Híbrido (400 Legibles / 500 Opacos) vs. Opacidad Total `(D-07, RF-01, RF-07)`
* **Decisión Adoptada:** Devolver `{ error: string, details: [...] }` para errores de validación de cliente (400, 401, 409) y `{ error: "Error interno del servidor", referencia: "<uuid>" }` para colapsos 500.
* **Alternativa Descartada:** Devolver únicamente `{ error: "Referencia: <uuid>" }` en todos los códigos HTTP.
* **Justificación del Descarte:** Si el frontend recibe solo un UUID ante un campo de formulario inválido, la experiencia de usuario (UX) queda completamente destruida (el usuario no sabe qué campo corregir). Reservar la opacidad absoluta para los errores 500 protege los secretos del servidor y la base de datos (evitando fuga de stack traces o consultas Prisma) mientras mantiene la usabilidad del panel.

---

## 6. Estrategia de Verificación y Tests Automatizados

La suite de pruebas del servidor se ejecutará con **Vitest** y **Supertest** contra una base de datos PostgreSQL real (el contenedor de Docker `laboratorio_diesel_db` o base de datos de test dedicada), garantizando fidelidad relacional total:

### 6.1 Aislamiento de Pruebas y Limpieza (`server/tests/helpers/reset-db.ts`)
* Antes de cada batería de tests (`beforeEach`), un script de reseteo ejecutará un truncado en cascada rápido de las tablas:
  ```sql
  TRUNCATE TABLE "product_categories", "products", "categories", "brands", "admin_users" CASCADE;
  ```
* Se inyectará el usuario administrador semilla para los tests que requieran sesión activa.

### 6.2 Casos de Prueba Críticos

1. **Autenticación y Sesión (`server/tests/auth.test.ts`):**
   - Intento de login con credenciales erróneas -> Retorna `401 Unauthorized`.
   - Login con credenciales válidas -> Retorna `200 OK` y emite cookie con atributos `HttpOnly; SameSite=Strict`.
   - Consulta a `GET /api/auth/me` con cookie válida -> Retorna `200 OK` con `{ id, email, role: 'admin' }`.
   - Consulta a `GET /api/auth/me` sin cookie o expirada -> Retorna `401 Unauthorized`.
   - Invocación a `POST /api/auth/logout` -> Retorna cookie vacía con `Max-Age=0`.

2. **Tubería Paranoica CDR (`server/tests/cdr-upload.test.ts`):**
   - Subida de archivo que excede 5 MB -> Rechazado con `400 Bad Request` antes de procesar con Sharp.
   - Subida de archivo malicioso camuflado (extensión `.jpg` pero contenido ejecutable/texto) -> Rechazado en Fase de Magic Bytes con `400 Bad Request`.
   - Subida de imagen con dimensiones $5000 \times 5000$ píxeles -> Rechazado por mitigación de Bomba de Descompresión con `400 Bad Request`.
   - Subida de JPEG válido con metadatos EXIF -> Genera archivo `.webp` en disco, redimensionado a $\le 1080 \times 1080$, con EXIF completamente purgado y nombre UUIDv4.

3. **Integridad Referencial y Regla `onDelete: Restrict` (`server/tests/referential-integrity.test.ts`):**
   - Intentar `DELETE /api/categories/:id` cuando la categoría tiene productos en `ProductCategory` -> PostgreSQL bloquea la operación y la API retorna `409 Conflict`.
   - Intentar `DELETE /api/categories/:id` cuando la categoría es padre de una subcategoría -> PostgreSQL bloquea la operación y la API retorna `409 Conflict`.
   - Intentar `DELETE /api/brands/:id` cuando la marca tiene productos -> Retorna `409 Conflict`.
   - Eliminar un `Product` -> Se elimina el producto, se eliminan sus filas en `ProductCategory` y se ejecuta la desvinculación física del archivo `.webp` en disco.

4. **Prevención contra Inyecciones y Fail-Fast (`server/tests/catalog-crud.test.ts`):**
   - Envío de payload a `POST /api/products` con propiedad no declarada `{ bypassAdmin: true }` -> Zod `.strict()` lo rechaza inmediatamente con `400 Bad Request`.
   - Envío de precio negativo -> Rechazado con `400 Bad Request`.

---

## 7. Plan de Sincronización de Variables de Entorno (`.env.example`)

Para resolver la brecha identificada en la auditoría de AppSec, durante la ejecución de las tareas de esta fase se actualizará el archivo `.env.example` en la raíz del proyecto para documentar formalmente todas las variables requeridas por el servidor:

```env
# ==========================================
# 1. Base de Datos (PostgreSQL - Docker)
# ==========================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=laboratorio_diesel
POSTGRES_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/laboratorio_diesel?schema=public"

# ==========================================
# 2. Servidor Backend (Express)
# ==========================================
PORT=3001
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=cambiar_este_secreto_super_seguro_de_al_menos_32_caracteres_en_produccion

# Credenciales de aprovisionamiento inicial (Seed)
ADMIN_INITIAL_EMAIL=admin@laboratoriodiesel.com
ADMIN_INITIAL_PASSWORD=admin123

# ==========================================
# 3. Frontend / API Client (Vite)
# ==========================================
VITE_API_URL=http://localhost:3001
VITE_CONTACT_WHATSAPP=5492657659108
```

---

*Fin del plan técnico de arquitectura e implementación.*
