import { Router } from "express";
import { getMetrics } from "../controllers/metrics.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * GET /api/admin/metrics
 * Métricas agregadas del catálogo para el panel de administración (RF-10, CA-10.1).
 * Protegido con requireAuth (no requiere token CSRF al ser consulta GET idempotente).
 */
router.get("/metrics", requireAuth, getMetrics);
router.get("/", requireAuth, getMetrics);

export default router;
