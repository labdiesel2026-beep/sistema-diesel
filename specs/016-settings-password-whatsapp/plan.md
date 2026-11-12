# Plan de Implementación: Gestión Dinámica de Contraseña y WhatsApp en Admin Panel

**Fase:** 16 — Entrega Final  
**Documento:** `specs/016-settings-password-whatsapp/plan.md`  
**Estado:** Aprobado  

---

## 1. Arquitectura de Componentes y Flujo de Datos

```
[Administrador en /admin]
        |
        v
[AdminHeader] ---> [AdminSettingsModal]
                         |
           +-------------+-------------+
           |                           |
  (Tab WhatsApp)              (Tab Password)
           |                           |
           v                           v
PUT /api/settings/whatsapp    PUT /api/auth/change-password
           |                           |
   [settings.service]          [auth.controller]
           |                           |
           v                           v
  system_settings (PostgreSQL)  admin_users (Argon2id)
           ^
           |
  GET /api/settings/public
           |
           v
  [SiteSettingsProvider]
           |
           +---> CartDrawer (generateCartWhatsAppUrl)
           +---> ProductCard (generateDirectProductWhatsAppUrl)
           +---> ProductDetailModal (direct link)
           +---> FloatingWhatsApp (buildWhatsAppUrl)
           +---> ContactForm (buildWhatsAppUrl)
           +---> MobileStickyBar (buildWhatsAppUrl)
           +---> WarrantySection (buildWhatsAppUrl)
```

---

## 2. Estrategia de Migración y Resiliencia en PostgreSQL
1. No se ejecutarán comandos destructivos ni `prisma migrate reset`.
2. Se implementa `settings.service.ts` con inicialización garantizada `CREATE TABLE IF NOT EXISTS system_settings` mediante query parametrizada y upsert con `ON CONFLICT (key) DO UPDATE`.
3. Adicionalmente, el servicio de settings cuenta con caché en memoria con TTL corto (ej. 60s) o invalidación reactiva al actualizar, aliviando la carga sobre la base de datos Neon.

---

## 3. Plan de Pruebas y Validación Continua
1. **Tests Backend (Vitest):**
   - Validar `changePasswordSchema` y `updateWhatsAppSchema`.
   - Probar endpoint `change-password` ante contraseña actual inválida y ante contraseña válida (Argon2id).
   - Probar endpoints `GET /api/settings/public` y `PUT /api/settings/whatsapp`.
2. **Tests Frontend (Vitest):**
   - Probar `SiteSettingsContext` y renderizado con fallback inmediato.
   - Probar `AdminSettingsModal` (apertura, validación de contraseñas, edición de número).
   - Confirmar que los componentes de la Landing y Catálogo sigan pasando todas sus pruebas unitarias.
3. **Compilación:**
   - `npm test` en frontend y backend.
   - `npm run build` sin errores.

