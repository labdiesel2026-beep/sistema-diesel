import { createContext, useContext, useState, type ReactNode } from 'react';
import { catalogProducts, type CatalogProduct } from '@/lib/catalog-data';

type CartItem = { product: CatalogProduct; quantity: number };
type CartContextValue = { items: CartItem[]; count: number; add: (product: CatalogProduct) => void; remove: (id: string) => void; changeQuantity: (id: string, delta: number) => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CatalogCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => catalogProducts.filter(product => ['amarok', 'hilux'].includes(product.id)).map(product => ({ product, quantity: 1 })));
  const add = (product: CatalogProduct) => setItems(current => current.some(item => item.product.id === product.id)
    ? current.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    : [...current, { product, quantity: 1 }]);
  const remove = (id: string) => setItems(current => current.filter(item => item.product.id !== id));
  const changeQuantity = (id: string, delta: number) => setItems(current => current.map(item => item.product.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  return <CartContext.Provider value={{ items, count: items.reduce((total, item) => total + item.quantity, 0), add, remove, changeQuantity }}>{children}</CartContext.Provider>;
}

export function useCatalogCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('Catalog cart requires its provider');
  return value;
}