import { describe, expect, it } from "vitest";
import { expandCategoryIds, filterCatalogProducts } from "@/lib/catalog-filter";
import type { CatalogProduct, CatalogCategory, CatalogBrand } from "@/types/catalog";

describe("Catalog Hierarchical Filtering (T-05)", () => {
  const sampleCategories: CatalogCategory[] = [
    {
      id: "cat-root-common-rail",
      name: "Inyección Common Rail",
      parentId: null,
      children: [
        { id: "cat-child-inyectores", name: "Inyectores Common Rail" },
        { id: "cat-child-bombas", name: "Bombas de Alta Presión" },
      ],
    },
    {
      id: "cat-child-inyectores",
      name: "Inyectores Common Rail",
      parentId: "cat-root-common-rail",
    },
    {
      id: "cat-child-bombas",
      name: "Bombas de Alta Presión",
      parentId: "cat-root-common-rail",
    },
    {
      id: "cat-root-piezo",
      name: "Inyección Piezoeléctrica",
      parentId: null,
      children: [{ id: "cat-child-piezo", name: "Inyectores Piezoeléctricos" }],
    },
    {
      id: "cat-child-piezo",
      name: "Inyectores Piezoeléctricos",
      parentId: "cat-root-piezo",
    },
  ];

  const sampleBrands: CatalogBrand[] = [
    { id: "brand-bosch", name: "Bosch" },
    { id: "brand-delphi", name: "Delphi" },
    { id: "brand-denso", name: "Denso" },
  ];

  const sampleProducts: CatalogProduct[] = [
    {
      id: "prod-1",
      name: "Inyector Amarok 2.0 TDI",
      description: "Inyector Common Rail",
      imageUrl: "/uploads/amarok.webp",
      brandId: "brand-bosch",
      categoryIds: ["cat-child-inyectores"],
      vehicleCompatibility: "Volkswagen Amarok",
      condition: "Nuevo",
      price: 320000,
      showPrice: true,
      visible: true,
      oem: "0445110369",
    },
    {
      id: "prod-2",
      name: "Bomba de Alta Presión CP4",
      description: "Bomba Common Rail",
      imageUrl: "/uploads/cp4.webp",
      brandId: "brand-bosch",
      categoryIds: ["cat-child-bombas"],
      vehicleCompatibility: "Volkswagen Amarok",
      condition: "Nuevo",
      price: 650000,
      showPrice: true,
      visible: true,
      oem: "0445010507",
    },
    {
      id: "prod-3",
      name: "Inyector Piezoeléctrico Sprinter",
      description: "Inyector Piezo",
      imageUrl: "/uploads/sprinter.webp",
      brandId: "brand-delphi",
      categoryIds: ["cat-child-piezo"],
      vehicleCompatibility: "Mercedes-Benz Sprinter",
      condition: "Reacondicionado",
      price: null,
      showPrice: false,
      visible: true,
      oem: "28236381",
    },
  ];

  it("expande categorias padre a hijas y aplica AND entre dimensiones", () => {
    // 1. Verificación de expandCategoryIds:
    // Seleccionar la categoría padre debe expandir a [padre, hija-inyectores, hija-bombas]
    const expandedRoot = expandCategoryIds(["cat-root-common-rail"], sampleCategories);
    expect(expandedRoot.has("cat-root-common-rail")).toBe(true);
    expect(expandedRoot.has("cat-child-inyectores")).toBe(true);
    expect(expandedRoot.has("cat-child-bombas")).toBe(true);
    expect(expandedRoot.has("cat-child-piezo")).toBe(false);

    // Seleccionar solo una hija no expande a otras hijas
    const expandedChild = expandCategoryIds(["cat-child-inyectores"], sampleCategories);
    expect(expandedChild.has("cat-child-inyectores")).toBe(true);
    expect(expandedChild.has("cat-child-bombas")).toBe(false);

    // 2. Filtrado por categoría padre:
    // Debe incluir productos asociados a cualquiera de sus subcategorías (prod-1 y prod-2)
    const filteredByParent = filterCatalogProducts({
      products: sampleProducts,
      selectedCategoryIds: ["cat-root-common-rail"],
      categories: sampleCategories,
    });
    expect(filteredByParent).toHaveLength(2);
    expect(filteredByParent.map((p) => p.id)).toEqual(expect.arrayContaining(["prod-1", "prod-2"]));

    // 3. Filtrado por subcategoría específica:
    // Solo debe incluir productos vinculados a esa subcategoría exacta
    const filteredByChild = filterCatalogProducts({
      products: sampleProducts,
      selectedCategoryIds: ["cat-child-bombas"],
      categories: sampleCategories,
    });
    expect(filteredByChild).toHaveLength(1);
    expect(filteredByChild[0]?.id).toBe("prod-2");

    // 4. Operador OR entre múltiples marcas seleccionadas:
    const filteredByBrands = filterCatalogProducts({
      products: sampleProducts,
      selectedBrandIds: ["brand-bosch", "brand-delphi"],
    });
    expect(filteredByBrands).toHaveLength(3);

    // 5. Operador AND estricto entre búsqueda, marca y categoría:
    // Categoría padre: "Inyección Common Rail" (prod-1 y prod-2)
    // Marca: "Bosch" (prod-1 y prod-2)
    // Búsqueda: "Bomba" -> Exclusivamente prod-2
    const combinedFiltered = filterCatalogProducts({
      products: sampleProducts,
      searchQuery: "Bomba",
      selectedBrandIds: ["brand-bosch"],
      selectedCategoryIds: ["cat-root-common-rail"],
      categories: sampleCategories,
      brandsLookup: sampleBrands,
    });
    expect(combinedFiltered).toHaveLength(1);
    expect(combinedFiltered[0]?.id).toBe("prod-2");

    // 6. Sin coincidencia cruzada:
    // Categoría: Common Rail, pero Marca: Delphi -> Ningún producto cumple ambos
    const noCrossMatch = filterCatalogProducts({
      products: sampleProducts,
      selectedBrandIds: ["brand-delphi"],
      selectedCategoryIds: ["cat-child-bombas"],
      categories: sampleCategories,
    });
    expect(noCrossMatch).toHaveLength(0);
  });
});
