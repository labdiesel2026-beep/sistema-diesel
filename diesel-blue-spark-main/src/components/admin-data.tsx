import { createContext, useContext, useState, type ReactNode } from 'react';
import { catalogProducts, type CatalogProduct } from '@/lib/catalog-data';

export type AdminProduct = CatalogProduct & { visible: boolean };
type AdminContextValue = { products: AdminProduct[]; save: (product: AdminProduct) => void; remove: (id: string) => void };
const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(() => catalogProducts.map((product, index) => ({ ...product, visible: index !== 3 })));
  const save = (product: AdminProduct) => setProducts(current => current.some(item => item.id === product.id) ? current.map(item => item.id === product.id ? product : item) : [...current, product]);
  const remove = (id: string) => setProducts(current => current.filter(item => item.id !== id));
  return <AdminContext.Provider value={{ products, save, remove }}>{children}</AdminContext.Provider>;
}

export function useAdminProducts() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('Admin requires its provider');
  return value;
}