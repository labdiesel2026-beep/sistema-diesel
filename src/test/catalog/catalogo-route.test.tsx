import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CatalogPage } from "@/routes/catalogo";
import { CatalogCartProvider } from "@/context/catalog-cart-context";
import { catalogService } from "@/services/catalog-service";
import type { CatalogProduct, CatalogBrand, CatalogCategory } from "@/types/catalog";

// Mock del cliente HTTP catalogService
vi.mock("@/services/catalog-service", () => ({
  catalogService: {
    getVisibleProducts: vi.fn(),
    getAllProductsForValidation: vi.fn().mockResolvedValue([]),
    getBrands: vi.fn(),
    getCategories: vi.fn(),
  },
}));

// Mock de @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({
    useSearch: vi.fn(() => ({ q: "" })),
    useNavigate: vi.fn(() => vi.fn()),
  }),
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const mockBrands: CatalogBrand[] = [
  { id: "brand-bosch", name: "Bosch" },
  { id: "brand-delphi", name: "Delphi" },
];

const mockCategories: CatalogCategory[] = [
  {
    id: "cat-inyectores",
    name: "Inyectores",
    parentId: null,
    children: [{ id: "cat-cr", name: "Common Rail" }],
  },
];

const mockProducts: CatalogProduct[] = [
  {
    id: "prod-1",
    name: "Inyector Common Rail Bosch CRI",
    brandId: "brand-bosch",
    categoryIds: ["cat-cr"],
    vehicleCompatibility: "Hilux 2.8",
    condition: "Nuevo",
    price: 250000,
    showPrice: true,
    visible: true,
    oem: "0445110001",
    imageUrl: "/uploads/prod-1.webp",
    description: "Inyector Bosch nuevo",
  },
  {
    id: "prod-2",
    name: "Bomba de Alta Presión Delphi",
    brandId: "brand-delphi",
    categoryIds: ["cat-inyectores"],
    vehicleCompatibility: "Ranger 3.2",
    condition: "Reacondicionado",
    price: 450000,
    showPrice: true,
    visible: true,
    oem: "28343144",
    imageUrl: "",
    description: "Bomba reacondicionada",
  },
];

describe("Ruta /catalogo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("integra layout institucional search params y estados del catalogo", async () => {
    vi.mocked(catalogService.getVisibleProducts).mockResolvedValue(mockProducts);
    vi.mocked(catalogService.getBrands).mockResolvedValue(mockBrands);
    vi.mocked(catalogService.getCategories).mockResolvedValue(mockCategories);

    const handleUpdateSearchParams = vi.fn();

    render(
      <CatalogCartProvider>
        <CatalogPage onUpdateSearchParams={handleUpdateSearchParams} />
      </CatalogCartProvider>,
    );

    // 1. Integración institucional: valida presencia de Navbar y Footer (RF-01)
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();

    // 2. Esperar a que la carga asíncrona resuelva los productos y marcas
    await waitFor(() => {
      expect(screen.getByText("Inyector Common Rail Bosch CRI")).toBeInTheDocument();
      expect(screen.getByText("Bomba de Alta Presión Delphi")).toBeInTheDocument();
    });

    // 3. Validar grilla y tarjetas
    expect(screen.getByTestId("catalog-product-grid")).toBeInTheDocument();
    expect(screen.getByText("2 productos disponibles")).toBeInTheDocument();

    // 4. Búsqueda y filtrado dinámico (RF-03)
    const searchInput = screen.getByTestId("catalog-search-input");
    fireEvent.change(searchInput, { target: { value: "0445110001" } });

    // Debe filtrar únicamente el producto con OEM coincidente
    expect(screen.getByText("Inyector Common Rail Bosch CRI")).toBeInTheDocument();
    expect(screen.queryByText("Bomba de Alta Presión Delphi")).not.toBeInTheDocument();
    expect(handleUpdateSearchParams).toHaveBeenCalledWith(
      expect.objectContaining({ q: "0445110001" }),
    );

    // 5. Estado Sin Resultados con botón de asistencia por WhatsApp (RF-05)
    fireEvent.change(searchInput, { target: { value: "PIEZA_INEXISTENTE_XYZ" } });
    expect(screen.getByTestId("no-results-state")).toBeInTheDocument();
    expect(
      screen.getByText(/No encontramos repuestos con los criterios aplicados/i),
    ).toBeInTheDocument();

    const noResultsWhatsAppBtn = screen.getByTestId("no-results-whatsapp-button");
    expect(noResultsWhatsAppBtn).toHaveAttribute("target", "_blank");
    expect(noResultsWhatsAppBtn.getAttribute("href")).toContain("https://wa.me/");
    expect(noResultsWhatsAppBtn.getAttribute("href")).toContain("PIEZA_INEXISTENTE_XYZ");

    // Limpiar búsqueda mediante botón en estado sin resultados
    const resetSearchBtn = screen.getByTestId("no-results-reset-button");
    fireEvent.click(resetSearchBtn);

    // Vuelven a mostrarse los productos originales
    expect(screen.getByText("Inyector Common Rail Bosch CRI")).toBeInTheDocument();
    expect(screen.getByText("Bomba de Alta Presión Delphi")).toBeInTheDocument();

    // 6. Botón flotante y drawer del carrito (RF-08, RF-10)
    const floatingCartBtn = screen.getByTestId("floating-cart-button");
    expect(floatingCartBtn).toBeInTheDocument();

    // Agregar un producto al carrito
    const addToCartBtn = screen.getByRole("button", {
      name: /Agregar Inyector Common Rail Bosch CRI al carrito/i,
    });
    fireEvent.click(addToCartBtn);

    // El badge flotante debe reflejar 1 producto
    expect(screen.getByTestId("floating-cart-badge")).toHaveTextContent("1");

    // Abrir el carrito desde el botón flotante
    fireEvent.click(floatingCartBtn);
    expect(screen.getByTestId("cart-drawer-sheet")).toBeInTheDocument();
  });
});
