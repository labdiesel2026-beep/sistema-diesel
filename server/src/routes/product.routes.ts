import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductVisibility,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { uuidParamSchema } from "../schemas/common.schemas.js";
import {
  productFormSchema,
  productQuerySchema,
  visibilityPatchSchema,
} from "../schemas/product.schemas.js";

const router = Router();

/**
 * Rutas de Catálogo de Productos (/api/products)
 * (RF-07, D-05, D-06, D-10)
 */

// Listado público de productos con serialización DTO (categoryIds: string[])
router.get("/", validate({ query: productQuerySchema }), getProducts);

// Detalle público de producto individual
router.get("/:id", validate({ params: uuidParamSchema }), getProductById);

// Alta de producto (Autenticado, Anti-CSRF, Zod .strict(), Transacción Prisma)
router.post("/", requireAuth, csrfProtection, validate(productFormSchema), createProduct);

// Edición de producto (Autenticado, Anti-CSRF, Zod .strict(), Purgado de imagen previa)
router.put(
  "/:id",
  requireAuth,
  csrfProtection,
  validate({ params: uuidParamSchema, body: productFormSchema }),
  updateProduct,
);

// Alternar visibilidad de producto (Autenticado, Anti-CSRF, Zod .strict())
router.patch(
  "/:id/visibility",
  requireAuth,
  csrfProtection,
  validate({ params: uuidParamSchema, body: visibilityPatchSchema }),
  updateProductVisibility,
);

// Eliminación de producto (Autenticado, Anti-CSRF, Cascada BD y purga física de archivo)
router.delete(
  "/:id",
  requireAuth,
  csrfProtection,
  validate({ params: uuidParamSchema }),
  deleteProduct,
);

export default router;
