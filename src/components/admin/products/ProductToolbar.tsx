import { useState } from "react";
import { Search, Plus, X, Package, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProductToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewProduct?: (() => void) | undefined;
  totalCount?: number | undefined;
  filteredCount?: number | undefined;
  featuredCount?: number | undefined;
  showOnlyFeatured?: boolean | undefined;
  onToggleOnlyFeatured?: ((value: boolean) => void) | undefined;
  className?: string | undefined;
}

/**
 * Barra de herramientas del catálogo de repuestos en el panel administrativo.
 * (RF-04, CA-04.2, CA-04.3, RF-06, CA-06.4, CL-11)
 *
 * Características:
 * - Búsqueda en tiempo real con sanitización literal (sin excepciones RegExp ante [, *, \).
 * - Botón para limpiar búsqueda rápida.
 * - Conteo reactivo de repuestos totales / filtrados.
 * - Badge con indicador en tiempo real "Destacados: X / 10".
 * - Botón/Filtro rápido "Solo Destacados" combinable con lógica AND.
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
  className,
}: ProductToolbarProps) {
  const [internalOnlyFeatured, setInternalOnlyFeatured] = useState(false);
  const isOnlyFeatured =
    onToggleOnlyFeatured !== undefined ? showOnlyFeatured : internalOnlyFeatured;

  const handleToggleFeatured = () => {
    if (onToggleOnlyFeatured) {
      onToggleOnlyFeatured(!showOnlyFeatured);
    } else {
      setInternalOnlyFeatured((prev) => !prev);
    }
  };

  const isFiltered =
    typeof totalCount === "number" &&
    typeof filteredCount === "number" &&
    filteredCount !== totalCount;

  return (
    <div
      data-testid="product-toolbar"
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      {/* Buscador Literal Sanitizado y Filtro Rápido */}
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
            className="h-10 pl-9 pr-9 text-sm"
            aria-label="Buscar repuestos"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            "h-10 gap-1.5 px-3 text-xs font-medium cursor-pointer transition-colors",
            isOnlyFeatured
              ? "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
              : "text-muted-foreground hover:text-foreground border-border hover:border-amber-500/50",
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
        {/* Badge "Destacados: X / 10" (RF-04, CA-04.2) */}
        {typeof featuredCount === "number" && (
          <div
            data-testid="featured-counter-badge"
            className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
          >
            <Star className="size-3.5 fill-amber-500/40 text-amber-500" />
            <span>
              Destacados: <strong className="text-foreground">{featuredCount}</strong> / 10
            </span>
          </div>
        )}

        {typeof totalCount === "number" && (
          <div
            data-testid="product-counter"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Package className="size-3.5" />
            <span>
              {isFiltered ? (
                <>
                  <strong className="text-foreground">{filteredCount}</strong> de {totalCount}{" "}
                  repuestos
                </>
              ) : (
                <>
                  <strong className="text-foreground">{totalCount}</strong>{" "}
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
  );
}
