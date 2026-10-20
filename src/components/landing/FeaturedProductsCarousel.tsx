import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImageWithFallback } from "@/components/catalog/ProductImageWithFallback";
import { formatPrice } from "@/lib/catalog-whatsapp";
import { fetchFeaturedProducts, type FeaturedProductItem } from "@/services/landing.service";

export type { FeaturedProductItem };

export interface FeaturedProductsCarouselProps {
  products?: FeaturedProductItem[] | undefined;
  className?: string | undefined;
}

/**
 * Carrusel dinámico de productos destacados para la Landing Page (Fase 6 - Bloque 7, Tarea 7.2).
 * (RF-06, RF-07, RNF-03, RNF-05, CL-01, CL-02)
 *
 * Características:
 * - Hidratación dinámica desde GET /api/products/featured con degradación silenciosa.
 * - Prevención de CLS mediante contenedor de reserva de altura mínima (min-h-[460px]).
 * - Desmontaje automático y limpio (retorna null) si hay 0 destacados o fallo de API.
 * - Envoltura semántica de tarjeta en Link directo a /catalogo/$productId.
 * - Animación de bucle continuo infinito con framer-motion.
 */
export function FeaturedProductsCarousel({
  products: propProducts,
  className = "",
}: FeaturedProductsCarouselProps) {
  const [loadedProducts, setLoadedProducts] = useState<FeaturedProductItem[] | null>(
    propProducts ?? null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(propProducts === undefined);

  useEffect(() => {
    if (propProducts !== undefined) {
      setLoadedProducts(propProducts);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchFeaturedProducts()
      .then((items) => {
        if (isMounted) {
          setLoadedProducts(items);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadedProducts([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propProducts]);

  // Durante la carga inicial, reservar espacio vertical anti-CLS (CA-07.1)
  if (isLoading) {
    return (
      <div
        data-testid="featured-carousel-skeleton"
        className={`min-h-[460px] w-full bg-background dark:bg-slate-950 py-20 border-y border-border/60 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const activeProducts = loadedProducts ?? [];

  // Si no hay productos destacados o la petición falló, desmontaje silencioso (CA-07.2, CL-01, CL-02)
  if (activeProducts.length === 0) {
    return null;
  }

  // Duplicamos internamente el array para que el bucle continuo no se corte visualmente
  const marqueeProducts = [...activeProducts, ...activeProducts];

  return (
    <section
      id="destacados"
      data-testid="featured-products-section"
      className={`scroll-mt-20 bg-background py-20 dark:bg-slate-950 sm:py-24 border-y border-border/60 overflow-hidden min-h-[460px] ${className}`}
      aria-labelledby="destacados-heading"
    >
      <div className="site-container">
        {/* Encabezado con badge y título */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
              Repuestos y Recambios Destacados
            </div>
            <h2
              id="destacados-heading"
              className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
            >
              Inyectores y Bombas en Stock
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              Piezas calibradas y verificadas bajo estándares OEM listas para instalación inmediata.
            </p>
          </motion.div>

          {/* Indicador de movimiento continuo autónomo */}
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Actualización en tiempo real</span>
          </div>
        </div>

        {/* Carrusel Marquee Autónomo Infinito con framer-motion */}
        <div className="relative mt-10 w-full overflow-hidden py-4">
          {/* Sombras degradadas laterales para suavizar entrada y salida visual */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-12 sm:w-24 bg-gradient-to-r from-background to-transparent dark:from-slate-950" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-12 sm:w-24 bg-gradient-to-l from-background to-transparent dark:from-slate-950" />

          <motion.div
            className="flex gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 28,
              ease: "linear",
            }}
          >
            {marqueeProducts.map((product, index) => {
              const conditionClasses =
                product.condition === "Nuevo"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-secondary text-secondary-foreground border-secondary";

              return (
                <article
                  key={`${product.id}-${index}`}
                  className="group relative flex w-[290px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10 sm:w-[320px] md:w-[340px] cursor-pointer"
                >
                  <Link
                    to="/catalogo/$productId"
                    params={{ productId: product.id }}
                    className="flex flex-col h-full focus:outline-none"
                    aria-label={`Ver ${product.name} en el catálogo oficial`}
                  >
                    {/* Contenedor Multimedia */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-muted">
                      <ProductImageWithFallback
                        src={product.imageUrl ?? null}
                        alt={product.name}
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                      />

                      {/* Badge de Marca */}
                      {product.brandName && (
                        <span className="absolute left-3 top-3 rounded-md border border-border/80 bg-card/95 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-xs backdrop-blur-xs">
                          {product.brandName}
                        </span>
                      )}

                      {/* Badge de Condición */}
                      <span
                        className={`absolute right-3 top-3 rounded-md border px-2.5 py-1 text-[11px] font-semibold shadow-xs ${conditionClasses}`}
                      >
                        {product.condition}
                      </span>
                    </div>

                    {/* Contenido Técnico */}
                    <div className="flex flex-1 flex-col p-5">
                      {/* Código OEM */}
                      <span className="mb-2.5 inline-block self-start rounded-md border border-primary/15 bg-primary/5 px-2.5 py-1 font-mono text-xs font-semibold text-primary transition-colors group-hover:bg-primary/10">
                        OEM {product.oem}
                      </span>

                      {/* Título de Producto */}
                      <h3
                        className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Compatibilidad Vehicular */}
                      {product.vehicleCompatibility && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {product.vehicleCompatibility}
                        </p>
                      )}

                      {/* Fila de Precio y Señuelo de Navegación */}
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/60">
                        <div>
                          {product.showPrice && product.price !== null ? (
                            <p className="font-display text-xl font-bold text-foreground">
                              {formatPrice(product.price)}
                            </p>
                          ) : (
                            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                              Consultar precio
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-transform duration-200 group-hover:translate-x-1.5">
                          Ver ficha
                          <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </motion.div>
        </div>

        {/* CTA Gigante al Catálogo Completo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-14 flex flex-col items-center justify-center text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.04, 1, 1.06, 1],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative group"
          >
            {/* Halo sutil y elegante de expansión */}
            <div
              className="absolute -inset-0.5 rounded-xl bg-blue-500/30 blur-sm animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 opacity-30 blur-xs animate-[pulse_1.8s_cubic-bezier(0.4,0,0.6,1)_infinite]"
              aria-hidden="true"
            />
            <Button
              variant="industrial"
              asChild
              className="group relative overflow-hidden h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-bold shadow-xl shadow-blue-950/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-blue-500/30 ring-1 ring-blue-500/20"
            >
              <Link to="/catalogo" className="relative overflow-hidden flex items-center gap-3">
                {/* Shimmer continuo de atracción */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  aria-hidden="true"
                />
                <span className="relative z-10 flex items-center gap-3">
                  <span>Ver Catálogo Completo</span>
                  <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1.5" />
                </span>
              </Link>
            </Button>
          </motion.div>
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <Check className="size-3.5 text-primary" />
            <span>Más de 500 referencias en inyectores, toberas y bombas con garantía de taller</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedProductsCarousel;
