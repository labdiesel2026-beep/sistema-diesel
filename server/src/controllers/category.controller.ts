import type { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service.js";

/**
 * Controlador REST para Taxonomías de Categorías (/api/categories)
 * (RF-08, D-04)
 */

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await categoryService.getCategoryById(req.params.id as string);
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const updated = await categoryService.updateCategory(req.params.id as string, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await categoryService.deleteCategory(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Categoría eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
