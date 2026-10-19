import {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { Loader2, AlertCircle, FolderPlus, Info } from "lucide-react";
import type { AdminCategory } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import { categoryFormSchema } from "@/lib/validations/admin-schemas";
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

export interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: AdminCategory | null;
  onSuccess?: () => void;
}

/**
 * Modal de Creación y Edición de Categorías con Límite de 1 Nivel y Prevención de Ciclos.
 * (RF-10, CA-10.1 a CA-10.5, CL-04, CL-05, D-12, CL-12)
 *
 * Reglas de negocio:
 * 1. Límite de 1 nivel: el selector de padre únicamente lista categorías raíz (CA-10.3, CL-04).
 * 2. Prevención de ciclos e inversión jerárquica: Si la categoría que se edita posee
 *    subcategorías asociadas, el selector de padre se inhabilita por completo (CA-10.4, CL-05).
 * 3. Validación Zod con `categoryFormSchema` y unicidad case-insensitive con `trim()`.
 * 4. Submit blindado con bloque `finally` para garantizar `isSubmitting: false` (CL-12).
 */
export function CategoryFormModal({
  open,
  onOpenChange,
  categoryToEdit,
  onSuccess,
}: CategoryFormModalProps) {
  const {
    createCategory,
    updateCategory,
    getRootCategories,
    hasChildren,
  } = useAdmin();

  const isEditing = Boolean(categoryToEdit);

  // Si se está editando una categoría que ya posee hijas, se inhabilita el selector de padre (CL-05)
  const categoryHasChildren = Boolean(
    categoryToEdit && hasChildren(categoryToEdit.id)
  );

  // Selector solo lista categorías raíz excluyéndose a sí misma si se está editando (CA-10.3, CL-04)
  const availableParents = getRootCategories().filter(
    (root) => !categoryToEdit || root.id !== categoryToEdit.id
  );

  const [name, setName] = useState<string>("");
  const [parentId, setParentId] = useState<string>("");
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sincronizar estado cuando se abre el modal o cambia la categoría a editar
  useEffect(() => {
    if (open) {
      setName(categoryToEdit ? categoryToEdit.name : "");
      setParentId(categoryToEdit?.parentId ? categoryToEdit.parentId : "");
      setFieldError(undefined);
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [open, categoryToEdit]);

  const validateField = (value: string): boolean => {
    const parentIdVal = parentId.trim() ? parentId.trim() : null;
    const result = categoryFormSchema.safeParse({
      name: value,
      parentId: parentIdVal,
    });

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

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (fieldError) {
      validateField(val);
    }
    if (formError) {
      setFormError(null);
    }
  };

  const handleParentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setParentId(e.target.value);
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
      // Si la categoría tiene hijas vinculadas, forzar parentId a null (prevención CL-05)
      const finalParentId = categoryHasChildren
        ? null
        : parentId.trim()
          ? parentId.trim()
          : null;

      if (isEditing && categoryToEdit) {
        const result = updateCategory(categoryToEdit.id, {
          name,
          parentId: finalParentId,
        });

        if (result.success) {
          onOpenChange(false);
          onSuccess?.();
        } else {
          setFormError(result.reason || "Error al actualizar la categoría.");
        }
      } else {
        const result = createCategory({
          name,
          parentId: finalParentId,
        });

        if (result.success) {
          onOpenChange(false);
          onSuccess?.();
        } else {
          setFormError(result.reason || "Error al registrar la categoría.");
        }
      }
    } catch {
      setFormError("Ocurrió un error inesperado al guardar la categoría.");
    } finally {
      // Garantía obligatoria de restablecimiento (CL-12)
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="category-form-modal"
        aria-describedby="category-form-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <FolderPlus className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isEditing ? "Modificación de Taxonomía" : "Alta de Categoría"}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold font-display">
            {isEditing ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription id="category-form-description">
            {isEditing
              ? "Modifique los datos de la categoría. La jerarquía admite como máximo 1 nivel sin ciclos."
              : "Defina una categoría principal (raíz) o asigne una categoría padre para crear una subcategoría."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
          {formError && (
            <div
              role="alert"
              aria-live="polite"
              data-testid="category-form-alert-error"
              className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive"
            >
              <AlertCircle className="size-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Nombre de la Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre de la Categoría</Label>
            <Input
              id="category-name"
              name="name"
              type="text"
              placeholder="Ej. Inyección Common Rail, Bombas..."
              value={name}
              onChange={handleNameChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              autoFocus
              className={
                fieldError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              aria-invalid={Boolean(fieldError)}
              aria-describedby={
                fieldError ? "category-name-error" : undefined
              }
              data-testid="category-name-input"
            />
            {fieldError && (
              <p
                id="category-name-error"
                role="alert"
                data-testid="category-name-field-error"
                className="text-xs text-destructive font-medium"
              >
                {fieldError}
              </p>
            )}
          </div>

          {/* Selector de Categoría Padre (1 Nivel y Prevención de Ciclos) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category-parent">Categoría Padre</Label>
              {categoryHasChildren && (
                <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                  <Info className="size-3" />
                  Selector bloqueado
                </span>
              )}
            </div>

            <select
              id="category-parent"
              name="parentId"
              value={parentId}
              onChange={handleParentChange}
              disabled={isSubmitting || categoryHasChildren}
              data-testid="category-parent-select"
              aria-describedby={
                categoryHasChildren ? "category-parent-disabled-hint" : undefined
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            >
              <option value="">
                Ninguna (Categoría Principal / Nivel Raíz)
              </option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>

            {categoryHasChildren ? (
              <p
                id="category-parent-disabled-hint"
                data-testid="category-parent-disabled-hint"
                className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border"
              >
                Esta categoría posee subcategorías vinculadas y no puede
                transformarse en subcategoría hija (regla CL-05).
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Seleccione una categoría raíz para crear una subcategoría de 1 nivel
                (CA-10.3).
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-testid="category-form-cancel-btn"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="industrial"
              disabled={isSubmitting}
              data-testid="category-form-submit-btn"
              className="min-w-28"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                "Guardar Cambios"
              ) : (
                "Crear Categoría"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
