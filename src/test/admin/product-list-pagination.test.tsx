import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminProvider, computeCatalogMetrics } from "@/context/admin-context";
import {
  ProductList,
  filterAdminProducts,
  DEFAULT_ADMIN_PAGE_SIZE,
} from "@/components/admin/products/ProductList";
import type { AdminBrand, AdminCategory, AdminProduct } from "@/types/admin";

const mockBrands: AdminBrand[] = [
  { id: "brand-bosch", name: "Bosch" },
  { id: "brand-denso", name: "Denso" },
];

const mockCategories: AdminCategory[] = [
  { id: "cat-injectors", name: "Inyectores", parentId: null },
  { id: "cat-pumps", name: "Bombas", parentId: null },
];

function generateMockProducts(count: number): AdminProduct[] {
  return Array.from({ length: count }, (_, idx) => {
    const num = idx + 1;
    const isBosch = num % 2 === 1;
    return {
      id: `prod-${num}`,
      name: `Repuesto Diesel #${num}`,
      description: `Descripción técnica del repuesto número ${num}`,
      imageUrl: `https://res.cloudinary.com/demo/image/upload/v1/products/item-${num}.webp`,
      brandId: isBosch ? "brand-bosch" : "brand-denso",
      categoryIds: [isBosch ? "cat-injectors" : "cat-pumps"],
      vehicleCompatibility: `Motor Serie ${num}`,
      condition: "Nuevo",
      price: num * 10000,
      showPrice: true,
      visible: num % 5 !== 0,
      oem: `OEM-${String(num).padStart(4, "0")}`,
      isFeatured: num <= 3,
      featuredAt: null,
    };
  });
}

