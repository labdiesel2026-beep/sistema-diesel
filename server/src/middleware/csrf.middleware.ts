import type { Request, Response, NextFunction, RequestHandler } from "express";

const MUTABLE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Middleware Defensivo Anti-CSRF.
 * (RF-01, 4.3)
 *
 * En peticiones con métodos mutables (POST, PUT, PATCH, DELETE), exige la presencia
 * exacta de la cabecera `X-Requested-With: XMLHttpRequest`.
 * Si el encabezado está ausente o no coincide, responde inmediatamente 403 Forbidden.
 */
export const csrfProtection: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!MUTABLE_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  const csrfHeader = req.header("X-Requested-With");

  if (!csrfHeader || csrfHeader.trim() !== "XMLHttpRequest") {
    res.status(403).json({
      error: "Petición rechazada: encabezado anti-CSRF ausente",
    });
    return;
  }

  next();
};

export default csrfProtection;
