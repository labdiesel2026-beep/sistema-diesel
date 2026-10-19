import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { uploadSingleImage } from "../src/middleware/upload.middleware.js";

describe("Middleware Multer en Memoria RAM y Whitelist de Extensiones (Tarea 4.1)", () => {
  const setupApp = () => {
    const app = express();
    app.post("/test-upload", uploadSingleImage, (req, res) => {
      res.status(200).json({
        success: true,
        filename: req.file?.originalname,
        size: req.file?.size,
        bufferAvailable: Buffer.isBuffer(req.file?.buffer),
      });
    });
    return app;
  };

  it("rechaza peticiones sin archivo en el campo 'file' retornando 400 Bad Request", async () => {
    const app = setupApp();
    const res = await request(app).post("/test-upload");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("No se proporcionó ningún archivo");
  });

  it("rechaza archivos con extensiones no permitidas (.exe, .pdf, .svg) retornando 400 Bad Request", async () => {
    const app = setupApp();

    // 1. Archivo .exe
    const exeRes = await request(app)
      .post("/test-upload")
      .attach("file", Buffer.from("MZ dummy executable"), "malware.exe");

    expect(exeRes.status).toBe(400);
    expect(exeRes.body.error).toContain("Solo se permiten imágenes");

    // 2. Archivo .pdf
    const pdfRes = await request(app)
      .post("/test-upload")
      .attach("file", Buffer.from("%PDF- dummy content"), "document.pdf");

    expect(pdfRes.status).toBe(400);
    expect(pdfRes.body.error).toContain("Solo se permiten imágenes");

    // 3. Archivo .svg (vectorial con riesgo de XSS)
    const svgRes = await request(app)
      .post("/test-upload")
      .attach("file", Buffer.from("<svg></svg>"), "vector.svg");

    expect(svgRes.status).toBe(400);
    expect(svgRes.body.error).toContain("Solo se permiten imágenes");
  });

  it("rechaza archivos que exceden el límite de 5 MB retornando 400 Bad Request", async () => {
    const app = setupApp();
    // 5 MB + 1 KB = 5243904 bytes
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024);

    const res = await request(app)
      .post("/test-upload")
      .attach("file", largeBuffer, "large-image.jpg");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El archivo excede el tamaño máximo permitido de 5 MB");
  });

  it("acepta imágenes válidas (.jpg, .jpeg, .png, .webp) <= 5 MB y las mantiene en RAM", async () => {
    const app = setupApp();
    const smallBuffer = Buffer.from("dummy-image-bytes");

    for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
      const res = await request(app)
        .post("/test-upload")
        .attach("file", smallBuffer, `test-image${ext}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.filename).toBe(`test-image${ext}`);
      expect(res.body.bufferAvailable).toBe(true);
    }
  });
});
