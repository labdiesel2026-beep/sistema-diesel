import type { Request, Response, NextFunction } from "express";
import { productService, toProductDto } from "../services/product.service.js";
import { deleteFile } from "../services/file-storage.service.js";

/**
 * Controlador REST para Catálogo de Productos (RF-07, D-05, D-06, D-10).
 */

/**
 * GET /api/products
 * Endpoint público que lista el catálogo plano de productos.
 * Transforma la relación de base de datos aplanando `productCategories`
 * en un array simple `categoryIds: string[]` compatible con el frontend.
 */
export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const visibleOnly = req.query.visibleOnly === "true";
    const products = await productService.getAllProducts({ visibleOnly });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 * Endpoint público que retorna un producto individual aplanado por DTO.
 */
export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const product = await productService.getProductById(req.params.id as string);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products
 * Endpoint protegido con autenticación y anti-CSRF.
 * Inserta de forma atómica el producto y sus categorías en tabla pivote.
 * Responde 201 Created con el producto normalizado.
 */
export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/products/:id
 * Endpoint protegido con autenticación y anti-CSRF.
 * Actualiza los datos del producto y sincroniza ProductCategory en transacción Prisma.
 * Si el `imageUrl` enviado es distinto al anterior, invoca `deleteFile(previousImageUrl)`
 * de forma asíncrona post-commit (RF-06, D-10).
 */
export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { product, previousImageUrl } = await productService.updateProduct(
      req.params.id as string,
      req.body,
    );

    // Limpieza física asíncrona post-commit de la foto anterior si fue reemplazada
    if (previousImageUrl && previousImageUrl !== product.imageUrl) {
      deleteFile(previousImageUrl).catch((err) => {
        console.warn(
          `[FileStorage Warning] Error en purga de imagen anterior ${previousImageUrl}:`,
          err,
        );
      });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/products/:id/visibility
 * Endpoint protegido con autenticación y anti-CSRF.
 * Modifica exclusivamente la visibilidad pública del producto (RF-07).
 */
export async function updateProductVisibility(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const updated = await productService.updateProductVisibility(
      req.params.id as string,
      req.body.visible,
    );
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id
 * Endpoint protegido con autenticación y anti-CSRF.
 * Elimina el producto de PostgreSQL (la relación onDelete: Cascade en ProductCategory
 * purga automáticamente los vínculos en cascada).
 * Posteriormente invoca la eliminación física de su archivo .webp en disco (RF-06, D-10).
 */
export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const deleted = await productService.deleteProduct(req.params.id as string);

    // Limpieza física del archivo de imagen en disco post-commit (asíncrona y aislada)
    if (deleted?.imageUrl) {
      deleteFile(deleted.imageUrl).catch((fileErr: any) => {
        console.warn(
          `[FileStorage Warning] No se pudo eliminar físicamente el archivo ${deleted.imageUrl}: ${fileErr?.message || fileErr}`,
        );
      });
    }

    res.status(200).json({
      success: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/featured
 * Endpoint público que retorna la colección acotada de productos destacados
 * activos para el carrusel de la Landing Page (RF-06, RF-07, RNF-05).
 */
export async function getFeaturedProducts(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const products = await productService.getFeaturedProducts();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/products/:id/featured
 * Endpoint protegido con autenticación y anti-CSRF (RF-01, RF-03, RF-05).
 * Modifica atómicamente el estado de destacado de un producto individual.
 * Valida el límite de 10 productos (respondiendo 409 Conflict si está lleno)
 * y la visibilidad activa (respondiendo 400 Bad Request si está oculto).
 */
export async function updateProductFeatured(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const updated = await productService.toggleFeatured(
      req.params.id as string,
      req.body.isFeatured,
    );
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export { toProductDto };

export default {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  updateProductVisibility,
  updateProductFeatured,
  deleteProduct,
  toProductDto,
};
