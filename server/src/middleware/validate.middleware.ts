import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodTypeAny, ZodIssue } from "zod";

export interface ValidationTargets {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

function formatZodIssues(issues: ZodIssue[], fallbackField: string): Array<{ field: string; message: string }> {
  return issues.map((issue) => {
    let field = issue.path.join(".");
    // En Zod, los errores de claves no reconocidas (.strict()) proveen las claves en `keys`
    if (!field && "keys" in issue && Array.isArray((issue as any).keys) && (issue as any).keys.length > 0) {
      field = (issue as any).keys.join(", ");
    }
    if (!field) {
      field = fallbackField;
    }
    return {
      field,
      message: issue.message,
    };
  });
}

/**
 * Middleware genérico de validación Fail-Fast con Zod.
 * (RF-01, RF-07, 4.2)
 *
 * Intercepta requests y valida body, params y query contra esquemas Zod (típicamente .strict()).
 * Si la validación falla, retorna de inmediato HTTP 400 Bad Request con formato estandarizado
 * y previene la invocación del controlador de negocio subsiguiente.
 */
export function validate(schemaOrTargets: ZodTypeAny | ValidationTargets): RequestHandler {
  const targets: ValidationTargets =
    "safeParse" in schemaOrTargets
      ? { body: schemaOrTargets as ZodTypeAny }
      : (schemaOrTargets as ValidationTargets);

  return (req: Request, res: Response, next: NextFunction): void => {
    const details: Array<{ field: string; message: string }> = [];

    if (targets.params) {
      const result = targets.params.safeParse(req.params);
      if (!result.success) {
        details.push(...formatZodIssues(result.error.issues, "params"));
      } else {
        req.params = result.data as Record<string, string>;
      }
    }

    if (targets.query) {
      const result = targets.query.safeParse(req.query);
      if (!result.success) {
        details.push(...formatZodIssues(result.error.issues, "query"));
      } else {
        Object.defineProperty(req, "query", {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
    }

    if (targets.body) {
      const result = targets.body.safeParse(req.body);
      if (!result.success) {
        details.push(...formatZodIssues(result.error.issues, "body"));
      } else {
        req.body = result.data;
      }
    }

    if (details.length > 0) {
      res.status(400).json({
        error: "Datos de validación inválidos",
        details,
      });
      return;
    }

    next();
  };
}

export default validate;
