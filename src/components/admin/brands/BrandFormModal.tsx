import { useState, useEffect, type FormEvent, type ChangeEvent, type FocusEvent } from "react";
import { Loader2, AlertCircle, BadgeCheck } from "lucide-react";
import type { AdminBrand } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import { brandFormSchema } from "@/lib/validations/admin-schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface BrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandToEdit?: AdminBrand | null;
  onSuccess?: () => void;
}

/**
 * Modal de Creación y Edición de Marcas.
 * (RF-12, CA-12.1, CA-12.2, D-12, CL-12)
 *
 * Características:
 * - Validación client-side con Zod en `onBlur` y `onSubmit` (mínimo 2 caracteres).
 * - Control de duplicados case-insensitive con `trim()`.
 * - Manejo asíncrono seguro con bloque `finally` para restablecer `isSubmitting`.
 * - Soporte bimodal: Alta o Edición relacional por UUID.
 */
export function BrandFormModal({
  open,
  onOpenChange,
  brandToEdit,
  onSuccess,
}: BrandFormModalProps) {
  const { createBrand, updateBrand } = useAdmin();

  const isEditing = Boolean(brandToEdit);

  const [name, setName] = useState<string>("");
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sincronizar estado cuando se abre el modal o cambia brandToEdit
  useEffect(() => {
    if (open) {
      setName(brandToEdit ? brandToEdit.name : "");
      setFieldError(undefined);
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [open, brandToEdit]);

  const validateField = (value: string): boolean => {
    const result = brandFormSchema.safeParse({ name: value });
    if (!result.success) {
      const err = result.error.errors.find((e) => e.path.includes("name"));
      setFieldError(err?.message || "Nombre inválido");
      return false;
    }
    setFieldError(undefined);
    return true;
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    validateField(e.target.value);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (fieldError) {
      validateField(val);
    }
    if (formError) {
      setFormError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const isValid = validateField(name);
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && brandToEdit) {
        // Actualización relacional por UUID (CA-12.4, CL-09)
        const result = await updateBrand(brandToEdit.id, { name });
        if (result.success) {
          onOpenChange(false);
          onSuccess?.();
        } else {
          setFormError(result.reason || "Error al actualizar la marca");
        }
      } else {
        // Creación de nueva marca (CA-12.1, CA-12.2)
        const result = await createBrand({ name });
        if (result.success) {
          onOpenChange(false);
          onSuccess?.();
        } else {
          setFormError(result.reason || "Error al registrar la marca");
        }
      }
    } catch {
      setFormError("Ocurrió un error inesperado al guardar la marca");
    } finally {
      // Garantía estricta de restablecimiento de estado (CL-12)
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white border border-admin-border text-admin-text-main shadow-2xl sm:rounded-xl"
        data-testid="brand-form-modal"
        aria-describedby="brand-form-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 text-industrial mb-1">
            <BadgeCheck className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isEditing ? "Modificación de Fabricante" : "Alta de Fabricante"}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold font-display text-admin-text-main">
            {isEditing ? "Editar Marca" : "Nueva Marca"}
          </DialogTitle>
          <DialogDescription id="brand-form-description" className="text-sm text-admin-text-sub">
            {isEditing
              ? "Modifique el nombre de la marca. Los productos vinculados actualizarán su visualización relacional automáticamente."
              : "Ingrese el nombre del fabricante o marca para clasificar repuestos en el catálogo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
          {formError && (
            <div
              role="alert"
              aria-live="polite"
              data-testid="brand-form-alert-error"
              className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive"
            >
              <AlertCircle className="size-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="brand-name" className="text-sm font-semibold text-admin-text-main">
              Nombre de la Marca <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brand-name"
              name="name"
              type="text"
              placeholder="Ej. Bosch, Delphi, Denso..."
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              autoFocus
              className={`h-10 border-admin-border bg-white text-admin-text-main placeholder:text-slate-400 shadow-xs focus-visible:ring-2 focus-visible:ring-industrial/30 focus-visible:border-industrial transition-colors ${
                fieldError ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? "brand-name-error" : undefined}
              data-testid="brand-name-input"
            />
            {fieldError && (
              <p
                id="brand-name-error"
                role="alert"
                data-testid="brand-name-field-error"
                className="text-xs text-destructive font-medium"
              >
                {fieldError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-admin-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-testid="brand-form-cancel-btn"
              className="cursor-pointer border-admin-border bg-white text-admin-text-main hover:bg-slate-100 hover:text-admin-text-main font-medium shadow-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="industrial"
              disabled={isSubmitting}
              data-testid="brand-form-submit-btn"
              className="min-w-32 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                "Guardar Cambios"
              ) : (
                "Crear Marca"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
