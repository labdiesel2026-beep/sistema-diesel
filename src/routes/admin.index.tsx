import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { pageHead } from "@/components/diesel-site";
import type { AdminProduct } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import { ProductToolbar } from "@/components/admin/products/ProductToolbar";
import { ProductList, filterAdminProducts } from "@/components/admin/products/ProductList";
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
  const { products, brands, getBrandById } = useAdmin();
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

  // Mapa indexado O(1) para resolución rápida de nombres de marcas (Fase 14 RF-04)
  const brandNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(brands)) {
      for (const b of brands) {
        map.set(b.id, b.name);
      }
    }
    return map;
  }, [brands]);

  // Conteo memoizado de repuestos destacados en memoria
  const featuredCount = useMemo(
    () => products.filter((p) => p.isFeatured).length,
    [products],
  );

  // Filtrado memoizado único compartido entre el contador de Toolbar y la tabla ProductList
  const filteredProducts = useMemo(
    () =>
      filterAdminProducts(
        products,
        {
          searchQuery,
          onlyFeatured,
          selectedCategory,
          selectedBrand,
          selectedStatus,
          selectedFeatured,
        },
        (brandId) => brandNameMap.get(brandId) ?? getBrandById(brandId)?.name ?? "",
      ),
    [
      products,
      searchQuery,
      onlyFeatured,
      selectedCategory,
      selectedBrand,
      selectedStatus,
      selectedFeatured,
      brandNameMap,
      getBrandById,
    ],
  );
  const filteredCount = filteredProducts.length;

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
        preFilteredProducts={filteredProducts}
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
