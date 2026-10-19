import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { authService } from "../src/services/auth.service.js";
import { resetDatabase } from "./helpers/reset-db.js";

describe("CRUD de Categorías y Subcategorías con Límite de 1 Nivel (/api/categories) — Tarea 5.2", () => {
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

  describe("GET /api/categories", () => {
    it("permite acceso público y lista categorías con jerarquía", async () => {
      const root = await prisma.category.create({ data: { name: "Inyectores" } });
      await prisma.category.create({ data: { name: "Toberas", parentId: root.id } });

      const res = await request(app).get("/api/categories");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);

      const rootFound = res.body.find((c: any) => c.name === "Inyectores");
      expect(rootFound.parentId).toBeNull();
      expect(rootFound.children.length).toBe(1);
      expect(rootFound.children[0].name).toBe("Toberas");
    });
  });

  describe("POST /api/categories", () => {
    it("rechaza peticiones sin autenticación con 401", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Bombas" });

      expect(res.status).toBe(401);
    });

    it("rechaza peticiones sin encabezado anti-CSRF con 403", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", [adminCookie])
        .send({ name: "Bombas" });

      expect(res.status).toBe(403);
    });

    it("rechaza payloads con campos desconocidos (.strict()) con 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Bombas", unexpected: true });

      expect(res.status).toBe(400);
    });

    it("rechaza nombres duplicados insensible a mayúsculas con 409 Conflict", async () => {
      await prisma.category.create({ data: { name: "Inyectores" } });

      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "  iNyEcToReS  " });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("Ya existe una categoría con el nombre");
    });

    it("crea exitosamente una categoría raíz (parentId === null)", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Turbocompresores" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Turbocompresores");
      expect(res.body.parentId).toBeNull();
    });

    it("crea exitosamente una subcategoría de 1er nivel asignando un parentId raíz", async () => {
      const root = await prisma.category.create({ data: { name: "Bombas" } });

      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Bombas Common Rail", parentId: root.id });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Bombas Common Rail");
      expect(res.body.parentId).toBe(root.id);
    });

    it("rechaza la creación de una subcategoría bajo otra subcategoría (bloquea > 1 nivel con 400)", async () => {
      const root = await prisma.category.create({ data: { name: "Sistemas" } });
      const sub = await prisma.category.create({
        data: { name: "Inyección Diésel", parentId: root.id },
      });

      // Intento de crear nivel 2 (subcategoría de subcategoría)
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Nivel 2 Prohibido", parentId: sub.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Límite de jerarquía excedido");
    });
  });

  describe("PUT /api/categories/:id", () => {
    it("previene auto-asignación devolviendo 400 Bad Request si parentId === id", async () => {
      const cat = await prisma.category.create({ data: { name: "Sensores" } });

      const res = await request(app)
        .put(`/api/categories/${cat.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Sensores", parentId: cat.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("no puede asignarse como padre de sí misma");
    });

    it("bloquea asignar un padre si la categoría ya posee subcategorías hijas (400 Bad Request)", async () => {
      const root1 = await prisma.category.create({ data: { name: "Inyectores" } });
      await prisma.category.create({ data: { name: "Toberas", parentId: root1.id } });
      const root2 = await prisma.category.create({ data: { name: "Repuestos Generales" } });

      // Intentar convertir root1 (que ya tiene hijas) en subcategoría de root2
      const res = await request(app)
        .put(`/api/categories/${root1.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Inyectores", parentId: root2.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("ya posee subcategorías hijas");
    });

    it("actualiza exitosamente una categoría (200 OK)", async () => {
      const cat = await prisma.category.create({ data: { name: "Valvulas" } });

      const res = await request(app)
        .put(`/api/categories/${cat.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Válvulas SCV" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Válvulas SCV");
    });
  });

  describe("DELETE /api/categories/:id (onDelete: Restrict)", () => {
    it("bloquea con 409 Conflict si la categoría contiene subcategorías hijas", async () => {
      const root = await prisma.category.create({ data: { name: "Inyectores" } });
      await prisma.category.create({ data: { name: "Toberas", parentId: root.id } });

      const res = await request(app)
        .delete(`/api/categories/${root.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("contiene subcategorías asociadas");
    });

    it("bloquea con 409 Conflict si la categoría tiene productos vinculados en ProductCategory", async () => {
      const brand = await prisma.brand.create({ data: { name: "Bosch" } });
      const cat = await prisma.category.create({ data: { name: "Inyectores Piezo" } });
      const product = await prisma.product.create({
        data: {
          name: "Inyector Bosch 0445115",
          description: "Inyector piezoeléctrico",
          imageUrl: "/uploads/mock-piezo.webp",
          brandId: brand.id,
          condition: "Nuevo",
          price: 500000,
          showPrice: true,
          visible: true,
        },
      });

      // Vincular producto con la categoría en tabla pivote
      await prisma.productCategory.create({
        data: {
          productId: product.id,
          categoryId: cat.id,
        },
      });

      const res = await request(app)
        .delete(`/api/categories/${cat.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("tiene productos vinculados");
    });

    it("elimina exitosamente una categoría huérfana sin hijas ni productos (200 OK)", async () => {
      const cat = await prisma.category.create({ data: { name: "Categoría Vacía" } });

      const res = await request(app)
        .delete(`/api/categories/${cat.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const inDb = await prisma.category.findUnique({ where: { id: cat.id } });
      expect(inDb).toBeNull();
    });
  });
});
