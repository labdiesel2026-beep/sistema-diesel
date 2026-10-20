import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/error.middleware.js";
import { Prisma } from "@prisma/client";

/**
 * Servicio de Negocio para Taxonomía de Categorías (RF-08, D-04).
 * Gobierna la jerarquía estricta de máximo 1 nivel (Raíz -> Subcategoría).
 */
export class CategoryService {
  /**
   * Obtiene todas las categorías ordenadas alfabéticamente.
   */
  async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            children: true,
            productCategories: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene una categoría individual por su UUID.
   */
  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            children: true,
            productCategories: true,
          },
        },
      },
    });

    if (!category) {
      throw AppError.notFound("Categoría no encontrada");
    }

    return category;
  }

  /**
   * Crea una nueva categoría validando:
   * 1. Unicidad global del nombre (insensible a mayúsculas).
   * 2. Límite de jerarquía de 1 nivel: el padre debe existir y ser raíz (parentId === null).
   */
  async createCategory(data: { name: string; parentId?: string | null }) {
    const trimmedName = data.name.trim();

    // 1. Verificación de unicidad global case-insensitive
    const existing = await prisma.category.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      throw AppError.conflict(`Ya existe una categoría con el nombre "${trimmedName}"`);
    }

    // 2. Control de jerarquía máxima de 1 nivel (D-04)
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw AppError.notFound("La categoría padre especificada no existe");
      }

      if (parent.parentId !== null) {
        throw AppError.badRequest(
          "Límite de jerarquía excedido: solo se permite 1 nivel de profundidad (no se pueden anidar subcategorías bajo subcategorías)",
        );
      }
    }

    return prisma.category.create({
      data: {
        name: trimmedName,
        parentId: data.parentId ?? null,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Actualiza una categoría existente validando:
   * 1. Existencia del registro.
   * 2. Prevención de auto-asignación (parentId !== id).
   * 3. Bloqueo de asignación de padre si la categoría ya posee subcategorías hijas.
   * 4. Validez del nuevo padre (debe ser raíz).
   * 5. Unicidad case-insensitive contra otras categorías.
   */
  async updateCategory(id: string, data: { name: string; parentId?: string | null }) {
    const trimmedName = data.name.trim();

    const current = await prisma.category.findUnique({
      where: { id },
      include: {
        children: { select: { id: true } },
      },
    });

    if (!current) {
      throw AppError.notFound("Categoría no encontrada");
    }

    // Prevenir auto-asignación
    if (data.parentId && data.parentId === id) {
      throw AppError.badRequest("Una categoría no puede asignarse como padre de sí misma");
    }

    // Bloquear asignar padre si ya posee subcategorías (violaría el límite de 1 nivel)
    if (data.parentId && current.children.length > 0) {
      throw AppError.badRequest(
        "No se puede asignar un padre a esta categoría porque ya posee subcategorías hijas (máximo 1 nivel permitido)",
      );
    }

    // Si se especifica un nuevo padre, validar que exista y sea raíz
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw AppError.notFound("La categoría padre especificada no existe");
      }

      if (parent.parentId !== null) {
        throw AppError.badRequest(
          "Límite de jerarquía excedido: solo se permite 1 nivel de profundidad (el padre debe ser una categoría raíz)",
        );
      }
    }

    // Validar colisión de nombre contra otras categorías
    const collision = await prisma.category.findFirst({
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
      throw AppError.conflict(`Ya existe otra categoría con el nombre "${trimmedName}"`);
    }

    return prisma.category.update({
      where: { id },
      data: {
        name: trimmedName,
        parentId: data.parentId ?? null,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Elimina una categoría si no posee subcategorías hijas ni productos vinculados.
   * Si tiene subcategorías o productos, responde con 409 Conflict (onDelete: Restrict).
   */
  async deleteCategory(id: string) {
    const current = await prisma.category.findUnique({
      where: { id },
      include: {
        children: { select: { id: true } },
        productCategories: { select: { productId: true } },
      },
    });

    if (!current) {
      throw AppError.notFound("Categoría no encontrada");
    }

    // 1. Verificación preventiva de subcategorías hijas
    if (current.children.length > 0) {
      throw AppError.conflict(
        "No se puede eliminar la categoría porque contiene subcategorías asociadas",
      );
    }

    // 2. Verificación preventiva de productos vinculados en tabla pivote
    if (current.productCategories.length > 0) {
      throw AppError.conflict(
        "No se puede eliminar la categoría porque tiene productos vinculados",
      );
    }

    // 3. Ejecución defensiva en base de datos capturando restricciones de clave foránea
    try {
      return await prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003" || error.code === "P2014") {
          throw AppError.conflict(
            "No se puede eliminar la categoría debido a restricciones de integridad referencial",
          );
        }
        if (error.code === "P2025") {
          throw AppError.notFound("Categoría no encontrada");
        }
      }
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
