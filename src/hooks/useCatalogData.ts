import { useState, useEffect, useCallback } from "react";
import { catalogService } from "@/services/catalog-service";
import type { CatalogProduct, CatalogBrand, CatalogCategory } from "@/types/catalog";

export interface CachedCatalogState {
  products: CatalogProduct[];
  brands: CatalogBrand[];
  categories: CatalogCategory[];
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 segundos staleTime
const SESSION_STORAGE_KEY = "laboratorio_diesel_catalog_cache_v1";

// Singleton en memoria del módulo (Stale-While-Revalidate)
let memoryCache: CachedCatalogState | null = null;
let activeFetchPromise: Promise<CachedCatalogState> | null = null;

function loadFromSessionStorage(): CachedCatalogState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.products) &&
      Array.isArray(parsed.brands) &&
      Array.isArray(parsed.categories)
    ) {
      return parsed;
    }
  } catch {
    // Silenciar error en storage restringido
  }
  return null;
}

function saveToSessionStorage(cache: CachedCatalogState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Quota superada o navegación privada
  }
}

/**
 * Precarga y revalida en memoria los datos del catálogo.
 */
export async function prefetchCatalogData(): Promise<CachedCatalogState> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache;
  }

  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const [products, brands, categories] = await Promise.all([
        catalogService.getVisibleProducts(),
        catalogService.getBrands(),
        catalogService.getCategories(),
      ]);

      const newState: CachedCatalogState = {
        products,
        brands,
        categories,
        timestamp: Date.now(),
      };

      memoryCache = newState;
      saveToSessionStorage(newState);
      return newState;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}

/**
 * Hook para consumo reactivo del catálogo con soporte Stale-While-Revalidate.
 */
export function useCatalogData(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  const [data, setData] = useState<{
    products: CatalogProduct[];
    brands: CatalogBrand[];
    categories: CatalogCategory[];
  }>(() => {
    if (memoryCache) {
      return {
        products: memoryCache.products,
        brands: memoryCache.brands,
        categories: memoryCache.categories,
      };
    }
    const sessionCached = loadFromSessionStorage();
    if (sessionCached) {
      memoryCache = sessionCached;
      return {
        products: sessionCached.products,
        brands: sessionCached.brands,
        categories: sessionCached.categories,
      };
    }
    return { products: [], brands: [], categories: [] };
  });

  const hasImmediateData = data.products.length > 0;
  const isStale = !memoryCache || Date.now() - memoryCache.timestamp > CACHE_TTL_MS;

  const [isLoading, setIsLoading] = useState(!hasImmediateData);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (data.products.length === 0) {
        setIsLoading(true);
      }
      const fresh = await prefetchCatalogData();
      setData({
        products: fresh.products,
        brands: fresh.brands,
        categories: fresh.categories,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [data.products.length]);

  useEffect(() => {
    if (!enabled) return;

    if (isStale || data.products.length === 0) {
      refresh();
    }
  }, [enabled, isStale, refresh, data.products.length]);

  return {
    products: data.products,
    brands: data.brands,
    categories: data.categories,
    isLoading,
    error,
    refresh,
  };
}

export default useCatalogData;

