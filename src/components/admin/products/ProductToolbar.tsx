import { Search, Plus, X, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProductToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewProduct?: (() => void) | undefined;
  totalCount?: number | undefined;
  filteredCount?: number | undefined;
  className?: string | undefined;
}

/**
 * Barra de herramientas del catálogo de repuestos en el panel administrativo.
 * (RF-06, CA-06.4, CL-11)
 *
 * Características:
 * - Búsqueda en tiempo real con sanitización literal (sin excepciones RegExp ante [, *, \).
 * - Botón para limpiar búsqueda rápida.
 * - Conteo reactivo de repuestos totales / filtrados.
 * - Botón de acción principal para crear nuevo repuesto.
 */
export function ProductToolbar({
  searchQuery,
  onSearchChange,
  onNewProduct,
  totalCount,
  filteredCount,
  className,
}: ProductToolbarProps) {
  const isFiltered =
    typeof totalCount === "number" &&
    typeof filteredCount === "number" &&
    filteredCount !== totalCount;

  return (
    <div
      data-testid="product-toolbar"
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Buscador Literal Sanitizado */}
      <div className="relative flex-1 sm:max-w-md">
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

      {/* Contadores y Botón Nuevo Producto */}
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        {typeof totalCount === "number" && (
          <div
            data-testid="product-counter"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Package className="size-3.5" />
            <span>
              {isFiltered ? (
                <>
                  <strong className="text-foreground">{filteredCount}</strong> de{" "}
                  {totalCount} repuestos
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
          className="h-10 gap-2 font-medium shadow-sm cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Nuevo Producto</span>
        </Button>
      </div>
    </div>
  );
}
