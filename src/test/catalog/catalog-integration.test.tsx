import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CatalogPage } from "@/routes/catalogo";
import { CatalogCartProvider } from "@/context/catalog-cart-context";
import { catalogService } from "@/services/catalog-service";
import type { CatalogProduct, CatalogBrand, CatalogCategory } from "@/types/catalog";

// Mock del cliente HTTP centralizado catalogService
vi.mock("@/services/catalog-service", () => ({
  catalogService: {
    getVisibleProducts: vi.fn(),
    getAllProductsForValidation: vi.fn(),
    getBrands: vi.fn(),
    getCategories: vi.fn(),
    getProductById: vi.fn(),
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
  { id: "brand-denso", name: "Denso" },
];

const mockCategories: CatalogCategory[] = [
  {
    id: "cat-inyectores",
    name: "Inyectores Common Rail",
    parentId: null,
    children: [
      { id: "cat-piezo", name: "Piezoeléctricos" },
      { id: "cat-toberas", name: "Toberas de Inyección" },
    ],
  },
  {
    id: "cat-piezo",
    name: "Piezoeléctricos",
    parentId: "cat-inyectores",
  },
  {
    id: "cat-toberas",
    name: "Toberas de Inyección",
    parentId: "cat-inyectores",
  },
  {
    id: "cat-bombas",
    name: "Bombas de Alta Presión",
    parentId: null,
    children: [],
  },
];

const mockProducts: CatalogProduct[] = [
  {
    id: "prod-bosch-cr",
    name: "Inyector Bosch Hilux 2.8",
    brandId: "brand-bosch",
    categoryIds: ["cat-piezo"],
    vehicleCompatibility: "Toyota Hilux 2.8 D4D",
    condition: "Nuevo",
    price: 250000,
    showPrice: true,
    visible: true,
    oem: "0445110231",
    imageUrl: "/uploads/bosch-cr.webp",
    description: "Inyector Common Rail nuevo original.",
  },
  {
    id: "prod-delphi-dfp",
    name: "Bomba Delphi Ranger 3.2",
    brandId: "brand-delphi",
    categoryIds: ["cat-bombas"],
    vehicleCompatibility: "Ford Ranger 3.2 TDCi",
    condition: "Reacondicionado",
    price: 450000,
    showPrice: true,
    visible: true,
    oem: "28343144",
    imageUrl: "/uploads/delphi-dfp.webp",
    description: "Bomba reacondicionada y calibrada.",
  },
  {
    id: "prod-denso-tob",
    name: "Tobera Denso DMAX 3.0",
    brandId: "brand-denso",
    categoryIds: ["cat-toberas"],
    vehicleCompatibility: "Isuzu D-Max 3.0",
    condition: "Nuevo",
    price: null,
    showPrice: false,
    visible: true,
    oem: "095000-5471",
    imageUrl: "",
    description: "Tobera nueva original.",
  },
];

describe("Pruebas de Integración E2E del Catálogo (Spec 003)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("flujo completo de navegacion busqueda carrito y checkout", async () => {
    // Configurar respuestas autoritativas del backend
    vi.mocked(catalogService.getVisibleProducts).mockResolvedValue(mockProducts);
    vi.mocked(catalogService.getAllProductsForValidation).mockResolvedValue(mockProducts);
    vi.mocked(catalogService.getBrands).mockResolvedValue(mockBrands);
    vi.mocked(catalogService.getCategories).mockResolvedValue(mockCategories);

    // =========================================================================
    // Paso 1: Carga inicial asíncrona con skeleton y renderizado de la grilla
    // =========================================================================
    render(
      <CatalogCartProvider>
        <CatalogPage />
      </CatalogCartProvider>,
    );

    // Esperar a que la API responda y la grilla se monte
    await waitFor(() => {
      expect(screen.getByTestId("catalog-product-grid")).toBeInTheDocument();
    });

    expect(screen.getByText("Inyector Bosch Hilux 2.8")).toBeInTheDocument();
    expect(screen.getByText("Bomba Delphi Ranger 3.2")).toBeInTheDocument();
    expect(screen.getByText("Tobera Denso DMAX 3.0")).toBeInTheDocument();
    expect(screen.getByText("3 productos disponibles")).toBeInTheDocument();

    // =========================================================================
    // Paso 2: Búsqueda técnica por Código OEM con priorización (RF-03)
    // =========================================================================
    const searchInput = screen.getByTestId("catalog-search-input");
    fireEvent.change(searchInput, { target: { value: "0445110231" } });

    // Solo el inyector Bosch coincide con el código OEM
    expect(screen.getByText("Inyector Bosch Hilux 2.8")).toBeInTheDocument();
    expect(screen.queryByText("Bomba Delphi Ranger 3.2")).not.toBeInTheDocument();
    expect(screen.queryByText("Tobera Denso DMAX 3.0")).not.toBeInTheDocument();

    // Limpiar búsqueda
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getByText("Bomba Delphi Ranger 3.2")).toBeInTheDocument();

    // =========================================================================
    // Paso 3: Filtrado por Categoría Padre con resolución jerárquica (RF-04)
    // =========================================================================
    // Marcar la categoría raíz "Inyectores Common Rail" (debe expandir hijas cat-piezo y cat-toberas)
    const categoryParentCheckbox = screen.getByTestId("checkbox-cat-cat-inyectores");
    fireEvent.click(categoryParentCheckbox);

    // Debe mostrar el inyector piezoeléctrico y la tobera (ambos hijos de inyectores)
    expect(screen.getByText("Inyector Bosch Hilux 2.8")).toBeInTheDocument();
    expect(screen.getByText("Tobera Denso DMAX 3.0")).toBeInTheDocument();
    // La bomba (categoría Bombas) queda excluida
    expect(screen.queryByText("Bomba Delphi Ranger 3.2")).not.toBeInTheDocument();

    // Desmarcar filtro de categoría para restaurar listado
    fireEvent.click(screen.getByTestId("checkbox-cat-cat-inyectores"));
    expect(screen.getByText("Bomba Delphi Ranger 3.2")).toBeInTheDocument();

    // =========================================================================
    // Paso 4: Agregado reactivo al carrito y consolidación de unidades (RF-08)
    // =========================================================================
    const addToCartBoschBtn = screen.getByRole("button", {
      name: /Agregar Inyector Bosch Hilux 2\.8 al carrito/i,
    });
    fireEvent.click(addToCartBoschBtn);

    // Badge flotante del carrito indica 1 unidad
    const floatingCartBadge = screen.getByTestId("floating-cart-badge");
    expect(floatingCartBadge).toHaveTextContent("1");

    // Click nuevamente para incrementar a 2 unidades consolidadas en una fila
    const addMoreBoschBtn = screen.getByRole("button", {
      name: /En el carrito \(1\)\. Agregar una unidad más/i,
    });
    fireEvent.click(addMoreBoschBtn);

    expect(floatingCartBadge).toHaveTextContent("2");

    // =========================================================================
    // Paso 5: Revalidación activa contra backend y despliegue del CartDrawer
    // =========================================================================
    const floatingCartButton = screen.getByTestId("floating-cart-button");
    fireEvent.click(floatingCartButton);

    expect(screen.getByTestId("cart-drawer-sheet")).toBeInTheDocument();

    // El drawer debe mostrar el producto enriquecido con cantidad 2
    await waitFor(() => {
      expect(screen.getByTestId("quantity-prod-bosch-cr")).toHaveTextContent("2");
    });

    // Subtotal de 2x $250.000 = $500.000 ARS
    expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("$500.000 ARS");

    // =========================================================================
    // Paso 6: Generación y Validación del Pedido hacia WhatsApp (RF-10, RF-12)
    // =========================================================================
    const whatsappCheckoutButton = screen.getByTestId("whatsapp-checkout-button");
    expect(whatsappCheckoutButton).toHaveAttribute("target", "_blank");

    const checkoutHref = whatsappCheckoutButton.getAttribute("href") || "";
    expect(checkoutHref).toContain("https://wa.me/5492657659108");

    // Decodificar mensaje enviado en URL
    const urlObj = new URL(checkoutHref);
    const whatsappMessage = urlObj.searchParams.get("text") || "";

    // Validar estructura y contenido del mensaje según RF-10 y RF-12
    expect(whatsappMessage).toContain(
      "Quisiera solicitar cotización para los siguientes repuestos:",
    );
    expect(whatsappMessage).toContain("2x Inyector Bosch Hilux 2.8");
    expect(whatsappMessage).toContain("Marca: Bosch");
    expect(whatsappMessage).toContain("OEM: 0445110231");
    expect(whatsappMessage).toContain("$500.000 ARS ($250.000 ARS c/u)");
    expect(whatsappMessage).toContain("Subtotal productos con precio público: $500.000 ARS");
    expect(whatsappMessage).toContain(
      "¿Podrían confirmarme compatibilidad técnica y disponibilidad de entrega?",
    );
    // Principio 5 / RF-12: no menciona reservas automáticas ni inventario de existencias
    expect(whatsappMessage.toLowerCase()).not.toContain("stock");
    expect(whatsappMessage.toLowerCase()).not.toContain("reserva");
  });
});
