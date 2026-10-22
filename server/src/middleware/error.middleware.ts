import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import crypto from "node:crypto";
import { Prisma } from "@prisma/client";

/**
 * Clase estándar para errores operativos predecibles de negocio.
 * (RF-01, 4.5, D-07)
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = "No autorizado"): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message = "Acceso prohibido"): AppError {
    return new AppError(message, 403);
  }

  static notFound(message = "Recurso no encontrado"): AppError {
    return new AppError(message, 404);
  }

  static conflict(message: string, details?: unknown): AppError {
    return new AppError(message, 409, details);
  }
}

/**
 * Middleware global de manejo de excepciones.
 * (Spec 010, Caso Límite 4, Caso Límite 13, Principio 6: Errores Opacos en Producción)
 *
 * - Fallos de autenticación (401) y no controlados (500): devuelven única y taxativamente
 *   `{ "error": "Referencia: <uuid>" }`, confinando trazas técnicas, queries y contextos
 *   a los logs estructurados internos.
 * - Errores Operativos de Validación/Negocio (400, 403, 404, 409): devuelven mensajes y detalles operacionales.
 * - Errores Relacionales Prisma conocidos (P2002, P2003): mapeados a 409 Conflict.
 */
export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Fallos de autenticación (401) - Principio 6: Errores Opacos
  if (
    (err instanceof AppError && err.statusCode === 401) ||
    err?.status === 401 ||
    err?.statusCode === 401
  ) {
    const referenceId = crypto.randomUUID();
    console.error(`🔒 [Fallo de Autenticación 401 - Ref: ${referenceId}]`, {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
      timestamp: new Date().toISOString(),
    });

    res.status(401).json({
      error: `Referencia: ${referenceId}`,
    });
    return;
  }

  // 2. Errores operativos conocidos (400, 403, 404, 409)
  if (err instanceof AppError) {
    const payload: Record<string, unknown> = {
      error: err.message,
    };
    if (err.details !== undefined) {
      payload.details = err.details;
    }
    res.status(err.statusCode).json(payload);
    return;
  }

  // 3. Errores relacionales conocidos de Prisma (Integridad referencial y unicidad)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        error: "Conflicto: Ya existe un registro con este valor único",
      });
      return;
    }
    if (err.code === "P2003" || err.code === "P2014") {
      res.status(409).json({
        error:
          "Conflicto: No se puede eliminar o modificar el recurso debido a restricciones de integridad referencial",
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        error: "Recurso no encontrado",
      });
      return;
    }
  }

  // 4. Error de sintaxis JSON en el cuerpo del request
  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    res.status(400).json({
      error: "JSON malformado en el cuerpo de la petición",
    });
    return;
  }

  // 5. Errores de CORS
  if (err instanceof Error && err.message.includes("Bloqueado por política CORS")) {
    res.status(403).json({
      error: err.message,
    });
    return;
  }

  // 6. Errores no controlados (500) - Principio 6: Opacidad absoluta al exterior
  const referenceId = crypto.randomUUID();
  console.error(`💥 [Error No Controlado 500 - Ref: ${referenceId}]`, {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    error: `Referencia: ${referenceId}`,
  });
};

export default errorHandler;
