import { z } from "zod";
export { uuidParamSchema, type UuidParam } from "./common.schemas.js";

export const PRODUCT_CONDITIONS = ["Nuevo", "Reacondicionado", "Usado"] as const;

/**
 * Esquema Zod estricto para alta y actualización de productos.
 * (RF-07, D-05, D-06)
 */
export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .min(3, "El nombre debe contener al menos 3 caracteres"),
    description: z
      .string()
      .trim()
      .min(1, "La descripción es obligatoria")
      .min(5, "La descripción debe contener al menos 5 caracteres"),
    imageUrl: z.string().trim().min(1, "Debe seleccionar una foto para el producto"),
    categoryIds: z
      .array(z.string().uuid("Identificador de categoría inválido"))
      .min(1, "Debe seleccionar al menos una categoría"),
    brandId: z.string().uuid("Debe seleccionar una marca válida"),
    vehicleCompatibility: z.string().trim().optional().default(""),
    condition: z.enum(PRODUCT_CONDITIONS, {
      error: "Condición debe ser 'Nuevo', 'Reacondicionado' o 'Usado'",
    }),
    price: z
      .number({ error: "El precio debe ser un número válido" })
      .nonnegative("El precio no puede ser negativo (admite $0)")
      .nullable(),
    showPrice: z.boolean().default(true),
    visible: z.boolean().default(true),
    oem: z.string().trim().optional().default(""),
  })
  .strict();

/**
 * Esquema Zod estricto para alternar visibilidad de un producto.
 */
export const visibilityPatchSchema = z
  .object({
    visible: z.boolean({ error: "El campo 'visible' debe ser un valor booleano" }),
  })
  .strict();

/**
 * Esquema Zod para filtros de consulta en listado de productos.
 */
export const productQuerySchema = z
  .object({
    visibleOnly: z.enum(["true", "false"]).optional(),
  })
  .strict();

export type ProductFormData = z.infer<typeof productFormSchema>;
export type VisibilityPatchData = z.infer<typeof visibilityPatchSchema>;
export type ProductQueryData = z.infer<typeof productQuerySchema>;
