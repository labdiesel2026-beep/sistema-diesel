import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { AdminCategory, AdminBrand, AdminProduct, IntegrityCheckResult } from "@/types/admin";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

/**
 * Métricas cuantitativas del catálogo sincronizadas desde PostgreSQL.
 * (RF-10, CA-10.1, Fase 6 RF-04)
 */
export interface CatalogMetrics {
  totalProducts: number;
  visibleProducts: number;
  hiddenProducts: number;
  featuredProducts?: number;
  totalCategories: number;
  totalBrands: number;
}

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
  // Estado y Sincronización
  isLoading: boolean;
  error: string | null;
  metrics: CatalogMetrics | null;
  refreshData: () => Promise<void>;
  refreshMetrics: () => Promise<void>;

  // Taxonomías (Categorías y Subcategorías)
  categories: AdminCategory[];
  createCategory: (input: {
    name: string;
    parentId: string | null;
  }) => Promise<CategoryMutationResult>;
  updateCategory: (
    id: string,
    input: { name: string; parentId: string | null },
  ) => Promise<CategoryMutationResult>;
  deleteCategory: (id: string) => Promise<CategoryMutationResult>;
  canDeleteCategory: (id: string) => IntegrityCheckResult;
  getRootCategories: () => AdminCategory[];
  getChildCategories: (parentId: string) => AdminCategory[];
  hasChildren: (categoryId: string) => boolean;
  getCategoryProductCount: (categoryId: string) => number;

  // Marcas
  brands: AdminBrand[];
  createBrand: (input: { name: string }) => Promise<BrandMutationResult>;
  updateBrand: (id: string, input: { name: string }) => Promise<BrandMutationResult>;
  deleteBrand: (id: string) => Promise<BrandMutationResult>;
  canDeleteBrand: (id: string) => IntegrityCheckResult;
  getBrandById: (id: string) => AdminBrand | undefined;
  getBrandProductCount: (brandId: string) => number;

  // Catálogo de Productos
  products: AdminProduct[];
  createProduct: (input: Omit<AdminProduct, "id">) => Promise<ProductMutationResult>;
  updateProduct: (
    id: string,
    input: Partial<Omit<AdminProduct, "id">>,
  ) => Promise<ProductMutationResult>;
  deleteProduct: (id: string) => Promise<ProductMutationResult>;
  toggleVisibility: (id: string) => Promise<ProductMutationResult>;
  toggleProductVisibility: (id: string) => Promise<ProductMutationResult>;
  toggleFeaturedProduct: (
    id: string,
    targetFeatured?: boolean,
  ) => Promise<ProductMutationResult>;
  searchProducts: (query: string) => AdminProduct[];
}

const AdminContext = createContext<AdminContextType | null>(null);

export interface AdminProviderProps {
  children: ReactNode;
  initialCategories?: AdminCategory[] | undefined;
  initialBrands?: AdminBrand[] | undefined;
  initialProducts?: AdminProduct[] | undefined;
  initialMetrics?: CatalogMetrics | undefined;
  autoFetch?: boolean | undefined;
}

/**
 * Proveedor de Estado Global de Administración con Persistencia Real en PostgreSQL.
 * (RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, Tarea 8.4)
 *
 * Conecta el frontend con la API REST de Node.js / Express (/server) mediante `api.ts`.
 * Todas las mutaciones persisten directamente en base de datos relacional y actualizan
 * el estado local de React exclusivamente tras confirmación HTTP 200/201.
 */
