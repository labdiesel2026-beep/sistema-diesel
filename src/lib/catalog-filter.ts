/**
 * Motor de Filtrado Cruzado y Resolución Jerárquica de Categorías.
 * (Spec 003, RF-02, RF-04, Tarea T-05)
 *
 * Características:
 * - Expansión automática de categorías padre a sus subcategorías hijas.
 * - Operador OR entre categorías seleccionadas (incluyendo hijas expandidas).
 * - Operador OR entre marcas seleccionadas.
 * - Operador AND entre búsqueda de texto, marcas y categorías.
 * - Priorización de ordenamiento por código OEM para los coincidentes de búsqueda.
 */

import type { CatalogProduct, CatalogCategory, CatalogBrand } from "@/types/catalog";
import { normalizeSearchText, evaluateProductMatch, type BrandsLookup } from "@/lib/catalog-search";

/**
 * Expande los identificadores de categorías seleccionadas:
 * Si una categoría seleccionada es raíz o tiene hijas, agrega los IDs de todas sus subcategorías hijas.
 */
export function expandCategoryIds(
  selectedCategoryIds: string[] = [],
  categories: CatalogCategory[] = [],
): Set<string> {
  const expanded = new Set<string>();
  if (!selectedCategoryIds.length) {
    return expanded;
  }

  // Mapa de categoría por ID para búsqueda rápida
  const categoryMap = new Map<string, CatalogCategory>();
  for (const cat of categories) {
    categoryMap.set(cat.id, cat);
  }

  // Mapa de parentId -> lista de IDs hijas (por si children no viene anidado)
  const childrenByParent = new Map<string, string[]>();
  for (const cat of categories) {
    if (cat.parentId) {
      const existing = childrenByParent.get(cat.parentId) || [];
      existing.push(cat.id);
      childrenByParent.set(cat.parentId, existing);
    }
  }

  // Expansión recursiva mediante BFS para cubrir cualquier profundidad de árbol jerárquico
  const queue = [...selectedCategoryIds];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (expanded.has(currentId)) continue;
    expanded.add(currentId);

    // 1. Hijas desde el array children si existe
    const cat = categoryMap.get(currentId);
    if (cat?.children && Array.isArray(cat.children)) {
      for (const child of cat.children) {
        if (!expanded.has(child.id)) {
          queue.push(child.id);
        }
      }
    }

    // 2. Hijas desde la relación parentId
    const relationalChildren = childrenByParent.get(currentId);
    if (relationalChildren) {
      for (const childId of relationalChildren) {
        if (!expanded.has(childId)) {
          queue.push(childId);
        }
      }
    }
  }

  return expanded;
}

export interface FilterCatalogOptions {
  products: CatalogProduct[];
  searchQuery?: string;
  selectedBrandIds?: string[];
  selectedCategoryIds?: string[];
  categories?: CatalogCategory[];
  brandsLookup?: BrandsLookup;
}

/**
 * Aplica el filtrado cruzado dimensional sobre los productos del catálogo.
 */
export function filterCatalogProducts({
  products,
  searchQuery = "",
  selectedBrandIds = [],
  selectedCategoryIds = [],
  categories = [],
  brandsLookup,
}: FilterCatalogOptions): CatalogProduct[] {
  const qNorm = normalizeSearchText(searchQuery);
  const brandsSet = new Set(selectedBrandIds.filter(Boolean));
  const expandedCategoryIds = expandCategoryIds(selectedCategoryIds, categories);

  const matchedItems: { product: CatalogProduct; oemPriority: number }[] = [];

  for (const product of products) {
    // 1. Filtro de Marca (OR entre marcas seleccionadas)
    const matchesBrand = brandsSet.size === 0 || brandsSet.has(product.brandId);
    if (!matchesBrand) {
      continue;
    }

    // 2. Filtro de Categoría (OR entre categorías expandidas)
    const matchesCategory =
      expandedCategoryIds.size === 0 ||
      product.categoryIds.some((id) => expandedCategoryIds.has(id));
    if (!matchesCategory) {
      continue;
    }

    // 3. Filtro de Búsqueda de Texto (AND con filtros anteriores)
    let brandName = "";
    if (brandsLookup) {
      if (typeof brandsLookup === "function") {
        brandName = brandsLookup(product.brandId) || "";
      } else if (brandsLookup instanceof Map) {
        brandName = brandsLookup.get(product.brandId) || "";
      } else if (Array.isArray(brandsLookup)) {
        brandName = brandsLookup.find((b) => b.id === product.brandId)?.name || "";
      } else {
        brandName = (brandsLookup as Record<string, string>)[product.brandId] || "";
      }
    }

    const { matches: matchesText, oemPriority } = evaluateProductMatch(product, qNorm, brandName);

    if (matchesText) {
      matchedItems.push({ product, oemPriority });
    }
  }

  // Ordenar: coincidencias OEM primero (prioridad 0 antes que 1 y 2), luego alfabéticamente por nombre
  matchedItems.sort((a, b) => {
    if (a.oemPriority !== b.oemPriority) {
      return a.oemPriority - b.oemPriority;
    }
    return a.product.name.localeCompare(b.product.name, "es");
  });

  return matchedItems.map((item) => item.product);
}
