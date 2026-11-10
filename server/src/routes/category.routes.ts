import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { categoryFormSchema, uuidParamSchema } from "../schemas/category.schemas.js";

const router = Router();

const publicCache = (_req: any, res: any, next: any) => {
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  next();
};

/**
 * Rutas CRUD para Categorías y Subcategorías (/api/categories)
 * (RF-08, D-04)
 */

// Listar categorías con jerarquía (Público)
router.get("/", publicCache, getCategories);

// Obtener categoría por ID (Público)
router.get("/:id", publicCache, validate({ params: uuidParamSchema }), getCategoryById);

// Crear categoría (Autenticado, Anti-CSRF, Zod .strict(), validación de 1 nivel)
router.post("/", requireAuth, csrfProtection, validate(categoryFormSchema), createCategory);

// Actualizar categoría (Autenticado, Anti-CSRF, Zod .strict(), prevención de ciclos)
router.put(
  "/:id",
  requireAuth,
  csrfProtection,
  validate({ params: uuidParamSchema, body: categoryFormSchema }),
  updateCategory,
);

// Eliminar categoría (Autenticado, Anti-CSRF, bloqueo por subcategorías o productos vinculados)
router.delete(
  "/:id",
  requireAuth,
  csrfProtection,
  validate({ params: uuidParamSchema }),
  deleteCategory,
);

export default router;
