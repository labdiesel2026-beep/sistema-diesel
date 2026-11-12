import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export const CLOUDINARY_THUMBNAIL_TRANSFORM = "c_fill,w_96,h_96,q_auto,f_auto";

/**
 * Transforma URLs de Cloudinary inyectando parámetros de miniatura optimizada (96x96 px para pantallas Retina 2x),
 * reduciendo el peso de descarga en tabla de ~150 KB a ~4 KB sin alterar rutas locales ni Data URLs (Fase 14 RF-05).
 */
export function getOptimizedThumbnailUrl(src: string): string {
  if (!src || typeof src !== "string") return "";
  const trimmed = src.trim();

  if (trimmed.startsWith("data:") || !trimmed.includes("cloudinary.com")) {
    return trimmed;
  }

  const uploadMarker = "/image/upload/";
  const markerIndex = trimmed.indexOf(uploadMarker);
  if (markerIndex === -1) {
    return trimmed;
  }

  const afterUpload = trimmed.slice(markerIndex + uploadMarker.length);
  if (
    afterUpload.startsWith(`${CLOUDINARY_THUMBNAIL_TRANSFORM}/`) ||
    afterUpload.startsWith("c_fill,")
  ) {
    return trimmed;
  }

  return `${trimmed.slice(0, markerIndex)}${uploadMarker}${CLOUDINARY_THUMBNAIL_TRANSFORM}/${afterUpload}`;
}

export interface ProductThumbnailProps {
  src?: string | null | undefined;
  alt?: string | undefined;
  className?: string | undefined;
}

/**
 * Componente de miniatura de producto con fallback gráfico resiliente y optimización CDN.
 * (RF-06, CA-06.3, CL-10, Fase 14 RF-05)
 *
 * Características:
 * - Soporta URLs de Cloudinary (inyectando `c_fill,w_96,h_96,q_auto,f_auto`), URLs relativas y Data URLs base64.
 * - Carga diferida (`loading="lazy"`) y decodificación asíncrona fuera del hilo principal (`decoding="async"`).
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

  const optimizedSrc = getOptimizedThumbnailUrl(src);

  return (
    <div className={containerClasses}>
      <img
        src={optimizedSrc}
        alt={alt}
        onError={() => setHasError(true)}
        className="size-full object-cover object-center"
        data-testid="product-thumbnail-img"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
