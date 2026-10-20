import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { productService } from "../src/services/product.service.js";
import { resetDatabase } from "./helpers/reset-db.js";

describe("DTO Serializer y Controlador de Listado (GET /api/products) — Tarea 6.2", () => {
  let brandId: string;
  let categoryId1: string;
  let categoryId2: string;
  let createdProductId: string;

  beforeEach(async () => {
    await resetDatabase();

    const brand = await prisma.brand.create({ data: { name: "Bosch" } });
    brandId = brand.id;

    const cat1 = await prisma.category.create({ data: { name: "Inyectores" } });
    categoryId1 = cat1.id;

    const cat2 = await prisma.category.create({
      data: { name: "Piezoeléctricos", parentId: cat1.id },
    });
    categoryId2 = cat2.id;

    // Crear producto visible
    const prod1 = await productService.createProduct({
      name: "Inyector Bosch 0445110",
      description: "Inyector de riel común de alto rendimiento",
      imageUrl: "/uploads/bosch-0445110.webp",
      brandId,
      categoryIds: [categoryId1, categoryId2],
      condition: "Nuevo",
      price: 350000,
      showPrice: true,
      visible: true,
      vehicleCompatibility: "VW Amarok 2.0 TDI",
      oem: "03L130277",
    });
    createdProductId = prod1.id;

    // Crear producto oculto
    await productService.createProduct({
      name: "Inyector Bosch Oculto",
      description: "Producto en preparación",
      imageUrl: "/uploads/bosch-hidden.webp",
      brandId,
      categoryIds: [categoryId1],
      condition: "Reacondicionado",
      price: 250000,
      showPrice: false,
      visible: false,
      vehicleCompatibility: "",
      oem: "",
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/products", () => {
    it("responde 200 OK con array plano y categoryIds: string[] aplanado por DTO", async () => {
      const res = await request(app).get("/api/products");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);

      const target = res.body.find((p: any) => p.id === createdProductId);
      expect(target).toBeDefined();

      // Comprobar la transformación DTO (RF-07, D-05)
      expect(target).toHaveProperty("categoryIds");
      expect(Array.isArray(target.categoryIds)).toBe(true);
      expect(target.categoryIds).toContain(categoryId1);
      expect(target.categoryIds).toContain(categoryId2);
      expect(target.categoryIds.length).toBe(2);

      // Comprobar que NO expone el objeto anidado productCategories de Prisma
      expect(target.productCategories).toBeUndefined();

      // Comprobar campos del contrato
      expect(target.brandId).toBe(brandId);
      expect(target.name).toBe("Inyector Bosch 0445110");
      expect(target.condition).toBe("Nuevo");
      expect(target.price).toBe(350000);
      expect(target.showPrice).toBe(true);
      expect(target.visible).toBe(true);
    });

    it("permite filtrar exclusivamente productos visibles mediante ?visibleOnly=true", async () => {
      const res = await request(app).get("/api/products?visibleOnly=true");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("Inyector Bosch 0445110");
      expect(res.body[0].visible).toBe(true);
    });
  });

  describe("GET /api/products/:id", () => {
    it("responde 200 OK con el producto aplanado por DTO para un UUID válido existente", async () => {
      const res = await request(app).get(`/api/products/${createdProductId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdProductId);
      expect(res.body.categoryIds).toEqual(expect.arrayContaining([categoryId1, categoryId2]));
      expect(res.body.productCategories).toBeUndefined();
    });

    it("responde 404 Not Found si el UUID no existe en la base de datos", async () => {
      const nonExistentUuid = "00000000-0000-4000-a000-000000000999";
      const res = await request(app).get(`/api/products/${nonExistentUuid}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Producto no encontrado");
    });

    it("responde 400 Bad Request si el parámetro no es un UUID válido", async () => {
      const res = await request(app).get("/api/products/id-invalido");

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Datos de validación inválidos");
    });
  });
});
