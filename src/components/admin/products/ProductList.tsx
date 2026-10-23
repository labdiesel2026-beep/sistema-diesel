/**
 * Componente de Tabla / Lista de Repuestos del Panel de Administración (Light Mode).
 * (Spec 010, RF-09, Apéndice 10.2, Casos Límite 4, TASK-18, TASK-19)
 *
 * Características Técnicas:
 * - Operación estricta en Tema Claro (Light Mode) con tokens canónicos:
 *   - Fondo perimetral: `bg-admin-bg` (#f9fafb).
 *   - Superficies de datos y cabeceras: `bg-white` (100% opaco, #ffffff).
 *   - Tipografía principal: `text-admin-text-main` (#111827).
 *   - Tipografía secundaria y metadatos: `text-admin-text-sub` (#4b5563).
 *   - Delimitación y bordes: `border-admin-border` (#e5e7eb).
 * - Cabeceras de tabla fijas (sticky headers) ancladas permanentemente con fondo blanco 100% opaco
 *   y demarcación inferior estricta `box-shadow: 0 1px 0 rgba(0, 0, 0, 0.10)`.
 * - Tipografía monoespaciada de alto contraste para códigos OEM (`font-mono font-semibold text-admin-text-main`).
 * - Botones de acción primaria formalizados en Naranja Técnico (`#ea580c` con hover `#c2410c`).
 * - Manejo robusto de errores de servidor (HTTP 500) y estados vacíos preservando siempre las cabeceras fijas.
 */

import { useState } from "react";
import { Pencil, Trash2, Package, Loader2, AlertCircle } from "lucide-react";
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

/**
 * Normaliza y formatea el mensaje de error constitucional para el cuerpo de la tabla.
 * (Spec 010, Caso Límite 4, Principio 6: Errores Opacos)
 *
 * Transforma cualquier error 500 o referencia técnica en el formato canónico estricto:
 * "Error del servidor. Referencia: <uuid>"
 * Erradicando fugas de trazas técnicas, queries SQL o stack traces en el DOM.
 */
export function formatOpaqueServerError(error: unknown): string {
  if (!error) return "";

  if (typeof error === "string") {
    const trimmed = error.trim();
    if (trimmed.startsWith("Error del servidor. Referencia:")) {
      return trimmed;
    }
    if (trimmed.startsWith("Referencia:")) {
      return `Error del servidor. ${trimmed}`;
    }
    const uuidMatch = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) {
      return `Error del servidor. Referencia: ${uuidMatch[0]}`;
    }
  }

  if (typeof error === "object" && error !== null) {
    const anyErr = error as any;
    const ref = anyErr.data?.error || anyErr.data?.referenceId || anyErr.error || anyErr.referenceId;
    if (typeof ref === "string") {
      return formatOpaqueServerError(ref);
    }
    if (typeof anyErr.message === "string") {
      return formatOpaqueServerError(anyErr.message);
    }
  }

  const safeUuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : "e0000000-0000-4000-8000-000000000000";

  return `Error del servidor. Referencia: ${safeUuid}`;
}

export interface ProductListProps {
  products?: AdminProduct[] | undefined;
  searchQuery?: string | undefined;
  onlyFeatured?: boolean | undefined;
  selectedCategory?: string | undefined;
  selectedBrand?: string | undefined;
  selectedStatus?: "all" | "visible" | "hidden" | undefined;
  selectedFeatured?: "all" | "featured" | "standard" | undefined;
  onEdit?: ((product: AdminProduct) => void) | undefined;
  onDelete?: ((product: AdminProduct) => void) | undefined;
  onToggleVisibility?: ((product: AdminProduct) => void) | undefined;
  onToggleFeatured?: ((product: AdminProduct) => Promise<void> | void) | undefined;
  error?: string | null | undefined;
  isLoading?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  onNewProduct?: (() => void) | undefined;
}

