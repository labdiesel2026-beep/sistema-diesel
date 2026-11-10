/**
 * Drawer Lateral del Carrito de Consultas con Revalidación Activa.
 * (Spec 003, RF-08, RF-10, RF-11, RF-12, Bloque 5 - Tarea T-15)
 *
 * Características:
 * - Conexión directa con useCatalogCart() (estado efímero sincronizado).
 * - Revalidación activa al abrir mediante revalidateCartItems() contra el backend.
 * - Advertencias de vigencia para productos modificados, ocultados (visible: false) o eliminados.
 * - Controles de cantidad (+/-) y eliminación atómica.
 * - Subtotal dinámico de productos con precio público y discriminación de ítems a cotizar.
 * - Checkout directo estructurado hacia WhatsApp según RF-10 sin simulación de existencias.
 */

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ProductImageWithFallback } from "@/components/catalog/ProductImageWithFallback";
import { useCatalogCart } from "@/context/catalog-cart-context";
import { revalidateCartItems } from "@/lib/cart-revalidation";
import { resolveImageUrl } from "@/lib/formatters";
import { formatPrice, generateCartWhatsAppUrl } from "@/lib/catalog-whatsapp";
import type { EnrichedCartItem } from "@/types/catalog";

export interface CartTotalsSummary {
  numericalTotal: number;
  hasPricedItems: boolean;
  quoteItemsCount: number;
  displayLabel: string;
}

/**
 * Calcula de forma determinista y estricta los subtotales numéricos y discriminación
 * de repuestos a cotizar para el carrito mixto (Spec 009, RF-09, CL-03, Principio 5).
 */
export function calculateCartTotals(items: EnrichedCartItem[]): CartTotalsSummary {
  let numericalTotal = 0;
  let hasPricedItems = false;
  let quoteItemsCount = 0;

  for (const item of items) {
    const isPriced =
      !item.requiresReconfirmation &&
      item.showPrice &&
      item.price !== null &&
      item.price > 0;

    if (isPriced) {
      numericalTotal += (item.price as number) * item.quantity;
      hasPricedItems = true;
    } else {
      quoteItemsCount += item.quantity;
    }
  }

  let displayLabel = "";
  if (hasPricedItems && quoteItemsCount > 0) {
    displayLabel = `${formatPrice(numericalTotal)} + ÍTEMS A COTIZAR`;
  } else if (hasPricedItems && quoteItemsCount === 0) {
    displayLabel = formatPrice(numericalTotal);
  } else {
    displayLabel = "PRESUPUESTO A CONFIRMAR";
  }

  return { numericalTotal, hasPricedItems, quoteItemsCount, displayLabel };
}

