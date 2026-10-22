import { BadgeCheck, Pencil, Trash2, Package } from "lucide-react";
import type { AdminBrand } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface BrandListProps {
  onEdit?: (brand: AdminBrand) => void;
  onDelete?: (brand: AdminBrand) => void;
}

/**
 * Tabla de listado de marcas con conteo relacional en tiempo real de repuestos vinculados.
 * (RF-12, CA-12.1, CL-09)
 */
export function BrandList({ onEdit, onDelete }: BrandListProps) {
  const { brands, getBrandProductCount } = useAdmin();

  if (brands.length === 0) {
    return (
      <div
        data-testid="brand-list-empty"
        className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <BadgeCheck className="size-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
          No hay marcas registradas
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Comience agregando una nueva marca de fabricante al catálogo.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="brand-list-container"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[45%] px-6 py-4 font-semibold text-foreground">
              Marca / Fabricante
            </TableHead>
            <TableHead className="px-6 py-4 font-semibold text-foreground">
              Repuestos Vinculados
            </TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold text-foreground">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => {
            const productCount = getBrandProductCount(brand.id);

            return (
              <TableRow
                key={brand.id}
                data-testid={`brand-row-${brand.id}`}
                className="border-border transition-colors hover:bg-muted/30"
              >
                {/* Nombre de la marca e ID UUID */}
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-industrial/10 text-industrial">
                      <BadgeCheck className="size-4" />
                    </div>
                    <div>
                      <span
                        className="font-semibold text-foreground"
                        data-testid={`brand-name-${brand.id}`}
                      >
                        {brand.name}
                      </span>
                      <span className="block text-[11px] font-mono text-muted-foreground">
                        {brand.id}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Conteo de productos vinculados */}
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={productCount > 0 ? "secondary" : "outline"}
                      className="gap-1.5 font-medium"
                      data-testid={`brand-count-${brand.id}`}
                    >
                      <Package className="size-3 text-muted-foreground" />
                      <span>
                        {productCount} {productCount === 1 ? "repuesto" : "repuestos"}
                      </span>
                    </Badge>
                  </div>
                </TableCell>

                {/* Botones de acción */}
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(brand)}
                      aria-label={`Editar marca ${brand.name}`}
                      title={`Editar ${brand.name}`}
                      className="size-8 p-0 text-muted-foreground hover:text-foreground"
                      data-testid={`brand-edit-btn-${brand.id}`}
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(brand)}
                      aria-label={`Eliminar marca ${brand.name}`}
                      title={`Eliminar ${brand.name}`}
                      className="size-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      data-testid={`brand-delete-btn-${brand.id}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
