import { z } from "zod";
export { uuidParamSchema, type UuidParam } from "./common.schemas.js";

/**
 * Esquema de validación para creación y actualización de marcas.
 * (RF-09, D-04)
 *
 * Requiere nombre con longitud mínima de 2 caracteres aplicando .trim().
 * Anula propiedades no declaradas mediante .strict().
 */
export const brandFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre de la marca es obligatorio")
      .min(2, "El nombre de la marca debe tener al menos 2 caracteres"),
  })
  .strict();

export type BrandFormData = z.infer<typeof brandFormSchema>;
