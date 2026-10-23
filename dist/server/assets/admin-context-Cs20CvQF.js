import { n as api, t as ApiError } from "./api-Db5K75is.js";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/context/admin-context.tsx
var AdminContext = createContext(null);
/**
* Proveedor de Estado Global de Administración con Persistencia Real en PostgreSQL.
* (RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, Tarea 8.4)
*
* Conecta el frontend con la API REST de Node.js / Express (/server) mediante `api.ts`.
* Todas las mutaciones persisten directamente en base de datos relacional y actualizan
* el estado local de React exclusivamente tras confirmación HTTP 200/201.
*/
function AdminProvider({ children, initialCategories, initialBrands, initialProducts, initialMetrics, autoFetch = true }) {
	const globalData = globalThis.__TEST_ADMIN_INITIAL_DATA__;
	const [categories, setCategories] = useState(() => initialCategories ?? globalData?.categories ?? []);
	const [brands, setBrands] = useState(() => initialBrands ?? globalData?.brands ?? []);
	const [products, setProducts] = useState(() => initialProducts ?? globalData?.products ?? []);
	const [metrics, setMetrics] = useState(() => initialMetrics ?? globalData?.metrics ?? null);
	const [isLoading, setIsLoading] = useState(!initialCategories && !globalData);
	const [error, setError] = useState(null);
	const refreshMetrics = useCallback(async () => {
		try {
			const data = await api.get("/api/admin/metrics");
			setMetrics(data);
		} catch {}
	}, []);
	const refreshData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [fetchedBrands, fetchedCategories, fetchedProducts, fetchedMetrics] = await Promise.all([
				api.get("/api/brands"),
				api.get("/api/categories"),
				api.get("/api/products"),
				api.get("/api/admin/metrics")
			]);
			setBrands(fetchedBrands || []);
			setCategories((fetchedCategories || []).map((c) => ({
				id: c.id,
				name: c.name,
				parentId: c.parentId ?? null
			})));
			setProducts((fetchedProducts || []).map((p) => ({
				id: p.id,
				name: p.name,
				description: p.description || "",
				imageUrl: p.imageUrl || "",
				brandId: p.brandId,
				categoryIds: p.categoryIds || [],
				vehicleCompatibility: p.vehicleCompatibility || "",
				condition: p.condition || "Nuevo",
				price: p.price !== null && p.price !== void 0 ? Number(p.price) : null,
				showPrice: Boolean(p.showPrice),
				visible: Boolean(p.visible),
				oem: p.oem || "",
				isFeatured: Boolean(p.isFeatured),
				featuredAt: p.featuredAt ?? null
			})));
			setMetrics(fetchedMetrics || null);
		} catch (err) {
			let msg = "Error al conectar con el servidor de base de datos.";
			if (err instanceof ApiError) {
				const serverError = err.data?.error || err.data?.message || err.message;
				if (serverError && typeof serverError === "string") msg = serverError.startsWith("Referencia:") ? `Error del servidor. ${serverError}` : serverError;
			} else if (err?.message) msg = err.message;
			setError(msg);
		} finally {
			setIsLoading(false);
		}
	}, []);
	const shouldAutoFetch = autoFetch && !globalData;
	useEffect(() => {
		if (shouldAutoFetch) refreshData();
	}, [shouldAutoFetch, refreshData]);
	const getRootCategories = useCallback(() => {
		return categories.filter((c) => c.parentId === null);
	}, [categories]);
	const getChildCategories = useCallback((parentId) => {
		return categories.filter((c) => c.parentId === parentId);
	}, [categories]);
	const hasChildren = useCallback((categoryId) => {
		return categories.some((c) => c.parentId === categoryId);
	}, [categories]);
	const getCategoryProductCount = useCallback((categoryId) => {
		return products.filter((p) => p.categoryIds.includes(categoryId)).length;
	}, [products]);
	const canDeleteCategory = useCallback((id) => {
		if (!categories.find((c) => c.id === id)) return {
			allowed: false,
			blocked: true,
			reason: "La categoría especificada no existe."
		};
		if (categories.filter((c) => c.parentId === id).length > 0) return {
			allowed: false,
			blocked: true,
			reason: "No se puede eliminar la categoría porque posee subcategorías vinculadas. Reasigne o elimine primero las subcategorías."
		};
		const linkedProducts = products.filter((p) => p.categoryIds.includes(id));
		if (linkedProducts.length > 0) return {
			allowed: false,
			blocked: true,
			reason: "No se puede eliminar la categoría porque contiene productos asociados. Debe reasignarlos antes de continuar.",
			affectedProducts: linkedProducts.map((p) => p.name)
		};
		return {
			allowed: true,
			blocked: false
		};
	}, [categories, products]);
	const createCategory = useCallback(async (input) => {
		const trimmedName = input.name.trim();
		if (trimmedName.length < 2) return {
			success: false,
			reason: "El nombre de la categoría debe tener al menos 2 caracteres."
		};
		if (categories.some((c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase())) return {
			success: false,
			reason: "Ya existe una categoría con este nombre."
		};
		if (input.parentId !== null) {
			const parentCategory = categories.find((c) => c.id === input.parentId);
			if (!parentCategory) return {
				success: false,
				reason: "La categoría padre seleccionada no existe."
			};
			if (parentCategory.parentId !== null) return {
				success: false,
				reason: "Una subcategoría solo puede tener como padre una categoría principal de nivel raíz."
			};
		}
		try {
			const response = await api.post("/api/categories", {
				name: trimmedName,
				parentId: input.parentId
			});
			const newCategory = {
				id: response.id,
				name: response.name,
				parentId: response.parentId ?? null
			};
			setCategories((prev) => [...prev, newCategory]);
			refreshMetrics().catch(() => {});
			return {
				success: true,
				category: newCategory
			};
		} catch (err) {
			return {
				success: false,
				reason: err instanceof ApiError && err.data?.message || err?.message || "Error al crear la categoría en el servidor."
			};
		}
	}, [categories, refreshMetrics]);
	const updateCategory = useCallback(async (id, input) => {
		if (!categories.find((c) => c.id === id)) return {
			success: false,
			reason: "Categoría no encontrada."
		};
		const trimmedName = input.name.trim();
		if (trimmedName.length < 2) return {
			success: false,
			reason: "El nombre de la categoría debe tener al menos 2 caracteres."
		};
		if (categories.some((c) => c.id !== id && c.name.trim().toLowerCase() === trimmedName.toLowerCase())) return {
			success: false,
			reason: "Ya existe una categoría con este nombre."
		};
		if (categories.some((c) => c.parentId === id) && input.parentId !== null) return {
			success: false,
			reason: "No se puede convertir una categoría padre con subcategorías asociadas en una subcategoría hija."
		};
		if (input.parentId === id) return {
			success: false,
			reason: "Una categoría no puede ser su propio padre."
		};
		if (input.parentId !== null) {
			const targetParent = categories.find((c) => c.id === input.parentId);
			if (!targetParent) return {
				success: false,
				reason: "La categoría padre seleccionada no existe."
			};
			if (targetParent.parentId !== null) return {
				success: false,
				reason: "Una subcategoría solo puede tener como padre una categoría principal de nivel raíz."
			};
		}
		try {
			const response = await api.put(`/api/categories/${id}`, {
				name: trimmedName,
				parentId: input.parentId
			});
			const updatedCategory = {
				id: response.id,
				name: response.name,
				parentId: response.parentId ?? null
			};
			setCategories((prev) => prev.map((c) => c.id === id ? updatedCategory : c));
			return {
				success: true,
				category: updatedCategory
			};
		} catch (err) {
			return {
				success: false,
				reason: err instanceof ApiError && err.data?.message || err?.message || "Error al actualizar la categoría en el servidor."
			};
		}
	}, [categories]);
	const deleteCategory = useCallback(async (id) => {
		const check = canDeleteCategory(id);
		if (!check.allowed) return {
			success: false,
			blocked: true,
			reason: check.reason,
			affectedProducts: check.affectedProducts
		};
		try {
			await api.delete(`/api/categories/${id}`);
			setCategories((prev) => prev.filter((c) => c.id !== id));
			refreshMetrics().catch(() => {});
			return {
				success: true,
				blocked: false
			};
		} catch (err) {
			return {
				success: false,
				blocked: err instanceof ApiError && err.status === 409,
				reason: err instanceof ApiError && err.data?.message || err?.message || "No se pudo eliminar la categoría en el servidor."
			};
		}
	}, [canDeleteCategory, refreshMetrics]);
	const getBrandById = useCallback((id) => {
		return brands.find((b) => b.id === id);
	}, [brands]);
	const getBrandProductCount = useCallback((brandId) => {
		return products.filter((p) => p.brandId === brandId).length;
	}, [products]);
	const canDeleteBrand = useCallback((id) => {
		if (!brands.find((b) => b.id === id)) return {
			allowed: false,
			blocked: true,
			reason: "La marca especificada no existe."
		};
		const linkedProducts = products.filter((p) => p.brandId === id);
		if (linkedProducts.length > 0) return {
			allowed: false,
			blocked: true,
			reason: "No se puede eliminar la marca porque contiene productos asociados. Debe reasignarlos antes de continuar.",
			affectedProducts: linkedProducts.map((p) => p.name)
		};
		return {
			allowed: true,
			blocked: false
		};
	}, [brands, products]);
	const createBrand = useCallback(async (input) => {
		const trimmedName = input.name.trim();
		if (trimmedName.length < 2) return {
			success: false,
			reason: "El nombre de la marca debe tener al menos 2 caracteres."
		};
		if (brands.some((b) => b.name.trim().toLowerCase() === trimmedName.toLowerCase())) return {
			success: false,
			reason: "Ya existe una marca con este nombre."
		};
		try {
			const response = await api.post("/api/brands", { name: trimmedName });
			const newBrand = {
				id: response.id,
				name: response.name
			};
			setBrands((prev) => [...prev, newBrand]);
			refreshMetrics().catch(() => {});
			return {
				success: true,
				brand: newBrand
			};
		} catch (err) {
			return {
				success: false,
				reason: err instanceof ApiError && err.data?.message || err?.message || "Error al registrar la marca en el servidor."
			};
		}
	}, [brands, refreshMetrics]);
	const updateBrand = useCallback(async (id, input) => {
		if (!brands.find((b) => b.id === id)) return {
			success: false,
			reason: "Marca no encontrada."
		};
		const trimmedName = input.name.trim();
		if (trimmedName.length < 2) return {
			success: false,
			reason: "El nombre de la marca debe tener al menos 2 caracteres."
		};
		if (brands.some((b) => b.id !== id && b.name.trim().toLowerCase() === trimmedName.toLowerCase())) return {
			success: false,
			reason: "Ya existe una marca con este nombre."
		};
		try {
			const response = await api.put(`/api/brands/${id}`, { name: trimmedName });
			const updatedBrand = {
				id: response.id,
				name: response.name
			};
			setBrands((prev) => prev.map((b) => b.id === id ? updatedBrand : b));
			return {
				success: true,
				brand: updatedBrand
			};
		} catch (err) {
			return {
				success: false,
				reason: err instanceof ApiError && err.data?.message || err?.message || "Error al actualizar la marca en el servidor."
			};
		}
	}, [brands]);
	const deleteBrand = useCallback(async (id) => {
		const check = canDeleteBrand(id);
		if (!check.allowed) return {
			success: false,
			blocked: true,
			reason: check.reason,
			affectedProducts: check.affectedProducts
		};
		try {
			await api.delete(`/api/brands/${id}`);
			setBrands((prev) => prev.filter((b) => b.id !== id));
			refreshMetrics().catch(() => {});
			return {
				success: true,
				blocked: false
			};
		} catch (err) {
			return {
				success: false,
				blocked: err instanceof ApiError && err.status === 409,
				reason: err instanceof ApiError && err.data?.message || err?.message || "No se pudo eliminar la marca en el servidor."
			};
		}
	}, [canDeleteBrand, refreshMetrics]);
	const createProduct = useCallback(async (input) => {
		const trimmedName = input.name?.trim() ?? "";
		if (trimmedName.length < 3) return {
			success: false,
			reason: "El nombre del producto debe tener al menos 3 caracteres."
		};
		if (!input.categoryIds || input.categoryIds.length === 0) return {
			success: false,
			reason: "Debe seleccionar al menos una categoría."
		};
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
				vehicleCompatibility: input.vehicleCompatibility ? input.vehicleCompatibility.trim() : null,
				isFeatured: Boolean(input.isFeatured)
			};
			const response = await api.post("/api/products", payload);
			const newProduct = {
				id: response.id,
				name: response.name,
				description: response.description,
				imageUrl: response.imageUrl,
				brandId: response.brandId,
				categoryIds: response.categoryIds || [],
				vehicleCompatibility: response.vehicleCompatibility || "",
				condition: response.condition,
				price: response.price !== null && response.price !== void 0 ? Number(response.price) : null,
				showPrice: Boolean(response.showPrice),
				visible: Boolean(response.visible),
				oem: response.oem || "",
				isFeatured: Boolean(response.isFeatured),
				featuredAt: response.featuredAt ?? null
			};
			setProducts((prev) => [newProduct, ...prev]);
			refreshMetrics().catch(() => {});
			return {
				success: true,
				product: newProduct
			};
		} catch (err) {
			return {
				success: false,
				reason: err instanceof ApiError && err.data?.message || err?.message || "Error al crear el producto en el servidor."
			};
		}
	}, [refreshMetrics]);
	const updateProduct = useCallback(async (id, input) => {
		const currentProduct = products.find((p) => p.id === id);
		if (!currentProduct) return {
			success: false,
			reason: "Producto no encontrado."
		};
		try {
			const merged = {
				...currentProduct,
				...input
			};
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
				vehicleCompatibility: merged.vehicleCompatibility ? merged.vehicleCompatibility.trim() : null,
				isFeatured: merged.isFeatured
			};
			const response = await api.put(`/api/products/${id}`, payload);
			const updatedProduct = {
				id: response.id,
				name: response.name,
				description: response.description,
				imageUrl: response.imageUrl,
				brandId: response.brandId,
				categoryIds: response.categoryIds || [],
				vehicleCompatibility: response.vehicleCompatibility || "",
				condition: response.condition,
				price: response.price !== null && response.price !== void 0 ? Number(response.price) : null,
				showPrice: Boolean(response.showPrice),
				visible: Boolean(response.visible),
				oem: response.oem || "",
				isFeatured: Boolean(response.isFeatured),
				featuredAt: response.featuredAt ?? null
			};
			setProducts((prev) => prev.map((p) => p.id === id ? updatedProduct : p));
			refreshMetrics().catch(() => {});
			return {
				success: true,
				product: updatedProduct
			};
		} catch (err) {
			return {
				success: false,
				reason: err instanceof ApiError && err.data?.message || err?.message || "Error al actualizar el producto en el servidor."
			};
		}
	}, [products, refreshMetrics]);
	const toggleProductVisibility = useCallback(async (id) => {
		const currentProduct = products.find((p) => p.id === id);
		if (!currentProduct) return {
			success: false,
			reason: "Producto no encontrado."
		};
		try {
			const nextVisible = !currentProduct.visible;
			const response = await api.patch(`/api/products/${id}/visibility`, { visible: nextVisible });
			const updatedProduct = {
				...currentProduct,
				visible: response.visible,
				isFeatured: response.isFeatured !== void 0 ? Boolean(response.isFeatured) : Boolean(currentProduct.isFeatured),
				featuredAt: response.featuredAt !== void 0 ? response.featuredAt : currentProduct.featuredAt ?? null
			};
			setProducts((prev) => prev.map((p) => p.id === id ? updatedProduct : p));
			refreshMetrics().catch(() => {});
			return {
				success: true,
				product: updatedProduct
			};
		} catch (err) {
			return {
				success: false,
				reason: err instanceof ApiError && err.data?.message || err?.message || "Error al modificar la visibilidad en el servidor."
			};
		}
	}, [products, refreshMetrics]);
	const toggleVisibility = toggleProductVisibility;
	const toggleFeaturedProduct = useCallback(async (id, targetFeatured) => {
		const currentProduct = products.find((p) => p.id === id);
		if (!currentProduct) return {
			success: false,
			reason: "Producto no encontrado."
		};
		const nextFeatured = targetFeatured !== void 0 ? targetFeatured : !currentProduct.isFeatured;
		if (nextFeatured && !currentProduct.visible) {
			const errorMsg = "No se puede destacar un producto con visibilidad oculta.";
			toast.error(errorMsg);
			return {
				success: false,
				reason: errorMsg
			};
		}
		try {
			const response = await api.patch(`/api/products/${id}/featured`, { isFeatured: nextFeatured });
			const updatedProduct = {
				...currentProduct,
				isFeatured: Boolean(response.isFeatured),
				featuredAt: response.featuredAt ?? null
			};
			setProducts((prev) => prev.map((p) => p.id === id ? updatedProduct : p));
			refreshMetrics().catch(() => {});
			toast.success(nextFeatured ? "Producto añadido a destacados" : "Producto removido de destacados");
			return {
				success: true,
				product: updatedProduct
			};
		} catch (err) {
			let reason = "Error al actualizar el estado de destacado.";
			if (err instanceof ApiError) {
				if (err.status === 409) reason = "Límite alcanzado. Desmarca un producto primero";
				else if (err.data?.error) reason = err.data.error;
				else if (err.message) reason = err.message;
			}
			toast.error(reason);
			return {
				success: false,
				reason
			};
		}
	}, [products, refreshMetrics]);
	const value = {
		isLoading,
		error,
		metrics,
		refreshData,
		refreshMetrics,
		categories,
		createCategory,
		updateCategory,
		deleteCategory,
		canDeleteCategory,
		getRootCategories,
		getChildCategories,
		hasChildren,
		getCategoryProductCount,
		brands,
		createBrand,
		updateBrand,
		deleteBrand,
		canDeleteBrand,
		getBrandById,
		getBrandProductCount,
		products,
		createProduct,
		updateProduct,
		deleteProduct: useCallback(async (id) => {
			if (!products.find((p) => p.id === id)) return {
				success: false,
				reason: "Producto no encontrado."
			};
			try {
				await api.delete(`/api/products/${id}`);
				setProducts((prev) => prev.filter((p) => p.id !== id));
				refreshMetrics().catch(() => {});
				return { success: true };
			} catch (err) {
				return {
					success: false,
					reason: err instanceof ApiError && err.data?.message || err?.message || "Error al eliminar el producto en el servidor."
				};
			}
		}, [products, refreshMetrics]),
		toggleVisibility,
		toggleProductVisibility,
		toggleFeaturedProduct,
		searchProducts: useCallback((query) => {
			const clean = query.trim().toLowerCase();
			if (!clean) return products;
			return products.filter((p) => {
				return p.name.toLowerCase().includes(clean) || p.oem.toLowerCase().includes(clean) || p.description.toLowerCase().includes(clean) || p.vehicleCompatibility.toLowerCase().includes(clean);
			});
		}, [products])
	};
	return /* @__PURE__ */ jsx(AdminContext.Provider, {
		value,
		children
	});
}
/**
* Hook de acceso al contexto administrativo general.
*/
function useAdmin() {
	const context = useContext(AdminContext);
	if (!context) throw new Error("useAdmin debe ser utilizado dentro de un AdminProvider");
	return context;
}
//#endregion
export { useAdmin as n, AdminProvider as t };
