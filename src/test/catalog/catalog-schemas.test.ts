import { describe, expect, it } from "vitest";
import {
  catalogSearchParamsSchema,
  uuidParamSchema,
  normalizeFilterParam,
} from "@/schemas/catalog-schemas";

describe("Catalog Zod Schemas (T-03)", () => {
  it("valida estrictamente search params de URL y UUIDs", () => {
    // 1. Caso base por defecto: objeto vacío produce q=""
    const defaultParsed = catalogSearchParamsSchema.parse({});
    expect(defaultParsed).toEqual({ q: "" });

    // 2. Parámetros válidos con trimming de texto
    const validParams = catalogSearchParamsSchema.parse({
      q: "  0445110369  ",
      brand: "b1a2c3d4-0001-4000-8000-000000000001",
      category: ["e4b6d812-7a2b-4f51-b8f3-0a567c891001", "e4b6d812-7a2b-4f51-b8f3-0a567c891002"],
    });
    expect(validParams.q).toBe("0445110369");
    expect(validParams.brand).toBe("b1a2c3d4-0001-4000-8000-000000000001");
    expect(validParams.category).toHaveLength(2);

    // 3. Rechazo estricto de claves desconocidas (.strict())
    const unknownKeyResult = catalogSearchParamsSchema.safeParse({
      q: "test",
      unexpectedParam: "malicious_payload",
    });
    expect(unknownKeyResult.success).toBe(false);

    // 4. Rechazo de identificadores que no sean UUIDs válidos en marcas
    const invalidBrandResult = catalogSearchParamsSchema.safeParse({
      brand: "invalid-uuid-string",
    });
    expect(invalidBrandResult.success).toBe(false);

    // 5. Rechazo de identificadores no válidos dentro de array de categorías
    const invalidCategoryResult = catalogSearchParamsSchema.safeParse({
      category: ["e4b6d812-7a2b-4f51-b8f3-0a567c891001", "no-es-uuid"],
    });
    expect(invalidCategoryResult.success).toBe(false);

    // 6. Rechazo de tipos inválidos en q (número en vez de string)
    const invalidTypeResult = catalogSearchParamsSchema.safeParse({
      q: 12345 as unknown as string,
    });
    expect(invalidTypeResult.success).toBe(false);

    // 7. Validación de uuidParamSchema
    const validUuidParam = uuidParamSchema.parse({
      id: "a0f1e2d3-1111-4000-8000-111111111111",
    });
    expect(validUuidParam.id).toBe("a0f1e2d3-1111-4000-8000-111111111111");

    const invalidUuidParam = uuidParamSchema.safeParse({
      id: "abc-123-not-uuid",
    });
    expect(invalidUuidParam.success).toBe(false);

    const extraKeyUuidParam = uuidParamSchema.safeParse({
      id: "a0f1e2d3-1111-4000-8000-111111111111",
      extra: true,
    });
    expect(extraKeyUuidParam.success).toBe(false);

    // 8. Normalizador de parámetros de filtro
    expect(normalizeFilterParam(undefined)).toEqual([]);
    expect(normalizeFilterParam("b1a2c3d4-0001-4000-8000-000000000001")).toEqual([
      "b1a2c3d4-0001-4000-8000-000000000001",
    ]);
    expect(
      normalizeFilterParam([
        "b1a2c3d4-0001-4000-8000-000000000001",
        "b1a2c3d4-0002-4000-8000-000000000002",
      ]),
    ).toEqual(["b1a2c3d4-0001-4000-8000-000000000001", "b1a2c3d4-0002-4000-8000-000000000002"]);
  });
});
