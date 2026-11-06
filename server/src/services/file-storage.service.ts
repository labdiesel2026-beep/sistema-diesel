import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";
import path from "node:path";
import fs from "node:fs/promises";
import { ENV } from "../config/env.js";

// Inicializar configuración del SDK oficial de Cloudinary (v2)
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
  secure: true,
});

export const DEFAULT_UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

/**
 * Sube un buffer de imagen a Cloudinary utilizando streams en memoria (Zero-Disk).
 *
 * @param buffer Contenido binario del archivo WebP sanitizado
 * @param folder Carpeta destino dentro de Cloudinary (por defecto "products")
 * @returns URL pública segura absoluta HTTPS (secure_url) provista por Cloudinary
 */
export async function uploadStreamToCloudinary(
  buffer: Buffer,
  folder: string = "products",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: "webp",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            error || new Error("Error en la subida a Cloudinary: resultado vacío"),
          );
        }
        resolve(result.secure_url);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Extrae de forma segura el `public_id` de un recurso alojado en Cloudinary a partir de su URL.
 * Soporta versiones opcionales (`/v1234567/`) y subcarpetas.
 *
 * @param imageUrl URL del recurso en Cloudinary
 * @returns El identificador público para operaciones de la API o null si no es una URL de Cloudinary
 */
export function extractCloudinaryPublicId(imageUrl: string): string | null {
  if (!imageUrl || typeof imageUrl !== "string") {
    return null;
  }

  try {
    const parsed = new URL(imageUrl);
    if (!parsed.hostname.includes("cloudinary.com")) {
      return null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex >= segments.length - 1) {
      return null;
    }

    const afterUpload = segments.slice(uploadIndex + 1);

    // Omitir versión (/v12345/) o transformaciones si estuviesen presentes
    while (
      afterUpload.length > 1 &&
      (/^v\d+$/.test(afterUpload[0]) || afterUpload[0].includes(","))
    ) {
      afterUpload.shift();
    }

    if (afterUpload.length === 0) {
      return null;
    }

    const fullPath = afterUpload.join("/");
    const lastDot = fullPath.lastIndexOf(".");
    return lastDot !== -1 ? fullPath.substring(0, lastDot) : fullPath;
  } catch {
    return null;
  }
}

/**
 * Guarda un buffer de archivo en el directorio de almacenamiento local (`uploads`).
 * Se conserva para compatibilidad histórica y entornos aislados sin conexión.
 *
 * @param filename Nombre del archivo (ej. "<uuid>.webp")
 * @param buffer Contenido binario del archivo
 * @param uploadsDir Directorio destino (por defecto: `server/uploads`)
 * @returns Ruta pública relativa (`/uploads/<filename>`)
 */
export async function saveBuffer(
  filename: string,
  buffer: Buffer,
  uploadsDir: string = DEFAULT_UPLOADS_DIR,
): Promise<string> {
  const safeFilename = path.basename(filename);
  await fs.mkdir(uploadsDir, { recursive: true });
  const destination = path.join(uploadsDir, safeFilename);
  await fs.writeFile(destination, buffer);
  return `/uploads/${safeFilename}`;
}

/**
 * Elimina una imagen de forma polimórfica y resiliente (Zero-Crash).
 *
 * Medidas de seguridad y resiliencia:
 * 1. Cloudinary CDN: Si la URL es de Cloudinary, extrae el `public_id` e invoca `destroy`.
 * 2. Mitigación de Path Traversal (D-10): En rutas locales, extrae únicamente `path.basename`.
 * 3. Validación de extensión: Solo procesa archivos con extensión `.webp`. Ignora placeholders.
 * 4. Resiliencia I/O: Bloques `try/catch` aislados que registran advertencias (`console.warn`)
 *    sin interrumpir transacciones ni relanzar excepciones al llamador.
 *
 * @param imageUrl Ruta o URL de la imagen a eliminar
 * @param uploadsDir Directorio físico de uploads para archivos locales
 */
export async function deleteFile(
  imageUrl: string,
  uploadsDir: string = DEFAULT_UPLOADS_DIR,
): Promise<void> {
  if (!imageUrl || typeof imageUrl !== "string") {
    return;
  }

  // 1. Detección y eliminación en Cloudinary
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (error: any) {
      console.warn(
        `[FileStorage Warning] Error al eliminar recurso en Cloudinary (${publicId}): ${error?.message || error}`,
      );
    }
    return;
  }

  // 2. Eliminación en disco local legacy (/uploads/<uuid>.webp)
  const basename = path.basename(imageUrl);
  if (!basename.endsWith(".webp")) {
    return; // Ignora placeholders (/product-placeholder.png) o URLs externas no reconocidas
  }

  const absoluteFilePath = path.join(uploadsDir, basename);

  try {
    await fs.unlink(absoluteFilePath);
  } catch (error: any) {
    console.warn(
      `[FileStorage Warning] No se pudo eliminar físicamente el archivo local ${basename}: ${error?.message || error}`,
    );
  }
}

/**
 * Alias de compatibilidad según convenciones arquitectónicas
 */
export const safelyDeleteImage = deleteFile;

export default {
  uploadStreamToCloudinary,
  extractCloudinaryPublicId,
  saveBuffer,
  deleteFile,
  safelyDeleteImage,
  DEFAULT_UPLOADS_DIR,
};
