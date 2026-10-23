import { useState } from "react";
import { Search, Plus, X, Package, Star, Filter, RotateCcw, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/admin-context";
import { cn } from "@/lib/utils";

import type { AdminBrand, AdminCategory } from "@/types/admin";

export interface ProductToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewProduct?: (() => void) | undefined;
  totalCount?: number | undefined;
  filteredCount?: number | undefined;
  featuredCount?: number | undefined;
  showOnlyFeatured?: boolean | undefined;
  onToggleOnlyFeatured?: ((value: boolean) => void) | undefined;
  categories?: AdminCategory[] | undefined;
  selectedCategory?: string | undefined;
  onCategoryChange?: ((categoryId: string) => void) | undefined;
  brands?: AdminBrand[] | undefined;
  selectedBrand?: string | undefined;
  onBrandChange?: ((brandId: string) => void) | undefined;
  selectedStatus?: "all" | "visible" | "hidden" | undefined;
  onStatusChange?: ((status: "all" | "visible" | "hidden") => void) | undefined;
  selectedFeatured?: "all" | "featured" | "standard" | undefined;
  onFeaturedChange?: ((featured: "all" | "featured" | "standard") => void) | undefined;
  onResetAllFilters?: (() => void) | undefined;
  className?: string | undefined;
}

function useSafeAdminContext() {
  try {
    return useAdmin();
  } catch {
    return null;
  }
}

/**
 * Barra de herramientas y filtros del catálogo de repuestos en el panel administrativo.
 * (RF-04, CA-04.2, CA-04.3, RF-06, CA-06.4, CL-11)
 *
 * Características:
 * - Búsqueda en tiempo real con sanitización literal.
 * - Filtros desplegables (Selects) para Categorías, Marcas, Estado de Visibilidad y Destacados.
 * - Botón/Filtro rápido "Solo Destacados" sincronizado.
 * - Botón de limpieza rápida de filtros activos.
 * - Conteo reactivo de repuestos totales / filtrados.
 * - Badge con indicador en tiempo real "Destacados: X / 10".
 * - Botón de acción principal para crear nuevo repuesto.
 */
