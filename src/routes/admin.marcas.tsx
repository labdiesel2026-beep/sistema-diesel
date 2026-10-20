import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { pageHead } from "@/components/diesel-site";
import { Button } from "@/components/ui/button";
import type { AdminBrand } from "@/types/admin";
import { BrandList } from "@/components/admin/brands/BrandList";
import { BrandFormModal } from "@/components/admin/brands/BrandFormModal";
import { BrandDeleteModal } from "@/components/admin/brands/BrandDeleteModal";

export const Route = createFileRoute("/admin/marcas")({
  head: () =>
    pageHead(
      "Marcas — Laboratorio Diésel",
      "Gestión de marcas y fabricantes de repuestos del catálogo técnico de inyección diésel.",
    ),
  component: AdminMarcasPage,
});

function AdminMarcasPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<AdminBrand | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<AdminBrand | null>(null);

  const handleCreate = () => {
    setBrandToEdit(null);
    setFormOpen(true);
  };

  const handleEdit = (brand: AdminBrand) => {
    setBrandToEdit(brand);
    setFormOpen(true);
  };

  const handleDelete = (brand: AdminBrand) => {
    setBrandToDelete(brand);
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
            Marcas y Fabricantes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión normalizada de marcas comerciales por identificadores UUIDv4.
          </p>
        </div>

        <div>
          <Button
            onClick={handleCreate}
            variant="industrial"
            className="gap-2 shadow-sm font-semibold"
            data-testid="admin-new-brand-btn"
          >
            <Plus className="size-4" />
            <span>Nueva Marca</span>
          </Button>
        </div>
      </header>

      {/* Tabla de Marcas con conteo relacional */}
      <BrandList onEdit={handleEdit} onDelete={handleDelete} />

      {/* Modales de Gestión de Marca */}
      <BrandFormModal open={formOpen} onOpenChange={setFormOpen} brandToEdit={brandToEdit} />

      <BrandDeleteModal open={deleteOpen} onOpenChange={setDeleteOpen} brand={brandToDelete} />
    </div>
  );
}
