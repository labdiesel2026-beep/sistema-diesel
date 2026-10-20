import { useState } from "react";
import { Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminProduct } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import { ApiError } from "@/lib/api";
import { ProductThumbnail } from "@/components/admin/products/ProductThumbnail";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ProductTableProps {
  products?: AdminProduct[] | undefined;
  searchQuery?: string | undefined;
  onlyFeatured?: boolean | undefined;
  onEdit?: ((product: AdminProduct) => void) | undefined;
  onDelete?: ((product: AdminProduct) => void) | undefined;
  onToggleVisibility?: ((product: AdminProduct) => void) | undefined;
  onToggleFeatured?: ((product: AdminProduct) => Promise<void> | void) | undefined;
}

/**
 * Grilla de administración de productos con resolución relacional de marcas por ID,
 * búsqueda sanitizada, conmutador de visibilidad y conmutador de destacados.
 * (RF-01, RF-03, RF-04, RF-05, RF-06, CA-01.1 a CA-01.4, CA-04.3, CA-06.1, CA-06.2, CA-06.4, CL-11)
 */
export function ProductTable({
  products: propProducts,
  searchQuery = "",
  onlyFeatured = false,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
}: ProductTableProps) {
  const {
    products: contextProducts,
    getBrandById,
    toggleVisibility,
    toggleFeaturedProduct,
  } = useAdmin();
  const [loadingFeaturedId, setLoadingFeaturedId] = useState<string | null>(null);

  // Permite operar con productos pasados por prop o directamente del Context
  const baseProducts = propProducts ?? contextProducts;

  // Filtrado con búsqueda literal insensible a mayúsculas y filtro solo destacados (RF-04, CA-04.3, CL-11)
  const cleanQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = baseProducts.filter((product) => {
    if (onlyFeatured && !product.isFeatured) {
      return false;
    }

    if (!cleanQuery) return true;

    const brand = getBrandById(product.brandId);
    const brandName = brand ? brand.name.toLowerCase() : "";
    return (
      (product.name || "").toLowerCase().includes(cleanQuery) ||
      (product.oem || "").toLowerCase().includes(cleanQuery) ||
      (product.description || "").toLowerCase().includes(cleanQuery) ||
      (product.vehicleCompatibility || "").toLowerCase().includes(cleanQuery) ||
      brandName.includes(cleanQuery)
    );
  });

  const handleToggle = async (product: AdminProduct) => {
    if (onToggleVisibility) {
      onToggleVisibility(product);
    } else {
      await toggleVisibility(product.id);
    }
  };

  const handleToggleFeatured = async (product: AdminProduct) => {
    if (!product.visible || loadingFeaturedId !== null) {
      return;
    }
    setLoadingFeaturedId(product.id);
    try {
      if (onToggleFeatured) {
        await onToggleFeatured(product);
      } else {
        const result = await toggleFeaturedProduct(product.id, !product.isFeatured);
        if (!result.success && result.reason) {
          // Si el contexto no disparó toast por algún mock personalizado
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        (err instanceof ApiError && err.status === 409
          ? "Límite alcanzado. Desmarca un producto primero"
          : err?.message) ||
        "Límite alcanzado. Desmarca un producto primero";
      toast.error(msg);
    } finally {
      setLoadingFeaturedId(null);
    }
  };

  const formatProductPrice = (product: AdminProduct): string => {
    if (!product.showPrice || product.price === null) {
      return "Consultar";
    }
    return `$${product.price.toLocaleString("es-AR")} ARS`;
  };

  if (filteredProducts.length === 0) {
    return (
      <div
        data-testid="product-table-empty"
        className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Package className="size-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
          {searchQuery ? "No se encontraron repuestos" : "No hay repuestos registrados"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchQuery
            ? `No hay repuestos que coincidan con "${searchQuery}". Intente con otro código OEM o descripción.`
            : "Comience agregando un nuevo repuesto al catálogo del laboratorio."}
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="product-table-container"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[80px] px-4 py-4 font-semibold text-foreground">
                Foto
              </TableHead>
              <TableHead className="min-w-[220px] px-4 py-4 font-semibold text-foreground">
                Repuesto / OEM
              </TableHead>
              <TableHead className="px-4 py-4 font-semibold text-foreground">Marca</TableHead>
              <TableHead className="min-w-[180px] px-4 py-4 font-semibold text-foreground">
                Compatibilidad
              </TableHead>
              <TableHead className="px-4 py-4 font-semibold text-foreground">Precio</TableHead>
              <TableHead className="px-4 py-4 text-center font-semibold text-foreground">
                Destacado
              </TableHead>
              <TableHead className="px-4 py-4 text-center font-semibold text-foreground">
                Visibilidad
              </TableHead>
              <TableHead className="px-4 py-4 text-right font-semibold text-foreground">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              // Resolución relacional de la marca por brandId (RF-12, CA-12.3)
              const brand = getBrandById(product.brandId);
              const brandName = brand?.name ?? "Sin marca";
              const isHidden = !product.visible;

              return (
                <TableRow
                  key={product.id}
                  data-testid={`product-row-${product.id}`}
                  className={`border-border transition-colors hover:bg-muted/30 ${
                    isHidden ? "bg-muted/15 opacity-80" : ""
                  }`}
                >
                  {/* Miniatura con fallback gráfico (RF-06, CA-06.3, CL-10) */}
                  <TableCell className="px-4 py-3">
                    <ProductThumbnail
                      src={product.imageUrl}
                      alt={product.name}
                      className="size-12"
                    />
                  </TableCell>

                  {/* Nombre y OEM */}
                  <TableCell className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-foreground"
                          data-testid={`product-name-${product.id}`}
                        >
                          {product.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {product.condition}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs font-medium text-primary"
                          data-testid={`product-oem-${product.id}`}
                        >
                          OEM: {product.oem}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Marca normalizada relacionalmente */}
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="font-medium"
                      data-testid={`product-brand-${product.id}`}
                    >
                      {brandName}
                    </Badge>
                  </TableCell>

                  {/* Vehículo compatible */}
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                    <span className="line-clamp-2">
                      {product.vehicleCompatibility || "Universal / Multimarca"}
                    </span>
                  </TableCell>

                  {/* Precio formateado */}
                  <TableCell className="px-4 py-3">
                    <span
                      className={`text-sm font-semibold ${
                        product.showPrice && product.price !== null
                          ? "text-foreground"
                          : "text-muted-foreground italic"
                      }`}
                      data-testid={`product-price-${product.id}`}
                    >
                      {formatProductPrice(product)}
                    </span>
                  </TableCell>

                  {/* Interruptor de Destacado y Badge de Cupo (RF-01, CA-01.1 a CA-01.4, RF-03) */}
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                          <Switch
                            checked={Boolean(product.isFeatured)}
                            onCheckedChange={() => handleToggleFeatured(product)}
                            disabled={!product.visible || loadingFeaturedId === product.id}
                            aria-label={`Alternar destacado de ${product.name}`}
                            data-testid={`product-featured-switch-${product.id}`}
                            title={
                              !product.visible
                                ? "No se puede destacar un producto con visibilidad oculta"
                                : product.isFeatured
                                  ? "Quitar de destacados del inicio"
                                  : "Destacar en carrusel de inicio"
                            }
                          />
                          {loadingFeaturedId === product.id && (
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px] rounded-full"
                              data-testid={`product-featured-spinner-${product.id}`}
                            >
                              <Loader2 className="size-3.5 animate-spin text-amber-500" />
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={product.isFeatured ? "default" : "secondary"}
                          className={`text-[11px] ${
                            product.isFeatured
                              ? "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                          data-testid={`product-featured-badge-${product.id}`}
                        >
                          {product.isFeatured ? "Destacado" : "Normal"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {/* Interruptor de Visibilidad y Badge de Estado (CA-06.1, CA-06.2) */}
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.visible}
                          onCheckedChange={() => handleToggle(product)}
                          aria-label={`Cambiar visibilidad de ${product.name}`}
                          data-testid={`product-visibility-switch-${product.id}`}
                        />
                        <Badge
                          variant={product.visible ? "default" : "secondary"}
                          className={`text-[11px] ${
                            product.visible
                              ? "bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/20 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-600/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                          data-testid={`product-status-badge-${product.id}`}
                        >
                          {product.visible ? "Visible" : "Oculto"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(product)}
                        aria-label={`Editar ${product.name}`}
                        title={`Editar ${product.name}`}
                        className="size-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        data-testid={`product-edit-btn-${product.id}`}
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(product)}
                        aria-label={`Eliminar ${product.name}`}
                        title={`Eliminar ${product.name}`}
                        className="size-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        data-testid={`product-delete-btn-${product.id}`}
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
    </div>
  );
}
