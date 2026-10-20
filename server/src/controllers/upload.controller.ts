import type { Request, Response, NextFunction } from "express";
import { processImageUpload } from "../services/cdr.service.js";
import { AppError } from "../middleware/error.middleware.js";

/**
 * Controlador de subida de imágenes de productos (RF-04, RF-05, Tarea 4.4).
 * Procesa el buffer en memoria recibido por Multer a través de la tubería CDR
 * y devuelve la URL pública del archivo WebP sanitizado.
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

    const imageUrl = await processImageUpload(req.file.buffer);

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
