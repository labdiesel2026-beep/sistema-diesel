import { useState } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import type { AdminProduct } from "@/types/admin";
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

export interface ProductDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
  onSuccess?: (() => void) | undefined;
}

/**
 * Modal de Eliminación Definitiva de Producto.
 * (RF-07, CA-07.1, CA-07.2)
 *
 * Características:
 * - Despliega un diálogo de confirmación explícita con botón destructivo en tono rojo (CA-07.1).
 * - Remueve permanentemente el producto del estado global en memoria de React (CA-07.2).
 * - Manejo asíncrono seguro con bloque finally para restablecer el estado de carga.
 */
export function ProductDeleteModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductDeleteModalProps) {
  const { deleteProduct } = useAdmin();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) {
    return null;
  }

  const handleConfirmDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const res = await deleteProduct(product.id);
      if (res.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(res.reason || "No se pudo eliminar el repuesto.");
      }
    } catch {
      setError("Ocurrió un error inesperado al eliminar el repuesto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white border border-admin-border text-admin-text-main shadow-2xl sm:rounded-xl"
        data-testid="product-delete-modal"
        aria-describedby="product-delete-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex size-9 items-center justify-center rounded-full bg-red-50 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle
              className="text-lg font-bold font-display text-admin-text-main"
              data-testid="product-delete-modal-title"
            >
              ¿Eliminar repuesto permanentemente?
            </DialogTitle>
          </div>

          <DialogDescription id="product-delete-description" className="text-sm text-admin-text-sub">
            Esta acción eliminará de forma definitiva el repuesto{" "}
            <strong className="text-admin-text-main font-semibold">&quot;{product.name}&quot;</strong>{" "}
            {product.oem ? `(OEM: ${product.oem})` : ""} del catálogo general. Los datos no podrán
            recuperarse.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            data-testid="product-delete-error"
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-admin-border/60">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            data-testid="product-delete-cancel-btn"
            className="cursor-pointer border-admin-border bg-white text-admin-text-main hover:bg-slate-100 hover:text-admin-text-main font-medium shadow-xs"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            data-testid="product-delete-confirm-btn"
            className="gap-2 cursor-pointer shadow-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>Eliminar Repuesto</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
