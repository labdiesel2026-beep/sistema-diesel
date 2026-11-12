import { z } from "zod";
export { uuidParamSchema, type UuidParam } from "./common.schemas.js";

export const PRODUCT_CONDITIONS = ["Nuevo", "Reacondicionado", "Usado"] as const;
export const MAX_PRODUCT_PRICE = 2_147_483_647; // Límite INT4_MAX de PostgreSQL

/**
 * Esquema Zod estricto para alta y actualización de productos.
 * (RF-07, D-05, D-06, Fase 14 RF-03)
 */
export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .min(3, "El nombre debe contener al menos 3 caracteres")
      .max(200, "El nombre no puede superar los 200 caracteres"),
    description: z
      .string()
      .trim()
      .min(1, "La descripción es obligatoria")
      .min(5, "La descripción debe contener al menos 5 caracteres")
      .max(5000, "La descripción no puede superar los 5000 caracteres"),
    imageUrl: z
      .string()
      .trim()
      .min(1, "Debe seleccionar una foto para el producto")
      .max(2048, "La URL de la imagen es demasiado extensa"),
    categoryIds: z
      .array(z.string().uuid("Identificador de categoría inválido"))
      .min(1, "Debe seleccionar al menos una categoría")
      .max(50, "No puede seleccionar más de 50 categorías"),
    brandId: z.string().uuid("Debe seleccionar una marca válida"),
    vehicleCompatibility: z
      .string()
      .trim()
      .max(500, "La compatibilidad vehicular no puede superar los 500 caracteres")
      .nullable()
      .optional()
      .default(""),
    compatibility: z
      .string()
      .trim()
      .max(500, "La compatibilidad vehicular no puede superar los 500 caracteres")
      .nullable()
      .optional(),
    condition: z.enum(PRODUCT_CONDITIONS, {
      error: "Condición debe ser 'Nuevo', 'Reacondicionado' o 'Usado'",
    }),
    price: z
      .number({ error: "El precio debe ser un número válido" })
      .nonnegative("El precio no puede ser negativo (admite $0)")
      .max(MAX_PRODUCT_PRICE, "El precio supera el límite máximo permitido")
      .nullable(),
    showPrice: z.boolean().default(true),
    visible: z.boolean().default(true),
    oem: z
      .string()
      .trim()
      .max(100, "El código OEM no puede superar los 100 caracteres")
      .nullable()
      .optional()
      .default(""),
    oemCode: z
      .string()
      .trim()
      .max(100, "El código OEM no puede superar los 100 caracteres")
      .nullable()
      .optional(),
    isFeatured: z.boolean().default(false),
  })
  .strict();

export const createProductSchema = productFormSchema;
export const updateProductSchema = productFormSchema.partial();

/**
 * Esquema Zod estricto para alternar visibilidad de un producto.
 */
export const visibilityPatchSchema = z
  .object({
    visible: z.boolean({ error: "El campo 'visible' debe ser un valor booleano" }),
  })
  .strict();

/**
 * Esquema Zod estricto para alternar estado destacado de un producto (Fase 6).
 */
export const featuredPatchSchema = z
  .object({
    isFeatured: z.boolean({ error: "El campo 'isFeatured' debe ser un valor booleano" }),
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
export type ProductFormInput = z.input<typeof productFormSchema>;
export type VisibilityPatchData = z.infer<typeof visibilityPatchSchema>;
export type FeaturedPatchData = z.infer<typeof featuredPatchSchema>;
export type ProductQueryData = z.infer<typeof productQuerySchema>;

