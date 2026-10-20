import { useState } from "react";
import { AlertTriangle, Trash2, Loader2, Package, ShieldAlert } from "lucide-react";
import type { AdminBrand } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface BrandDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: AdminBrand | null;
  onSuccess?: () => void;
}

/**
 * Modal de Eliminación de Marcas con Bloqueo Referencial Estricto.
 * (RF-12, CA-12.3, CA-12.5, CL-06, CL-12)
 *
 * Comportamiento:
 * - Si la marca posee 1 o más repuestos vinculados (brandId), bloquea de manera
 *   impeditiva la eliminación, listando los productos afectados (CA-12.3, CL-06).
 * - Si la marca está libre de productos, presenta confirmación explícita con botón
 *   rojo destructivo (CA-12.5).
 */
export function BrandDeleteModal({ open, onOpenChange, brand, onSuccess }: BrandDeleteModalProps) {
  const { canDeleteBrand, deleteBrand } = useAdmin();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!brand) {
    return null;
  }

  // Comprobar integridad referencial en tiempo real
  const integrity = canDeleteBrand(brand.id);
  const isBlocked = !integrity.allowed;

  const handleConfirmDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const res = await deleteBrand(brand.id);
      if (res.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(res.reason || "No se pudo eliminar la marca.");
      }
    } catch {
      setError("Ocurrió un error inesperado al procesar la eliminación.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="brand-delete-modal"
        aria-describedby="brand-delete-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {isBlocked ? (
              <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="size-5" />
              </div>
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
            )}
            <DialogTitle
              className="text-lg font-bold font-display"
              data-testid="brand-delete-modal-title"
            >
              {isBlocked ? "No se puede eliminar la marca" : "¿Eliminar marca permanentemente?"}
            </DialogTitle>
          </div>

          <DialogDescription id="brand-delete-description">
            {isBlocked
              ? "Existen productos del catálogo asociados a este fabricante. Para proteger la integridad referencial, debe reasignar o eliminar los productos antes de poder borrar la marca."
              : `Esta acción eliminará definitivamente la marca "${brand.name}". Los datos no podrán recuperarse.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            data-testid="brand-delete-error"
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {error}
          </div>
        )}

        {/* Alerta de bloqueo impeditivo con listado de productos vinculados (CA-12.3, CL-06) */}
        {isBlocked && (
          <div
            data-testid="brand-deletion-blocked-alert"
            className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
          >
            <div className="flex items-start gap-2 text-destructive font-semibold text-xs uppercase tracking-wider">
              <ShieldAlert className="size-4 shrink-0 mt-0.5" />
              <span>Bloqueo Impeditivo de Integridad</span>
            </div>

            <p className="text-xs text-muted-foreground">{integrity.reason}</p>

            {integrity.affectedProducts && integrity.affectedProducts.length > 0 && (
              <div className="mt-2 space-y-1.5 border-t border-destructive/20 pt-2">
                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                  Productos afectados ({integrity.affectedProducts.length}):
                </span>
                <ul
                  data-testid="brand-affected-products-list"
                  className="max-h-32 overflow-y-auto space-y-1 text-xs text-muted-foreground pl-1"
                >
                  {integrity.affectedProducts.map((prodName) => (
                    <li key={prodName} className="flex items-center gap-2">
                      <Package className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{prodName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          {isBlocked ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="brand-delete-close-btn"
              className="w-full sm:w-auto"
            >
              Entendido
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => onOpenChange(false)}
                data-testid="brand-delete-cancel-btn"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                data-testid="brand-delete-confirm-btn"
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    <span>Eliminar Marca</span>
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
