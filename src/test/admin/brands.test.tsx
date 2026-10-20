import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import type { AdminBrand } from "@/types/admin";
import { AdminProvider } from "@/context/admin-context";
import { BrandList } from "@/components/admin/brands/BrandList";
import { BrandFormModal } from "@/components/admin/brands/BrandFormModal";
import { BrandDeleteModal } from "@/components/admin/brands/BrandDeleteModal";

/**
 * Arnés integrado del Módulo de Marcas que emula la vista /admin/marcas
 * conectando BrandList, BrandFormModal y BrandDeleteModal.
 */
function BrandsModuleHarness() {
  const [formOpen, setFormOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<AdminBrand | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<AdminBrand | null>(null);

  return (
    <div className="p-4">
      <button
        data-testid="btn-new-brand"
        onClick={() => {
          setBrandToEdit(null);
          setFormOpen(true);
        }}
      >
        Nueva Marca
      </button>

      <BrandList
        onEdit={(brand) => {
          setBrandToEdit(brand);
          setFormOpen(true);
        }}
        onDelete={(brand) => {
          setBrandToDelete(brand);
          setDeleteOpen(true);
        }}
      />

      <BrandFormModal open={formOpen} onOpenChange={setFormOpen} brandToEdit={brandToEdit} />

      <BrandDeleteModal open={deleteOpen} onOpenChange={setDeleteOpen} brand={brandToDelete} />
    </div>
  );
}

describe("Módulo de Marcas (Integración ABM) — Tarea 6.3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1) Alta de Marca (CA-12.1)
  // -------------------------------------------------------------------------
  it("debe dar de alta una nueva marca exitosamente mediante el formulario modal (CA-12.1)", async () => {
    render(
      <AdminProvider>
        <BrandsModuleHarness />
      </AdminProvider>,
    );

    // Abrir modal de nueva marca
    await act(async () => {
      screen.getByTestId("btn-new-brand").click();
    });

    expect(screen.getByTestId("brand-form-modal")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Nueva Marca" })).toBeDefined();

    // Completar el nombre de la nueva marca
    const nameInput = screen.getByTestId("brand-name-input");
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Continental VDO" } });
    });

    // Enviar el formulario
    await act(async () => {
      screen.getByTestId("brand-form-submit-btn").click();
    });

    // Verificar que la nueva marca se renderiza en la tabla
    expect(screen.getByText("Continental VDO")).toBeDefined();
    // La marca recién creada no posee repuestos asociados aún
    expect(screen.getByText("0 repuestos")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // 2) Rechazo de Duplicados (CA-12.2) y Validación de Longitud (CA-12.1)
  // -------------------------------------------------------------------------
  it("debe rechazar nombres duplicados (case-insensitive con trim) y nombres cortos < 2 caracteres (CA-12.1, CA-12.2)", async () => {
    render(
      <AdminProvider>
        <BrandsModuleHarness />
      </AdminProvider>,
    );

    // 1. Abrir modal
    await act(async () => {
      screen.getByTestId("btn-new-brand").click();
    });

    const nameInput = screen.getByTestId("brand-name-input");

    // Probar nombre corto < 2 caracteres
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: " B " } });
      fireEvent.blur(nameInput);
    });

    expect(screen.getByTestId("brand-name-field-error")).toBeDefined();
    expect(screen.getByTestId("brand-name-field-error").textContent).toContain(
      "al menos 2 caracteres",
    );

    // Probar duplicado case-insensitive: "  bosch  " existe en las semillas
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "  bosch  " } });
    });

    await act(async () => {
      screen.getByTestId("brand-form-submit-btn").click();
    });

    // El modal debe permanecer abierto y mostrar alerta de unicidad
    expect(screen.getByTestId("brand-form-alert-error")).toBeDefined();
    expect(screen.getByTestId("brand-form-alert-error").textContent).toContain(
      "Ya existe una marca con este nombre",
    );
  });

  // -------------------------------------------------------------------------
  // 3) Bloqueo de Borrado con Productos Asociados (CA-12.3, CL-06)
  // -------------------------------------------------------------------------
  it("debe bloquear la eliminación de una marca asignada a productos y listar los afectados (CA-12.3, CL-06)", async () => {
    render(
      <AdminProvider>
        <BrandsModuleHarness />
      </AdminProvider>,
    );

    // Bosch tiene UUID "b1a2c3d4-0001-4000-8000-000000000001" y tiene repuestos asociados
    const boschDeleteBtn = screen.getByTestId(
      "brand-delete-btn-b1a2c3d4-0001-4000-8000-000000000001",
    );

    await act(async () => {
      boschDeleteBtn.click();
    });

    // Modal de confirmación con bloqueo impeditivo
    expect(screen.getByTestId("brand-delete-modal")).toBeDefined();
    expect(screen.getByText("No se puede eliminar la marca")).toBeDefined();

    // Alerta de bloqueo y lista de productos
    const alertBox = screen.getByTestId("brand-deletion-blocked-alert");
    expect(alertBox).toBeDefined();
    expect(alertBox.textContent).toContain(
      "No se puede eliminar la marca porque contiene productos asociados",
    );

    const affectedList = screen.getByTestId("brand-affected-products-list");
    expect(affectedList.textContent).toContain("Inyector Amarok 2.0 TDI");
    expect(affectedList.textContent).toContain("Inyector Sprinter 2.2 CDI");

    // El botón destructivo no debe existir en estado bloqueado
    expect(screen.queryByTestId("brand-delete-confirm-btn")).toBeNull();

    // Debe mostrar botón "Entendido" para cerrar
    const closeBtn = screen.getByTestId("brand-delete-close-btn");
    expect(closeBtn).toBeDefined();

    await act(async () => {
      closeBtn.click();
    });

    // Bosch sigue presente intacto en la lista
    expect(screen.getByText("Bosch")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // 4) Eliminación Exitosa cuando está Libre (CA-12.5)
  // -------------------------------------------------------------------------
  it("debe permitir eliminar permanentemente una marca que no posea productos asociados (CA-12.5)", async () => {
    render(
      <AdminProvider>
        <BrandsModuleHarness />
      </AdminProvider>,
    );

    // 1. Crear una marca sin productos
    await act(async () => {
      screen.getByTestId("btn-new-brand").click();
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("brand-name-input"), {
        target: { value: "Magneti Marelli" },
      });
    });

    await act(async () => {
      screen.getByTestId("brand-form-submit-btn").click();
    });

    expect(screen.getByText("Magneti Marelli")).toBeDefined();

    // 2. Abrir modal de eliminación para la nueva marca
    const deleteButtons = screen.getAllByRole("button", {
      name: /eliminar marca magneti marelli/i,
    });
    const deleteBtn = deleteButtons[0];
    expect(deleteBtn).toBeDefined();
    if (!deleteBtn) return;

    await act(async () => {
      deleteBtn.click();
    });

    // 3. El modal debe mostrar diálogo de confirmación (no bloqueo)
    expect(screen.getByText("¿Eliminar marca permanentemente?")).toBeDefined();
    expect(screen.queryByTestId("brand-deletion-blocked-alert")).toBeNull();

    const confirmBtn = screen.getByTestId("brand-delete-confirm-btn");
    expect(confirmBtn).toBeDefined();

    // 4. Confirmar eliminación
    await act(async () => {
      confirmBtn.click();
    });

    // 5. La marca debe haber sido removida de la tabla
    expect(screen.queryByText("Magneti Marelli")).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 5) Edición y Renombrado de Marca (CA-12.4, CL-09)
  // -------------------------------------------------------------------------
  it("debe permitir editar el nombre de una marca existente conservando su ID (CA-12.4, CL-09)", async () => {
    render(
      <AdminProvider>
        <BrandsModuleHarness />
      </AdminProvider>,
    );

    // Delphi ID: "b1a2c3d4-0002-4000-8000-000000000002"
    const editBtn = screen.getByTestId("brand-edit-btn-b1a2c3d4-0002-4000-8000-000000000002");

    await act(async () => {
      editBtn.click();
    });

    expect(screen.getByText("Editar Marca")).toBeDefined();
    const nameInput = screen.getByTestId("brand-name-input") as HTMLInputElement;
    expect(nameInput.value).toBe("Delphi");

    // Modificar nombre
    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: "Delphi Technologies" },
      });
    });

    await act(async () => {
      screen.getByTestId("brand-form-submit-btn").click();
    });

    // Nombre actualizado en la tabla
    expect(screen.getByText("Delphi Technologies")).toBeDefined();
    // Y el ID sigue siendo el original
    expect(screen.getByText("b1a2c3d4-0002-4000-8000-000000000002")).toBeDefined();
  });
});
