import { z } from "zod";

/**
 * Tipos MIME admitidos constitucionalmente para la carga de imágenes en frontera.
 * (Spec 010, RNF-04, Principio 2: Fail-Fast Zod en Frontera, Principio 3: Upload Paranoico)
 */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/**
 * Límite máximo de tamaño para el archivo entrante en frontera (8 MB = 8,000,000 bytes).
 */
export const MAX_UPLOAD_SIZE_BYTES = 8_000_000;

/**
 * Esquema Zod en frontera para validación fail-fast de archivos entrantes (req.file).
 * Valida formato MIME y peso antes de delegar la operación al pipeline de procesamiento Sharp.
 * Utiliza passthrough() para preservar los campos binarios (buffer, originalname) requeridos por el procesamiento.
 */
export const uploadFileSchema = z
  .object({
    mimetype: z.enum(ALLOWED_MIME_TYPES, {
      message: "Formato no admitido. Se requiere JPEG, PNG o WebP",
    }),
    size: z
      .number({ message: "El tamaño de archivo debe ser un número válido" })
      .max(MAX_UPLOAD_SIZE_BYTES, "El tamaño de archivo entrante no debe exceder 8 MB"),
  })
  .passthrough();

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
