import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CatalogCTAButton } from "@/components/ui/CatalogCTAButton";
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
 * - Comportamiento inteligente para pocos productos (< 3): desactiva loop infinito y centra los items elegantemente.
 * - Aspect ratio 1:1 (cuadrado) con object-cover uniforme para prevenir distorsión visual de fotos.
 * - Envoltura semántica de tarjeta en Link directo a /catalogo/$productId.
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

  // Solo debe renderizarse si hay un mínimo de 3 productos y un máximo de 10 (si hay 0, 1 o 2 retorna null)
  if (activeProducts.length < 3) {
    return null;
  }

  const displayProducts = activeProducts.slice(0, 10);
  const marqueeProducts = [...displayProducts, ...displayProducts];

  const renderCard = (product: FeaturedProductItem, key: string) => (
    <article
      key={key}
      className="group relative flex w-[270px] xs:w-[290px] shrink-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950 transition-all duration-300 hover:border-white/30 sm:w-[320px] md:w-[340px] cursor-pointer shadow-lg"
    >
      <Link
        to="/catalogo/$productId"
        params={{ productId: product.id }}
        className="flex flex-col h-full focus:outline-none"
        aria-label={`Ver ${product.name} en el catálogo oficial`}
      >
        {/* Contenedor Multimedia Cuadrado 1:1 Estandarizado */}
        <div className="relative aspect-square w-full bg-white flex items-center justify-center p-2 rounded-t-lg overflow-hidden border-b border-white/10">
          <ProductImageWithFallback
            src={product.imageUrl ?? null}
            alt={product.name}
            className="max-w-full max-h-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Badge de Marca */}
          {product.brandName && (
            <span className="absolute left-3 top-3 border border-white/10 bg-zinc-950/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white">
              {product.brandName}
            </span>
          )}

          {/* Badge de Condición */}
          <span className="absolute right-3 top-3 border border-white/10 bg-zinc-950/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            {product.condition}
          </span>
        </div>

        {/* Contenido Técnico */}
        <div className="flex flex-1 flex-col p-6">
          {/* Código OEM */}
          <span className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
            {product.oem?.trim() ? `OEM ${product.oem.trim()}` : "OEM S/N"}
          </span>

          {/* Título de Producto */}
          <h3
            className="font-light text-base md:text-lg leading-snug text-white transition-colors group-hover:text-zinc-300 line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Compatibilidad Vehicular */}
          {product.vehicleCompatibility?.trim() && (
            <p className="mt-2 line-clamp-2 text-xs font-light text-zinc-400">
              {product.vehicleCompatibility.trim()}
            </p>
          )}

          {/* Fila de Precio y Navegación */}
          <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/10">
            <div>
              {product.showPrice && product.price !== null ? (
                <p className="font-light text-xl text-white">{formatPrice(product.price)}</p>
              ) : (
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                  Consultar precio
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors group-hover:text-white">
              Ficha
              <ArrowRight className="size-3" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );

  return (
    <section
      id="destacados"
      data-testid="featured-products-section"
      className={`scroll-mt-20 bg-zinc-950 py-16 sm:py-24 md:py-32 border-b border-white/10 overflow-hidden min-h-[460px] ${className}`}
      aria-labelledby="destacados-heading"
    >
      <div className="site-container">
        {/* Encabezado con badge y título estilo Longbow */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-16">
          <div className="max-w-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 block mb-3">
              Catálogo Seleccionado
            </span>
            <h2
              id="destacados-heading"
              className="text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight"
            >
              Inyectores y Bombas en Stock
            </h2>
            <p className="mt-4 text-base font-light text-zinc-400">
              Piezas calibradas y verificadas bajo estándares OEM listas para instalación inmediata.
            </p>
          </div>

          {/* Indicador de movimiento o estado */}
          <div className="hidden sm:inline-flex items-center gap-2 border border-white/10 bg-zinc-950 px-3.5 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            <span className="size-1.5 bg-emerald-400 animate-pulse" />
            <span>Actualización en tiempo real</span>
          </div>
        </div>

        {/* Carrusel Marquee infinito (mínimo 3, hasta 10 productos) */}
        <div
          className="relative w-full overflow-hidden py-4"
          data-testid="featured-marquee-container"
        >
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-12 sm:w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-12 sm:w-24 bg-gradient-to-l from-zinc-950 to-transparent" />

          <motion.div
            className="flex gap-8 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 32,
              ease: "linear",
            }}
          >
            {marqueeProducts.map((product, index) => renderCard(product, `${product.id}-${index}`))}
          </motion.div>
        </div>

        {/* CTA al Catálogo Completo */}
        <div className="mt-12 sm:mt-16 md:mt-20 flex flex-col items-center justify-center text-center">
          <CatalogCTAButton to="/catalogo" label="Ver Catálogo Completo" size="lg" />
        </div>
      </div>
    </section>
  );
}