export function ProductToolbar({
  searchQuery,
  onSearchChange,
  onNewProduct,
  totalCount,
  filteredCount,
  featuredCount,
  showOnlyFeatured = false,
  onToggleOnlyFeatured,
  categories: propCategories,
  selectedCategory = "",
  onCategoryChange,
  brands: propBrands,
  selectedBrand = "",
  onBrandChange,
  selectedStatus = "all",
  onStatusChange,
  selectedFeatured = "all",
  onFeaturedChange,
  onResetAllFilters,
  className,
}: ProductToolbarProps) {
  const safeAdmin = useSafeAdminContext();
  const brands = propBrands ?? safeAdmin?.brands ?? [];
  const categories = propCategories ?? safeAdmin?.categories ?? [];
  const [internalOnlyFeatured, setInternalOnlyFeatured] = useState(false);

  const isOnlyFeatured =
    onToggleOnlyFeatured !== undefined ? showOnlyFeatured : internalOnlyFeatured;

  const handleToggleFeatured = () => {
    const nextVal = !isOnlyFeatured;
    if (onToggleOnlyFeatured) {
      onToggleOnlyFeatured(nextVal);
    } else {
      setInternalOnlyFeatured(nextVal);
    }
    if (onFeaturedChange) {
      onFeaturedChange(nextVal ? "featured" : "all");
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedCategory ||
      selectedBrand ||
      selectedStatus !== "all" ||
      selectedFeatured !== "all" ||
      isOnlyFeatured,
  );

  const handleResetFilters = () => {
    onSearchChange("");
    onCategoryChange?.("");
    onBrandChange?.("");
    onStatusChange?.("all");
    onFeaturedChange?.("all");
    if (onToggleOnlyFeatured) {
      onToggleOnlyFeatured(false);
    } else {
      setInternalOnlyFeatured(false);
    }
    onResetAllFilters?.();
  };

  const isFiltered =
    typeof totalCount === "number" &&
    typeof filteredCount === "number" &&
    filteredCount !== totalCount;

  return (
    <div
      data-testid="product-toolbar"
      className={cn("flex flex-col gap-3 rounded-xl bg-white p-4 border border-admin-border shadow-xs", className)}
    >
      {/* Fila Superior: Buscador y Acciones Principales */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Buscador Literal Sanitizado y Botón Rápido */}
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:max-w-xl">
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, OEM, vehículo o descripción..."
              data-testid="product-search-input"
              className="h-10 pl-9 pr-9 text-sm border-admin-border bg-admin-bg/50"
              aria-label="Buscar repuestos"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                data-testid="product-search-clear"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filtro Rápido "Solo Destacados" (RF-04, CA-04.3) */}
          <Button
            type="button"
            variant={isOnlyFeatured ? "default" : "outline"}
            size="sm"
            onClick={handleToggleFeatured}
            data-testid="filter-only-featured-btn"
            aria-pressed={isOnlyFeatured}
            className={cn(
              "h-10 gap-1.5 px-3 text-xs font-medium cursor-pointer transition-colors border-admin-border",
              isOnlyFeatured
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "text-admin-text-sub hover:text-admin-text-main bg-white hover:bg-slate-50",
            )}
          >
            <Star
              className={cn(
                "size-3.5",
                isOnlyFeatured ? "fill-white text-white" : "text-amber-500",
              )}
            />
            <span>Solo Destacados</span>
          </Button>
        </div>

        {/* Contadores, Badge de Destacados y Botón Nuevo Producto */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          {/* Badge "Destacados: X / 10" con estado condicional (mínimo 3 requerido para carrusel) */}
          {typeof featuredCount === "number" && (
            <div
              data-testid="featured-counter-badge"
              title={
                featuredCount < 3
                  ? "Se requieren al menos 3 productos para activar el carrusel en el catálogo público"
                  : undefined
              }
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors",
                featuredCount < 3
                  ? "border-amber-300 bg-amber-100 text-amber-800"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
              )}
            >
              {featuredCount < 3 ? (
                <AlertTriangle className="size-3.5 text-amber-700 shrink-0" aria-hidden="true" />
              ) : (
                <Star className="size-3.5 fill-emerald-500/40 text-emerald-600 shrink-0" aria-hidden="true" />
              )}
              <span>
                Destacados:{" "}
                <strong
                  className={
                    featuredCount < 3
                      ? "text-amber-900 font-bold"
                      : "text-foreground font-semibold"
                  }
                >
                  {featuredCount}
                </strong>{" "}
                / 10
                {featuredCount < 3 && (
                  <span className="ml-1 text-[11px] font-semibold text-amber-800">
                    (Mín. 3)
                  </span>
                )}
              </span>
            </div>
          )}

          {typeof totalCount === "number" && (
            <div
              data-testid="product-counter"
              className="flex items-center gap-1.5 text-xs text-admin-text-sub"
            >
              <Package className="size-3.5" />
              <span>
                {isFiltered ? (
                  <>
                    <strong className="text-admin-text-main">{filteredCount}</strong> de {totalCount}{" "}
                    repuestos
                  </>
                ) : (
                  <>
                    <strong className="text-admin-text-main">{totalCount}</strong>{" "}
                    {totalCount === 1 ? "repuesto" : "repuestos"}
                  </>
                )}
              </span>
            </div>
          )}

          <Button
            type="button"
            onClick={onNewProduct}
            data-testid="new-product-btn"
            className="h-10 gap-2 font-semibold shadow-xs cursor-pointer bg-admin-btn-primary hover:bg-admin-btn-primary-hover text-white transition-colors"
          >
            <Plus className="size-4" />
            <span>Nuevo Producto</span>
          </Button>
        </div>
      </div>

      {/* Fila Inferior: Filtros de Selección (Dropdowns) */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-admin-border/60">
        <div className="flex items-center gap-1 text-xs font-medium text-admin-text-sub mr-1">
          <Filter className="size-3.5 text-industrial" />
          <span>Filtros:</span>
        </div>

        {/* Dropdown de Categorías */}
        <div className="min-w-[150px] flex-1 sm:flex-initial">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            data-testid="filter-category-select"
            aria-label="Filtrar por categoría"
            className="h-9 w-full rounded-md border border-admin-border bg-white px-2.5 py-1 text-xs text-admin-text-main shadow-xs transition-colors focus:border-industrial focus:outline-none focus:ring-1 focus:ring-industrial cursor-pointer"
          >
            <option value="">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown de Marcas */}
        <div className="min-w-[140px] flex-1 sm:flex-initial">
          <select
            value={selectedBrand}
            onChange={(e) => onBrandChange?.(e.target.value)}
            data-testid="filter-brand-select"
            aria-label="Filtrar por marca"
            className="h-9 w-full rounded-md border border-admin-border bg-white px-2.5 py-1 text-xs text-admin-text-main shadow-xs transition-colors focus:border-industrial focus:outline-none focus:ring-1 focus:ring-industrial cursor-pointer"
          >
            <option value="">Todas las Marcas</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown de Estado (Visibilidad) */}
        <div className="min-w-[130px] flex-1 sm:flex-initial">
          <select
            value={selectedStatus}
            onChange={(e) =>
              onStatusChange?.(e.target.value as "all" | "visible" | "hidden")
            }
            data-testid="filter-status-select"
            aria-label="Filtrar por estado de visibilidad"
            className="h-9 w-full rounded-md border border-admin-border bg-white px-2.5 py-1 text-xs text-admin-text-main shadow-xs transition-colors focus:border-industrial focus:outline-none focus:ring-1 focus:ring-industrial cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="visible">Solo Visibles</option>
            <option value="hidden">Solo Ocultos</option>
          </select>
        </div>

        {/* Botón Reset de Todos los Filtros */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            data-testid="reset-filters-btn"
            className="h-9 gap-1.5 px-2.5 text-xs text-admin-text-sub hover:text-admin-text-main hover:bg-slate-100 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Limpiar filtros</span>
          </Button>
        )}
      </div>
    </div>
  );
}
