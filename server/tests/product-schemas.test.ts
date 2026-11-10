import { describe, it, expect } from "vitest";
import {
  featuredPatchSchema,
  productFormSchema,
  createProductSchema,
  updateProductSchema,
  visibilityPatchSchema,
} from "../src/schemas/product.schemas.js";

describe("Validación de Esquemas Zod de Productos (Tarea 8.1)", () => {
  describe("featuredPatchSchema (.strict())", () => {
    it("valida exitosamente cuando isFeatured es true", () => {
      const result = featuredPatchSchema.safeParse({ isFeatured: true });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(true);
      }
    });

    it("valida exitosamente cuando isFeatured es false", () => {
      const result = featuredPatchSchema.safeParse({ isFeatured: false });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(false);
      }
    });

    it("falla si isFeatured no es de tipo booleano", () => {
      const result = featuredPatchSchema.safeParse({ isFeatured: "true" });
      expect(result.success).toBe(false);
    });

    it("rechaza payload vacío ({})", () => {
      const result = featuredPatchSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rechaza propiedades no reconocidas en modo estricto (.strict())", () => {
      const result = featuredPatchSchema.safeParse({
        isFeatured: true,
        extraProperty: "hack",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("productFormSchema con isFeatured", () => {
    const validBase = {
      name: "Inyector Bosch Common Rail",
      description: "Inyector diésel para prueba de validación",
      imageUrl: "/uploads/injector.webp",
      categoryIds: ["11111111-1111-4111-8111-111111111111"],
      brandId: "22222222-2222-4222-8222-222222222222",
      condition: "Nuevo",
      price: 250000,
      showPrice: true,
      visible: true,
    };

    it("asigna isFeatured: false por defecto cuando no se especifica", () => {
      const result = productFormSchema.safeParse(validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(false);
      }
    });

    it("acepta isFeatured: true explícito", () => {
      const result = productFormSchema.safeParse({
        ...validBase,
        isFeatured: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(true);
      }
    });

    it("rechaza propiedades adicionales en modo .strict()", () => {
      const result = productFormSchema.safeParse({
        ...validBase,
        isFeatured: true,
        maliciousKey: 123,
      });
      expect(result.success).toBe(false);
    });

    it("acepta oem y vehicleCompatibility vacíos o ausentes asignando string vacío por defecto", () => {
      const result = createProductSchema.safeParse({
        ...validBase,
        oem: "",
        vehicleCompatibility: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.oem).toBe("");
        expect(result.data.vehicleCompatibility).toBe("");
      }
    });

    it("updateProductSchema admite campos parciales con oem y vehicleCompatibility vacíos", () => {
      const result = updateProductSchema.safeParse({
        oem: "",
        vehicleCompatibility: "",
      });
      expect(result.success).toBe(true);
    });
  });
});
