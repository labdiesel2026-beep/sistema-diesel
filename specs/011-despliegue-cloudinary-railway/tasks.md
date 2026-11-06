# Tareas de Implementación — Fase 11: Despliegue en Producción (Cloudinary, Neon.tech & Railway)

**Fase:** 011-despliegue-cloudinary-railway  
**Versión:** 1.0  
**Fecha:** 2026-11-06  
**Basado en:** [specs/011-despliegue-cloudinary-railway/spec.md](file:///f:/INGENIERIA\GEPI\InyectoresDiesel\specs\011-despliegue-cloudinary-railway\spec.md), [specs/011-despliegue-cloudinary-railway/plan.md](file:///f:/INGENIERIA\GEPI\InyectoresDiesel\specs\011-despliegue-cloudinary-railway\plan.md)  
**Estado:** Tareas Planificadas para Ejecución  

---

## Bloque 1: Dependencias y Validación de Variables de Entorno

- [x] **Tarea 1.1: Instalar SDK de Cloudinary y validar variables de entorno**
  - **Archivos:** `server/package.json`, `server/src/config/env.ts`, `.env.example`, `server/.env`
  - **Descripción:** Instalar la dependencia oficial `cloudinary` en `/server`. Modificar `envSchema` en `server/src/config/env.ts` para incorporar `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` con `z.string().min(1)` dentro del esquema `.strict()`, asegurando que estén presentes en la lista `knownKeys`. Documentar las variables en `.env.example` y proporcionar valores por defecto de desarrollo en `server/.env` y `.env` para no romper la ejecución local.
  - **Cobertura:** RF-05, RNF-01, Regla 3 de AGENTS.md (Crash early)
  - **Hecho cuando:** `npm --prefix server run test -- tests/app-base.test.ts` pase exitosamente y el objeto `ENV` contenga las claves de Cloudinary validadas.

---

## Bloque 2: Servicio de Almacenamiento y Limpieza Física Resiliente

- [x] **Tarea 2.1: Implementar carga por Stream a Cloudinary y extracción de public_id en `file-storage.service.ts`**
  - **Archivos:** `server/src/services/file-storage.service.ts`, `server/tests/file-storage-service.test.ts`
  - **Descripción:** Configurar la instancia `v2` de Cloudinary con las credenciales de `ENV`. Implementar `uploadStreamToCloudinary(buffer, folder)` que devuelva la `secure_url`. Implementar `extractCloudinaryPublicId(url)`. Refactorizar `deleteFile` (y `safelyDeleteImage`) para que detecte si la URL es de Cloudinary y ejecute `cloudinary.uploader.destroy()`, manteniendo la compatibilidad hacia atrás con archivos locales `/uploads/*.webp` y descartando placeholders.
  - **Cobertura:** RF-01, RF-04, RNF-02, RNF-03
  - **Hecho cuando:** Pruebas unitarias en `file-storage-service.test.ts` verifiquen la subida por stream (con mock de Cloudinary uploader), la extracción correcta del public_id y la eliminación segura sin excepciones.

---

## Bloque 3: Tubería CDR y Controlador de Upload

- [x] **Tarea 3.1: Conectar la tubería CDR en memoria con Cloudinary en `cdr.service.ts` y `upload.controller.ts`**
  - **Archivos:** `server/src/services/cdr.service.ts`, `server/src/controllers/upload.controller.ts`, `server/tests/cdr-service.test.ts`
  - **Descripción:** Modificar `processImageUpload` en `cdr.service.ts` para que, tras el proceso de desinfección y reconstrucción con `sharp` a WebP, delegue la persistencia al nuevo método de almacenamiento en Cloudinary y retorne la `secure_url` generada. Asegurar que `upload.controller.ts` responda el JSON `{ imageUrl: secureUrl }`.
  - **Cobertura:** RF-01, RF-02, RF-03
  - **Hecho cuando:** `npm --prefix server test -- tests/cdr-service.test.ts` y las pruebas de upload validen que se devuelve la URL devuelta por el servicio de almacenamiento.

---

## Bloque 4: Integración en Catálogo y Purga de Imágenes en Productos

- [x] **Tarea 4.1: Asegurar resiliencia en `product.service.ts` y `product.controller.ts` ante URLs de Cloudinary**
  - **Archivos:** `server/src/services/product.service.ts`, `server/src/controllers/product.controller.ts`
  - **Descripción:** Verificar que los métodos `updateProduct` y `deleteProduct` sigan notificando las URLs anteriores/eliminadas y que las llamadas a `deleteFile` operen de manera segura ante URLs absolutas de Cloudinary (`https://res.cloudinary.com/...`), sin lanzar errores ni abortar transacciones si la imagen no existe en el CDN.
  - **Cobertura:** RF-03, RF-04, RNF-03
  - **Hecho cuando:** Las funciones manejen URLs de Cloudinary sin excepciones no capturadas y los tipos de TypeScript compilen limpiamente.

---

## Bloque 5: Scripts de Producción y Configuración de Red para Railway

- [x] **Tarea 5.1: Configurar scripts en `server/package.json` y vincular Express a `0.0.0.0` en `server/src/index.ts`**
  - **Archivos:** `server/package.json`, `server/src/index.ts`
  - **Descripción:** Actualizar `"build": "prisma generate && tsc"` y `"start": "prisma migrate deploy && node dist/index.js"`. Modificar `server/src/index.ts` para que `app.listen(PORT, "0.0.0.0", ...)` vincule explícitamente el servidor al host `0.0.0.0` usando el `PORT` inyectado por Railway.
  - **Cobertura:** RF-06, RNF-01
  - **Hecho cuando:** `npm --prefix server run build` compile sin errores y el servidor esté preparado para el ciclo de vida de Railway.
