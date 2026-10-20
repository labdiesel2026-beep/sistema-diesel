/**
 * Filtros Facetados del Catálogo con Árbol Jerárquico de Categorías y Marcas.
 * (Spec 003, RF-04, Bloque 5 - Tarea T-14)
 *
 * Características:
 * - Árbol jerárquico de categorías (raíz y subcategorías hijas con indentación visual).
 * - Selector de marcas con conteo dinámico de productos disponibles.
 * - Conteo dinámico de productos por categoría y subcategoría.
 * - Drawer deslizable para dispositivos móviles (Sheet) y panel lateral para escritorio.
 * - Botón de limpieza de filtros activos.
 */

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { expandCategoryIds } from "@/lib/catalog-filter";
import type { CatalogBrand, CatalogCategory, CatalogProduct } from "@/types/catalog";

export interface CatalogFiltersProps {
  brands: CatalogBrand[];
  categories: CatalogCategory[];
  selectedBrandIds: string[];
  selectedCategoryIds: string[];
  onBrandToggle: (brandId: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onResetFilters: () => void;
  products?: CatalogProduct[];
  className?: string;
}

export function CatalogFilters({
  brands,
  categories,
  selectedBrandIds,
  selectedCategoryIds,
  onBrandToggle,
  onCategoryToggle,
  onResetFilters,
  products = [],
  className = "",
}: CatalogFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cantidad total de filtros activos
  const activeFiltersCount = selectedBrandIds.length + selectedCategoryIds.length;

  // Cálculo de conteos dinámicos por marca
  const brandCounts = new Map<string, number>();
  for (const b of brands) {
    brandCounts.set(b.id, 0);
  }
  for (const p of products) {
    const cur = brandCounts.get(p.brandId) ?? 0;
    brandCounts.set(p.brandId, cur + 1);
  }

  // Recolectar todas las categorías (raíces e hijas anidadas)
  const allCategoriesMap = new Map<string, { id: string; name: string; parentId: string | null }>();
  for (const cat of categories) {
    allCategoriesMap.set(cat.id, { id: cat.id, name: cat.name, parentId: cat.parentId });
    if (cat.children && Array.isArray(cat.children)) {
      for (const ch of cat.children) {
        if (!allCategoriesMap.has(ch.id)) {
          allCategoriesMap.set(ch.id, { id: ch.id, name: ch.name, parentId: cat.id });
        }
      }
    }
  }

  // Cálculo de conteos dinámicos por categoría (expandiendo hijas para padres)
  const categoryCounts = new Map<string, number>();
  for (const [catId] of allCategoriesMap) {
    const expanded = expandCategoryIds([catId], categories);
    expanded.add(catId);
    let count = 0;
    for (const p of products) {
      if (p.categoryIds && p.categoryIds.some((id) => expanded.has(id))) {
        count++;
      }
    }
    categoryCounts.set(catId, count);
  }

  // Estructuración del árbol de categorías
  // Raíces: aquellas con parentId === null o no referenciadas como hijas
  const rootCategories = categories.filter((c) => !c.parentId);

  // Mapeo de hijas por parentId
  const childrenByParent = new Map<string, CatalogCategory[]>();
  for (const cat of categories) {
    if (cat.parentId) {
      const list = childrenByParent.get(cat.parentId) || [];
      list.push(cat);
      childrenByParent.set(cat.parentId, list);
    }
  }

  // Componente interno reutilizable con las secciones de filtros
  const FilterContent = ({ prefix = "desk" }: { prefix?: string }) => (
    <div className="space-y-6" data-testid="catalog-filter-content">
      {/* Sección Categorías */}
      <div className="border-b border-border pb-5">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Categorías
        </h3>
        <div className="space-y-1.5" role="group" aria-label="Filtro por Categorías">
          {rootCategories.map((root) => {
            const rootCount = categoryCounts.get(root.id) ?? 0;
            const isRootChecked = selectedCategoryIds.includes(root.id);
            const children =
              childrenByParent.get(root.id) ||
              (root.children?.map((ch) => ({
                id: ch.id,
                name: ch.name,
                parentId: root.id,
              })) as CatalogCategory[]) ||
              [];

            return (
              <div
                key={root.id}
                className="space-y-1"
                data-testid={`category-tree-root-${root.id}`}
              >
                {/* Categoría Padre */}
                <div className="flex items-center justify-between py-1 text-sm">
                  <label className="flex cursor-pointer items-center gap-2.5 font-medium text-foreground select-none hover:text-primary transition-colors">
                    <Checkbox
                      id={`${prefix}-cat-${root.id}`}
                      checked={isRootChecked}
                      onCheckedChange={() => onCategoryToggle(root.id)}
                      data-testid={`checkbox-cat-${root.id}`}
                    />
                    <span>{root.name}</span>
                  </label>
                  <span
                    className="font-mono text-xs text-muted-foreground"
                    data-testid={`count-cat-${root.id}`}
                  >
                    ({rootCount})
                  </span>
                </div>

                {/* Subcategorías Hijas Indentadas */}
                {children.length > 0 && (
                  <div
                    className="ml-3.5 space-y-1 border-l-2 border-border/60 pl-3.5 py-0.5"
                    data-testid={`category-children-${root.id}`}
                  >
                    {children.map((child) => {
                      const childCount = categoryCounts.get(child.id) ?? 0;
                      const isChildChecked = selectedCategoryIds.includes(child.id);

                      return (
                        <div
                          key={child.id}
                          className="flex items-center justify-between py-0.5 text-xs"
                          data-testid={`category-child-${child.id}`}
                        >
                          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground select-none transition-colors">
                            <Checkbox
                              id={`${prefix}-cat-${child.id}`}
                              checked={isChildChecked}
                              onCheckedChange={() => onCategoryToggle(child.id)}
                              className="size-3.5"
                              data-testid={`checkbox-cat-${child.id}`}
                            />
                            <span>{child.name}</span>
                          </label>
                          <span
                            className="font-mono text-[11px] text-muted-foreground"
                            data-testid={`count-cat-${child.id}`}
                          >
                            ({childCount})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección Marcas */}
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Marcas
        </h3>
        <div className="space-y-1.5" role="group" aria-label="Filtro por Marcas">
          {brands.map((brand) => {
            const count = brandCounts.get(brand.id) ?? 0;
            const isChecked = selectedBrandIds.includes(brand.id);

            return (
              <div
                key={brand.id}
                className="flex items-center justify-between py-1 text-sm"
                data-testid={`brand-item-${brand.id}`}
              >
                <label className="flex cursor-pointer items-center gap-2.5 text-foreground select-none hover:text-primary transition-colors">
                  <Checkbox
                    id={`${prefix}-brand-${brand.id}`}
                    checked={isChecked}
                    onCheckedChange={() => onBrandToggle(brand.id)}
                    data-testid={`checkbox-brand-${brand.id}`}
                  />
                  <span>{brand.name}</span>
                </label>
                <span
                  className="font-mono text-xs text-muted-foreground"
                  data-testid={`count-brand-${brand.id}`}
                >
                  ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón y Drawer Deslizable para Mobile (lg:hidden) */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-full justify-between rounded-xl border-border bg-card px-4 font-medium text-foreground shadow-xs"
              aria-label="Abrir filtros de productos"
              data-testid="open-mobile-filters-button"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                    {activeFiltersCount}
                  </span>
                )}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[350px]">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="flex items-center justify-between font-display text-lg">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="size-5 text-primary" /> Filtros
                </span>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onResetFilters();
                      setMobileOpen(false);
                    }}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    data-testid="reset-filters-mobile-button"
                  >
                    <RotateCcw className="size-3.5" />
                    Limpiar
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <FilterContent prefix="mob" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Panel Lateral de Filtros para Pantallas Grandes (hidden lg:block) */}
      <aside
        className={`hidden lg:block rounded-xl border border-border bg-card p-5 shadow-xs ${className}`}
        aria-label="Filtros del catálogo"
        data-testid="catalog-filters-desktop"
      >
        <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>Filtros</span>
          </h2>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 gap-1.5 px-2 text-xs font-semibold text-muted-foreground hover:text-primary"
              data-testid="reset-filters-desktop-button"
            >
              <RotateCcw className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>

        <FilterContent prefix="desk" />
      </aside>
    </>
  );
}

export default CatalogFilters;
