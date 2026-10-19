import path from "node:path";
import fs from "node:fs/promises";

export const DEFAULT_UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

/**
 * Guarda un buffer de archivo en el directorio de almacenamiento local (`uploads`).
 * Sanitiza el nombre de archivo con `path.basename` para mitigar Path Traversal.
 *
 * @param filename Nombre del archivo (ej. "<uuid>.webp")
 * @param buffer Contenido binario del archivo
 * @param uploadsDir Directorio destino (por defecto: `server/uploads`)
 * @returns Ruta pública relativa (`/uploads/<filename>`)
 */
export async function saveBuffer(
  filename: string,
  buffer: Buffer,
  uploadsDir: string = DEFAULT_UPLOADS_DIR
): Promise<string> {
  const safeFilename = path.basename(filename);
  await fs.mkdir(uploadsDir, { recursive: true });
  const destination = path.join(uploadsDir, safeFilename);
  await fs.writeFile(destination, buffer);
  return `/uploads/${safeFilename}`;
}

/**
 * Elimina físicamente un archivo de imagen en el disco.
 *
 * Medidas de seguridad y resiliencia:
 * 1. Mitigación de Path Traversal (D-10): Extrae únicamente `path.basename(imageUrl)`.
 * 2. Validación de extensión: Solo procesa archivos con extensión `.webp`. Ignora placeholders y URLs externas.
 * 3. Resiliencia I/O: Bloque `try/catch` que registra advertencias (`console.warn`)
 *    sin interrumpir el flujo ni relanzar excepciones si el archivo no existe (ENOENT)
 *    o está bloqueado por el sistema de archivos en Windows (EBUSY).
 *
 * @param imageUrl Ruta o URL de la imagen a eliminar (ej. "/uploads/<uuid>.webp")
 * @param uploadsDir Directorio físico de uploads (por defecto: `server/uploads`)
 */
export async function deleteFile(
  imageUrl: string,
  uploadsDir: string = DEFAULT_UPLOADS_DIR
): Promise<void> {
  if (!imageUrl || typeof imageUrl !== "string") {
    return;
  }

  // Mitigación estricta de Path Traversal (D-10)
  const basename = path.basename(imageUrl);
  if (!basename.endsWith(".webp")) {
    return; // Ignora placeholders (/product-placeholder.png) o URLs externas
  }

  const absoluteFilePath = path.join(uploadsDir, basename);

  try {
    await fs.unlink(absoluteFilePath);
  } catch (error: any) {
    // Aislamiento de fallos de I/O, EBUSY en Windows o archivos ya inexistentes (CA-06.4, D-10)
    console.warn(
      `[FileStorage Warning] No se pudo eliminar físicamente el archivo ${basename}: ${error?.message || error}`
    );
  }
}

/**
 * Alias de compatibilidad según pseudocódigo de plan.md §3.2
 */
export const safelyDeleteImage = deleteFile;

export default {
  saveBuffer,
  deleteFile,
  safelyDeleteImage,
  DEFAULT_UPLOADS_DIR,
};
