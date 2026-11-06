import sharp, { type Sharp } from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { AppError } from "../middleware/error.middleware.js";
import { uploadStreamToCloudinary } from "./file-storage.service.js";

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
 * Tubería Paranoica CDR Completa en Memoria.
 * 1. Valida Magic Bytes (JPEG, PNG, WebP).
 * 2. Pre-inspecciona dimensiones contra Pixel Flood (<= 4096px).
 * 3. Desarma y reconstruye a .webp (max 1080x1080, quality 80, strip EXIF).
 *
 * @param fileBuffer Buffer de imagen recibido en memoria
 * @returns Buffer WebP sanitizado y optimizado
 */
export async function sanitizeImageBuffer(fileBuffer: Buffer): Promise<Buffer> {
  await validateImageMagicBytes(fileBuffer);
  const imageInstance = sharp(fileBuffer);
  await inspectImageDimensions(imageInstance);
  return reconstructToWebp(imageInstance);
}

/**
 * Tubería Completa CDR y Persistencia en Cloudinary.
 *
 * 1. Desinfecta y optimiza el buffer en memoria con sharp.
 * 2. Transmite el buffer WebP mediante stream a Cloudinary.
 * 3. Retorna la secure_url pública HTTPS entregada por Cloudinary.
 *
 * @param fileBuffer Buffer de imagen recibido
 * @param folder Carpeta destino en Cloudinary (por defecto: "products")
 * @returns secure_url de Cloudinary
 */
export async function processImageUpload(
  fileBuffer: Buffer,
  folder: string = "products",
): Promise<string> {
  const sanitizedBuffer = await sanitizeImageBuffer(fileBuffer);
  return uploadStreamToCloudinary(sanitizedBuffer, folder);
}

export default {
  sanitizeImageBuffer,
  processImageUpload,
  validateImageMagicBytes,
  inspectImageDimensions,
  reconstructToWebp,
  ValidationError,
};
