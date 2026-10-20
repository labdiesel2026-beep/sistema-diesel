import { describe, it, expect } from "vitest";
import { productFormSchema } from "@/lib/validations/admin-schemas";

describe("Esquema de Validación de Producto (Zod Fail-Fast) — Tarea 2.4", () => {
  const validProductPayload = {
    name: "Inyector Amarok 2.0 TDI",
    description: "Inyector Common Rail nuevo calibrado en banco de prueba.",
    imageUrl: "/uploads/amarok-20-tdi.webp",
    categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891001", "e4b6d812-7a2b-4f51-b8f3-0a567c891002"],
    brandId: "b1a2c3d4-0001-4000-8000-000000000001",
    vehicleCompatibility: "Volkswagen Amarok 2.0 TDI (2010-2021)",
    condition: "Nuevo" as const,
    price: 320000,
    showPrice: true,
    visible: true,
    oem: "0445110369",
  };

  it("debe validar exitosamente un producto completo y aplicar trim a strings", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      name: "  Inyector Amarok 2.0 TDI  ",
      description: "  Inyector Common Rail nuevo calibrado en banco de prueba.  ",
      oem: "  0445110369  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Inyector Amarok 2.0 TDI");
      expect(result.data.description).toBe(
        "Inyector Common Rail nuevo calibrado en banco de prueba.",
      );
      expect(result.data.oem).toBe("0445110369");
    }
  });

  it("debe aceptar un precio de $0 como valor válido (CL-06, CL-07)", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      price: 0,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(0);
    }
  });

  it("debe aceptar un precio de valor null (Modalidad 'Consultar precio / A cotizar')", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      price: null,
      showPrice: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBeNull();
      expect(result.data.showPrice).toBe(false);
    }
  });

  it("debe rechazar precios negativos", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      price: -100,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const priceError = result.error.errors.find((e) => e.path.includes("price"));
      expect(priceError).toBeDefined();
      expect(priceError?.message).toBe("El precio no puede ser negativo (admite $0)");
    }
  });

  it("debe rechazar tipos de precio no numéricos", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      price: "trescientos mil",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const priceError = result.error.errors.find((e) => e.path.includes("price"));
      expect(priceError).toBeDefined();
      expect(priceError?.message).toBe("El precio debe ser un número válido");
    }
  });

  it("debe rechazar nombres con menos de 3 caracteres o vacíos", () => {
    const invalidNames = ["", "  ", "ab", "  a  "];

    for (const name of invalidNames) {
      const result = productFormSchema.safeParse({
        ...validProductPayload,
        name,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes("name"))).toBe(true);
      }
    }
  });

  it("debe rechazar descripciones con menos de 5 caracteres", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      description: "Hola",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.path.includes("description"))).toBe(true);
    }
  });

  it("debe exigir al menos una categoría seleccionada (categoryIds no vacío)", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      categoryIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const catError = result.error.errors.find((e) => e.path.includes("categoryIds"));
      expect(catError).toBeDefined();
      expect(catError?.message).toBe("Debe seleccionar al menos una categoría");
    }
  });

  it("debe rechazar identificadores UUID no válidos en categoryIds o brandId", () => {
    const invalidCat = productFormSchema.safeParse({
      ...validProductPayload,
      categoryIds: ["not-a-uuid"],
    });
    expect(invalidCat.success).toBe(false);

    const invalidBrand = productFormSchema.safeParse({
      ...validProductPayload,
      brandId: "not-a-uuid",
    });
    expect(invalidBrand.success).toBe(false);
  });

  it("debe rechazar condiciones fuera del enum estático ('Nuevo', 'Reacondicionado', 'Usado')", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      condition: "Desconocido",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const condError = result.error.errors.find((e) => e.path.includes("condition"));
      expect(condError).toBeDefined();
      expect(condError?.message).toBe("Condición debe ser 'Nuevo', 'Reacondicionado' o 'Usado'");
    }
  });

  it("debe rechazar foto de producto vacía", () => {
    const result = productFormSchema.safeParse({
      ...validProductPayload,
      imageUrl: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const imgError = result.error.errors.find((e) => e.path.includes("imageUrl"));
      expect(imgError).toBeDefined();
      expect(imgError?.message).toBe("Debe seleccionar una foto para el producto");
    }
  });

  it("debe aplicar valores por defecto a campos opcionales omitidos", () => {
    const minimalPayload = {
      name: "Inyector Denso Hilux",
      description: "Inyector original nuevo en caja.",
      imageUrl: "/uploads/denso-hilux.webp",
      categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891001"],
      brandId: "b1a2c3d4-0001-4000-8000-000000000001",
      condition: "Nuevo" as const,
      price: 250000,
    };

    const result = productFormSchema.safeParse(minimalPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.showPrice).toBe(true);
      expect(result.data.visible).toBe(true);
      expect(result.data.vehicleCompatibility).toBe("");
      expect(result.data.oem).toBe("");
    }
  });

  it("debe rechazar campos adicionales inyectados gracias a .strict()", () => {
    const maliciousPayload = {
      ...validProductPayload,
      bypassApproval: true,
      hiddenStock: 999,
    };

    const result = productFormSchema.safeParse(maliciousPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain("Unrecognized key");
    }
  });
});
