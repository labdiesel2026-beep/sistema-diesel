import { Link } from '@tanstack/react-router';
import { Image, MessageCircle, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useCatalogCart } from '@/components/catalog-cart';
import { formatPrice } from '@/lib/catalog-data';

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { items, count, remove, changeQuantity } = useCatalogCart();
  const subtotal = items.reduce((total, item) => total + (item.product.price ?? 0) * item.quantity, 0);
  const hasQuote = items.some(item => item.product.price === null);
  const order = ['Hola, quisiera realizar este pedido:', ...items.map(({ product, quantity }) => `${quantity} × ${product.name} | OEM ${product.oem} | ${product.price === null ? 'A cotizar' : formatPrice(product.price * quantity)}`), `Subtotal${hasQuote ? ' de productos con precio' : ''}: ${formatPrice(subtotal)}`, ...(hasQuote ? ['Solicito cotización de los productos sin precio.'] : []), '¿Podrían confirmar compatibilidad y disponibilidad?'].join('\n');
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
    <SheetHeader className="border-b border-border px-6 py-7 text-left"><SheetTitle className="flex items-center gap-3 font-display text-2xl"><ShoppingCart className="size-6 text-primary" />Tu carrito <span className="text-sm font-normal text-muted-foreground">({count})</span></SheetTitle><SheetDescription>Laboratorio Diésel · Pedido de muestra</SheetDescription></SheetHeader>
    <div className="min-h-0 flex-1 overflow-y-auto px-6">
      {items.map(({ product, quantity }) => <article key={product.id} className="flex gap-4 border-b border-border py-6">
        <div role="img" aria-label={`Foto de muestra de ${product.name}`} className="flex size-18 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"><Image className="size-7 stroke-1" /></div>
        <div className="min-w-0 flex-1"><p className="mb-1 text-[10px] font-bold uppercase text-primary">{product.brand} · {product.condition}</p><h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3><p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">OEM {product.oem}</p><p className="mt-3 text-sm font-bold">{product.price === null ? 'A cotizar' : formatPrice(product.price * quantity)}</p>
          <div className="mt-4 flex items-center justify-between gap-2"><div className="flex items-center rounded-md border border-border"><Button variant="ghost" size="icon" disabled={quantity === 1} aria-label={`Reducir cantidad de ${product.name}`} onClick={() => changeQuantity(product.id, -1)}><Minus /></Button><span className="w-7 text-center text-xs font-bold">{quantity}</span><Button variant="ghost" size="icon" aria-label={`Aumentar cantidad de ${product.name}`} onClick={() => changeQuantity(product.id, 1)}><Plus /></Button></div><Button variant="ghost" size="icon" aria-label={`Eliminar ${product.name}`} title="Eliminar producto" className="text-muted-foreground hover:text-destructive" onClick={() => remove(product.id)}><Trash2 /></Button></div>
        </div>
      </article>)}
      {!items.length && <div className="py-16 text-center"><ShoppingCart className="mx-auto mb-4 size-10 text-muted-foreground" /><h3 className="font-display text-2xl font-semibold">Tu carrito está vacío</h3><Button variant="industrial" className="mt-6" asChild><Link to="/catalogo" onClick={() => onOpenChange(false)}>Ver catálogo</Link></Button></div>}
    </div>
    {!!items.length && <div className="border-t border-border bg-secondary/50 p-6"><div className="flex items-center justify-between gap-3"><span className="font-semibold">Subtotal</span><span aria-live="polite" className="font-display text-2xl font-bold">{formatPrice(subtotal)}</span></div><p className="mb-5 mt-2 text-xs leading-5 text-muted-foreground">{hasQuote ? 'No incluye productos a cotizar. ' : ''}Envío a confirmar.</p><Button variant="whatsapp" asChild className="h-14 w-full px-3 text-sm font-bold"><a href={`https://wa.me/?text=${encodeURIComponent(order)}`} target="_blank" rel="noopener noreferrer"><MessageCircle />Enviar Pedido a WhatsApp</a></Button></div>}
  </SheetContent></Sheet>;
}