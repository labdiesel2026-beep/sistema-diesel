import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductGridSkeleton } from "@/components/catalog/ProductGridSkeleton";
import { CatalogCartProvider } from "@/context/catalog-cart-context";
import type { CatalogProduct } from "@/types/catalog";

const mockProductWithPrice: CatalogProduct = {
  id: "prod-100",
  name: "Inyector Common Rail Bosch CRI2.2",
  brandId: "brand-bosch",
  categoryIds: ["cat-inyectores"],
  vehicleCompatibility: "Toyota Hilux 2.8 D4D",
  condition: "Nuevo",
  oem: "0445110231",
  price: 285000,
  showPrice: true,
  visible: true,
  imageUrl: "/uploads/prod-100.webp",
  description: "Inyector nuevo original",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockProductWithoutPrice: CatalogProduct = {
  id: "prod-200",
  name: "Bomba Inyectora Delphi DFP3",
  brandId: "brand-delphi",
  categoryIds: ["cat-bombas"],
  vehicleCompatibility: "Ford Ranger 3.2 TDCi",
  condition: "Reacondicionado",
  oem: "28343144",
  price: null,
  showPrice: false,
  visible: true,
  imageUrl: "",
  description: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("ProductCard y ProductGridSkeleton", () => {
  it("renderiza tarjeta completa precios condicionales y acciones", () => {
    const handleViewDetail = vi.fn();

    // 1. Renderizar con precio explícito en ARS
    const { rerender } = render(
      <CatalogCartProvider>
        <ProductCard
          product={mockProductWithPrice}
          brandName="Bosch"
          onViewDetail={handleViewDetail}
        />
      </CatalogCartProvider>,
    );

    // Validar nombre, marca, OEM y compatibilidad
    expect(screen.getByText("Inyector Common Rail Bosch CRI2.2")).toBeInTheDocument();
    expect(screen.getByText("Bosch")).toBeInTheDocument();
    expect(screen.getByText("OEM 0445110231")).toBeInTheDocument();
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
    expect(screen.getByText("Toyota Hilux 2.8 D4D")).toBeInTheDocument();

    // Validar precio formateado en ARS
    expect(screen.getByText("$285.000 ARS")).toBeInTheDocument();

    // Validar enlace directo a WhatsApp
    const whatsappLink = screen.getByRole("link", {
      name: /Consultar por Inyector Common Rail Bosch CRI2.2 en WhatsApp/i,
    });
    expect(whatsappLink).toHaveAttribute("target", "_blank");
    expect(whatsappLink.getAttribute("href")).toContain("https://wa.me/");
    expect(whatsappLink.getAttribute("href")).toContain("0445110231");
    expect(whatsappLink.className).toContain("bg-whatsapp");
    expect(whatsappLink.className).toContain("uppercase");

    // Validar interacción con el carrito: clic agrega y actualiza etiqueta reactiva
    const addToCartButton = screen.getByRole("button", {
      name: /Agregar Inyector Common Rail Bosch CRI2.2 al carrito/i,
    });
    fireEvent.click(addToCartButton);

    // Debe reflejar "En el carrito (1) · Agregar"
    expect(screen.getByText(/En el carrito \(1\) · Agregar/i)).toBeInTheDocument();

    // Clic en el título debe invocar onViewDetail
    const titleElement = screen.getByText("Inyector Common Rail Bosch CRI2.2");
    fireEvent.click(titleElement);
    expect(handleViewDetail).toHaveBeenCalledWith("prod-100");

    // 2. Rerender con producto sin precio visible (debe mostrar "Consultar precio")
    rerender(
      <CatalogCartProvider>
        <ProductCard product={mockProductWithoutPrice} brandName="Delphi" />
      </CatalogCartProvider>,
    );

    expect(screen.getByText("Bomba Inyectora Delphi DFP3")).toBeInTheDocument();
    expect(screen.getByText("Consultar precio")).toBeInTheDocument();
    expect(screen.getByText("Reacondicionado")).toBeInTheDocument();
    expect(screen.getByText("Delphi")).toBeInTheDocument();
  });

  it("renderiza el esqueleto de carga con la cantidad configurada", () => {
    render(<ProductGridSkeleton count={4} />);

    const skeletonContainer = screen.getByTestId("product-grid-skeleton");
    expect(skeletonContainer).toBeInTheDocument();
    expect(skeletonContainer).toHaveAttribute("aria-busy", "true");

    const skeletonCards = skeletonContainer.querySelectorAll("article");
    expect(skeletonCards.length).toBe(4);
  });

  it("renderiza badges de OEM principal, +{N} ALTERNATIVOS para equivalencias y guion para ausente (RF-08, CL-02)", () => {
    // 1. Producto con 3 códigos OEM cruzados
    const productWithMultipleOem: CatalogProduct = {
      ...mockProductWithPrice,
      id: "prod-multi-oem",
      oem: "0445110001, 23670-0L050 / 095000-5881",
    };

    const { rerender } = render(
      <CatalogCartProvider>
        <ProductCard product={productWithMultipleOem} brandName="Bosch" />
      </CatalogCartProvider>,
    );

    // Debe mostrar el OEM primario (primer token)
    expect(screen.getByText("OEM 0445110001")).toBeInTheDocument();

    // Debe mostrar el badge con el conteo de equivalencias restantes (+2 ALTERNATIVOS)
    const altBadge = screen.getByTestId("oem-alternatives-prod-multi-oem");
    expect(altBadge).toBeInTheDocument();
    expect(altBadge).toHaveTextContent("+2 ALTERNATIVOS");
    expect(altBadge).toHaveAttribute("title", expect.stringContaining("23670-0L050"));
    expect(altBadge).toHaveAttribute("title", expect.stringContaining("095000-5881"));

    // 2. Producto sin código OEM (renderiza el guion "—")
    const productWithoutOem: CatalogProduct = {
      ...mockProductWithPrice,
      id: "prod-no-oem",
      oem: null,
    };

    rerender(
      <CatalogCartProvider>
        <ProductCard product={productWithoutOem} brandName="Bosch" />
      </CatalogCartProvider>,
    );

    expect(screen.queryByText(/OEM/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("oem-empty-prod-no-oem")).toHaveTextContent("—");
  });

  it("cumple con las directivas estéticas de RF-08: contenedor 1:1, marco de 16px, polaroid y hover sin salto vertical (TASK-16)", () => {
    const { container } = render(
      <CatalogCartProvider>
        <ProductCard product={mockProductWithPrice} brandName="Bosch" />
      </CatalogCartProvider>,
    );

    const article = container.querySelector("article");
    expect(article).toBeInTheDocument();

    // 1. Superficie oscura #111111 y borde translúcido
    expect(article?.className).toContain("bg-[#111111]");
    expect(article?.className).toContain("border-white/10");
    expect(article?.className).toContain("hover:border-white/25");

    // 2. Resplandor blanco al 5% en hover
    expect(article?.className).toContain("hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]");

    // 3. Ausencia total de traslación física vertical (no debe tener hover:-translate-y-1)
    expect(article?.className).not.toContain("hover:-translate-y-1");

    // 4. Contenedor de fotografía cuadrado 1:1 con marco uniforme de 16px (p-4)
    const mediaContainer = article?.querySelector(".aspect-square");
    expect(mediaContainer).toBeInTheDocument();
    expect(mediaContainer?.className).toContain("bg-media");
    expect(mediaContainer?.className).toContain("p-4");

    // 5. Imagen con ajuste proporcional polaroid redondeado sin modo de mezcla multiply
    const img = screen.getByRole("img", { name: "Inyector Common Rail Bosch CRI2.2" });
    expect(img.className).toContain("object-contain");
    expect(img.className).toContain("rounded-md");
    expect(img.className).not.toContain("mix-blend-multiply");
    expect(img.className).not.toContain("multiply");
  });

  it("cumple con TASK-17: contingencia de isotipo vectorial al 20% y diferenciación cromática de badges", () => {
    // 1. Producto nuevo con imagen ausente: debe proyectar fallback con SVG en opacity-20 y badge naranja
    const { rerender } = render(
      <CatalogCartProvider>
        <ProductCard
          product={{ ...mockProductWithPrice, imageUrl: null as unknown as string, condition: "Nuevo" }}
          brandName="Bosch"
        />
      </CatalogCartProvider>,
    );

    const fallback = screen.getByTestId("product-image-fallback");
    expect(fallback).toBeInTheDocument();
    const fallbackSvg = fallback.querySelector("svg");
    expect(fallbackSvg).toBeInTheDocument();
    expect(fallbackSvg?.getAttribute("class")).toContain("opacity-20");
    expect(fallbackSvg?.getAttribute("class")).toContain("stroke-white");

    // Badge Nuevo: Naranja Técnico (#ea580c / text-industrial border-industrial/50)
    const badgeNuevo = screen.getByTestId("badge-condition-prod-100");
    expect(badgeNuevo).toHaveTextContent("Nuevo");
    expect(badgeNuevo.className).toContain("text-industrial");
    expect(badgeNuevo.className).toContain("border-industrial/50");

    // 2. Producto reacondicionado: Badge Gris Metalizado (#71717a / text-badge-refurbished border-badge-refurbished/50)
    rerender(
      <CatalogCartProvider>
        <ProductCard
          product={{ ...mockProductWithoutPrice, condition: "Reacondicionado" }}
          brandName="Delphi"
        />
      </CatalogCartProvider>,
    );

    const badgeReacondicionado = screen.getByTestId("badge-condition-prod-200");
    expect(badgeReacondicionado).toHaveTextContent("Reacondicionado");
    expect(badgeReacondicionado.className).toContain("text-badge-refurbished");
    expect(badgeReacondicionado.className).toContain("border-badge-refurbished/50");
  });
});


