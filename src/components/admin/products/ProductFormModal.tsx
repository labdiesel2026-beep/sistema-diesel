import {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { Loader2, AlertCircle, PackagePlus } from "lucide-react";
import type { AdminProduct, ProductCondition } from "@/types/admin";
import { useAdmin } from "@/context/admin-context";
import {
  productFormSchema,
  PRODUCT_CONDITIONS,
} from "@/lib/validations/admin-schemas";
import { ProductImageUpload } from "@/components/admin/products/ProductImageUpload";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export interface ProductFormErrors {
  name?: string | undefined;
  description?: string | undefined;
  imageUrl?: string | undefined;
  categoryIds?: string | undefined;
  brandId?: string | undefined;
  vehicleCompatibility?: string | undefined;
  condition?: string | undefined;
  price?: string | undefined;
  showPrice?: string | undefined;
  visible?: string | undefined;
  oem?: string | undefined;
}

export interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: AdminProduct | null | undefined;
  onSuccess?: (() => void) | undefined;
}

/**
 * Modal de Creación y Edición de Productos con Validación Zod Fail-Fast y Bloque Finally.
 * (RF-05, CA-05.1 a CA-05.4, CL-06, CL-07, CL-12)
 *
 * Características:
 * - Validación desacoplada con `productFormSchema` (.strict()).
 * - Carga y validación client-side de fotos integrada con `<ProductImageUpload>`.
 * - Selector múltiple de categorías almacenando array plano `categoryIds: string[]` (CA-05.3).
 * - Selector relacional de marcas por UUID (`brandId`).
 * - Soporte de precio `>= 0` (admitiendo $0 y null para "A cotizar") (CA-05.2).
 * - Toggles reactivos para visibilidad y visualización de precio.
 * - Mutación segura en bloque `try/finally` asegurando `isSubmitting: false` (CA-05.4, CL-12).
 */
