import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DeleteConfirmModal } from "@/components/admin/products/DeleteConfirmModal";
import { AdminProvider } from "@/context/admin-context";
import type { AdminProduct } from "@/types/admin";

const sampleProduct: AdminProduct = {
  id: "prod-delete-test-1",
  name: "Bomba de Alta Presión Bosch CP4",
  brandId: "brand-bosch",
  categoryIds: ["cat-bombas"],
  vehicleCompatibility: "Ford Ranger 3.2 TDCi",
  condition: "Nuevo",
  oem: "0445010685",
  price: 980000,
  showPrice: true,
  visible: true,
  isFeatured: false,
  imageUrl: "/uploads/prod-delete-1.webp",
  description: "Bomba nueva original",
};

describe("DeleteConfirmModal — Validación Tipada ELIMINAR (TASK-20, RF-09)", () => {
  const handleOpenChange = vi.fn();
  const handleSuccess = vi.fn();
  const handleConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el modal bloqueante con botón de confirmación deshabilitado por defecto", () => {
    render(
      <AdminProvider>
        <DeleteConfirmModal
          open={true}
          onOpenChange={handleOpenChange}
          product={sampleProduct}
          onSuccess={handleSuccess}
          onConfirm={handleConfirm}
        />
      </AdminProvider>,
    );

    expect(screen.getByTestId("delete-confirm-modal")).toBeInTheDocument();
    expect(screen.getByText(/¿Eliminar repuesto permanentemente\?/i)).toBeInTheDocument();
    expect(screen.getByText(/"Bomba de Alta Presión Bosch CP4"/i)).toBeInTheDocument();

    const submitBtn = screen.getByTestId("delete-confirm-submit-btn");
    expect(submitBtn).toBeDisabled();

    const input = screen.getByTestId("delete-confirm-input");
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("autocapitalize", "characters");
    expect(input).toHaveAttribute("spellcheck", "false");
  });

  it("solo habilita el botón si el texto ingresado es estrictamente 'ELIMINAR' (case-sensitive + trim)", async () => {
    render(
      <AdminProvider>
        <DeleteConfirmModal
          open={true}
          onOpenChange={handleOpenChange}
          product={sampleProduct}
          onSuccess={handleSuccess}
          onConfirm={handleConfirm}
        />
      </AdminProvider>,
    );

    const input = screen.getByTestId("delete-confirm-input");
    const submitBtn = screen.getByTestId("delete-confirm-submit-btn");

    // 1. Minúsculas "eliminar" -> Bloqueado
    await act(async () => {
      fireEvent.change(input, { target: { value: "eliminar" } });
    });
    expect(submitBtn).toBeDisabled();

    // 2. Mayúscula inicial "Eliminar" -> Bloqueado
    await act(async () => {
      fireEvent.change(input, { target: { value: "Eliminar" } });
    });
    expect(submitBtn).toBeDisabled();

    // 3. Palabra incompleta "ELIMINA" -> Bloqueado
    await act(async () => {
      fireEvent.change(input, { target: { value: "ELIMINA" } });
    });
    expect(submitBtn).toBeDisabled();

    // 4. Palabra exacta con espacios accidentales "  ELIMINAR  " -> Habilitado (gracias a .trim())
    await act(async () => {
      fireEvent.change(input, { target: { value: "  ELIMINAR  " } });
    });
    expect(submitBtn).toBeEnabled();

    // 5. Borrado o cambio a texto erróneo -> Vuelve a deshabilitarse
    await act(async () => {
      fireEvent.change(input, { target: { value: "ELIMINAR1" } });
    });
    expect(submitBtn).toBeDisabled();
  });

  it("intercepta onSubmit y cancela envío con Enter si el texto no es 'ELIMINAR'", async () => {
    render(
      <AdminProvider>
        <DeleteConfirmModal
          open={true}
          onOpenChange={handleOpenChange}
          product={sampleProduct}
          onSuccess={handleSuccess}
          onConfirm={handleConfirm}
        />
      </AdminProvider>,
    );

    const input = screen.getByTestId("delete-confirm-input");
    const form = input.closest("form")!;
    expect(form).toBeInTheDocument();

    // 1. Simular envío de formulario con texto inválido
    await act(async () => {
      fireEvent.change(input, { target: { value: "borrar" } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    // onConfirm no debe haberse invocado
    expect(handleConfirm).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();

    // 2. Simular envío con texto correcto "ELIMINAR"
    await act(async () => {
      fireEvent.change(input, { target: { value: "ELIMINAR" } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(handleConfirm).toHaveBeenCalledWith(sampleProduct);
    expect(handleSuccess).toHaveBeenCalled();
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("permite cancelar el diálogo cerrando el modal sin ejecutar borrado", () => {
    render(
      <AdminProvider>
        <DeleteConfirmModal
          open={true}
          onOpenChange={handleOpenChange}
          product={sampleProduct}
          onSuccess={handleSuccess}
          onConfirm={handleConfirm}
        />
      </AdminProvider>,
    );

    const cancelBtn = screen.getByTestId("delete-confirm-cancel-btn");
    fireEvent.click(cancelBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});
