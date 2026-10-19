import { Router } from "express";
import { uploadProductImage } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadRateLimiter } from "../middleware/rate-limit.middleware.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";

const router = Router();

/**
 * POST /api/uploads/product-image
 * Protegido por requireAuth y uploadRateLimiter (10 req / 15 min).
 * Recibe multipart/form-data con el campo 'file'.
 * Pasa por la tubería CDR y responde 201 Created con { imageUrl: "/uploads/<uuid>.webp" }.
 */
router.post(
  "/product-image",
  uploadRateLimiter,
  requireAuth,
  uploadSingleImage,
  uploadProductImage
);

export default router;
