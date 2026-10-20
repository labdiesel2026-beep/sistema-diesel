/**
 * Servicio de Consumo HTTP para la Landing Page (Fase 6, Bloque 7, Tarea 7.1).
 * (RF-07, RNF-03, RNF-05, CL-02)
 *
 * Encapsula la consulta pública a los productos destacados con tipado estricto
 * y captura de excepciones silenciosa (retornando [] ante errores de red o HTTP 500).
 */

import { api } from "@/lib/api";

export interface FeaturedProductItem {
  id: string;
  name: string;
  brandName?: string | undefined;
  oem: string;
  condition: "Nuevo" | "Reacondicionado" | "Usado" | string;
  price: number | null;
  showPrice: boolean;
  vehicleCompatibility?: string | undefined;
  imageUrl?: string | null | undefined;
  isFeatured?: boolean | undefined;
  featuredAt?: string | null | undefined;
}

/**
 * Consulta la lista de productos destacados activos desde GET /api/products/featured.
 * Si la petición falla por error de servidor (500), timeout o caída de red,
 * captura silenciosamente la excepción y retorna un array vacío [] (RF-07, CA-07.2, CL-02).
 */
export async function fetchFeaturedProducts(): Promise<FeaturedProductItem[]> {
  try {
    const products = await api.get<FeaturedProductItem[]>("/api/products/featured");
    if (!Array.isArray(products)) {
      return [];
    }
    return products;
  } catch {
    // Degradación elegante silenciosa ante fallos de servidor o de conexión (RNF-03, CL-02)
    return [];
  }
}

export const landingService = {
  fetchFeaturedProducts,
};

export default landingService;
