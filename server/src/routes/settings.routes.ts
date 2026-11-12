import { Router } from "express";
import { getPublicSettings, updateWhatsApp } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateWhatsAppSchema } from "../schemas/settings.schemas.js";

const router = Router();

/**
 * Rutas de Configuración del Sistema (/api/settings)
 */

// Consulta pública de configuración (número de WhatsApp de contacto)
router.get("/public", getPublicSettings);

// Actualización protegida del número de WhatsApp (requireAuth + anti-CSRF)
router.put(
  "/whatsapp",
  requireAuth,
  csrfProtection,
  validate(updateWhatsAppSchema),
  updateWhatsApp,
);
router.post(
  "/whatsapp",
  requireAuth,
  csrfProtection,
  validate(updateWhatsAppSchema),
  updateWhatsApp,
);

export default router;

