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
 * (RF-01, 4.5, D-07, Principio 6)
 *
 * - Errores Operativos (AppError, códigos 400, 401, 403, 404, 409): devuelven mensaje legible y detalles estructurados.
 * - Errores Relacionales Prisma conocidos (P2002, P2003): mapeados a 409 Conflict legibles.
 * - Errores No Controlados (500 o fallos de Prisma): generan UUID opaco, registran el error y stack trace
 *   internamente en consola/logger, y retornan exclusivamente `{ error: "Error interno del servidor", referencia: "<uuid>" }`
 *   anulando cualquier filtración de stack trace o arquitectura interna.
 */
export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Errores operativos conocidos
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

  // 2. Errores relacionales conocidos de Prisma (Integridad referencial y unicidad)
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

  // 3. Error de sintaxis JSON en el cuerpo del request
  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    res.status(400).json({
      error: "JSON malformado en el cuerpo de la petición",
    });
    return;
  }

  // 4. Errores de CORS
  if (err instanceof Error && err.message.includes("Bloqueado por política CORS")) {
    res.status(403).json({
      error: err.message,
    });
    return;
  }

  // 5. Errores no controlados (500) - Principio 6: Opacidad absoluta al exterior
  const referenceId = crypto.randomUUID();
  console.error(`💥 [Error No Controlado - Ref: ${referenceId}]`, {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    error: "Error interno del servidor",
    referencia: referenceId,
  });
};

export default errorHandler;
