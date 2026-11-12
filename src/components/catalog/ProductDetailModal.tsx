import { useMemo } from "react";
import { ShoppingCart, Check, Tag, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImageWithFallback } from "@/components/catalog/ProductImageWithFallback";
import { useCatalogCart } from "@/context/catalog-cart-context";
import { useSiteSettings } from "@/context/site-settings-context";
import { formatPrice } from "@/lib/catalog-whatsapp";
import { buildWhatsAppUrl } from "@/lib/whatsapp-utils";
import type { CatalogProduct } from "@/types/catalog";

export interface ProductDetailModalProps {
  readonly product: CatalogProduct | null;
  readonly brandName?: string;
  readonly categoryName?: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({
  product,
  brandName = "",
  categoryName = "",
  open,
  onOpenChange,
}: ProductDetailModalProps) {
  const { add, getItemQuantity } = useCatalogCart();
  const { whatsappNumber } = useSiteSettings();

  const cartQuantity = product ? getItemQuantity(product.id) : 0;
  const sku = product?.oem || (product ? `DIESEL-${product.id.slice(0, 8).toUpperCase()}` : "");

  const whatsappUrl = useMemo(() => {
    if (!product) return "#";
    const message = `Hola, quisiera consultar sobre el repuesto: ${product.name} (SKU: ${sku})`;
    return buildWhatsAppUrl(whatsappNumber, message);
  }, [product, sku, whatsappNumber]);

  if (!product) {
    return null;
  }

  const hasPositivePrice = product.showPrice && product.price !== null && product.price > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 bg-zinc-950 p-6 shadow-2xl backdrop-blur-md text-white technical-scrollbar"
        aria-describedby="product-modal-description"
        data-testid="product-detail-modal"
      >
        <DialogHeader className="space-y-1 text-left pb-2 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Badge de Stock */}
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs uppercase"
              data-testid="product-modal-stock-badge"
            >
              En Stock / Disponible
            </Badge>

            {/* Badge de Condición Técnica */}
            <span
              className={`rounded px-2.5 py-0.5 text-xs font-mono tracking-wider uppercase border ${
                product.condition === "Nuevo"
                  ? "border-industrial/50 bg-zinc-950 text-industrial font-semibold"
                  : "border-badge-refurbished/50 bg-zinc-950 text-badge-refurbished font-medium"
              }`}
              data-testid="product-modal-condition-badge"
            >
              {product.condition}
            </span>

            {brandName && (
              <span className="rounded border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300 font-mono">
                {brandName}
              </span>
            )}
          </div>

          <DialogTitle className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            {product.name}
          </DialogTitle>
          <DialogDescription id="product-modal-description" className="sr-only">
            Detalle técnico y cotización para {product.name}
          </DialogDescription>
        </DialogHeader>

        {/* Contenido scrolleable con layout responsivo */}
        <div className="my-2 max-h-[60vh] overflow-y-auto pr-1 technical-scrollbar space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Imagen destacada a la izquierda/arriba con buen tamaño */}
            <div className="md:col-span-5 relative aspect-square w-full bg-white flex items-center justify-center p-3 rounded-lg overflow-hidden border border-white/10 shadow-inner">
              <ProductImageWithFallback
                src={product.imageUrl}
                alt={product.name}
                className="max-w-full max-h-full object-contain object-center rounded-md"
                fallbackClassName="flex size-full flex-col items-center justify-center bg-zinc-900 rounded-md p-4 text-center"
              />
            </div>

            {/* Ficha de Información Técnica y Metadatos */}
            <div className="md:col-span-7 space-y-4">
              {/* Bloque de Precio */}
              <div className="rounded-lg border border-white/10 bg-[#111111] p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Precio Estimado
                  </span>
                  {hasPositivePrice ? (
                    <p
                      className="font-display text-2xl font-bold text-white tracking-tight mt-0.5"
                      data-testid="product-modal-price"
                    >
                      {formatPrice(product.price!)}
                    </p>
                  ) : (
                    <span
                      className="inline-block mt-0.5 rounded border border-border/80 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
                      data-testid="product-modal-price-consult"
                    >
                      Consultar precio
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Moneda
                  </span>
                  <span className="text-xs font-mono text-zinc-400">ARS (Pesos)</span>
                </div>
              </div>

              {/* Grilla de Especificaciones Clave */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-white/10 bg-[#111111] p-2.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Marca</span>
                  <span className="font-semibold text-zinc-200 mt-0.5 block truncate">
                    {brandName || "Multimarca / Genérico"}
                  </span>
                </div>

                <div className="rounded border border-white/10 bg-[#111111] p-2.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                    Categoría
                  </span>
                  <span className="font-semibold text-zinc-200 mt-0.5 block truncate">
                    {categoryName || "Inyección Diésel"}
                  </span>
                </div>

                <div className="col-span-2 rounded border border-white/10 bg-[#111111] p-2.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                    Código OEM / SKU Interno
                  </span>
                  <span
                    className="font-mono text-xs font-semibold text-industrial mt-0.5 block break-all"
                    data-testid="product-modal-sku"
                  >
                    {sku}
                  </span>
                </div>

                {product.vehicleCompatibility && (
                  <div className="col-span-2 rounded border border-white/10 bg-[#111111] p-2.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                      Compatibilidad Vehicular
                    </span>
                    <span className="text-xs text-zinc-300 mt-0.5 block">
                      {product.vehicleCompatibility}
                    </span>
                  </div>
                )}
              </div>

              {/* Descripción Técnica Completa */}
              <div className="rounded-lg border border-white/10 bg-[#111111] p-4">
                <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
                  <Tag className="size-3.5 text-industrial" />
                  <span>Descripción Técnica</span>
                </div>
                <p
                  className="text-xs leading-relaxed text-zinc-300 whitespace-pre-line"
                  data-testid="product-modal-description-text"
                >
                  {product.description || "Sin descripción técnica complementaria cargada."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="size-4 shrink-0 text-industrial" />
                <span>Banco de pruebas computarizado · 30 días de garantía escrita</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal con 2 Botones */}
        <DialogFooter className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t border-white/10 pt-4">
          {/* Botón 2: Consultar por WhatsApp (secundario con ícono) */}
          <Button
            variant="outline"
            className="h-11 sm:h-10 gap-2 border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/50 text-xs font-semibold transition-all w-full sm:w-auto"
            asChild
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="product-modal-whatsapp-btn"
            >
              <FaWhatsapp className="size-4 shrink-0 text-emerald-400" />
              <span>Consultar por WhatsApp</span>
            </a>
          </Button>

          {/* Botón 1: Agregar al pedido (principal) */}
          <Button
            variant="industrial"
            className="h-11 sm:h-10 gap-2 text-xs font-semibold w-full sm:w-auto"
            onClick={() => add(product)}
            data-testid="product-modal-add-cart-btn"
          >
            {cartQuantity > 0 ? (
              <>
                <Check className="size-4" />
                <span>En el pedido ({cartQuantity}) · Agregar otro</span>
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" />
                <span>Agregar al pedido</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailModal;
