import {
  Folder,
  CornerDownRight,
  Pencil,
  Trash2,
  Package,
  Layers,
  Tags,
} from "lucide-react";
import type { AdminCategory } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CategoryListProps {
  onEdit?: (category: AdminCategory) => void;
  onDelete?: (category: AdminCategory) => void;
}

/**
 * Lista jerárquica de categorías y subcategorías (1 nivel de anidamiento)
 * con indentación visual y conteo relacional de productos.
 * (RF-10, CA-10.1, CA-10.2)
 */
export function CategoryList({ onEdit, onDelete }: CategoryListProps) {
  const {
    categories,
    getRootCategories,
    getChildCategories,
    getCategoryProductCount,
  } = useAdmin();

  const rootCategories = getRootCategories();

  if (categories.length === 0) {
    return (
      <div
        data-testid="category-list-empty"
        className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Tags className="size-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
          No hay categorías registradas
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Comience creando una categoría principal de nivel raíz.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="category-list-container"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border bg-muted/40 px-6 py-4">
        <div className="grid grid-cols-12 text-xs font-semibold text-foreground uppercase tracking-wider">
          <div className="col-span-12 sm:col-span-6">
            Jerarquía / Nombre de Categoría
          </div>
          <div className="hidden sm:block sm:col-span-3 text-center sm:text-left">
            Repuestos Asociados
          </div>
          <div className="hidden sm:block sm:col-span-3 text-right">
            Acciones
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {rootCategories.map((root) => {
          const children = getChildCategories(root.id);
          const rootProductCount = getCategoryProductCount(root.id);

          return (
            <div
              key={root.id}
              data-testid={`category-tree-root-${root.id}`}
              className="transition-colors"
            >
              {/* Fila Categoría Raíz */}
              <div
                data-testid={`category-row-${root.id}`}
                className="grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-muted/20"
              >
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Folder className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-semibold text-foreground text-sm"
                        data-testid={`category-name-${root.id}`}
                      >
                        {root.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold uppercase"
                      >
                        Raíz
                      </Badge>
                      {children.length > 0 && (
                        <span className="text-xs text-muted-foreground font-mono">
                          ({children.length}{" "}
                          {children.length === 1
                            ? "subcategoría"
                            : "subcategorías"}
                          )
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] font-mono text-muted-foreground">
                      {root.id}
                    </span>
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Badge
                    variant={rootProductCount > 0 ? "secondary" : "outline"}
                    className="gap-1.5 font-medium"
                    data-testid={`category-count-${root.id}`}
                  >
                    <Package className="size-3 text-muted-foreground" />
                    <span>
                      {rootProductCount}{" "}
                      {rootProductCount === 1 ? "repuesto" : "repuestos"}
                    </span>
                  </Badge>
                </div>

                <div className="col-span-6 sm:col-span-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(root)}
                      aria-label={`Editar categoría ${root.name}`}
                      title={`Editar ${root.name}`}
                      className="size-8 p-0 text-muted-foreground hover:text-foreground"
                      data-testid={`category-edit-btn-${root.id}`}
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(root)}
                      aria-label={`Eliminar categoría ${root.name}`}
                      title={`Eliminar ${root.name}`}
                      className="size-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      data-testid={`category-delete-btn-${root.id}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Subcategorías Hijas con Indentación Visual (CA-10.2) */}
              {children.length > 0 && (
                <div className="divide-y divide-border/50 bg-muted/10">
                  {children.map((child) => {
                    const childProductCount = getCategoryProductCount(child.id);

                    return (
                      <div
                        key={child.id}
                        data-testid={`category-row-${child.id}`}
                        className="grid grid-cols-12 items-center gap-4 py-3 pr-6 pl-12 hover:bg-muted/20"
                      >
                        <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                          <CornerDownRight className="size-4 text-muted-foreground shrink-0" />
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                            <Layers className="size-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="font-medium text-foreground text-sm"
                                data-testid={`category-name-${child.id}`}
                              >
                                {child.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] text-muted-foreground font-normal"
                              >
                                Subcategoría
                              </Badge>
                            </div>
                            <span className="block text-[11px] font-mono text-muted-foreground">
                              {child.id}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <Badge
                            variant={
                              childProductCount > 0 ? "secondary" : "outline"
                            }
                            className="gap-1.5 font-medium"
                            data-testid={`category-count-${child.id}`}
                          >
                            <Package className="size-3 text-muted-foreground" />
                            <span>
                              {childProductCount}{" "}
                              {childProductCount === 1
                                ? "repuesto"
                                : "repuestos"}
                            </span>
                          </Badge>
                        </div>

                        <div className="col-span-6 sm:col-span-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit?.(child)}
                              aria-label={`Editar subcategoría ${child.name}`}
                              title={`Editar ${child.name}`}
                              className="size-8 p-0 text-muted-foreground hover:text-foreground"
                              data-testid={`category-edit-btn-${child.id}`}
                            >
                              <Pencil className="size-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete?.(child)}
                              aria-label={`Eliminar subcategoría ${child.name}`}
                              title={`Eliminar ${child.name}`}
                              className="size-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              data-testid={`category-delete-btn-${child.id}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
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
  );
}
