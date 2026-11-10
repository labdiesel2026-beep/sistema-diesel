import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CatalogCartProvider } from "@/context/catalog-cart-context";
import type { CatalogProduct } from "@/types/catalog";

const sampleProduct: CatalogProduct = {
  id: "prod-abc-123",
  name: "Inyector Bosch Piezoeléctrico CR",
  description: "Tobera calibrada con tolerancias micrométricas en banco computarizado.",
  imageUrl: "/uploads/inyector-piezo.webp",
  categoryIds: ["cat-inyectores"],
  brandId: "brand-bosch",
  vehicleCompatibility: "VW Amarok 2.0 BiTDI",
  condition: "Nuevo",
  price: 345000,
  showPrice: true,
  visible: true,
  oem: "0445116034",
};

describe("ProductDetailModal Component", () => {
  it("renderiza todos los detalles técnicos solicitados en el modal", () => {
    const handleOpenChange = vi.fn();

    render(
      <CatalogCartProvider>
        <ProductDetailModal
          product={sampleProduct}
          brandName="Bosch"
          categoryName="Inyectores Common Rail"
          open={true}
          onOpenChange={handleOpenChange}
        />
      </CatalogCartProvider>,
    );

    // 1. Título, Marca, Categoría, SKU y Compatibilidad
    expect(screen.getByText("Inyector Bosch Piezoeléctrico CR")).toBeInTheDocument();
    expect(screen.getAllByText("Bosch").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Inyectores Common Rail")).toBeInTheDocument();
    expect(screen.getByTestId("product-modal-sku")).toHaveTextContent("0445116034");
    expect(screen.getByText("VW Amarok 2.0 BiTDI")).toBeInTheDocument();

    // 2. Badges de Stock y Condición
    expect(screen.getByTestId("product-modal-stock-badge")).toHaveTextContent(
      "En Stock / Disponible",
    );
    expect(screen.getByTestId("product-modal-condition-badge")).toHaveTextContent("Nuevo");

    // 3. Precio formateado en ARS
    expect(screen.getByTestId("product-modal-price")).toHaveTextContent("$345.000 ARS");

    // 4. Descripción técnica completa
    expect(screen.getByTestId("product-modal-description-text")).toHaveTextContent(
      "Tobera calibrada con tolerancias micrométricas en banco computarizado.",
    );

    // 5. Botones del footer
    const addBtn = screen.getByTestId("product-modal-add-cart-btn");
    expect(addBtn).toBeInTheDocument();
    expect(addBtn).toHaveTextContent(/Agregar al pedido/i);

    const whatsappBtn = screen.getByTestId("product-modal-whatsapp-btn");
    expect(whatsappBtn).toBeInTheDocument();
    expect(whatsappBtn).toHaveAttribute("target", "_blank");
    expect(whatsappBtn.getAttribute("href")).toContain("https://wa.me/");
    expect(whatsappBtn.getAttribute("href")).toContain(
      encodeURIComponent("Inyector Bosch Piezoeléctrico CR"),
    );
    expect(whatsappBtn.getAttribute("href")).toContain("0445116034");
  });

  it("permite agregar al pedido reactivamente y actualiza el botón", () => {
    render(
      <CatalogCartProvider>
        <ProductDetailModal
          product={sampleProduct}
          brandName="Bosch"
          open={true}
          onOpenChange={vi.fn()}
        />
      </CatalogCartProvider>,
    );

    const addBtn = screen.getByTestId("product-modal-add-cart-btn");
    fireEvent.click(addBtn);

    expect(screen.getByText(/En el pedido \(1\) · Agregar otro/i)).toBeInTheDocument();
  });

  it("renderiza 'Consultar precio' si el precio es 0, nulo o showPrice es false", () => {
    const productWithoutPrice: CatalogProduct = {
      ...sampleProduct,
      price: null,
      showPrice: false,
    };

    render(
      <CatalogCartProvider>
        <ProductDetailModal
          product={productWithoutPrice}
          brandName="Bosch"
          open={true}
          onOpenChange={vi.fn()}
        />
      </CatalogCartProvider>,
    );

    expect(screen.getByTestId("product-modal-price-consult")).toHaveTextContent("Consultar precio");
  });
});

describe("ProductCard interacción con imagen y stopPropagation", () => {
  it("abre el modal al hacer clic en el contenedor de imagen", () => {
    const handleViewDetail = vi.fn();

    render(
      <CatalogCartProvider>
        <ProductCard product={sampleProduct} brandName="Bosch" onViewDetail={handleViewDetail} />
      </CatalogCartProvider>,
    );

    const imageContainer = screen.getByLabelText(/Ver detalles técnicos de Inyector Bosch/i);
    fireEvent.click(imageContainer);

    expect(handleViewDetail).toHaveBeenCalledWith(sampleProduct.id);
  });

  it("detiene la propagación del evento al hacer clic en 'Agregar al Carrito'", () => {
    const outerContainerClickHandler = vi.fn();
    const handleViewDetail = vi.fn();

    render(
      <CatalogCartProvider>
        <div onClick={outerContainerClickHandler}>
          <ProductCard product={sampleProduct} brandName="Bosch" onViewDetail={handleViewDetail} />
        </div>
      </CatalogCartProvider>,
    );

    const addBtn = screen.getByRole("button", { name: /Agregar Inyector Bosch.*al carrito/i });
    fireEvent.click(addBtn);

    // El click en el botón no debe propagarse al contenedor exterior
    expect(outerContainerClickHandler).not.toHaveBeenCalled();
  });
});
