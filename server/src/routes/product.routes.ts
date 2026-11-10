import { Router } from "express";
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  updateProductVisibility,
  updateProductFeatured,
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
  featuredPatchSchema,
} from "../schemas/product.schemas.js";

const router = Router();

const publicCache = (_req: any, res: any, next: any) => {
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  next();
};

/**
 * Rutas de Catálogo de Productos (/api/products)
 * (RF-07, D-05, D-06, D-10, Fase 6 RF-01, RF-06, RF-07)
 */

// Listado público de productos con serialización DTO (categoryIds: string[])
router.get("/", publicCache, validate({ query: productQuerySchema }), getProducts);

// Listado público de productos destacados activos para el carrusel de Landing (RF-06, RF-07)
// IMPORTANTE: Definido antes de /:id para evitar colisión de enrutamiento
router.get("/featured", publicCache, getFeaturedProducts);

// Detalle público de producto individual
router.get("/:id", publicCache, validate({ params: uuidParamSchema }), getProductById);

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

// Alternar estado destacado de producto (Autenticado, Anti-CSRF, Zod .strict(), Límite 10, RF-01, RF-03)
router.patch(
  "/:id/featured",
  requireAuth,
  csrfProtection,
  validate({ params: uuidParamSchema, body: featuredPatchSchema }),
  updateProductFeatured,
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
