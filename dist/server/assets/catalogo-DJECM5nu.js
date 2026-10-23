import { i as formatPrice, l as ProductImageWithFallback, n as LandingNavbar, o as generateDirectProductWhatsAppUrl, r as LandingFooter, s as generateNoResultsWhatsAppUrl, y as useCatalogCart } from "./diesel-site-DP12_HDl.js";
import { a as cn, i as Button } from "./api-Db5K75is.js";
import { a as SheetHeader, c as normalizeSearchText, i as SheetContent, l as parseOemCodes, n as catalogService, o as SheetTitle, r as Sheet, s as evaluateProductMatch, t as CartDrawer } from "./CartDrawer-BlazrQB7.js";
import { n as normalizeFilterParam, t as Route } from "./catalogo-DOhKj-cT.js";
import * as React from "react";
import { Component, useCallback, useEffect, useMemo, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, Check, ChevronDown, RotateCcw, Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
//#region src/components/catalog/ProductCard.tsx
/**
* Tarjeta de Repuesto Diésel — Ficha Técnica Pura de Ingeniería.
* (Spec 009, RF-08, CL-01, CL-02, Bloque 2 - Tarea 2.3)
*
* Características:
* - Estructura Flexbox vertical con bloque de precio y acciones empujado al fondo (mt-auto)
*   asegurando alineación horizontal milimétrica de botones en la grilla.
* - Cabecera multimedia con relación de aspecto 16/10 y hairlines de 1px.
* - Badges técnicos superiores: Marca y Condición (Nuevo: sólido, Reacondicionado: punteado).
* - Título acotado a dos líneas (line-clamp-2) para prevenir desbordes.
* - Cuadrícula de datos técnicos con código OEM principal y guión técnico "—" ante ausencia.
* - Botón secundario para agregar a carrito y botón principal verde esmeralda de cotización directa por WhatsApp.
*/
function ProductCard({ product, brandName = "", onViewDetail, className = "" }) {
	const { add, getItemQuantity } = useCatalogCart();
	const cartQuantity = getItemQuantity(product.id);
	const directWhatsAppUrl = generateDirectProductWhatsAppUrl(product, brandName);
	const oemData = useMemo(() => parseOemCodes(product.oem), [product.oem]);
	return /* @__PURE__ */ jsxs("article", {
		className: `group flex min-w-0 flex-col h-full overflow-hidden rounded-lg border border-white/10 bg-[#111111] shadow-xs transition-all duration-300 ease-out hover:border-white/25 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] ${className}`,
		"data-testid": `product-card-${product.id}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative aspect-square w-full overflow-hidden border-b border-white/10 bg-media p-4 flex items-center justify-center",
			children: [/* @__PURE__ */ jsx(ProductImageWithFallback, {
				src: product.imageUrl,
				alt: product.name,
				className: "size-full object-contain rounded-md transition-transform duration-500 ease-out group-hover:scale-105",
				fallbackClassName: "flex size-full flex-col items-center justify-center bg-transparent p-2 text-center"
			}), /* @__PURE__ */ jsxs("div", {
				className: "absolute inset-x-3 top-3 flex items-center justify-between gap-2 pointer-events-none",
				children: [brandName ? /* @__PURE__ */ jsx("span", {
					className: "rounded border border-white/10 bg-zinc-950/90 px-2 py-0.5 text-micro text-zinc-300 backdrop-blur-xs shadow-xs font-mono",
					children: brandName
				}) : /* @__PURE__ */ jsx("span", {}), /* @__PURE__ */ jsx("span", {
					"data-testid": `badge-condition-${product.id}`,
					className: `rounded px-2.5 py-0.5 text-micro shadow-xs backdrop-blur-xs font-mono tracking-wider uppercase ${product.condition === "Nuevo" ? "border border-industrial/50 bg-zinc-950/90 text-industrial font-semibold" : "border border-badge-refurbished/50 bg-zinc-950/90 text-badge-refurbished font-medium"}`,
					children: product.condition
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-1 flex-col p-4 gap-2.5",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap items-center gap-1.5 self-start min-h-[22px]",
					children: oemData.primary ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("span", {
						className: "inline-block rounded border border-border/80 bg-white/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground",
						"data-testid": `oem-primary-${product.id}`,
						children: ["OEM ", oemData.primary]
					}), oemData.alternatives.length > 0 && /* @__PURE__ */ jsxs("span", {
						tabIndex: 0,
						role: "note",
						className: "inline-block cursor-help rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:border-border-hover hover:text-foreground transition-colors",
						title: `Equivalencias OEM:\n${oemData.alternatives.join(", ")}`,
						"aria-label": `Equivalencias alternativas: ${oemData.alternatives.join(", ")}`,
						"data-testid": `oem-alternatives-${product.id}`,
						children: [
							"+",
							oemData.alternatives.length,
							" ALTERNATIVOS"
						]
					})] }) : /* @__PURE__ */ jsx("span", {
						className: "inline-block font-mono text-[11px] text-muted-foreground",
						"data-testid": `oem-empty-${product.id}`,
						children: "—"
					})
				}),
				/* @__PURE__ */ jsx("h3", {
					className: "line-clamp-2 font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-white cursor-pointer",
					onClick: () => onViewDetail && onViewDetail(product.id),
					title: `Ver detalles de ${product.name}`,
					children: product.name
				}),
				product.vehicleCompatibility && /* @__PURE__ */ jsx("p", {
					className: "line-clamp-1 text-xs leading-relaxed text-muted-foreground",
					children: product.vehicleCompatibility
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-auto pt-2 flex flex-col gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex items-center",
						children: product.showPrice && product.price !== null && product.price > 0 ? /* @__PURE__ */ jsx("p", {
							className: "font-display text-xl font-bold tracking-tight text-foreground",
							children: formatPrice(product.price)
						}) : /* @__PURE__ */ jsx("span", {
							className: "rounded border border-border/80 bg-white/5 px-2.5 py-1 text-micro text-muted-foreground",
							children: "Consultar precio"
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ jsx(Button, {
							variant: "industrial",
							className: "h-10 w-full gap-2 text-xs font-semibold",
							onClick: () => add(product),
							"aria-label": cartQuantity > 0 ? `En el carrito (${cartQuantity}). Agregar una unidad más de ${product.name}` : `Agregar ${product.name} al carrito`,
							children: cartQuantity > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, { className: "size-3.5" }), /* @__PURE__ */ jsxs("span", { children: [
								"En el carrito (",
								cartQuantity,
								") · Agregar"
							] })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(ShoppingCart, { className: "size-3.5" }), /* @__PURE__ */ jsx("span", { children: "Agregar al Carrito" })] })
						}), /* @__PURE__ */ jsx(Button, {
							variant: "whatsapp",
							className: "h-10 w-full gap-2 text-xs font-semibold tracking-wide uppercase shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25",
							asChild: true,
							children: /* @__PURE__ */ jsxs("a", {
								href: directWhatsAppUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								"aria-label": `Consultar por ${product.name} en WhatsApp`,
								children: [/* @__PURE__ */ jsx(FaWhatsapp, { className: "size-4 shrink-0" }), /* @__PURE__ */ jsx("span", { children: "WhatsApp Directo" })]
							})
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/catalog/ProductGridSkeleton.tsx
function ProductGridSkeleton({ count = 6, className = "grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6" }) {
	return /* @__PURE__ */ jsx("div", {
		className,
		"data-testid": "product-grid-skeleton",
		"aria-label": "Cargando fichas técnicas de repuestos diésel...",
		"aria-busy": "true",
		children: Array.from({ length: count }, (_, i) => i).map((idx) => /* @__PURE__ */ jsxs("article", {
			className: "flex min-w-0 flex-col h-full overflow-hidden rounded-lg border border-border/80 bg-card shadow-xs animate-pulse",
			children: [/* @__PURE__ */ jsx("div", { className: "aspect-[16/10] w-full bg-white/5 border-b border-border/80" }), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-1 flex-col p-4 gap-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("div", { className: "h-4 w-16 rounded bg-white/10" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-20 rounded bg-white/10" })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5 pt-1",
						children: [/* @__PURE__ */ jsx("div", { className: "h-4 w-5/6 rounded bg-white/10" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-3/5 rounded bg-white/10" })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded border border-white/5 bg-white/[0.02] p-2.5 space-y-2",
						children: [/* @__PURE__ */ jsx("div", { className: "h-2.5 w-full rounded bg-white/5" }), /* @__PURE__ */ jsx("div", { className: "h-2.5 w-4/6 rounded bg-white/5" })]
					}),
					/* @__PURE__ */ jsx("div", { className: "h-5 w-28 rounded bg-white/10 mt-1" }),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-auto pt-2 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("div", { className: "h-9 w-10 shrink-0 rounded-md bg-white/10" }), /* @__PURE__ */ jsx("div", { className: "h-9 flex-1 rounded-md bg-white/10" })]
					})
				]
			})]
		}, idx))
	});
}
//#endregion
//#region src/components/ui/checkbox.tsx
var Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(CheckboxPrimitive.Root, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-border/80 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-industrial disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-industrial data-[state=checked]:border-industrial data-[state=checked]:text-white transition-colors", className),
	...props,
	children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
//#endregion
//#region src/components/catalog/FilterDrawer.tsx
function FilterDrawer({ open, onOpenChange, activeFiltersCount, onResetFilters, children }) {
	return /* @__PURE__ */ jsx(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(SheetContent, {
			side: "left",
			className: "z-40 w-[300px] max-w-[340px] border-r border-border bg-card p-6 overflow-y-auto technical-scrollbar sm:w-[340px]",
			"data-testid": "filter-drawer-content",
			children: [/* @__PURE__ */ jsx(SheetHeader, {
				className: "mb-4 text-left",
				children: /* @__PURE__ */ jsxs(SheetTitle, {
					className: "flex items-center justify-between font-display text-lg text-foreground",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-4 text-primary" }), /* @__PURE__ */ jsx("span", {
							className: "font-mono text-xs uppercase tracking-wider font-bold",
							children: "Filtros Técnicos"
						})]
					}), activeFiltersCount > 0 && /* @__PURE__ */ jsxs(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							onResetFilters();
							onOpenChange(false);
						},
						className: "h-8 gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground",
						"data-testid": "reset-filters-mobile-button",
						children: [/* @__PURE__ */ jsx(RotateCcw, { className: "size-3" }), "Limpiar"]
					})]
				})
			}), children]
		})
	});
}
function MobileFilterTrigger({ onClick, activeFiltersCount, className = "" }) {
	return /* @__PURE__ */ jsx("div", {
		className: `fixed bottom-6 left-1/2 -translate-x-1/2 z-35 lg:hidden ${className}`,
		"data-testid": "mobile-filter-trigger-container",
		children: /* @__PURE__ */ jsxs(Button, {
			variant: "industrial",
			className: "h-12 gap-2.5 rounded-full border border-border/80 bg-card/95 px-5 font-mono text-xs font-bold uppercase tracking-wider text-foreground shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95",
			onClick,
			"aria-label": "Abrir filtros técnicos de productos",
			"data-testid": "mobile-filter-trigger",
			children: [
				/* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-4 text-primary" }),
				/* @__PURE__ */ jsx("span", { children: "FILTROS TÉCNICOS" }),
				activeFiltersCount > 0 && /* @__PURE__ */ jsx("span", {
					className: "flex size-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground animate-in zoom-in",
					"data-testid": "mobile-filter-badge",
					children: activeFiltersCount
				})
			]
		})
	});
}
//#endregion
//#region src/lib/catalog-filter.ts
/**
* Expande los identificadores de categorías seleccionadas:
* Si una categoría seleccionada es raíz o tiene hijas, agrega los IDs de todas sus subcategorías hijas.
*/
function expandCategoryIds(selectedCategoryIds = [], categories = []) {
	const expanded = /* @__PURE__ */ new Set();
	if (!selectedCategoryIds.length) return expanded;
	const categoryMap = /* @__PURE__ */ new Map();
	for (const cat of categories) categoryMap.set(cat.id, cat);
	const childrenByParent = /* @__PURE__ */ new Map();
	for (const cat of categories) if (cat.parentId) {
		const existing = childrenByParent.get(cat.parentId) || [];
		existing.push(cat.id);
		childrenByParent.set(cat.parentId, existing);
	}
	for (const catId of selectedCategoryIds) {
		expanded.add(catId);
		const cat = categoryMap.get(catId);
		if (cat?.children && Array.isArray(cat.children)) for (const child of cat.children) expanded.add(child.id);
		const relationalChildren = childrenByParent.get(catId);
		if (relationalChildren) for (const childId of relationalChildren) expanded.add(childId);
	}
	return expanded;
}
/**
* Aplica el filtrado cruzado dimensional sobre los productos del catálogo.
*/
function filterCatalogProducts({ products, searchQuery = "", selectedBrandIds = [], selectedCategoryIds = [], categories = [], brandsLookup }) {
	const qNorm = normalizeSearchText(searchQuery);
	const brandsSet = new Set(selectedBrandIds.filter(Boolean));
	const expandedCategoryIds = expandCategoryIds(selectedCategoryIds, categories);
	const matchedItems = [];
	for (const product of products) {
		if (!(brandsSet.size === 0 || brandsSet.has(product.brandId))) continue;
		if (!(expandedCategoryIds.size === 0 || product.categoryIds.some((id) => expandedCategoryIds.has(id)))) continue;
		let brandName = "";
		if (brandsLookup) if (typeof brandsLookup === "function") brandName = brandsLookup(product.brandId) || "";
		else if (brandsLookup instanceof Map) brandName = brandsLookup.get(product.brandId) || "";
		else if (Array.isArray(brandsLookup)) brandName = brandsLookup.find((b) => b.id === product.brandId)?.name || "";
		else brandName = brandsLookup[product.brandId] || "";
		const { matches: matchesText, oemPriority } = evaluateProductMatch(product, qNorm, brandName);
		if (matchesText) matchedItems.push({
			product,
			oemPriority
		});
	}
	matchedItems.sort((a, b) => {
		if (a.oemPriority !== b.oemPriority) return a.oemPriority - b.oemPriority;
		return a.product.name.localeCompare(b.product.name, "es");
	});
	return matchedItems.map((item) => item.product);
}
//#endregion
//#region src/components/catalog/CatalogFilters.tsx
/**
* Filtros Facetados del Catálogo con Árbol Jerárquico de Categorías y Marcas.
* (Spec 003, RF-04, Bloque 5 - Tarea T-14)
*
* Características:
* - Árbol jerárquico de categorías (raíz y subcategorías hijas con indentación visual).
* - Selector de marcas con conteo dinámico de productos disponibles.
* - Conteo dinámico de productos por categoría y subcategoría.
* - Drawer deslizable para dispositivos móviles (Sheet) y panel lateral para escritorio.
* - Botón de limpieza de filtros activos.
*/
function CatalogFilters({ brands, categories, selectedBrandIds, selectedCategoryIds, onBrandToggle, onCategoryToggle, onResetFilters, products = [], className = "", mobileOpen, onMobileOpenChange }) {
	const [internalMobileOpen, setInternalMobileOpen] = useState(false);
	const isMobileOpen = mobileOpen !== void 0 ? mobileOpen : internalMobileOpen;
	const handleMobileOpen = onMobileOpenChange !== void 0 ? onMobileOpenChange : setInternalMobileOpen;
	const activeFiltersCount = selectedBrandIds.length + selectedCategoryIds.length;
	const brandCounts = /* @__PURE__ */ new Map();
	for (const b of brands) brandCounts.set(b.id, 0);
	for (const p of products) {
		const cur = brandCounts.get(p.brandId) ?? 0;
		brandCounts.set(p.brandId, cur + 1);
	}
	const allCategoriesMap = /* @__PURE__ */ new Map();
	for (const cat of categories) {
		allCategoriesMap.set(cat.id, {
			id: cat.id,
			name: cat.name,
			parentId: cat.parentId
		});
		if (cat.children && Array.isArray(cat.children)) {
			for (const ch of cat.children) if (!allCategoriesMap.has(ch.id)) allCategoriesMap.set(ch.id, {
				id: ch.id,
				name: ch.name,
				parentId: cat.id
			});
		}
	}
	const categoryCounts = /* @__PURE__ */ new Map();
	for (const [catId] of allCategoriesMap) {
		const expanded = expandCategoryIds([catId], categories);
		expanded.add(catId);
		let count = 0;
		for (const p of products) if (p.categoryIds && p.categoryIds.some((id) => expanded.has(id))) count++;
		categoryCounts.set(catId, count);
	}
	const rootCategories = categories.filter((c) => !c.parentId);
	const childrenByParent = /* @__PURE__ */ new Map();
	for (const cat of categories) if (cat.parentId) {
		const list = childrenByParent.get(cat.parentId) || [];
		list.push(cat);
		childrenByParent.set(cat.parentId, list);
	}
	const FilterContent = ({ prefix = "desk" }) => /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		"data-testid": "catalog-filter-content",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "border-b border-border pb-5",
			children: [/* @__PURE__ */ jsx("h3", {
				className: "mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
				children: "Categorías"
			}), /* @__PURE__ */ jsx("div", {
				className: "space-y-1.5",
				role: "group",
				"aria-label": "Filtro por Categorías",
				children: rootCategories.map((root) => {
					const rootCount = categoryCounts.get(root.id) ?? 0;
					const isRootChecked = selectedCategoryIds.includes(root.id);
					const children = childrenByParent.get(root.id) || root.children?.map((ch) => ({
						id: ch.id,
						name: ch.name,
						parentId: root.id
					})) || [];
					return /* @__PURE__ */ jsxs("div", {
						className: "space-y-1",
						"data-testid": `category-tree-root-${root.id}`,
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between py-1 text-sm",
							children: [/* @__PURE__ */ jsxs("label", {
								className: "flex cursor-pointer items-center gap-2.5 font-medium text-foreground select-none hover:text-industrial transition-colors",
								children: [/* @__PURE__ */ jsx(Checkbox, {
									id: `${prefix}-cat-${root.id}`,
									checked: isRootChecked,
									onCheckedChange: () => onCategoryToggle(root.id),
									"data-testid": `checkbox-cat-${root.id}`
								}), /* @__PURE__ */ jsx("span", { children: root.name })]
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-mono text-xs text-muted-foreground",
								"data-testid": `count-cat-${root.id}`,
								children: [
									"(",
									rootCount,
									")"
								]
							})]
						}), children.length > 0 && /* @__PURE__ */ jsx("div", {
							className: "ml-3.5 space-y-1 border-l-2 border-border/60 pl-3.5 py-0.5",
							"data-testid": `category-children-${root.id}`,
							children: children.map((child) => {
								const childCount = categoryCounts.get(child.id) ?? 0;
								const isChildChecked = selectedCategoryIds.includes(child.id);
								return /* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between py-0.5 text-xs",
									"data-testid": `category-child-${child.id}`,
									children: [/* @__PURE__ */ jsxs("label", {
										className: "flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground select-none transition-colors",
										children: [/* @__PURE__ */ jsx(Checkbox, {
											id: `${prefix}-cat-${child.id}`,
											checked: isChildChecked,
											onCheckedChange: () => onCategoryToggle(child.id),
											className: "size-3.5",
											"data-testid": `checkbox-cat-${child.id}`
										}), /* @__PURE__ */ jsx("span", { children: child.name })]
									}), /* @__PURE__ */ jsxs("span", {
										className: "font-mono text-[11px] text-muted-foreground",
										"data-testid": `count-cat-${child.id}`,
										children: [
											"(",
											childCount,
											")"
										]
									})]
								}, child.id);
							})
						})]
					}, root.id);
				})
			})]
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
			className: "mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
			children: "Marcas"
		}), /* @__PURE__ */ jsx("div", {
			className: "space-y-1.5",
			role: "group",
			"aria-label": "Filtro por Marcas",
			children: brands.map((brand) => {
				const count = brandCounts.get(brand.id) ?? 0;
				const isChecked = selectedBrandIds.includes(brand.id);
				return /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between py-1 text-sm",
					"data-testid": `brand-item-${brand.id}`,
					children: [/* @__PURE__ */ jsxs("label", {
						className: "flex cursor-pointer items-center gap-2.5 text-foreground select-none hover:text-industrial transition-colors",
						children: [/* @__PURE__ */ jsx(Checkbox, {
							id: `${prefix}-brand-${brand.id}`,
							checked: isChecked,
							onCheckedChange: () => onBrandToggle(brand.id),
							"data-testid": `checkbox-brand-${brand.id}`
						}), /* @__PURE__ */ jsx("span", { children: brand.name })]
					}), /* @__PURE__ */ jsxs("span", {
						className: "font-mono text-xs text-muted-foreground",
						"data-testid": `count-brand-${brand.id}`,
						children: [
							"(",
							count,
							")"
						]
					})]
				}, brand.id);
			})
		})] })]
	});
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
		className: "lg:hidden",
		children: [/* @__PURE__ */ jsxs(Button, {
			variant: "outline",
			className: "h-11 w-full justify-between rounded-xl border-border bg-card px-4 font-mono text-xs uppercase tracking-wider text-foreground shadow-xs",
			"aria-label": "Abrir filtros de productos",
			onClick: () => handleMobileOpen(true),
			"data-testid": "open-mobile-filters-button",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-4 text-industrial" }),
					/* @__PURE__ */ jsx("span", { children: "Filtros Técnicos" }),
					activeFiltersCount > 0 && /* @__PURE__ */ jsx("span", {
						className: "rounded-full bg-industrial px-2 py-0.5 font-mono text-[10px] font-bold text-white",
						children: activeFiltersCount
					})
				]
			}), /* @__PURE__ */ jsx(ChevronDown, { className: "size-4 text-muted-foreground" })]
		}), /* @__PURE__ */ jsx(FilterDrawer, {
			open: isMobileOpen,
			onOpenChange: handleMobileOpen,
			activeFiltersCount,
			onResetFilters,
			children: /* @__PURE__ */ jsx(FilterContent, { prefix: "mob" })
		})]
	}), /* @__PURE__ */ jsxs("aside", {
		className: `hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto technical-scrollbar rounded-xl border border-border bg-card p-5 shadow-xs ${className}`,
		"aria-label": "Filtros del catálogo",
		"data-testid": "catalog-filters-desktop",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-5 flex items-center justify-between border-b border-border pb-4",
			children: [/* @__PURE__ */ jsxs("h2", {
				className: "flex items-center gap-2 font-display text-lg font-semibold text-foreground",
				children: [/* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-4 text-industrial" }), /* @__PURE__ */ jsx("span", { children: "Filtros" })]
			}), activeFiltersCount > 0 && /* @__PURE__ */ jsxs(Button, {
				variant: "ghost",
				size: "sm",
				onClick: onResetFilters,
				className: "h-8 gap-1.5 px-2 font-mono text-xs font-semibold text-muted-foreground hover:text-industrial",
				"data-testid": "reset-filters-desktop-button",
				children: [/* @__PURE__ */ jsx(RotateCcw, { className: "size-3.5" }), "Limpiar"]
			})]
		}), /* @__PURE__ */ jsx(FilterContent, { prefix: "desk" })]
	})] });
}
//#endregion
//#region src/components/catalog/CatalogErrorBoundary.tsx
/**
* Error Boundary y Vista Funcional de Error del Catálogo de Repuestos Diésel.
* (Spec 003, RF-02, docs/constitution.md §6 - Principio 6: Errores Opacos, Tarea T-16)
*
* Características:
* - Captura errores de red y excepciones de componentes sin romper la aplicación.
* - Mensaje amigable estándar en español: "Error temporal al cargar el catálogo".
* - Principio 6 (Errores Opacos): Oculta estrictamente trazas técnicas, consultas SQL
*   o detalles internos del servidor/base de datos.
* - Provee botón accesible de reintento que resetea el estado y re-ejecuta la carga.
*/
/**
* Vista visual de error para renderizado directo o como fallback.
*/
function CatalogErrorView({ onRetry, className = "" }) {
	return /* @__PURE__ */ jsxs("div", {
		role: "alert",
		className: `flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-xs sm:p-12 ${className}`,
		"data-testid": "catalog-error-state",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive",
				children: /* @__PURE__ */ jsx(AlertCircle, { className: "size-7 stroke-[1.75]" })
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl",
				children: "Error temporal al cargar el catálogo"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 max-w-md text-sm leading-relaxed text-muted-foreground",
				children: "No pudimos conectar con el servidor para obtener los inyectores y repuestos diésel. Por favor verificá tu conexión o intentá nuevamente en unos instantes."
			}),
			onRetry && /* @__PURE__ */ jsx("div", {
				className: "mt-6",
				children: /* @__PURE__ */ jsxs(Button, {
					variant: "default",
					onClick: onRetry,
					className: "h-11 gap-2 px-6 font-semibold shadow-xs",
					"data-testid": "retry-button",
					"aria-label": "Reintentar carga del catálogo",
					children: [/* @__PURE__ */ jsx(RotateCcw, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Reintentar" })]
				})
			})
		]
	});
}
/**
* Componente ErrorBoundary para envolver la grilla y vistas del catálogo.
*/
var CatalogErrorBoundary = class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, errorInfo) {
		console.error("[CatalogErrorBoundary] Error capturado:", error.message, errorInfo);
	}
	handleRetry = () => {
		this.setState({
			hasError: false,
			error: null
		});
		if (this.props.onRetry) this.props.onRetry();
	};
	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			return /* @__PURE__ */ jsx(CatalogErrorView, { onRetry: this.handleRetry });
		}
		return this.props.children;
	}
};
//#endregion
//#region src/routes/catalogo.tsx?tsr-split=component
/**
* Ruta Principal del Catálogo Público (/catalogo).
* (Spec 003, RF-01 a RF-12, Bloque 6 - Tarea T-17)
*
* Características:
* - Integración institucional con LandingNavbar y LandingFooter (RF-01).
* - Sincronización bidireccional de Search Params en URL con TanStack Router (RF-03, RF-04).
* - Consumo del cliente HTTP centralizado (catalogService) filtrando visible: true (RF-02).
* - Grilla con esqueleto de carga ProductGridSkeleton y tarjetas ProductCard (RF-06 a RF-09).
* - Filtros facetados combinados CatalogFilters con árbol jerárquico y conteos (RF-04).
* - Estado sin resultados con consulta asistida hacia WhatsApp (RF-05).
* - Botón flotante reactivo del carrito de consultas y drawer CartDrawer (RF-08, RF-10, RF-12).
* - Error boundary CatalogErrorBoundary ante fallos de conexión (Principio 6).
*/
function CatalogPage({ searchParams, onUpdateSearchParams, mockProducts, mockBrands, mockCategories } = {}) {
	const { count: cartCount } = useCatalogCart();
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
	const [products, setProducts] = useState(mockProducts || []);
	const [brands, setBrands] = useState(mockBrands || []);
	const [categories, setCategories] = useState(mockCategories || []);
	const [isLoading, setIsLoading] = useState(!mockProducts);
	const [fetchError, setFetchError] = useState(null);
	const [searchQuery, setSearchQuery] = useState(searchParams?.q || "");
	const [selectedBrandIds, setSelectedBrandIds] = useState(normalizeFilterParam(searchParams?.brand));
	const [selectedCategoryIds, setSelectedCategoryIds] = useState(normalizeFilterParam(searchParams?.category));
	useEffect(() => {
		if (searchParams) {
			setSearchQuery(searchParams.q || "");
			setSelectedBrandIds(normalizeFilterParam(searchParams.brand));
			setSelectedCategoryIds(normalizeFilterParam(searchParams.category));
		}
	}, [searchParams]);
	const loadData = useCallback(async () => {
		setIsLoading(true);
		setFetchError(null);
		try {
			const [fetchedProducts, fetchedBrands, fetchedCategories] = await Promise.all([
				catalogService.getVisibleProducts(),
				catalogService.getBrands(),
				catalogService.getCategories()
			]);
			setProducts(fetchedProducts);
			setBrands(fetchedBrands);
			setCategories(fetchedCategories);
		} catch (err) {
			setFetchError(err instanceof Error ? err : new Error(String(err)));
		} finally {
			setIsLoading(false);
		}
	}, []);
	useEffect(() => {
		if (!mockProducts) loadData();
	}, [loadData, mockProducts]);
	const handleSearchChange = (query) => {
		setSearchQuery(query);
		onUpdateSearchParams?.({
			q: query,
			brand: selectedBrandIds,
			category: selectedCategoryIds
		});
	};
	const handleBrandToggle = (brandId) => {
		const next = selectedBrandIds.includes(brandId) ? selectedBrandIds.filter((id) => id !== brandId) : [...selectedBrandIds, brandId];
		setSelectedBrandIds(next);
		onUpdateSearchParams?.({
			q: searchQuery,
			brand: next,
			category: selectedCategoryIds
		});
	};
	const handleCategoryToggle = (categoryId) => {
		const next = selectedCategoryIds.includes(categoryId) ? selectedCategoryIds.filter((id) => id !== categoryId) : [...selectedCategoryIds, categoryId];
		setSelectedCategoryIds(next);
		onUpdateSearchParams?.({
			q: searchQuery,
			brand: selectedBrandIds,
			category: next
		});
	};
	const handleResetFilters = () => {
		setSearchQuery("");
		setSelectedBrandIds([]);
		setSelectedCategoryIds([]);
		onUpdateSearchParams?.({
			q: "",
			brand: [],
			category: []
		});
	};
	const brandsMap = useMemo(() => {
		const map = /* @__PURE__ */ new Map();
		for (const b of brands) map.set(b.id, b.name);
		return map;
	}, [brands]);
	const filteredProducts = useMemo(() => {
		return filterCatalogProducts({
			products,
			searchQuery,
			selectedBrandIds,
			selectedCategoryIds,
			categories,
			brandsLookup: brandsMap
		});
	}, [
		products,
		searchQuery,
		selectedBrandIds,
		selectedCategoryIds,
		categories,
		brandsMap
	]);
	const activeBrandNames = useMemo(() => selectedBrandIds.map((id) => brandsMap.get(id) || id), [selectedBrandIds, brandsMap]);
	const activeCategoryNames = useMemo(() => {
		const catMap = new Map(categories.map((c) => [c.id, c.name]));
		return selectedCategoryIds.map((id) => catMap.get(id) || id);
	}, [selectedCategoryIds, categories]);
	const noResultsWhatsAppUrl = useMemo(() => generateNoResultsWhatsAppUrl(searchQuery, activeBrandNames, activeCategoryNames), [
		searchQuery,
		activeBrandNames,
		activeCategoryNames
	]);
	const activeFiltersCount = selectedBrandIds.length + selectedCategoryIds.length;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(LandingNavbar, { isCatalog: true }),
		/* @__PURE__ */ jsxs("main", {
			className: "min-h-screen bg-background",
			children: [
				/* @__PURE__ */ jsx("section", {
					className: "border-b border-border/80 bg-hero py-10 text-hero-foreground md:py-14",
					children: /* @__PURE__ */ jsxs("div", {
						className: "site-container",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "mb-2 font-mono text-xs font-semibold tracking-wider text-primary uppercase",
								children: "Laboratorio Diésel · Catálogo Oficial"
							}),
							/* @__PURE__ */ jsx("h1", {
								className: "font-display text-3xl font-bold tracking-tight md:text-5xl",
								children: "El inyector y repuesto que tu motor necesita."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base",
								children: "Common Rail, bombas de alta presión y componentes de precisión. Buscá por código OEM, verificá compatibilidad y cotizá directamente por WhatsApp."
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-7 max-w-2xl",
								children: /* @__PURE__ */ jsxs("label", {
									htmlFor: "catalog-search-input",
									className: "flex h-13 items-center gap-3 rounded-xl border border-border bg-card px-4 text-foreground shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
									children: [
										/* @__PURE__ */ jsx(Search, { className: "size-5 shrink-0 text-primary" }),
										/* @__PURE__ */ jsx("input", {
											id: "catalog-search-input",
											type: "search",
											className: "w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
											placeholder: "Buscar por Código OEM, repuesto, marca o vehículo...",
											"aria-label": "Buscar por Código OEM, repuesto, marca o vehículo",
											value: searchQuery,
											onChange: (e) => handleSearchChange(e.target.value),
											"data-testid": "catalog-search-input"
										}),
										searchQuery && /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => handleSearchChange(""),
											className: "p-1 text-muted-foreground hover:text-foreground",
											"aria-label": "Limpiar término de búsqueda",
											children: /* @__PURE__ */ jsx(X, { className: "size-4" })
										})
									]
								})
							})
						]
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "site-container py-8 md:py-12",
					children: fetchError ? /* @__PURE__ */ jsx(CatalogErrorView, { onRetry: loadData }) : /* @__PURE__ */ jsxs("div", {
						className: "grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]",
						children: [/* @__PURE__ */ jsx("aside", {
							"aria-label": "Filtros del catálogo",
							className: "min-w-0",
							children: /* @__PURE__ */ jsx(CatalogFilters, {
								brands,
								categories,
								selectedBrandIds,
								selectedCategoryIds,
								onBrandToggle: handleBrandToggle,
								onCategoryToggle: handleCategoryToggle,
								onResetFilters: handleResetFilters,
								products,
								mobileOpen: isFilterDrawerOpen,
								onMobileOpenChange: setIsFilterDrawerOpen
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
									className: "font-display text-2xl font-bold text-foreground",
									children: "Repuestos Diésel"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: isLoading ? "Cargando repuestos..." : `${filteredProducts.length} productos disponibles`
								})] }), (activeFiltersCount > 0 || searchQuery) && /* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [searchQuery && /* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary",
										children: [/* @__PURE__ */ jsxs("span", { children: ["Búsqueda: ", searchQuery] }), /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => handleSearchChange(""),
											className: "hover:text-primary/70",
											"aria-label": "Eliminar filtro de búsqueda",
											children: /* @__PURE__ */ jsx(X, { className: "size-3" })
										})]
									}), /* @__PURE__ */ jsx(Button, {
										variant: "ghost",
										size: "sm",
										onClick: handleResetFilters,
										className: "h-7 text-xs font-semibold text-muted-foreground hover:text-foreground",
										"data-testid": "reset-all-filters-chip",
										children: "Limpiar filtros"
									})]
								})]
							}), isLoading ? /* @__PURE__ */ jsx(ProductGridSkeleton, { count: 6 }) : products.length === 0 ? /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center",
								"data-testid": "empty-catalog-state",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "font-display text-xl font-semibold text-foreground",
									children: "No hay repuestos publicados actualmente"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-2 max-w-sm text-xs text-muted-foreground",
									children: "El taller está actualizando el catálogo de inyectores. Por favor consultanos directamente por WhatsApp."
								})]
							}) : filteredProducts.length === 0 ? /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center sm:p-14",
								"data-testid": "no-results-state",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground",
										children: /* @__PURE__ */ jsx(Search, { className: "size-7 stroke-[1.75]" })
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "font-display text-2xl font-bold text-foreground",
										children: "No encontramos repuestos con los criterios aplicados"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground",
										children: searchQuery ? `No hay coincidencias para "${searchQuery}". Consultanos por WhatsApp con el código de tu pieza o vehículo y te asistimos inmediatamente.` : "No encontramos piezas que coincidan con la combinación de filtros seleccionada."
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-6 flex flex-wrap items-center justify-center gap-3",
										children: [/* @__PURE__ */ jsx(Button, {
											variant: "whatsapp",
											className: "h-11 gap-2.5 px-5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25",
											asChild: true,
											children: /* @__PURE__ */ jsxs("a", {
												href: noResultsWhatsAppUrl,
												target: "_blank",
												rel: "noopener noreferrer",
												"data-testid": "no-results-whatsapp-button",
												children: [/* @__PURE__ */ jsx(FaWhatsapp, { className: "size-4 shrink-0 text-white" }), /* @__PURE__ */ jsx("span", { children: "Consultar pieza por WhatsApp" })]
											})
										}), /* @__PURE__ */ jsx(Button, {
											variant: "outline",
											className: "h-11 px-5 font-medium",
											onClick: handleResetFilters,
											"data-testid": "no-results-reset-button",
											children: "Limpiar filtros"
										})]
									})
								]
							}) : /* @__PURE__ */ jsx("div", {
								className: "grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6",
								"data-testid": "catalog-product-grid",
								children: filteredProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, {
									product,
									brandName: brandsMap.get(product.brandId) || ""
								}, product.id))
							})]
						})]
					})
				}),
				/* @__PURE__ */ jsx(MobileFilterTrigger, {
					onClick: () => setIsFilterDrawerOpen(true),
					activeFiltersCount
				}),
				/* @__PURE__ */ jsx("div", {
					className: "fixed bottom-6 right-6 z-40",
					children: /* @__PURE__ */ jsxs(Button, {
						variant: "industrial",
						size: "lg",
						className: "h-14 gap-3 rounded-full px-5 shadow-xl hover:scale-105 transition-transform",
						onClick: () => setIsCartOpen(true),
						"aria-label": `Ver carrito de consultas (${cartCount} productos)`,
						"data-testid": "floating-cart-button",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(ShoppingCart, { className: "size-5" }), cartCount > 0 && /* @__PURE__ */ jsx("span", {
								className: "absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground animate-in zoom-in",
								"data-testid": "floating-cart-badge",
								children: cartCount
							})]
						}), /* @__PURE__ */ jsx("span", {
							className: "font-semibold text-sm hidden sm:inline",
							children: "Tu Carrito"
						})]
					})
				}),
				/* @__PURE__ */ jsx(CartDrawer, {
					open: isCartOpen,
					onOpenChange: setIsCartOpen
				})
			]
		}),
		/* @__PURE__ */ jsx(LandingFooter, {})
	] });
}
function CatalogRouteComponent() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const handleUpdateSearch = (updates) => {
		navigate({
			search: (prev) => {
				const next = { ...prev };
				if (updates.q !== void 0) if (updates.q) next.q = updates.q;
				else delete next.q;
				if (updates.brand !== void 0) if (updates.brand.length === 1) next.brand = updates.brand[0];
				else if (updates.brand.length > 1) next.brand = updates.brand;
				else delete next.brand;
				if (updates.category !== void 0) if (updates.category.length === 1) next.category = updates.category[0];
				else if (updates.category.length > 1) next.category = updates.category;
				else delete next.category;
				return next;
			},
			replace: true
		});
	};
	return /* @__PURE__ */ jsx(CatalogErrorBoundary, { children: /* @__PURE__ */ jsx(CatalogPage, {
		searchParams: search,
		onUpdateSearchParams: handleUpdateSearch
	}) });
}
//#endregion
export { CatalogPage, CatalogPage as default, CatalogRouteComponent as component };
