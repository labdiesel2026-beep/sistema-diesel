/**
 * Esqueleto de Carga Asíncrona para la Grilla de Productos.
 * (Spec 003, RF-02, Bloque 5 - Tarea T-13)
 */

export interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 6,
  className = "grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6",
}: ProductGridSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={className}
      data-testid="product-grid-skeleton"
      aria-label="Cargando repuestos diésel..."
      aria-busy="true"
    >
      {skeletons.map((idx) => (
        <article
          key={idx}
          className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs animate-pulse"
        >
          {/* Imagen skeleton */}
          <div className="aspect-[16/10] w-full bg-muted" />

          {/* Contenido skeleton */}
          <div className="flex flex-1 flex-col p-5 md:p-6">
            <div className="mb-3 h-6 w-24 rounded-md bg-muted" />
            <div className="h-6 w-3/4 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-1/2 rounded-md bg-muted" />

            <div className="mb-5 mt-6 h-8 w-1/3 rounded-md bg-muted" />

            <div className="mt-auto grid gap-2">
              <div className="h-11 w-full rounded-xl bg-muted" />
              <div className="h-11 w-full rounded-xl bg-muted" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ProductGridSkeleton;
