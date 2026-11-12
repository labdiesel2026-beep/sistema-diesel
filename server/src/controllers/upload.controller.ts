import type { Request, Response, NextFunction } from "express";
import { sanitizeImageBuffer } from "../services/cdr.service.js";
import { uploadStreamToCloudinary } from "../services/file-storage.service.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Controlador de subida de imágenes de productos (Fase 11 - Cloudinary).
 *
 * Flujo de ejecución:
 * 1. Verifica la presencia del buffer en memoria provisto por Multer.
 * 2. Aplica la tubería CDR en memoria con sharp (Magic Bytes, Pixel Flood, WebP, strip EXIF).
 * 3. Transmite el buffer WebP resultante directamente a Cloudinary vía stream.
 * 4. Responde con la secure_url absoluta HTTPS de Cloudinary.
 */
export async function uploadProductImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file || !req.file.buffer) {
      throw new AppError("No se proporcionó ningún archivo de imagen", 400);
    }

    // 1. Si el middleware uploadSingleImage ya sanitizó el buffer en memoria (isSanitized),
    // evitamos una segunda recodificación redundante con Sharp (Fase 14 RF-02).
    // Si se invoca fuera del middleware, aplicamos sanitizeImageBuffer como fallback Zero Trust.
    const fileWithFlag = req.file as Express.Multer.File & { isSanitized?: boolean };
    const sanitizedWebpBuffer = fileWithFlag.isSanitized
      ? req.file.buffer
      : await sanitizeImageBuffer(req.file.buffer);

    // 2. Transmisión por stream desde el buffer a Cloudinary
    const imageUrl = await uploadStreamToCloudinary(sanitizedWebpBuffer, "products");

    res.status(201).json({
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  uploadProductImage,
};
