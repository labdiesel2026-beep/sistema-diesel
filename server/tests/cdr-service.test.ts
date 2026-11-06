import { describe, it, expect, vi } from "vitest";
import sharp from "sharp";
import {
  processImageUpload,
  sanitizeImageBuffer,
  validateImageMagicBytes,
  inspectImageDimensions,
  reconstructToWebp,
  ValidationError,
  MAX_DIMENSION_PX,
  TARGET_MAX_WIDTH,
  TARGET_MAX_HEIGHT,
} from "../src/services/cdr.service.js";
import * as fileStorage from "../src/services/file-storage.service.js";

describe("Servicio de Tubería CDR con Sharp y Cloudinary (Fase 11)", () => {
  describe("Fase 1: Validación de Magic Bytes (file-type)", () => {
    it("acepta buffers con Magic Bytes legítimos de JPEG, PNG y WebP", async () => {
      const jpegBuffer = await sharp({
        create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
      })
        .jpeg()
        .toBuffer();

      const pngBuffer = await sharp({
        create: { width: 100, height: 100, channels: 3, background: { r: 0, g: 255, b: 0 } },
      })
        .png()
        .toBuffer();

      const webpBuffer = await sharp({
        create: { width: 100, height: 100, channels: 3, background: { r: 0, g: 0, b: 255 } },
      })
        .webp()
        .toBuffer();

      await expect(validateImageMagicBytes(jpegBuffer)).resolves.toBe("image/jpeg");
      await expect(validateImageMagicBytes(pngBuffer)).resolves.toBe("image/png");
      await expect(validateImageMagicBytes(webpBuffer)).resolves.toBe("image/webp");
    });

    it("rechaza archivos con contenido falso o no-imagen (Magic Bytes inválidos)", async () => {
      const fakeBuffer = Buffer.from("ESTO ES UN ARCHIVO DE TEXTO DISFRAZADO DE IMAGEN");

      await expect(validateImageMagicBytes(fakeBuffer)).rejects.toThrow(ValidationError);
      await expect(validateImageMagicBytes(fakeBuffer)).rejects.toThrow(
        /no corresponde a una imagen válida/i,
      );
    });
  });

  describe("Fase 2: Pre-inspección de Metadatos Anti Pixel Flood / Bomba de Descompresión", () => {
    it("permite imágenes con dimensiones dentro de la cota de seguridad (<= 4096px)", async () => {
      const normalBuffer = await sharp({
        create: { width: 800, height: 600, channels: 3, background: { r: 128, g: 128, b: 128 } },
      })
        .png()
        .toBuffer();

      const imageInstance = sharp(normalBuffer);
      const dimensions = await inspectImageDimensions(imageInstance);

      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(600);
    });

    it("bloquea y arroja ValidationError ante imágenes que superen 4096px en ancho", async () => {
      const wideBuffer = await sharp({
        create: {
          width: MAX_DIMENSION_PX + 1,
          height: 50,
          channels: 3,
          background: { r: 255, g: 255, b: 0 },
        },
      })
        .png()
        .toBuffer();

      const imageInstance = sharp(wideBuffer);
      await expect(inspectImageDimensions(imageInstance)).rejects.toThrow(ValidationError);
      await expect(inspectImageDimensions(imageInstance)).rejects.toThrow(
        /Dimensiones de imagen excesivas/i,
      );
    });

    it("bloquea y arroja ValidationError ante imágenes que superen 4096px en alto", async () => {
      const tallBuffer = await sharp({
        create: {
          width: 50,
          height: MAX_DIMENSION_PX + 1,
          channels: 3,
          background: { r: 255, g: 255, b: 0 },
        },
      })
        .png()
        .toBuffer();

      const imageInstance = sharp(tallBuffer);
      await expect(inspectImageDimensions(imageInstance)).rejects.toThrow(ValidationError);
      await expect(inspectImageDimensions(imageInstance)).rejects.toThrow(
        /Dimensiones de imagen excesivas/i,
      );
    });
  });

  describe("Fase 3: Desarme, Redimensionamiento y Reconstrucción a WebP", () => {
    it("redimensiona imágenes mayores a 1080x1080 preservando relación de aspecto (fit: inside)", async () => {
      const largeBuffer = await sharp({
        create: { width: 2000, height: 1000, channels: 3, background: { r: 100, g: 150, b: 200 } },
      })
        .jpeg()
        .toBuffer();

      const imageInstance = sharp(largeBuffer);
      const reconstructedBuffer = await reconstructToWebp(imageInstance);

      const metadata = await sharp(reconstructedBuffer).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBe(TARGET_MAX_WIDTH);
      expect(metadata.height).toBe(540);
      expect(metadata.exif).toBeUndefined();
    });

    it("no amplía imágenes cuyas dimensiones sean inferiores a 1080x1080 (withoutEnlargement: true)", async () => {
      const smallBuffer = await sharp({
        create: { width: 300, height: 200, channels: 3, background: { r: 50, g: 50, b: 50 } },
      })
        .png()
        .toBuffer();

      const imageInstance = sharp(smallBuffer);
      const reconstructedBuffer = await reconstructToWebp(imageInstance);

      const metadata = await sharp(reconstructedBuffer).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBe(300);
      expect(metadata.height).toBe(200);
    });
  });

  describe("Fase 4: Tubería Completa (sanitizeImageBuffer y processImageUpload)", () => {
    it("sanitizeImageBuffer devuelve un buffer WebP sanitizado sin metadatos EXIF", async () => {
      const validBuffer = await sharp({
        create: { width: 640, height: 480, channels: 3, background: { r: 200, g: 50, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const sanitized = await sanitizeImageBuffer(validBuffer);
      expect(Buffer.isBuffer(sanitized)).toBe(true);

      const meta = await sharp(sanitized).metadata();
      expect(meta.format).toBe("webp");
      expect(meta.width).toBe(640);
      expect(meta.height).toBe(480);
      expect(meta.exif).toBeUndefined();
    });

    it("processImageUpload sanitiza el buffer y lo transmite a Cloudinary retornando la secure_url", async () => {
      const fakeCloudinaryUrl =
        "https://res.cloudinary.com/test-cloud/image/upload/v12345/products/injector.webp";

      const uploadSpy = vi
        .spyOn(fileStorage, "uploadStreamToCloudinary")
        .mockResolvedValue(fakeCloudinaryUrl);

      const validBuffer = await sharp({
        create: { width: 640, height: 480, channels: 3, background: { r: 200, g: 50, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const resultUrl = await processImageUpload(validBuffer, "products");

      expect(resultUrl).toBe(fakeCloudinaryUrl);
      expect(uploadSpy).toHaveBeenCalledWith(expect.any(Buffer), "products");

      uploadSpy.mockRestore();
    });

    it("aborta la tubería antes del almacenamiento si Magic Bytes son inválidos", async () => {
      const uploadSpy = vi.spyOn(fileStorage, "uploadStreamToCloudinary");
      const maliciousBuffer = Buffer.from("<?php echo 'malware'; ?>");

      await expect(processImageUpload(maliciousBuffer)).rejects.toThrow(ValidationError);
      expect(uploadSpy).not.toHaveBeenCalled();

      uploadSpy.mockRestore();
    });

    it("aborta la tubería antes del almacenamiento ante intento de Pixel Flood", async () => {
      const uploadSpy = vi.spyOn(fileStorage, "uploadStreamToCloudinary");
      const bombBuffer = await sharp({
        create: { width: 5000, height: 100, channels: 3, background: { r: 0, g: 0, b: 0 } },
      })
        .png()
        .toBuffer();

      await expect(processImageUpload(bombBuffer)).rejects.toThrow(ValidationError);
      await expect(processImageUpload(bombBuffer)).rejects.toThrow(
        /Dimensiones de imagen excesivas/i,
      );
      expect(uploadSpy).not.toHaveBeenCalled();

      uploadSpy.mockRestore();
    });
  });
});
