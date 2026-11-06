# Especificación — Fase 11: Despliegue en Producción (Cloudinary, Neon.tech & Railway)

**Fase:** 011-despliegue-cloudinary-railway  
**Versión:** 1.0 (AppSec & Production Architecture)  
**Fecha:** 2026-11-06  
**Basado en:** [AGENTS.md](file:///f:/INGENIERIA\GEPI\InyectoresDiesel\AGENTS.md), Specs 005-backend y 006-carrusel-destacados  
**Estado:** Especificación Aprobada para Ejecución  

---

## 1. Contexto y Objetivos

### 1.1 Contexto
El sistema actual procesa imágenes de productos en memoria a través de una tubería de Desarme y Reconstrucción de Contenido (CDR con `sharp`) y persiste el resultado en el sistema de archivos local (`server/uploads/`).  
Al preparar la infraestructura para producción con el frontend desplegado en **Vercel** y el backend en contenedores efímeros de **Railway** (con base de datos gestionada PostgreSQL en **Neon.tech**), el almacenamiento en disco local deja de ser viable, ya que cualquier reinicio, despliegue o escalado del contenedor en Railway purga el sistema de archivos efímero, perdiendo las imágenes subidas por los administradores.

### 1.2 Objetivos
1. **Persistencia en la Nube con Cloudinary (v2):** Modificar la tubería de almacenamiento para que, tras la sanitización en memoria con `sharp`, el buffer WebP resultante sea transmitido directamente a Cloudinary mediante streams (`Readable.from(buffer).pipe(upload_stream)`).
2. **URLs Absolutas Seguras:** Retornar y persistir la `secure_url` (HTTPS) de Cloudinary en la columna `imageUrl` del modelo relacional `Product` en PostgreSQL (Neon.tech).
3. **Purga Resiliente de Activos:** Proveer un mecanismo desacoplado para eliminar imágenes de Cloudinary al actualizar o eliminar un producto, tolerando URLs legacy locales (`/uploads/<uuid>.webp`), placeholders (`/product-placeholder.png`) y URLs externas sin interrumpir transacciones de base de datos ni propagar errores de red al cliente.
4. **Validación Fail-Fast de Entorno:** Integrar `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` en el esquema Zod `.strict()` de `server/src/config/env.ts` y documentarlas en `.env.example`.
5. **Preparación de Scripts de Producción:** Configurar los scripts `build` y `start` en `server/package.json` para ejecutar `prisma generate`, `tsc`, `prisma migrate deploy` e iniciar el servidor en el host `0.0.0.0` respetando el puerto inyectado por Railway (`process.env.PORT`).

---

## 2. Requerimientos Funcionales (RF)

- **RF-01: Carga por Stream a Cloudinary:** El servicio de almacenamiento (`file-storage.service.ts`) debe recibir el buffer WebP sanitizado y subirlo a Cloudinary en una carpeta designada (ej. `products`), devolviendo la `secure_url` HTTPS generada por el proveedor.
- **RF-02: Preservación de Tubería CDR en Memoria:** No debe omitirse ninguna fase de seguridad previa a la subida: validación de tamaño en Multer, verificación estricta de Magic Bytes (`file-type`), pre-inspección de dimensiones contra Pixel Flood (máx 4096px) y reconstrucción a WebP con descarte de metadatos EXIF en `sharp`.
- **RF-03: Gestión de URLs en Base de Datos:** La URL devuelta por el endpoint de upload (`POST /api/uploads/product-image`) debe ser la URL absoluta HTTPS de Cloudinary, almacenada directamente en la tabla `products`.
- **RF-04: Eliminación Segura y Resiliente (Polimórfica):** La función `deleteFile` (y su alias `safelyDeleteImage`) debe:
  - Detectar si la URL pertenece a Cloudinary (`res.cloudinary.com`), extraer su `public_id` y llamar a `cloudinary.uploader.destroy(publicId)`.
  - Si es una ruta local relativa (`/uploads/<uuid>.webp`), conservar la eliminación física en disco para compatibilidad histórica en desarrollo.
  - Si es un placeholder del frontend o recurso externo genérico, abortar silenciosamente sin error.
  - Envolver cualquier fallo I/O o de red en bloques protegidos registrando advertencias (`console.warn`) sin lanzar excepciones (Zero Crash).
- **RF-05: Validación Inmutable de Entorno:** La aplicación debe aplicar *Crash Early* si faltan `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` o `CLOUDINARY_API_SECRET`.
- **RF-06: Escucha en `0.0.0.0` y Migraciones Automáticas:** El proceso Node.js debe escuchar explícitamente en `0.0.0.0:${PORT}` y ejecutar migraciones pendientes (`prisma migrate deploy`) al arrancar el contenedor en Railway.

---

## 3. Requerimientos No Funcionales (RNF) y Seguridad

- **RNF-01 (Zero Trust en Red y Subidas):** Los archivos nunca deben almacenarse sin procesar ni siquiera de forma temporal en disco. El stream se alimenta directamente desde el buffer sanitizado en RAM.
- **RNF-02 (Mitigación SSRF / Inyección en SDK):** El `public_id` o identificador de Cloudinary debe extraerse y validarse de forma segura antes de solicitar su destrucción a la API.
- **RNF-03 (Tolerancia a Fallos I/O):** La eliminación de imágenes debe ser asíncrona y no transaccional; si Cloudinary no responde o el recurso ya no existe, la mutación del producto en base de datos debe completarse exitosamente.
- **RNF-04 (Compatibilidad Frontend):** El frontend (`src/lib/api.ts` -> `resolveImageUrl`) ya soporta URLs absolutas con prefijo `https://`; no se requieren cambios destructivos en el cliente web.

