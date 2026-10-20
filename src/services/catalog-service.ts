/**
 * Servicio de Consumo HTTP para el Catálogo Público de Repuestos e Inyectores Diésel.
 * (Spec 003, RF-02, RF-04, RF-10, RF-11, Bloque 1 - Tarea T-02)
 *
 * Encapsula las llamadas a la API REST pública mediante el cliente centralizado api.ts.
 */

import { api } from "@/lib/api";
import type { CatalogProduct, CatalogCategory, CatalogBrand } from "@/types/catalog";

export const catalogService = {
  /**
   * Obtiene todos los productos del catálogo y filtra exclusivamente
   * aquellos con visible === true para la exhibición pública (RF-02).
   */
  async getVisibleProducts(): Promise<CatalogProduct[]> {
    const products = await api.get<CatalogProduct[]>("/api/products");
    return products.filter((product) => product.visible === true);
  },

  /**
   * Obtiene todos los productos (incluyendo visible === false) para
   * revalidación autorizada de ítems previamente guardados en el carrito (RF-10, RF-11).
   */
  async getAllProductsForValidation(): Promise<CatalogProduct[]> {
    return api.get<CatalogProduct[]>("/api/products");
  },

  /**
   * Obtiene el árbol completo de categorías y subcategorías (RF-04).
   */
  async getCategories(): Promise<CatalogCategory[]> {
    return api.get<CatalogCategory[]>("/api/categories");
  },

  /**
   * Obtiene la lista completa de marcas de repuestos (RF-04).
   */
  async getBrands(): Promise<CatalogBrand[]> {
    return api.get<CatalogBrand[]>("/api/brands");
  },

  /**
   * Obtiene la entidad de un producto individual por su UUID (RF-02, RF-06).
   */
  async getProductById(id: string): Promise<CatalogProduct> {
    return api.get<CatalogProduct>(`/api/products/${id}`);
  },
};

export default catalogService;
