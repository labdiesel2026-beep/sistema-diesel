/**
 * Servicio de Enriquecimiento y Revalidación Autorizada del Carrito.
 * (Spec 003, RF-07, RF-08, RF-10, RF-11, docs/constitution.md §5, Tarea T-08)
 *
 * Principio 5 (Persistencia como fuente de verdad):
 * Contrasta los identificadores y cantidades guardados en la caché efímera de localStorage
 * contra los datos autoritativos y frescos obtenidos del backend (PostgreSQL).
 *
 * Reglas de negocio:
 * 1. Productos con visible === true: se actualizan nombre, marca, foto, precio y OEM a los valores actuales.
 * 2. Productos con visible === false (pausados/ocultados): se conservan en la consulta del usuario pero
 *    se marcan con requiresReconfirmation: true y precio forzado a null ("A cotizar").
 * 3. Productos eliminados físicamente de la base de datos: se identifican mediante lastKnown,
 *    se marcan con requiresReconfirmation: true, isDeletedOrUnavailable: true y precio null.
 */

import { catalogService } from "@/services/catalog-service";
import type {
  CartItemCache,
  EnrichedCartItem,
  CatalogProduct,
  CatalogBrand,
} from "@/types/catalog";

export type BrandsMapSource = CatalogBrand[] | Map<string, string> | Record<string, string>;

/**
 * Función pura que contrasta los ítems de la caché contra un catálogo fresco en memoria.
 */
export function enrichCartItems(
  itemsCache: CartItemCache[],
  freshProducts: CatalogProduct[],
  brandsSource?: BrandsMapSource,
): EnrichedCartItem[] {
  if (!itemsCache.length) {
    return [];
  }

  // 1. Construir mapa de productos por UUID
  const productMap = new Map<string, CatalogProduct>();
  for (const product of freshProducts) {
    productMap.set(product.id, product);
  }

  // 2. Construir mapa de marcas por UUID
  const brandMap = new Map<string, string>();
  if (brandsSource) {
    if (brandsSource instanceof Map) {
      for (const [k, v] of brandsSource.entries()) {
        brandMap.set(k, v);
      }
    } else if (Array.isArray(brandsSource)) {
      for (const b of brandsSource) {
        brandMap.set(b.id, b.name);
      }
    } else {
      for (const [k, v] of Object.entries(brandsSource)) {
        brandMap.set(k, v);
      }
    }
  }

  // 3. Enriquecer cada ítem
  return itemsCache.map((item) => {
    const fresh = productMap.get(item.productId);

    // Caso A: El producto ya no existe en la base de datos (fue eliminado)
    if (!fresh) {
      return {
        productId: item.productId,
        quantity: item.quantity,
        name: item.lastKnown.name,
        oem: item.lastKnown.oem,
        imageUrl: "",
        brandName: "No disponible",
        condition: "Usado",
        price: null,
        showPrice: false,
        visible: false,
        requiresReconfirmation: true,
        isDeletedOrUnavailable: true,
      };
    }

    const resolvedBrandName = brandMap.get(fresh.brandId) || "";

    // Caso B: El producto existe pero fue ocultado en el panel administrativo
    if (!fresh.visible) {
      return {
        productId: fresh.id,
        quantity: item.quantity,
        name: fresh.name,
        oem: fresh.oem,
        imageUrl: fresh.imageUrl,
        brandName: resolvedBrandName,
        condition: fresh.condition,
        price: null, // Forzado a null para cotizar
        showPrice: false,
        visible: false,
        requiresReconfirmation: true,
        isDeletedOrUnavailable: false,
      };
    }

    // Caso C: Producto activo, visible y plenamente vigente
    return {
      productId: fresh.id,
      quantity: item.quantity,
      name: fresh.name,
      oem: fresh.oem,
      imageUrl: fresh.imageUrl,
      brandName: resolvedBrandName,
      condition: fresh.condition,
      price: fresh.price,
      showPrice: fresh.showPrice,
      visible: true,
      requiresReconfirmation: false,
      isDeletedOrUnavailable: false,
    };
  });
}

/**
 * Orquestador asíncrono que consulta los datos frescos a la API
 * y enriquece los ítems del carrito.
 */
export async function revalidateCartItems(
  itemsCache: CartItemCache[],
): Promise<EnrichedCartItem[]> {
  if (!itemsCache.length) {
    return [];
  }

  const [freshProducts, brands] = await Promise.all([
    catalogService.getAllProductsForValidation(),
    catalogService.getBrands(),
  ]);

  return enrichCartItems(itemsCache, freshProducts, brands);
}
