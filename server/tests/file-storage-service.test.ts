import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";
import {
  saveBuffer,
  deleteFile,
  safelyDeleteImage,
  uploadStreamToCloudinary,
  extractCloudinaryPublicId,
} from "../src/services/file-storage.service.js";

describe("Servicio de Almacenamiento Cloudinary y Fallback Local (Fase 11)", () => {
  const testUploadsDir = path.resolve(process.cwd(), "test-uploads-storage");

  beforeEach(async () => {
    await fs.mkdir(testUploadsDir, { recursive: true });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
    } catch {
      // Ignorar errores en limpieza
    }
  });

  describe("extractCloudinaryPublicId", () => {
    it("extrae correctamente el public_id con versión y carpeta", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v1612345678/products/injector-uuid.webp";
      expect(extractCloudinaryPublicId(url)).toBe("products/injector-uuid");
    });

    it("extrae correctamente el public_id sin versión", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/products/another-uuid.webp";
      expect(extractCloudinaryPublicId(url)).toBe("products/another-uuid");
    });

    it("soporta subcarpetas anidadas en Cloudinary", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v1234/products/diesel/bosch-0445.webp";
      expect(extractCloudinaryPublicId(url)).toBe("products/diesel/bosch-0445");
    });

    it("retorna null para rutas locales o URLs externas no Cloudinary", () => {
      expect(extractCloudinaryPublicId("/uploads/uuid.webp")).toBeNull();
      expect(extractCloudinaryPublicId("https://external-cdn.com/image.webp")).toBeNull();
      expect(extractCloudinaryPublicId("/product-placeholder.png")).toBeNull();
      expect(extractCloudinaryPublicId("")).toBeNull();
      expect(extractCloudinaryPublicId(null as any)).toBeNull();
    });
  });

  describe("uploadStreamToCloudinary", () => {
    it("sube exitosamente el buffer y retorna la secure_url provista por Cloudinary", async () => {
      const fakeSecureUrl =
        "https://res.cloudinary.com/demo/image/upload/v1700000000/products/test-upload.webp";

      const uploadStreamSpy = vi
        .spyOn(cloudinary.uploader, "upload_stream")
        .mockImplementation((options: any, callback: any) => {
          // Devolvemos un WritableStream simulado
          const { Writable } = require("node:stream");
          const stream = new Writable({
            write(_chunk, _encoding, next) {
              next();
            },
            final(done) {
              callback(null, {
                secure_url: fakeSecureUrl,
                public_id: "products/test-upload",
              });
              done();
            },
          });
          return stream as any;
        });

      const buffer = Buffer.from("fake-webp-binary-data");
      const url = await uploadStreamToCloudinary(buffer, "products");

      expect(url).toBe(fakeSecureUrl);
      expect(uploadStreamSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: "products",
          format: "webp",
          resource_type: "image",
        }),
        expect.any(Function),
      );
    });

    it("rechaza la promesa si Cloudinary responde con error o resultado vacío", async () => {
      vi.spyOn(cloudinary.uploader, "upload_stream").mockImplementation((_opts: any, callback: any) => {
        const { Writable } = require("node:stream");
        return new Writable({
          write(_chunk, _encoding, next) {
            next();
          },
          final(done) {
            callback(new Error("Cloudinary connection timeout"), null);
            done();
          },
        }) as any;
      });

      const buffer = Buffer.from("fail-data");
      await expect(uploadStreamToCloudinary(buffer)).rejects.toThrow(
        "Cloudinary connection timeout",
      );
    });
  });

  describe("saveBuffer (compatibilidad local)", () => {
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

      const fileInDir = await fs.readFile(path.join(testUploadsDir, "traversal-attempt.webp"));
      expect(fileInDir.equals(buffer)).toBe(true);
    });
  });

  describe("deleteFile y safelyDeleteImage (resiliencia polimórfica)", () => {
    it("elimina un recurso de Cloudinary usando su public_id", async () => {
      const destroySpy = vi
        .spyOn(cloudinary.uploader, "destroy")
        .mockResolvedValue({ result: "ok" });

      const cloudinaryUrl =
        "https://res.cloudinary.com/demo/image/upload/v1612345678/products/injector-to-delete.webp";

      await deleteFile(cloudinaryUrl);

      expect(destroySpy).toHaveBeenCalledWith("products/injector-to-delete", {
        invalidate: true,
      });
    });

    it("no lanza excepción si la eliminación en Cloudinary falla (resiliencia Zero-Crash)", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.spyOn(cloudinary.uploader, "destroy").mockRejectedValue(
        new Error("Network Error"),
      );

      const cloudinaryUrl =
        "https://res.cloudinary.com/demo/image/upload/v1612345678/products/error-item.webp";

      await expect(deleteFile(cloudinaryUrl)).resolves.not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain("[FileStorage Warning]");
    });

    it("purga un archivo .webp local existente en disco sin lanzar errores", async () => {
      const filename = "existing-file.webp";
      const filePath = path.join(testUploadsDir, filename);
      await fs.writeFile(filePath, Buffer.from("to-be-deleted"));

      expect(
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);

      await deleteFile(`/uploads/${filename}`, testUploadsDir);

      expect(
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false),
      ).toBe(false);
    });

    it("no lanza excepción si el archivo local a eliminar no existe (resiliencia ENOENT)", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await expect(
        deleteFile("/uploads/non-existent-image.webp", testUploadsDir),
      ).resolves.not.toThrow();

      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain("[FileStorage Warning]");
    });

    it("ignora y no intenta eliminar archivos que no terminen en .webp (placeholders / externos)", async () => {
      const placeholderFile = path.join(testUploadsDir, "placeholder.png");
      await fs.writeFile(placeholderFile, Buffer.from("keep-me"));

      await deleteFile("/images/placeholder.png", testUploadsDir);
      await deleteFile("https://external-cdn.com/avatar.jpg", testUploadsDir);
      await deleteFile("", testUploadsDir);

      expect(
        await fs
          .access(placeholderFile)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);
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
