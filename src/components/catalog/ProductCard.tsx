/**
 * Tarjeta de Repuesto Diésel — Ficha Técnica Pura de Ingeniería.
 * (Spec 009, RF-08, CL-01, CL-02, Bloque 2 - Tarea 2.3)
 *
 * Características:
 * - Estructura Flexbox vertical con bloque de precio y acciones empujado al fondo (mt-auto)
 *   asegurando alineación horizontal milimétrica de botones en la grilla.
 * - Cabecera multimedia con relación de aspecto 16/10 y hairlines de 1px.
 * - Badges técnicos superiores: Marca y Condición (Nuevo: sólido, Reacondicionado: punteado).
 * - Título acotado a dos líneas (line-clamp-2) para prevenir desbordes.
 * - Cuadrícula de datos técnicos con código OEM principal y guión técnico "—" ante ausencia.
 * - Botón secundario para agregar a carrito y botón principal verde esmeralda de cotización directa por WhatsApp.
 */

import { useMemo } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ProductImageWithFallback } from "@/components/catalog/ProductImageWithFallback";
import { useCatalogCart } from "@/context/catalog-cart-context";
import { formatPrice, generateDirectProductWhatsAppUrl } from "@/lib/catalog-whatsapp";
import { parseOemCodes } from "@/lib/catalog-search";
import type { CatalogProduct } from "@/types/catalog";

export interface ProductCardProps {
  product: CatalogProduct;
  brandName?: string;
  onViewDetail?: (productId: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  brandName = "",
  onViewDetail,
  className = "",
}: ProductCardProps) {
  const { add, getItemQuantity } = useCatalogCart();
  const cartQuantity = getItemQuantity(product.id);

  const directWhatsAppUrl = generateDirectProductWhatsAppUrl(product, brandName);
  const oemData = useMemo(() => parseOemCodes(product.oem), [product.oem]);

  return (
    <article
      className={`group flex min-w-0 flex-col h-full overflow-hidden rounded-lg border border-border/80 bg-card shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border-hover hover:shadow-xl ${className}`}
      data-testid={`product-card-${product.id}`}
    >
      {/* Contenedor Multimedia 16/10 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/80 bg-white/5">
        <ProductImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Badges superiores sobre imagen */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 pointer-events-none">
          {brandName ? (
            <span className="rounded border border-border/80 bg-card/90 px-2 py-0.5 text-micro text-foreground backdrop-blur-xs shadow-xs">
              {brandName}
            </span>
          ) : (
            <span />
          )}

          {/* Badge de Condición Técnica */}
          <span
            className={`rounded px-2 py-0.5 text-micro shadow-xs backdrop-blur-xs ${
              product.condition === "Nuevo"
                ? "border border-white/20 bg-card/90 text-white font-semibold"
                : "border border-dashed border-white/30 bg-card/90 text-white/90 font-medium"
            }`}
          >
            {product.condition}
          </span>
        </div>
      </div>

      {/* Cuerpo de la Ficha Técnica */}
      <div className="flex flex-1 flex-col p-4 gap-2.5">
        {/* Código OEM y Equivalencias Técnicas (Spec 009, RF-08, CL-02) */}
        <div className="flex flex-wrap items-center gap-1.5 self-start min-h-[22px]">
          {oemData.primary ? (
            <>
              <span
                className="inline-block rounded border border-border/80 bg-white/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground"
                data-testid={`oem-primary-${product.id}`}
              >
                OEM {oemData.primary}
              </span>
              {oemData.alternatives.length > 0 && (
                <span
                  tabIndex={0}
                  role="note"
                  className="inline-block cursor-help rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:border-border-hover hover:text-foreground transition-colors"
                  title={`Equivalencias OEM:\n${oemData.alternatives.join(", ")}`}
                  aria-label={`Equivalencias alternativas: ${oemData.alternatives.join(", ")}`}
                  data-testid={`oem-alternatives-${product.id}`}
                >
                  +{oemData.alternatives.length} ALTERNATIVOS
                </span>
              )}
            </>
          ) : (
            <span
              className="inline-block font-mono text-[11px] text-muted-foreground"
              data-testid={`oem-empty-${product.id}`}
            >
              —
            </span>
          )}
        </div>

        {/* Título de Producto (acotado a 2 líneas con line-clamp-2) */}
        <h3
          className="line-clamp-2 font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-white cursor-pointer"
          onClick={() => onViewDetail && onViewDetail(product.id)}
          title={`Ver detalles de ${product.name}`}
        >
          {product.name}
        </h3>

        {/* Compatibilidad Vehicular */}
        {product.vehicleCompatibility && (
          <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground">
            {product.vehicleCompatibility}
          </p>
        )}

        {/* Bloque de Cierre con Precio y Acciones ancladas al fondo vía mt-auto */}
        <div className="mt-auto pt-2 flex flex-col gap-3">
          {/* Precio Monetario / Consultar Precio */}
          <div className="flex items-center">
            {product.showPrice && product.price !== null && product.price > 0 ? (
              <p className="font-display text-xl font-bold tracking-tight text-foreground">
                {formatPrice(product.price)}
              </p>
            ) : (
              <span className="rounded border border-border/80 bg-white/5 px-2.5 py-1 text-micro text-muted-foreground">
                Consultar precio
              </span>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="grid gap-2">
            {/* Botón Agregar al Carrito */}
            <Button
              variant="industrial"
              className="h-10 w-full gap-2 text-xs font-semibold"
              onClick={() => add(product)}
              aria-label={
                cartQuantity > 0
                  ? `En el carrito (${cartQuantity}). Agregar una unidad más de ${product.name}`
                  : `Agregar ${product.name} al carrito`
              }
            >
              {cartQuantity > 0 ? (
                <>
                  <Check className="size-3.5" />
                  <span>En el carrito ({cartQuantity}) · Agregar</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="size-3.5" />
                  <span>Agregar al Carrito</span>
                </>
              )}
            </Button>

            {/* Botón WhatsApp Directo */}
            <Button
              variant="whatsapp"
              className="h-10 w-full gap-2 text-xs font-semibold tracking-wide uppercase shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25"
              asChild
            >
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Consultar por ${product.name} en WhatsApp`}
              >
                <FaWhatsapp className="size-4 shrink-0" />
                <span>WhatsApp Directo</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
