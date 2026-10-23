import { a as cn, i as Button, n as api, t as ApiError } from "./api-DvKWNf7S.js";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-DB0l-p4l.js";
import { n as useAdmin } from "./admin-context-B3zUnms8.js";
import { t as Badge } from "./badge-DXmXa5Va.js";
import { i as imageMetadataSchema, o as productFormSchema, t as PRODUCT_CONDITIONS } from "./admin-schemas-ItK5u1ge.js";
import { n as Input, t as Label } from "./label-DYv6qeSn.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DbUBzBH5.js";
import { t as useUnsavedChangesWarning } from "./useUnsavedChangesWarning-0e1WhFuU.js";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, AlertTriangle, Loader2, Package, PackagePlus, Pencil, Plus, Search, ShieldAlert, Star, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import * as SwitchPrimitives from "@radix-ui/react-switch";
//#region src/components/admin/products/ProductToolbar.tsx
/**
* Barra de herramientas del catálogo de repuestos en el panel administrativo.
* (RF-04, CA-04.2, CA-04.3, RF-06, CA-06.4, CL-11)
*
* Características:
* - Búsqueda en tiempo real con sanitización literal (sin excepciones RegExp ante [, *, \).
* - Botón para limpiar búsqueda rápida.
* - Conteo reactivo de repuestos totales / filtrados.
* - Badge con indicador en tiempo real "Destacados: X / 10".
* - Botón/Filtro rápido "Solo Destacados" combinable con lógica AND.
* - Botón de acción principal para crear nuevo repuesto.
*/
function ProductToolbar({ searchQuery, onSearchChange, onNewProduct, totalCount, filteredCount, featuredCount, showOnlyFeatured = false, onToggleOnlyFeatured, className }) {
	const [internalOnlyFeatured, setInternalOnlyFeatured] = useState(false);
	const isOnlyFeatured = onToggleOnlyFeatured !== void 0 ? showOnlyFeatured : internalOnlyFeatured;
	const handleToggleFeatured = () => {
		if (onToggleOnlyFeatured) onToggleOnlyFeatured(!showOnlyFeatured);
		else setInternalOnlyFeatured((prev) => !prev);
	};
	const isFiltered = typeof totalCount === "number" && typeof filteredCount === "number" && filteredCount !== totalCount;
	return /* @__PURE__ */ jsxs("div", {
		"data-testid": "product-toolbar",
		className: cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", className),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-1 flex-wrap items-center gap-2 sm:max-w-xl",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative min-w-[220px] flex-1",
				children: [
					/* @__PURE__ */ jsx(Search, {
						className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ jsx(Input, {
						type: "text",
						value: searchQuery,
						onChange: (e) => onSearchChange(e.target.value),
						placeholder: "Buscar por nombre, OEM, vehículo o descripción...",
						"data-testid": "product-search-input",
						className: "h-10 pl-9 pr-9 text-sm",
						"aria-label": "Buscar repuestos"
					}),
					searchQuery && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onSearchChange(""),
						className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
						"data-testid": "product-search-clear",
						"aria-label": "Limpiar búsqueda",
						children: /* @__PURE__ */ jsx(X, { className: "size-4" })
					})
				]
			}), /* @__PURE__ */ jsxs(Button, {
				type: "button",
				variant: isOnlyFeatured ? "default" : "outline",
				size: "sm",
				onClick: handleToggleFeatured,
				"data-testid": "filter-only-featured-btn",
				"aria-pressed": isOnlyFeatured,
				className: cn("h-10 gap-1.5 px-3 text-xs font-medium cursor-pointer transition-colors", isOnlyFeatured ? "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600" : "text-muted-foreground hover:text-foreground border-border hover:border-amber-500/50"),
				children: [/* @__PURE__ */ jsx(Star, { className: cn("size-3.5", isOnlyFeatured ? "fill-white text-white" : "text-amber-500") }), /* @__PURE__ */ jsx("span", { children: "Solo Destacados" })]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3 sm:justify-end",
			children: [
				typeof featuredCount === "number" && /* @__PURE__ */ jsxs("div", {
					"data-testid": "featured-counter-badge",
					className: "flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400",
					children: [/* @__PURE__ */ jsx(Star, { className: "size-3.5 fill-amber-500/40 text-amber-500" }), /* @__PURE__ */ jsxs("span", { children: [
						"Destacados: ",
						/* @__PURE__ */ jsx("strong", {
							className: "text-foreground",
							children: featuredCount
						}),
						" / 10"
					] })]
				}),
				typeof totalCount === "number" && /* @__PURE__ */ jsxs("div", {
					"data-testid": "product-counter",
					className: "flex items-center gap-1.5 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ jsx(Package, { className: "size-3.5" }), /* @__PURE__ */ jsx("span", { children: isFiltered ? /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("strong", {
							className: "text-foreground",
							children: filteredCount
						}),
						" de ",
						totalCount,
						" ",
						"repuestos"
					] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("strong", {
							className: "text-foreground",
							children: totalCount
						}),
						" ",
						totalCount === 1 ? "repuesto" : "repuestos"
					] }) })]
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "button",
					onClick: onNewProduct,
					"data-testid": "new-product-btn",
					className: "h-10 gap-2 font-semibold shadow-xs cursor-pointer bg-admin-btn-primary hover:bg-admin-btn-primary-hover text-white transition-colors",
					children: [/* @__PURE__ */ jsx(Plus, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Nuevo Producto" })]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/admin/products/ProductThumbnail.tsx
/**
* Componente de miniatura de producto con fallback gráfico resiliente.
* (RF-06, CA-06.3, CL-10)
*
* Características:
* - Soporta URLs relativas de servidor y Data URLs base64.
* - Ante error de carga (evento onError) o ausencia de URL, conmuta automáticamente
*   a un placeholder visual neutro manteniendo dimensiones fijas sin desalinear la grilla.
* - Iconografía accesible con `aria-label="Imagen no disponible"`.
*/
function ProductThumbnail({ src, alt = "Foto de repuesto diésel", className }) {
	const [hasError, setHasError] = useState(false);
	useEffect(() => {
		setHasError(false);
	}, [src]);
	const containerClasses = cn("relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/60", className);
	if (!src || hasError) return /* @__PURE__ */ jsx("div", {
		className: containerClasses,
		"data-testid": "product-thumbnail-fallback",
		role: "img",
		"aria-label": "Imagen no disponible",
		children: /* @__PURE__ */ jsx(Package, {
			className: "size-6 text-muted-foreground",
			"aria-hidden": "true"
		})
	});
	return /* @__PURE__ */ jsx("div", {
		className: containerClasses,
		children: /* @__PURE__ */ jsx("img", {
			src,
			alt,
			onError: () => setHasError(true),
			className: "size-full object-cover object-center",
			"data-testid": "product-thumbnail-img",
			loading: "lazy"
		})
	});
}
//#endregion
//#region src/components/ui/switch.tsx
var Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SwitchPrimitives.Root, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ jsx(SwitchPrimitives.Thumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = SwitchPrimitives.Root.displayName;
//#endregion
//#region src/components/admin/products/ProductList.tsx
/**
* Componente de Tabla / Lista de Repuestos del Panel de Administración (Light Mode).
* (Spec 010, RF-09, Apéndice 10.2, Casos Límite 4, TASK-18, TASK-19)
*
* Características Técnicas:
* - Operación estricta en Tema Claro (Light Mode) con tokens canónicos:
*   - Fondo perimetral: `bg-admin-bg` (#f9fafb).
*   - Superficies de datos y cabeceras: `bg-white` (100% opaco, #ffffff).
*   - Tipografía principal: `text-admin-text-main` (#111827).
*   - Tipografía secundaria y metadatos: `text-admin-text-sub` (#4b5563).
*   - Delimitación y bordes: `border-admin-border` (#e5e7eb).
* - Cabeceras de tabla fijas (sticky headers) ancladas permanentemente con fondo blanco 100% opaco
*   y demarcación inferior estricta `box-shadow: 0 1px 0 rgba(0, 0, 0, 0.10)`.
* - Tipografía monoespaciada de alto contraste para códigos OEM (`font-mono font-semibold text-admin-text-main`).
* - Botones de acción primaria formalizados en Naranja Técnico (`#ea580c` con hover `#c2410c`).
* - Manejo robusto de errores de servidor (HTTP 500) y estados vacíos preservando siempre las cabeceras fijas.
*/
/**
* Normaliza y formatea el mensaje de error constitucional para el cuerpo de la tabla.
* (Spec 010, Caso Límite 4, Principio 6: Errores Opacos)
*
* Transforma cualquier error 500 o referencia técnica en el formato canónico estricto:
* "Error del servidor. Referencia: <uuid>"
* Erradicando fugas de trazas técnicas, queries SQL o stack traces en el DOM.
*/
function formatOpaqueServerError(error) {
	if (!error) return "";
	if (typeof error === "string") {
		const trimmed = error.trim();
		if (trimmed.startsWith("Error del servidor. Referencia:")) return trimmed;
		if (trimmed.startsWith("Referencia:")) return `Error del servidor. ${trimmed}`;
		const uuidMatch = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
		if (uuidMatch) return `Error del servidor. Referencia: ${uuidMatch[0]}`;
	}
	if (typeof error === "object" && error !== null) {
		const anyErr = error;
		const ref = anyErr.data?.error || anyErr.data?.referenceId || anyErr.error || anyErr.referenceId;
		if (typeof ref === "string") return formatOpaqueServerError(ref);
		if (typeof anyErr.message === "string") return formatOpaqueServerError(anyErr.message);
	}
	return `Error del servidor. Referencia: ${typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : "e0000000-0000-4000-8000-000000000000"}`;
}
function ProductList({ products: propProducts, searchQuery = "", onlyFeatured = false, onEdit, onDelete, onToggleVisibility, onToggleFeatured, error: propError, isLoading: propLoading, onRetry, onNewProduct }) {
	const { products: contextProducts, getBrandById, toggleVisibility, toggleFeaturedProduct, error: contextError, isLoading: contextLoading } = useAdmin();
	const [loadingFeaturedId, setLoadingFeaturedId] = useState(null);
	const baseProducts = propProducts ?? contextProducts;
	const rawError = propError !== void 0 ? propError : contextError;
	const effectiveError = rawError ? formatOpaqueServerError(rawError) : null;
	const effectiveLoading = propLoading !== void 0 ? propLoading : contextLoading;
	const cleanQuery = searchQuery.trim().toLowerCase();
	const filteredProducts = baseProducts.filter((product) => {
		if (onlyFeatured && !product.isFeatured) return false;
		if (!cleanQuery) return true;
		const brand = getBrandById(product.brandId);
		const brandName = brand ? brand.name.toLowerCase() : "";
		return (product.name || "").toLowerCase().includes(cleanQuery) || (product.oem || "").toLowerCase().includes(cleanQuery) || (product.description || "").toLowerCase().includes(cleanQuery) || (product.vehicleCompatibility || "").toLowerCase().includes(cleanQuery) || brandName.includes(cleanQuery);
	});
	const handleToggle = async (product) => {
		if (onToggleVisibility) onToggleVisibility(product);
		else await toggleVisibility(product.id);
	};
	const handleToggleFeatured = async (product) => {
		if (!product.visible || loadingFeaturedId !== null) return;
		setLoadingFeaturedId(product.id);
		try {
			if (onToggleFeatured) await onToggleFeatured(product);
			else {
				const result = await toggleFeaturedProduct(product.id, !product.isFeatured);
				if (!result.success && result.reason) {}
			}
		} catch (err) {
			const msg = err?.response?.data?.error || (err instanceof ApiError && err.status === 409 ? "Límite alcanzado. Desmarca un producto primero" : err?.message) || "Límite alcanzado. Desmarca un producto primero";
			toast.error(msg);
		} finally {
			setLoadingFeaturedId(null);
		}
	};
	const formatProductPrice = (product) => {
		if (!product.showPrice || product.price === null) return "Consultar";
		return `$${product.price.toLocaleString("es-AR")} ARS`;
	};
	return /* @__PURE__ */ jsx("div", {
		"data-testid": "product-table-container",
		className: "relative overflow-hidden rounded-xl border border-admin-border bg-admin-bg shadow-xs",
		children: /* @__PURE__ */ jsx("div", {
			className: "max-h-[calc(100vh-260px)] min-h-[300px] overflow-auto",
			children: /* @__PURE__ */ jsxs(Table, {
				className: "w-full border-collapse bg-white",
				children: [/* @__PURE__ */ jsx(TableHeader, {
					className: "sticky top-0 z-20 bg-white [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
					children: /* @__PURE__ */ jsxs(TableRow, {
						className: "border-b-0 hover:bg-transparent",
						children: [
							/* @__PURE__ */ jsx(TableHead, {
								className: "sticky top-0 z-20 w-[80px] bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
								children: "Foto"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "sticky top-0 z-20 min-w-[220px] bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
								children: "Repuesto / OEM"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "sticky top-0 z-20 bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
								children: "Marca"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "sticky top-0 z-20 min-w-[180px] bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
								children: "Compatibilidad"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "sticky top-0 z-20 bg-white px-4 py-3.5 font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
								children: "Precio"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "sticky top-0 z-20 bg-white px-4 py-3.5 text-center font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
								children: "Destacado"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "sticky top-0 z-20 bg-white px-4 py-3.5 text-center font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
								children: "Visibilidad"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "sticky top-0 z-20 bg-white px-4 py-3.5 text-right font-semibold text-admin-text-main [box-shadow:0_1px_0_rgba(0,0,0,0.10)]",
								children: "Acciones"
							})
						]
					})
				}), /* @__PURE__ */ jsx(TableBody, {
					className: "bg-white",
					children: effectiveError ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 8,
						className: "py-12 text-center bg-white",
						children: /* @__PURE__ */ jsxs("div", {
							"data-testid": "product-table-error",
							className: "flex flex-col items-center justify-center gap-2 p-6 text-center",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600",
									children: /* @__PURE__ */ jsx(AlertCircle, { className: "size-6" })
								}),
								/* @__PURE__ */ jsx("p", {
									className: "font-semibold text-admin-text-main text-sm",
									"data-testid": "server-error-message",
									children: effectiveError
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-admin-text-sub max-w-md",
									children: "Ocurrió una falla de comunicación con la base de datos de repuestos."
								}),
								onRetry && /* @__PURE__ */ jsx(Button, {
									type: "button",
									onClick: onRetry,
									className: "mt-2 h-9 px-4 text-xs font-semibold bg-admin-btn-primary hover:bg-admin-btn-primary-hover text-white transition-colors cursor-pointer shadow-xs",
									children: "Reintentar"
								})
							]
						})
					}) }) : effectiveLoading && baseProducts.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 8,
						className: "py-16 text-center bg-white",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col items-center justify-center gap-3",
							children: [/* @__PURE__ */ jsx(Loader2, { className: "size-6 animate-spin text-admin-btn-primary" }), /* @__PURE__ */ jsx("span", {
								className: "text-xs font-medium text-admin-text-sub",
								children: "Cargando inventario de repuestos..."
							})]
						})
					}) }) : filteredProducts.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 8,
						className: "py-12 text-center bg-white",
						children: /* @__PURE__ */ jsxs("div", {
							"data-testid": "product-table-empty",
							className: "flex min-h-48 flex-col items-center justify-center p-6 text-center",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "flex size-12 items-center justify-center rounded-full bg-slate-100 text-admin-text-sub",
									children: /* @__PURE__ */ jsx(Package, { className: "size-6" })
								}),
								/* @__PURE__ */ jsx("h3", {
									className: "mt-4 font-display text-base font-semibold text-admin-text-main",
									children: searchQuery ? "No se encontraron repuestos" : "No hay repuestos registrados"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-1 text-sm text-admin-text-sub max-w-md mx-auto",
									children: searchQuery ? `No hay repuestos que coincidan con "${searchQuery}". Intente con otro código OEM o descripción.` : "Comience agregando un nuevo repuesto al catálogo del laboratorio."
								}),
								!searchQuery && onNewProduct && /* @__PURE__ */ jsx(Button, {
									type: "button",
									onClick: onNewProduct,
									className: "mt-4 h-9 px-4 text-xs font-semibold bg-admin-btn-primary hover:bg-admin-btn-primary-hover text-white transition-colors cursor-pointer shadow-xs",
									children: "Nuevo Producto"
								})
							]
						})
					}) }) : filteredProducts.map((product) => {
						const brandName = getBrandById(product.brandId)?.name ?? "Sin marca";
						const isHidden = !product.visible;
						return /* @__PURE__ */ jsxs(TableRow, {
							"data-testid": `product-row-${product.id}`,
							className: `border-b border-admin-border bg-white transition-colors hover:bg-slate-50/80 ${isHidden ? "bg-slate-50/50 opacity-75" : ""}`,
							children: [
								/* @__PURE__ */ jsx(TableCell, {
									className: "px-4 py-3",
									children: /* @__PURE__ */ jsx(ProductThumbnail, {
										src: product.imageUrl,
										alt: product.name,
										className: "size-12 border border-admin-border rounded-md"
									})
								}),
								/* @__PURE__ */ jsx(TableCell, {
									className: "px-4 py-3",
									children: /* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx("span", {
												className: "font-semibold text-admin-text-main text-sm",
												"data-testid": `product-name-${product.id}`,
												children: product.name
											}), /* @__PURE__ */ jsx(Badge, {
												variant: "secondary",
												className: "text-[10px] font-mono border border-admin-border bg-slate-100 text-admin-text-sub",
												children: product.condition
											})]
										}), /* @__PURE__ */ jsx("div", {
											className: "flex items-center gap-2",
											children: /* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center rounded border border-admin-border bg-slate-100/90 px-2 py-0.5 font-mono text-xs font-semibold tracking-tight text-admin-text-main shadow-2xs",
												"data-testid": `product-oem-${product.id}`,
												children: ["OEM: ", product.oem]
											})
										})]
									})
								}),
								/* @__PURE__ */ jsx(TableCell, {
									className: "px-4 py-3",
									children: /* @__PURE__ */ jsx(Badge, {
										variant: "outline",
										className: "font-medium border-admin-border text-admin-text-main bg-white",
										"data-testid": `product-brand-${product.id}`,
										children: brandName
									})
								}),
								/* @__PURE__ */ jsx(TableCell, {
									className: "px-4 py-3 text-xs text-admin-text-sub",
									children: /* @__PURE__ */ jsx("span", {
										className: "line-clamp-2",
										children: product.vehicleCompatibility || "Universal / Multimarca"
									})
								}),
								/* @__PURE__ */ jsx(TableCell, {
									className: "px-4 py-3",
									children: /* @__PURE__ */ jsx("span", {
										className: `text-sm font-semibold ${product.showPrice && product.price !== null ? "text-admin-text-main" : "text-admin-text-sub italic"}`,
										"data-testid": `product-price-${product.id}`,
										children: formatProductPrice(product)
									})
								}),
								/* @__PURE__ */ jsx(TableCell, {
									className: "px-4 py-3 text-center",
									children: /* @__PURE__ */ jsx("div", {
										className: "flex flex-col items-center justify-center gap-1.5",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "relative flex items-center justify-center",
												children: [/* @__PURE__ */ jsx(Switch, {
													checked: Boolean(product.isFeatured),
													onCheckedChange: () => handleToggleFeatured(product),
													disabled: !product.visible || loadingFeaturedId === product.id,
													"aria-label": `Alternar destacado de ${product.name}`,
													"data-testid": `product-featured-switch-${product.id}`,
													title: !product.visible ? "No se puede destacar un producto con visibilidad oculta" : product.isFeatured ? "Quitar de destacados del inicio" : "Destacar en carrusel de inicio"
												}), loadingFeaturedId === product.id && /* @__PURE__ */ jsx("div", {
													className: "absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-full",
													"data-testid": `product-featured-spinner-${product.id}`,
													children: /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin text-amber-500" })
												})]
											}), /* @__PURE__ */ jsx(Badge, {
												variant: product.isFeatured ? "default" : "secondary",
												className: `text-[11px] ${product.isFeatured ? "bg-amber-500/15 text-amber-800 border-amber-500/30" : "bg-slate-100 text-admin-text-sub border-admin-border"}`,
												"data-testid": `product-featured-badge-${product.id}`,
												children: product.isFeatured ? "Destacado" : "Normal"
											})]
										})
									})
								}),
								/* @__PURE__ */ jsx(TableCell, {
									className: "px-4 py-3 text-center",
									children: /* @__PURE__ */ jsx("div", {
										className: "flex flex-col items-center justify-center gap-1.5",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx(Switch, {
												checked: product.visible,
												onCheckedChange: () => handleToggle(product),
												"aria-label": `Cambiar visibilidad de ${product.name}`,
												"data-testid": `product-visibility-switch-${product.id}`
											}), /* @__PURE__ */ jsx(Badge, {
												variant: product.visible ? "default" : "secondary",
												className: `text-[11px] ${product.visible ? "bg-emerald-600/15 text-emerald-800 border-emerald-600/20" : "bg-slate-100 text-admin-text-sub border-admin-border"}`,
												"data-testid": `product-status-badge-${product.id}`,
												children: product.visible ? "Visible" : "Oculto"
											})]
										})
									})
								}),
								/* @__PURE__ */ jsx(TableCell, {
									className: "px-4 py-3 text-right",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-end gap-1.5",
										children: [/* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => onEdit?.(product),
											"aria-label": `Editar ${product.name}`,
											title: `Editar ${product.name}`,
											className: "size-8 p-0 text-admin-text-sub hover:text-admin-text-main hover:bg-slate-100 cursor-pointer",
											"data-testid": `product-edit-btn-${product.id}`,
											children: /* @__PURE__ */ jsx(Pencil, { className: "size-4" })
										}), /* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => onDelete?.(product),
											"aria-label": `Eliminar ${product.name}`,
											title: `Eliminar ${product.name}`,
											className: "size-8 p-0 text-admin-text-sub hover:bg-red-50 hover:text-red-600 cursor-pointer",
											"data-testid": `product-delete-btn-${product.id}`,
											children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
										})]
									})
								})
							]
						}, product.id);
					})
				})]
			})
		})
	});
}
//#endregion
//#region src/components/admin/products/ProductImageUpload.tsx
/**
* Componente de Carga, Validación Client-Side y Tubería de Subida de Fotos.
* (RF-08, CA-08.1 a CA-08.4, CL-01, CL-02, CL-03, Tarea 8.3)
*
* Características:
* - Valida metadata desacoplada del objeto File mediante `imageMetadataSchema`.
* - Límite inclusivo: acepta hasta 5.00 MB exactos (`5242880` bytes).
* - Rechaza archivos mayores a 5 MB o formatos no permitidos (.gif, .svg, etc.).
* - Envía FormData a `POST /api/uploads/product-image` mediante el cliente HTTP.
* - Presenta estado visual interactivo de "Subiendo imagen..." mientras el servidor de Node procesa con Sharp.
* - Setea en el formulario la URL definitiva del archivo `.webp` procesado.
* - Genera previsualización Data URL inmediata para feedback de interfaz.
*/
function ProductImageUpload({ value, onChange, disabled = false, error: externalError, onUploadingChange }) {
	const [internalError, setInternalError] = useState(null);
	const [localPreview, setLocalPreview] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef(null);
	const displayImage = localPreview !== null ? localPreview : value;
	const activeError = internalError || externalError;
	const handleFileChange = (e) => {
		setInternalError(null);
		const files = e.target.files;
		if (!files || files.length === 0) return;
		const file = files[0];
		if (!file) return;
		const validationResult = imageMetadataSchema.safeParse({
			name: file.name,
			size: file.size,
			type: file.type
		});
		if (!validationResult.success) {
			const firstError = validationResult.error.errors[0]?.message || "Archivo de imagen inválido";
			setInternalError(firstError);
			if (fileInputRef.current) fileInputRef.current.value = "";
			return;
		}
		const reader = new FileReader();
		reader.onload = async () => {
			const result = reader.result;
			if (typeof result === "string") {
				setLocalPreview(result);
				setIsUploading(true);
				onUploadingChange?.(true);
				try {
					const formData = new FormData();
					formData.append("file", file);
					const response = await api.upload("/api/uploads/product-image", formData);
					if (response && response.imageUrl) onChange?.(response.imageUrl);
					else throw new Error("No se recibió la URL de la imagen procesada");
				} catch (err) {
					const errorMsg = err instanceof ApiError && err.data?.error || err?.message || "Error al procesar la imagen en el servidor";
					setInternalError(errorMsg);
					setLocalPreview(null);
					onChange?.("");
					if (fileInputRef.current) fileInputRef.current.value = "";
				} finally {
					setIsUploading(false);
					onUploadingChange?.(false);
				}
			}
		};
		reader.readAsDataURL(file);
	};
	const handleRemove = () => {
		setLocalPreview("");
		setInternalError(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		onChange?.("");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		"data-testid": "product-image-upload",
		children: [
			isUploading ? /* @__PURE__ */ jsxs("div", {
				"data-testid": "image-uploading-state",
				className: "flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-industrial/60 bg-industrial/5 p-6 text-center",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "flex size-10 items-center justify-center rounded-full bg-industrial/10 text-industrial",
						children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin" })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm font-semibold text-foreground",
						children: "Subiendo imagen..."
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Optimizando y convirtiendo a formato WebP con Sharp..."
					})
				]
			}) : displayImage ? /* @__PURE__ */ jsxs("div", {
				"data-testid": "image-preview-container",
				className: "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ jsx("div", {
					className: "relative aspect-video max-h-48 w-full overflow-hidden rounded-lg border border-border bg-muted/40",
					children: /* @__PURE__ */ jsx("img", {
						src: displayImage,
						alt: "Previsualización del repuesto",
						"data-testid": "image-upload-preview",
						className: "size-full object-contain object-center"
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-3 flex w-full items-center justify-between gap-2",
					children: [/* @__PURE__ */ jsxs(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						disabled: disabled || isUploading,
						onClick: () => fileInputRef.current?.click(),
						className: "text-xs",
						"data-testid": "replace-image-btn",
						children: [/* @__PURE__ */ jsx(Upload, { className: "mr-1.5 size-3.5" }), "Reemplazar foto"]
					}), /* @__PURE__ */ jsxs(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						disabled: disabled || isUploading,
						onClick: handleRemove,
						className: "text-xs text-destructive hover:bg-destructive/10 hover:text-destructive",
						"data-testid": "remove-image-btn",
						children: [/* @__PURE__ */ jsx(X, { className: "mr-1.5 size-3.5" }), "Quitar"]
					})]
				})]
			}) : /* @__PURE__ */ jsxs("div", {
				onClick: () => !disabled && !isUploading && fileInputRef.current?.click(),
				"data-testid": "upload-dropzone",
				className: `flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${activeError ? "border-destructive/60 bg-destructive/5 hover:border-destructive" : "border-border bg-muted/20 hover:border-industrial/50 hover:bg-muted/40"} ${disabled || isUploading ? "cursor-not-allowed opacity-50" : ""}`,
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "flex size-10 items-center justify-center rounded-full bg-industrial/10 text-industrial",
						children: /* @__PURE__ */ jsx(Upload, { className: "size-5" })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm font-semibold text-foreground",
						children: "Haga clic para subir una foto del repuesto"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Formatos admitidos: JPG, PNG o WEBP (máx. 5.00 MB)"
					})
				]
			}),
			/* @__PURE__ */ jsx("input", {
				ref: fileInputRef,
				type: "file",
				accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
				onChange: handleFileChange,
				disabled: disabled || isUploading,
				"data-testid": "image-file-input",
				className: "sr-only",
				tabIndex: -1
			}),
			activeError && /* @__PURE__ */ jsxs("div", {
				role: "alert",
				"data-testid": "image-upload-error",
				className: "flex items-center gap-2 text-xs font-medium text-destructive",
				children: [/* @__PURE__ */ jsx(AlertCircle, { className: "size-4 shrink-0" }), /* @__PURE__ */ jsx("span", { children: activeError })]
			})
		]
	});
}
//#endregion
//#region src/components/ui/textarea.tsx
var Textarea = React.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ jsx("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
//#endregion
//#region src/components/admin/products/ProductFormModal.tsx
/**
* Modal de Creación y Edición de Productos con Validación Zod Fail-Fast y Bloque Finally.
* (RF-02, RF-03, RF-05, CA-02.1 a CA-02.3, CA-05.1 a CA-05.4, CL-05, CL-06, CL-07, CL-12)
*
* Características:
* - Validación desacoplada con `productFormSchema` (.strict()).
* - Carga y validación client-side de fotos integrada con `<ProductImageUpload>`.
* - Selector múltiple de categorías almacenando array plano `categoryIds: string[]` (CA-05.3).
* - Selector relacional de marcas por UUID (`brandId`).
* - Soporte de precio `>= 0` (admitiendo $0 y null para "A cotizar") (CA-05.2).
* - Toggles reactivos para visibilidad, precio y destacado en carrusel de inicio (máx. 10).
* - Bloqueo preventivo de conmutador de destacado cuando el cupo alcanza 10/10 en creación (RF-02, CA-02.2).
* - Mutación segura en bloque `try/finally` asegurando `isSubmitting: false` (CA-05.4, CL-12).
*/
function ProductFormModal({ open, onOpenChange, productToEdit, onSuccess }) {
	const { brands, categories, createProduct, updateProduct, products, metrics } = useAdmin();
	const isEditing = Boolean(productToEdit);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [categoryIds, setCategoryIds] = useState([]);
	const [brandId, setBrandId] = useState("");
	const [vehicleCompatibility, setVehicleCompatibility] = useState("");
	const [condition, setCondition] = useState("Nuevo");
	const [priceInput, setPriceInput] = useState("");
	const [showPrice, setShowPrice] = useState(true);
	const [visible, setVisible] = useState(true);
	const [oem, setOem] = useState("");
	const [isFeatured, setIsFeatured] = useState(false);
	const [fieldErrors, setFieldErrors] = useState({});
	const [formError, setFormError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const isFeaturedLimitReached = (metrics?.featuredProducts ?? (products ? products.filter((p) => p.isFeatured).length : 0)) >= 10;
	const isFeaturedDisabled = isSubmitting || isFeaturedLimitReached && (!isEditing || !productToEdit?.isFeatured);
	useEffect(() => {
		if (open) {
			if (productToEdit) {
				setName(productToEdit.name);
				setDescription(productToEdit.description);
				setImageUrl(productToEdit.imageUrl);
				setCategoryIds([...productToEdit.categoryIds]);
				setBrandId(productToEdit.brandId);
				setVehicleCompatibility(productToEdit.vehicleCompatibility || "");
				setCondition(productToEdit.condition);
				setPriceInput(productToEdit.price !== null && productToEdit.price !== void 0 ? String(productToEdit.price) : "");
				setShowPrice(productToEdit.showPrice);
				setVisible(productToEdit.visible);
				setOem(productToEdit.oem || "");
				setIsFeatured(Boolean(productToEdit.isFeatured));
			} else {
				setName("");
				setDescription("");
				setImageUrl("");
				setCategoryIds([]);
				setBrandId("");
				setVehicleCompatibility("");
				setCondition("Nuevo");
				setPriceInput("");
				setShowPrice(true);
				setVisible(true);
				setOem("");
				setIsFeatured(false);
			}
			setFieldErrors({});
			setFormError(null);
			setIsSubmitting(false);
			setIsUploadingImage(false);
		}
	}, [open, productToEdit]);
	useUnsavedChangesWarning(useMemo(() => {
		if (!open) return false;
		if (isEditing && productToEdit) return name !== productToEdit.name || description !== productToEdit.description || imageUrl !== productToEdit.imageUrl || brandId !== productToEdit.brandId || vehicleCompatibility !== (productToEdit.vehicleCompatibility || "") || condition !== productToEdit.condition || priceInput !== (productToEdit.price !== null && productToEdit.price !== void 0 ? String(productToEdit.price) : "") || showPrice !== productToEdit.showPrice || visible !== productToEdit.visible || oem !== (productToEdit.oem || "") || isFeatured !== Boolean(productToEdit.isFeatured) || JSON.stringify(categoryIds.slice().sort()) !== JSON.stringify((productToEdit.categoryIds || []).slice().sort());
		return name.trim() !== "" || description.trim() !== "" || imageUrl.trim() !== "" || categoryIds.length > 0 || brandId !== "" || vehicleCompatibility.trim() !== "" || condition !== "Nuevo" || priceInput.trim() !== "" || !showPrice || !visible || oem.trim() !== "" || isFeatured;
	}, [
		open,
		isEditing,
		productToEdit,
		name,
		description,
		imageUrl,
		categoryIds,
		brandId,
		vehicleCompatibility,
		condition,
		priceInput,
		showPrice,
		visible,
		oem,
		isFeatured
	]));
	const parsePrice = (val) => {
		const trimmed = val.trim();
		if (!trimmed) return null;
		const num = Number(trimmed);
		return isNaN(num) ? -1 : num;
	};
	const getPayload = () => ({
		name: name.trim(),
		description: description.trim(),
		imageUrl,
		categoryIds,
		brandId,
		vehicleCompatibility: vehicleCompatibility.trim(),
		condition,
		price: parsePrice(priceInput),
		showPrice,
		visible,
		oem: oem.trim(),
		isFeatured
	});
	const validateField = (fieldName) => {
		const payload = getPayload();
		const result = productFormSchema.safeParse(payload);
		if (!result.success) {
			const match = result.error.errors.find((err) => err.path.includes(fieldName));
			if (match) {
				setFieldErrors((prev) => ({
					...prev,
					[fieldName]: match.message
				}));
				return false;
			}
		}
		setFieldErrors((prev) => {
			const next = { ...prev };
			delete next[fieldName];
			return next;
		});
		return true;
	};
	const handleBlur = (e) => {
		const fieldName = e.target.name;
		if (fieldName) validateField(fieldName);
	};
	const toggleCategory = (catId) => {
		setCategoryIds((prev) => {
			const next = prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId];
			if (fieldErrors.categoryIds) {
				if (next.length > 0) setFieldErrors((errs) => {
					const copy = { ...errs };
					delete copy.categoryIds;
					return copy;
				});
			}
			return next;
		});
	};
	const handleImageChange = (url) => {
		setImageUrl(url);
		if (fieldErrors.imageUrl && url) setFieldErrors((prev) => {
			const next = { ...prev };
			delete next.imageUrl;
			return next;
		});
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError(null);
		const payload = getPayload();
		const validationResult = productFormSchema.safeParse(payload);
		if (!validationResult.success) {
			const newErrors = {};
			for (const err of validationResult.error.errors) {
				const field = err.path[0];
				if (!newErrors[field]) newErrors[field] = err.message;
			}
			setFieldErrors(newErrors);
			setFormError("Por favor revise los campos con error antes de continuar.");
			return;
		}
		setIsSubmitting(true);
		try {
			if (isEditing && productToEdit) {
				const result = await updateProduct(productToEdit.id, payload);
				if (result.success) {
					onOpenChange(false);
					onSuccess?.();
				} else setFormError(result.reason || "Error al actualizar el producto.");
			} else {
				const result = await createProduct(payload);
				if (result.success) {
					onOpenChange(false);
					onSuccess?.();
				} else setFormError(result.reason || "Error al crear el producto.");
			}
		} catch {
			setFormError("Ocurrió un error inesperado al procesar el producto.");
		} finally {
			setIsSubmitting(false);
		}
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-h-[92vh] overflow-y-auto sm:max-w-2xl",
			"data-testid": "product-form-modal",
			"aria-describedby": "product-form-description",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 text-industrial mb-1",
					children: [/* @__PURE__ */ jsx(PackagePlus, { className: "size-5" }), /* @__PURE__ */ jsx("span", {
						className: "text-xs font-bold uppercase tracking-wider",
						children: isEditing ? "Modificación de Repuesto" : "Alta de Repuesto"
					})]
				}),
				/* @__PURE__ */ jsx(DialogTitle, {
					className: "text-xl font-bold font-display",
					children: isEditing ? "Editar Repuesto" : "Nuevo Repuesto"
				}),
				/* @__PURE__ */ jsx(DialogDescription, {
					id: "product-form-description",
					children: isEditing ? "Modifique los detalles técnicos, precio, taxonomías y visibilidad del repuesto." : "Complete la ficha técnica del repuesto. Los campos con asterisco (*) son obligatorios."
				})
			] }), /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				noValidate: true,
				className: "space-y-5 pt-2",
				children: [
					formError && /* @__PURE__ */ jsxs("div", {
						role: "alert",
						"aria-live": "polite",
						"data-testid": "product-form-alert-error",
						className: "flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 text-sm text-destructive",
						children: [/* @__PURE__ */ jsx(AlertCircle, { className: "size-5 shrink-0" }), /* @__PURE__ */ jsx("span", { children: formError })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ jsxs(Label, {
								className: "text-sm font-semibold",
								children: ["Foto del Repuesto ", /* @__PURE__ */ jsx("span", {
									className: "text-destructive",
									children: "*"
								})]
							}),
							/* @__PURE__ */ jsx(ProductImageUpload, {
								value: imageUrl,
								onChange: handleImageChange,
								disabled: isSubmitting || isUploadingImage,
								error: fieldErrors.imageUrl,
								onUploadingChange: setIsUploadingImage
							}),
							fieldErrors.imageUrl && /* @__PURE__ */ jsx("p", {
								role: "alert",
								"data-testid": "product-image-field-error",
								className: "text-xs text-destructive font-medium",
								children: fieldErrors.imageUrl
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [
									/* @__PURE__ */ jsxs(Label, {
										htmlFor: "product-name",
										children: ["Nombre del Repuesto ", /* @__PURE__ */ jsx("span", {
											className: "text-destructive",
											children: "*"
										})]
									}),
									/* @__PURE__ */ jsx(Input, {
										id: "product-name",
										name: "name",
										type: "text",
										placeholder: "Ej. Inyector Bosch Common Rail 0445110369",
										value: name,
										onChange: (e) => {
											setName(e.target.value);
											if (fieldErrors.name) validateField("name");
										},
										onBlur: handleBlur,
										disabled: isSubmitting,
										className: fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : "",
										"aria-invalid": Boolean(fieldErrors.name),
										"data-testid": "product-name-input"
									}),
									fieldErrors.name && /* @__PURE__ */ jsx("p", {
										role: "alert",
										"data-testid": "product-name-field-error",
										className: "text-xs text-destructive font-medium",
										children: fieldErrors.name
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "product-oem",
									children: "Código OEM / Número de Pieza"
								}), /* @__PURE__ */ jsx(Input, {
									id: "product-oem",
									name: "oem",
									type: "text",
									placeholder: "Ej. 0445110369, 23670-0L050",
									value: oem,
									onChange: (e) => setOem(e.target.value),
									disabled: isSubmitting,
									"data-testid": "product-oem-input"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ jsxs(Label, {
										htmlFor: "product-brand",
										children: ["Marca / Fabricante ", /* @__PURE__ */ jsx("span", {
											className: "text-destructive",
											children: "*"
										})]
									}),
									/* @__PURE__ */ jsxs("select", {
										id: "product-brand",
										name: "brandId",
										value: brandId,
										onChange: (e) => {
											setBrandId(e.target.value);
											if (fieldErrors.brandId) validateField("brandId");
										},
										onBlur: handleBlur,
										disabled: isSubmitting,
										"data-testid": "product-brand-select",
										"aria-invalid": Boolean(fieldErrors.brandId),
										className: `flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground ${fieldErrors.brandId ? "border-destructive" : "border-input"}`,
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Seleccione una marca..."
										}), brands.map((b) => /* @__PURE__ */ jsx("option", {
											value: b.id,
											children: b.name
										}, b.id))]
									}),
									fieldErrors.brandId && /* @__PURE__ */ jsx("p", {
										role: "alert",
										"data-testid": "product-brand-field-error",
										className: "text-xs text-destructive font-medium",
										children: fieldErrors.brandId
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "product-condition",
									children: "Condición del Repuesto"
								}), /* @__PURE__ */ jsx("select", {
									id: "product-condition",
									name: "condition",
									value: condition,
									onChange: (e) => setCondition(e.target.value),
									disabled: isSubmitting,
									"data-testid": "product-condition-select",
									className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
									children: PRODUCT_CONDITIONS.map((cond) => /* @__PURE__ */ jsx("option", {
										value: cond,
										children: cond
									}, cond))
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "product-vehicle-compat",
									children: "Vehículo / Motor Compatible"
								}), /* @__PURE__ */ jsx(Input, {
									id: "product-vehicle-compat",
									name: "vehicleCompatibility",
									type: "text",
									placeholder: "Ej. Toyota Hilux 2.8 D-4D (2016+)",
									value: vehicleCompatibility,
									onChange: (e) => setVehicleCompatibility(e.target.value),
									disabled: isSubmitting,
									"data-testid": "product-vehicle-input"
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs(Label, { children: ["Categorías Asociadas ", /* @__PURE__ */ jsx("span", {
									className: "text-destructive",
									children: "*"
								})] }), /* @__PURE__ */ jsxs("span", {
									className: "text-[11px] text-muted-foreground",
									children: ["Seleccionadas: ", categoryIds.length]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								"data-testid": "product-categories-container",
								className: `max-h-36 overflow-y-auto rounded-lg border p-3 space-y-1.5 bg-card/50 ${fieldErrors.categoryIds ? "border-destructive" : "border-input"}`,
								children: categories.length === 0 ? /* @__PURE__ */ jsx("p", {
									className: "text-xs text-muted-foreground text-center py-2",
									children: "No hay categorías registradas en el sistema."
								}) : categories.map((cat) => {
									const isChild = cat.parentId !== null;
									const isChecked = categoryIds.includes(cat.id);
									return /* @__PURE__ */ jsxs("label", {
										className: `flex items-center gap-2.5 rounded-md px-2 py-1 text-sm cursor-pointer transition-colors hover:bg-muted/60 ${isChild ? "ml-5 border-l-2 border-industrial/40 pl-3" : "font-medium"} ${isChecked ? "bg-industrial/10 text-industrial font-medium" : "text-foreground"}`,
										children: [/* @__PURE__ */ jsx("input", {
											type: "checkbox",
											checked: isChecked,
											onChange: () => toggleCategory(cat.id),
											disabled: isSubmitting,
											"data-testid": `category-checkbox-${cat.id}`,
											className: "size-4 rounded border-input text-industrial focus:ring-industrial accent-[#ea580c] cursor-pointer"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-xs sm:text-sm",
											children: cat.name
										})]
									}, cat.id);
								})
							}),
							fieldErrors.categoryIds && /* @__PURE__ */ jsx("p", {
								role: "alert",
								"data-testid": "product-categories-field-error",
								className: "text-xs text-destructive font-medium",
								children: fieldErrors.categoryIds
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ jsxs(Label, {
								htmlFor: "product-description",
								children: ["Descripción Técnica ", /* @__PURE__ */ jsx("span", {
									className: "text-destructive",
									children: "*"
								})]
							}),
							/* @__PURE__ */ jsx(Textarea, {
								id: "product-description",
								name: "description",
								rows: 3,
								placeholder: "Detalles sobre calibración en banco de pruebas, estado de toberas, garantía...",
								value: description,
								onChange: (e) => {
									setDescription(e.target.value);
									if (fieldErrors.description) validateField("description");
								},
								onBlur: handleBlur,
								disabled: isSubmitting,
								className: fieldErrors.description ? "border-destructive focus-visible:ring-destructive" : "",
								"aria-invalid": Boolean(fieldErrors.description),
								"data-testid": "product-description-input"
							}),
							fieldErrors.description && /* @__PURE__ */ jsx("p", {
								role: "alert",
								"data-testid": "product-description-field-error",
								className: "text-xs text-destructive font-medium",
								children: fieldErrors.description
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "rounded-xl border border-border bg-muted/20 p-4 space-y-4",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ jsx(Label, {
										htmlFor: "product-price",
										children: "Precio en ARS ($)"
									}),
									/* @__PURE__ */ jsx(Input, {
										id: "product-price",
										name: "price",
										type: "number",
										min: "0",
										step: "any",
										placeholder: "Ej. 145000 (vacío para cotizar)",
										value: priceInput,
										onChange: (e) => {
											setPriceInput(e.target.value);
											if (fieldErrors.price) validateField("price");
										},
										onBlur: handleBlur,
										disabled: isSubmitting || !showPrice,
										className: fieldErrors.price ? "border-destructive focus-visible:ring-destructive" : "",
										"data-testid": "product-price-input"
									}),
									fieldErrors.price ? /* @__PURE__ */ jsx("p", {
										role: "alert",
										"data-testid": "product-price-field-error",
										className: "text-xs text-destructive font-medium",
										children: fieldErrors.price
									}) : /* @__PURE__ */ jsx("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Admite $0 (a convenir) o valor vacío para \"A cotizar\"."
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col justify-center space-y-3 pt-1",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "space-y-0.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "product-show-price",
												className: "text-xs font-semibold cursor-pointer",
												children: "Mostrar Precio al Público"
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-muted-foreground",
												children: "Si se apaga, se muestra \"Consultar\"."
											})]
										}), /* @__PURE__ */ jsx(Switch, {
											id: "product-show-price",
											checked: showPrice,
											onCheckedChange: setShowPrice,
											disabled: isSubmitting,
											"data-testid": "product-show-price-switch"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "space-y-0.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "product-visible",
												className: "text-xs font-semibold cursor-pointer",
												children: "Visible en Catálogo"
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-muted-foreground",
												children: "Habilita la presencia en la web pública."
											})]
										}), /* @__PURE__ */ jsx(Switch, {
											id: "product-visible",
											checked: visible,
											onCheckedChange: setVisible,
											disabled: isSubmitting,
											"data-testid": "product-visible-switch"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "space-y-0.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "product-featured",
												className: "text-xs font-semibold cursor-pointer",
												children: "Mostrar en Carrusel de Inicio"
											}), isFeaturedLimitReached && (!isEditing || !productToEdit?.isFeatured) ? /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-destructive font-medium",
												"data-testid": "product-featured-limit-warning",
												children: "Límite de 10 destacados alcanzado. Desmarca uno primero desde la tabla"
											}) : /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-muted-foreground",
												children: "Exhibe el repuesto en el carrusel principal de la Landing Page (máx. 10)."
											})]
										}), /* @__PURE__ */ jsx(Switch, {
											id: "product-featured",
											checked: isFeatured,
											onCheckedChange: setIsFeatured,
											disabled: isFeaturedDisabled,
											"data-testid": "product-featured-switch"
										})]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ jsxs(DialogFooter, {
						className: "gap-2 sm:gap-0 pt-3",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "outline",
							onClick: () => onOpenChange(false),
							disabled: isSubmitting,
							"data-testid": "product-form-cancel-btn",
							className: "cursor-pointer",
							children: "Cancelar"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "industrial",
							disabled: isSubmitting || isUploadingImage,
							"data-testid": "product-form-submit-btn",
							className: "min-w-32 cursor-pointer",
							children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "mr-2 size-4 animate-spin" }), "Guardando..."] }) : isUploadingImage ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "mr-2 size-4 animate-spin" }), "Subiendo imagen..."] }) : isEditing ? "Guardar Cambios" : "Crear Repuesto"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/components/admin/products/DeleteConfirmModal.tsx
