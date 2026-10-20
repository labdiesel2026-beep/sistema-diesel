import { describe, expect, it, beforeEach } from "vitest";
import {
  loadCartFromStorage,
  saveCartToStorage,
  clearCartFromStorage,
  CART_STORAGE_KEY,
  cartCacheSchema,
} from "@/lib/cart-storage";
import type { CartCacheV1, CartItemCache } from "@/types/catalog";

// Mock de Storage en memoria para pruebas aisladas
class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();

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

describe("Cart Ephemeral Storage (T-06)", () => {
  let mockStorage: Storage;

  const validItems: CartItemCache[] = [
    {
      productId: "a0f1e2d3-1111-4000-8000-111111111111",
      quantity: 2,
      lastKnown: {
        name: "Inyector Amarok 2.0 TDI",
        oem: "0445110369",
      },
    },
    {
      productId: "a0f1e2d3-2222-4000-8000-222222222222",
      quantity: 1,
      lastKnown: {
        name: "Inyector Ranger 3.2 TDCi",
        oem: null,
      },
    },
  ];

  beforeEach(() => {
    mockStorage = new MemoryStorage();
  });

  it("valida e hidrata cache efimera descartando datos corruptos", () => {
    // 1. Storage vacío retorna contenedor inicial válido
    const emptyLoaded = loadCartFromStorage(mockStorage);
    expect(emptyLoaded).toEqual({ version: 1, items: [] });

    // 2. Guardar y recuperar datos válidos
    const saveResult = saveCartToStorage(validItems, mockStorage);
    expect(saveResult).toBe(true);

    const loaded = loadCartFromStorage(mockStorage);
    expect(loaded.version).toBe(1);
    expect(loaded.items).toHaveLength(2);
    expect(loaded.items[0]?.productId).toBe("a0f1e2d3-1111-4000-8000-111111111111");
    expect(loaded.items[0]?.quantity).toBe(2);

    // 3. JSON sintácticamente corrupto: debe purgar la clave y retornar vacío
    mockStorage.setItem(CART_STORAGE_KEY, "INVALID_JSON_{{bad_data");
    const corruptLoaded = loadCartFromStorage(mockStorage);
    expect(corruptLoaded).toEqual({ version: 1, items: [] });
    expect(mockStorage.getItem(CART_STORAGE_KEY)).toBeNull();

    // 4. Versión no soportada o incompatible (ej. version: 2): debe purgar
    mockStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 2, items: [] }));
    const incompatibleLoaded = loadCartFromStorage(mockStorage);
    expect(incompatibleLoaded).toEqual({ version: 1, items: [] });
    expect(mockStorage.getItem(CART_STORAGE_KEY)).toBeNull();

    // 5. UUID de producto inválido en el array: debe purgar
    mockStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [
          {
            productId: "not-a-valid-uuid",
            quantity: 1,
            lastKnown: { name: "Test", oem: null },
          },
        ],
      }),
    );
    const invalidUuidLoaded = loadCartFromStorage(mockStorage);
    expect(invalidUuidLoaded).toEqual({ version: 1, items: [] });
    expect(mockStorage.getItem(CART_STORAGE_KEY)).toBeNull();

    // 6. Cantidad inválida (0 o negativa): debe purgar
    mockStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [
          {
            productId: "a0f1e2d3-1111-4000-8000-111111111111",
            quantity: 0,
            lastKnown: { name: "Test", oem: null },
          },
        ],
      }),
    );
    const zeroQuantityLoaded = loadCartFromStorage(mockStorage);
    expect(zeroQuantityLoaded).toEqual({ version: 1, items: [] });
    expect(mockStorage.getItem(CART_STORAGE_KEY)).toBeNull();

    // 7. Claves espurias no permitidas (.strict()) para prevenir inyecciones de precio autoritativo
    mockStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: validItems,
        injectedPrice: 99999, // Campo prohibido por .strict()
      }),
    );
    const extraKeyLoaded = loadCartFromStorage(mockStorage);
    expect(extraKeyLoaded).toEqual({ version: 1, items: [] });
    expect(mockStorage.getItem(CART_STORAGE_KEY)).toBeNull();

    // 8. Limpieza explícita
    saveCartToStorage(validItems, mockStorage);
    expect(mockStorage.getItem(CART_STORAGE_KEY)).not.toBeNull();
    clearCartFromStorage(mockStorage);
    expect(mockStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });
});
