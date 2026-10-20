import { z } from "zod";

/**
 * Validador atómico de UUID v4 estándar.
 */
export const uuidSchema = z.string().uuid("Identificador UUID inválido");

/**
 * Esquema Zod estricto para validar parámetros de ruta con identificador UUID ($productId).
 */
export const uuidParamSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();

export type UuidParam = z.infer<typeof uuidParamSchema>;

/**
 * Esquema Zod estricto para validar parámetros de búsqueda en URL del catálogo (/catalogo).
 * (Spec 003, RF-03, RF-04, RNF-05, Fail-Fast Zod)
 *
 * Rechaza de forma inmediata campos desconocidos (.strict()) o valores que no sean UUIDs válidos.
 */
export const catalogSearchParamsSchema = z
  .object({
    q: z.string().trim().optional().default(""),
    brand: z.union([uuidSchema, z.array(uuidSchema)]).optional(),
    category: z.union([uuidSchema, z.array(uuidSchema)]).optional(),
  })
  .strict();

export type CatalogSearchParams = z.infer<typeof catalogSearchParamsSchema>;

/**
 * Normaliza un valor de filtro que puede venir como string único o array de strings
 * en un array homogéneo de UUIDs (útil para TanStack Router search params).
 */
export function normalizeFilterParam(param?: string | string[]): string[] {
  if (!param) return [];
  if (Array.isArray(param)) return param;
  return [param];
}
