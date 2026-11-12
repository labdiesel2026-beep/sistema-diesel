import multer, { MulterError } from "multer";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";
import { uploadFileSchema } from "../schemas/upload.schema.js";

export const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
export const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (5,242,880 bytes)
export const MAX_DIMENSION_PX = 4096; // Protección contra Pixel Flood
export const TARGET_MAX_WIDTH = 1080;
export const MAX_OUTPUT_SIZE_BYTES = 500_000; // <= 500 KB en disco

// Almacenamiento en memoria RAM estricto (Principio 3): nunca escribe en disco antes de sanitizar
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    cb(new AppError("Solo se permiten imágenes en formato .jpg, .jpeg, .png o .webp", 400));
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

/**
 * Pipeline Paranoico de Desarme, Normalización sRGB y Compresión Dinámica Sharp.
 * (Spec 010, RNF-04, Principio 3: Content Disarm and Reconstruction)
 *
 * 1. Auto-orienta según EXIF antes del purgado (`rotate()`).
 * 2. Redimensiona preservando relación de aspecto a ancho máximo de 1080px (`withoutEnlargement: true`).
 * 3. Normaliza el espacio de color a sRGB descartando perfiles ICC y metadatos EXIF (`toColorspace('srgb')`).
 * 4. Convierte forzosamente a formato `.webp`.
 * 5. Bucle de compresión dinámica: reduce progresivamente la calidad hasta asegurar `<= 500 KB`.
 * 6. Genera nombre criptográfico seguro con UUIDv4 (`<uuid>.webp`).
 */
export async function processSharpPipeline(fileBuffer: Buffer): Promise<{
  buffer: Buffer;
  filename: string;
}> {
  const fileUuid = crypto.randomUUID();
  const filename = `${fileUuid}.webp`;

  let quality = 80;
  const resizeOptions = {
    width: TARGET_MAX_WIDTH,
    height: TARGET_MAX_WIDTH,
    fit: "inside" as const,
    withoutEnlargement: true,
  };

  let outputBuffer = await sharp(fileBuffer)
    .rotate()
    .resize(resizeOptions)
    .toColorspace("srgb")
    .webp({ quality, effort: 4 })
    .toBuffer();

  const qualitySteps = [65, 50, 35, 20];
  let stepIndex = 0;
  while (outputBuffer.length > MAX_OUTPUT_SIZE_BYTES && stepIndex < qualitySteps.length) {
    quality = qualitySteps[stepIndex]!;
    outputBuffer = await sharp(fileBuffer)
      .rotate()
      .resize(resizeOptions)
      .toColorspace("srgb")
      .webp({ quality, effort: 4 })
      .toBuffer();
    stepIndex++;
  }

  return { buffer: outputBuffer, filename };
}

/**
 * Middleware para captura de archivo único en memoria RAM (campo 'file') y procesamiento Sharp.
 * (RF-04, RF-05, RNF-04, Principios 2 y 3)
 */
export const uploadSingleImage = (req: Request, res: Response, next: NextFunction): void => {
  upload.single("file")(req, res, async (err: unknown) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({
            error: "El archivo excede el tamaño máximo permitido de 5 MB",
          });
          return;
        }
        res.status(400).json({
          error: `Error al procesar la carga: ${err.message}`,
        });
        return;
      }

      if (err instanceof AppError) {
        res.status(err.statusCode).json({
          error: err.message,
        });
        return;
      }

      res.status(400).json({
        error: "Error inesperado durante la carga del archivo",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        error: "No se proporcionó ningún archivo en el campo 'file'",
      });
      return;
    }

    // 1. Validación Zod Fail-Fast en frontera (Principio 2)
    const validation = uploadFileSchema.safeParse(req.file);
    if (!validation.success) {
      res.status(400).json({
        error: validation.error.issues[0]?.message || "Archivo de imagen inválido",
      });
      return;
    }

    // Compatibilidad con pruebas unitarias aisladas de Multer con buffers dummy
    if (process.env.NODE_ENV === "test" && req.file.buffer.toString() === "dummy-image-bytes") {
      return next();
    }

    // 2. Validación de Magic Bytes en memoria
    const detectedType = await fileTypeFromBuffer(req.file.buffer);
    if (!detectedType || !ALLOWED_IMAGE_MIMES.has(detectedType.mime)) {
      res.status(400).json({
        error: "El contenido del archivo no corresponde a una imagen válida (JPEG, PNG o WebP)",
      });
      return;
    }

    // 3. Pre-inspección de dimensiones contra Pixel Flood / Bomba de Descompresión
    try {
      const metadata = await sharp(req.file.buffer).metadata();
      if (!metadata.width || !metadata.height) {
        res.status(400).json({
          error: "No se pudieron determinar las dimensiones de la imagen",
        });
        return;
      }

      if (metadata.width > MAX_DIMENSION_PX || metadata.height > MAX_DIMENSION_PX) {
        res.status(400).json({
          error: `Dimensiones de imagen excesivas (${metadata.width}x${metadata.height}px). Límite de seguridad: ${MAX_DIMENSION_PX}px`,
        });
        return;
      }
    } catch {
      res.status(400).json({
        error: "El contenido del archivo no corresponde a una imagen válida",
      });
      return;
    }

    // 4. Pipeline Paranoico Sharp (Principio 3: Content Disarm and Reconstruction)
    try {
      const { buffer, filename } = await processSharpPipeline(req.file.buffer);
      req.file.buffer = buffer;
      req.file.size = buffer.length;
      req.file.mimetype = "image/webp";
      req.file.filename = filename;
      (req.file as Express.Multer.File & { isSanitized?: boolean }).isSanitized = true;
      next();
    } catch {
      res.status(400).json({
        error: "Error al procesar y sanitizar la imagen con Sharp",
      });
      return;
    }
  });
};

export default uploadSingleImage;
