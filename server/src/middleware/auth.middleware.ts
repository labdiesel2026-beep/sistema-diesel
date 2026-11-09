import type { Request, Response, NextFunction, RequestHandler } from "express";
import { authService, type AuthTokenPayload, AUTH_COOKIE_NAME } from "../services/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/**
 * Middleware de Verificación de Sesión (requireAuth).
 * (RF-01, RF-03, 4.1)
 *
 * Extrae el JWT de la cookie HttpOnly de sesión, comprueba su validez criptográfica
 * y vigencia con AuthService, y adjunta el usuario autenticado a `req.user`.
 * Si la cookie falta, es inválida o expiró, responde inmediatamente 401 Unauthorized.
 */
export const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let token = req.cookies?.[AUTH_COOKIE_NAME];

  // Soporte dual: cookie HttpOnly (prioritaria) o cabecera Authorization: Bearer <token>
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7).trim();
  }

  if (!token || typeof token !== "string") {
    res.status(401).json({
      error: "Sesión no válida o expirada",
    });
    return;
  }

  try {
    const user = authService.verifyToken(token);
    req.user = user;
    next();
  } catch {
    res.status(401).json({
      error: "Sesión no válida o expirada",
    });
  }
};

export default requireAuth;
