/**
 * Contexto y Máquina de Estado del Carrito de Consultas (React 19).
 * (Spec 003, RF-08, RF-12, Bloque 3 - Tarea T-07)
 *
 * Características:
 * - Operaciones atómicas: add, updateQuantity, changeQuantity, remove, clear.
 * - Consolida productos duplicados en una sola fila incrementando la cantidad.
 * - Asegura cantidad entera mayor o igual a 1 (no permite ceros ni negativos).
 * - Ausencia total de restricciones o simulaciones de inventario/stock (RF-12).
 * - Sincronización automática y reactiva con la caché efímera de localStorage.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { CartItemCache } from "@/types/catalog";
import { loadCartFromStorage, saveCartToStorage, clearCartFromStorage } from "@/lib/cart-storage";

export interface CatalogCartProductParam {
  id: string;
  name: string;
  oem?: string | null;
}

export interface CatalogCartContextValue {
  items: CartItemCache[];
  count: number;
  uniqueCount: number;
  add: (product: CatalogCartProductParam, quantityToAdd?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  changeQuantity: (productId: string, delta: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  getItemQuantity: (productId: string) => number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CatalogCartContext = createContext<CatalogCartContextValue | null>(null);

export interface CatalogCartProviderProps {
  children: ReactNode;
  initialItems?: CartItemCache[];
  storage?: Storage;
}

export function CatalogCartProvider({ children, initialItems, storage }: CatalogCartProviderProps) {
  // Inicialización lazy desde localStorage o items provistos para pruebas
  const [items, setItems] = useState<CartItemCache[]>(() => {
    if (initialItems) {
      return initialItems;
    }
    const cached = loadCartFromStorage(storage);
    return cached.items;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sincronización reactiva con almacenamiento efímero
  useEffect(() => {
    saveCartToStorage(items, storage);
  }, [items, storage]);

  /**
   * Agrega un producto al carrito.
   * Si ya existe, incrementa su cantidad en una única fila.
   */
  const add = (product: CatalogCartProductParam, quantityToAdd = 1) => {
    const safeAddQuantity = Math.max(1, Math.round(quantityToAdd));

    setItems((current) => {
      const existingIndex = current.findIndex((item) => item.productId === product.id);

      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + safeAddQuantity } : item,
        );
      }

      const newItem: CartItemCache = {
        productId: product.id,
        quantity: safeAddQuantity,
        lastKnown: {
          name: product.name.trim(),
          oem: product.oem ? product.oem.trim() : null,
        },
      };

      return [...current, newItem];
    });
  };

  /**
   * Asigna una cantidad absoluta para un producto, forzando un mínimo de 1 unidad.
   */
  const updateQuantity = (productId: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.round(quantity));

    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  };

  /**
   * Modifica la cantidad de forma relativa (+1, -1), asegurando un mínimo de 1 unidad.
   */
  const changeQuantity = (productId: string, delta: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  /**
   * Elimina un producto del carrito.
   */
  const remove = (productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  /**
   * Vacía el carrito por completo y purga el almacenamiento.
   */
  const clear = () => {
    setItems([]);
    clearCartFromStorage(storage);
  };

  /**
   * Retorna la cantidad seleccionada de un producto o 0 si no está en el carrito.
   */
  const getItemQuantity = (productId: string): number => {
    const found = items.find((item) => item.productId === productId);
    return found ? found.quantity : 0;
  };

  const count = items.reduce((total, item) => total + item.quantity, 0);
  const uniqueCount = items.length;

  return (
    <CatalogCartContext.Provider
      value={{
        items,
        count,
        uniqueCount,
        add,
        updateQuantity,
        changeQuantity,
        remove,
        clear,
        getItemQuantity,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CatalogCartContext.Provider>
  );
}

/**
 * Hook de acceso al contexto del carrito de catálogo.
 */
export function useCatalogCart(): CatalogCartContextValue {
  const context = useContext(CatalogCartContext);
  if (!context) {
    throw new Error("useCatalogCart debe ser utilizado dentro de un CatalogCartProvider");
  }
  return context;
}
