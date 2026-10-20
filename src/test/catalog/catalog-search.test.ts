import { describe, expect, it } from "vitest";
import { normalizeSearchText, searchProducts, evaluateProductMatch } from "@/lib/catalog-search";
import type { CatalogProduct, CatalogBrand } from "@/types/catalog";

describe("Catalog Technical Search & Normalization (T-04)", () => {
  const sampleBrands: CatalogBrand[] = [
    { id: "b-bosch", name: "Bosch" },
    { id: "b-delphi", name: "Delphi" },
    { id: "b-denso", name: "Denso" },
  ];

  const sampleProducts: CatalogProduct[] = [
    {
      id: "prod-1",
      name: "Inyector Amarok 2.0 TDI",
      description: "Inyector Common Rail",
      imageUrl: "/uploads/amarok.webp",
      brandId: "b-bosch",
      categoryIds: ["cat-1"],
      vehicleCompatibility: "Volkswagen Amarok 2.0 TDI",
      condition: "Nuevo",
      price: 320000,
      showPrice: true,
      visible: true,
      oem: "0445110369",
    },
    {
      id: "prod-2",
      name: "Repuesto con código 0445110 en nombre",
      description: "Pieza alternativa",
      imageUrl: "/uploads/alt.webp",
      brandId: "b-delphi",
      categoryIds: ["cat-1"],
      vehicleCompatibility: "Universal",
      condition: "Reacondicionado",
      price: 150000,
      showPrice: true,
      visible: true,
      oem: "999888777", // No coincide en OEM
    },
    {
      id: "prod-3",
      name: "Bomba de Inyección Common Rail",
      description: "Bomba de alta presión",
      imageUrl: "/uploads/bomba.webp",
      brandId: "b-bosch",
      categoryIds: ["cat-2"],
      vehicleCompatibility: "Mercedes-Benz Sprinter",
      condition: "Nuevo",
      price: 450000,
      showPrice: true,
      visible: true,
      oem: "0445110999", // Coincide en OEM
    },
    {
      id: "prod-4",
      name: "Inyector Ranger 3.2 TDCi",
      description: "Inyector para motor Puma",
      imageUrl: "/uploads/ranger.webp",
      brandId: "b-delphi",
      categoryIds: ["cat-1"],
      vehicleCompatibility: "Ford Ranger 3.2 Puma TDCi",
      condition: "Reacondicionado",
      price: null,
      showPrice: false,
      visible: true,
      oem: "28236381",
    },
  ];

  it("normaliza acentos y prioriza resultados coincidentes por OEM", () => {
    // 1. Verificar normalización Unicode NFD
    expect(normalizeSearchText("INYECCIÓN")).toBe("inyeccion");
    expect(normalizeSearchText("  Ámárók 2.0  ")).toBe("amarok 2.0");
    expect(normalizeSearchText(null)).toBe("");
    expect(normalizeSearchText(undefined)).toBe("");

    // 2. Búsqueda por fragmento "0445110":
    // prod-1 coincide por OEM ("0445110369") -> prioridad 0
    // prod-3 coincide por OEM ("0445110999") -> prioridad 0
    // prod-2 coincide por NOMBRE ("Repuesto con código 0445110...") -> prioridad 1
    const results = searchProducts(sampleProducts, "0445110", sampleBrands);

    expect(results).toHaveLength(3);

    // Los dos primeros DEBEN ser prod-1 y prod-3 (coincidencias por OEM)
    const firstTwoIds = [results[0]?.id, results[1]?.id];
    expect(firstTwoIds).toContain("prod-1");
    expect(firstTwoIds).toContain("prod-3");

    // El último DEBE ser prod-2 (coincidencia solo en nombre)
    expect(results[2]?.id).toBe("prod-2");

    // 3. Búsqueda insensible a tildes y mayúsculas:
    // "inyeccion" (sin tilde) encuentra "Bomba de Inyección..." (con tilde)
    const accentResults = searchProducts(sampleProducts, "inyeccion", sampleBrands);
    expect(accentResults).toHaveLength(1);
    expect(accentResults[0]?.id).toBe("prod-3");

    // "inyec" encuentra tanto "Inyector..." como "Bomba de Inyección..."
    const partialResults = searchProducts(sampleProducts, "inyec", sampleBrands);
    const partialIds = partialResults.map((p) => p.id);
    expect(partialIds).toContain("prod-1");
    expect(partialIds).toContain("prod-3");
    expect(partialIds).toContain("prod-4");

    // 4. Búsqueda por marca ("BOSCH")
    const brandResults = searchProducts(sampleProducts, "BOSCH", sampleBrands);
    expect(brandResults.map((p) => p.id)).toEqual(expect.arrayContaining(["prod-1", "prod-3"]));

    // 5. Búsqueda por compatibilidad vehicular ("puma")
    const compatResults = searchProducts(sampleProducts, "puma", sampleBrands);
    expect(compatResults).toHaveLength(1);
    expect(compatResults[0]?.id).toBe("prod-4");

    // 6. Búsqueda vacía retorna todos los productos
    const emptyResults = searchProducts(sampleProducts, "   ", sampleBrands);
    expect(emptyResults).toHaveLength(4);

    // 7. Búsqueda sin coincidencias retorna array vacío
    const noResults = searchProducts(sampleProducts, "motorcraft v8 turbo", sampleBrands);
    expect(noResults).toHaveLength(0);
  });
});
