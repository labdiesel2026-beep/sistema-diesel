/**
 * Motor de Búsqueda Técnica y Normalización para el Catálogo de Repuestos Diésel.
 * (Spec 003, RF-03, Tarea T-04)
 *
 * Características:
 * - Normalización Unicode NFD (insensible a acentos y mayúsculas).
 * - Búsqueda parcial sobre nombre, código OEM, marca y compatibilidad vehicular.
 * - Priorización máxima (orden 0) para coincidencias en código OEM.
 */

import type { CatalogProduct, CatalogBrand } from "@/types/catalog";

/**
 * Normaliza una cadena de texto para comparaciones de búsqueda:
 * - Descompone caracteres Unicode (NFD).
 * - Elimina marcas diacríticas (tildes, diéresis).
 * - Convierte a minúsculas y elimina espacios al inicio y final.
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export type BrandsLookup =
  Map<string, string> | Record<string, string> | CatalogBrand[] | ((brandId: string) => string);

function resolveBrandName(brandId: string, lookup?: BrandsLookup): string {
  if (!lookup) return "";
  if (typeof lookup === "function") {
    return lookup(brandId) || "";
  }
  if (lookup instanceof Map) {
    return lookup.get(brandId) || "";
  }
  if (Array.isArray(lookup)) {
    return lookup.find((b) => b.id === brandId)?.name || "";
  }
  return lookup[brandId] || "";
}

/**
 * Evalúa si un producto coincide con el término de búsqueda y retorna su prioridad:
 * - Prioridad 0: Coincidencia en Código OEM.
 * - Prioridad 1: Coincidencia en Nombre, Marca o Compatibilidad Vehicular.
 * - null: Sin coincidencia.
 */
export function evaluateProductMatch(
  product: CatalogProduct,
  normalizedQuery: string,
  brandName = "",
): { matches: boolean; oemPriority: number } {
  if (!normalizedQuery) {
    return { matches: true, oemPriority: 2 };
  }

  const oemNorm = normalizeSearchText(product.oem);
  const nameNorm = normalizeSearchText(product.name);
  const brandNorm = normalizeSearchText(brandName);
  const compatNorm = normalizeSearchText(product.vehicleCompatibility);

  const matchesOEM = oemNorm !== "" && oemNorm.includes(normalizedQuery);
  const matchesName = nameNorm.includes(normalizedQuery);
  const matchesBrand = brandNorm !== "" && brandNorm.includes(normalizedQuery);
  const matchesCompat = compatNorm !== "" && compatNorm.includes(normalizedQuery);

  const matches = matchesOEM || matchesName || matchesBrand || matchesCompat;

  return {
    matches,
    oemPriority: matchesOEM ? 0 : 1,
  };
}

/**
 * Filtra y ordena los productos según el término de búsqueda.
 * Prioriza en primer lugar los productos coincidentes por código OEM.
 */
export function searchProducts(
  products: CatalogProduct[],
  query: string,
  brandsLookup?: BrandsLookup,
): CatalogProduct[] {
  const qNorm = normalizeSearchText(query);
  if (!qNorm) {
    return [...products];
  }

  const matchesWithRank: { product: CatalogProduct; oemPriority: number }[] = [];

  for (const product of products) {
    const brandName = resolveBrandName(product.brandId, brandsLookup);
    const { matches, oemPriority } = evaluateProductMatch(product, qNorm, brandName);

    if (matches) {
      matchesWithRank.push({ product, oemPriority });
    }
  }

  // Ordenar: primero los coincidentes por OEM (0 antes que 1), luego alfabéticamente por nombre
  matchesWithRank.sort((a, b) => {
    if (a.oemPriority !== b.oemPriority) {
      return a.oemPriority - b.oemPriority;
    }
    return a.product.name.localeCompare(b.product.name, "es");
  });

  return matchesWithRank.map((item) => item.product);
}

export interface ParsedOemCodes {
  primary: string | null;
  alternatives: string[];
  totalCount: number;
}

/**
 * Parsea y descompone múltiples códigos OEM cruzados en un repuesto diésel.
 * (Spec 009, RF-08, CL-02)
 *
 * Separa por comas (,), barras (/), puntos y coma (;) o saltos de línea.
 * El primer token se asume como código principal del fabricante de inyección.
 */
export function parseOemCodes(oem?: string | null): ParsedOemCodes {
  if (!oem || !oem.trim()) {
    return { primary: null, alternatives: [], totalCount: 0 };
  }

  const tokens = oem
    .split(/[,/;\n]+/)
    .map((code) => code.trim())
    .filter((code) => code.length > 0);

  if (tokens.length === 0) {
    return { primary: null, alternatives: [], totalCount: 0 };
  }

  return {
    primary: tokens[0] ?? null,
    alternatives: tokens.slice(1),
    totalCount: tokens.length,
  };
}
