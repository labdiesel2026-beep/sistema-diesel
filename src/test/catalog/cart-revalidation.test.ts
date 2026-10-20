import { describe, expect, it, vi, beforeEach } from "vitest";
import { enrichCartItems, revalidateCartItems } from "@/lib/cart-revalidation";
import { catalogService } from "@/services/catalog-service";
import type { CartItemCache, CatalogProduct, CatalogBrand } from "@/types/catalog";

vi.mock("@/services/catalog-service", () => ({
  catalogService: {
    getAllProductsForValidation: vi.fn(),
    getBrands: vi.fn(),
  },
}));

describe("Cart Authorization Revalidation (T-08)", () => {
  const sampleBrands: CatalogBrand[] = [
    { id: "b1a2c3d4-0001-4000-8000-000000000001", name: "Bosch" },
    { id: "b1a2c3d4-0002-4000-8000-000000000002", name: "Delphi" },
  ];

  const freshDatabaseProducts: CatalogProduct[] = [
    {
      id: "prod-active",
      name: "Inyector Amarok 2.0 TDI Actualizado",
      description: "Precio actualizado en DB",
      imageUrl: "/uploads/amarok-updated.webp",
      brandId: "b1a2c3d4-0001-4000-8000-000000000001",
      categoryIds: ["cat-1"],
      vehicleCompatibility: "Volkswagen Amarok",
      condition: "Nuevo",
      price: 380000, // Precio autoritativo nuevo
      showPrice: true,
      visible: true,
      oem: "0445110369",
    },
    {
      id: "prod-paused",
      name: "Inyector Ranger 3.2 TDCi (Pausado)",
      description: "Ocultado en panel de admin",
      imageUrl: "/uploads/ranger.webp",
      brandId: "b1a2c3d4-0002-4000-8000-000000000002",
      categoryIds: ["cat-1"],
      vehicleCompatibility: "Ford Ranger",
      condition: "Reacondicionado",
      price: 290000,
      showPrice: true,
      visible: false, // Oculto / No visible
      oem: "28236381",
    },
  ];

  const cachedCartItems: CartItemCache[] = [
    // 1. Ítem activo cuyo precio cambió en la base de datos
    {
      productId: "prod-active",
      quantity: 2,
      lastKnown: {
        name: "Inyector Amarok Nombre Antiguo",
        oem: "0445110369",
      },
    },
    // 2. Ítem que fue ocultado en el panel (visible === false)
    {
      productId: "prod-paused",
      quantity: 1,
      lastKnown: {
        name: "Inyector Ranger 3.2 TDCi",
        oem: "28236381",
      },
    },
    // 3. Ítem que fue eliminado físicamente de la base de datos
    {
      productId: "prod-deleted-uuid",
      quantity: 3,
      lastKnown: {
        name: "Inyector Hilux Descontinuado",
        oem: "23670-0L050",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detecta productos no visibles y actualiza precios autoritativos", async () => {
    vi.mocked(catalogService.getAllProductsForValidation).mockResolvedValueOnce(
      freshDatabaseProducts,
    );
    vi.mocked(catalogService.getBrands).mockResolvedValueOnce(sampleBrands);

    const enriched = await revalidateCartItems(cachedCartItems);

    expect(enriched).toHaveLength(3);

    // 1. Verificar actualización autoritativa del ítem activo:
    const activeItem = enriched.find((item) => item.productId === "prod-active");
    expect(activeItem).toBeDefined();
    expect(activeItem?.name).toBe("Inyector Amarok 2.0 TDI Actualizado"); // Sobrescribe lastKnown
    expect(activeItem?.price).toBe(380000); // Precio fresco autoritativo
    expect(activeItem?.showPrice).toBe(true);
    expect(activeItem?.visible).toBe(true);
    expect(activeItem?.requiresReconfirmation).toBe(false);
    expect(activeItem?.isDeletedOrUnavailable).toBe(false);
    expect(activeItem?.brandName).toBe("Bosch");

    // 2. Verificar detección de producto pausado / visible === false:
    const pausedItem = enriched.find((item) => item.productId === "prod-paused");
    expect(pausedItem).toBeDefined();
    expect(pausedItem?.visible).toBe(false);
    expect(pausedItem?.requiresReconfirmation).toBe(true); // Requiere reconfirmación
    expect(pausedItem?.price).toBeNull(); // Forzado a null para cotizar
    expect(pausedItem?.showPrice).toBe(false);
    expect(pausedItem?.isDeletedOrUnavailable).toBe(false);

    // 3. Verificar detección de producto eliminado físicamente:
    const deletedItem = enriched.find((item) => item.productId === "prod-deleted-uuid");
    expect(deletedItem).toBeDefined();
    expect(deletedItem?.name).toBe("Inyector Hilux Descontinuado"); // Preserva lastKnown
    expect(deletedItem?.oem).toBe("23670-0L050");
    expect(deletedItem?.visible).toBe(false);
    expect(deletedItem?.requiresReconfirmation).toBe(true);
    expect(deletedItem?.isDeletedOrUnavailable).toBe(true);
    expect(deletedItem?.price).toBeNull();
  });

  it("retorna array vacio de inmediato si el carrito no tiene items sin llamar a la API", async () => {
    const enriched = await revalidateCartItems([]);
    expect(enriched).toEqual([]);
    expect(catalogService.getAllProductsForValidation).not.toHaveBeenCalled();
  });

  it("propaga el error si la llamada de red al backend falla", async () => {
    vi.mocked(catalogService.getAllProductsForValidation).mockRejectedValueOnce(
      new Error("Fallo de conexion con backend"),
    );
    vi.mocked(catalogService.getBrands).mockResolvedValueOnce(sampleBrands);

    await expect(revalidateCartItems(cachedCartItems)).rejects.toThrow(
      "Fallo de conexion con backend",
    );
  });
});
