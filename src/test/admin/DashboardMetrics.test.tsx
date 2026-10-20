import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { DashboardMetrics } from "@/components/admin/dashboard/DashboardMetrics";
import { AdminProvider, useAdmin } from "@/context/admin-context";
import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
} from "@/test/fixtures/admin-fixtures";

// Mock de @tanstack/react-router Link para testing unitario
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode; [key: string]: any }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

/**
 * Componente arnés que expone mutaciones de contexto para validar la reactividad
 * inmediata de los contadores en el Dashboard.
 */
function DashboardHarness() {
  const { products, toggleVisibility, createProduct, deleteProduct, createCategory, createBrand } =
    useAdmin();

  return (
    <div>
      {/* Botones de prueba para disparar mutaciones reactivas */}
      <button
        data-testid="test-toggle-first-product"
        onClick={() => {
          const first = products[0];
          if (first) {
            toggleVisibility(first.id);
          }
        }}
      >
        Toggle First Product
      </button>

      <button
        data-testid="test-add-product"
        onClick={() => {
          createProduct({
            name: "Inyector Nuevo Reactivo",
            description: "Descripción de prueba para reactividad",
            imageUrl: "/uploads/nuevo.webp",
            categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891001"],
            brandId: "b1a2c3d4-0001-4000-8000-000000000001",
            vehicleCompatibility: "Prueba 2.0",
            condition: "Nuevo",
            price: 250000,
            showPrice: true,
            visible: true,
            oem: "OEM-REACTIVO-1",
          });
        }}
      >
        Add Product
      </button>

      <button
        data-testid="test-delete-first-product"
        onClick={() => {
          const first = products[0];
          if (first) {
            deleteProduct(first.id);
          }
        }}
      >
        Delete First Product
      </button>

      <button
        data-testid="test-add-category"
        onClick={() => {
          createCategory({
            name: "Nueva Categoría Reactiva",
            parentId: null,
          });
        }}
      >
        Add Category
      </button>

      <button
        data-testid="test-add-brand"
        onClick={() => {
          createBrand({
            name: "Siemens Reactiva",
          });
        }}
      >
        Add Brand
      </button>

      <DashboardMetrics />
    </div>
  );
}

describe("Componente de Métricas del Dashboard (DashboardMetrics) — Tarea 5.2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe calcular y renderizar los 5 contadores cuantitativos según los datos semilla (RF-04, CA-04.1)", () => {
    render(
      <AdminProvider>
        <DashboardMetrics />
      </AdminProvider>,
    );

    const initialTotalProducts = INITIAL_PRODUCTS.length;
    const initialVisible = INITIAL_PRODUCTS.filter((p) => p.visible).length;
    const initialHidden = INITIAL_PRODUCTS.filter((p) => !p.visible).length;
    const initialCategories = INITIAL_CATEGORIES.length;
    const initialBrands = INITIAL_BRANDS.length;

    // 1. Total de productos
    const totalEl = screen.getByTestId("metric-value-total-products");
    expect(totalEl.textContent).toBe(String(initialTotalProducts));

    // 2. Productos visibles
    const visibleEl = screen.getByTestId("metric-value-visible-products");
    expect(visibleEl.textContent).toBe(String(initialVisible));

    // 3. Productos ocultos
    const hiddenEl = screen.getByTestId("metric-value-hidden-products");
    expect(hiddenEl.textContent).toBe(String(initialHidden));

    // 4. Total de categorías
    const categoriesEl = screen.getByTestId("metric-value-total-categories");
    expect(categoriesEl.textContent).toBe(String(initialCategories));

    // 5. Total de marcas
    const brandsEl = screen.getByTestId("metric-value-total-brands");
    expect(brandsEl.textContent).toBe(String(initialBrands));
  });

  it("debe actualizar reactivamente los contadores al alternar visibilidad de un producto (CA-04.1, CA-06.1)", async () => {
    render(
      <AdminProvider>
        <DashboardHarness />
      </AdminProvider>,
    );

    const visibleEl = screen.getByTestId("metric-value-visible-products");
    const hiddenEl = screen.getByTestId("metric-value-hidden-products");

    // Inicialmente: 3 visibles, 1 oculto
    expect(visibleEl.textContent).toBe("3");
    expect(hiddenEl.textContent).toBe("1");

    // Conmutar el primer producto (que es visible)
    await act(async () => {
      screen.getByTestId("test-toggle-first-product").click();
    });

    // Ahora: 2 visibles, 2 ocultos
    expect(visibleEl.textContent).toBe("2");
    expect(hiddenEl.textContent).toBe("2");

    // Conmutar nuevamente
    await act(async () => {
      screen.getByTestId("test-toggle-first-product").click();
    });

    // Restablecido: 3 visibles, 1 oculto
    expect(visibleEl.textContent).toBe("3");
    expect(hiddenEl.textContent).toBe("1");
  });

  it("debe actualizar reactivamente los contadores al crear y eliminar productos", async () => {
    render(
      <AdminProvider>
        <DashboardHarness />
      </AdminProvider>,
    );

    const totalEl = screen.getByTestId("metric-value-total-products");
    const visibleEl = screen.getByTestId("metric-value-visible-products");

    expect(totalEl.textContent).toBe("4");
    expect(visibleEl.textContent).toBe("3");

    // Agregar nuevo producto visible
    await act(async () => {
      screen.getByTestId("test-add-product").click();
    });

    expect(totalEl.textContent).toBe("5");
    expect(visibleEl.textContent).toBe("4");

    // Eliminar producto
    await act(async () => {
      screen.getByTestId("test-delete-first-product").click();
    });

    expect(totalEl.textContent).toBe("4");
  });

  it("debe incrementar reactivamente los contadores al agregar categorías y marcas", async () => {
    render(
      <AdminProvider>
        <DashboardHarness />
      </AdminProvider>,
    );

    const categoriesEl = screen.getByTestId("metric-value-total-categories");
    const brandsEl = screen.getByTestId("metric-value-total-brands");

    expect(categoriesEl.textContent).toBe("5");
    expect(brandsEl.textContent).toBe("3");

    // Agregar categoría
    await act(async () => {
      screen.getByTestId("test-add-category").click();
    });
    expect(categoriesEl.textContent).toBe("6");

    // Agregar marca
    await act(async () => {
      screen.getByTestId("test-add-brand").click();
    });
    expect(brandsEl.textContent).toBe("4");
  });

  it("debe renderizar los enlaces rápidos de gestión hacia las rutas correspondientes (CA-04.2)", () => {
    render(
      <AdminProvider>
        <DashboardMetrics />
      </AdminProvider>,
    );

    const linkProducts = screen.getByTestId("quick-link-products");
    expect(linkProducts.getAttribute("href")).toBe("/admin");
    expect(linkProducts.textContent).toContain("Gestionar Productos");

    const linkCategories = screen.getByTestId("quick-link-categories");
    expect(linkCategories.getAttribute("href")).toBe("/admin/categorias");
    expect(linkCategories.textContent).toContain("Gestionar Categorías");

    const linkBrands = screen.getByTestId("quick-link-brands");
    expect(linkBrands.getAttribute("href")).toBe("/admin/marcas");
    expect(linkBrands.textContent).toContain("Gestionar Marcas");
  });
});
