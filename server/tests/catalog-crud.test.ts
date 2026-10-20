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

describe("Suite Integral de Integración: CRUD del Catálogo de Productos y Métricas (catalog-crud.test.ts) — Tarea 6.6", () => {
  let adminCookie: string;
  let brandBoschId: string;
  let brandDelphiId: string;
  let catInyectoresId: string;
  let catBombasId: string;
  let subcatToberasId: string;

  const adminPayload = {
    id: "00000000-0000-4000-a000-000000000001",
    email: "admin@laboratoriodiesel.com",
    role: "admin",
  };

  beforeEach(async () => {
    await resetDatabase();
    adminCookie = `session=${authService.generateToken(adminPayload)}`;

    // Sembrar marcas
    const brand1 = await prisma.brand.create({ data: { name: "Bosch" } });
    brandBoschId = brand1.id;
    const brand2 = await prisma.brand.create({ data: { name: "Delphi" } });
    brandDelphiId = brand2.id;

    // Sembrar categorías (1 nivel de jerarquía)
    const cat1 = await prisma.category.create({ data: { name: "Inyectores" } });
    catInyectoresId = cat1.id;
    const cat2 = await prisma.category.create({ data: { name: "Bombas de Inyección" } });
    catBombasId = cat2.id;
    const subcat = await prisma.category.create({
      data: { name: "Toberas", parentId: cat1.id },
    });
    subcatToberasId = subcat.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("1. Creación de Productos (POST /api/products)", () => {
    it("rechaza solicitudes sin autenticación o sin token Anti-CSRF", async () => {
      const payload = {
        name: "Inyector Common Rail 0445110",
        description: "Inyector diésel de alta precisión",
        imageUrl: "/uploads/inyector-test.webp",
        brandId: brandBoschId,
        categoryIds: [catInyectoresId],
        condition: "Nuevo",
        price: 250000,
      };

      // Sin autenticación (401)
      const resUnauth = await request(app)
        .post("/api/products")
        .set("X-Requested-With", "XMLHttpRequest")
        .send(payload);
      expect(resUnauth.status).toBe(401);

      // Sin CSRF (403)
      const resNoCsrf = await request(app)
        .post("/api/products")
        .set("Cookie", [adminCookie])
        .send(payload);
      expect(resNoCsrf.status).toBe(403);
    });

    it("crea un producto de forma atómica y responde 201 Created con categoryIds aplanado", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          name: "Inyector Bosch 0445110273",
          description: "Inyector para motor 2.8 CTDI",
          imageUrl: "/uploads/bosch-0445110273.webp",
          brandId: brandBoschId,
          categoryIds: [catInyectoresId, subcatToberasId],
          condition: "Nuevo",
          price: 320000,
          showPrice: true,
          visible: true,
          vehicleCompatibility: "Chevrolet S10 / Trailblazer",
          oem: "0445110273",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Inyector Bosch 0445110273");
      expect(res.body.categoryIds).toEqual(
        expect.arrayContaining([catInyectoresId, subcatToberasId]),
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

  describe("2. Listado y Consulta de Productos (GET /api/products y GET /api/products/:id)", () => {
    it("lista productos en formato plano con categoryIds: string[] y permite filtro visibleOnly", async () => {
      // Crear 1 visible y 1 oculto
      await prisma.product.create({
        data: {
          name: "Producto Visible",
          description: "Descripción visible",
          imageUrl: "/uploads/p1.webp",
          brandId: brandBoschId,
          condition: "Nuevo",
          visible: true,
          productCategories: {
            create: [{ categoryId: catInyectoresId }],
          },
        },
      });

      await prisma.product.create({
        data: {
          name: "Producto Oculto",
          description: "Descripción oculto",
          imageUrl: "/uploads/p2.webp",
          brandId: brandDelphiId,
          condition: "Usado",
          visible: false,
          productCategories: {
            create: [{ categoryId: catBombasId }],
          },
        },
      });

      // Consulta pública general
      const resAll = await request(app).get("/api/products");
      expect(resAll.status).toBe(200);
      expect(resAll.body.length).toBe(2);
      expect(resAll.body[0]).toHaveProperty("categoryIds");
      expect(resAll.body[0].productCategories).toBeUndefined();

      // Consulta con filtro visibleOnly=true
      const resVisible = await request(app).get("/api/products?visibleOnly=true");
      expect(resVisible.status).toBe(200);
      expect(resVisible.body.length).toBe(1);
      expect(resVisible.body[0].name).toBe("Producto Visible");
    });

    it("obtiene un producto por su UUID en formato DTO plano", async () => {
      const created = await prisma.product.create({
        data: {
          name: "Bomba Delphi DFP3",
          description: "Bomba para common rail",
          imageUrl: "/uploads/dfp3.webp",
          brandId: brandDelphiId,
          condition: "Reacondicionado",
          visible: true,
          productCategories: {
            create: [{ categoryId: catBombasId }],
          },
        },
      });

      const res = await request(app).get(`/api/products/${created.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.id);
      expect(res.body.categoryIds).toEqual([catBombasId]);
      expect(res.body.brandId).toBe(brandDelphiId);
    });
  });

  describe("3. Edición de Productos y Purga de Imagen Anterior (PUT /api/products/:id)", () => {
    it("actualiza producto y elimina físicamente la imagen anterior si fue sustituida", async () => {
      // 1. Crear archivo real en disco para la imagen previa
      const testUuid = crypto.randomUUID();
      const oldFilename = `old-img-${testUuid}.webp`;
      const oldFilePath = path.join(DEFAULT_UPLOADS_DIR, oldFilename);
      await fs.writeFile(oldFilePath, Buffer.from("imagen-anterior-bytes"));
      expect(
        await fs
          .access(oldFilePath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);

      // 2. Crear producto en BD
      const product = await prisma.product.create({
        data: {
          name: "Inyector Original",
          description: "Descripción previa",
          imageUrl: `/uploads/${oldFilename}`,
          brandId: brandBoschId,
          condition: "Nuevo",
          price: 180000,
          productCategories: {
            create: [{ categoryId: catInyectoresId }],
          },
        },
      });

      // 3. Ejecutar PUT con nueva imagen y nuevas categorías
      const newImageUrl = `/uploads/new-img-${crypto.randomUUID()}.webp`;
      const res = await request(app)
        .put(`/api/products/${product.id}`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({
          name: "Inyector Modificado",
          description: "Descripción actualizada con más detalle",
          imageUrl: newImageUrl,
          brandId: brandBoschId,
          categoryIds: [catInyectoresId, subcatToberasId],
          condition: "Reacondicionado",
          price: 195000,
          showPrice: true,
          visible: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Inyector Modificado");
      expect(res.body.imageUrl).toBe(newImageUrl);
      expect(res.body.categoryIds).toEqual(
        expect.arrayContaining([catInyectoresId, subcatToberasId]),
      );

      // 4. Esperar purga física asíncrona post-commit
      await new Promise((resolve) => setTimeout(resolve, 100));

      const oldFileStillExists = await fs
        .access(oldFilePath)
        .then(() => true)
        .catch(() => false);
      expect(oldFileStillExists).toBe(false);
    });
  });

  describe("4. Alternancia de Visibilidad (PATCH /api/products/:id/visibility)", () => {
    it("modifica exclusivamente el campo booleano de visibilidad", async () => {
      const product = await prisma.product.create({
        data: {
          name: "Inyector para Ocultar",
          description: "Prueba de visibilidad",
          imageUrl: "/uploads/prod.webp",
          brandId: brandBoschId,
          condition: "Nuevo",
          visible: true,
          productCategories: {
            create: [{ categoryId: catInyectoresId }],
          },
        },
      });

      // Ocultar
      const resHide = await request(app)
        .patch(`/api/products/${product.id}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: false });

      expect(resHide.status).toBe(200);
      expect(resHide.body.visible).toBe(false);

      const inDbHide = await prisma.product.findUnique({ where: { id: product.id } });
      expect(inDbHide?.visible).toBe(false);

      // Reactivar
      const resShow = await request(app)
        .patch(`/api/products/${product.id}/visibility`)
        .set("Cookie", [adminCookie])
        .set("X-Requested-With", "XMLHttpRequest")
        .send({ visible: true });

      expect(resShow.status).toBe(200);
      expect(resShow.body.visible).toBe(true);

      const inDbShow = await prisma.product.findUnique({ where: { id: product.id } });
      expect(inDbShow?.visible).toBe(true);
    });
  });

  describe("5. Eliminación de Producto (DELETE /api/products/:id)", () => {
    it("elimina el producto en PostgreSQL, purga en cascada ProductCategory y borra físicamente su imagen en uploads/", async () => {
      // 1. Crear archivo en disco
      const testUuid = crypto.randomUUID();
      const filename = `delete-target-${testUuid}.webp`;
      const filePath = path.join(DEFAULT_UPLOADS_DIR, filename);
      await fs.writeFile(filePath, Buffer.from("foto-para-borrar"));
      expect(
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);

      // 2. Crear producto
      const product = await prisma.product.create({
        data: {
          name: "Producto Condenado",
          description: "Será eliminado en el test",
          imageUrl: `/uploads/${filename}`,
          brandId: brandDelphiId,
          condition: "Usado",
          visible: true,
          productCategories: {
            create: [{ categoryId: catBombasId }],
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

      // 4. Comprobar que en DB no existe el producto ni la relación ProductCategory
      const inDb = await prisma.product.findUnique({ where: { id: product.id } });
      expect(inDb).toBeNull();

      const pivotRows = await prisma.productCategory.findMany({
        where: { productId: product.id },
      });
      expect(pivotRows.length).toBe(0);

      // 5. Comprobar que el archivo fue eliminado físicamente
      const fileStillExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(fileStillExists).toBe(false);
    });
  });

  describe("6. Métricas del Catálogo (GET /api/admin/metrics)", () => {
    it("retorna los 5 contadores agregados sincronizados en tiempo real", async () => {
      // Crear 2 productos visibles y 1 producto oculto
      await prisma.product.create({
        data: {
          name: "Prod V1",
          description: "Desc",
          imageUrl: "/uploads/v1.webp",
          brandId: brandBoschId,
          condition: "Nuevo",
          visible: true,
          productCategories: {
            create: [{ categoryId: catInyectoresId }],
          },
        },
      });

      await prisma.product.create({
        data: {
          name: "Prod V2",
          description: "Desc",
          imageUrl: "/uploads/v2.webp",
          brandId: brandBoschId,
          condition: "Reacondicionado",
          visible: true,
          productCategories: {
            create: [{ categoryId: subcatToberasId }],
          },
        },
      });

      await prisma.product.create({
        data: {
          name: "Prod O1",
          description: "Desc",
          imageUrl: "/uploads/o1.webp",
          brandId: brandDelphiId,
          condition: "Usado",
          visible: false,
          productCategories: {
            create: [{ categoryId: catBombasId }],
          },
        },
      });

      const res = await request(app).get("/api/admin/metrics").set("Cookie", [adminCookie]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalProducts: 3,
        visibleProducts: 2,
        hiddenProducts: 1,
        featuredProducts: 0,
        totalCategories: 3, // Inyectores, Bombas de Inyección, Toberas
        totalBrands: 2, // Bosch, Delphi
      });
    });
  });
});
