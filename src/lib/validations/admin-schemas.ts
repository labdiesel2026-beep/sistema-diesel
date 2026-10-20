import { z } from "zod";

/**
 * Esquemas de Validación Fail-Fast para el Panel de Administración (Backoffice).
 * (RF-01, RF-05, RF-08, RF-10, RF-12, RNF-P4-02, AGENTS.MD §3)
 *
 * Todos los esquemas aplican .strict() para garantizar que cargas maliciosas
 * o propiedades no mapeadas sean rechazadas en la frontera de entrada.
 */

// ==========================================
// 1. Autenticación (RF-01, CA-01.3)
// ==========================================

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: "El correo electrónico es obligatorio" })
      .trim()
      .min(1, "El correo electrónico es obligatorio")
      .email("Formato de correo electrónico inválido"),
    password: z
      .string({ required_error: "La contraseña es obligatoria" })
      .min(1, "La contraseña es obligatoria"),
  })
  .strict();

export type LoginFormData = z.infer<typeof loginSchema>;

// ==========================================
// 2. Metadata de Archivos de Imagen (RF-08, CA-08.1, CA-08.2, CA-08.3, CL-01, CL-02)
// ==========================================

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5.00 MB exactos (5242880 bytes)
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const imageMetadataSchema = z
  .object({
    name: z
      .string({ required_error: "Nombre de archivo requerido" })
      .min(1, "Nombre de archivo requerido"),
    size: z
      .number({ required_error: "Tamaño de archivo requerido" })
      .max(MAX_IMAGE_SIZE_BYTES, "El archivo excede el tamaño máximo permitido de 5 MB"),
    type: z.enum(ALLOWED_IMAGE_TYPES, {
      errorMap: () => ({ message: "Solo se permiten imágenes en formato .jpg, .png o .webp" }),
    }),
  })
  .strict();

export type ImageMetadata = z.infer<typeof imageMetadataSchema>;

// ==========================================
// 3. Taxonomías: Categorías y Subcategorías (RF-10, CA-10.1 a CA-10.4)
// ==========================================

export const categoryFormSchema = z
  .object({
    name: z
      .string({ required_error: "El nombre de la categoría es obligatorio" })
      .trim()
      .min(2, "El nombre de la categoría debe tener al menos 2 caracteres"),
    parentId: z.string().uuid("Identificador de categoría padre inválido").nullable().default(null),
  })
  .strict();

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// ==========================================
// 4. Fabricantes: Marcas (RF-12, CA-12.1)
// ==========================================

export const brandFormSchema = z
  .object({
    name: z
      .string({ required_error: "El nombre de la marca es obligatorio" })
      .trim()
      .min(2, "El nombre de la marca debe tener al menos 2 caracteres"),
  })
  .strict();

export type BrandFormData = z.infer<typeof brandFormSchema>;

// ==========================================
// 5. Catálogo: Productos (RF-05, CA-05.1, CA-05.2, CA-05.3, CL-06, CL-07)
// ==========================================

export const PRODUCT_CONDITIONS = ["Nuevo", "Reacondicionado", "Usado"] as const;

export const productFormSchema = z
  .object({
    name: z
      .string({ required_error: "El nombre es obligatorio" })
      .trim()
      .min(3, "El nombre debe contener al menos 3 caracteres"),
    description: z
      .string({ required_error: "La descripción es obligatoria" })
      .trim()
      .min(5, "La descripción debe contener al menos 5 caracteres"),
    imageUrl: z
      .string({ required_error: "La foto del producto es obligatoria" })
      .min(1, "Debe seleccionar una foto para el producto"),
    categoryIds: z
      .array(z.string().uuid("Identificador de categoría inválido"))
      .min(1, "Debe seleccionar al menos una categoría"),
    brandId: z
      .string({ required_error: "Debe seleccionar una marca" })
      .uuid("Identificador de marca inválido"),
    vehicleCompatibility: z.string().trim().optional().default(""),
    condition: z.enum(PRODUCT_CONDITIONS, {
      errorMap: () => ({ message: "Condición debe ser 'Nuevo', 'Reacondicionado' o 'Usado'" }),
    }),
    price: z
      .number({ invalid_type_error: "El precio debe ser un número válido" })
      .nonnegative("El precio no puede ser negativo (admite $0)")
      .nullable(),
    showPrice: z.boolean().default(true),
    visible: z.boolean().default(true),
    oem: z.string().trim().optional().default(""),
    isFeatured: z.boolean().default(false),
  })
  .strict();

export type ProductFormData = z.infer<typeof productFormSchema>;