export function AdminProvider({
  children,
  initialCategories,
  initialBrands,
  initialProducts,
  initialMetrics,
  autoFetch = true,
}: AdminProviderProps) {
  const globalData = (globalThis as any).__TEST_ADMIN_INITIAL_DATA__;

  const [categories, setCategories] = useState<AdminCategory[]>(
    () => initialCategories ?? globalData?.categories ?? [],
  );
  const [brands, setBrands] = useState<AdminBrand[]>(
    () => initialBrands ?? globalData?.brands ?? [],
  );
  const [products, setProducts] = useState<AdminProduct[]>(
    () => initialProducts ?? globalData?.products ?? [],
  );
  const [metrics, setMetrics] = useState<CatalogMetrics | null>(
    () => initialMetrics ?? globalData?.metrics ?? null,
  );

  const [isLoading, setIsLoading] = useState<boolean>(!initialCategories && !globalData);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Sincronización Inicial y Recarga de Métricas desde PostgreSQL
  // -------------------------------------------------------------------------

  const refreshMetrics = useCallback(async () => {
    try {
      const data = await api.get<CatalogMetrics>("/api/admin/metrics");
      setMetrics(data);
    } catch {
      // Si falla la consulta de métricas se conserva el estado actual sin bloquear la UI
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedBrands, fetchedCategories, fetchedProducts, fetchedMetrics] = await Promise.all(
        [
          api.get<AdminBrand[]>("/api/brands"),
          api.get<any[]>("/api/categories"),
          api.get<any[]>("/api/products"),
          api.get<CatalogMetrics>("/api/admin/metrics"),
        ],
      );

      setBrands(fetchedBrands || []);
      setCategories(
        (fetchedCategories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          parentId: c.parentId ?? null,
        })),
      );
      setProducts(
        (fetchedProducts || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          imageUrl: p.imageUrl || "",
          brandId: p.brandId,
          categoryIds: p.categoryIds || [],
          vehicleCompatibility: p.vehicleCompatibility || "",
          condition: p.condition || "Nuevo",
          price: p.price !== null && p.price !== undefined ? Number(p.price) : null,
          showPrice: Boolean(p.showPrice),
          visible: Boolean(p.visible),
          oem: p.oem || "",
          isFeatured: Boolean(p.isFeatured),
          featuredAt: p.featuredAt ?? null,
        })),
      );
      setMetrics(fetchedMetrics || null);
    } catch (err: any) {
      const msg =
        (err instanceof ApiError && err.data?.message) ||
        err?.message ||
        "Error al conectar con el servidor de base de datos.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shouldAutoFetch = autoFetch && !globalData;

  useEffect(() => {
    if (shouldAutoFetch) {
      refreshData();
    }
  }, [shouldAutoFetch, refreshData]);

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
    [categories],
  );

  const hasChildren = useCallback(
    (categoryId: string) => {
      return categories.some((c) => c.parentId === categoryId);
    },
    [categories],
  );

  const getCategoryProductCount = useCallback(
    (categoryId: string) => {
      return products.filter((p) => p.categoryIds.includes(categoryId)).length;
    },
    [products],
  );

  // -------------------------------------------------------------------------
  // Verificación Preventiva de Integridad de Categoría
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
      const linkedProducts = products.filter((p) => p.categoryIds.includes(id));
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
    [categories, products],
  );

  // -------------------------------------------------------------------------
  // Mutaciones de Categorías con Persistencia Real (POST, PUT, DELETE)
  // -------------------------------------------------------------------------

  const createCategory = useCallback(
    async (input: { name: string; parentId: string | null }): Promise<CategoryMutationResult> => {
      const trimmedName = input.name.trim();

      if (trimmedName.length < 2) {
        return {
          success: false,
          reason: "El nombre de la categoría debe tener al menos 2 caracteres.",
        };
      }

      // Validación preventiva local de unicidad
      const isDuplicate = categories.some(
        (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );
      if (isDuplicate) {
        return {
          success: false,
          reason: "Ya existe una categoría con este nombre.",
        };
      }

      // Validación de 1 nivel de anidamiento
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

      try {
        const response = await api.post<any>("/api/categories", {
          name: trimmedName,
          parentId: input.parentId,
        });

        const newCategory: AdminCategory = {
          id: response.id,
          name: response.name,
          parentId: response.parentId ?? null,
        };

        setCategories((prev) => [...prev, newCategory]);
        refreshMetrics().catch(() => {});

        return {
          success: true,
          category: newCategory,
        };
      } catch (err: any) {
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "Error al crear la categoría en el servidor.";
        return {
          success: false,
          reason,
        };
      }
    },
    [categories, refreshMetrics],
  );

  const updateCategory = useCallback(
    async (
      id: string,
      input: { name: string; parentId: string | null },
    ): Promise<CategoryMutationResult> => {
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

      const isDuplicate = categories.some(
        (c) => c.id !== id && c.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );
      if (isDuplicate) {
        return {
          success: false,
          reason: "Ya existe una categoría con este nombre.",
        };
      }

      const categoryHasChildren = categories.some((c) => c.parentId === id);
      if (categoryHasChildren && input.parentId !== null) {
        return {
          success: false,
          reason:
            "No se puede convertir una categoría padre con subcategorías asociadas en una subcategoría hija.",
        };
      }

      if (input.parentId === id) {
        return {
          success: false,
          reason: "Una categoría no puede ser su propio padre.",
        };
      }

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

      try {
        const response = await api.put<any>(`/api/categories/${id}`, {
          name: trimmedName,
          parentId: input.parentId,
        });

        const updatedCategory: AdminCategory = {
          id: response.id,
          name: response.name,
          parentId: response.parentId ?? null,
        };

        setCategories((prev) => prev.map((c) => (c.id === id ? updatedCategory : c)));

        return {
          success: true,
          category: updatedCategory,
        };
      } catch (err: any) {
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "Error al actualizar la categoría en el servidor.";
        return {
          success: false,
          reason,
        };
      }
    },
    [categories],
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<CategoryMutationResult> => {
      const check = canDeleteCategory(id);
      if (!check.allowed) {
        return {
          success: false,
          blocked: true,
          reason: check.reason,
          affectedProducts: check.affectedProducts,
        };
      }

      try {
        await api.delete<{ success: boolean; message: string }>(`/api/categories/${id}`);

        setCategories((prev) => prev.filter((c) => c.id !== id));
        refreshMetrics().catch(() => {});

        return { success: true, blocked: false };
      } catch (err: any) {
        const isConflict = err instanceof ApiError && err.status === 409;
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "No se pudo eliminar la categoría en el servidor.";
        return {
          success: false,
          blocked: isConflict,
          reason,
        };
      }
    },
    [canDeleteCategory, refreshMetrics],
  );

  // -------------------------------------------------------------------------
  // Helpers y Verificación Preventiva de Marcas
  // -------------------------------------------------------------------------

  const getBrandById = useCallback(
    (id: string): AdminBrand | undefined => {
      return brands.find((b) => b.id === id);
    },
    [brands],
  );

  const getBrandProductCount = useCallback(
    (brandId: string): number => {
      return products.filter((p) => p.brandId === brandId).length;
    },
    [products],
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
    [brands, products],
  );

  // -------------------------------------------------------------------------
  // Mutaciones de Marcas con Persistencia Real (POST, PUT, DELETE)
  // -------------------------------------------------------------------------

  const createBrand = useCallback(
    async (input: { name: string }): Promise<BrandMutationResult> => {
      const trimmedName = input.name.trim();

      if (trimmedName.length < 2) {
        return {
          success: false,
          reason: "El nombre de la marca debe tener al menos 2 caracteres.",
        };
      }

      const isDuplicate = brands.some(
        (b) => b.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );
      if (isDuplicate) {
        return {
          success: false,
          reason: "Ya existe una marca con este nombre.",
        };
      }

      try {
        const response = await api.post<AdminBrand>("/api/brands", {
          name: trimmedName,
        });

        const newBrand: AdminBrand = {
          id: response.id,
          name: response.name,
        };

        setBrands((prev) => [...prev, newBrand]);
        refreshMetrics().catch(() => {});

        return {
          success: true,
          brand: newBrand,
        };
      } catch (err: any) {
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "Error al registrar la marca en el servidor.";
        return {
          success: false,
          reason,
        };
      }
    },
    [brands, refreshMetrics],
  );

  const updateBrand = useCallback(
    async (id: string, input: { name: string }): Promise<BrandMutationResult> => {
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

      const isDuplicate = brands.some(
        (b) => b.id !== id && b.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );
      if (isDuplicate) {
        return {
          success: false,
          reason: "Ya existe una marca con este nombre.",
        };
      }

      try {
        const response = await api.put<AdminBrand>(`/api/brands/${id}`, {
          name: trimmedName,
        });

        const updatedBrand: AdminBrand = {
          id: response.id,
          name: response.name,
        };

        setBrands((prev) => prev.map((b) => (b.id === id ? updatedBrand : b)));

        return {
          success: true,
          brand: updatedBrand,
        };
      } catch (err: any) {
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "Error al actualizar la marca en el servidor.";
        return {
          success: false,
          reason,
        };
      }
    },
    [brands],
  );

  const deleteBrand = useCallback(
    async (id: string): Promise<BrandMutationResult> => {
      const check = canDeleteBrand(id);
      if (!check.allowed) {
        return {
          success: false,
          blocked: true,
          reason: check.reason,
          affectedProducts: check.affectedProducts,
        };
      }

      try {
        await api.delete<{ success: boolean; message: string }>(`/api/brands/${id}`);

        setBrands((prev) => prev.filter((b) => b.id !== id));
        refreshMetrics().catch(() => {});

        return { success: true, blocked: false };
      } catch (err: any) {
        const isConflict = err instanceof ApiError && err.status === 409;
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "No se pudo eliminar la marca en el servidor.";
        return {
          success: false,
          blocked: isConflict,
          reason,
        };
      }
    },
    [canDeleteBrand, refreshMetrics],
  );

  // -------------------------------------------------------------------------
  // Mutaciones de Productos con Persistencia Real (POST, PUT, PATCH, DELETE)
  // -------------------------------------------------------------------------

  const createProduct = useCallback(
    async (input: Omit<AdminProduct, "id">): Promise<ProductMutationResult> => {
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

      try {
        const payload = {
          name: trimmedName,
          description: input.description?.trim() ?? "",
          imageUrl: input.imageUrl,
          brandId: input.brandId,
          categoryIds: input.categoryIds,
          condition: input.condition,
          price: input.price,
          showPrice: input.showPrice,
          visible: input.visible,
          oem: input.oem ? input.oem.trim() : null,
          vehicleCompatibility: input.vehicleCompatibility
            ? input.vehicleCompatibility.trim()
            : null,
          isFeatured: Boolean(input.isFeatured),
        };

        const response = await api.post<any>("/api/products", payload);

        const newProduct: AdminProduct = {
          id: response.id,
          name: response.name,
          description: response.description,
          imageUrl: response.imageUrl,
          brandId: response.brandId,
          categoryIds: response.categoryIds || [],
          vehicleCompatibility: response.vehicleCompatibility || "",
          condition: response.condition,
          price:
            response.price !== null && response.price !== undefined ? Number(response.price) : null,
          showPrice: Boolean(response.showPrice),
          visible: Boolean(response.visible),
          oem: response.oem || "",
          isFeatured: Boolean(response.isFeatured),
          featuredAt: response.featuredAt ?? null,
        };

        setProducts((prev) => [newProduct, ...prev]);
        refreshMetrics().catch(() => {});

        return {
          success: true,
          product: newProduct,
        };
      } catch (err: any) {
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "Error al crear el producto en el servidor.";
        return {
          success: false,
          reason,
        };
      }
    },
    [refreshMetrics],
  );

  const updateProduct = useCallback(
    async (
      id: string,
      input: Partial<Omit<AdminProduct, "id">>,
    ): Promise<ProductMutationResult> => {
      const currentProduct = products.find((p) => p.id === id);
      if (!currentProduct) {
        return {
          success: false,
          reason: "Producto no encontrado.",
        };
      }

      try {
        const merged = { ...currentProduct, ...input };
        const payload = {
          name: merged.name.trim(),
          description: merged.description.trim(),
          imageUrl: merged.imageUrl,
          brandId: merged.brandId,
          categoryIds: merged.categoryIds,
          condition: merged.condition,
          price: merged.price,
          showPrice: merged.showPrice,
          visible: merged.visible,
          oem: merged.oem ? merged.oem.trim() : null,
          vehicleCompatibility: merged.vehicleCompatibility
            ? merged.vehicleCompatibility.trim()
            : null,
          isFeatured: merged.isFeatured,
        };

        const response = await api.put<any>(`/api/products/${id}`, payload);

        const updatedProduct: AdminProduct = {
          id: response.id,
          name: response.name,
          description: response.description,
          imageUrl: response.imageUrl,
          brandId: response.brandId,
          categoryIds: response.categoryIds || [],
          vehicleCompatibility: response.vehicleCompatibility || "",
          condition: response.condition,
          price:
            response.price !== null && response.price !== undefined ? Number(response.price) : null,
          showPrice: Boolean(response.showPrice),
          visible: Boolean(response.visible),
          oem: response.oem || "",
          isFeatured: Boolean(response.isFeatured),
          featuredAt: response.featuredAt ?? null,
        };

        setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
        refreshMetrics().catch(() => {});

        return {
          success: true,
          product: updatedProduct,
        };
      } catch (err: any) {
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "Error al actualizar el producto en el servidor.";
        return {
          success: false,
          reason,
        };
      }
    },
    [products, refreshMetrics],
  );

  const toggleProductVisibility = useCallback(
    async (id: string): Promise<ProductMutationResult> => {
      const currentProduct = products.find((p) => p.id === id);
      if (!currentProduct) {
        return {
          success: false,
          reason: "Producto no encontrado.",
        };
      }

      try {
        const nextVisible = !currentProduct.visible;
        const response = await api.patch<any>(`/api/products/${id}/visibility`, {
          visible: nextVisible,
        });

        const updatedProduct: AdminProduct = {
          ...currentProduct,
          visible: response.visible,
          isFeatured:
            response.isFeatured !== undefined
              ? Boolean(response.isFeatured)
              : Boolean(currentProduct.isFeatured),
          featuredAt:
            response.featuredAt !== undefined
              ? response.featuredAt
              : (currentProduct.featuredAt ?? null),
        };

        setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
        refreshMetrics().catch(() => {});

        return {
          success: true,
          product: updatedProduct,
        };
      } catch (err: any) {
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "Error al modificar la visibilidad en el servidor.";
        return {
          success: false,
          reason,
        };
      }
    },
    [products, refreshMetrics],
  );

  const toggleVisibility = toggleProductVisibility;

  const toggleFeaturedProduct = useCallback(
    async (id: string, targetFeatured?: boolean): Promise<ProductMutationResult> => {
      const currentProduct = products.find((p) => p.id === id);
      if (!currentProduct) {
        return {
          success: false,
          reason: "Producto no encontrado.",
        };
      }

      const nextFeatured =
        targetFeatured !== undefined ? targetFeatured : !currentProduct.isFeatured;

      // Restricción preventiva de UI (RF-05, CA-01.4)
      if (nextFeatured && !currentProduct.visible) {
        const errorMsg = "No se puede destacar un producto con visibilidad oculta.";
        toast.error(errorMsg);
        return {
          success: false,
          reason: errorMsg,
        };
      }

      try {
        const response = await api.patch<any>(`/api/products/${id}/featured`, {
          isFeatured: nextFeatured,
        });

        const updatedProduct: AdminProduct = {
          ...currentProduct,
          isFeatured: Boolean(response.isFeatured),
          featuredAt: response.featuredAt ?? null,
        };

        setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
        refreshMetrics().catch(() => {});

        toast.success(
          nextFeatured ? "Producto añadido a destacados" : "Producto removido de destacados",
        );

        return {
          success: true,
          product: updatedProduct,
        };
      } catch (err: any) {
        let reason = "Error al actualizar el estado de destacado.";
        if (err instanceof ApiError) {
          if (err.status === 409) {
            reason = "Límite alcanzado. Desmarca un producto primero";
          } else if (err.data?.error) {
            reason = err.data.error;
          } else if (err.message) {
            reason = err.message;
          }
        }
        toast.error(reason);
        return {
          success: false,
          reason,
        };
      }
    },
    [products, refreshMetrics],
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<ProductMutationResult> => {
      const currentProduct = products.find((p) => p.id === id);
      if (!currentProduct) {
        return {
          success: false,
          reason: "Producto no encontrado.",
        };
      }

      try {
        await api.delete<{ success: boolean; message: string }>(`/api/products/${id}`);

        setProducts((prev) => prev.filter((p) => p.id !== id));
        refreshMetrics().catch(() => {});

        return { success: true };
      } catch (err: any) {
        const reason =
          (err instanceof ApiError && err.data?.message) ||
          err?.message ||
          "Error al eliminar el producto en el servidor.";
        return {
          success: false,
          reason,
        };
      }
    },
    [products, refreshMetrics],
  );

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
    [products],
  );

  const value: AdminContextType = {
    isLoading,
    error,
    metrics,
    refreshData,
    refreshMetrics,

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
    toggleFeaturedProduct,
    searchProducts,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
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
