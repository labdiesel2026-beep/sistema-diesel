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
  blocked?: boolean | undefined;
  reason?: string | undefined;
  affectedProducts?: string[] | undefined;
  category?: AdminCategory | undefined;
}

/**
 * Resultado estructurado para operaciones de mutación de marcas.
 * (CA-12.1 - CA-12.5, CL-06, CL-09)
 */
export interface BrandMutationResult {
  success: boolean;
  blocked?: boolean | undefined;
  reason?: string | undefined;
  affectedProducts?: string[] | undefined;
  brand?: AdminBrand | undefined;
}

/**
 * Resultado estructurado para operaciones de mutación de productos.
 * (RF-05, RF-06, RF-07, CL-06, CL-11)
 */
export interface ProductMutationResult {
  success: boolean;
  reason?: string | undefined;
  product?: AdminProduct | undefined;
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
  getCategoryProductCount: (categoryId: string) => number;

  // Marcas
  brands: AdminBrand[];
  createBrand: (input: { name: string }) => BrandMutationResult;
  updateBrand: (id: string, input: { name: string }) => BrandMutationResult;
  deleteBrand: (id: string) => BrandMutationResult;
  canDeleteBrand: (id: string) => IntegrityCheckResult;
  getBrandById: (id: string) => AdminBrand | undefined;
  getBrandProductCount: (brandId: string) => number;

  // Catálogo de Productos
  products: AdminProduct[];
  createProduct: (input: Omit<AdminProduct, "id">) => ProductMutationResult;
  updateProduct: (
    id: string,
    input: Partial<Omit<AdminProduct, "id">>
  ) => ProductMutationResult;
  deleteProduct: (id: string) => ProductMutationResult;
  toggleVisibility: (id: string) => ProductMutationResult;
  toggleProductVisibility: (id: string) => ProductMutationResult;
  searchProducts: (query: string) => AdminProduct[];
}

const AdminContext = createContext<AdminContextType | null>(null);

