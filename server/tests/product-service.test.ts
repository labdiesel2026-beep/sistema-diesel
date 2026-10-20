import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../src/config/prisma.js";
import { productService, toProductDto } from "../src/services/product.service.js";
import { resetDatabase } from "./helpers/reset-db.js";
import { AppError } from "../src/middleware/error.middleware.js";

describe("Servicio Transaccional de Productos (Tarea 6.1) — server/tests/product-service.test.ts", () => {
  let brandId: string;
  let categoryId1: string;
  let categoryId2: string;

  beforeEach(async () => {
    await resetDatabase();

    const brand = await prisma.brand.create({ data: { name: "Bosch" } });
    brandId = brand.id;

    const cat1 = await prisma.category.create({ data: { name: "Inyectores" } });
    categoryId1 = cat1.id;

    const cat2 = await prisma.category.create({ data: { name: "Sistemas Common Rail" } });
    categoryId2 = cat2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("createProduct ($transaction)", () => {
    it("persiste atómicamente el producto y sus múltiples categorías en ProductCategory", async () => {
      const created = await productService.createProduct({
        name: "Inyector Bosch CRI 2.2",
        description: "Inyector diésel para motores pesados",
        imageUrl: "/uploads/injector-1.webp",
        brandId,
        categoryIds: [categoryId1, categoryId2],
        vehicleCompatibility: "Toyota Hilux 2.8 D-4D",
        condition: "Nuevo",
        price: 450000,
        showPrice: true,
        visible: true,
        oem: "0445110368",
      });

      expect(created).toHaveProperty("id");
      expect(created.name).toBe("Inyector Bosch CRI 2.2");
      expect(created.brandId).toBe(brandId);
      expect(created.categoryIds).toContain(categoryId1);
      expect(created.categoryIds).toContain(categoryId2);
      expect(created.categoryIds.length).toBe(2);

      // Verificar en la base de datos que ProductCategory tiene 2 registros vinculados
      const pivotRows = await prisma.productCategory.findMany({
        where: { productId: created.id },
      });
      expect(pivotRows.length).toBe(2);
      expect(pivotRows.map((r) => r.categoryId)).toEqual(
        expect.arrayContaining([categoryId1, categoryId2])
      );
    });

    it("aborta la transacción con 404 si la marca no existe", async () => {
      const nonExistentBrand = "00000000-0000-4000-a000-000000000999";

      await expect(
        productService.createProduct({
          name: "Producto Inválido",
          description: "Sin marca válida",
          imageUrl: "/uploads/test.webp",
          brandId: nonExistentBrand,
          categoryIds: [categoryId1],
          condition: "Nuevo",
          price: 100,
          showPrice: true,
          visible: true,
          vehicleCompatibility: "",
          oem: "",
        })
      ).rejects.toThrow(AppError);
    });

    it("aborta la transacción con 400 si alguna de las categorías no existe", async () => {
      const nonExistentCategory = "00000000-0000-4000-a000-000000000999";

      await expect(
        productService.createProduct({
          name: "Producto Categoría Inválida",
          description: "Categoría inexistente",
          imageUrl: "/uploads/test.webp",
          brandId,
          categoryIds: [categoryId1, nonExistentCategory],
          condition: "Nuevo",
          price: 100,
          showPrice: true,
          visible: true,
          vehicleCompatibility: "",
          oem: "",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("updateProduct ($transaction)", () => {
    it("sincroniza atómicamente los campos y reemplaza las categorías en ProductCategory", async () => {
      // 1. Crear producto inicialmente con categoryId1
      const product = await productService.createProduct({
        name: "Inyector Inicial",
        description: "Descripción inicial",
        imageUrl: "/uploads/initial.webp",
        brandId,
        categoryIds: [categoryId1],
        condition: "Usado",
        price: 200000,
        showPrice: true,
        visible: true,
        vehicleCompatibility: "",
        oem: "",
      });

      // 2. Actualizar cambiando categorías a categoryId2 y cambiando foto
      const { product: updated, previousImageUrl } = await productService.updateProduct(product.id, {
        name: "Inyector Modificado",
        description: "Nueva descripción",
        imageUrl: "/uploads/modified.webp",
        brandId,
        categoryIds: [categoryId2], // Cambia categoría
        condition: "Reacondicionado",
        price: 280000,
        showPrice: false,
        visible: false,
        vehicleCompatibility: "Ford Ranger 3.2",
        oem: "OEM-7788",
      });

      expect(previousImageUrl).toBe("/uploads/initial.webp");
      expect(updated.name).toBe("Inyector Modificado");
      expect(updated.condition).toBe("Reacondicionado");
      expect(updated.categoryIds).toEqual([categoryId2]);
      expect(updated.visible).toBe(false);

      // Verificar sincronización de tabla pivote en DB
      const pivotRows = await prisma.productCategory.findMany({
        where: { productId: product.id },
      });
      expect(pivotRows.length).toBe(1);
      expect(pivotRows[0].categoryId).toBe(categoryId2);
    });
  });

  describe("updateProductVisibility y deleteProduct", () => {
    it("modifica exclusivamente la visibilidad sin tocar otros atributos", async () => {
      const product = await productService.createProduct({
        name: "Inyector Test Visibilidad",
        description: "Test",
        imageUrl: "/uploads/vis.webp",
        brandId,
        categoryIds: [categoryId1],
        condition: "Nuevo",
        price: 1000,
        showPrice: true,
        visible: true,
        vehicleCompatibility: "",
        oem: "",
      });

      const toggled = await productService.updateProductVisibility(product.id, false);
      expect(toggled.visible).toBe(false);
      expect(toggled.name).toBe(product.name);
    });

    it("elimina el producto y purga en cascada las filas de ProductCategory", async () => {
      const product = await productService.createProduct({
        name: "Inyector a Borrar",
        description: "Test borrado",
        imageUrl: "/uploads/delete-me.webp",
        brandId,
        categoryIds: [categoryId1, categoryId2],
        condition: "Nuevo",
        price: 1000,
        showPrice: true,
        visible: true,
        vehicleCompatibility: "",
        oem: "",
      });

      const deleted = await productService.deleteProduct(product.id);
      expect(deleted.id).toBe(product.id);

      // Verificar que el producto ya no existe en la base de datos
      const inDb = await prisma.product.findUnique({ where: { id: product.id } });
      expect(inDb).toBeNull();

      // Verificar que las filas de ProductCategory fueron purgadas por CASCADE
      const pivotRows = await prisma.productCategory.findMany({
        where: { productId: product.id },
      });
      expect(pivotRows.length).toBe(0);
    });
  });
});
