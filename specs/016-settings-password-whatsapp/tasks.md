# Tareas de Ejecución: Gestión Dinámica de Contraseña y WhatsApp en Admin Panel

**Fase:** 16 — Entrega Final  
**Documento:** `specs/016-settings-password-whatsapp/tasks.md`  

---

### Tareas de Implementación

- [x] **TASK-01: Backend — Esquemas y Endpoint de Cambio de Contraseña (`/api/auth/change-password`)**
  - Actualizar `server/src/schemas/auth.schemas.ts` con `changePasswordSchema` (`currentPassword`, `newPassword`).
  - Implementar método `changePassword` en `server/src/controllers/auth.controller.ts` con verificación `Argon2id` y actualización en Prisma.
  - Registrar rutas `PUT` y `POST` `/change-password` en `server/src/routes/auth.routes.ts` con `requireAuth`, `csrfProtection` y `validate`.
  - Crear tests unitarios en `server/tests/change-password.test.ts`.

- [x] **TASK-02: Backend — Servicio y Endpoints de Configuración de WhatsApp (`/api/settings`)**
  - Crear `server/src/services/settings.service.ts` con tabla no destructiva `system_settings` y operaciones seguras de lectura/escritura con valor por defecto `'5492657659108'`.
  - Crear `server/src/schemas/settings.schemas.ts` con `updateWhatsAppSchema`.
  - Crear `server/src/controllers/settings.controller.ts` con `getPublicSettings` y `updateWhatsApp`.
  - Crear `server/src/routes/settings.routes.ts` y montarlo en `server/src/routes/index.ts`.
  - Crear tests unitarios en `server/tests/settings.test.ts`.

- [x] **TASK-03: Frontend — Contexto y Hook de Configuración (`SiteSettingsContext`)**
  - Crear `src/context/site-settings-context.tsx` con soporte de caché en `localStorage`, consulta a `/api/settings/public` y fallback a `SITE_CONFIG.phone`.
  - Enlazar el contexto global en `src/routes/__root.tsx`.
  - Conectar `setDynamicWhatsAppNumber` en `src/lib/whatsapp-utils.ts` / `src/lib/catalog-whatsapp.ts` para que las llamadas sin paso explícito de teléfono tomen el número dinámico.
  - Escribir tests en `src/test/context/site-settings-context.test.tsx`.

- [x] **TASK-04: Frontend — Modal de Configuración en Admin (`AdminSettingsModal`)**
  - Crear `src/components/admin/settings/AdminSettingsModal.tsx` con tabs para "Número de WhatsApp" y "Cambiar Contraseña".
  - Integrar el botón "Configuración" en `src/components/admin/layout/AdminHeader.tsx`.
  - Escribir tests en `src/test/admin/AdminSettingsModal.test.tsx`.

- [x] **TASK-05: Frontend — Consumo Dinámico de WhatsApp en Componentes y Verificación Final**
  - Conectar `useSiteSettings` en:
    - `src/components/catalog/CartDrawer.tsx`
    - `src/components/catalog/ProductCard.tsx`
    - `src/components/catalog/ProductDetailModal.tsx`
    - `src/routes/catalogo.$productId.tsx`
    - `src/routes/catalogo.tsx`
    - `src/components/landing/ContactForm.tsx`
    - `src/components/landing/FloatingWhatsApp.tsx`
    - `src/components/landing/MobileStickyBar.tsx`
    - `src/components/landing/WarrantySection.tsx`
  - Ejecutar suite completa de tests (`npm test` y backend tests).
  - Ejecutar `npm run build` y confirmar 0 errores.
