import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { AdminProvider, useAdmin } from "@/context/admin-context";
import type { AdminProduct } from "@/types/admin";

// Mock de ResizeObserver para componentes Radix Dialog
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;

describe("ProductFormModal — Control y Bloqueo Preventivo de Destacados (Tarea 8.3, RF-02, RF-03, CL-05)", () => {
  // Crear 10 productos destacados simulados para saturar el cupo
  const tenFeaturedProducts: AdminProduct[] = Array.from({ length: 10 }, (_, i) => ({
    id: `featured-${i + 1}`,
    name: `Producto Destacado ${i + 1}`,
    description: `Descripción ${i + 1}`,
    imageUrl: `/uploads/p${i + 1}.webp`,
    brandId: "b1a2c3d4-0001-4000-8000-000000000001",
    categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891001"],
    condition: "Nuevo",
    price: 100000,
    showPrice: true,
    visible: true,
    isFeatured: true,
    featuredAt: new Date().toISOString(),
    oem: `OEM-${i + 1}`,
    vehicleCompatibility: "Universal / Multimarca",
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el switch bloqueado (disabled) y muestra texto preventivo al crear con cupo 10/10 (CA-02.2)", () => {
    // Harness que inyecta los 10 productos en el contexto
    function ModalCreateHarness() {
      return (
        <AdminProvider initialProducts={tenFeaturedProducts}>
          <ProductFormModal open={true} onOpenChange={vi.fn()} productToEdit={null} />
        </AdminProvider>
      );
    }

    render(<ModalCreateHarness />);

    const switchEl = screen.getByTestId("product-featured-switch");
    expect(switchEl).toBeDisabled();

    const warningText = screen.getByTestId("product-featured-limit-warning");
    expect(warningText).toBeInTheDocument();
    expect(warningText.textContent).toContain(
      "Límite de 10 destacados alcanzado. Desmarca uno primero desde la tabla",
    );
  });

  it("mantiene el switch habilitado al editar un producto YA destacado, permitiendo desmarcarlo (CA-02.3)", () => {
    const featuredProductToEdit = tenFeaturedProducts[0];

    function ModalEditHarness() {
      return (
        <AdminProvider initialProducts={tenFeaturedProducts}>
          <ProductFormModal
            open={true}
            onOpenChange={vi.fn()}
            productToEdit={featuredProductToEdit}
          />
        </AdminProvider>
      );
    }

    render(<ModalEditHarness />);

    const switchEl = screen.getByTestId("product-featured-switch");
    // Al ser un producto ya destacado, el usuario tiene permitido desmarcarlo
    expect(switchEl).not.toBeDisabled();
    expect(switchEl).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByTestId("product-featured-limit-warning")).not.toBeInTheDocument();
  });

  it("mantiene el switch habilitado en modo alta cuando hay cupo disponible (< 10)", () => {
    const fiveFeaturedProducts = tenFeaturedProducts.slice(0, 5);

    function ModalAvailableHarness() {
      return (
        <AdminProvider initialProducts={fiveFeaturedProducts}>
          <ProductFormModal open={true} onOpenChange={vi.fn()} productToEdit={null} />
        </AdminProvider>
      );
    }

    render(<ModalAvailableHarness />);

    const switchEl = screen.getByTestId("product-featured-switch");
    expect(switchEl).not.toBeDisabled();
    expect(screen.queryByTestId("product-featured-limit-warning")).not.toBeInTheDocument();
  });

  it("activa preventivamente beforeunload ante cambios sin guardar en el formulario (TASK-21, Caso Límite 10)", async () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    render(
      <AdminProvider initialProducts={[]}>
        <ProductFormModal open={true} onOpenChange={vi.fn()} productToEdit={null} />
      </AdminProvider>,
    );

    const nameInput = screen.getByTestId("product-name-input");

    // Al escribir en el campo, el formulario pasa a estar dirty
    fireEvent.change(nameInput, { target: { value: "Inyector Cummins ISX" } });

    expect(addEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

    // Despachar evento beforeunload
    const event = new Event("beforeunload", { cancelable: true }) as BeforeUnloadEvent;
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });
});
