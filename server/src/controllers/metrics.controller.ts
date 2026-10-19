import type { Request, Response, NextFunction } from "express";
import { metricsService } from "../services/metrics.service.js";

/**
 * GET /api/admin/metrics
 * Endpoint protegido con autenticación de administrador (RF-10, CA-10.1).
 * Retorna las métricas agregadas del catálogo de productos, categorías y marcas.
 */
export async function getMetrics(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const metrics = await metricsService.getMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    next(error);
  }
}

export default {
  getMetrics,
};
