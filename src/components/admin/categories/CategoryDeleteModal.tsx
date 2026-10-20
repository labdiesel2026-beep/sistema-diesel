import { useState } from "react";
import { AlertTriangle, Trash2, Loader2, Package, ShieldAlert } from "lucide-react";
import type { AdminCategory } from "@/types/admin";
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

export interface CategoryDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminCategory | null;
  onSuccess?: () => void;
}

/**
 * Modal de Eliminación de Categorías con Bloqueo Referencial Estricto.
 * (RF-11, CA-11.1, CA-11.2, CA-11.3, CL-06, CL-12)
 *
 * Comportamiento:
 * - Si la categoría posee repuestos vinculados o subcategorías hijas,
 *   bloquea de forma impeditiva el borrado listando los elementos afectados (CA-11.1, CA-11.2, CL-06).
 * - Si está libre de dependencias, presenta confirmación con botón rojo destructivo (CA-11.3).
 */
export function CategoryDeleteModal({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDeleteModalProps) {
  const { canDeleteCategory, deleteCategory } = useAdmin();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!category) {
    return null;
  }

  // Comprobar integridad referencial en tiempo real (productos y subcategorías)
  const integrity = canDeleteCategory(category.id);
  const isBlocked = !integrity.allowed;

  const handleConfirmDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const res = await deleteCategory(category.id);
      if (res.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(res.reason || "No se pudo eliminar la categoría.");
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
        data-testid="category-delete-modal"
        aria-describedby="category-delete-description"
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
              data-testid="category-delete-modal-title"
            >
              {isBlocked
                ? "No se puede eliminar la categoría"
                : "¿Eliminar categoría permanentemente?"}
            </DialogTitle>
          </div>

          <DialogDescription id="category-delete-description">
            {isBlocked
              ? "Para proteger la integridad del catálogo, se impide la eliminación de categorías con dependencias activas."
              : `Esta acción eliminará definitivamente la categoría "${category.name}". Los datos no podrán recuperarse.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            data-testid="category-delete-error"
            className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {error}
          </div>
        )}

        {/* Alerta de bloqueo impeditivo con listado de elementos afectados (CA-11.1, CA-11.2, CL-06) */}
        {isBlocked && (
          <div
            data-testid="category-deletion-blocked-alert"
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
                  data-testid="category-affected-products-list"
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
              data-testid="category-delete-close-btn"
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
                data-testid="category-delete-cancel-btn"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                data-testid="category-delete-confirm-btn"
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
                    <span>Eliminar Categoría</span>
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
