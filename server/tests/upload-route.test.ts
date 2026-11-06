import { describe, it, expect, vi, afterAll } from "vitest";
import request from "supertest";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { app } from "../src/app.js";
import { authService } from "../src/services/auth.service.js";
import { deleteFile, DEFAULT_UPLOADS_DIR } from "../src/services/file-storage.service.js";
import * as fileStorage from "../src/services/file-storage.service.js";

describe("Controlador de Subidas, Ruta y Migración a Cloudinary (Tarea 4.4 & Fase 11)", () => {
  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@test.com",
    role: "admin",
  };
  const validToken = authService.generateToken(adminPayload);
  const createdImages: string[] = [];

  afterAll(async () => {
    vi.restoreAllMocks();
    for (const imgUrl of createdImages) {
      await deleteFile(imgUrl);
    }
  });

  it("rechaza peticiones a POST /api/uploads/product-image sin cookie de autenticación retornando 401", async () => {
    const res = await request(app).post("/api/uploads/product-image");
    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Sesión no válida o expirada");
  });

  it("rechaza peticiones de administrador autenticado si no se envía ningún archivo en 'file'", async () => {
    const res = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [`session=${validToken}`]);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("No se proporcionó ningún archivo");
  });

  it("procesa una imagen válida JPEG, invoca Cloudinary upload stream y retorna 201 Created con secure_url", async () => {
    const fakeSecureUrl =
      "https://res.cloudinary.com/test-cloud/image/upload/v12345/products/componente-diesel.webp";

    const uploadSpy = vi
      .spyOn(fileStorage, "uploadStreamToCloudinary")
      .mockResolvedValue(fakeSecureUrl);

    const sampleJpeg = await sharp({
      create: { width: 400, height: 300, channels: 3, background: { r: 10, g: 150, b: 200 } },
    })
      .jpeg()
      .toBuffer();

    const uploadRes = await request(app)
      .post("/api/uploads/product-image")
      .set("Cookie", [`session=${validToken}`])
      .attach("file", sampleJpeg, "componente-diesel.jpg");

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body).toHaveProperty("imageUrl");
    expect(uploadRes.body.imageUrl).toBe(fakeSecureUrl);
    expect(uploadSpy).toHaveBeenCalledWith(expect.any(Buffer), "products");

    uploadSpy.mockRestore();
  });

  it("sirve archivos legacy locales vía HTTP /uploads/* inyectando cabeceras nosniff y cross-origin", async () => {
    const legacyFilename = "legacy-test-image.webp";
    const legacyPath = path.join(DEFAULT_UPLOADS_DIR, legacyFilename);
    await fs.mkdir(DEFAULT_UPLOADS_DIR, { recursive: true });
    await fs.writeFile(legacyPath, Buffer.from("dummy-legacy-content"));
    createdImages.push(`/uploads/${legacyFilename}`);

    const staticRes = await request(app).get(`/uploads/${legacyFilename}`);

    expect(staticRes.status).toBe(200);
    expect(staticRes.headers["x-content-type-options"]).toBe("nosniff");
    expect(staticRes.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });
});