/**
* Modal de Confirmación Destructiva con Validación Tipada.
* (Spec 010, RF-09, Caso Límite 4, TASK-20)
*
* Características Técnicas:
* - Diálogo modal bloqueante con prevención de cierre accidental durante el borrado.
* - Validación tipada estricta: el botón de confirmación inicia deshabilitado y solo se
*   activa si el texto ingresado coincide exactamente con "ELIMINAR" (case-sensitive + .trim()).
* - Intercepción del evento onSubmit: cancela cualquier intento de confirmación vía tecla Enter
*   si el input no cumple con la palabra exacta "ELIMINAR".
* - Atributos de inmunidad contra gestores de contraseñas y teclados predictivos:
*   `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="characters"`, `spellCheck="false"`.
* - Botón de confirmación formalizado con el token destructivo `--admin-btn-danger: #dc2626`.
*/
function DeleteConfirmModal({ open, onOpenChange, product, onSuccess, onConfirm }) {
	const { deleteProduct } = useAdmin();
	const [confirmationText, setConfirmationText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState(null);
	useEffect(() => {
		if (open) {
			setConfirmationText("");
			setError(null);
			setIsDeleting(false);
		}
	}, [open, product]);
	if (!product) return null;
	const isConfirmed = confirmationText.trim() === "ELIMINAR";
	const executeDelete = async () => {
		if (!isConfirmed || isDeleting) return;
		setError(null);
		setIsDeleting(true);
		try {
			if (onConfirm) {
				await onConfirm(product);
				onOpenChange(false);
				onSuccess?.();
			} else {
				const res = await deleteProduct(product.id);
				if (res.success) {
					onOpenChange(false);
					onSuccess?.();
				} else setError(res.reason || "No se pudo eliminar el repuesto.");
			}
		} catch (err) {
			setError(err?.message || "Ocurrió un error inesperado al eliminar el repuesto.");
		} finally {
			setIsDeleting(false);
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isConfirmed || isDeleting) return;
		await executeDelete();
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange: (nextOpen) => {
			if (!isDeleting) onOpenChange(nextOpen);
		},
		children: /* @__PURE__ */ jsx(DialogContent, {
			className: "sm:max-w-md bg-white border border-admin-border text-admin-text-main shadow-xl",
			"data-testid": "delete-confirm-modal",
			"data-modal-test": "product-delete-modal",
			"aria-describedby": "delete-confirm-description",
			onPointerDownOutside: (e) => {
				if (isDeleting) e.preventDefault();
			},
			onEscapeKeyDown: (e) => {
				if (isDeleting) e.preventDefault();
			},
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				noValidate: true,
				children: [
					/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 mb-1.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600",
							children: /* @__PURE__ */ jsx(AlertTriangle, { className: "size-5" })
						}), /* @__PURE__ */ jsx(DialogTitle, {
							className: "text-lg font-bold font-display text-admin-text-main",
							"data-testid": "delete-confirm-modal-title",
							children: "¿Eliminar repuesto permanentemente?"
						})]
					}), /* @__PURE__ */ jsxs(DialogDescription, {
						id: "delete-confirm-description",
						className: "text-sm text-admin-text-sub pt-1 leading-relaxed",
						children: [
							"Esta acción eliminará de forma irreversible el repuesto",
							" ",
							/* @__PURE__ */ jsxs("strong", {
								className: "text-admin-text-main font-semibold",
								children: [
									"\"",
									product.name,
									"\""
								]
							}),
							" ",
							product.oem ? `(OEM: ${product.oem})` : "",
							" del catálogo de Laboratorio Diésel."
						]
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "my-4 rounded-lg border border-red-200 bg-red-50/70 p-3.5 space-y-2.5",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ jsx(ShieldAlert, { className: "size-4 text-red-600 mt-0.5 shrink-0" }), /* @__PURE__ */ jsxs("label", {
								htmlFor: "delete-confirm-input",
								className: "text-xs font-medium text-red-900 leading-snug cursor-pointer",
								children: [
									"Para confirmar la eliminación destructiva, escriba exactamente",
									" ",
									/* @__PURE__ */ jsx("span", {
										className: "font-mono font-bold tracking-wider text-red-700 bg-red-100 px-1 py-0.5 rounded",
										children: "ELIMINAR"
									}),
									" ",
									"en el siguiente campo:"
								]
							})]
						}), /* @__PURE__ */ jsx(Input, {
							id: "delete-confirm-input",
							type: "text",
							value: confirmationText,
							onChange: (e) => setConfirmationText(e.target.value),
							placeholder: "Escriba ELIMINAR para habilitar",
							disabled: isDeleting,
							autoComplete: "off",
							autoCorrect: "off",
							autoCapitalize: "characters",
							spellCheck: "false",
							"data-testid": "delete-confirm-input",
							className: "h-10 border-red-300 bg-white font-mono text-sm tracking-wider uppercase text-admin-text-main placeholder:text-muted-foreground placeholder:normal-case focus-visible:ring-red-500 focus-visible:border-red-500"
						})]
					}),
					error && /* @__PURE__ */ jsx("div", {
						role: "alert",
						"data-testid": "delete-confirm-error",
						className: "mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive font-medium",
						children: error
					}),
					/* @__PURE__ */ jsxs(DialogFooter, {
						className: "gap-2 sm:gap-0 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "outline",
							disabled: isDeleting,
							onClick: () => onOpenChange(false),
							"data-testid": "delete-confirm-cancel-btn",
							className: "border-admin-border text-admin-text-main hover:bg-slate-100 cursor-pointer",
							children: "Cancelar"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "destructive",
							disabled: !isConfirmed || isDeleting,
							"data-testid": "delete-confirm-submit-btn",
							className: "gap-2 cursor-pointer bg-admin-btn-danger hover:bg-red-700 text-white font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
							children: isDeleting ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Eliminando..." })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Trash2, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Eliminar Repuesto" })] })
						})]
					})
				]
			})
		})
	});
}
//#endregion
//#region src/routes/admin.index.tsx?tsr-split=component
/**
* Punto de entrada principal del backoffice (/admin).
* Integra Toolbar, Table, FormModal y DeleteModal para el catálogo de repuestos.
* (RF-05, RF-06, RF-07)
*/
function AdminProductsPage() {
	const { products } = useAdmin();
	const [searchQuery, setSearchQuery] = useState("");
	const [onlyFeatured, setOnlyFeatured] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [productToEdit, setProductToEdit] = useState(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState(null);
	const handleCreate = () => {
		setProductToEdit(null);
		setFormOpen(true);
	};
	const handleEdit = (product) => {
		setProductToEdit(product);
		setFormOpen(true);
	};
	const handleDelete = (product) => {
		setProductToDelete(product);
		setDeleteOpen(true);
	};
	const featuredCount = products.filter((p) => p.isFeatured).length;
	const clean = searchQuery.trim().toLowerCase();
	const filteredCount = products.filter((p) => {
		if (onlyFeatured && !p.isFeatured) return false;
		if (!clean) return true;
		return p.name.toLowerCase().includes(clean) || p.oem.toLowerCase().includes(clean) || p.description.toLowerCase().includes(clean) || p.vehicleCompatibility.toLowerCase().includes(clean);
	}).length;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex flex-col gap-1",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Administración / Catálogo"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "font-display text-3xl font-bold tracking-tight text-foreground",
						children: "Catálogo de Repuestos"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "Control de inventario, edición técnica, códigos OEM, compatibilidad vehicular y visibilidad en tienda."
					})
				]
			}),
			/* @__PURE__ */ jsx(ProductToolbar, {
				searchQuery,
				onSearchChange: setSearchQuery,
				onNewProduct: handleCreate,
				totalCount: products.length,
				filteredCount,
				featuredCount,
				showOnlyFeatured: onlyFeatured,
				onToggleOnlyFeatured: setOnlyFeatured
			}),
			/* @__PURE__ */ jsx(ProductList, {
				searchQuery,
				onlyFeatured,
				onEdit: handleEdit,
				onDelete: handleDelete
			}),
			/* @__PURE__ */ jsx(ProductFormModal, {
				open: formOpen,
				onOpenChange: setFormOpen,
				productToEdit
			}),
			/* @__PURE__ */ jsx(DeleteConfirmModal, {
				open: deleteOpen,
				onOpenChange: setDeleteOpen,
				product: productToDelete
			})
		]
	});
}
//#endregion
export { AdminProductsPage as component };