describe("Fase 14 T-02: Paginación Clásica en ProductList y Filtrado Memoizado O(1)", () => {
  const sixtyProducts = generateMockProducts(60);

  it("monta únicamente 25 filas en el DOM por defecto cuando existen 60 productos", () => {
    render(
      <AdminProvider
        initialBrands={mockBrands}
        initialCategories={mockCategories}
        initialProducts={sixtyProducts}
        autoFetch={false}
      >
        <ProductList />
      </AdminProvider>,
    );

    expect(DEFAULT_ADMIN_PAGE_SIZE).toBe(25);
    expect(screen.getByTestId("product-table-pagination")).toBeInTheDocument();
    expect(screen.getByTestId("pagination-range-indicator")).toHaveTextContent(
      "Mostrando 1–25 de 60 repuestos",
    );
    expect(screen.getByTestId("pagination-page-indicator")).toHaveTextContent(
      "Página 1 de 3",
    );

    // Verificar que el producto 1 y 25 están en el DOM, pero el 26 NO está montado
    expect(screen.getByTestId("product-row-prod-1")).toBeInTheDocument();
    expect(screen.getByTestId("product-row-prod-25")).toBeInTheDocument();
    expect(screen.queryByTestId("product-row-prod-26")).not.toBeInTheDocument();

    // El botón Anterior debe estar deshabilitado en la página 1
    expect(screen.getByTestId("pagination-prev-btn")).toBeDisabled();
    expect(screen.getByTestId("pagination-next-btn")).not.toBeDisabled();
  });

  it("navega correctamente entre páginas (Siguiente / Anterior) actualizando las filas montadas", () => {
    render(
      <AdminProvider
        initialBrands={mockBrands}
        initialCategories={mockCategories}
        initialProducts={sixtyProducts}
        autoFetch={false}
      >
        <ProductList />
      </AdminProvider>,
    );

    const nextBtn = screen.getByTestId("pagination-next-btn");
    const prevBtn = screen.getByTestId("pagination-prev-btn");

    // Ir a página 2 (26–50)
    fireEvent.click(nextBtn);
    expect(screen.getByTestId("pagination-range-indicator")).toHaveTextContent(
      "Mostrando 26–50 de 60 repuestos",
    );
    expect(screen.getByTestId("pagination-page-indicator")).toHaveTextContent(
      "Página 2 de 3",
    );
    expect(screen.queryByTestId("product-row-prod-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("product-row-prod-26")).toBeInTheDocument();
    expect(screen.getByTestId("product-row-prod-50")).toBeInTheDocument();

    // Ir a página 3 (51–60)
    fireEvent.click(nextBtn);
    expect(screen.getByTestId("pagination-range-indicator")).toHaveTextContent(
      "Mostrando 51–60 de 60 repuestos",
    );
    expect(screen.getByTestId("pagination-page-indicator")).toHaveTextContent(
      "Página 3 de 3",
    );
    expect(screen.getByTestId("product-row-prod-51")).toBeInTheDocument();
    expect(screen.getByTestId("product-row-prod-60")).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    // Volver a página 2
    fireEvent.click(prevBtn);
    expect(screen.getByTestId("pagination-page-indicator")).toHaveTextContent(
      "Página 2 de 3",
    );
  });

  it("permite cambiar la cantidad de filas por página (25 -> 50 -> 100) y reinicia a la página 1", () => {
    render(
      <AdminProvider
        initialBrands={mockBrands}
        initialCategories={mockCategories}
        initialProducts={sixtyProducts}
        autoFetch={false}
      >
        <ProductList />
      </AdminProvider>,
    );

    // Avanzar a página 2 primero
    fireEvent.click(screen.getByTestId("pagination-next-btn"));
    expect(screen.getByTestId("pagination-page-indicator")).toHaveTextContent("Página 2 de 3");

    // Cambiar selector a 50 filas por página
    const select = screen.getByTestId("pagination-page-size-select");
    fireEvent.change(select, { target: { value: "50" } });

    expect(screen.getByTestId("pagination-range-indicator")).toHaveTextContent(
      "Mostrando 1–50 de 60 repuestos",
    );
    expect(screen.getByTestId("pagination-page-indicator")).toHaveTextContent("Página 1 de 2");
    expect(screen.getByTestId("product-row-prod-1")).toBeInTheDocument();
    expect(screen.getByTestId("product-row-prod-50")).toBeInTheDocument();
    expect(screen.queryByTestId("product-row-prod-51")).not.toBeInTheDocument();
  });

  it("reinicia automáticamente a la página 1 cuando cambia el término de búsqueda o un filtro", () => {
    const { rerender } = render(
      <AdminProvider
        initialBrands={mockBrands}
        initialCategories={mockCategories}
        initialProducts={sixtyProducts}
        autoFetch={false}
      >
        <ProductList searchQuery="" selectedBrand="" />
      </AdminProvider>,
    );

    fireEvent.click(screen.getByTestId("pagination-next-btn"));
    expect(screen.getByTestId("pagination-page-indicator")).toHaveTextContent("Página 2 de 3");

    // Aplicar filtro por marca Bosch (30 productos -> 2 páginas, debe volver a página 1)
    rerender(
      <AdminProvider
        initialBrands={mockBrands}
        initialCategories={mockCategories}
        initialProducts={sixtyProducts}
        autoFetch={false}
      >
        <ProductList searchQuery="" selectedBrand="brand-bosch" />
      </AdminProvider>,
    );

    expect(screen.getByTestId("pagination-page-indicator")).toHaveTextContent("Página 1 de 2");
    expect(screen.getByTestId("pagination-range-indicator")).toHaveTextContent(
      "Mostrando 1–25 de 30 repuestos",
    );
  });

  it("filterAdminProducts filtra en O(N) resolviendo marcas en O(1) con mapa indexado", () => {
    const brandMap = new Map(mockBrands.map((b) => [b.id, b.name]));
    const result = filterAdminProducts(
      sixtyProducts,
      {
        searchQuery: "denso",
        selectedStatus: "visible",
      },
      (brandId) => brandMap.get(brandId) ?? "",
    );

    // De los 60 productos, los pares (30) son Denso; de esos 30, los múltiplos de 10 (6) están ocultos => 24 visibles
    expect(result).toHaveLength(24);
    expect(result.every((p) => p.brandId === "brand-denso" && p.visible)).toBe(true);
  });

  it("computeCatalogMetrics calcula en memoria las 6 métricas sin requerir consultas COUNT(*) a la BD (Fase 14 T-04)", () => {
    const metrics = computeCatalogMetrics(sixtyProducts, mockCategories, mockBrands);

    // De 60 productos: múltiplos de 5 son ocultos (12 ocultos, 48 visibles), primeros 3 son destacados y visibles
    expect(metrics).toEqual({
      totalProducts: 60,
      visibleProducts: 48,
      hiddenProducts: 12,
      featuredProducts: 3,
      totalCategories: 2,
      totalBrands: 2,
    });
  });
});

