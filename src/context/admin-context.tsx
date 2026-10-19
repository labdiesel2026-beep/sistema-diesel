import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  AdminCategory,
  AdminBrand,
  AdminProduct,
  IntegrityCheckResult,
} from "@/types/admin";
import { getInitialAdminData } from "@/lib/admin-seed-data";

/**
 * Resultado estructurado para operaciones de mutación de categorías.
 * (CA-11.1, CA-11.2, CL-04, CL-05)
 */
export interface CategoryMutationResult {
  success: boolean;
  reason?: string | undefined;
  affectedProducts?: string[] | undefined;
  category?: AdminCategory | undefined;
}

export interface AdminContextType {
  // Taxonomías (Categorías y Subcategorías)
  categories: AdminCategory[];
  createCategory: (input: {
    name: string;
    parentId: string | null;
  }) => CategoryMutationResult;
  updateCategory: (
    id: string,
    input: { name: string; parentId: string | null }
  ) => CategoryMutationResult;
  deleteCategory: (id: string) => CategoryMutationResult;
  canDeleteCategory: (id: string) => IntegrityCheckResult;
  getRootCategories: () => AdminCategory[];
  getChildCategories: (parentId: string) => AdminCategory[];
  hasChildren: (categoryId: string) => boolean;

  // Marcas (Estado inicial de memoria para resolución relacional)
  brands: AdminBrand[];

  // Catálogo de Productos (Estado inicial de memoria para integridad referencial)
  products: AdminProduct[];
}

const AdminContext = createContext<AdminContextType | null>(null);

export interface AdminProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de Estado Global de Administración en Memoria Volátil.
 * (RF-10, RF-11, RF-15, CA-10.1 - CA-10.5, CA-11.1 - CA-11.3, CL-04, CL-05, CL-06)
 *
 * Mantiene la base de datos simulada en memoria de React con cero interacción
 * con almacenamiento persistente (localStorage / sessionStorage).
 */
