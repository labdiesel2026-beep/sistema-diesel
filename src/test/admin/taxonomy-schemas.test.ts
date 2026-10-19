import { describe, it, expect } from "vitest";
import { categoryFormSchema, brandFormSchema } from "@/lib/validations/admin-schemas";

describe("Esquemas de Categorías y Marcas (Zod Fail-Fast) — Tarea 2.3", () => {
  describe("categoryFormSchema (RF-10)", () => {
    it("debe validar exitosamente una categoría raíz con parentId null o por defecto", () => {
      const explicitNull = {
        name: "Inyección Common Rail",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(explicitNull);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Inyección Common Rail");
        expect(result.data.parentId).toBeNull();
      }

      // Con parentId omitido (default a null)
      const omittedParent = {
        name: "Inyección Piezoeléctrica",
      };
      const resultOmitted = categoryFormSchema.safeParse(omittedParent);
      expect(resultOmitted.success).toBe(true);
      if (resultOmitted.success) {
        expect(resultOmitted.data.parentId).toBeNull();
      }
    });

    it("debe validar exitosamente una subcategoría con parentId UUID válido", () => {
      const validSub = {
        name: "Inyectores Common Rail",
        parentId: "e4b6d812-7a2b-4f51-b8f3-0a567c891001",
      };

      const result = categoryFormSchema.safeParse(validSub);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentId).toBe("e4b6d812-7a2b-4f51-b8f3-0a567c891001");
      }
    });

    it("debe aplicar trim() y rechazar nombres con menos de 2 caracteres o vacíos", () => {
      const invalidNames = ["", " ", "a", "  b  "];

      for (const name of invalidNames) {
        const result = categoryFormSchema.safeParse({ name, parentId: null });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes("name"))).toBe(true);
        }
      }
    });

    it("debe rechazar parentId que no sea un UUID válido", () => {
      const invalidParent = {
        name: "Subcategoría Inválida",
        parentId: "not-a-valid-uuid",
      };

      const result = categoryFormSchema.safeParse(invalidParent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes("parentId"))).toBe(true);
      }
    });

    it("debe rechazar propiedades adicionales gracias al modo .strict()", () => {
      const malicious = {
        name: "Categoría Hack",
        parentId: null,
        extraFlag: true,
      };

      const result = categoryFormSchema.safeParse(malicious);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("Unrecognized key");
      }
    });
  });

  describe("brandFormSchema (RF-12)", () => {
    it("debe validar exitosamente una marca con nombre válido y aplicar trim()", () => {
      const input = {
        name: "  Bosch  ",
      };

      const result = brandFormSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Bosch");
      }
    });

    it("debe rechazar nombres de marca con menos de 2 caracteres o vacíos", () => {
      const invalidNames = ["", "   ", "x", " y "];

      for (const name of invalidNames) {
        const result = brandFormSchema.safeParse({ name });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes("name"))).toBe(true);
        }
      }
    });

    it("debe rechazar propiedades adicionales inyectadas gracias a .strict()", () => {
      const malicious = {
        name: "Delphi",
        logoUrl: "https://evil.com/logo.png",
      };

      const result = brandFormSchema.safeParse(malicious);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain("Unrecognized key");
      }
    });
  });
});
