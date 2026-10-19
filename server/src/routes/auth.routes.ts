import { Router } from "express";
import { login, logout, me } from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/rate-limit.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schemas.js";

const router = Router();

/**
 * Rutas de Autenticación de Administradores (/api/auth)
 * (RF-01, RF-02, RF-03, 4.1, 4.3, 4.4)
 */

// Iniciar sesión (Login con Rate Limit, Anti-CSRF y Zod)
router.post(
  "/login",
  authRateLimiter,
  csrfProtection,
  validate(loginSchema),
  login
);

// Cerrar sesión (Logout con Anti-CSRF y destrucción de cookie)
router.post(
  "/logout",
  csrfProtection,
  logout
);

// Sesión silenciosa / Perfil actual (Rehidratación protegida por cookie HttpOnly)
router.get(
  "/me",
  requireAuth,
  me
);

export default router;
