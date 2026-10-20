import { describe, expect, it } from "vitest";
import type {
  CatalogProduct,
  CatalogBrand,
  CatalogCategory,
  CartItemCache,
  CartCacheV1,
  EnrichedCartItem,
  ProductCondition,
} from "@/types/catalog";
import type { AdminProduct } from "@/types/admin";

describe("Catalog TypeScript Contracts & DTOs (T-01)", () => {
  it("tipos del catalogo coinciden con DTOs y excluyen stock", () => {
    // 1. Instanciar una entidad de producto que emula la respuesta del backend
    const sampleProduct: CatalogProduct = {
      id: "a0f1e2d3-1111-4000-8000-111111111111",
      name: "Inyector Amarok 2.0 TDI",
      description: "Inyector de alta precisión Common Rail calibrado en banco de pruebas.",
      imageUrl: "/uploads/amarok-20-tdi.webp",
      brandId: "b1a2c3d4-0001-4000-8000-000000000001",
      categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891001", "e4b6d812-7a2b-4f51-b8f3-0a567c891002"],
      vehicleCompatibility: "Volkswagen Amarok 2.0 TDI (2010-2021)",
      condition: "Nuevo",
      price: 320000,
      showPrice: true,
      visible: true,
      oem: "0445110369",
    };

    // 2. Verificar correspondencia con los campos clave de AdminProduct
    const adminProductEquiv: AdminProduct = {
      id: sampleProduct.id,
      name: sampleProduct.name,
      description: sampleProduct.description,
      imageUrl: sampleProduct.imageUrl,
      brandId: sampleProduct.brandId,
      categoryIds: sampleProduct.categoryIds,
      vehicleCompatibility: sampleProduct.vehicleCompatibility ?? "",
      condition: sampleProduct.condition,
      price: sampleProduct.price,
      showPrice: sampleProduct.showPrice,
      visible: sampleProduct.visible,
      oem: sampleProduct.oem ?? "",
    };
    expect(adminProductEquiv.id).toBe(sampleProduct.id);
    expect(adminProductEquiv.brandId).toBe(sampleProduct.brandId);

    // 3. Verificación estricta de exclusión de campos de stock o inventario
    const productKeys = Object.keys(sampleProduct);
    const prohibitedStockKeys = [
      "stock",
      "inventory",
      "quantityInStock",
      "availableStock",
      "stockCount",
      "isAvailable",
    ];

    for (const forbidden of prohibitedStockKeys) {
      expect(productKeys).not.toContain(forbidden);
    }

    // 4. Verificar estructura de categorías jerárquicas y marcas
    const sampleCategory: CatalogCategory = {
      id: "e4b6d812-7a2b-4f51-b8f3-0a567c891001",
      name: "Inyección Common Rail",
      parentId: null,
      children: [{ id: "e4b6d812-7a2b-4f51-b8f3-0a567c891002", name: "Inyectores Common Rail" }],
    };
    expect(sampleCategory.parentId).toBeNull();
    expect(sampleCategory.children).toHaveLength(1);

    const sampleBrand: CatalogBrand = {
      id: "b1a2c3d4-0001-4000-8000-000000000001",
      name: "Bosch",
    };
    expect(sampleBrand.name).toBe("Bosch");

    // 5. Verificar modelo efímero de caché del carrito y enriquecimiento
    const sampleCartCache: CartCacheV1 = {
      version: 1,
      items: [
        {
          productId: sampleProduct.id,
          quantity: 2,
          lastKnown: {
            name: sampleProduct.name,
            oem: sampleProduct.oem,
          },
        },
      ],
    };
    expect(sampleCartCache.version).toBe(1);
    expect(sampleCartCache.items[0]?.quantity).toBe(2);

    const sampleEnrichedItem: EnrichedCartItem = {
      productId: sampleProduct.id,
      quantity: 2,
      name: sampleProduct.name,
      oem: sampleProduct.oem,
      imageUrl: sampleProduct.imageUrl,
      brandName: sampleBrand.name,
      condition: sampleProduct.condition,
      price: sampleProduct.price,
      showPrice: sampleProduct.showPrice,
      visible: sampleProduct.visible,
      requiresReconfirmation: false,
      isDeletedOrUnavailable: false,
    };
    expect(sampleEnrichedItem.requiresReconfirmation).toBe(false);
    expect(Object.keys(sampleEnrichedItem)).not.toContain("stock");
  });
});
