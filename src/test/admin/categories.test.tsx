import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import type { AdminCategory } from "@/types/admin";
import { AdminProvider } from "@/context/admin-context";
import { CategoryList } from "@/components/admin/categories/CategoryList";
import { CategoryFormModal } from "@/components/admin/categories/CategoryFormModal";
import { CategoryDeleteModal } from "@/components/admin/categories/CategoryDeleteModal";

/**
 * Arnés integrado del Módulo de Categorías que emula la vista /admin/categorias
 * conectando CategoryList, CategoryFormModal y CategoryDeleteModal.
 */
function CategoriesModuleHarness() {
  const [formOpen, setFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<AdminCategory | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

  return (
    <div className="p-4">
      <button
        data-testid="btn-new-category"
        onClick={() => {
          setCategoryToEdit(null);
          setFormOpen(true);
        }}
      >
        Nueva Categoría
      </button>

      <CategoryList
        onEdit={(cat) => {
          setCategoryToEdit(cat);
          setFormOpen(true);
        }}
        onDelete={(cat) => {
          setCategoryToDelete(cat);
          setDeleteOpen(true);
        }}
      />

      <CategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        categoryToEdit={categoryToEdit}
      />

      <CategoryDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={categoryToDelete}
      />
    </div>
  );
}

describe("Módulo de Categorías (Integración ABM) — Tarea 7.3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1) Creación de Categoría Raíz y Subcategoría (CA-10.1, CA-10.2)
  // -------------------------------------------------------------------------
  it("debe crear una categoría principal y luego una subcategoría hija vinculada (CA-10.1, CA-10.2)", async () => {
    render(
      <AdminProvider>
        <CategoriesModuleHarness />
      </AdminProvider>,
    );

    // 1. Crear categoría raíz
    await act(async () => {
      screen.getByTestId("btn-new-category").click();
    });

    expect(screen.getByTestId("category-form-modal")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Nueva Categoría" })).toBeDefined();

    const nameInput = screen.getByTestId("category-name-input");
    await act(async () => {
      fireEvent.change(nameInput, {
        target: { value: "Sistemas Hidráulicos Diésel" },
      });
    });

    await act(async () => {
      screen.getByTestId("category-form-submit-btn").click();
    });

    // Se renderiza en el árbol como raíz
    expect(screen.getByText("Sistemas Hidráulicos Diésel")).toBeDefined();

    // 2. Crear subcategoría vinculada a la raíz creada
    await act(async () => {
      screen.getByTestId("btn-new-category").click();
    });

    const subNameInput = screen.getByTestId("category-name-input");
    const parentSelect = screen.getByTestId("category-parent-select") as HTMLSelectElement;

    // Buscar la opción con el nombre de la raíz creada
    const rootOption = Array.from(parentSelect.options).find(
      (opt) => opt.text === "Sistemas Hidráulicos Diésel",
    );
    expect(rootOption).toBeDefined();
    if (!rootOption) return;

    await act(async () => {
      fireEvent.change(subNameInput, {
        target: { value: "Mangueras de Alta Presión" },
      });
      fireEvent.change(parentSelect, {
        target: { value: rootOption.value },
      });
    });

    await act(async () => {
      screen.getByTestId("category-form-submit-btn").click();
    });

    // Se renderiza como subcategoría en la lista
    expect(screen.getByText("Mangueras de Alta Presión")).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // 2) Inhabilitación de Selector de Padre si tiene Hijas (CA-10.4, CL-05)
  // -------------------------------------------------------------------------
  it("debe inhabilitar por completo el selector de categoría padre si la categoría editada posee hijas (CA-10.4, CL-05)", async () => {
    render(
      <AdminProvider>
        <CategoriesModuleHarness />
      </AdminProvider>,
    );

    // "Inyección Common Rail" tiene ID "e4b6d812-7a2b-4f51-b8f3-0a567c891001" y tiene subcategorías hijas
    const editBtn = screen.getByTestId("category-edit-btn-e4b6d812-7a2b-4f51-b8f3-0a567c891001");

    await act(async () => {
      editBtn.click();
    });

    expect(screen.getByRole("heading", { name: "Editar Categoría" })).toBeDefined();

    // El selector de padre debe estar deshabilitado
    const parentSelect = screen.getByTestId("category-parent-select") as HTMLSelectElement;
    expect(parentSelect.disabled).toBe(true);

    // Debe mostrar la advertencia visual descriptiva
    const disabledHint = screen.getByTestId("category-parent-disabled-hint");
    expect(disabledHint).toBeDefined();
    expect(disabledHint.textContent).toContain(
      "Esta categoría posee subcategorías vinculadas y no puede transformarse en subcategoría hija",
    );
  });

  // -------------------------------------------------------------------------
  // 3) Bloqueo de Eliminación con Productos y con Subcategorías (CA-11.1, CA-11.2, CL-06)
  // -------------------------------------------------------------------------
  it("debe bloquear la eliminación si la categoría posee productos asociados (CA-11.1, CL-06)", async () => {
    render(
      <AdminProvider>
        <CategoriesModuleHarness />
      </AdminProvider>,
    );

    // "Inyectores Common Rail" (ID: "e4b6d812-7a2b-4f51-b8f3-0a567c891002") tiene productos asociados (Amarok, Ranger, Hilux)
    const deleteBtn = screen.getByTestId(
      "category-delete-btn-e4b6d812-7a2b-4f51-b8f3-0a567c891002",
    );

    await act(async () => {
      deleteBtn.click();
    });

    expect(screen.getByTestId("category-delete-modal")).toBeDefined();
    expect(screen.getByText("No se puede eliminar la categoría")).toBeDefined();

    // Comprobar alerta de bloqueo y productos afectados
    const blockedAlert = screen.getByTestId("category-deletion-blocked-alert");
    expect(blockedAlert).toBeDefined();
    expect(blockedAlert.textContent).toContain(
      "No se puede eliminar la categoría porque contiene productos asociados",
    );

    const affectedList = screen.getByTestId("category-affected-products-list");
    expect(affectedList.textContent).toContain("Inyector Amarok 2.0 TDI");

    // Botón destructivo debe estar ausente
    expect(screen.queryByTestId("category-delete-confirm-btn")).toBeNull();

    // Botón Entendido cierra el modal sin alterar los datos
    const closeBtn = screen.getByTestId("category-delete-close-btn");
    await act(async () => {
      closeBtn.click();
    });

    expect(screen.getByText("Inyectores Common Rail")).toBeDefined();
  });

  it("debe bloquear la eliminación si la categoría posee subcategorías vinculadas (CA-11.2)", async () => {
    render(
      <AdminProvider>
        <CategoriesModuleHarness />
      </AdminProvider>,
    );

    // "Inyección Common Rail" (ID: "e4b6d812-7a2b-4f51-b8f3-0a567c891001") tiene 2 subcategorías
    const deleteBtn = screen.getByTestId(
      "category-delete-btn-e4b6d812-7a2b-4f51-b8f3-0a567c891001",
    );

    await act(async () => {
      deleteBtn.click();
    });

    expect(screen.getByTestId("category-delete-modal")).toBeDefined();
    expect(screen.getByText("No se puede eliminar la categoría")).toBeDefined();

    const blockedAlert = screen.getByTestId("category-deletion-blocked-alert");
    expect(blockedAlert.textContent).toContain("posee subcategorías vinculadas");
    expect(screen.queryByTestId("category-delete-confirm-btn")).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 4) Eliminación Exitosa de Categoría Vacía (CA-11.3)
  // -------------------------------------------------------------------------
  it("debe permitir eliminar exitosamente una categoría libre de productos y subcategorías (CA-11.3)", async () => {
    render(
      <AdminProvider>
        <CategoriesModuleHarness />
      </AdminProvider>,
    );

    // 1. Crear categoría limpia sin productos ni hijas
    await act(async () => {
      screen.getByTestId("btn-new-category").click();
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("category-name-input"), {
        target: { value: "Categoría Temporal Para Borrar" },
      });
    });

    await act(async () => {
      screen.getByTestId("category-form-submit-btn").click();
    });

    expect(screen.getByText("Categoría Temporal Para Borrar")).toBeDefined();

    // 2. Abrir modal de eliminación
    const deleteButtons = screen.getAllByRole("button", {
      name: /eliminar categoría categoría temporal para borrar/i,
    });
    const deleteBtn = deleteButtons[0];
    expect(deleteBtn).toBeDefined();
    if (!deleteBtn) return;

    await act(async () => {
      deleteBtn.click();
    });

    // 3. Confirmación destructiva permitida
    expect(screen.getByText("¿Eliminar categoría permanentemente?")).toBeDefined();
    expect(screen.queryByTestId("category-deletion-blocked-alert")).toBeNull();

    const confirmBtn = screen.getByTestId("category-delete-confirm-btn");
    expect(confirmBtn).toBeDefined();

    // 4. Confirmar eliminación
    await act(async () => {
      confirmBtn.click();
    });

    // 5. La categoría ya no está presente
    expect(screen.queryByText("Categoría Temporal Para Borrar")).toBeNull();
  });
});
