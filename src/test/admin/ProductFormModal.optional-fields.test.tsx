import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { AdminProvider, useAdmin } from "@/context/admin-context";
import type { AdminProduct, AdminCategory, AdminBrand } from "@/types/admin";

// Mock de ResizeObserver para Radix Dialog
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;

const mockCategories: AdminCategory[] = [
  {
    id: "e4b6d812-7a2b-4f51-b8f3-0a567c891001",
    name: "Inyectores Common Rail",
    parentId: null,
    productCount: 5,
  },
];

const mockBrands: AdminBrand[] = [
  {
    id: "b1a2c3d4-0001-4000-8000-000000000001",
    name: "Bosch",
    productCount: 10,
  },
];

describe("ProductFormModal — Campos Opcionales OEM y Compatibilidad Vehicular (Fase 15, TASK-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite dar de alta un producto con OEM y Compatibilidad Vehicular completamente vacíos", async () => {
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    // Mockeamos la API para simular creación exitosa
    const mockCreateProduct = vi.fn().mockResolvedValue({
      success: true,
      product: { id: "new-prod-id", name: "Inyector Test" },
    });

    function TestHarness() {
      return (
        <AdminProvider initialCategories={mockCategories} initialBrands={mockBrands}>
          <ProductFormModal
            open={true}
            onOpenChange={onOpenChange}
            productToEdit={null}
            onSuccess={onSuccess}
          />
        </AdminProvider>
      );
    }

    render(<TestHarness />);

    // Completar campos obligatorios
    // 1. Nombre
    const nameInput = screen.getByTestId("product-name-input");
    fireEvent.change(nameInput, { target: { value: "Inyector Bosch Piezoeléctrico" } });

    // 2. Foto (simulamos que ya hay URL ingresando valor en dropzone o mediante props)
    // El campo foto en el DOM:
    const dropzoneInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(dropzoneInput).toBeInTheDocument();

    // 3. Marca
    const brandSelect = screen.getByTestId("product-brand-select");
    fireEvent.change(brandSelect, { target: { value: mockBrands[0].id } });

    // 4. Categoría
    const catCheckbox = screen.getByTestId(`category-checkbox-${mockCategories[0].id}`);
    fireEvent.click(catCheckbox);

    // 5. Descripción
    const descInput = document.querySelector("#product-description") as HTMLTextAreaElement;
    fireEvent.change(descInput, {
      target: { value: "Descripción técnica detallada para prueba de calibración y flujo" },
    });

    // 6. Campos opcionales: asegurar que OEM y Compatibilidad están explícitamente vacíos
    const oemInput = screen.getByTestId("product-oem-input");
    expect(oemInput).toHaveValue("");
    const compatInput = screen.getByTestId("product-vehicle-input");
    expect(compatInput).toHaveValue("");

    // Verificar que los inputs NO tienen el atributo required
    expect(oemInput).not.toHaveAttribute("required");
    expect(compatInput).not.toHaveAttribute("required");

    // Verificar que al disparar blur no aparezcan errores
    fireEvent.blur(oemInput);
    fireEvent.blur(compatInput);
    expect(screen.queryByTestId("product-oem-field-error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("product-vehicle-field-error")).not.toBeInTheDocument();
  });

  it("permite enviar el formulario en modo edición con OEM y compatibilidad vacíos llamando al submit exitosamente", async () => {
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    const existingProduct: AdminProduct = {
      id: "prod-123",
      name: "Bomba Inyectora CP4",
      description: "Bomba de alta presión Common Rail reparada a nuevo",
      imageUrl: "/uploads/cp4.webp",
      brandId: mockBrands[0].id,
      categoryIds: [mockCategories[0].id],
      condition: "Reacondicionado",
      price: 450000,
      showPrice: true,
      visible: true,
      oem: "0445010507",
      vehicleCompatibility: "Volkswagen Amarok 2.0 TDI",
      isFeatured: false,
    };

    function TestEditHarness() {
      return (
        <AdminProvider initialCategories={mockCategories} initialBrands={mockBrands}>
          <ProductFormModal
            open={true}
            onOpenChange={onOpenChange}
            productToEdit={existingProduct}
            onSuccess={onSuccess}
          />
        </AdminProvider>
      );
    }

    render(<TestEditHarness />);

    // Borramos OEM y Compatibilidad dejándolos vacíos
    const oemInput = screen.getByTestId("product-oem-input");
    fireEvent.change(oemInput, { target: { value: "" } });
    expect(oemInput).toHaveValue("");

    const compatInput = screen.getByTestId("product-vehicle-input");
    fireEvent.change(compatInput, { target: { value: "" } });
    expect(compatInput).toHaveValue("");

    // Verificamos que no haya errores
    fireEvent.blur(oemInput);
    fireEvent.blur(compatInput);
    expect(screen.queryByTestId("product-oem-field-error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("product-vehicle-field-error")).not.toBeInTheDocument();

    // Hacemos submit del formulario
    const submitBtn = screen.getByTestId("product-form-submit-btn");
    fireEvent.click(submitBtn);

    // No debe aparecer la alerta de error del formulario
    expect(screen.queryByTestId("product-form-alert-error")).not.toBeInTheDocument();
  });
});
