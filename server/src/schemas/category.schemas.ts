import { z } from "zod";
export { uuidParamSchema, type UuidParam } from "./common.schemas.js";

/**
 * Esquema de validación para creación y actualización de categorías (RF-08, D-04).
 *
 * - name: string trim mínimo 2 caracteres.
 * - parentId: UUID nullable y opcional (default null).
 * - .strict() para anular campos imprevistos.
 */
export const categoryFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre de la categoría es obligatorio")
      .min(2, "El nombre de la categoría debe tener al menos 2 caracteres"),
    parentId: z
      .string()
      .uuid("Identificador de categoría padre inválido")
      .nullable()
      .optional()
      .default(null),
  })
  .strict();

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
