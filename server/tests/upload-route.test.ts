import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { app } from "../src/app.js";
import { authService } from "../src/services/auth.service.js";
import { deleteFile, DEFAULT_UPLOADS_DIR } from "../src/services/file-storage.service.js";

describe("Controlador de Subidas, Ruta y Servicio Estático Blindado (Tarea 4.4)", () => {
  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@test.com",
    role: "admin",
  };
  const validToken = authService.generateToken(adminPayload);
  const createdImages: string[] = [];

  afterAll(async () => {
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

  it("procesa una imagen válida JPEG, retorna 201 Created con { imageUrl } y la sirve estáticamente con cabeceras nosniff y cross-origin", async () => {
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
    expect(uploadRes.body.imageUrl).toMatch(/^\/uploads\/[0-9a-f-]+\.webp$/i);

    const imageUrl = uploadRes.body.imageUrl;
    createdImages.push(imageUrl);

    // Verificar que el archivo en disco existe físicamente
    const diskPath = path.join(DEFAULT_UPLOADS_DIR, path.basename(imageUrl));
    const exists = await fs.access(diskPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    // Probar el servicio estático HTTP GET /uploads/<uuid>.webp
    const staticRes = await request(app).get(imageUrl);

    expect(staticRes.status).toBe(200);
    expect(staticRes.headers["content-type"]).toContain("image/webp");
    expect(staticRes.headers["x-content-type-options"]).toBe("nosniff");
    expect(staticRes.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });
});
