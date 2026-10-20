import { describe, expect, it, vi, beforeEach } from "vitest";
import { catalogService } from "@/services/catalog-service";
import { api, ApiError } from "@/lib/api";
import type { CatalogProduct, CatalogCategory, CatalogBrand } from "@/types/catalog";

// Mock del cliente HTTP centralizado
vi.mock("@/lib/api", () => {
  return {
    api: {
      get: vi.fn(),
    },
    ApiError: class extends Error {
      status: number;
      data: unknown;
      constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
      }
    },
  };
});

describe("Catalog Service HTTP Client (T-02)", () => {
  const mockProducts: CatalogProduct[] = [
    {
      id: "a0f1e2d3-1111-4000-8000-111111111111",
      name: "Inyector Amarok 2.0 TDI",
      description: "Inyector visible",
      imageUrl: "/uploads/amarok.webp",
      brandId: "b1a2c3d4-0001-4000-8000-000000000001",
      categoryIds: ["cat-1"],
      vehicleCompatibility: "VW Amarok",
      condition: "Nuevo",
      price: 320000,
      showPrice: true,
      visible: true,
      oem: "0445110369",
    },
    {
      id: "a0f1e2d3-2222-4000-8000-222222222222",
      name: "Inyector Ranger 3.2 TDCi (Oculto)",
      description: "Inyector pausado/oculto",
      imageUrl: "/uploads/ranger.webp",
      brandId: "b1a2c3d4-0002-4000-8000-000000000002",
      categoryIds: ["cat-1"],
      vehicleCompatibility: "Ford Ranger",
      condition: "Reacondicionado",
      price: null,
      showPrice: false,
      visible: false,
      oem: "28236381",
    },
    {
      id: "a0f1e2d3-3333-4000-8000-333333333333",
      name: "Inyector Hilux 3.0 D-4D",
      description: "Inyector visible",
      imageUrl: "/uploads/hilux.webp",
      brandId: "b1a2c3d4-0003-4000-8000-000000000003",
      categoryIds: ["cat-2"],
      vehicleCompatibility: "Toyota Hilux",
      condition: "Nuevo",
      price: 350000,
      showPrice: true,
      visible: true,
      oem: "23670-0L050",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consume endpoints de api.ts y filtra visible true para catalogo", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(mockProducts);

    const visibleProducts = await catalogService.getVisibleProducts();

    expect(api.get).toHaveBeenCalledWith("http://localhost:3001/api/products");
    expect(visibleProducts).toHaveLength(2);
    expect(visibleProducts.every((p) => p.visible === true)).toBe(true);
    expect(visibleProducts.map((p) => p.id)).toEqual([
      "a0f1e2d3-1111-4000-8000-111111111111",
      "a0f1e2d3-3333-4000-8000-333333333333",
    ]);
  });

  it("obtiene todos los productos para revalidacion del carrito incluyendo no visibles", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(mockProducts);

    const allProducts = await catalogService.getAllProductsForValidation();

    expect(api.get).toHaveBeenCalledWith("http://localhost:3001/api/products");
    expect(allProducts).toHaveLength(3);
    expect(allProducts.some((p) => p.visible === false)).toBe(true);
  });

  it("obtiene categorias y marcas de los endpoints correspondientes", async () => {
    const mockCategories: CatalogCategory[] = [
      { id: "cat-1", name: "Inyección Common Rail", parentId: null, children: [] },
    ];
    const mockBrands: CatalogBrand[] = [{ id: "brand-1", name: "Bosch" }];

    vi.mocked(api.get).mockResolvedValueOnce(mockCategories);
    vi.mocked(api.get).mockResolvedValueOnce(mockBrands);

    const categories = await catalogService.getCategories();
    const brands = await catalogService.getBrands();

    expect(api.get).toHaveBeenCalledWith("http://localhost:3001/api/categories");
    expect(api.get).toHaveBeenCalledWith("http://localhost:3001/api/brands");
    expect(categories).toEqual(mockCategories);
    expect(brands).toEqual(mockBrands);
  });

  it("obtiene un producto por su id individual", async () => {
    const singleProduct = mockProducts[0]!;
    vi.mocked(api.get).mockResolvedValueOnce(singleProduct);

    const product = await catalogService.getProductById(singleProduct.id);

    expect(api.get).toHaveBeenCalledWith(`http://localhost:3001/api/products/${singleProduct.id}`);
    expect(product).toEqual(singleProduct);
  });

  it("propaga errores tipados ApiError en caso de fallo de red o servidor", async () => {
    const networkError = new ApiError("Error de conexion con el backend", 500);
    vi.mocked(api.get).mockRejectedValueOnce(networkError);

    await expect(catalogService.getVisibleProducts()).rejects.toThrow(
      "Error de conexion con el backend",
    );
  });
});
