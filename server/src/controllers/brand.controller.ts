import type { Request, Response, NextFunction } from "express";
import { brandService } from "../services/brand.service.js";

/**
 * Controlador de Endpoints para Marcas (/api/brands)
 * (RF-09, D-04)
 */

export async function getBrands(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const brands = await brandService.getAllBrands();
    res.status(200).json(brands);
  } catch (error) {
    next(error);
  }
}

export async function getBrandById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const brand = await brandService.getBrandById(req.params.id as string);
    res.status(200).json(brand);
  } catch (error) {
    next(error);
  }
}

export async function createBrand(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const brand = await brandService.createBrand(req.body);
    res.status(201).json(brand);
  } catch (error) {
    next(error);
  }
}

export async function updateBrand(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updated = await brandService.updateBrand(req.params.id as string, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteBrand(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await brandService.deleteBrand(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Marca eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
