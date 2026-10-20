/**
 * Tarjeta de Repuesto Diésel para la Grilla Pública del Catálogo.
 * (Spec 003, RF-06, RF-07, RF-08, RF-09, Bloque 5 - Tarea T-13)
 *
 * Características:
 * - Integración con ProductImageWithFallback (resolución /uploads/ y SVG local).
 * - Etiquetas técnicas de Marca, OEM y Condición.
 * - Exhibición condicional de precio (formato ARS o leyenda "Consultar precio").
 * - Integración reactiva con useCatalogCart() (botón de agregar / en el carrito).
 * - Enlace directo pre-formateado a WhatsApp con generateDirectProductWhatsAppUrl().
 */

import { ShoppingCart, Check } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ProductImageWithFallback } from "@/components/catalog/ProductImageWithFallback";
import { useCatalogCart } from "@/context/catalog-cart-context";
import { formatPrice, generateDirectProductWhatsAppUrl } from "@/lib/catalog-whatsapp";
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

  const conditionClasses =
    product.condition === "Nuevo"
      ? "bg-primary/10 text-primary border-primary/20"
      : product.condition === "Reacondicionado"
        ? "bg-secondary text-secondary-foreground border-secondary"
        : "bg-muted text-muted-foreground border-border";

  const directWhatsAppUrl = generateDirectProductWhatsAppUrl(product, brandName);

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl ${className}`}
      data-testid={`product-card-${product.id}`}
    >
      {/* Contenedor Multimedia */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-muted">
        <ProductImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Badge de Marca */}
        {brandName && (
          <span className="absolute left-3 top-3 rounded-md border border-border/80 bg-card/95 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-xs backdrop-blur-xs">
            {brandName}
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
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {/* Código OEM */}
        {product.oem ? (
          <span className="mb-2.5 inline-block self-start rounded-md border border-primary/15 bg-primary/5 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
            OEM {product.oem}
          </span>
        ) : (
          <div className="h-6 mb-2.5" />
        )}

        {/* Título de Producto */}
        <h3
          className="font-display text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-2xl cursor-pointer"
          onClick={() => onViewDetail && onViewDetail(product.id)}
          title={`Ver detalles de ${product.name}`}
        >
          {product.name}
        </h3>

        {/* Compatibilidad Vehicular */}
        {product.vehicleCompatibility && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.vehicleCompatibility}
          </p>
        )}

        {/* Precio / Consultar Precio */}
        <div className="mb-5 mt-4 flex min-h-9 items-center">
          {product.showPrice && product.price !== null ? (
            <p className="font-display text-2xl font-bold text-foreground">
              {formatPrice(product.price)}
            </p>
          ) : (
            <span className="rounded-md bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground">
              Consultar precio
            </span>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="mt-auto grid gap-2">
          {/* Botón Agregar al Carrito */}
          <Button
            variant="industrial"
            className="h-11 w-full gap-2 text-sm font-semibold"
            onClick={() => add(product)}
            aria-label={
              cartQuantity > 0
                ? `En el carrito (${cartQuantity}). Agregar una unidad más de ${product.name}`
                : `Agregar ${product.name} al carrito`
            }
          >
            {cartQuantity > 0 ? (
              <>
                <Check className="size-4" />
                <span>En el carrito ({cartQuantity}) · Agregar</span>
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" />
                <span>Agregar al Carrito</span>
              </>
            )}
          </Button>

          {/* Botón WhatsApp Directo */}
          <Button variant="whatsapp" className="h-11 w-full gap-2 text-sm font-semibold" asChild>
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
    </article>
  );
}

export default ProductCard;
