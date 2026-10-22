/**
 * Modal de Confirmación Destructiva con Validación Tipada.
 * (Spec 010, RF-09, Caso Límite 4, TASK-20)
 *
 * Características Técnicas:
 * - Diálogo modal bloqueante con prevención de cierre accidental durante el borrado.
 * - Validación tipada estricta: el botón de confirmación inicia deshabilitado y solo se
 *   activa si el texto ingresado coincide exactamente con "ELIMINAR" (case-sensitive + .trim()).
 * - Intercepción del evento onSubmit: cancela cualquier intento de confirmación vía tecla Enter
 *   si el input no cumple con la palabra exacta "ELIMINAR".
 * - Atributos de inmunidad contra gestores de contraseñas y teclados predictivos:
 *   `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="characters"`, `spellCheck="false"`.
 * - Botón de confirmación formalizado con el token destructivo `--admin-btn-danger: #dc2626`.
 */

import { useState, useEffect, type FormEvent } from "react";
import { AlertTriangle, Trash2, Loader2, ShieldAlert } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
  onSuccess?: (() => void) | undefined;
  onConfirm?: ((product: AdminProduct) => Promise<void> | void) | undefined;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  product,
  onSuccess,
  onConfirm,
}: DeleteConfirmModalProps) {
  const { deleteProduct } = useAdmin();
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reiniciar estado cada vez que se abre el modal
  useEffect(() => {
    if (open) {
      setConfirmationText("");
      setError(null);
      setIsDeleting(false);
    }
  }, [open, product]);

  if (!product) {
    return null;
  }

  // Validación estrictamente case-sensitive con .trim() (RF-09, TASK-20)
  const isConfirmed = confirmationText.trim() === "ELIMINAR";

  const executeDelete = async () => {
    if (!isConfirmed || isDeleting) return;

    setError(null);
    setIsDeleting(true);

    try {
      if (onConfirm) {
        await onConfirm(product);
        onOpenChange(false);
        onSuccess?.();
      } else {
        const res = await deleteProduct(product.id);
        if (res.success) {
          onOpenChange(false);
          onSuccess?.();
        } else {
          setError(res.reason || "No se pudo eliminar el repuesto.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error inesperado al eliminar el repuesto.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Intercepción estricta: bloquear propagación ante cualquier discrepancia
    e.preventDefault();

    if (!isConfirmed || isDeleting) {
      return;
    }

    await executeDelete();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Modal bloqueante: no permite cerrar mientras esté ejecutando el borrado
        if (!isDeleting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md bg-white border border-admin-border text-admin-text-main shadow-xl"
        data-testid="delete-confirm-modal"
        data-modal-test="product-delete-modal"
        aria-describedby="delete-confirm-description"
        onPointerDownOutside={(e) => {
          if (isDeleting) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isDeleting) {
            e.preventDefault();
          }
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="size-5" />
              </div>
              <DialogTitle
                className="text-lg font-bold font-display text-admin-text-main"
                data-testid="delete-confirm-modal-title"
              >
                ¿Eliminar repuesto permanentemente?
              </DialogTitle>
            </div>

            <DialogDescription
              id="delete-confirm-description"
              className="text-sm text-admin-text-sub pt-1 leading-relaxed"
            >
              Esta acción eliminará de forma irreversible el repuesto{" "}
              <strong className="text-admin-text-main font-semibold">&quot;{product.name}&quot;</strong>{" "}
              {product.oem ? `(OEM: ${product.oem})` : ""} del catálogo de Laboratorio Diésel.
            </DialogDescription>
          </DialogHeader>

          {/* Bloque de Confirmación Tipada */}
          <div className="my-4 rounded-lg border border-red-200 bg-red-50/70 p-3.5 space-y-2.5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="size-4 text-red-600 mt-0.5 shrink-0" />
              <label
                htmlFor="delete-confirm-input"
                className="text-xs font-medium text-red-900 leading-snug cursor-pointer"
              >
                Para confirmar la eliminación destructiva, escriba exactamente{" "}
                <span className="font-mono font-bold tracking-wider text-red-700 bg-red-100 px-1 py-0.5 rounded">
                  ELIMINAR
                </span>{" "}
                en el siguiente campo:
              </label>
            </div>

            <Input
              id="delete-confirm-input"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Escriba ELIMINAR para habilitar"
              disabled={isDeleting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck="false"
              data-testid="delete-confirm-input"
              className="h-10 border-red-300 bg-white font-mono text-sm tracking-wider uppercase text-admin-text-main placeholder:text-muted-foreground placeholder:normal-case focus-visible:ring-red-500 focus-visible:border-red-500"
            />
          </div>

          {error && (
            <div
              role="alert"
              data-testid="delete-confirm-error"
              className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive font-medium"
            >
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => onOpenChange(false)}
              data-testid="delete-confirm-cancel-btn"
              className="border-admin-border text-admin-text-main hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="destructive"
              disabled={!isConfirmed || isDeleting}
              data-testid="delete-confirm-submit-btn"
              className="gap-2 cursor-pointer bg-admin-btn-danger hover:bg-red-700 text-white font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteConfirmModal as ProductDeleteModal, type DeleteConfirmModalProps as ProductDeleteModalProps };
export default DeleteConfirmModal;
