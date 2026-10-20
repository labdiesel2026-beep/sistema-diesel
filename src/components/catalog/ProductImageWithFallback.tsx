/**
 * Componente de Imagen de Producto con Fallback SVG Vectorial Accesible.
 * (Spec 003, RF-06, CL-03, Bloque 5 - Tarea T-12)
 *
 * Características:
 * - Resuelve URLs relativas hacia el backend mediante resolveImageUrl() de api.ts.
 * - Detecta ausencia de imagen o error de carga en el evento onError.
 * - Renderiza un placeholder SVG vectorial semántico con role="img" y texto "Imagen no disponible".
 */

import { useState, useEffect } from "react";
import { resolveImageUrl } from "@/lib/api";

export interface ProductImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  loading?: "lazy" | "eager";
}

export function ProductImageWithFallback({
  src,
  alt,
  className = "size-full object-cover",
  fallbackClassName = "flex size-full flex-col items-center justify-center bg-muted p-4 text-center text-muted-foreground",
  loading = "lazy",
}: ProductImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  // Reiniciar estado de error si la URL cambia
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolvedUrl = resolveImageUrl(src);

  if (!resolvedUrl || hasError) {
    return (
      <div
        role="img"
        aria-label={alt ? `Imagen no disponible para ${alt}` : "Imagen no disponible"}
        className={fallbackClassName}
        data-testid="product-image-fallback"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-10 stroke-muted-foreground/60"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="mt-2 text-xs font-medium text-muted-foreground">Imagen no disponible</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
      data-testid="product-image"
    />
  );
}

export default ProductImageWithFallback;
