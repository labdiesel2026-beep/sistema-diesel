import { describe, it, expect } from "vitest";
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  getInitialAdminData,
} from "@/lib/admin-seed-data";

// Expresión regular canónica para UUIDv4 estándar
const UUIDV4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("Datos Semilla Normalizados con UUIDv4 (admin-seed-data.ts) — Tarea 4.1", () => {
  describe("Validación de Identificadores UUIDv4 (D-14, CA-15.1)", () => {
    it("todos los IDs de categorías deben ser UUIDv4 válidos", () => {
      expect(INITIAL_CATEGORIES.length).toBeGreaterThan(0);
      INITIAL_CATEGORIES.forEach((category) => {
        expect(category.id).toMatch(UUIDV4_REGEX);
        if (category.parentId !== null) {
          expect(category.parentId).toMatch(UUIDV4_REGEX);
        }
      });
    });

    it("todos los IDs de marcas deben ser UUIDv4 válidos", () => {
      expect(INITIAL_BRANDS.length).toBe(3);
      INITIAL_BRANDS.forEach((brand) => {
        expect(brand.id).toMatch(UUIDV4_REGEX);
      });
    });

    it("todos los IDs de productos deben ser UUIDv4 válidos", () => {
      expect(INITIAL_PRODUCTS.length).toBe(4);
      INITIAL_PRODUCTS.forEach((product) => {
        expect(product.id).toMatch(UUIDV4_REGEX);
        expect(product.brandId).toMatch(UUIDV4_REGEX);
        product.categoryIds.forEach((catId) => {
          expect(catId).toMatch(UUIDV4_REGEX);
        });
      });
    });
  });

  describe("Estructura de Categorías y Jerarquía de 1 Nivel (RF-10, CA-15.1, CL-04)", () => {
    it("debe contener exactamente 3 categorías principales y 2 subcategorías hijas", () => {
      const rootCategories = INITIAL_CATEGORIES.filter((c) => c.parentId === null);
      const childCategories = INITIAL_CATEGORIES.filter((c) => c.parentId !== null);

      expect(rootCategories.length).toBe(3);
      expect(childCategories.length).toBe(2);
      expect(INITIAL_CATEGORIES.length).toBe(5);
    });

    it("las subcategorías hijas deben referenciar a una categoría raíz existente (sin huérfanos ni ciclos)", () => {
      const rootIds = new Set(
        INITIAL_CATEGORIES.filter((c) => c.parentId === null).map((c) => c.id)
      );

      const childCategories = INITIAL_CATEGORIES.filter((c) => c.parentId !== null);

      childCategories.forEach((child) => {
        expect(child.parentId).not.toBeNull();
        expect(rootIds.has(child.parentId!)).toBe(true);
        // Regla de 1 nivel: el padre no puede ser otra subcategoría
        const parentCategory = INITIAL_CATEGORIES.find((c) => c.id === child.parentId);
        expect(parentCategory?.parentId).toBeNull();
      });
    });
  });

  describe("Integridad Referencial de Marcas y Productos (RF-15, CA-15.1)", () => {
    it("debe contener las 3 marcas líderes especificadas (Bosch, Delphi, Denso)", () => {
      const brandNames = INITIAL_BRANDS.map((b) => b.name);
      expect(brandNames).toContain("Bosch");
      expect(brandNames).toContain("Delphi");
      expect(brandNames).toContain("Denso");
    });

    it("cada producto debe vincularse a una marca existente (cero huérfanos en brandId)", () => {
      const brandIds = new Set(INITIAL_BRANDS.map((b) => b.id));

      INITIAL_PRODUCTS.forEach((product) => {
        expect(brandIds.has(product.brandId)).toBe(true);
      });
    });

    it("todas las categorías de cada producto deben existir (cero huérfanos en categoryIds)", () => {
      const categoryIds = new Set(INITIAL_CATEGORIES.map((c) => c.id));

      INITIAL_PRODUCTS.forEach((product) => {
        expect(product.categoryIds.length).toBeGreaterThan(0);
        product.categoryIds.forEach((catId) => {
          expect(categoryIds.has(catId)).toBe(true);
        });
      });
    });

    it("debe proveer variedad de estados de productos (visibles, ocultos, con precio, sin precio y precio $0)", () => {
      const hasVisible = INITIAL_PRODUCTS.some((p) => p.visible === true);
      const hasHidden = INITIAL_PRODUCTS.some((p) => p.visible === false);
      const hasPositivePrice = INITIAL_PRODUCTS.some(
        (p) => p.price !== null && p.price > 0 && p.showPrice === true
      );
      const hasZeroPrice = INITIAL_PRODUCTS.some(
        (p) => p.price === 0 && p.showPrice === true
      );
      const hasNullPrice = INITIAL_PRODUCTS.some(
        (p) => p.price === null && p.showPrice === false
      );

      expect(hasVisible).toBe(true);
      expect(hasHidden).toBe(true);
      expect(hasPositivePrice).toBe(true);
      expect(hasZeroPrice).toBe(true);
      expect(hasNullPrice).toBe(true);
    });
  });

  describe("Aislamiento de Instancia (getInitialAdminData)", () => {
    it("debe retornar copias profundas e independientes de los datos semilla", () => {
      const data1 = getInitialAdminData();
      const data2 = getInitialAdminData();

      expect(data1).toEqual(data2);
      expect(data1.categories).not.toBe(data2.categories);
      expect(data1.brands).not.toBe(data2.brands);
      expect(data1.products).not.toBe(data2.products);

      // Modificar data1 no debe contaminar data2 ni INITIAL_CATEGORIES
      const firstCat1 = data1.categories[0];
      const firstCat2 = data2.categories[0];
      const initialCat0 = INITIAL_CATEGORIES[0];

      expect(firstCat1).toBeDefined();
      expect(firstCat2).toBeDefined();
      expect(initialCat0).toBeDefined();

      if (firstCat1 && firstCat2 && initialCat0) {
        firstCat1.name = "Nombre Modificado";
        expect(firstCat2.name).not.toBe("Nombre Modificado");
        expect(initialCat0.name).not.toBe("Nombre Modificado");
      }
    });
  });
});
