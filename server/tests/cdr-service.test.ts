import { describe, it, expect, afterAll } from "vitest";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import {
  processImageUpload,
  validateImageMagicBytes,
  inspectImageDimensions,
  reconstructToWebp,
  ValidationError,
  MAX_DIMENSION_PX,
  TARGET_MAX_WIDTH,
  TARGET_MAX_HEIGHT,
} from "../src/services/cdr.service.js";

describe("Servicio de Tubería CDR con Sharp y Prevención de Pixel Flood (Tarea 4.2)", () => {
  const testUploadsDir = path.resolve(process.cwd(), "test-uploads-cdr");

  afterAll(async () => {
    // Limpieza del directorio temporal de pruebas
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
    } catch {
      // Ignorar errores en limpieza
    }
  });

  describe("Fase 1: Validación de Magic Bytes (file-type)", () => {
    it("acepta buffers con Magic Bytes legítimos de JPEG, PNG y WebP", async () => {
      // Crear buffers reales en memoria con sharp
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
      // Generar imagen de 4097 x 50 px (excede MAX_DIMENSION_PX en ancho)
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
      // Generar imagen de 50 x 4097 px (excede MAX_DIMENSION_PX en alto)
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

  describe("Fase 3: Desarme, Redimensionamiento y Reconstrucción Segura (WebP + Strip EXIF)", () => {
    it("redimensiona imágenes mayores a 1080px a un máximo de 1080x1080 manteniendo relación de aspecto", async () => {
      // Imagen 2000 x 1000 px
      const largeBuffer = await sharp({
        create: { width: 2000, height: 1000, channels: 3, background: { r: 50, g: 100, b: 150 } },
      })
        .jpeg()
        .toBuffer();

      const imageInstance = sharp(largeBuffer);
      const reconstructedBuffer = await reconstructToWebp(imageInstance);

      const metadata = await sharp(reconstructedBuffer).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBe(TARGET_MAX_WIDTH);
      expect(metadata.height).toBe(540); // 2000:1000 -> 1080:540
      expect(metadata.exif).toBeUndefined(); // EXIF despojado
    });

    it("no amplía imágenes menores a 1080px (withoutEnlargement: true)", async () => {
      // Imagen pequeña de 300 x 200 px
      const smallBuffer = await sharp({
        create: { width: 300, height: 200, channels: 3, background: { r: 50, g: 100, b: 150 } },
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

  describe("Fase 4: Tubería Completa (processImageUpload)", () => {
    it("procesa una imagen válida JPEG, la guarda en disco como WebP con UUID y devuelve la ruta /uploads/<uuid>.webp", async () => {
      const validBuffer = await sharp({
        create: { width: 640, height: 480, channels: 3, background: { r: 200, g: 50, b: 100 } },
      })
        .jpeg()
        .toBuffer();

      const publicPath = await processImageUpload(validBuffer, testUploadsDir);

      // Comprobar formato de retorno /uploads/<uuid>.webp
      expect(publicPath).toMatch(
        /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i,
      );

      // Comprobar que el archivo se persistió físicamente en el directorio configurado
      const filename = path.basename(publicPath);
      const diskFilePath = path.join(testUploadsDir, filename);
      const fileExists = await fs
        .access(diskFilePath)
        .then(() => true)
        .catch(() => false);

      expect(fileExists).toBe(true);

      // Verificar que el archivo en disco es un WebP sanitizado
      const diskMetadata = await sharp(diskFilePath).metadata();
      expect(diskMetadata.format).toBe("webp");
      expect(diskMetadata.width).toBe(640);
      expect(diskMetadata.height).toBe(480);
      expect(diskMetadata.exif).toBeUndefined();
    });

    it("aborta la tubería y no escribe ningún archivo en disco si Magic Bytes son inválidos", async () => {
      const maliciousBuffer = Buffer.from("<?php echo 'malware'; ?>");

      await expect(processImageUpload(maliciousBuffer, testUploadsDir)).rejects.toThrow(
        ValidationError,
      );

      // Verificar que ningún archivo con extensión .php o similar se escribió
      const files = await fs.readdir(testUploadsDir).catch(() => []);
      expect(files.some((f) => f.endsWith(".php"))).toBe(false);
    });

    it("aborta la tubería y no escribe en disco ante intento de Pixel Flood", async () => {
      const bombBuffer = await sharp({
        create: { width: 5000, height: 100, channels: 3, background: { r: 0, g: 0, b: 0 } },
      })
        .png()
        .toBuffer();

      await expect(processImageUpload(bombBuffer, testUploadsDir)).rejects.toThrow(ValidationError);
      await expect(processImageUpload(bombBuffer, testUploadsDir)).rejects.toThrow(
        /Dimensiones de imagen excesivas/i,
      );
    });
  });
});
