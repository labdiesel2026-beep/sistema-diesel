import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { pageHead } from "@/components/diesel-site";
import { Button } from "@/components/ui/button";
import type { AdminCategory } from "@/types/admin";
import { CategoryList } from "@/components/admin/categories/CategoryList";
import { CategoryFormModal } from "@/components/admin/categories/CategoryFormModal";
import { CategoryDeleteModal } from "@/components/admin/categories/CategoryDeleteModal";

export const Route = createFileRoute("/admin/categorias")({
  head: () =>
    pageHead(
      "Categorías — Laboratorio Diésel",
      "Gestión jerárquica de categorías y subcategorías de repuestos de inyección diésel.",
    ),
  component: AdminCategoriasPage,
});

function AdminCategoriasPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<AdminCategory | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

  const handleCreate = () => {
    setCategoryToEdit(null);
    setFormOpen(true);
  };

  const handleEdit = (category: AdminCategory) => {
    setCategoryToEdit(category);
    setFormOpen(true);
  };

  const handleDelete = (category: AdminCategory) => {
    setCategoryToDelete(category);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administración / Catálogo
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Categorías y Subcategorías
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organización jerárquica de repuestos (máximo 1 nivel) vinculada al inventario técnico.
          </p>
        </div>

        <div>
          <Button
            onClick={handleCreate}
            variant="industrial"
            className="gap-2 shadow-sm font-semibold"
            data-testid="admin-new-category-btn"
          >
            <Plus className="size-4" />
            <span>Nueva Categoría</span>
          </Button>
        </div>
      </header>

      {/* Árbol y Tabla Jerárquica de Categorías */}
      <CategoryList onEdit={handleEdit} onDelete={handleDelete} />

      {/* Modales de Gestión de Categoría */}
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
