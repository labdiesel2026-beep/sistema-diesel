import multer, { MulterError } from "multer";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";

export const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (5242880 bytes)

// Almacenamiento en memoria RAM estricto (RF-04): nunca escribe en disco antes de sanitizar
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
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
 * Middleware para captura de archivo único en memoria RAM (campo 'file').
 * (RF-04, RF-05)
 *
 * Rechaza de inmediato con 400 Bad Request:
 * - Si no se envió ningún archivo
 * - Si el peso supera 5 MB
 * - Si la extensión no pertenece a la whitelist (.jpg, .jpeg, .png, .webp)
 */
export const uploadSingleImage = (req: Request, res: Response, next: NextFunction): void => {
  upload.single("file")(req, res, (err: unknown) => {
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

    next();
  });
};

export default uploadSingleImage;
