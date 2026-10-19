import { useState, useRef, type ChangeEvent } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { imageMetadataSchema } from "@/lib/validations/admin-schemas";
import { Button } from "@/components/ui/button";

export interface ProductImageUploadProps {
  value?: string | null | undefined;
  onChange?: ((imageUrl: string) => void) | undefined;
  disabled?: boolean | undefined;
  error?: string | undefined;
}

/**
 * Componente de Carga y Validación Client-Side de Fotos.
 * (RF-08, CA-08.1 a CA-08.4, CL-01, CL-02, CL-03)
 *
 * Características:
 * - Valida metadata desacoplada del objeto File mediante `imageMetadataSchema`.
 * - Límite inclusivo: acepta hasta 5.00 MB exactos (`5242880` bytes).
 * - Rechaza archivos mayores a 5 MB o formatos no permitidos (.gif, .svg, etc.).
 * - Genera previsualización Data URL inmediata.
 * - Sobrescribe limpiamente la selección previa ante nuevo archivo (CL-03).
 */
export function ProductImageUpload({
  value,
  onChange,
  disabled = false,
  error: externalError,
}: ProductImageUploadProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // localPreview !== null tiene prioridad sobre la prop value (permite quitar o previsualizar)
  const displayImage = localPreview !== null ? localPreview : value;
  const activeError = internalError || externalError;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInternalError(null);
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file) {
      return;
    }

    // Validación desacoplada de la instancia File con Zod (RF-08, CA-08.1, CA-08.2, CA-08.3, CL-01, CL-02)
    const validationResult = imageMetadataSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validationResult.success) {
      const firstError =
        validationResult.error.errors[0]?.message ||
        "Archivo de imagen inválido";
      setInternalError(firstError);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Archivo válido: generar Data URL y reemplazar selección previa (CA-08.4, CL-03)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setLocalPreview(result);
        onChange?.(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setLocalPreview("");
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange?.("");
  };

  return (
    <div className="space-y-3" data-testid="product-image-upload">
      {/* Contenedor de Previsualización o Zona de Carga */}
      {displayImage ? (
        <div
          data-testid="image-preview-container"
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-4"
        >
          <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-lg border border-border bg-muted/40">
            <img
              src={displayImage}
              alt="Previsualización del repuesto"
              data-testid="image-upload-preview"
              className="size-full object-contain object-center"
            />
          </div>

          <div className="mt-3 flex w-full items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
              data-testid="replace-image-btn"
            >
              <Upload className="mr-1.5 size-3.5" />
              Reemplazar foto
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={handleRemove}
              className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              data-testid="remove-image-btn"
            >
              <X className="mr-1.5 size-3.5" />
              Quitar
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          data-testid="upload-dropzone"
          className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            activeError
              ? "border-destructive/60 bg-destructive/5 hover:border-destructive"
              : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="size-5" />
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Haga clic para subir una foto del repuesto
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Formatos admitidos: JPG, PNG o WEBP (máx. 5.00 MB)
          </p>
        </div>
      )}

      {/* Input nativo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        data-testid="image-file-input"
        className="sr-only"
        tabIndex={-1}
      />

      {/* Mensaje de Error */}
      {activeError && (
        <div
          role="alert"
          data-testid="image-upload-error"
          className="flex items-center gap-2 text-xs font-medium text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
