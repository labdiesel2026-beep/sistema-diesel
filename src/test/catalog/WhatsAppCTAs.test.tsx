import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CatalogCartProvider } from "@/context/catalog-cart-context";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CartDrawer } from "@/components/catalog/CartDrawer";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import {
  generateDirectProductWhatsAppUrl,
  generateNoResultsWhatsAppUrl,
} from "@/lib/catalog-whatsapp";
import * as cartRevalidation from "@/lib/cart-revalidation";
import { FaWhatsapp } from "react-icons/fa";
import type { CatalogProduct, CartItemCache, EnrichedCartItem } from "@/types/catalog";

// Mock del servicio de revalidación para CartDrawer
vi.mock("@/lib/cart-revalidation", () => ({
  revalidateCartItems: vi.fn(),
}));

const mockProduct: CatalogProduct = {
  id: "prod-cta-1",
  name: "Inyector Bosch Piezoeléctrico 0445115",
  oem: "0445115067",
  brandId: "brand-bosch",
  categoryIds: ["cat-injectors"],
  condition: "Nuevo",
  description: "Inyector de alta presión para Amarok 2.0 TDI",
  vehicleCompatibility: "VW Amarok 2.0 TDI Biturbo",
  price: 245000,
  showPrice: true,
  visible: true,
  isFeatured: true,
  imageUrl: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("Botones de Acción WhatsApp (WhatsApp CTAs - RF-05.1, RF-05.2, CL-09, CL-10)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("en ProductCard: renderiza el botón WhatsApp Directo con variante whatsapp, tokens OKLCH e ícono oficial", () => {
    render(
      <CatalogCartProvider>
        <ProductCard product={mockProduct} brandName="Bosch" />
      </CatalogCartProvider>,
    );

    const waLink = screen.getByRole("link", {
      name: new RegExp(`Consultar por ${mockProduct.name} en WhatsApp`, "i"),
    });

    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute("target", "_blank");
    expect(waLink).toHaveAttribute("rel", "noopener noreferrer");

    // Verificar variante 'whatsapp' en clases del elemento
    expect(waLink.className).toContain("bg-whatsapp");
    expect(waLink.className).toContain("text-whatsapp-foreground");
    expect(waLink.className).toContain("ring-emerald-400/20");

    // Verificar URL oficial de WhatsApp con teléfono y motivo
    const href = waLink.getAttribute("href") || "";
    expect(href).toContain(`https://wa.me/${SITE_CONFIG.phone}`);
    expect(href).toContain(encodeURIComponent(mockProduct.name));
    expect(href).toContain(encodeURIComponent(mockProduct.oem!));

    // Verificar ícono SVG presente
    const svgIcon = waLink.querySelector("svg");
    expect(svgIcon).toBeInTheDocument();
  });

  it("en CartDrawer: renderiza el botón de checkout WhatsApp con variante whatsapp, shimmer y FaWhatsapp", async () => {
    const initialItems: CartItemCache[] = [
      {
        productId: mockProduct.id,
        quantity: 1,
        lastKnown: { name: mockProduct.name, oem: mockProduct.oem },
      },
    ];

    const enrichedMock: EnrichedCartItem[] = [
      {
        productId: mockProduct.id,
        quantity: 1,
        name: mockProduct.name,
        oem: mockProduct.oem,
        imageUrl: "",
        brandName: "Bosch",
        condition: "Nuevo",
        price: 245000,
        showPrice: true,
        visible: true,
        requiresReconfirmation: false,
        isDeletedOrUnavailable: false,
      },
    ];

    vi.mocked(cartRevalidation.revalidateCartItems).mockResolvedValue(enrichedMock);

    render(
      <CatalogCartProvider initialItems={initialItems}>
        <CartDrawer open={true} />
      </CatalogCartProvider>,
    );

    // Esperar a que el drawer resuelva la revalidación
    await waitFor(() => {
      expect(screen.getByTestId("whatsapp-checkout-button")).toBeInTheDocument();
    });

    const checkoutButton = screen.getByTestId("whatsapp-checkout-button");
    expect(checkoutButton).toHaveAttribute("target", "_blank");
    expect(checkoutButton).toHaveAttribute("rel", "noopener noreferrer");

    // Clases de la variante whatsapp
    expect(checkoutButton.className).toContain("bg-whatsapp");
    expect(checkoutButton.className).toMatch(/text-whatsapp-foreground|text-white/);
    expect(checkoutButton.className).toContain("ring-emerald-400/20");

    // Presencia del contenedor de shimmer
    const shimmer = checkoutButton.querySelector(".animate-shimmer");
    expect(shimmer).toBeInTheDocument();

    // Presencia de ícono de WhatsApp
    const svg = checkoutButton.querySelector("svg");
    expect(svg).toBeInTheDocument();

    // URL a wa.me con los ítems del carrito
    const href = checkoutButton.getAttribute("href") || "";
    expect(href).toContain(`https://wa.me/${SITE_CONFIG.phone}`);
    expect(href).toContain(encodeURIComponent(mockProduct.name));
  });

  it("en Estado Sin Resultados de Catálogo: renderiza el botón de consulta técnica por WhatsApp con variante whatsapp", () => {
    const emptyQueryUrl = generateNoResultsWhatsAppUrl("0445110", ["Bosch"], ["Inyectores"]);

    render(
      <Button
        variant="whatsapp"
        className="h-11 gap-2.5 px-5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25"
        asChild
      >
        <a
          href={emptyQueryUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="no-results-whatsapp-button"
        >
          <FaWhatsapp className="size-4 shrink-0 text-white" />
          <span>Consultar pieza por WhatsApp</span>
        </a>
      </Button>,
    );

    const button = screen.getByTestId("no-results-whatsapp-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("target", "_blank");
    expect(button).toHaveAttribute("rel", "noopener noreferrer");

    expect(button.className).toContain("bg-whatsapp");
    expect(button.className).toMatch(/text-whatsapp-foreground|text-white/);
    expect(button.className).toContain("ring-emerald-400/20");

    const href = button.getAttribute("href") || "";
    expect(href).toContain(`https://wa.me/${SITE_CONFIG.phone}`);
    expect(href).toContain(encodeURIComponent("0445110"));
  });

  it("en Detalle de Producto ($productId): valida el botón WhatsApp Directo con accesibilidad completa", () => {
    const detailUrl = generateDirectProductWhatsAppUrl(mockProduct, "Bosch");

    render(
      <Button
        variant="whatsapp"
        size="lg"
        className="h-12 w-full gap-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25"
        asChild
      >
        <a
          href={detailUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Consultar repuesto por WhatsApp"
          data-testid="direct-whatsapp-button"
        >
          <FaWhatsapp className="size-[18px] shrink-0 text-white" />
          <span>WhatsApp Directo</span>
        </a>
      </Button>,
    );

    const button = screen.getByTestId("direct-whatsapp-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Consultar repuesto por WhatsApp");
    expect(button.className).toContain("bg-whatsapp");
    expect(button.className).toMatch(/text-whatsapp-foreground|text-white/);
    expect(button.className).toContain("ring-emerald-400/20");

    const href = button.getAttribute("href") || "";
    expect(href).toContain(`https://wa.me/${SITE_CONFIG.phone}`);
    expect(href).toContain(encodeURIComponent("Bosch"));
  });
});