export interface CartDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, count, changeQuantity, remove, clear, isDrawerOpen, setIsDrawerOpen } =
    useCatalogCart();

  const isOpen = open !== undefined ? open : isDrawerOpen;
  const handleOpenChange = onOpenChange !== undefined ? onOpenChange : setIsDrawerOpen;

  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Revalidación activa al abrir el drawer o ante cambios en los ítems
  useEffect(() => {
    let isMounted = true;

    if (isOpen && items.length > 0) {
      setIsValidating(true);
      revalidateCartItems(items)
        .then((fresh) => {
          if (isMounted) {
            setEnrichedItems(fresh);
            setIsValidating(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error("Fallo al revalidar carrito:", err);
            setIsValidating(false);
          }
        });
    } else if (items.length === 0) {
      setEnrichedItems([]);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, items]);

  // Sincronizar cantidades locales activas con ítems enriquecidos
  const displayedItems: EnrichedCartItem[] =
    enrichedItems.length > 0
      ? enrichedItems
          .map((enriched) => {
            const live = items.find((i) => i.productId === enriched.productId);
            return live ? { ...enriched, quantity: live.quantity } : enriched;
          })
          .filter((enriched) => items.some((i) => i.productId === enriched.productId))
      : items.map((item) => {
          const snap = item.productSnapshot;
          const lk = item.lastKnown;
          const priceVal = snap?.price !== undefined ? snap.price : (lk.price ?? null);
          const showPriceVal =
            snap?.showPrice !== undefined
              ? snap.showPrice
              : lk.showPrice !== undefined
                ? lk.showPrice
                : priceVal !== null;

          return {
            productId: item.productId,
            quantity: item.quantity,
            name: snap?.name || lk.name,
            oem: snap?.oemCode ?? lk.oem ?? null,
            imageUrl: snap?.imageUrl || lk.imageUrl || "",
            brandName: snap?.brandName || lk.brandName || "",
            condition: (snap?.condition || lk.condition || "Nuevo") as any,
            price: priceVal,
            showPrice: Boolean(showPriceVal),
            visible: snap?.isVisible !== undefined ? snap.isVisible : (lk.visible ?? true),
            requiresReconfirmation: false,
            isDeletedOrUnavailable: false,
          };
        });

  // Cálculos de subtotal estricto y desglose dinámico (RF-09, CL-03)
  const cartSummary = useMemo(() => calculateCartTotals(displayedItems), [displayedItems]);
  const hasReconfirmation = displayedItems.some((item) => item.requiresReconfirmation);

  const whatsappCheckoutUrl =
    displayedItems.length > 0
      ? generateCartWhatsAppUrl(displayedItems, undefined, { tagCotizar: true })
      : "";

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg bg-canvas text-white border-l border-white/10"
        data-testid="cart-drawer-sheet"
      >
        {/* Cabecera del Carrito */}
        <SheetHeader className="border-b border-white/10 px-6 py-5 text-left bg-canvas">
          <div className="flex items-center justify-between gap-2 pr-8">
            <SheetTitle className="flex items-center gap-2.5 font-display text-lg sm:text-xl text-white min-w-0">
              <ShoppingCart className="size-5 text-industrial shrink-0" />
              <span className="truncate">Tu Carrito de Consultas</span>
              <span className="rounded-full bg-industrial/20 px-2 py-0.5 font-mono text-xs font-bold text-industrial shrink-0">
                {count}
              </span>
            </SheetTitle>

            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="shrink-0 text-xs px-2.5 py-1.5 h-8 gap-1.5 text-muted-foreground hover:text-destructive"
                aria-label="Vaciar carrito"
                data-testid="clear-cart-button"
              >
                <RotateCcw className="size-3.5" />
                Vaciar
              </Button>
            )}
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Cotización unificada directa vía WhatsApp · Sin reserva de existencias
          </SheetDescription>
        </SheetHeader>

        {/* Alerta Global de Reconfirmación */}
        {hasReconfirmation && (
          <div
            className="flex items-start gap-2.5 border-b border-amber-500/20 bg-amber-500/10 px-6 py-3 text-xs text-amber-700 dark:text-amber-400"
            data-testid="cart-reconfirmation-banner"
          >
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <p>
              Uno o más repuestos han cambiado su estado de publicación y requerirán confirmación
              directa de precio o disponibilidad con el taller.
            </p>
          </div>
        )}

        {/* Lista de Ítems */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2 bg-canvas space-y-3">
          {items.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              data-testid="empty-cart-state"
            >
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-card text-zinc-500 border border-white/10">
                <ShoppingCart className="size-8 stroke-1" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Tu carrito de consultas está vacío
              </h3>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
                Explorá el catálogo de repuestos diésel y agregá piezas para enviar una solicitud de
                cotización consolidada por WhatsApp.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {displayedItems.map((item) => (
                <motion.article
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex gap-4 py-5 px-4 my-2 overflow-hidden rounded-xl border border-white/10 bg-[#111111] text-white"
                  data-testid={`cart-item-${item.productId}`}
                >
                  {/* Imagen del Ítem */}
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-canvas">
                    <ProductImageWithFallback
                      src={resolveImageUrl(item.imageUrl, { width: 160 })}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  </div>

                  {/* Detalles Técnicos */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {item.brandName && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-industrial">
                          {item.brandName}
                        </span>
                      )}
                      <span className="rounded-md border border-white/10 bg-zinc-800 px-1.5 py-0.2 text-[10px] font-semibold text-zinc-300">
                        {item.condition}
                      </span>
                    </div>

                    <h4 className="font-display text-base font-semibold leading-tight text-white line-clamp-2">
                      {item.name}
                    </h4>

                    {item.oem && (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">OEM {item.oem}</p>
                    )}

                    {/* Advertencia Específica de Vigencia */}
                    {item.requiresReconfirmation && (
                      <div
                        className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
                        data-testid={`badge-reconfirmation-${item.productId}`}
                      >
                        <AlertTriangle className="size-3" />
                        <span>Requiere reconfirmación</span>
                      </div>
                    )}

                    {/* Precio / A cotizar */}
                    <div className="mt-2">
                      {item.requiresReconfirmation ? (
                        <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                          [A Cotizar]
                        </span>
                      ) : item.showPrice && item.price !== null && item.price > 0 ? (
                        <div>
                          <span className="text-white font-extrabold text-sm sm:text-base">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                              ({formatPrice(item.price)} ARS c/u)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                          [A Cotizar]
                        </span>
                      )}
                    </div>

                    {/* Controles de Cantidad y Eliminación */}
                    <div className="mt-3 flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center shrink-0 rounded-lg border border-border bg-card">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 w-8 h-8 shrink-0 text-foreground hover:bg-muted"
                          disabled={item.quantity <= 1}
                          aria-label={`Reducir cantidad de ${item.name}`}
                          data-testid={`decrease-quantity-${item.productId}`}
                          onClick={() => changeQuantity(item.productId, -1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span
                          className="w-11 text-center font-mono text-xs font-bold text-foreground select-none"
                          data-testid={`quantity-${item.productId}`}
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 w-8 h-8 shrink-0 text-foreground hover:bg-muted"
                          aria-label={`Aumentar cantidad de ${item.name}`}
                          data-testid={`increase-quantity-${item.productId}`}
                          onClick={() => changeQuantity(item.productId, 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 w-8 h-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label={`Eliminar ${item.name} del carrito`}
                        data-testid={`remove-item-${item.productId}`}
                        onClick={() => remove(item.productId)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer del Carrito con Subtotal y Checkout */}
        {items.length > 0 && (
          <div className="border-t border-white/10 bg-zinc-900/90 p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-zinc-400">
                  {cartSummary.hasPricedItems ? "Subtotal estimado:" : "Presupuesto:"}
                </span>
                <span
                  className="font-display text-lg font-bold text-white"
                  data-testid="cart-subtotal"
                >
                  {cartSummary.hasPricedItems ? (
                    <>
                      <span>{formatPrice(cartSummary.numericalTotal)}</span>
                      {cartSummary.quoteItemsCount > 0 && (
                        <span className="ml-1.5 text-xs font-mono font-bold text-industrial uppercase">
                          + ÍTEMS A COTIZAR
                        </span>
                      )}
                    </>
                  ) : (
                    "PRESUPUESTO A CONFIRMAR"
                  )}
                </span>
              </div>

              {cartSummary.quoteItemsCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  * La solicitud incluye repuestos para cotizar al día.
                </p>
              )}

              <p className="text-[11px] text-muted-foreground leading-tight">
                El envío a WhatsApp no realiza cobros ni reserva stock físico automáticamente.
              </p>
            </div>

            <Button
              variant="whatsapp"
              className="relative overflow-hidden h-12 w-full gap-2.5 text-sm font-bold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25"
              asChild
            >
              <a
                href={whatsappCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Enviar pedido del carrito por WhatsApp"
                data-testid="whatsapp-checkout-button"
                className="relative overflow-hidden flex items-center justify-center gap-2.5"
              >
                {/* Shimmer Effect */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  aria-hidden="true"
                />
                <FaWhatsapp className="size-5 shrink-0 text-white" />
                <span>Consultar por WhatsApp</span>
              </a>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