export interface AdminProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de Estado Global de Administración en Memoria Volátil.
 * (RF-05, RF-06, RF-07, RF-10, RF-11, RF-12, RF-15, CA-10.1 - CA-12.5, CL-04 - CL-11)
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

  const getCategoryProductCount = useCallback(
    (categoryId: string) => {
      return products.filter((p) => p.categoryIds.includes(categoryId)).length;
    },
    [products]
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
          blocked: true,
          reason: "La categoría especificada no existe.",
        };
      }

      // Bloqueo 1: Subcategorías vinculadas (CA-11.2)
      const childCategories = categories.filter((c) => c.parentId === id);
      if (childCategories.length > 0) {
        return {
          allowed: false,
          blocked: true,
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
          blocked: true,
          reason:
            "No se puede eliminar la categoría porque contiene productos asociados. Debe reasignarlos antes de continuar.",
          affectedProducts: linkedProducts.map((p) => p.name),
        };
      }

      return { allowed: true, blocked: false };
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
          blocked: true,
          reason: check.reason,
          affectedProducts: check.affectedProducts,
        };
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      return { success: true, blocked: false };
    },
    [canDeleteCategory]
  );

  // -------------------------------------------------------------------------
  // Helpers y Verificación de Integridad de Marcas (RF-12, CA-12.3, CL-06)
  // -------------------------------------------------------------------------

  const getBrandById = useCallback(
    (id: string): AdminBrand | undefined => {
      return brands.find((b) => b.id === id);
    },
    [brands]
  );

  const getBrandProductCount = useCallback(
    (brandId: string): number => {
      return products.filter((p) => p.brandId === brandId).length;
    },
    [products]
  );

  const canDeleteBrand = useCallback(
    (id: string): IntegrityCheckResult => {
      const targetBrand = brands.find((b) => b.id === id);
      if (!targetBrand) {
        return {
          allowed: false,
          blocked: true,
          reason: "La marca especificada no existe.",
        };
      }

      // Bloqueo estricto: Productos vinculados (CA-12.3, CL-06)
      const linkedProducts = products.filter((p) => p.brandId === id);
      if (linkedProducts.length > 0) {
        return {
          allowed: false,
          blocked: true,
          reason:
            "No se puede eliminar la marca porque contiene productos asociados. Debe reasignarlos antes de continuar.",
          affectedProducts: linkedProducts.map((p) => p.name),
        };
      }

      return { allowed: true, blocked: false };
    },
    [brands, products]
  );

  // -------------------------------------------------------------------------
  // Mutaciones de Marcas (RF-12, CA-12.1 - CA-12.5, CL-09)
  // -------------------------------------------------------------------------

  const createBrand = useCallback(
    (input: { name: string }): BrandMutationResult => {
      const trimmedName = input.name.trim();

      if (trimmedName.length < 2) {
        return {
          success: false,
          reason: "El nombre de la marca debe tener al menos 2 caracteres.",
        };
      }

      // Validación de unicidad case-insensitive con trim (CA-12.2)
      const isDuplicate = brands.some(
        (b) => b.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        return {
          success: false,
          reason: "Ya existe una marca con este nombre.",
        };
      }

      const newBrand: AdminBrand = {
        id: crypto.randomUUID(),
        name: trimmedName,
      };

      setBrands((prev) => [...prev, newBrand]);

      return {
        success: true,
        brand: newBrand,
      };
    },
    [brands]
  );

  const updateBrand = useCallback(
    (id: string, input: { name: string }): BrandMutationResult => {
      const currentBrand = brands.find((b) => b.id === id);
      if (!currentBrand) {
        return {
          success: false,
          reason: "Marca no encontrada.",
        };
      }

      const trimmedName = input.name.trim();
      if (trimmedName.length < 2) {
        return {
          success: false,
          reason: "El nombre de la marca debe tener al menos 2 caracteres.",
        };
      }

      // Unicidad case-insensitive respecto a otras marcas (CA-12.2)
      const isDuplicate = brands.some(
        (b) =>
          b.id !== id &&
          b.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        return {
          success: false,
          reason: "Ya existe una marca con este nombre.",
        };
      }

      // Renombrado por UUID preservando relaciones (CA-12.4, CL-09)
      const updatedBrand: AdminBrand = {
        ...currentBrand,
        name: trimmedName,
      };

      setBrands((prev) =>
        prev.map((b) => (b.id === id ? updatedBrand : b))
      );

      return {
        success: true,
        brand: updatedBrand,
      };
    },
    [brands]
  );

  const deleteBrand = useCallback(
    (id: string): BrandMutationResult => {
      const check = canDeleteBrand(id);
      if (!check.allowed) {
        return {
          success: false,
          blocked: true,
          reason: check.reason,
          affectedProducts: check.affectedProducts,
        };
      }

      setBrands((prev) => prev.filter((b) => b.id !== id));
      return { success: true, blocked: false };
    },
    [canDeleteBrand]
  );

  // -------------------------------------------------------------------------
  // Mutaciones y Consultas de Productos (RF-05, RF-06, RF-07, CL-11)
  // -------------------------------------------------------------------------

  const createProduct = useCallback(
    (input: Omit<AdminProduct, "id">): ProductMutationResult => {
      const trimmedName = input.name?.trim() ?? "";
      if (trimmedName.length < 3) {
        return {
          success: false,
          reason: "El nombre del producto debe tener al menos 3 caracteres.",
        };
      }

      if (!input.categoryIds || input.categoryIds.length === 0) {
        return {
          success: false,
          reason: "Debe seleccionar al menos una categoría.",
        };
      }

      const newProduct: AdminProduct = {
        ...input,
        id: crypto.randomUUID(),
        name: trimmedName,
      };

      setProducts((prev) => [newProduct, ...prev]);

      return {
        success: true,
        product: newProduct,
      };
    },
    []
  );

  const updateProduct = useCallback(
    (
      id: string,
      input: Partial<Omit<AdminProduct, "id">>
    ): ProductMutationResult => {
      const currentProduct = products.find((p) => p.id === id);
      if (!currentProduct) {
        return {
          success: false,
          reason: "Producto no encontrado.",
        };
      }

      const updatedProduct: AdminProduct = {
        ...currentProduct,
        ...input,
        id,
      };

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );

      return {
        success: true,
        product: updatedProduct,
      };
    },
    [products]
  );

  const deleteProduct = useCallback(
    (id: string): ProductMutationResult => {
      const currentProduct = products.find((p) => p.id === id);
      if (!currentProduct) {
        return {
          success: false,
          reason: "Producto no encontrado.",
        };
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    },
    [products]
  );

  const toggleProductVisibility = useCallback(
    (id: string): ProductMutationResult => {
      const currentProduct = products.find((p) => p.id === id);
      if (!currentProduct) {
        return {
          success: false,
          reason: "Producto no encontrado.",
        };
      }

      const updatedProduct: AdminProduct = {
        ...currentProduct,
        visible: !currentProduct.visible,
      };

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );

      return {
        success: true,
        product: updatedProduct,
      };
    },
    [products]
  );

  const toggleVisibility = toggleProductVisibility;

  /**
   * Búsqueda en catálogo literal insensible a mayúsculas/minúsculas.
   * Evita excepciones de sintaxis ante caracteres especiales RegExp (CA-06.4, CL-11).
   */
  const searchProducts = useCallback(
    (query: string): AdminProduct[] => {
      const clean = query.trim().toLowerCase();
      if (!clean) return products;
      return products.filter((p) => {
        return (
          p.name.toLowerCase().includes(clean) ||
          p.oem.toLowerCase().includes(clean) ||
          p.description.toLowerCase().includes(clean) ||
          p.vehicleCompatibility.toLowerCase().includes(clean)
        );
      });
    },
    [products]
  );

  const value: AdminContextType = {
    // Taxonomías
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    canDeleteCategory,
    getRootCategories,
    getChildCategories,
    hasChildren,
    getCategoryProductCount,

    // Marcas
    brands,
    createBrand,
    updateBrand,
    deleteBrand,
    canDeleteBrand,
    getBrandById,
    getBrandProductCount,

    // Productos
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleVisibility,
    toggleProductVisibility,
    searchProducts,
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
