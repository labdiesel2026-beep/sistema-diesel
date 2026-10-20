import { Router } from "express";
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { brandFormSchema, uuidParamSchema } from "../schemas/brand.schemas.js";

const router = Router();

/**
 * Rutas CRUD para Marcas (/api/brands)
 * (RF-09, D-04)
 */

// Listar marcas (Público)
router.get("/", getBrands);

// Obtener marca por ID (Público)
router.get("/:id", validate({ params: uuidParamSchema }), getBrandById);

// Crear marca (Autenticado, Anti-CSRF, Zod .strict())
router.post(
  "/",
  requireAuth,
  csrfProtection,
  validate(brandFormSchema),
  createBrand
);

// Actualizar marca (Autenticado, Anti-CSRF, Zod .strict())
router.put(
  "/:id",
  requireAuth,
  csrfProtection,
  validate({ params: uuidParamSchema, body: brandFormSchema }),
  updateBrand
);

// Eliminar marca (Autenticado, Anti-CSRF, captura de restricción referencial onDelete: Restrict)
router.delete(
  "/:id",
  requireAuth,
  csrfProtection,
  validate({ params: uuidParamSchema }),
  deleteBrand
);

export default router;
