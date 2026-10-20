import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import type { AdminProduct } from "@/types/admin";
import { AdminProvider, useAdmin } from "@/context/admin-context";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductToolbar } from "@/components/admin/products/ProductToolbar";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { ProductDeleteModal } from "@/components/admin/products/ProductDeleteModal";

// Mock de FileReader para emular la subida y generación de Data URL en tests
class MockFileReader {
  result: string | null = null;
  onload: (() => void) | null = null;

  readAsDataURL(file: File) {
    this.result = `data:${file.type};base64,mockedbase64data_${file.name}`;
    setTimeout(() => {
      this.onload?.();
    }, 10);
  }
}

// Mock de ResizeObserver para componentes Radix Dialog/ScrollArea
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

/**
 * Arnés Integrado del Módulo de Productos que emula la vista administrativa /admin
 * conectando Toolbar, Table, FormModal y DeleteModal.
 */
function ProductsModuleHarness() {
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<AdminProduct | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  const { products } = useAdmin();

  return (
    <div className="p-4 space-y-4">
      <ProductToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewProduct={() => {
          setProductToEdit(null);
          setFormOpen(true);
        }}
        totalCount={products.length}
      />

      <ProductTable
        searchQuery={searchQuery}
        onEdit={(prod) => {
          setProductToEdit(prod);
          setFormOpen(true);
        }}
        onDelete={(prod) => {
          setProductToDelete(prod);
          setDeleteOpen(true);
        }}
      />

      <ProductFormModal open={formOpen} onOpenChange={setFormOpen} productToEdit={productToEdit} />

      <ProductDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={productToDelete}
      />
    </div>
  );
}

