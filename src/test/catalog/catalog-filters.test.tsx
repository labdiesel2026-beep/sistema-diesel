import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import type { CatalogBrand, CatalogCategory, CatalogProduct } from "@/types/catalog";

const mockBrands: CatalogBrand[] = [
  { id: "brand-bosch", name: "Bosch" },
  { id: "brand-delphi", name: "Delphi" },
];

const mockCategories: CatalogCategory[] = [
  {
    id: "cat-inyectores",
    name: "Inyectores",
    parentId: null,
    children: [
      { id: "cat-cr", name: "Common Rail" },
      { id: "cat-piezo", name: "Piezoeléctricos" },
    ],
  },
  {
    id: "cat-bombas",
    name: "Bombas de Inyección",
    parentId: null,
    children: [],
  },
];

const mockProducts: CatalogProduct[] = [
  {
    id: "p1",
    name: "Inyector Bosch CR",
    brandId: "brand-bosch",
    categoryIds: ["cat-cr"],
    vehicleCompatibility: null,
    condition: "Nuevo",
    price: 100000,
    showPrice: true,
    visible: true,
    oem: "0445110001",
    imageUrl: "",
    description: "",
  },
  {
    id: "p2",
    name: "Inyector Bosch Piezo",
    brandId: "brand-bosch",
    categoryIds: ["cat-piezo"],
    vehicleCompatibility: null,
    condition: "Nuevo",
    price: 150000,
    showPrice: true,
    visible: true,
    oem: "0445115001",
    imageUrl: "",
    description: "",
  },
  {
    id: "p3",
    name: "Bomba Delphi",
    brandId: "brand-delphi",
    categoryIds: ["cat-bombas"],
    vehicleCompatibility: null,
    condition: "Reacondicionado",
    price: 300000,
    showPrice: true,
    visible: true,
    oem: "28343144",
    imageUrl: "",
    description: "",
  },
];

describe("CatalogFilters", () => {
  it("renderiza arbol de categorias y marcas con conteos dinamicos", () => {
    const handleBrandToggle = vi.fn();
    const handleCategoryToggle = vi.fn();
    const handleResetFilters = vi.fn();

    const { rerender } = render(
      <CatalogFilters
        brands={mockBrands}
        categories={mockCategories}
        selectedBrandIds={[]}
        selectedCategoryIds={[]}
        onBrandToggle={handleBrandToggle}
        onCategoryToggle={handleCategoryToggle}
        onResetFilters={handleResetFilters}
        products={mockProducts}
      />,
    );

    // 1. Validar marcas y conteos dinámicos (Bosch: 2, Delphi: 1)
    expect(screen.getByTestId("count-brand-brand-bosch")).toHaveTextContent("(2)");
    expect(screen.getByTestId("count-brand-brand-delphi")).toHaveTextContent("(1)");

    // 2. Validar árbol de categorías y conteos dinámicos
    // Inyectores (raíz) debe sumar sus hijas (cat-cr + cat-piezo = 2)
    expect(screen.getByTestId("count-cat-cat-inyectores")).toHaveTextContent("(2)");
    expect(screen.getByTestId("count-cat-cat-cr")).toHaveTextContent("(1)");
    expect(screen.getByTestId("count-cat-cat-piezo")).toHaveTextContent("(1)");
    // Bombas tiene 1
    expect(screen.getByTestId("count-cat-cat-bombas")).toHaveTextContent("(1)");

    // 3. Validar indentación visual en subcategorías
    const childrenContainer = screen.getByTestId("category-children-cat-inyectores");
    expect(childrenContainer).toBeInTheDocument();
    expect(childrenContainer.className).toContain("border-l-2");
    expect(childrenContainer.className).toContain("pl-3.5");

    // 4. Validar toggling de marca
    const boschCheckbox = screen.getByTestId("checkbox-brand-brand-bosch");
    fireEvent.click(boschCheckbox);
    expect(handleBrandToggle).toHaveBeenCalledWith("brand-bosch");

    // 5. Validar toggling de categoría hija
    const crCheckbox = screen.getByTestId("checkbox-cat-cat-cr");
    fireEvent.click(crCheckbox);
    expect(handleCategoryToggle).toHaveBeenCalledWith("cat-cr");

    // 6. Sin filtros activos, no debe mostrar botón de limpiar
    expect(screen.queryByTestId("reset-filters-desktop-button")).not.toBeInTheDocument();

    // 7. Rerender con filtros activos para comprobar presencia y acción de reset
    rerender(
      <CatalogFilters
        brands={mockBrands}
        categories={mockCategories}
        selectedBrandIds={["brand-bosch"]}
        selectedCategoryIds={["cat-cr"]}
        onBrandToggle={handleBrandToggle}
        onCategoryToggle={handleCategoryToggle}
        onResetFilters={handleResetFilters}
        products={mockProducts}
      />,
    );

    const resetButton = screen.getByTestId("reset-filters-desktop-button");
    expect(resetButton).toBeInTheDocument();
    fireEvent.click(resetButton);
    expect(handleResetFilters).toHaveBeenCalled();

    // 8. Botón mobile presente con conteo de filtros activos
    const mobileButton = screen.getByTestId("open-mobile-filters-button");
    expect(mobileButton).toBeInTheDocument();
    expect(mobileButton).toHaveTextContent("2"); // 1 marca + 1 categoría
  });
});
