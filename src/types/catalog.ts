/**
 * Tipos de Dominio y Contratos DTO para el Catálogo Público de Repuestos e Inyectores Diésel.
 * (Spec 003, RF-02, RF-06, RF-07, RF-12, docs/constitution.md §5)
 *
 * Exclusión Estricta: Ninguna entidad del catálogo público gestiona, expone ni valida
 * existencias o inventario (stock).
 */

export type ProductCondition = "Nuevo" | "Reacondicionado" | "Usado";

/**
 * Repuesto diésel público del catálogo (alineado 1:1 con ProductDto del backend).
 */
export interface CatalogProduct {
  id: string; // UUID v4
  name: string;
  description: string;
  imageUrl: string; // e.g. "/uploads/<uuid>.webp"
  categoryIds: string[]; // UUIDs planos
  brandId: string; // UUID de la marca
  vehicleCompatibility: string | null;
  condition: ProductCondition;
  price: number | null; // Entero en ARS o null si es "A cotizar"
  showPrice: boolean; // Si false, se muestra "Consultar precio"
  visible: boolean; // Solo visible === true se exhibe en el listado público
  oem: string | null; // Código OEM grabado en la pieza
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Marca de repuestos obtenida de GET /api/brands.
 */
export interface CatalogBrand {
  id: string; // UUID v4
  name: string;
}

/**
 * Categoría con estructura jerárquica (máx 1 nivel) obtenida de GET /api/categories.
 */
export interface CatalogCategory {
  id: string; // UUID v4
  name: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  children?: { id: string; name: string }[];
}

/**
 * Representación efímera en localStorage (Principio 5: Caché no autoritativa).
 */
export interface CartItemCache {
  productId: string; // UUID v4
  quantity: number; // Entero >= 1
  lastKnown: {
    name: string;
    oem: string | null;
  };
}

export interface CartCacheV1 {
  version: 1;
  items: CartItemCache[];
}

/**
 * Ítem de carrito enriquecido y contrastado contra el backend fresco.
 */
export interface EnrichedCartItem {
  productId: string;
  quantity: number;
  name: string;
  oem: string | null;
  imageUrl: string;
  brandName: string;
  condition: ProductCondition;
  price: number | null;
  showPrice: boolean;
  visible: boolean;
  requiresReconfirmation: boolean; // true si visible === false o fue modificado/eliminado
  isDeletedOrUnavailable: boolean; // true si ya no existe en el backend
}