export function AdminProvider({ children }: AdminProviderProps) {
  const [initialData] = useState(() => getInitialAdminData());
  const [categories, setCategories] = useState<AdminCategory[]>(
    initialData.categories
  );
  const [brands, setBrands] = useState<AdminBrand[]>(initialData.brands);
  const [products, setProducts] = useState<AdminProduct[]>(
    initialData.products
  );

  // -------------------------------------------------------------------------
  // Helpers de Taxonomías
  // -------------------------------------------------------------------------

  const getRootCategories = useCallback(() => {
    return categories.filter((c) => c.parentId === null);
  }, [categories]);

  const getChildCategories = useCallback(
    (parentId: string) => {
      return categories.filter((c) => c.parentId === parentId);
    },
    [categories]
  );

  const hasChildren = useCallback(
    (categoryId: string) => {
      return categories.some((c) => c.parentId === categoryId);
    },
    [categories]
  );

  // -------------------------------------------------------------------------
  // Verificación de Integridad de Categoría (CA-11.1, CA-11.2, CL-06)
  // -------------------------------------------------------------------------

  const canDeleteCategory = useCallback(
    (id: string): IntegrityCheckResult => {
      const targetCategory = categories.find((c) => c.id === id);
      if (!targetCategory) {
        return {
          allowed: false,
          reason: "La categoría especificada no existe.",
        };
      }

      // Bloqueo 1: Subcategorías vinculadas (CA-11.2)
      const childCategories = categories.filter((c) => c.parentId === id);
      if (childCategories.length > 0) {
        return {
          allowed: false,
          reason:
            "No se puede eliminar la categoría porque posee subcategorías vinculadas. Reasigne o elimine primero las subcategorías.",
        };
      }

      // Bloqueo 2: Productos asociados (CA-11.1, CL-06)
      const linkedProducts = products.filter((p) =>
        p.categoryIds.includes(id)
      );
      if (linkedProducts.length > 0) {
        return {
          allowed: false,
          reason:
            "No se puede eliminar la categoría porque contiene productos asociados. Debe reasignarlos antes de continuar.",
          affectedProducts: linkedProducts.map((p) => p.name),
        };
      }

      return { allowed: true };
    },
    [categories, products]
  );

  // -------------------------------------------------------------------------
  // Mutaciones de Categorías (RF-10, RF-11)
  // -------------------------------------------------------------------------

  const createCategory = useCallback(
    (input: {
      name: string;
      parentId: string | null;
    }): CategoryMutationResult => {
      const trimmedName = input.name.trim();

      if (trimmedName.length < 2) {
        return {
          success: false,
          reason: "El nombre de la categoría debe tener al menos 2 caracteres.",
        };
      }

      // Validación de unicidad de nombre (CA-10.5)
      const isDuplicate = categories.some(
        (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        return {
          success: false,
          reason: "Ya existe una categoría con este nombre.",
        };
      }

      // Validación de límite de 1 nivel (CA-10.3, CL-04)
      if (input.parentId !== null) {
        const parentCategory = categories.find((c) => c.id === input.parentId);
        if (!parentCategory) {
          return {
            success: false,
            reason: "La categoría padre seleccionada no existe.",
          };
        }
        if (parentCategory.parentId !== null) {
          return {
            success: false,
            reason:
              "Una subcategoría solo puede tener como padre una categoría principal de nivel raíz.",
          };
        }
      }

      const newCategory: AdminCategory = {
        id: crypto.randomUUID(),
        name: trimmedName,
        parentId: input.parentId,
      };

      setCategories((prev) => [...prev, newCategory]);

      return {
        success: true,
        category: newCategory,
      };
    },
    [categories]
  );

  const updateCategory = useCallback(
    (
      id: string,
      input: { name: string; parentId: string | null }
    ): CategoryMutationResult => {
      const currentCategory = categories.find((c) => c.id === id);
      if (!currentCategory) {
        return {
          success: false,
          reason: "Categoría no encontrada.",
        };
      }

      const trimmedName = input.name.trim();
      if (trimmedName.length < 2) {
        return {
          success: false,
          reason: "El nombre de la categoría debe tener al menos 2 caracteres.",
        };
      }

      // Unicidad respecto a otras categorías (CA-10.5)
      const isDuplicate = categories.some(
        (c) =>
          c.id !== id &&
          c.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        return {
          success: false,
          reason: "Ya existe una categoría con este nombre.",
        };
      }

      // Prevención de ciclos: si ya tiene hijas no puede convertirse en hija (CA-10.4, CL-05)
      const categoryHasChildren = categories.some((c) => c.parentId === id);
      if (categoryHasChildren && input.parentId !== null) {
        return {
          success: false,
          reason:
            "No se puede convertir una categoría padre con subcategorías asociadas en una subcategoría hija.",
        };
      }

      // Auto-referencia prohibida
      if (input.parentId === id) {
        return {
          success: false,
          reason: "Una categoría no puede ser su propio padre.",
        };
      }

      // Validación de 1 nivel: el padre debe ser raíz (CA-10.3, CL-04)
      if (input.parentId !== null) {
        const targetParent = categories.find((c) => c.id === input.parentId);
        if (!targetParent) {
          return {
            success: false,
            reason: "La categoría padre seleccionada no existe.",
          };
        }
        if (targetParent.parentId !== null) {
          return {
            success: false,
            reason:
              "Una subcategoría solo puede tener como padre una categoría principal de nivel raíz.",
          };
        }
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, name: trimmedName, parentId: input.parentId }
            : c
        )
      );

      return {
        success: true,
      };
    },
    [categories]
  );

  const deleteCategory = useCallback(
    (id: string): CategoryMutationResult => {
      const check = canDeleteCategory(id);
      if (!check.allowed) {
        return {
          success: false,
          reason: check.reason,
          affectedProducts: check.affectedProducts,
        };
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    },
    [canDeleteCategory]
  );

  const value: AdminContextType = {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    canDeleteCategory,
    getRootCategories,
    getChildCategories,
    hasChildren,
    brands,
    products,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

/**
 * Hook de acceso al contexto administrativo general.
 */
export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin debe ser utilizado dentro de un AdminProvider");
  }
  return context;
}
