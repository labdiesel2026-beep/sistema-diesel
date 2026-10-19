import { z } from "zod";

/**
 * Esquema de validación para parámetros de ruta con identificadores UUIDv4.
 * (RF-07, RF-08, RF-09, D-04)
 */
export const uuidParamSchema = z
  .object({
    id: z.string().uuid("El identificador debe ser un UUID válido"),
  })
  .strict();

export type UuidParam = z.infer<typeof uuidParamSchema>;
