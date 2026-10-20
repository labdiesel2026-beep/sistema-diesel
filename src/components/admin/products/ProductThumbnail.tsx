import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductThumbnailProps {
  src?: string | null | undefined;
  alt?: string | undefined;
  className?: string | undefined;
}

/**
 * Componente de miniatura de producto con fallback gráfico resiliente.
 * (RF-06, CA-06.3, CL-10)
 *
 * Características:
 * - Soporta URLs relativas de servidor y Data URLs base64.
 * - Ante error de carga (evento onError) o ausencia de URL, conmuta automáticamente
 *   a un placeholder visual neutro manteniendo dimensiones fijas sin desalinear la grilla.
 * - Iconografía accesible con `aria-label="Imagen no disponible"`.
 */
export function ProductThumbnail({
  src,
  alt = "Foto de repuesto diésel",
  className,
}: ProductThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  // Reiniciar estado de error si cambia la URL de la imagen
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const containerClasses = cn(
    "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/60",
    className,
  );

  if (!src || hasError) {
    return (
      <div
        className={containerClasses}
        data-testid="product-thumbnail-fallback"
        role="img"
        aria-label="Imagen no disponible"
      >
        <Package className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="size-full object-cover object-center"
        data-testid="product-thumbnail-img"
        loading="lazy"
      />
    </div>
  );
}
