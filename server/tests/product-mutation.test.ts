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

describe("Endpoints de Creación (POST) y Edición (PUT) de Productos — Tarea 6.3", () => {
  let adminCookie: string;
  let brandId: string;
  let categoryId1: string;
  let categoryId2: string;
  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@laboratoriodiesel.com",
    role: "admin",
  };

  beforeEach(async () => {
    await resetDatabase();
    adminCookie = `session=${authService.generateToken(adminPayload)}`;

    const brand = await prisma.brand.create({ data: { name: "Bosch" } });
    brandId = brand.id;

    const cat1 = await prisma.category.create({ data: { name: "Inyectores" } });
    categoryId1 = cat1.id;

    const cat2 = await prisma.category.create({ data: { name: "Toberas", parentId: cat1.id } });
    categoryId2 = cat2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/products", () => {
    it("rechaza peticiones sin autenticación (401)", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          name: "Inyector Test",
          description: "Descripción de prueba",
          imageUrl: "/uploads/img.webp",
          brandId,
          categoryIds: [categoryId1],
          condition: "Nuevo",
          price: 1000,
        });

      expect(res.status).toBe(401);
    });

    it("rechaza peticiones sin encabezado anti-CSRF (403)", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Cookie", [adminCookie])
        .send({
          name: "Inyector Test",
          description: "Descripción de prueba",
          imageUrl: "/uploads/img.webp",
          brandId,
          categoryIds: [categoryId1],
          condition: "Nuevo",
          price: 1000,
        });

      expect(res.status).toBe(403);
    });

    it("rechaza payload con campos imprevistos (.strict()) con 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          name: "Inyector Test",
          description: "Descripción de prueba",
          imageUrl: "/uploads/img.webp",
          brandId,
          categoryIds: [categoryId1],
          condition: "Nuevo",
          price: 1000,
          bypassAdmin: true, // Propiedad no declarada
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Datos de validación inválidos");
    });

    it("rechaza precios negativos con 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          name: "Inyector Test",
          description: "Descripción de prueba",
          imageUrl: "/uploads/img.webp",
          brandId,
          categoryIds: [categoryId1],
          condition: "Nuevo",
          price: -500, // Precio negativo prohibido
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Datos de validación inválidos");
    });

    it("crea exitosamente un producto y retorna 201 Created con DTO plano", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          name: "Inyector Common Rail Bosch 0445110",
          description: "Inyector diésel original de alta presión",
          imageUrl: "/uploads/sample-bosch.webp",
          brandId,
          categoryIds: [categoryId1, categoryId2],
          condition: "Nuevo",
          price: 450000,
          showPrice: true,
          visible: true,
          vehicleCompatibility: "Toyota Hilux",
          oem: "0445110-OEM",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Inyector Common Rail Bosch 0445110");
      expect(res.body.categoryIds).toEqual(
        expect.arrayContaining([categoryId1, categoryId2])
      );
      expect(res.body.productCategories).toBeUndefined();

      // Verificar persistencia en base de datos
      const inDb = await prisma.product.findUnique({
        where: { id: res.body.id },
        include: { productCategories: true },
      });
      expect(inDb).not.toBeNull();
      expect(inDb?.productCategories.length).toBe(2);
    });
  });

  describe("PUT /api/products/:id", () => {
    it("actualiza campos y sincroniza categorías retornando 200 OK", async () => {
      // 1. Crear producto con categoryId1
      const created = await prisma.product.create({
        data: {
          name: "Producto Inicial",
          description: "Descripción previa",
          imageUrl: "/uploads/img-1.webp",
          brandId,
          condition: "Usado",
          price: 100000,
          showPrice: true,
          visible: true,
          productCategories: {
            create: [{ category: { connect: { id: categoryId1 } } }],
          },
        },
      });

      // 2. Modificar producto y cambiar categorías a categoryId2
      const res = await request(app)
        .put(`/api/products/${created.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          name: "Producto Actualizado",
          description: "Nueva descripción detallada",
          imageUrl: "/uploads/img-1.webp",
          brandId,
          categoryIds: [categoryId2], // Cambio de categoría
          condition: "Reacondicionado",
          price: 150000,
          showPrice: true,
          visible: true,
          vehicleCompatibility: "Ford Ranger",
          oem: "OEM-9988",
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Producto Actualizado");
      expect(res.body.condition).toBe("Reacondicionado");
      expect(res.body.categoryIds).toEqual([categoryId2]);

      // Verificar en DB que la tabla pivote se actualizó
      const pivotRows = await prisma.productCategory.findMany({
        where: { productId: created.id },
      });
      expect(pivotRows.length).toBe(1);
      expect(pivotRows[0].categoryId).toBe(categoryId2);
    });

    it("purga de forma asíncrona la imagen previa en disco si imageUrl fue reemplazado", async () => {
      // Crear un archivo de prueba real en disco en uploads/
      const testUuid = crypto.randomUUID();
      const oldFilename = `old-photo-${testUuid}.webp`;
      const oldFilePath = path.join(DEFAULT_UPLOADS_DIR, oldFilename);
      await fs.writeFile(oldFilePath, Buffer.from("dummy-old-image-bytes"));

      // Verificar que el archivo existe en disco
      expect(await fs.access(oldFilePath).then(() => true).catch(() => false)).toBe(true);

      // Crear el producto vinculado a esa imagen
      const product = await prisma.product.create({
        data: {
          name: "Producto con Foto a Reemplazar",
          description: "Descripción válida",
          imageUrl: `/uploads/${oldFilename}`,
          brandId,
          condition: "Nuevo",
          price: 50000,
          showPrice: true,
          visible: true,
          productCategories: {
            create: [{ category: { connect: { id: categoryId1 } } }],
          },
        },
      });

      // Actualizar sustituyendo imageUrl por una nueva ruta
      const newImageUrl = `/uploads/new-photo-${crypto.randomUUID()}.webp`;
      const res = await request(app)
        .put(`/api/products/${product.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          name: "Producto con Foto Reemplazada",
          description: "Descripción válida",
          imageUrl: newImageUrl,
          brandId,
          categoryIds: [categoryId1],
          condition: "Nuevo",
          price: 50000,
          showPrice: true,
          visible: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.imageUrl).toBe(newImageUrl);

      // Pequeño retardo para permitir la finalización de la promesa asíncrona post-commit
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Comprobar que el archivo anterior fue eliminado físicamente del disco
      const oldFileStillExists = await fs.access(oldFilePath).then(() => true).catch(() => false);
      expect(oldFileStillExists).toBe(false);
    });
  });
});
