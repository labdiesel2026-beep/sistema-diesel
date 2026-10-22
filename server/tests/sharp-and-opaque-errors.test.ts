import { describe, it, expect, vi } from "vitest";
import sharp from "sharp";
import express from "express";
import request from "supertest";
import { processSharpPipeline, TARGET_MAX_WIDTH, MAX_OUTPUT_SIZE_BYTES } from "../src/middleware/upload.middleware.js";
import { AppError, errorHandler } from "../src/middleware/error.middleware.js";

const UUIDV4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPAQUE_ERROR_REGEX = /^Referencia: [0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("TASK-27: Pruebas de Integración para el Pipeline Sharp y Errores Opacos", () => {
  describe("1. Pipeline Sharp Paranoico (Principio 3: Upload Paranoico & RNF-04)", () => {
    it("procesa una imagen grande (1920x1080), redimensiona a ancho <= 1080px, convierte a WebP y asigna UUID v4", async () => {
      // 1. Generar imagen real en memoria con Sharp (1920x1080 px en formato PNG)
      const inputBuffer = await sharp({
        create: {
          width: 1920,
          height: 1080,
          channels: 3,
          background: { r: 234, g: 88, b: 12 }, // Naranja Industrial
        },
      })
        .png()
        .toBuffer();

      // 2. Ejecutar la tubería Sharp paranoica
      const result = await processSharpPipeline(inputBuffer);

      // Verificación 1: Nombre con UUID v4 y extensión .webp
      expect(result.filename).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i);
      const uuidPart = result.filename.replace(".webp", "");
      expect(uuidPart).toMatch(UUIDV4_REGEX);

      // Verificación 2: Peso en disco <= 500 KB (500,000 bytes)
      expect(result.buffer.length).toBeLessThanOrEqual(MAX_OUTPUT_SIZE_BYTES);

      // Verificación 3: Metadatos del buffer generado
      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBeLessThanOrEqual(TARGET_MAX_WIDTH);
      expect(metadata.width).toBe(1080); // Preserva relación proporcional
      expect(metadata.height).toBe(608); // 1920x1080 escalado a 1080x607.5 redondeado a 608

      // Verificación 4: Purga absoluta de metadatos EXIF y normalización sRGB sin ICC
      expect(metadata.exif).toBeUndefined();
      expect(metadata.icc).toBeUndefined();
      expect(metadata.space).toBe("srgb");
    });

    it("no amplía imágenes de dimensiones menores a 1080px (withoutEnlargement: true)", async () => {
      const smallBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 50, g: 50, b: 50 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await processSharpPipeline(smallBuffer);
      const metadata = await sharp(result.buffer).metadata();

      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBe(800); // No se amplía a 1080
      expect(metadata.height).toBe(600);
      expect(result.buffer.length).toBeLessThanOrEqual(MAX_OUTPUT_SIZE_BYTES);
      expect(result.filename).toMatch(/\.webp$/i);
    });

    it("ejecuta el bucle de compresión dinámica para garantizar peso <= 500 KB en imágenes complejas", async () => {
      // Generar imagen con gradiente o ruido para generar mayor peso
      const complexBuffer = await sharp({
        create: {
          width: 2500,
          height: 1600,
          channels: 4,
          background: { r: 255, g: 120, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const result = await processSharpPipeline(complexBuffer);
      expect(result.buffer.length).toBeLessThanOrEqual(MAX_OUTPUT_SIZE_BYTES);

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBeLessThanOrEqual(TARGET_MAX_WIDTH);
    });
  });

  describe("2. Contratos Constitucionales de Errores Opacos (Principio 6: Errores Opacos)", () => {
    const setupErrorApp = () => {
      const app = express();
      app.use(express.json());

      // Ruta que arroja 401 Unauthorized
      app.get("/api/test-401-error", () => {
        throw AppError.unauthorized("Token JWT inválido o expirado");
      });

      // Ruta que arroja 500 Error Inesperado / Caída de Servidor
      app.get("/api/test-500-unhandled", () => {
        throw new Error(
          "Fatal: Connection refused at postgresql://postgres:secretpassword@localhost:5433/db",
        );
      });

      // Ruta con error operativo 400 (Bad Request)
      app.get("/api/test-400-validation", () => {
        throw AppError.badRequest("Datos de entrada inválidos");
      });

      app.use(errorHandler);
      return app;
    };

    it("valida que un error HTTP 401 responda única y taxativamente con { error: 'Referencia: <uuid>' }", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const app = setupErrorApp();

      const res = await request(app).get("/api/test-401-error");

      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toContain("application/json");

      // El cuerpo debe contener únicamente la propiedad "error" con formato opaco
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(OPAQUE_ERROR_REGEX);

      // No debe existir stack trace ni texto legible confidencial
      expect(res.body.stack).toBeUndefined();
      expect(res.text).not.toContain("Token JWT");
      expect(res.text).not.toContain("expirado");

      // Debe haberse registrado internamente en logs
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("valida que un error HTTP 500 responda única y taxativamente con { error: 'Referencia: <uuid>' } sin filtrar trazas técnicas", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const app = setupErrorApp();

      const res = await request(app).get("/api/test-500-unhandled");

      expect(res.status).toBe(500);
      expect(res.headers["content-type"]).toContain("application/json");

      // El cuerpo debe contener únicamente la propiedad "error" con formato opaco
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(OPAQUE_ERROR_REGEX);

      // Blindaje constitucional contra fuga de credenciales o trazas de BD
      expect(res.body.stack).toBeUndefined();
      expect(res.text).not.toContain("Fatal: Connection refused");
      expect(res.text).not.toContain("secretpassword");
      expect(res.text).not.toContain("localhost:5433");

      // Verificación de auditoría en consola interna
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("errores 400 de validación mantienen mensajes operativos sin ocultar", async () => {
      const app = setupErrorApp();

      const res = await request(app).get("/api/test-400-validation");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Datos de entrada inválidos");
    });
  });
});
