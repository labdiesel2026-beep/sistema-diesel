import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { AdminProvider } from "@/context/admin-context";
import type { AdminCategory, AdminBrand } from "@/types/admin";

// Mock de ResizeObserver para Radix Dialog
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;

const mockCategoriesHierarchy: AdminCategory[] = [
  {
    id: "cat-root-bombas",
    name: "Bombas e Inyección Mecánica",
    parentId: null,
    productCount: 8,
  },
  {
    id: "cat-child-probandoo",
    name: "probandoo",
    parentId: "cat-root-bombas",
    productCount: 2,
  },
  {
    id: "cat-child-lineales",
    name: "Bombas Lineales",
    parentId: "cat-root-bombas",
    productCount: 6,
  },
  {
    id: "cat-root-inyectores",
    name: "Inyectores Common Rail",
    parentId: null,
    productCount: 12,
  },
];

const mockBrands: AdminBrand[] = [
  {
    id: "b1a2c3d4-0001-4000-8000-000000000001",
    name: "Bosch",
    productCount: 10,
  },
];

describe("ProductFormModal — Auto-selección Jerárquica de Categorías (Fase 15, TASK-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-marca la categoría padre al seleccionar una subcategoría", () => {
    function TestHierarchyHarness() {
      return (
        <AdminProvider initialCategories={mockCategoriesHierarchy} initialBrands={mockBrands}>
          <ProductFormModal open={true} onOpenChange={vi.fn()} productToEdit={null} />
        </AdminProvider>
      );
    }

    render(<TestHierarchyHarness />);

    const rootCheckbox = screen.getByTestId("category-checkbox-cat-root-bombas") as HTMLInputElement;
    const childCheckbox = screen.getByTestId("category-checkbox-cat-child-probandoo") as HTMLInputElement;

    // Inicialmente ambas están desmarcadas
    expect(rootCheckbox.checked).toBe(false);
    expect(childCheckbox.checked).toBe(false);

    // Al hacer click en la subcategoría "probandoo"
    fireEvent.click(childCheckbox);

    // Ambas deben quedar marcadas automáticamente
    expect(childCheckbox.checked).toBe(true);
    expect(rootCheckbox.checked).toBe(true);

    // Comprobamos que el contador de seleccionadas refleja 2
    expect(screen.getByText("Seleccionadas: 2")).toBeInTheDocument();
  });

  it("desmarca automáticamente las subcategorías hijas al desmarcar la categoría padre", () => {
    function TestHierarchyHarness() {
      return (
        <AdminProvider initialCategories={mockCategoriesHierarchy} initialBrands={mockBrands}>
          <ProductFormModal open={true} onOpenChange={vi.fn()} productToEdit={null} />
        </AdminProvider>
      );
    }

    render(<TestHierarchyHarness />);

    const rootCheckbox = screen.getByTestId("category-checkbox-cat-root-bombas") as HTMLInputElement;
    const childProbandoo = screen.getByTestId("category-checkbox-cat-child-probandoo") as HTMLInputElement;
    const childLineales = screen.getByTestId("category-checkbox-cat-child-lineales") as HTMLInputElement;

    // Marcamos ambas hijas (lo que auto-marca el padre)
    fireEvent.click(childProbandoo);
    fireEvent.click(childLineales);

    expect(rootCheckbox.checked).toBe(true);
    expect(childProbandoo.checked).toBe(true);
    expect(childLineales.checked).toBe(true);
    expect(screen.getByText("Seleccionadas: 3")).toBeInTheDocument();

    // Ahora desmarcamos la categoría padre
    fireEvent.click(rootCheckbox);

    // Tanto el padre como todas sus hijas deben quedar desmarcadas
    expect(rootCheckbox.checked).toBe(false);
    expect(childProbandoo.checked).toBe(false);
    expect(childLineales.checked).toBe(false);
    expect(screen.getByText("Seleccionadas: 0")).toBeInTheDocument();
  });
});

