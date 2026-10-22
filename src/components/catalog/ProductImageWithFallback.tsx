/**
 * Componente de Imagen de Producto con Fallback Esquematizado Técnico.
 * (Spec 009, RF-11, Principio 6 de la Constitución, Bloque 2 - Tarea 2.4)
 *
 * Características:
 * - Resuelve URLs relativas hacia el backend mediante resolveImageUrl() de api.ts.
 * - Detecta ausencia de imagen o error de carga en el evento onError de forma opaca y silenciosa.
 * - Renderiza un diagrama esquemático técnico vectorial de un inyector diésel en trazo fino monocrómico
 *   sobre fondo mineral, eliminando fotografías de stock genéricas o iconos rotos.
 * - Conserva accesibilidad semántica con role="img", aria-label y etiquetas accesibles.
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
  fallbackClassName = "flex size-full flex-col items-center justify-center bg-card/60 p-4 text-center border-b border-border/80",
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
        {/* Esquema Vectorial Técnico de Inyector Diésel */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-14 stroke-white opacity-20 transition-opacity"
          aria-hidden="true"
        >
          {/* Conector y cabezal electromagnético */}
          <path d="M26 8h12v5H26z" />
          <path d="M30 4h4v4h-4z" />
          {/* Cuerpo principal cilíndrico */}
          <path d="M28 13h8v16h-8z" />
          {/* Racor de retorno de combustible */}
          <path d="M36 17h6v4h-6" />
          {/* Racor de entrada Common Rail alta presión */}
          <path d="M22 23h6v4h-6" />
          {/* Cuerpo intermedio cónico */}
          <path d="M28 29l2 15h4l2-15" />
          {/* Tobera y punta atomizadora */}
          <path d="M30 44h4v12l-2 4-2-4v-12z" />
          {/* Guías de cota técnica milimétrica */}
          <line x1="16" y1="31" x2="19" y2="31" strokeDasharray="1 1" />
          <line x1="45" y1="31" x2="48" y2="31" strokeDasharray="1 1" />
        </svg>

        {/* Identificador técnico monoespaciado */}
        <span className="mt-2.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Esquema Técnico Registrado
        </span>
        <span className="mt-0.5 text-[10px] text-muted-foreground/60">
          Imagen no disponible
        </span>
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
