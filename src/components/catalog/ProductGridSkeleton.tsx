/**
 * Esqueleto de Carga Asíncrona para la Grilla de Fichas Técnicas del Catálogo.
 * (Spec 009, RF-08, RF-11, Bloque 2 - Tarea 2.2)
 *
 * Características:
 * - Reproduce con exactitud milimétrica la geometría final de la Ficha Técnica (CLS === 0).
 * - Bordes hairlines de 1px sobre superficie mineral oscura (`bg-card`).
 * - Proporción fija 16/10 en el contenedor multimedia con borde inferior delimitador.
 * - Bloque de acciones y precio empujado rígidamente a la base mediante Flexbox (`mt-auto`).
 * - Pulso suave neutro sin saltos cromáticos ni parpadeos.
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
      aria-label="Cargando fichas técnicas de repuestos diésel..."
      aria-busy="true"
    >
      {skeletons.map((idx) => (
        <article
          key={idx}
          className="flex min-w-0 flex-col h-full overflow-hidden rounded-lg border border-border/80 bg-card shadow-xs animate-pulse"
        >
          {/* Contenedor Multimedia 16/10 con borde inferior hairline */}
          <div className="aspect-[16/10] w-full bg-white/5 border-b border-border/80" />

          {/* Cuerpo de la Ficha Técnica */}
          <div className="flex flex-1 flex-col p-4 gap-3">
            {/* Badges superiores: Marca y Condición */}
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 rounded bg-white/10" />
              <div className="h-4 w-20 rounded bg-white/10" />
            </div>

            {/* Título técnico (2 líneas acotadas) */}
            <div className="space-y-1.5 pt-1">
              <div className="h-4 w-5/6 rounded bg-white/10" />
              <div className="h-4 w-3/5 rounded bg-white/10" />
            </div>

            {/* Cuadrícula de Datos Duros (OEM y Disponibilidad) */}
            <div className="rounded border border-white/5 bg-white/[0.02] p-2.5 space-y-2">
              <div className="h-2.5 w-full rounded bg-white/5" />
              <div className="h-2.5 w-4/6 rounded bg-white/5" />
            </div>

            {/* Precio monetario */}
            <div className="h-5 w-28 rounded bg-white/10 mt-1" />

            {/* Acciones ancladas al fondo de la tarjeta con mt-auto */}
            <div className="mt-auto pt-2 flex items-center gap-2">
              {/* Botón Carrito sutil */}
              <div className="h-9 w-10 shrink-0 rounded-md bg-white/10" />
              {/* Botón WhatsApp prioritario */}
              <div className="h-9 flex-1 rounded-md bg-white/10" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ProductGridSkeleton;