export function ProductFormModal({
  open,
  onOpenChange,
  productToEdit,
  onSuccess,
}: ProductFormModalProps) {
  const { brands, categories, createProduct, updateProduct } = useAdmin();
  const isEditing = Boolean(productToEdit);

  // Estados del formulario
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [brandId, setBrandId] = useState<string>("");
  const [vehicleCompatibility, setVehicleCompatibility] = useState<string>("");
  const [condition, setCondition] = useState<ProductCondition>("Nuevo");
  const [priceInput, setPriceInput] = useState<string>("");
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(true);
  const [oem, setOem] = useState<string>("");

  // Estados de validación y red
  const [fieldErrors, setFieldErrors] = useState<ProductFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sincronizar estado cuando se abre el modal o cambia el producto a editar
  useEffect(() => {
    if (open) {
      if (productToEdit) {
        setName(productToEdit.name);
        setDescription(productToEdit.description);
        setImageUrl(productToEdit.imageUrl);
        setCategoryIds([...productToEdit.categoryIds]);
        setBrandId(productToEdit.brandId);
        setVehicleCompatibility(productToEdit.vehicleCompatibility || "");
        setCondition(productToEdit.condition);
        setPriceInput(
          productToEdit.price !== null && productToEdit.price !== undefined
            ? String(productToEdit.price)
            : ""
        );
        setShowPrice(productToEdit.showPrice);
        setVisible(productToEdit.visible);
        setOem(productToEdit.oem || "");
      } else {
        setName("");
        setDescription("");
        setImageUrl("");
        setCategoryIds([]);
        setBrandId("");
        setVehicleCompatibility("");
        setCondition("Nuevo");
        setPriceInput("");
        setShowPrice(true);
        setVisible(true);
        setOem("");
      }
      setFieldErrors({});
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [open, productToEdit]);

  const parsePrice = (val: string): number | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return isNaN(num) ? -1 : num;
  };

  const getPayload = () => ({
    name: name.trim(),
    description: description.trim(),
    imageUrl,
    categoryIds,
    brandId,
    vehicleCompatibility: vehicleCompatibility.trim(),
    condition,
    price: parsePrice(priceInput),
    showPrice,
    visible,
    oem: oem.trim(),
  });

  const validateField = (fieldName: keyof ProductFormErrors) => {
    const payload = getPayload();
    const result = productFormSchema.safeParse(payload);

    if (!result.success) {
      const match = result.error.errors.find((err) =>
        err.path.includes(fieldName)
      );
      if (match) {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: match.message }));
        return false;
      }
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    return true;
  };

  const handleBlur = (
    e: FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const fieldName = e.target.name as keyof ProductFormErrors;
    if (fieldName) {
      validateField(fieldName);
    }
  };

  const toggleCategory = (catId: string) => {
    setCategoryIds((prev) => {
      const next = prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId];

      if (fieldErrors.categoryIds) {
        if (next.length > 0) {
          setFieldErrors((errs) => {
            const copy = { ...errs };
            delete copy.categoryIds;
            return copy;
          });
        }
      }
      return next;
    });
  };

  const handleImageChange = (url: string) => {
    setImageUrl(url);
    if (fieldErrors.imageUrl && url) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = getPayload();
    const validationResult = productFormSchema.safeParse(payload);

    if (!validationResult.success) {
      const newErrors: ProductFormErrors = {};
      for (const err of validationResult.error.errors) {
        const field = err.path[0] as keyof ProductFormErrors;
        if (!newErrors[field]) {
          newErrors[field] = err.message;
        }
      }
      setFieldErrors(newErrors);
      setFormError("Por favor revise los campos con error antes de continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && productToEdit) {
        const result = updateProduct(productToEdit.id, payload);
        if (result.success) {
          onOpenChange(false);
          onSuccess?.();
        } else {
          setFormError(result.reason || "Error al actualizar el producto.");
        }
      } else {
        const result = createProduct(payload);
        if (result.success) {
          onOpenChange(false);
          onSuccess?.();
        } else {
          setFormError(result.reason || "Error al crear el producto.");
        }
      }
    } catch {
      setFormError("Ocurrió un error inesperado al procesar el producto.");
    } finally {
      // Garantía estricta de reinicio del estado isSubmitting (CL-12)
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"
        data-testid="product-form-modal"
        aria-describedby="product-form-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <PackagePlus className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isEditing ? "Modificación de Repuesto" : "Alta de Repuesto"}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold font-display">
            {isEditing ? "Editar Repuesto" : "Nuevo Repuesto"}
          </DialogTitle>
          <DialogDescription id="product-form-description">
            {isEditing
              ? "Modifique los detalles técnicos, precio, taxonomías y visibilidad del repuesto."
              : "Complete la ficha técnica del repuesto. Los campos con asterisco (*) son obligatorios."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 pt-2">
          {formError && (
            <div
              role="alert"
              aria-live="polite"
              data-testid="product-form-alert-error"
              className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive"
            >
              <AlertCircle className="size-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Subida y Previsualización de Foto (RF-08, CA-08.1 a CA-08.4, CL-01, CL-02, CL-03) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Foto del Repuesto <span className="text-destructive">*</span>
            </Label>
            <ProductImageUpload
              value={imageUrl}
              onChange={handleImageChange}
              disabled={isSubmitting}
              error={fieldErrors.imageUrl}
            />
            {fieldErrors.imageUrl && (
              <p
                role="alert"
                data-testid="product-image-field-error"
                className="text-xs text-destructive font-medium"
              >
                {fieldErrors.imageUrl}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nombre del Producto */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="product-name">
                Nombre del Repuesto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                name="name"
                type="text"
                placeholder="Ej. Inyector Bosch Common Rail 0445110369"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) validateField("name");
                }}
                onBlur={handleBlur}
                disabled={isSubmitting}
                className={
                  fieldErrors.name
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                aria-invalid={Boolean(fieldErrors.name)}
                data-testid="product-name-input"
              />
              {fieldErrors.name && (
                <p
                  role="alert"
                  data-testid="product-name-field-error"
                  className="text-xs text-destructive font-medium"
                >
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Código OEM */}
            <div className="space-y-1.5">
              <Label htmlFor="product-oem">Código OEM / Número de Pieza</Label>
              <Input
                id="product-oem"
                name="oem"
                type="text"
                placeholder="Ej. 0445110369, 23670-0L050"
                value={oem}
                onChange={(e) => setOem(e.target.value)}
                disabled={isSubmitting}
                data-testid="product-oem-input"
              />
            </div>

            {/* Fabricante / Marca (UUID) */}
            <div className="space-y-1.5">
              <Label htmlFor="product-brand">
                Marca / Fabricante <span className="text-destructive">*</span>
              </Label>
              <select
                id="product-brand"
                name="brandId"
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  if (fieldErrors.brandId) validateField("brandId");
                }}
                onBlur={handleBlur}
                disabled={isSubmitting}
                data-testid="product-brand-select"
                aria-invalid={Boolean(fieldErrors.brandId)}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground ${
                  fieldErrors.brandId ? "border-destructive" : "border-input"
                }`}
              >
                <option value="">Seleccione una marca...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {fieldErrors.brandId && (
                <p
                  role="alert"
                  data-testid="product-brand-field-error"
                  className="text-xs text-destructive font-medium"
                >
                  {fieldErrors.brandId}
                </p>
              )}
            </div>

            {/* Condición */}
            <div className="space-y-1.5">
              <Label htmlFor="product-condition">Condición del Repuesto</Label>
              <select
                id="product-condition"
                name="condition"
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value as ProductCondition)
                }
                disabled={isSubmitting}
                data-testid="product-condition-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              >
                {PRODUCT_CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehículo Compatible */}
            <div className="space-y-1.5">
              <Label htmlFor="product-vehicle-compat">
                Vehículo / Motor Compatible
              </Label>
              <Input
                id="product-vehicle-compat"
                name="vehicleCompatibility"
                type="text"
                placeholder="Ej. Toyota Hilux 2.8 D-4D (2016+)"
                value={vehicleCompatibility}
                onChange={(e) => setVehicleCompatibility(e.target.value)}
                disabled={isSubmitting}
                data-testid="product-vehicle-input"
              />
            </div>
          </div>

          {/* Categorías Relacionales Planas (CA-05.3) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Categorías Asociadas <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Seleccionadas: {categoryIds.length}
              </span>
            </div>

            <div
              data-testid="product-categories-container"
              className={`max-h-36 overflow-y-auto rounded-lg border p-3 space-y-1.5 bg-card/50 ${
                fieldErrors.categoryIds ? "border-destructive" : "border-input"
              }`}
            >
              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No hay categorías registradas en el sistema.
                </p>
              ) : (
                categories.map((cat) => {
                  const isChild = cat.parentId !== null;
                  const isChecked = categoryIds.includes(cat.id);

                  return (
                    <label
                      key={cat.id}
                      className={`flex items-center gap-2.5 rounded-md px-2 py-1 text-sm cursor-pointer transition-colors hover:bg-muted/60 ${
                        isChild
                          ? "ml-5 border-l-2 border-primary/40 pl-3"
                          : "font-medium"
                      } ${isChecked ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(cat.id)}
                        disabled={isSubmitting}
                        data-testid={`category-checkbox-${cat.id}`}
                        className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm">{cat.name}</span>
                    </label>
                  );
                })
              )}
            </div>
            {fieldErrors.categoryIds && (
              <p
                role="alert"
                data-testid="product-categories-field-error"
                className="text-xs text-destructive font-medium"
              >
                {fieldErrors.categoryIds}
              </p>
            )}
          </div>

          {/* Descripción Técnica */}
          <div className="space-y-1.5">
            <Label htmlFor="product-description">
              Descripción Técnica <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="product-description"
              name="description"
              rows={3}
              placeholder="Detalles sobre calibración en banco de pruebas, estado de toberas, garantía..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) validateField("description");
              }}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={
                fieldErrors.description
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              aria-invalid={Boolean(fieldErrors.description)}
              data-testid="product-description-input"
            />
            {fieldErrors.description && (
              <p
                role="alert"
                data-testid="product-description-field-error"
                className="text-xs text-destructive font-medium"
              >
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Precio y Opciones de Comercialización (CA-05.2, CL-07) */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="product-price">Precio en ARS ($)</Label>
                <Input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Ej. 145000 (vacío para cotizar)"
                  value={priceInput}
                  onChange={(e) => {
                    setPriceInput(e.target.value);
                    if (fieldErrors.price) validateField("price");
                  }}
                  onBlur={handleBlur}
                  disabled={isSubmitting || !showPrice}
                  className={
                    fieldErrors.price
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                  data-testid="product-price-input"
                />
                {fieldErrors.price ? (
                  <p
                    role="alert"
                    data-testid="product-price-field-error"
                    className="text-xs text-destructive font-medium"
                  >
                    {fieldErrors.price}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Admite $0 (a convenir) o valor vacío para &quot;A cotizar&quot;.
                  </p>
                )}
              </div>

              {/* Switches de Control Comercial */}
              <div className="flex flex-col justify-center space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="product-show-price"
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Mostrar Precio al Público
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Si se apaga, se muestra &quot;Consultar&quot;.
                    </p>
                  </div>
                  <Switch
                    id="product-show-price"
                    checked={showPrice}
                    onCheckedChange={setShowPrice}
                    disabled={isSubmitting}
                    data-testid="product-show-price-switch"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="product-visible"
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Visible en Catálogo
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Habilita la presencia en la web pública.
                    </p>
                  </div>
                  <Switch
                    id="product-visible"
                    checked={visible}
                    onCheckedChange={setVisible}
                    disabled={isSubmitting}
                    data-testid="product-visible-switch"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-testid="product-form-cancel-btn"
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="industrial"
              disabled={isSubmitting}
              data-testid="product-form-submit-btn"
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
                "Crear Repuesto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
