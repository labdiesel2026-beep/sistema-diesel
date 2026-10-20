import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/error.middleware.js";
import { Prisma } from "@prisma/client";

/**
 * Servicio de Negocio para Marcas (RF-09, D-04).
 */
export class BrandService {
  /**
   * Obtiene la lista completa de marcas ordenadas alfabéticamente.
   */
  async getAllBrands() {
    return prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Obtiene una marca individual por su identificador UUID.
   */
  async getBrandById(id: string) {
    const brand = await prisma.brand.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw AppError.notFound("Marca no encontrada");
    }

    return brand;
  }

  /**
   * Registra una nueva marca validando unicidad case-insensitive.
   */
  async createBrand(data: { name: string }) {
    const trimmedName = data.name.trim();

    // Verificación de unicidad insensible a mayúsculas/minúsculas (RF-09)
    const existing = await prisma.brand.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      throw AppError.conflict(`Ya existe una marca con el nombre "${trimmedName}"`);
    }

    return prisma.brand.create({
      data: {
        name: trimmedName,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Actualiza el nombre de una marca existente validando unicidad case-insensitive.
   */
  async updateBrand(id: string, data: { name: string }) {
    const trimmedName = data.name.trim();

    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      throw AppError.notFound("Marca no encontrada");
    }

    // Comprobar si otra marca ya posee este nombre (insensible a mayúsculas)
    const collision = await prisma.brand.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        NOT: {
          id,
        },
      },
    });

    if (collision) {
      throw AppError.conflict(`Ya existe otra marca con el nombre "${trimmedName}"`);
    }

    return prisma.brand.update({
      where: { id },
      data: {
        name: trimmedName,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Elimina una marca si no tiene productos vinculados.
   * Si la marca está asociada a productos (onDelete: Restrict), retorna 409 Conflict.
   */
  async deleteBrand(id: string) {
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      throw AppError.notFound("Marca no encontrada");
    }

    // Validación preventiva en capa de servicio
    const productsCount = await prisma.product.count({
      where: { brandId: id },
    });

    if (productsCount > 0) {
      throw AppError.conflict("No se puede eliminar la marca porque tiene productos vinculados");
    }

    // Ejecución en base de datos con captura defensiva de restricción de integridad referencial
    try {
      return await prisma.brand.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003" || error.code === "P2014") {
          throw AppError.conflict(
            "No se puede eliminar la marca porque tiene productos vinculados",
          );
        }
        if (error.code === "P2025") {
          throw AppError.notFound("Marca no encontrada");
        }
      }
      throw error;
    }
  }
}

export const brandService = new BrandService();
export default brandService;
