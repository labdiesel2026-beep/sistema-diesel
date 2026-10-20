import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/error.middleware.js";
import type { ProductFormData } from "../schemas/product.schemas.js";

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  brandId: string;
  categoryIds: string[];
  vehicleCompatibility: string | null;
  condition: string;
  price: number | null;
  showPrice: boolean;
  visible: boolean;
  oem: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Serializador DTO que transforma la entidad relacional de Prisma
 * en un payload plano alineado con el contrato de la Fase 4 (RF-07, D-05).
 */
export function toProductDto(product: any): ProductDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    brandId: product.brandId,
    categoryIds: (product.productCategories || []).map((pc: any) => pc.categoryId),
    vehicleCompatibility: product.vehicleCompatibility ?? null,
    condition: product.condition,
    price: product.price ?? null,
    showPrice: product.showPrice,
    visible: product.visible,
    oem: product.oem ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Servicio Transaccional de Productos (RF-07, D-03, D-05, D-06).
 */
export class ProductService {
  /**
   * Obtiene todos los productos del catálogo transformados a DTO plano.
   */
  async getAllProducts(options?: { visibleOnly?: boolean }): Promise<ProductDto[]> {
    const products = await prisma.product.findMany({
      where: options?.visibleOnly ? { visible: true } : undefined,
      include: {
        productCategories: {
          select: { categoryId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map(toProductDto);
  }

  /**
   * Obtiene un producto por su UUID.
   */
  async getProductById(id: string): Promise<ProductDto> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productCategories: {
          select: { categoryId: true },
        },
      },
    });

    if (!product) {
      throw AppError.notFound("Producto no encontrado");
    }

    return toProductDto(product);
  }

  /**
   * Crea un producto de forma atómica en una transacción interactiva de Prisma ($transaction),
   * persistiendo sus atributos y las filas en la tabla pivote ProductCategory (D-03).
   */
  async createProduct(data: ProductFormData): Promise<ProductDto> {
    return prisma.$transaction(async (tx) => {
      // 1. Validar existencia de la marca
      const brand = await tx.brand.findUnique({
        where: { id: data.brandId },
      });
      if (!brand) {
        throw AppError.notFound("La marca seleccionada no existe");
      }

      // 2. Validar existencia de todas las categorías
      const categories = await tx.category.findMany({
        where: { id: { in: data.categoryIds } },
        select: { id: true },
      });
      if (categories.length !== data.categoryIds.length) {
        throw AppError.badRequest("Una o más categorías seleccionadas no existen");
      }

      // 3. Crear el producto y vincularlo en la tabla pivote ProductCategory
      const created = await tx.product.create({
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          imageUrl: data.imageUrl.trim(),
          brandId: data.brandId,
          vehicleCompatibility: data.vehicleCompatibility?.trim() || null,
          condition: data.condition,
          price: data.price !== null ? Math.round(data.price) : null,
          showPrice: data.showPrice,
          visible: data.visible,
          oem: data.oem?.trim() || null,
          productCategories: {
            create: data.categoryIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        },
        include: {
          productCategories: {
            select: { categoryId: true },
          },
        },
      });

      return toProductDto(created);
    });
  }

  /**
   * Actualiza un producto y sincroniza atómicamente sus categorías en una transacción ($transaction).
   * Retorna el producto actualizado y la URL de la imagen previa (para purga si fue reemplazada).
   */
  async updateProduct(
    id: string,
    data: ProductFormData,
  ): Promise<{ product: ProductDto; previousImageUrl: string }> {
    return prisma.$transaction(async (tx) => {
      // 1. Verificar existencia del producto
      const current = await tx.product.findUnique({
        where: { id },
      });
      if (!current) {
        throw AppError.notFound("Producto no encontrado");
      }

      // 2. Validar existencia de la marca
      const brand = await tx.brand.findUnique({
        where: { id: data.brandId },
      });
      if (!brand) {
        throw AppError.notFound("La marca seleccionada no existe");
      }

      // 3. Validar existencia de todas las categorías
      const categories = await tx.category.findMany({
        where: { id: { in: data.categoryIds } },
        select: { id: true },
      });
      if (categories.length !== data.categoryIds.length) {
        throw AppError.badRequest("Una o más categorías seleccionadas no existen");
      }

      // 4. Sincronizar tabla pivote ProductCategory (eliminar actuales y recrear)
      await tx.productCategory.deleteMany({
        where: { productId: id },
      });

      await tx.productCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({
          productId: id,
          categoryId,
        })),
      });

      // 5. Actualizar campos del producto
      const updated = await tx.product.update({
        where: { id },
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          imageUrl: data.imageUrl.trim(),
          brandId: data.brandId,
          vehicleCompatibility: data.vehicleCompatibility?.trim() || null,
          condition: data.condition,
          price: data.price !== null ? Math.round(data.price) : null,
          showPrice: data.showPrice,
          visible: data.visible,
          oem: data.oem?.trim() || null,
        },
        include: {
          productCategories: {
            select: { categoryId: true },
          },
        },
      });

      return {
        product: toProductDto(updated),
        previousImageUrl: current.imageUrl,
      };
    });
  }

  /**
   * Modifica exclusivamente el estado de visibilidad booleano del producto.
   */
  async updateProductVisibility(id: string, visible: boolean): Promise<ProductDto> {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      throw AppError.notFound("Producto no encontrado");
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { visible },
      include: {
        productCategories: {
          select: { categoryId: true },
        },
      },
    });

    return toProductDto(updated);
  }

  /**
   * Elimina un producto.
   * La relación onDelete: Cascade en ProductCategory purga automáticamente sus vínculos.
   * Retorna el producto eliminado (con su imageUrl para purga física en disco).
   */
  async deleteProduct(id: string): Promise<ProductDto> {
    const current = await prisma.product.findUnique({
      where: { id },
      include: {
        productCategories: {
          select: { categoryId: true },
        },
      },
    });

    if (!current) {
      throw AppError.notFound("Producto no encontrado");
    }

    const deleted = await prisma.product.delete({
      where: { id },
      include: {
        productCategories: {
          select: { categoryId: true },
        },
      },
    });

    return toProductDto(deleted);
  }
}

export const productService = new ProductService();
export default productService;
