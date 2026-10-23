import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/components/diesel-site";
import type { AdminProduct } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import { ProductToolbar } from "@/components/admin/products/ProductToolbar";
import { ProductList } from "@/components/admin/products/ProductList";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { DeleteConfirmModal } from "@/components/admin/products/DeleteConfirmModal";

export const Route = createFileRoute("/admin/")({
  head: () =>
    pageHead(
      "Catálogo de Repuestos — Laboratorio Diésel",
      "Administración y control de inventario de repuestos, bombas e inyectores diésel con calibración y trazabilidad técnica.",
    ),
  component: AdminProductsPage,
});

/**
 * Punto de entrada principal del backoffice (/admin).
 * Integra Toolbar, Table, FormModal y DeleteModal para el catálogo de repuestos.
 * (RF-05, RF-06, RF-07)
 */
function AdminProductsPage() {
  const { products, getBrandById } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "visible" | "hidden">("all");
  const [selectedFeatured, setSelectedFeatured] = useState<"all" | "featured" | "standard">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<AdminProduct | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  const handleCreate = () => {
    setProductToEdit(null);
    setFormOpen(true);
  };

  const handleEdit = (product: AdminProduct) => {
    setProductToEdit(product);
    setFormOpen(true);
  };

  const handleDelete = (product: AdminProduct) => {
    setProductToDelete(product);
    setDeleteOpen(true);
  };

  // Conteo de repuestos destacados en memoria
  const featuredCount = products.filter((p) => p.isFeatured).length;

  // Conteo reactivo de repuestos filtrados según término de búsqueda y filtros combinados (RF-04, CA-04.3)
  const clean = searchQuery.trim().toLowerCase();
  const filteredCount = products.filter((p) => {
    if (onlyFeatured || selectedFeatured === "featured") {
      if (!p.isFeatured) return false;
    } else if (selectedFeatured === "standard") {
      if (p.isFeatured) return false;
    }

    if (selectedStatus === "visible" && !p.visible) return false;
    if (selectedStatus === "hidden" && p.visible) return false;
    if (selectedBrand && p.brandId !== selectedBrand) return false;
    if (
      selectedCategory &&
      (!p.categoryIds || !p.categoryIds.includes(selectedCategory))
    ) {
      return false;
    }

    if (!clean) return true;
    const brand = getBrandById(p.brandId);
    const brandName = brand ? brand.name.toLowerCase() : "";
    return (
      p.name.toLowerCase().includes(clean) ||
      p.oem.toLowerCase().includes(clean) ||
      p.description.toLowerCase().includes(clean) ||
      p.vehicleCompatibility.toLowerCase().includes(clean) ||
      brandName.includes(clean)
    );
  }).length;

  return (
    <div className="space-y-6">
      {/* Encabezado de la Sección */}
      <header className="flex flex-col gap-1">
        <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Administración / Catálogo
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Catálogo de Repuestos
        </h1>
        <p className="text-sm text-muted-foreground">
          Control de inventario, edición técnica, códigos OEM, compatibilidad vehicular y
          visibilidad en tienda.
        </p>
      </header>

      {/* Barra de herramientas: Buscador sanitizado, selects de categorías, marcas, estado y destacados */}
      <ProductToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewProduct={handleCreate}
        totalCount={products.length}
        filteredCount={filteredCount}
        featuredCount={featuredCount}
        showOnlyFeatured={onlyFeatured}
        onToggleOnlyFeatured={setOnlyFeatured}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedFeatured={selectedFeatured}
        onFeaturedChange={setSelectedFeatured}
        onResetAllFilters={() => {
          setSelectedCategory("");
          setSelectedBrand("");
          setSelectedStatus("all");
          setSelectedFeatured("all");
          setOnlyFeatured(false);
          setSearchQuery("");
        }}
      />

      {/* Grilla interactiva de repuestos con resolución relacional de marcas y switches de visibilidad */}
      <ProductList
        searchQuery={searchQuery}
        onlyFeatured={onlyFeatured}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        selectedStatus={selectedStatus}
        selectedFeatured={selectedFeatured}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Creación y Edición de Producto con validación Zod */}
      <ProductFormModal open={formOpen} onOpenChange={setFormOpen} productToEdit={productToEdit} />

      {/* Modal de Eliminación con confirmación destructiva y validación tipada */}
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={productToDelete}
      />
    </div>
  );
}
