import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { ProductToolbar } from "@/components/admin/products/ProductToolbar";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { AdminProvider } from "@/context/admin-context";
import type { AdminProduct } from "@/types/admin";

describe("ProductToolbar — Contador y Filtro Solo Destacados (Tarea 8.3, RF-04, CA-04.2, CA-04.3, CL-11)", () => {
  const sampleProducts: AdminProduct[] = [
    {
      id: "prod-1",
      name: "Inyector Bosch Hilux",
      description: "Inyector Common Rail 2.8",
      imageUrl: "/uploads/hilux.webp",
      brandId: "brand-1",
      categoryIds: ["cat-1"],
      condition: "Nuevo",
      price: 320000,
      showPrice: true,
      visible: true,
      isFeatured: true,
      oem: "0445110369",
      vehicleCompatibility: "Toyota Hilux 2.8",
    },
    {
      id: "prod-2",
      name: "Inyector Bosch Ranger",
      description: "Inyector Puma 2.2",
      imageUrl: "/uploads/ranger.webp",
      brandId: "brand-1",
      categoryIds: ["cat-1"],
      condition: "Reacondicionado",
      price: 240000,
      showPrice: true,
      visible: true,
      isFeatured: false,
      oem: "28231014",
      vehicleCompatibility: "Ford Ranger 2.2",
    },
    {
      id: "prod-3",
      name: "Bomba Bosch CP4",
      description: "Bomba de alta presión",
      imageUrl: "/uploads/cp4.webp",
      brandId: "brand-1",
      categoryIds: ["cat-1"],
      condition: "Nuevo",
      price: 580000,
      showPrice: true,
      visible: true,
      isFeatured: true,
      oem: "0445010507",
      vehicleCompatibility: "Volkswagen Amarok",
    },
  ];

  it("renderiza el badge informativo con el formato 'Destacados: X / 10' (CA-04.2)", () => {
    render(
      <ProductToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        featuredCount={4}
        totalCount={20}
      />,
    );

    const badge = screen.getByTestId("featured-counter-badge");
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain("Destacados: 4 / 10");
  });

  it("conmuta el filtro rápido 'Solo Destacados' al hacer clic", () => {
    const onToggleMock = vi.fn();

    const { rerender } = render(
      <ProductToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        showOnlyFeatured={false}
        onToggleOnlyFeatured={onToggleMock}
      />,
    );

    const filterBtn = screen.getByTestId("filter-only-featured-btn");
    expect(filterBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(filterBtn);
    expect(onToggleMock).toHaveBeenCalledWith(true);

    rerender(
      <ProductToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        showOnlyFeatured={true}
        onToggleOnlyFeatured={onToggleMock}
      />,
    );

    expect(filterBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("combina el filtro 'Solo Destacados' con el buscador de texto mediante lógica AND estricta (CA-04.3)", () => {
    function FilterHarness() {
      const [query, setQuery] = useState("");
      const [onlyFeatured, setOnlyFeatured] = useState(false);

      const filtered = sampleProducts.filter((p) => {
        if (onlyFeatured && !p.isFeatured) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.oem.toLowerCase().includes(q);
      });

      return (
        <div>
          <ProductToolbar
            searchQuery={query}
            onSearchChange={setQuery}
            showOnlyFeatured={onlyFeatured}
            onToggleOnlyFeatured={setOnlyFeatured}
            featuredCount={2}
            totalCount={sampleProducts.length}
            filteredCount={filtered.length}
          />
          <ProductTable products={sampleProducts} searchQuery={query} onlyFeatured={onlyFeatured} />
        </div>
      );
    }

    render(
      <AdminProvider>
        <FilterHarness />
      </AdminProvider>,
    );

    // Inicialmente se ven los 3 productos
    expect(screen.getByTestId("product-row-prod-1")).toBeInTheDocument();
    expect(screen.getByTestId("product-row-prod-2")).toBeInTheDocument();
    expect(screen.getByTestId("product-row-prod-3")).toBeInTheDocument();

    // 1. Activar filtro "Solo Destacados" -> prod-1 y prod-3
    const filterBtn = screen.getByTestId("filter-only-featured-btn");
    fireEvent.click(filterBtn);

    expect(screen.getByTestId("product-row-prod-1")).toBeInTheDocument();
    expect(screen.queryByTestId("product-row-prod-2")).not.toBeInTheDocument(); // prod-2 no es destacado
    expect(screen.getByTestId("product-row-prod-3")).toBeInTheDocument();

    // 2. Ingresar búsqueda "Hilux" (AND logic: isFeatured: true AND name contains "Hilux") -> solo prod-1
    const searchInput = screen.getByTestId("product-search-input");
    fireEvent.change(searchInput, { target: { value: "Hilux" } });

    expect(screen.getByTestId("product-row-prod-1")).toBeInTheDocument();
    expect(screen.queryByTestId("product-row-prod-3")).not.toBeInTheDocument(); // prod-3 es destacado pero no Hilux
  });
});
