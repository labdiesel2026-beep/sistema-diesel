import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { authService } from "../src/services/auth.service.js";
import { DEFAULT_UPLOADS_DIR } from "../src/services/file-storage.service.js";
import { resetDatabase } from "./helpers/reset-db.js";

describe("Endpoints de Visibilidad (PATCH) y Eliminación (DELETE) de Productos — Tarea 6.4", () => {
  let adminCookie: string;
  let brandId: string;
  let categoryId: string;

  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@laboratoriodiesel.com",
    role: "admin",
  };

  beforeEach(async () => {
    await resetDatabase();
    adminCookie = `session=${authService.generateToken(adminPayload)}`;

    const brand = await prisma.brand.create({ data: { name: "Delphi" } });
    brandId = brand.id;

    const cat = await prisma.category.create({ data: { name: "Bombas de Alta Presión" } });
    categoryId = cat.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("PATCH /api/products/:id/visibility", () => {
    it("rechaza peticiones sin autenticación (401)", async () => {
      const dummyId = crypto.randomUUID();
      const res = await request(app)
        .patch(`/api/products/${dummyId}/visibility`)
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: false });

      expect(res.status).toBe(401);
    });

    it("rechaza peticiones sin encabezado anti-CSRF (403)", async () => {
      const dummyId = crypto.randomUUID();
      const res = await request(app)
        .patch(`/api/products/${dummyId}/visibility`)
        .set("Cookie", [adminCookie])
        .send({ visible: false });

      expect(res.status).toBe(403);
    });

    it("rechaza identificadores UUID inválidos con 400 Bad Request", async () => {
      const res = await request(app)
        .patch("/api/products/invalid-uuid/visibility")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: false });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Datos de validación inválidos");
    });

    it("rechaza payloads con campos imprevistos o tipos no booleanos (.strict()) con 400", async () => {
      const dummyId = crypto.randomUUID();

      // Caso 1: tipo no booleano
      const res1 = await request(app)
        .patch(`/api/products/${dummyId}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: "true" });

      expect(res1.status).toBe(400);

      // Caso 2: campo adicional inesperado
      const res2 = await request(app)
        .patch(`/api/products/${dummyId}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: true, extraProperty: 123 });

      expect(res2.status).toBe(400);
    });

    it("retorna 404 Not Found si el producto no existe", async () => {
      const dummyId = crypto.randomUUID();
      const res = await request(app)
        .patch(`/api/products/${dummyId}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: false });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Producto no encontrado");
    });

    it("alterna exitosamente la visibilidad del producto y retorna 200 OK con DTO plano", async () => {
      const created = await prisma.product.create({
        data: {
          name: "Bomba DFP3 Delphi",
          description: "Bomba de alta presión para motor 2.0 HDI",
          imageUrl: "/uploads/bomba-dfp3.webp",
          brandId,
          condition: "Nuevo",
          price: 980000,
          showPrice: true,
          visible: true,
          productCategories: {
            create: [{ category: { connect: { id: categoryId } } }],
          },
        },
      });

      // Ocultar producto (visible: false)
      const res = await request(app)
        .patch(`/api/products/${created.id}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: false });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.id);
      expect(res.body.visible).toBe(false);
      expect(res.body.categoryIds).toEqual([categoryId]);

      // Verificar persistencia en base de datos
      const inDb = await prisma.product.findUnique({ where: { id: created.id } });
      expect(inDb?.visible).toBe(false);

      // Reactivar visibilidad (visible: true)
      const res2 = await request(app)
        .patch(`/api/products/${created.id}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: true });

      expect(res2.status).toBe(200);
      expect(res2.body.visible).toBe(true);

      const inDb2 = await prisma.product.findUnique({ where: { id: created.id } });
      expect(inDb2?.visible).toBe(true);
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("rechaza peticiones sin autenticación (401)", async () => {
      const dummyId = crypto.randomUUID();
      const res = await request(app)
        .delete(`/api/products/${dummyId}`)
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(401);
    });

    it("rechaza peticiones sin encabezado anti-CSRF (403)", async () => {
      const dummyId = crypto.randomUUID();
      const res = await request(app)
        .delete(`/api/products/${dummyId}`)
        .set("Cookie", [adminCookie]);

      expect(res.status).toBe(403);
    });

    it("rechaza UUID inválido con 400 Bad Request", async () => {
      const res = await request(app)
        .delete("/api/products/bad-uuid")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(400);
    });

    it("retorna 404 Not Found si el producto a eliminar no existe", async () => {
      const dummyId = crypto.randomUUID();
      const res = await request(app)
        .delete(`/api/products/${dummyId}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Producto no encontrado");
    });

    it("elimina el producto de PostgreSQL, purga en cascada ProductCategory y borra físicamente el archivo .webp", async () => {
      // 1. Crear archivo real en disco dentro de uploads/
      const testUuid = crypto.randomUUID();
      const filename = `test-delete-product-${testUuid}.webp`;
      const filePath = path.join(DEFAULT_UPLOADS_DIR, filename);
      await fs.writeFile(filePath, Buffer.from("dummy-image-to-be-deleted"));

      // Verificar que el archivo existe
      expect(await fs.access(filePath).then(() => true).catch(() => false)).toBe(true);

      // 2. Crear producto en DB vinculado a ese archivo y categoría
      const product = await prisma.product.create({
        data: {
          name: "Producto para Eliminar",
          description: "Descripción de prueba para borrado",
          imageUrl: `/uploads/${filename}`,
          brandId,
          condition: "Usado",
          price: 12000,
          showPrice: false,
          visible: true,
          productCategories: {
            create: [{ category: { connect: { id: categoryId } } }],
          },
        },
      });

      // 3. Ejecutar DELETE
      const res = await request(app)
        .delete(`/api/products/${product.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Producto eliminado correctamente");

      // 4. Verificar que el producto ya no existe en PostgreSQL
      const inDb = await prisma.product.findUnique({ where: { id: product.id } });
      expect(inDb).toBeNull();

      // 5. Verificar que la relación en la tabla pivote ProductCategory fue purgada en cascada
      const pivotRows = await prisma.productCategory.findMany({
        where: { productId: product.id },
      });
      expect(pivotRows.length).toBe(0);

      // 6. Verificar que el archivo .webp fue eliminado físicamente de uploads/
      const fileStillExists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileStillExists).toBe(false);
    });

    it("es resiliente si el archivo de imagen ya no existía en disco (no bloquea el DELETE)", async () => {
      // Producto con imagen que no existe físicamente en disco
      const product = await prisma.product.create({
        data: {
          name: "Producto con imagen faltante",
          description: "No debe fallar si falta el archivo",
          imageUrl: "/uploads/non-existent-file-12345.webp",
          brandId,
          condition: "Nuevo",
          productCategories: {
            create: [{ category: { connect: { id: categoryId } } }],
          },
        },
      });

      const res = await request(app)
        .delete(`/api/products/${product.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const inDb = await prisma.product.findUnique({ where: { id: product.id } });
      expect(inDb).toBeNull();
    });
  });
});
