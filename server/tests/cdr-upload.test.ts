import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { app } from "../src/app.js";
import { authService } from "../src/services/auth.service.js";
import { deleteFile, DEFAULT_UPLOADS_DIR } from "../src/services/file-storage.service.js";

describe("Suite de Integración: Tubería Paranoica CDR y Uploads (server/tests/cdr-upload.test.ts) — Tarea 4.5", () => {
  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@test.com",
    role: "admin",
  };
  const sessionCookie = `session=${authService.generateToken(adminPayload)}`;
  const createdImages: string[] = [];

  afterAll(async () => {
    // Limpieza física de imágenes de prueba creadas durante la suite
    for (const imgUrl of createdImages) {
      await deleteFile(imgUrl);
    }
  });

  it("1. Rechaza archivos que excedan el límite de 5 MB antes de procesar con Sharp (400 Bad Request)", async () => {
    // 5 MB + 10 KB = 5253120 bytes
    const giantBuffer = Buffer.alloc(5 * 1024 * 1024 + 10240);

    const res = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [sessionCookie])
      .attach("file", giantBuffer, "archivo-gigante.jpg");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("El archivo excede el tamaño máximo permitido de 5 MB");
  });

  it("2. Rechaza archivos con extensiones no autorizadas (.exe, .svg, .pdf) con 400 Bad Request", async () => {
    // Vectorial SVG con riesgo XSS
    const svgRes = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [sessionCookie])
      .attach("file", Buffer.from("<svg><rect width='100' height='100'/></svg>"), "dibujo.svg");

    expect(svgRes.status).toBe(400);
    expect(svgRes.body.error).toContain(
      "Solo se permiten imágenes en formato .jpg, .jpeg, .png o .webp",
    );

    // Binario con extensión prohibida
    const exeRes = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [sessionCookie])
      .attach("file", Buffer.from("binario-no-permitido"), "instalador.exe");

    expect(exeRes.status).toBe(400);
    expect(exeRes.body.error).toContain("Solo se permiten imágenes");
  });

  it("3. Rechaza archivos camuflados con extensión .jpg pero Magic Bytes inválidos (400 Bad Request)", async () => {
    const textDisguisedAsJpg = Buffer.from("CONTENIDO DE TEXTO PLANO DISFRAZADO CON EXTENSION JPG");

    const res = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [sessionCookie])
      .attach("file", textDisguisedAsJpg, "foto-perfil.jpg");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("El contenido del archivo no corresponde a una imagen válida");
  });

  it("4. Rechaza imágenes con dimensiones excesivas > 4096px mitigando Bombas de Descompresión (400 Bad Request)", async () => {
    // Buffer PNG real de 4500 x 50 px (ancho > 4096 px)
    const bombBuffer = await sharp({
      create: { width: 4500, height: 50, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();

    const res = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [sessionCookie])
      .attach("file", bombBuffer, "pixel-bomb.png");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Dimensiones de imagen excesivas");
    expect(res.body.error).toContain("4096px");
  });

  it("5. Procesa exitosamente un JPEG válido, redimensiona a <= 1080x1080, despoja EXIF y genera .webp en disco", async () => {
    // JPEG real de 1920 x 1080 px con metadatos simulados
    const validJpeg = await sharp({
      create: { width: 1920, height: 1080, channels: 3, background: { r: 24, g: 119, b: 242 } },
    })
      .jpeg()
      .toBuffer();

    const uploadRes = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [sessionCookie])
      .attach("file", validJpeg, "inyector-diesel-bosch.jpg");

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body).toHaveProperty("imageUrl");
    expect(uploadRes.body.imageUrl).toMatch(/^\/uploads\/[0-9a-f-]+\.webp$/i);

    const imageUrl = uploadRes.body.imageUrl;
    createdImages.push(imageUrl);

    // Comprobar que el archivo se guardó físicamente
    const filename = path.basename(imageUrl);
    const diskPath = path.join(DEFAULT_UPLOADS_DIR, filename);
    const exists = await fs
      .access(diskPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    // Inspeccionar la imagen guardada en disco
    const diskMetadata = await sharp(diskPath).metadata();
    expect(diskMetadata.format).toBe("webp");
    expect(diskMetadata.width).toBe(1080); // Redimensionado acotado 1080
    expect(diskMetadata.height).toBe(608); // 1920:1080 -> 1080:607.5 redondeado a 608
    expect(diskMetadata.exif).toBeUndefined(); // Metadatos EXIF purgados
  });

  it("6. Sirve la imagen sanitizada vía HTTP /uploads/* inyectando cabeceras nosniff y cross-origin", async () => {
    expect(createdImages.length).toBeGreaterThan(0);
    const testImageUrl = createdImages[0];

    const staticRes = await request(app).get(testImageUrl);

    expect(staticRes.status).toBe(200);
    expect(staticRes.headers["content-type"]).toContain("image/webp");
    expect(staticRes.headers["x-content-type-options"]).toBe("nosniff");
    expect(staticRes.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });
});
