import { describe, it, expect, vi, afterAll } from "vitest";
import request from "supertest";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { app } from "../src/app.js";
import { authService } from "../src/services/auth.service.js";
import { deleteFile, DEFAULT_UPLOADS_DIR } from "../src/services/file-storage.service.js";
import * as fileStorage from "../src/services/file-storage.service.js";

describe("Suite de Integración: Tubería Paranoica CDR y Uploads (server/tests/cdr-upload.test.ts) — Tarea 4.5 & Fase 11", () => {
  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@test.com",
    role: "admin",
  };
  const sessionCookie = `session=${authService.generateToken(adminPayload)}`;
  const createdImages: string[] = [];

  afterAll(async () => {
    vi.restoreAllMocks();
    for (const imgUrl of createdImages) {
      await deleteFile(imgUrl);
    }
  });

  it("1. Rechaza archivos que excedan el límite de 5 MB antes de procesar con Sharp (400 Bad Request)", async () => {
    const giantBuffer = Buffer.alloc(5 * 1024 * 1024 + 10240);

    const res = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [sessionCookie])
      .attach("file", giantBuffer, "archivo-gigante.jpg");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("El archivo excede el tamaño máximo permitido de 5 MB");
  });

  it("2. Rechaza archivos con extensiones no autorizadas (.exe, .svg, .pdf) con 400 Bad Request", async () => {
    const svgRes = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [sessionCookie])
      .attach("file", Buffer.from("<svg><rect width='100' height='100'/></svg>"), "dibujo.svg");

    expect(svgRes.status).toBe(400);
    expect(svgRes.body.error).toContain(
      "Solo se permiten imágenes en formato .jpg, .jpeg, .png o .webp",
    );

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

  it("5. Procesa exitosamente un JPEG válido, redimensiona a <= 1080x1080, despoja EXIF y lo transmite a Cloudinary", async () => {
    const fakeCloudinaryUrl =
      "https://res.cloudinary.com/test-cloud/image/upload/v12345/products/inyector-diesel-bosch.webp";

    let streamedBuffer: Buffer | null = null;
    const uploadSpy = vi
      .spyOn(fileStorage, "uploadStreamToCloudinary")
      .mockImplementation(async (buffer: Buffer) => {
        streamedBuffer = buffer;
        return fakeCloudinaryUrl;
      });

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
    expect(uploadRes.body.imageUrl).toBe(fakeCloudinaryUrl);

    // Inspeccionar el buffer transmitido por stream
    expect(streamedBuffer).not.toBeNull();
    const meta = await sharp(streamedBuffer!).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(608);
    expect(meta.exif).toBeUndefined();

    uploadSpy.mockRestore();
  });

  it("6. Sirve archivos estáticos legacy vía HTTP /uploads/* inyectando cabeceras nosniff y cross-origin", async () => {
    const filename = "test-legacy-static.webp";
    const filePath = path.join(DEFAULT_UPLOADS_DIR, filename);
    await fs.mkdir(DEFAULT_UPLOADS_DIR, { recursive: true });
    await fs.writeFile(filePath, Buffer.from("dummy-data"));
    createdImages.push(`/uploads/${filename}`);

    const staticRes = await request(app).get(`/uploads/${filename}`);

    expect(staticRes.status).toBe(200);
    expect(staticRes.headers["x-content-type-options"]).toBe("nosniff");
    expect(staticRes.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });
});