describe("Módulo de Productos (Integración Completa) — Tarea 8.5", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("FileReader", MockFileReader);
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });

  // -------------------------------------------------------------------------
  // 1) Creación de Producto con Campos Obligatorios (CA-05.1)
  // -------------------------------------------------------------------------
  it("debe crear un nuevo producto con campos obligatorios y renderizarlo en la grilla (CA-05.1)", async () => {
    render(
      <AdminProvider>
        <ProductsModuleHarness />
      </AdminProvider>,
    );

    // 1. Abrir modal de nuevo producto
    await act(async () => {
      screen.getByTestId("new-product-btn").click();
    });

    expect(screen.getByTestId("product-form-modal")).toBeDefined();
    expect(screen.getByText("Nuevo Repuesto")).toBeDefined();

    // 2. Cargar imagen mediante el input de archivo
    const fileInput = screen.getByTestId("image-file-input");
    const testFile = new File(["dummy-img-bytes"], "inyector-cummins.png", {
      type: "image/png",
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [testFile] } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("image-upload-preview")).toBeDefined();
    });

    // 3. Completar campos obligatorios
    await act(async () => {
      fireEvent.change(screen.getByTestId("product-name-input"), {
        target: { value: "Inyector Cummins ISF 2.8" },
      });
      fireEvent.change(screen.getByTestId("product-oem-input"), {
        target: { value: "0445120134" },
      });
      fireEvent.change(screen.getByTestId("product-brand-select"), {
        target: { value: "b1a2c3d4-0001-4000-8000-000000000001" }, // Bosch
      });
      fireEvent.change(screen.getByTestId("product-condition-select"), {
        target: { value: "Nuevo" },
      });
      fireEvent.change(screen.getByTestId("product-vehicle-input"), {
        target: { value: "Foton Aumark / VW Delivery 2.8" },
      });
      fireEvent.change(screen.getByTestId("product-description-input"), {
        target: {
          value: "Inyector diésel common rail Bosch para motores Cummins ISF 2.8.",
        },
      });
      fireEvent.change(screen.getByTestId("product-price-input"), {
        target: { value: "480000" },
      });
    });

    // 4. Seleccionar al menos una categoría
    const categoryCheckbox = screen.getByTestId(
      "category-checkbox-e4b6d812-7a2b-4f51-b8f3-0a567c891001",
    );
    await act(async () => {
      categoryCheckbox.click();
    });

    // 5. Enviar formulario
    await act(async () => {
      screen.getByTestId("product-form-submit-btn").click();
    });

    // 6. Verificar que el producto aparece en la tabla con su marca relacional resuelta
    await waitFor(() => {
      expect(screen.getByText("Inyector Cummins ISF 2.8")).toBeDefined();
    });

    expect(screen.getByText("OEM: 0445120134")).toBeDefined();
    expect(screen.getByText("$480.000 ARS")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // 2) Toggle de Visibilidad en Grilla (CA-06.1, CA-06.2)
  // -------------------------------------------------------------------------
  it("debe conmutar inmediatamente la visibilidad entre Visible y Oculto con distinción visual (CA-06.1, CA-06.2)", async () => {
    render(
      <AdminProvider>
        <ProductsModuleHarness />
      </AdminProvider>,
    );

    // Producto inicial Amarok (a0f1e2d3-1111-4000-8000-111111111111) es visible: true
    const amarokId = "a0f1e2d3-1111-4000-8000-111111111111";
    const switchBtn = screen.getByTestId(`product-visibility-switch-${amarokId}`);
    const badge = screen.getByTestId(`product-status-badge-${amarokId}`);

    expect(badge.textContent).toBe("Visible");

    // Conmutar a Oculto
    await act(async () => {
      switchBtn.click();
    });

    expect(badge.textContent).toBe("Oculto");

    // Conmutar de vuelta a Visible
    await act(async () => {
      switchBtn.click();
    });

    expect(badge.textContent).toBe("Visible");
  });

  // -------------------------------------------------------------------------
  // 3) Búsqueda Sanitizada con Caracteres Especiales RegExp (CA-06.4, CL-11)
  // -------------------------------------------------------------------------
  it("debe tolerar caracteres especiales de RegExp ([ , * , \\ , +) sin lanzar excepciones (CA-06.4, CL-11)", async () => {
    render(
      <AdminProvider>
        <ProductsModuleHarness />
      </AdminProvider>,
    );

    const searchInput = screen.getByTestId("product-search-input");

    // Caracteres especiales que causarían Invalid regular expression: /[/: Unterminated character class
    const specialQueries = ["[", "*", "\\", "+", "?", "[0-9]+"];

    for (const q of specialQueries) {
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: q } });
      });

      // Debe ejecutarse sin lanzar excepción de RegExp y mostrar estado vacío
      expect(screen.getByTestId("product-toolbar")).toBeDefined();
      expect(screen.getByTestId("product-table-empty")).toBeDefined();
    }

    // Coincidencia literal de paréntesis '(' presente en compatibilidad (2010-2021)
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "(" } });
    });
    expect(screen.getByText("Inyector Amarok 2.0 TDI")).toBeDefined();

    // Búsqueda específica que sí arroja coincidencia exacta
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "0445110369" } });
    });

    expect(screen.getByText("Inyector Amarok 2.0 TDI")).toBeDefined();
    expect(screen.queryByText("Inyector Ranger 3.2 TDCi")).toBeNull();

    // Limpiar búsqueda
    const clearBtn = screen.getByTestId("product-search-clear");
    await act(async () => {
      clearBtn.click();
    });

    expect(screen.getByText("Inyector Amarok 2.0 TDI")).toBeDefined();
    expect(screen.getByText("Inyector Ranger 3.2 TDCi")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // 4) Admisión de Precio $0 y Rechazo de Precio Negativo (CA-05.2, CL-07)
  // -------------------------------------------------------------------------
  it("debe admitir precio $0 (a convenir) y rechazar precios negativos (CA-05.2, CL-07)", async () => {
    render(
      <AdminProvider>
        <ProductsModuleHarness />
      </AdminProvider>,
    );

    // Sprinter (a0f1e2d3-4444-4000-8000-444444444444) en datos semilla tiene price: 0
    const sprinterPrice = screen.getByTestId("product-price-a0f1e2d3-4444-4000-8000-444444444444");
    expect(sprinterPrice.textContent).toBe("$0 ARS");

    // Editar Amarok para establecer precio $0
    const amarokEditBtn = screen.getByTestId(
      "product-edit-btn-a0f1e2d3-1111-4000-8000-111111111111",
    );
    await act(async () => {
      amarokEditBtn.click();
    });

    expect(screen.getByText("Editar Repuesto")).toBeDefined();
    const priceInput = screen.getByTestId("product-price-input");

    // Probar precio negativo inválido: -500
    await act(async () => {
      fireEvent.change(priceInput, { target: { value: "-500" } });
      fireEvent.blur(priceInput);
    });

    expect(screen.getByTestId("product-price-field-error")).toBeDefined();
    expect(screen.getByTestId("product-price-field-error").textContent).toContain(
      "no puede ser negativo",
    );

    // Corregir a precio válido $0
    await act(async () => {
      fireEvent.change(priceInput, { target: { value: "0" } });
    });

    await act(async () => {
      screen.getByTestId("product-form-submit-btn").click();
    });

    // Modal se cierra y la tabla refleja $0 ARS para Amarok
    await waitFor(() => {
      const amarokUpdatedPrice = screen.getByTestId(
        "product-price-a0f1e2d3-1111-4000-8000-111111111111",
      );
      expect(amarokUpdatedPrice.textContent).toBe("$0 ARS");
    });
  });

  // -------------------------------------------------------------------------
  // 5) Eliminación Permanente de Producto (RF-07, CA-07.1, CA-07.2)
  // -------------------------------------------------------------------------
  it("debe desplegar el modal destructivo y eliminar permanentemente un producto al confirmar (RF-07, CA-07.1, CA-07.2)", async () => {
    render(
      <AdminProvider>
        <ProductsModuleHarness />
      </AdminProvider>,
    );

    // Hilux ID: a0f1e2d3-3333-4000-8000-333333333333
    const hiluxId = "a0f1e2d3-3333-4000-8000-333333333333";
    expect(screen.getByTestId(`product-row-${hiluxId}`)).toBeDefined();

    // 1. Abrir modal de eliminación
    const deleteBtn = screen.getByTestId(`product-delete-btn-${hiluxId}`);
    await act(async () => {
      deleteBtn.click();
    });

    // 2. Verificar modal de confirmación con botón rojo destructivo (CA-07.1)
    expect(screen.getByTestId("product-delete-modal")).toBeDefined();
    expect(screen.getByText("¿Eliminar repuesto permanentemente?")).toBeDefined();

    const confirmDeleteBtn = screen.getByTestId("product-delete-confirm-btn");
    expect(confirmDeleteBtn).toBeDefined();

    // 3. Confirmar eliminación
    await act(async () => {
      confirmDeleteBtn.click();
    });

    // 4. El producto desaparece permanentemente de la grilla (CA-07.2)
    await waitFor(() => {
      expect(screen.queryByTestId(`product-row-${hiluxId}`)).toBeNull();
    });
  });
});
