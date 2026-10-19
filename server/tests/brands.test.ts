import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { authService } from "../src/services/auth.service.js";
import { resetDatabase } from "./helpers/reset-db.js";

describe("CRUD de Marcas con Integridad Referencial (/api/brands) — Tarea 5.1", () => {
  let adminCookie: string;
  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@laboratoriodiesel.com",
    role: "admin",
  };

  beforeEach(async () => {
    await resetDatabase();
    adminCookie = `session=${authService.generateToken(adminPayload)}`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/brands", () => {
    it("permite acceso público y retorna marcas ordenadas alfabéticamente", async () => {
      // Crear marcas de prueba
      await prisma.brand.createMany({
        data: [{ name: "Denso" }, { name: "Bosch" }, { name: "Delphi" }],
      });

      const res = await request(app).get("/api/brands");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
      expect(res.body[0].name).toBe("Bosch");
      expect(res.body[1].name).toBe("Delphi");
      expect(res.body[2].name).toBe("Denso");
    });
  });

  describe("POST /api/brands", () => {
    it("rechaza peticiones sin autenticación (401)", async () => {
      const res = await request(app)
        .post("/api/brands")
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Siemens" });

      expect(res.status).toBe(401);
    });

    it("rechaza peticiones sin cabecera anti-CSRF (403)", async () => {
      const res = await request(app)
        .post("/api/brands")
        .set("Cookie", [adminCookie])
        .send({ name: "Siemens" });

      expect(res.status).toBe(403);
    });

    it("rechaza payloads con campos desconocidos (.strict()) con 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/brands")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Siemens", extraField: "malicious" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Datos de validación inválidos");
    });

    it("rechaza nombres de menos de 2 caracteres con 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/brands")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "A" });

      expect(res.status).toBe(400);
    });

    it("rechaza la creación de una marca existente con colisión case-insensitive (409 Conflict)", async () => {
      await prisma.brand.create({ data: { name: "Bosch" } });

      const res = await request(app)
        .post("/api/brands")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "  bOsCh  " }); // Variación en mayúsculas y espacios

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("Ya existe una marca con el nombre");
    });

    it("crea exitosamente una marca válida con 201 Created", async () => {
      const res = await request(app)
        .post("/api/brands")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Continental" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Continental");

      const inDb = await prisma.brand.findUnique({ where: { id: res.body.id } });
      expect(inDb).not.toBeNull();
      expect(inDb?.name).toBe("Continental");
    });
  });

  describe("PUT /api/brands/:id", () => {
    it("rechaza actualización si el nuevo nombre colisiona con otra marca existente (409 Conflict)", async () => {
      const brand1 = await prisma.brand.create({ data: { name: "Bosch" } });
      const brand2 = await prisma.brand.create({ data: { name: "Delphi" } });

      const res = await request(app)
        .put(`/api/brands/${brand2.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "bosch" });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("Ya existe otra marca con el nombre");
    });

    it("actualiza exitosamente el nombre de la marca (200 OK)", async () => {
      const brand = await prisma.brand.create({ data: { name: "Delphi" } });

      const res = await request(app)
        .put(`/api/brands/${brand.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Delphi Technologies" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Delphi Technologies");

      const updated = await prisma.brand.findUnique({ where: { id: brand.id } });
      expect(updated?.name).toBe("Delphi Technologies");
    });
  });

  describe("DELETE /api/brands/:id (onDelete: Restrict)", () => {
    it("bloquea con 409 Conflict el borrado de una marca que tiene productos vinculados", async () => {
      const brand = await prisma.brand.create({ data: { name: "Bosch" } });

      // Crear un producto asociado a la marca
      await prisma.product.create({
        data: {
          name: "Inyector Common Rail Bosch 0445110",
          description: "Inyector diésel de alta precisión",
          imageUrl: "/uploads/mock-injector.webp",
          brandId: brand.id,
          condition: "Nuevo",
          price: 450000,
          showPrice: true,
          visible: true,
          oem: "0445110001",
        },
      });

      const res = await request(app)
        .delete(`/api/brands/${brand.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("No se puede eliminar la marca porque tiene productos vinculados");

      // Verificar que la marca sigue existiendo en la base de datos
      const stillExists = await prisma.brand.findUnique({ where: { id: brand.id } });
      expect(stillExists).not.toBeNull();
    });

    it("retorna 404 Not Found si se intenta eliminar una marca inexistente", async () => {
      const nonExistentUuid = "00000000-0000-4000-a000-000000000999";

      const res = await request(app)
        .delete(`/api/brands/${nonExistentUuid}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Marca no encontrada");
    });

    it("elimina exitosamente una marca sin productos vinculados (200 OK)", async () => {
      const brand = await prisma.brand.create({ data: { name: "Marca Huérfana" } });

      const res = await request(app)
        .delete(`/api/brands/${brand.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await prisma.brand.findUnique({ where: { id: brand.id } });
      expect(deleted).toBeNull();
    });
  });
});
