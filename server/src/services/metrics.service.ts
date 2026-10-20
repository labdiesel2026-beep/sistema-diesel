import { prisma } from "../config/prisma.js";

export interface CatalogMetrics {
  totalProducts: number;
  visibleProducts: number;
  hiddenProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalBrands: number;
}

/**
 * Servicio de Métricas del Dashboard (RF-10, CA-10.1, Fase 6 RF-04).
 * Ejecuta agregaciones en paralelo con PostgreSQL para alimentar
 * el panel administrativo del catálogo.
 */
export class MetricsService {
  async getMetrics(): Promise<CatalogMetrics> {
    const [
      totalProducts,
      visibleProducts,
      hiddenProducts,
      featuredProducts,
      totalCategories,
      totalBrands,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { visible: true } }),
      prisma.product.count({ where: { visible: false } }),
      prisma.product.count({ where: { isFeatured: true, visible: true } }),
      prisma.category.count(),
      prisma.brand.count(),
    ]);

    return {
      totalProducts,
      visibleProducts,
      hiddenProducts,
      featuredProducts,
      totalCategories,
      totalBrands,
    };
  }
}

export const metricsService = new MetricsService();
export default metricsService;
