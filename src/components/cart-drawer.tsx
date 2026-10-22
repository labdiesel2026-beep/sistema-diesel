import { Link } from "@tanstack/react-router";
import { Image, MessageCircle, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCatalogCart } from "@/components/catalog-cart";
import { formatPrice } from "@/lib/catalog-data";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { items, count, remove, changeQuantity } = useCatalogCart();
  const subtotal = items.reduce(
    (total, item) => total + (item.product.price ?? 0) * item.quantity,
    0,
  );
  const hasQuote = items.some((item) => item.product.price === null);
  const order = [
    "Hola, quisiera realizar este pedido:",
    ...items.map(
      ({ product, quantity }) =>
        `${quantity} × ${product.name} | OEM ${product.oem} | ${product.price === null ? "A cotizar" : formatPrice(product.price * quantity)}`,
    ),
    `Subtotal${hasQuote ? " de productos con precio" : ""}: ${formatPrice(subtotal)}`,
    ...(hasQuote ? ["Solicito cotización de los productos sin precio."] : []),
    "¿Podrían confirmar compatibilidad y disponibilidad?",
  ].join("\n");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg bg-canvas text-white border-l border-white/10">
        <SheetHeader className="border-b border-white/10 px-6 py-7 text-left bg-canvas">
          <SheetTitle className="flex items-center gap-3 font-display text-2xl text-white">
            <ShoppingCart className="size-6 text-industrial" />
            Tu carrito <span className="text-sm font-normal text-zinc-400">({count})</span>
          </SheetTitle>
          <SheetDescription className="text-zinc-400">Laboratorio Diésel · Pedido de muestra</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2 bg-canvas">
          {items.map(({ product, quantity }) => (
            <article key={product.id} className="flex gap-4 border border-white/10 py-5 px-4 my-3 rounded-xl bg-[#111111] text-white">
              <div
                role="img"
                aria-label={`Foto de muestra de ${product.name}`}
                className="flex size-18 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 text-zinc-400"
              >
                <Image className="size-7 stroke-1" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-bold uppercase text-industrial">
                  {product.brand} · {product.condition}
                </p>
                <h3 className="font-display text-lg font-semibold leading-tight text-white">{product.name}</h3>
                <p className="mt-2 break-all font-mono text-[11px] text-zinc-400">
                  OEM {product.oem}
                </p>
                <p className="mt-3 text-sm font-bold text-white">
                  {product.price === null ? "A cotizar" : formatPrice(product.price * quantity)}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center rounded-md border border-white/10 bg-zinc-950">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={quantity === 1}
                      aria-label={`Reducir cantidad de ${product.name}`}
                      onClick={() => changeQuantity(product.id, -1)}
                      className="text-zinc-300 hover:text-white"
                    >
                      <Minus />
                    </Button>
                    <span className="w-7 text-center text-xs font-bold text-white">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Aumentar cantidad de ${product.name}`}
                      onClick={() => changeQuantity(product.id, 1)}
                      className="text-zinc-300 hover:text-white"
                    >
                      <Plus />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${product.name}`}
                    title="Eliminar producto"
                    className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => remove(product.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {!items.length && (
            <div className="py-16 text-center">
              <ShoppingCart className="mx-auto mb-4 size-10 text-zinc-500" />
              <h3 className="font-display text-2xl font-semibold text-white">Tu carrito está vacío</h3>
              <Button variant="industrial" className="mt-6" asChild>
                <Link to="/catalogo" onClick={() => onOpenChange(false)}>
                  Ver catálogo
                </Link>
              </Button>
            </div>
          )}
        </div>
        {!!items.length && (
          <div className="border-t border-white/10 bg-zinc-900/90 p-6">
            <div className="flex items-center justify-between gap-3 text-white">
              <span className="font-semibold">Subtotal</span>
              <span aria-live="polite" className="font-display text-2xl font-bold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mb-5 mt-2 text-xs leading-5 text-zinc-400">
              {hasQuote ? "No incluye productos a cotizar. " : ""}Envío a confirmar.
            </p>
            <Button variant="whatsapp" asChild className="h-14 w-full px-3 text-sm font-bold">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(order)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle />
                Enviar Pedido a WhatsApp
              </a>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
