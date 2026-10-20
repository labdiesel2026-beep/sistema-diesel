import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import { saveBuffer, deleteFile, safelyDeleteImage } from "../src/services/file-storage.service.js";

describe("Servicio de Almacenamiento Local y Limpieza Física Resiliente (Tarea 4.3)", () => {
  const testUploadsDir = path.resolve(process.cwd(), "test-uploads-storage");

  beforeEach(async () => {
    await fs.mkdir(testUploadsDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
    } catch {
      // Ignorar errores en limpieza
    }
  });

  describe("saveBuffer", () => {
    it("escribe correctamente el buffer en el directorio configurado y devuelve la ruta pública", async () => {
      const buffer = Buffer.from("dummy-image-content");
      const filename = "test-image.webp";

      const publicPath = await saveBuffer(filename, buffer, testUploadsDir);

      expect(publicPath).toBe(`/uploads/${filename}`);

      const savedContent = await fs.readFile(path.join(testUploadsDir, filename));
      expect(savedContent.equals(buffer)).toBe(true);
    });

    it("mitiga Path Traversal en el nombre del archivo sanitizando con path.basename", async () => {
      const buffer = Buffer.from("traversal-content");
      const maliciousName = "../../traversal-attempt.webp";

      const publicPath = await saveBuffer(maliciousName, buffer, testUploadsDir);

      expect(publicPath).toBe("/uploads/traversal-attempt.webp");

      // Verificar que se guardó dentro del directorio de uploads y no en rutas relativas superiores
      const fileInDir = await fs.readFile(path.join(testUploadsDir, "traversal-attempt.webp"));
      expect(fileInDir.equals(buffer)).toBe(true);
    });
  });

  describe("deleteFile y safelyDeleteImage", () => {
    it("purga un archivo .webp existente en disco sin lanzar errores", async () => {
      const filename = "existing-file.webp";
      const filePath = path.join(testUploadsDir, filename);
      await fs.writeFile(filePath, Buffer.from("to-be-deleted"));

      // Verificar existencia inicial
      expect(
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);

      // Invocar deleteFile
      await deleteFile(`/uploads/${filename}`, testUploadsDir);

      // Verificar que fue eliminado
      expect(
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false),
      ).toBe(false);
    });

    it("no lanza excepción si el archivo a eliminar no existe (resiliencia ENOENT)", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await expect(
        deleteFile("/uploads/non-existent-image.webp", testUploadsDir),
      ).resolves.not.toThrow();

      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain("[FileStorage Warning]");

      warnSpy.mockRestore();
    });

    it("ignora y no intenta eliminar archivos que no terminen en .webp (placeholders / externos)", async () => {
      const placeholderFile = path.join(testUploadsDir, "placeholder.png");
      await fs.writeFile(placeholderFile, Buffer.from("keep-me"));

      await deleteFile("/images/placeholder.png", testUploadsDir);
      await deleteFile("https://external-cdn.com/avatar.jpg", testUploadsDir);
      await deleteFile("", testUploadsDir);

      // El archivo sigue intacto
      expect(
        await fs
          .access(placeholderFile)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);
    });

    it("mitiga Path Traversal aislando la eliminación estrictamente a path.basename", async () => {
      // Crear un archivo fuera del directorio de prueba (en el directorio padre)
      const outsideFile = path.resolve(process.cwd(), "safe-outside-test.webp");
      await fs.writeFile(outsideFile, Buffer.from("critical-outside-data"));

      try {
        // Intento de borrado con Path Traversal
        await deleteFile("../../safe-outside-test.webp", testUploadsDir);

        // El archivo fuera de uploads debe seguir intacto
        const stillExists = await fs
          .access(outsideFile)
          .then(() => true)
          .catch(() => false);
        expect(stillExists).toBe(true);
      } finally {
        await fs.unlink(outsideFile).catch(() => {});
      }
    });

    it("funciona idénticamente usando el alias safelyDeleteImage", async () => {
      const filename = "alias-test.webp";
      const filePath = path.join(testUploadsDir, filename);
      await fs.writeFile(filePath, Buffer.from("alias-data"));

      await safelyDeleteImage(`/uploads/${filename}`, testUploadsDir);

      expect(
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false),
      ).toBe(false);
    });
  });
});
