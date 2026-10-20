import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CatalogCartProvider, useCatalogCart } from "@/context/catalog-cart-context";
import type { ReactNode } from "react";

// Mock Storage en memoria
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe("Catalog Cart Context (T-07)", () => {
  const createWrapper = (storage = new MemoryStorage()) => {
    return ({ children }: { children: ReactNode }) => (
      <CatalogCartProvider storage={storage}>{children}</CatalogCartProvider>
    );
  };

  it("gestiona operaciones del carrito sin restricciones de inventario", () => {
    const storage = new MemoryStorage();
    const { result } = renderHook(() => useCatalogCart(), {
      wrapper: createWrapper(storage),
    });

    // 1. Estado inicial vacío
    expect(result.current.items).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.uniqueCount).toBe(0);

    // 2. Agregar primer producto
    const prod1 = {
      id: "a0f1e2d3-1111-4000-8000-111111111111",
      name: "Inyector Amarok 2.0 TDI",
      oem: "0445110369",
    };

    act(() => {
      result.current.add(prod1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(1);
    expect(result.current.uniqueCount).toBe(1);
    expect(result.current.getItemQuantity(prod1.id)).toBe(1);

    // 3. Agregar el mismo producto duplica la cantidad en una sola fila
    act(() => {
      result.current.add(prod1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(2);
    expect(result.current.uniqueCount).toBe(1);
    expect(result.current.getItemQuantity(prod1.id)).toBe(2);

    // 4. Agregar cantidad masiva (sin límite ni restricción de stock)
    act(() => {
      result.current.add(prod1, 500);
    });
    expect(result.current.getItemQuantity(prod1.id)).toBe(502);

    // 5. Agregar un segundo producto
    const prod2 = {
      id: "a0f1e2d3-2222-4000-8000-222222222222",
      name: "Inyector Ranger 3.2 TDCi",
      oem: "28236381",
    };

    act(() => {
      result.current.add(prod2, 4);
    });

    expect(result.current.uniqueCount).toBe(2);
    expect(result.current.count).toBe(506);
    expect(result.current.getItemQuantity(prod2.id)).toBe(4);

    // 6. Actualizar cantidad absoluta (updateQuantity)
    act(() => {
      result.current.updateQuantity(prod1.id, 10);
    });
    expect(result.current.getItemQuantity(prod1.id)).toBe(10);

    // Intentar forzar cantidad cero o negativa debe fijarse en 1 unidad mínima
    act(() => {
      result.current.updateQuantity(prod1.id, 0);
    });
    expect(result.current.getItemQuantity(prod1.id)).toBe(1);

    act(() => {
      result.current.updateQuantity(prod1.id, -5);
    });
    expect(result.current.getItemQuantity(prod1.id)).toBe(1);

    // 7. Modificar cantidad relativa (changeQuantity)
    act(() => {
      result.current.changeQuantity(prod1.id, 2);
    });
    expect(result.current.getItemQuantity(prod1.id)).toBe(3);

    act(() => {
      result.current.changeQuantity(prod1.id, -100);
    });
    expect(result.current.getItemQuantity(prod1.id)).toBe(1); // Mínimo 1

    // 8. Eliminar producto individual (remove)
    act(() => {
      result.current.remove(prod1.id);
    });
    expect(result.current.uniqueCount).toBe(1);
    expect(result.current.getItemQuantity(prod1.id)).toBe(0);
    expect(result.current.getItemQuantity(prod2.id)).toBe(4);

    // 9. Control del Drawer lateral
    expect(result.current.isDrawerOpen).toBe(false);
    act(() => {
      result.current.setIsDrawerOpen(true);
    });
    expect(result.current.isDrawerOpen).toBe(true);

    // 10. Vaciar carrito completo (clear)
    act(() => {
      result.current.clear();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.uniqueCount).toBe(0);
  });

  it("arroja error si el hook useCatalogCart se usa fuera del provider", () => {
    expect(() => {
      renderHook(() => useCatalogCart());
    }).toThrow("useCatalogCart debe ser utilizado dentro de un CatalogCartProvider");
  });
});
