# Especificación de Requerimientos: Gestión Dinámica de Contraseña y WhatsApp en Admin Panel

**Fase:** 16 — Entrega Final y Parámetros Operativos Dinámicos  
**Documento:** `specs/016-settings-password-whatsapp/spec.md`  
**Estado:** Aprobado  
**Fecha:** 2026-11-10  
**Arquitecto:** Staff AppSec Engineer & Full-Stack Lead  

---

## 1. Contexto y Objetivos de Negocio
El cliente de Laboratorio Diésel necesita autonomía operativa plena desde el Panel de Administración (`/admin`) para dos operaciones críticas sin depender del equipo técnico ni variables de entorno en Railway:
1. **Cambio de Contraseña de Administrador:** Permitir actualizar de forma segura las credenciales de acceso del usuario administrador desde una interfaz intuitiva.
2. **Configuración Dinámica de WhatsApp:** Permitir actualizar el número telefónico de WhatsApp de ventas y soporte técnico del taller, impactando de forma inmediata en toda la tienda (Landing Page, Catálogo, Carrito, Ficha de Producto, Modales, Footer y Botón Flotante) sin requerir re-despliegues ni migraciones destructivas en Neon PostgreSQL.

---

## 2. Modelo de Amenazas y Directivas Zero-Trust (OWASP / ASVS V5)
1. **Autenticación e Integridad Criptográfica (Argon2id):**
   - El cambio de contraseña exige la verificación obligatoria de la contraseña actual (`currentPassword`) contra el hash almacenado utilizando `argon2.verify()`.
   - La nueva contraseña (`newPassword`) debe tener al menos 8 caracteres y ser hasheada estrictamente con `argon2.hash(..., { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 })`.
2. **Fronteras Inmutables y Validación Estricta (Zod):**
   - Todos los esquemas de entrada (`changePasswordSchema` y `updateWhatsAppSchema`) deben aplicar `.strict()`.
   - El número telefónico de WhatsApp es saneado eliminando caracteres no numéricos y validando longitud de 8 a 20 dígitos.
3. **Protección Anti-CSRF y Autorización JWT:**
   - Todo endpoint de mutación (`/api/auth/change-password`, `/api/settings/whatsapp`) exige la presencia del encabezado `X-Requested-With: XMLHttpRequest` y token JWT válido en cookie HttpOnly o cabecera `Authorization: Bearer`.
4. **Persistencia No Destructiva en Neon PostgreSQL:**
   - Para garantizar cero caídas y compatibilidad retroactiva sin requerir migraciones complejas de Prisma en producción, se utiliza una tabla ligera `system_settings` (`key` TEXT PRIMARY KEY, `value` TEXT NOT NULL, `updated_at` TIMESTAMP) creada con `CREATE TABLE IF NOT EXISTS` y operaciones upsert parametrizadas seguras.

---

## 3. Especificación de Endpoints Backend

### 3.1. `POST /api/auth/change-password` y `PUT /api/auth/change-password`
- **Protección:** `requireAuth`, `csrfProtection`, `validate(changePasswordSchema)`.
- **Payload Entrada:**
  ```json
  {
    "currentPassword": "string (min 1)",
    "newPassword": "string (min 8)"
  }
  ```
- **Flujo:**
  1. Extrae `req.user.id`.
  2. Busca el usuario en PostgreSQL (`prisma.adminUser.findUnique`).
  3. Comprueba `currentPassword` con `authService.verifyPassword(user.passwordHash, currentPassword)`. Si falla, retorna `400 Bad Request` ("La contraseña actual es incorrecta").
  4. Hashea `newPassword` con Argon2id.
  5. Actualiza `passwordHash` en `admin_users`.
  6. Responde `200 OK` con `{ success: true, message: "Contraseña actualizada exitosamente" }`.

### 3.2. `GET /api/settings/public`
- **Protección:** Pública (sin autenticación).
- **Respuesta:**
  ```json
  {
    "whatsappNumber": "5492657659108",
    "whatsappDisplay": "+54 9 2657 659108"
  }
  ```
- **Fallback:** Si la base de datos no tiene la clave `WHATSAPP_NUMBER` o hay error de conexión, responde el valor por defecto `"5492657659108"`.

### 3.3. `PUT /api/settings/whatsapp` y `POST /api/settings/whatsapp`
- **Protección:** `requireAuth`, `csrfProtection`, `validate(updateWhatsAppSchema)`.
- **Payload Entrada:**
  ```json
  {
    "whatsappNumber": "string (ej. +54 9 2657 65-9108 o 5492657659108)"
  }
  ```
- **Flujo:**
  1. Sanitiza el string extrayendo únicamente dígitos (`\D` -> `""`).
  2. Valida longitud (8..20 dígitos).
  3. Ejecuta upsert en la tabla `system_settings` con la clave `'WHATSAPP_NUMBER'`.
  4. Responde `200 OK` con `{ success: true, whatsappNumber: string, message: "Número de WhatsApp actualizado" }`.

---

## 4. Especificación Frontend

### 4.1. Proveedor de Parámetros Dinámicos (`SiteSettingsContext`)
- Ubicación: `src/context/site-settings-context.tsx`.
- Inicialización inmediata con valor en caché de `localStorage` (`labdiesel_whatsapp_number`) o fallback `SITE_CONFIG.phone` ("5492657659108").
- Consulta asíncrona no bloqueante a `GET /api/settings/public`.
- Expone:
  - `whatsappNumber: string`
  - `whatsappDisplay: string`
  - `updateWhatsApp(newNumber: string): Promise<void>`
  - `refreshSettings(): Promise<void>`

### 4.2. Modal de Configuración en Panel de Admin (`AdminSettingsModal.tsx`)
- Accionado desde un botón visible en `AdminHeader.tsx` ("Configuración" con ícono `Settings`).
- Tab / Sección 1: **Número de WhatsApp de Ventas y Consultas**:
  - Input numérico con prefijo internacional.
  - Vista previa en vivo del enlace canonical `https://wa.me/<NUMERO>`.
  - Botón "Guardar WhatsApp" con estado de carga y toast de éxito/error.
- Tab / Sección 2: **Cambiar Contraseña de Administrador**:
  - Input "Contraseña Actual" (password toggle show/hide).
  - Input "Nueva Contraseña" (mínimo 8 caracteres).
  - Input "Confirmar Nueva Contraseña".
  - Validación de coincidencia en cliente antes de enviar.
  - Botón "Actualizar Contraseña" con estado de carga y toast de confirmación.

### 4.3. Propagación en Componentes Públicos y Catálogo
- Reemplazar el uso estático de `SITE_CONFIG.phone` en:
  - `src/components/catalog/CartDrawer.tsx`
  - `src/components/catalog/ProductCard.tsx`
  - `src/components/catalog/ProductDetailModal.tsx`
  - `src/routes/catalogo.$productId.tsx`
  - `src/routes/catalogo.tsx`
  - `src/components/landing/ContactForm.tsx`
  - `src/components/landing/FloatingWhatsApp.tsx`
  - `src/components/landing/MobileStickyBar.tsx`
  - `src/components/landing/WarrantySection.tsx`
  - `src/lib/catalog-whatsapp.ts` (apoyado por `getDynamicWhatsAppNumber()`).