export function ProductList({
  products: propProducts,
  searchQuery = "",
  onlyFeatured = false,
  selectedCategory = "",
  selectedBrand = "",
  selectedStatus = "all",
  selectedFeatured = "all",
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
  error: propError,
  isLoading: propLoading,
  onRetry,
  onNewProduct,
}: ProductListProps) {
  const {
    products: contextProducts,
    getBrandById,
    toggleVisibility,
    toggleFeaturedProduct,
    error: contextError,
    isLoading: contextLoading,
  } = useAdmin();

  const [loadingFeaturedId, setLoadingFeaturedId] = useState<string | null>(null);

  // Estados efectivos: admiten inyección por props o consumo desde el contexto de administración
  const baseProducts = propProducts ?? contextProducts;
  const rawError = propError !== undefined ? propError : contextError;
  const effectiveError = rawError ? formatOpaqueServerError(rawError) : null;
  const effectiveLoading = propLoading !== undefined ? propLoading : contextLoading;

  // Filtrado con búsqueda literal insensible a mayúsculas y filtros multifaceta (RF-04, CA-04.3, CL-11)
  const cleanQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = baseProducts.filter((product) => {
    // 1. Filtro Destacados
    if (onlyFeatured || selectedFeatured === "featured") {
      if (!product.isFeatured) return false;
    } else if (selectedFeatured === "standard") {
      if (product.isFeatured) return false;
    }

    // 2. Filtro Estado de Visibilidad
    if (selectedStatus === "visible" && !product.visible) {
      return false;
    }
    if (selectedStatus === "hidden" && product.visible) {
      return false;
    }

    // 3. Filtro Marca
    if (selectedBrand && product.brandId !== selectedBrand) {
      return false;
    }

    // 4. Filtro Categoría
    if (
      selectedCategory &&
      (!product.categoryIds || !product.categoryIds.includes(selectedCategory))
    ) {
      return false;
    }

    // 5. Búsqueda de Texto
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
          // Toast manejado por el contexto
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

  return (
    <div
      data-testid="product-table-container"
      className="relative overflow-hidden rounded-xl border border-admin-border bg-admin-bg shadow-xs"
    >
      <div className="max-h-[calc(100vh-260px)] min-h-[300px] overflow-auto">
        <Table className="w-full border-collapse bg-white">
          {/* Cabecera Fija (Sticky Header) con fondo 100% opaco blanco y delimitación inferior */}
          <TableHeader className="sticky top-0 z-20 bg-white [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="sticky top-0 z-20 w-[80px] bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
                Foto
              </TableHead>
              <TableHead className="sticky top-0 z-20 min-w-[220px] bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
                Repuesto / OEM
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
                Marca
              </TableHead>
              <TableHead className="sticky top-0 z-20 min-w-[180px] bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
                Compatibilidad
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
                Precio
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-white px-4 py-3.5 text-center font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
                Destacado
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-white px-4 py-3.5 text-center font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
                Visibilidad
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="bg-white">
            {/* Caso 1: Manejo de Error de Servidor (Caso Límite 4, TASK-18, TASK-19) */}
            {effectiveError ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center bg-white">
                  <div
                    data-testid="product-table-error"
                    className="flex flex-col items-center justify-center gap-2 p-6 text-center"
                  >
                    <div className="flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <AlertCircle className="size-6" />
                    </div>
                    <p
                      className="font-semibold text-admin-text-main text-sm"
                      data-testid="server-error-message"
                    >
                      {effectiveError}
                    </p>
                    <p className="text-xs text-admin-text-sub max-w-md">
                      Ocurrió una falla de comunicación con la base de datos de repuestos.
                    </p>
                    {onRetry && (
                      <Button
                        type="button"
                        onClick={onRetry}
                        className="mt-2 h-9 px-4 text-xs font-semibold bg-admin-btn-primary hover:bg-admin-btn-primary-hover text-white transition-colors cursor-pointer shadow-xs"
                      >
                        Reintentar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : effectiveLoading && baseProducts.length === 0 ? (
              /* Caso 2: Carga Inicial */
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center bg-white">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="size-6 animate-spin text-admin-btn-primary" />
                    <span className="text-xs font-medium text-admin-text-sub">
                      Cargando inventario de repuestos...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              /* Caso 3: Sin Coincidencias o Inventario Vacío (Preservando cabecera fija) */
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center bg-white">
                  <div
                    data-testid="product-table-empty"
                    className="flex min-h-48 flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-admin-text-sub">
                      <Package className="size-6" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-admin-text-main">
                      {searchQuery ? "No se encontraron repuestos" : "No hay repuestos registrados"}
                    </h3>
                    <p className="mt-1 text-sm text-admin-text-sub max-w-md mx-auto">
                      {searchQuery
                        ? `No hay repuestos que coincidan con "${searchQuery}". Intente con otro código OEM o descripción.`
                        : "Comience agregando un nuevo repuesto al catálogo del laboratorio."}
                    </p>
                    {!searchQuery && onNewProduct && (
                      <Button
                        type="button"
                        onClick={onNewProduct}
                        className="mt-4 h-9 px-4 text-xs font-semibold bg-admin-btn-primary hover:bg-admin-btn-primary-hover text-white transition-colors cursor-pointer shadow-xs"
                      >
                        Nuevo Producto
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              /* Caso 4: Listado de Productos */
              filteredProducts.map((product) => {
                const brand = getBrandById(product.brandId);
                const brandName = brand?.name ?? "Sin marca";
                const isHidden = !product.visible;

                return (
                  <TableRow
                    key={product.id}
                    data-testid={`product-row-${product.id}`}
                    className={`border-b border-admin-border bg-white transition-colors hover:bg-slate-50/80 ${
                      isHidden ? "bg-slate-50/50 opacity-75" : ""
                    }`}
                  >
                    {/* Miniatura */}
                    <TableCell className="px-4 py-3">
                      <ProductThumbnail
                        src={product.imageUrl}
                        alt={product.name}
                        className="size-12 border border-admin-border rounded-md"
                      />
                    </TableCell>

                    {/* Nombre y Código OEM Monoespaciado de Alto Contraste */}
                    <TableCell className="px-4 py-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold text-admin-text-main text-sm"
                            data-testid={`product-name-${product.id}`}
                          >
                            {product.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-mono border border-admin-border bg-slate-100 text-admin-text-sub"
                          >
                            {product.condition}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center rounded border border-admin-border bg-slate-100/90 px-2 py-0.5 font-mono text-xs font-semibold tracking-tight text-admin-text-main shadow-2xs"
                            data-testid={`product-oem-${product.id}`}
                          >
                            OEM: {product.oem}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Marca */}
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="font-medium border-admin-border text-admin-text-main bg-white"
                        data-testid={`product-brand-${product.id}`}
                      >
                        {brandName}
                      </Badge>
                    </TableCell>

                    {/* Compatibilidad Vehicular */}
                    <TableCell className="px-4 py-3 text-xs text-admin-text-sub">
                      <span className="line-clamp-2">
                        {product.vehicleCompatibility || "Universal / Multimarca"}
                      </span>
                    </TableCell>

                    {/* Precio Formateado */}
                    <TableCell className="px-4 py-3">
                      <span
                        className={`text-sm font-semibold ${
                          product.showPrice && product.price !== null
                            ? "text-admin-text-main"
                            : "text-admin-text-sub italic"
                        }`}
                        data-testid={`product-price-${product.id}`}
                      >
                        {formatProductPrice(product)}
                      </span>
                    </TableCell>

                    {/* Destacado */}
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
                                className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-full"
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
                                ? "bg-amber-500/15 text-amber-800 border-amber-500/30"
                                : "bg-slate-100 text-admin-text-sub border-admin-border"
                            }`}
                            data-testid={`product-featured-badge-${product.id}`}
                          >
                            {product.isFeatured ? "Destacado" : "Normal"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    {/* Visibilidad */}
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
                                ? "bg-emerald-600/15 text-emerald-800 border-emerald-600/20"
                                : "bg-slate-100 text-admin-text-sub border-admin-border"
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
                          className="size-8 p-0 text-admin-text-sub hover:text-admin-text-main hover:bg-slate-100 cursor-pointer"
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
                          className="size-8 p-0 text-admin-text-sub hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          data-testid={`product-delete-btn-${product.id}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export { ProductList as ProductTable, type ProductListProps as ProductTableProps };
export default ProductList;
