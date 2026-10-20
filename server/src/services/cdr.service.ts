import sharp, { type Sharp } from "sharp";
import { fileTypeFromBuffer } from "file-type";
import crypto from "node:crypto";
import { AppError } from "../middleware/error.middleware.js";
import { saveBuffer, DEFAULT_UPLOADS_DIR } from "./file-storage.service.js";

export const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_DIMENSION_PX = 4096; // Protección contra Pixel Flood / Bomba de Descompresión (D-08)
export const TARGET_MAX_WIDTH = 1080;
export const TARGET_MAX_HEIGHT = 1080;
export const WEBP_QUALITY = 80;

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

/**
 * Valida los Magic Bytes del buffer de imagen en memoria.
 * (RF-04, CA-04.5)
 */
export async function validateImageMagicBytes(fileBuffer: Buffer): Promise<string> {
  const detectedType = await fileTypeFromBuffer(fileBuffer);

  if (!detectedType || !ALLOWED_MIME_TYPES.has(detectedType.mime)) {
    throw new ValidationError(
      "El contenido del archivo no corresponde a una imagen válida (JPEG, PNG o WebP)",
    );
  }

  return detectedType.mime;
}

/**
 * Pre-inspecciona los metadatos de dimensiones de la imagen para neutralizar
 * ataques de Denegación de Servicio por Pixel Flood / Bomba de Descompresión.
 * (RF-04, CA-04.6, D-08)
 */
export async function inspectImageDimensions(
  imageInstance: Sharp,
): Promise<{ width: number; height: number }> {
  const metadata = await imageInstance.metadata();

  if (!metadata.width || !metadata.height) {
    throw new ValidationError("No se pudieron determinar las dimensiones de la imagen");
  }

  if (metadata.width > MAX_DIMENSION_PX || metadata.height > MAX_DIMENSION_PX) {
    throw new ValidationError(
      `Dimensiones de imagen excesivas (${metadata.width}x${metadata.height}px). Límite de seguridad: ${MAX_DIMENSION_PX}px`,
    );
  }

  return { width: metadata.width, height: metadata.height };
}

/**
 * Desarma, redimensiona y reconstruye la imagen descartando metadatos EXIF.
 * (RF-05, D-09)
 */
export async function reconstructToWebp(imageInstance: Sharp): Promise<Buffer> {
  return imageInstance
    .rotate() // Auto-orienta según orientación EXIF antes del purgado
    .resize({
      width: TARGET_MAX_WIDTH,
      height: TARGET_MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Tubería Paranoica CDR Completa (Desarme y Reconstrucción).
 * (RF-04, RF-05, RF-06, D-08, D-09)
 *
 * 1. Valida Magic Bytes (JPEG, PNG, WebP).
 * 2. Pre-inspecciona dimensiones (<= 4096px).
 * 3. Desarma y reconstruye a .webp (max 1080x1080, quality 80, strip EXIF).
 * 4. Genera nombre opaco con UUIDv4.
 * 5. Persiste en disco de forma segura en `uploadsDir`.
 *
 * @returns Ruta pública del archivo (/uploads/<uuid>.webp)
 */
export async function processImageUpload(
  fileBuffer: Buffer,
  uploadsDir: string = DEFAULT_UPLOADS_DIR,
): Promise<string> {
  // 1. Verificación de Magic Bytes con file-type
  await validateImageMagicBytes(fileBuffer);

  // 2. Pre-inspección de dimensiones contra Pixel Flood
  const imageInstance = sharp(fileBuffer);
  await inspectImageDimensions(imageInstance);

  // 3. Desarme y Reconstrucción segura
  const sanitizedBuffer = await reconstructToWebp(imageInstance);

  // 4. Renombramiento con UUIDv4 criptográfico
  const fileUuid = crypto.randomUUID();
  const safeFilename = `${fileUuid}.webp`;

  // 5. Persistencia física delegada en FileStorageService
  return saveBuffer(safeFilename, sanitizedBuffer, uploadsDir);
}

export default {
  processImageUpload,
  validateImageMagicBytes,
  inspectImageDimensions,
  reconstructToWebp,
  ValidationError,
};
