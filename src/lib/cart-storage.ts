/**
 * Módulo de Almacenamiento Efímero en localStorage para el Carrito de Consultas.
 * (Spec 003, RF-08, RNF-05, RNF-07, docs/constitution.md §5, Tarea T-06)
 *
 * Principio 5: localStorage es exclusivamente caché no autoritativa de intención de compra.
 * Fail-Fast Zod: Todo dato leído de localStorage se valida estrictamente. Si está corrupto
 * o la versión no es reconocida, se purga de inmediato y se retorna un carrito vacío.
 */

import { z } from "zod";
import type { CartCacheV1, CartItemCache } from "@/types/catalog";

export const CART_STORAGE_KEY = "laboratorio_diesel_cart_cache_v1";

/**
 * Esquema Zod estricto para un ítem almacenado en la caché del carrito.
 */
export const cartItemCacheSchema = z
  .object({
    productId: z.string().uuid("Identificador UUID de producto inválido"),
    quantity: z
      .number()
      .int("La cantidad debe ser un número entero")
      .positive("La cantidad debe ser mayor a 0"),
    lastKnown: z
      .object({
        name: z.string().trim().min(1, "El nombre del producto no puede estar vacío"),
        oem: z.string().trim().nullable(),
      })
      .strict(),
  })
  .strict();

/**
 * Esquema Zod estricto para el contenedor versionado de la caché del carrito.
 */
export const cartCacheSchema = z
  .object({
    version: z.literal(1),
    items: z.array(cartItemCacheSchema),
  })
  .strict();

function getStorage(customStorage?: Storage): Storage | null {
  if (customStorage) return customStorage;
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Lee e hidrata el estado del carrito desde localStorage.
 * Si el contenido no existe, está corrupto o no cumple el esquema estricto,
 * purga la clave y devuelve un estado vacío válido con versión 1.
 */
export function loadCartFromStorage(customStorage?: Storage): CartCacheV1 {
  const emptyState: CartCacheV1 = { version: 1, items: [] };
  const storage = getStorage(customStorage);
  if (!storage) {
    return emptyState;
  }

  try {
    const rawData = storage.getItem(CART_STORAGE_KEY);
    if (!rawData) {
      return emptyState;
    }

    const parsedJson = JSON.parse(rawData);
    const validationResult = cartCacheSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      // Datos manipulados, corruptos o versión incompatible -> Purga defensiva
      storage.removeItem(CART_STORAGE_KEY);
      return emptyState;
    }

    return validationResult.data;
  } catch {
    // Error en JSON.parse u operaciones de almacenamiento
    try {
      storage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Silenciar errores secundarios en entornos sin soporte de storage
    }
    return emptyState;
  }
}

/**
 * Valida y persiste la caché del carrito en localStorage.
 * Acepta tanto el contenedor { version: 1, items: [...] } como un array plano de ítems.
 */
export function saveCartToStorage(
  payload: CartCacheV1 | CartItemCache[],
  customStorage?: Storage,
): boolean {
  const storage = getStorage(customStorage);
  if (!storage) {
    return false;
  }

  const container: CartCacheV1 = Array.isArray(payload) ? { version: 1, items: payload } : payload;

  const validationResult = cartCacheSchema.safeParse(container);
  if (!validationResult.success) {
    return false;
  }

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(validationResult.data));
    return true;
  } catch {
    return false;
  }
}

/**
 * Elimina la clave del carrito de localStorage.
 */
export function clearCartFromStorage(customStorage?: Storage): void {
  const storage = getStorage(customStorage);
  if (storage) {
    try {
      storage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignorar fallos de acceso en entornos restringidos
    }
  }
}
