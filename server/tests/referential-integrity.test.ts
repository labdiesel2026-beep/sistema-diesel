import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { authService } from "../src/services/auth.service.js";
import { resetDatabase } from "./helpers/reset-db.js";

describe("Suite de Integración: Integridad Referencial y Reglas onDelete: Restrict (server/tests/referential-integrity.test.ts) — Tarea 5.3", () => {
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

  describe("1. Detección de duplicados case-insensitive (Marcas y Categorías)", () => {
    it("bloquea con 409 Conflict la creación de marcas con nombres duplicados insensible a mayúsculas", async () => {
      await prisma.brand.create({ data: { name: "Delphi" } });

      const res = await request(app)
        .post("/api/brands")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "  dElPhI  " });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("Ya existe una marca con el nombre");
    });

    it("bloquea con 409 Conflict la creación de categorías con nombres duplicados insensible a mayúsculas", async () => {
      await prisma.category.create({ data: { name: "Toberas" } });

      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "  tObErAs  " });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("Ya existe una categoría con el nombre");
    });
  });

  describe("2. Límite Estricto de 1 Nivel en Taxonomías (D-04)", () => {
    it("impide la creación de jerarquías de más de 1 nivel (subcategorías de subcategorías)", async () => {
      const root = await prisma.category.create({ data: { name: "Sistemas de Inyección" } });
      const sub = await prisma.category.create({
        data: { name: "Common Rail", parentId: root.id },
      });

      // Intento de crear una categoría de nivel 2 bajo la subcategoría
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Componentes Internos", parentId: sub.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Límite de jerarquía excedido");

      // Verificar que no se insertó en DB
      const notCreated = await prisma.category.findFirst({
        where: { name: "Componentes Internos" },
      });
      expect(notCreated).toBeNull();
    });

    it("impide convertir una categoría raíz con hijas en subcategoría de otra (evita ciclos y niveles > 1)", async () => {
      const root1 = await prisma.category.create({ data: { name: "Inyectores" } });
      await prisma.category.create({ data: { name: "Toberas Diésel", parentId: root1.id } });
      const root2 = await prisma.category.create({ data: { name: "Herramientas" } });

      const res = await request(app)
        .put(`/api/categories/${root1.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ name: "Inyectores", parentId: root2.id });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("ya posee subcategorías hijas");
    });
  });

  describe("3. Integridad Referencial onDelete: Restrict en Marcas", () => {
    it("bloquea con 409 Conflict la eliminación de una Marca que posee productos vinculados", async () => {
      const brand = await prisma.brand.create({ data: { name: "Bosch" } });

      await prisma.product.create({
        data: {
          name: "Inyector Bosch CRI2",
          description: "Inyector de riel común",
          imageUrl: "/uploads/bosch-cri2.webp",
          brandId: brand.id,
          condition: "Nuevo",
          price: 320000,
          showPrice: true,
          visible: true,
        },
      });

      const res = await request(app)
        .delete(`/api/brands/${brand.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("No se puede eliminar la marca porque tiene productos vinculados");

      // La marca sigue intacta en la base de datos
      const stillInDb = await prisma.brand.findUnique({ where: { id: brand.id } });
      expect(stillInDb).not.toBeNull();
    });

    it("permite eliminar una marca cuando no tiene ningún producto asociado", async () => {
      const brand = await prisma.brand.create({ data: { name: "Marca Desconectada" } });

      const res = await request(app)
        .delete(`/api/brands/${brand.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const inDb = await prisma.brand.findUnique({ where: { id: brand.id } });
      expect(inDb).toBeNull();
    });
  });

  describe("4. Integridad Referencial onDelete: Restrict en Categorías", () => {
    it("bloquea con 409 Conflict la eliminación de una Categoría padre que tiene subcategorías", async () => {
      const root = await prisma.category.create({ data: { name: "Bombas Inyectoras" } });
      const sub = await prisma.category.create({
        data: { name: "Bombas Rotativas", parentId: root.id },
      });

      const res = await request(app)
        .delete(`/api/categories/${root.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("contiene subcategorías asociadas");

      // Tanto el padre como la hija siguen existiendo en la base de datos
      const parentInDb = await prisma.category.findUnique({ where: { id: root.id } });
      const subInDb = await prisma.category.findUnique({ where: { id: sub.id } });
      expect(parentInDb).not.toBeNull();
      expect(subInDb).not.toBeNull();
    });

    it("bloquea con 409 Conflict la eliminación de una Categoría vinculada a productos en ProductCategory", async () => {
      const brand = await prisma.brand.create({ data: { name: "Denso" } });
      const category = await prisma.category.create({ data: { name: "Válvulas Reguladoras" } });

      const product = await prisma.product.create({
        data: {
          name: "Válvula SCV Denso",
          description: "Válvula de control de succión",
          imageUrl: "/uploads/valvula-scv.webp",
          brandId: brand.id,
          condition: "Nuevo",
          price: 180000,
          showPrice: true,
          visible: true,
        },
      });

      await prisma.productCategory.create({
        data: {
          productId: product.id,
          categoryId: category.id,
        },
      });

      const res = await request(app)
        .delete(`/api/categories/${category.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("tiene productos vinculados");

      // La categoría sigue intacta en la base de datos
      const categoryInDb = await prisma.category.findUnique({ where: { id: category.id } });
      expect(categoryInDb).not.toBeNull();
    });

    it("permite la eliminación ordenada: borrar primero las dependencias y luego la categoría raíz", async () => {
      const root = await prisma.category.create({ data: { name: "Categoría Temporal" } });
      const sub = await prisma.category.create({
        data: { name: "Subcategoría Temporal", parentId: root.id },
      });

      // 1. Borrar la subcategoría hoja (no tiene dependientes)
      const deleteSubRes = await request(app)
        .delete(`/api/categories/${sub.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(deleteSubRes.status).toBe(200);

      // 2. Ahora que no tiene hijas, borrar la categoría raíz
      const deleteRootRes = await request(app)
        .delete(`/api/categories/${root.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(deleteRootRes.status).toBe(200);

      // Ambas fueron eliminadas
      expect(await prisma.category.findUnique({ where: { id: sub.id } })).toBeNull();
      expect(await prisma.category.findUnique({ where: { id: root.id } })).toBeNull();
    });
  });
});
