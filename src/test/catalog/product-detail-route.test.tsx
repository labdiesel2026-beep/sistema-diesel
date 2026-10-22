import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductDetailPage } from "@/routes/catalogo.$productId";
import { CatalogCartProvider } from "@/context/catalog-cart-context";
import { catalogService } from "@/services/catalog-service";
import type { CatalogProduct, CatalogBrand } from "@/types/catalog";

// Mock del cliente HTTP catalogService
vi.mock("@/services/catalog-service", () => ({
  catalogService: {
    getProductById: vi.fn(),
    getAllProductsForValidation: vi.fn().mockResolvedValue([]),
    getBrands: vi.fn().mockResolvedValue([]),
    getCategories: vi.fn().mockResolvedValue([]),
  },
}));

// Mock de @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({
    useParams: vi.fn(() => ({ productId: "prod-100" })),
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

const mockVisibleProduct: CatalogProduct = {
  id: "prod-visible",
  name: "Inyector Common Rail Bosch CRI",
  brandId: "brand-bosch",
  categoryIds: ["cat-cr"],
  vehicleCompatibility: "Toyota Hilux 2.8 D4D",
  condition: "Nuevo",
  price: 280000,
  showPrice: true,
  visible: true,
  oem: "0445110001",
  imageUrl: "/uploads/prod-visible.webp",
  description: "Inyector Bosch nuevo con calibración de banco computarizado.",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockHiddenProduct: CatalogProduct = {
  id: "prod-hidden",
  name: "Bomba Inyectora Delphi Oculta",
  brandId: "brand-delphi",
  categoryIds: ["cat-bombas"],
  vehicleCompatibility: null,
  condition: "Reacondicionado",
  price: null,
  showPrice: false,
  visible: false,
  oem: "28343144",
  imageUrl: "",
  description: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockBrand: CatalogBrand = {
  id: "brand-bosch",
  name: "Bosch",
};

describe("Ruta /catalogo/$productId (Ficha Técnica)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra ficha tecnica para producto visible y estado no disponible para oculto", async () => {
    // 1. Escenario A: Producto Visible y Disponible (RF-06, RF-07, RF-09)
    vi.mocked(catalogService.getProductById).mockResolvedValue(mockVisibleProduct);
    vi.mocked(catalogService.getBrands).mockResolvedValue([mockBrand]);

    const { rerender } = render(
      <CatalogCartProvider>
        <ProductDetailPage mockProduct={mockVisibleProduct} mockBrand={mockBrand} />
      </CatalogCartProvider>,
    );

    // Valida nombre en encabezado h1, marca, OEM, condición y compatibilidad
    expect(
      screen.getByRole("heading", { level: 1, name: "Inyector Common Rail Bosch CRI" }),
    ).toBeInTheDocument();
    expect(screen.getByText("OEM 0445110001")).toBeInTheDocument();
    expect(screen.getAllByText("Bosch").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Nuevo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Toyota Hilux 2.8 D4D")).toBeInTheDocument();

    // Valida precio en ARS
    expect(screen.getByText("$280.000 ARS")).toBeInTheDocument();

    // Valida botón de WhatsApp directo
    const whatsappBtn = screen.getByTestId("direct-whatsapp-button");
    expect(whatsappBtn).toHaveAttribute("target", "_blank");
    expect(whatsappBtn.getAttribute("href")).toContain("https://wa.me/");
    expect(whatsappBtn.getAttribute("href")).toContain("0445110001");
    expect(whatsappBtn.className).toContain("bg-whatsapp");
    expect(whatsappBtn.className).toContain("h-12");

    // Valida agregado al carrito
    const addToCartBtn = screen.getByTestId("add-to-cart-button");
    fireEvent.click(addToCartBtn);

    // Debe mutar el botón a "En el carrito (1) · Agregar"
    expect(screen.getByText(/En el carrito \(1\) · Agregar/i)).toBeInTheDocument();

    // Valida enlace de regreso al catálogo
    const backLink = screen.getByTestId("back-to-catalog-link");
    expect(backLink).toHaveAttribute("href", "/catalogo");

    // 2. Escenario B: Producto Oculto (visible === false) (RF-11)
    rerender(
      <CatalogCartProvider>
        <ProductDetailPage mockProduct={mockHiddenProduct} />
      </CatalogCartProvider>,
    );

    // Debe mostrar la vista de "Producto no disponible"
    expect(screen.getByTestId("product-unavailable-state")).toBeInTheDocument();
    expect(screen.getByText("Producto no disponible")).toBeInTheDocument();
    expect(
      screen.getByText(
        /El repuesto seleccionado no existe, fue pausado temporalmente o ya no se encuentra publicado/i,
      ),
    ).toBeInTheDocument();

    // El botón de agregar al carrito NO debe existir
    expect(screen.queryByTestId("add-to-cart-button")).not.toBeInTheDocument();

    // Debe proveer botón para volver al catálogo
    const backBtn = screen.getByTestId("back-to-catalog-button");
    expect(backBtn).toHaveAttribute("href", "/catalogo");

    // 3. Escenario C: Producto Inexistente (null / 404) (RF-11)
    rerender(
      <CatalogCartProvider>
        <ProductDetailPage mockProduct={null} />
      </CatalogCartProvider>,
    );

    expect(screen.getByTestId("product-unavailable-state")).toBeInTheDocument();
    expect(screen.queryByTestId("add-to-cart-button")).not.toBeInTheDocument();
  });
});
