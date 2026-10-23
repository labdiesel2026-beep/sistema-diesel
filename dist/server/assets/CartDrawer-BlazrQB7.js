import { a as generateCartWhatsAppUrl, i as formatPrice, l as ProductImageWithFallback, y as useCatalogCart } from "./diesel-site-DP12_HDl.js";
import { a as cn, i as Button, n as api } from "./api-Db5K75is.js";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Minus, Plus, RotateCcw, ShoppingCart, Trash2, X } from "lucide-react";
import { cva } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { FaWhatsapp } from "react-icons/fa";
//#region src/lib/catalog-search.ts
/**
* Normaliza una cadena de texto para comparaciones de búsqueda:
* - Descompone caracteres Unicode (NFD).
* - Elimina marcas diacríticas (tildes, diéresis).
* - Convierte a minúsculas y elimina espacios al inicio y final.
*/
function normalizeSearchText(text) {
	if (!text) return "";
	return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
/**
* Evalúa si un producto coincide con el término de búsqueda y retorna su prioridad:
* - Prioridad 0: Coincidencia en Código OEM.
* - Prioridad 1: Coincidencia en Nombre, Marca o Compatibilidad Vehicular.
* - null: Sin coincidencia.
*/
function evaluateProductMatch(product, normalizedQuery, brandName = "") {
	if (!normalizedQuery) return {
		matches: true,
		oemPriority: 2
	};
	const oemNorm = normalizeSearchText(product.oem);
	const nameNorm = normalizeSearchText(product.name);
	const brandNorm = normalizeSearchText(brandName);
	const compatNorm = normalizeSearchText(product.vehicleCompatibility);
	const matchesOEM = oemNorm !== "" && oemNorm.includes(normalizedQuery);
	const matchesName = nameNorm.includes(normalizedQuery);
	const matchesBrand = brandNorm !== "" && brandNorm.includes(normalizedQuery);
	const matchesCompat = compatNorm !== "" && compatNorm.includes(normalizedQuery);
	return {
		matches: matchesOEM || matchesName || matchesBrand || matchesCompat,
		oemPriority: matchesOEM ? 0 : 1
	};
}
/**
* Parsea y descompone múltiples códigos OEM cruzados en un repuesto diésel.
* (Spec 009, RF-08, CL-02)
*
* Separa por comas (,), barras (/), puntos y coma (;) o saltos de línea.
* El primer token se asume como código principal del fabricante de inyección.
*/
function parseOemCodes(oem) {
	if (!oem || !oem.trim()) return {
		primary: null,
		alternatives: [],
		totalCount: 0
	};
	const tokens = oem.split(/[,/;\n]+/).map((code) => code.trim()).filter((code) => code.length > 0);
	if (tokens.length === 0) return {
		primary: null,
		alternatives: [],
		totalCount: 0
	};
	return {
		primary: tokens[0] ?? null,
		alternatives: tokens.slice(1),
		totalCount: tokens.length
	};
}
//#endregion
//#region src/components/ui/sheet.tsx
var Sheet = SheetPrimitive.Root;
var SheetPortal = SheetPrimitive.Portal;
var SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Overlay, {
	className: cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-zinc-950 text-white p-6 shadow-2xl transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b border-white/10 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t border-white/10 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r border-white/10 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l border-white/10 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(SheetPrimitive.Content, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ jsxs(SheetPrimitive.Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: "Cerrar"
		})]
	}), children]
})] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Title, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
var SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
//#endregion
//#region src/services/catalog-service.ts
/**
* Servicio de Consumo HTTP para el Catálogo Público de Repuestos e Inyectores Diésel.
* (Spec 003, RF-02, RF-04, RF-10, RF-11, Bloque 1 - Tarea T-02)
*
* Encapsula las llamadas a la API REST pública mediante el cliente centralizado api.ts.
*/
var API_BASE_URL = "http://localhost:3001/api";
var catalogService = {
	/**
	* Obtiene todos los productos del catálogo y filtra exclusivamente
	* aquellos con visible === true para la exhibición pública (RF-02).
	*/
	async getVisibleProducts() {
		return (await api.get(`${API_BASE_URL}/products`)).filter((product) => product.visible === true);
	},
	/**
	* Obtiene todos los productos (incluyendo visible === false) para
	* revalidación autorizada de ítems previamente guardados en el carrito (RF-10, RF-11).
	*/
	async getAllProductsForValidation() {
		return api.get(`${API_BASE_URL}/products`);
	},
	/**
	* Obtiene el árbol completo de categorías y subcategorías (RF-04).
	*/
	async getCategories() {
		return api.get(`${API_BASE_URL}/categories`);
	},
	/**
	* Obtiene la lista completa de marcas de repuestos (RF-04).
	*/
	async getBrands() {
		return api.get(`${API_BASE_URL}/brands`);
	},
	/**
	* Obtiene la entidad de un producto individual por su UUID (RF-02, RF-06).
	*/
	async getProductById(id) {
		return api.get(`${API_BASE_URL}/products/${id}`);
	}
};
//#endregion
//#region src/lib/cart-revalidation.ts
/**
* Servicio de Enriquecimiento y Revalidación Autorizada del Carrito.
* (Spec 003, RF-07, RF-08, RF-10, RF-11, docs/constitution.md §5, Tarea T-08)
*
* Principio 5 (Persistencia como fuente de verdad):
* Contrasta los identificadores y cantidades guardados en la caché efímera de localStorage
* contra los datos autoritativos y frescos obtenidos del backend (PostgreSQL).
*
* Reglas de negocio:
* 1. Productos con visible === true: se actualizan nombre, marca, foto, precio y OEM a los valores actuales.
* 2. Productos con visible === false (pausados/ocultados): se conservan en la consulta del usuario pero
*    se marcan con requiresReconfirmation: true y precio forzado a null ("A cotizar").
* 3. Productos eliminados físicamente de la base de datos: se identifican mediante lastKnown,
*    se marcan con requiresReconfirmation: true, isDeletedOrUnavailable: true y precio null.
*/
/**
* Función pura que contrasta los ítems de la caché contra un catálogo fresco en memoria.
*/
function enrichCartItems(itemsCache, freshProducts, brandsSource) {
	if (!itemsCache.length) return [];
	const productMap = /* @__PURE__ */ new Map();
	for (const product of freshProducts) productMap.set(product.id, product);
	const brandMap = /* @__PURE__ */ new Map();
	if (brandsSource) if (brandsSource instanceof Map) for (const [k, v] of brandsSource.entries()) brandMap.set(k, v);
	else if (Array.isArray(brandsSource)) for (const b of brandsSource) brandMap.set(b.id, b.name);
	else for (const [k, v] of Object.entries(brandsSource)) brandMap.set(k, v);
	return itemsCache.map((item) => {
		const fresh = productMap.get(item.productId);
		if (!fresh) return {
			productId: item.productId,
			quantity: item.quantity,
			name: item.lastKnown.name,
			oem: item.lastKnown.oem,
			imageUrl: "",
			brandName: "No disponible",
			condition: "Usado",
			price: null,
			showPrice: false,
			visible: false,
			requiresReconfirmation: true,
			isDeletedOrUnavailable: true
		};
		const resolvedBrandName = brandMap.get(fresh.brandId) || "";
		if (!fresh.visible) return {
			productId: fresh.id,
			quantity: item.quantity,
			name: fresh.name,
			oem: fresh.oem,
			imageUrl: fresh.imageUrl,
			brandName: resolvedBrandName,
			condition: fresh.condition,
			price: null,
			showPrice: false,
			visible: false,
			requiresReconfirmation: true,
			isDeletedOrUnavailable: false
		};
		return {
			productId: fresh.id,
			quantity: item.quantity,
			name: fresh.name,
			oem: fresh.oem,
			imageUrl: fresh.imageUrl,
			brandName: resolvedBrandName,
			condition: fresh.condition,
			price: fresh.price,
			showPrice: fresh.showPrice,
			visible: true,
			requiresReconfirmation: false,
			isDeletedOrUnavailable: false
		};
	});
}
/**
* Orquestador asíncrono que consulta los datos frescos a la API
* y enriquece los ítems del carrito.
*/
async function revalidateCartItems(itemsCache) {
	if (!itemsCache.length) return [];
	const [freshProducts, brands] = await Promise.all([catalogService.getAllProductsForValidation(), catalogService.getBrands()]);
	return enrichCartItems(itemsCache, freshProducts, brands);
}
//#endregion
//#region src/components/catalog/CartDrawer.tsx
/**
* Drawer Lateral del Carrito de Consultas con Revalidación Activa.
* (Spec 003, RF-08, RF-10, RF-11, RF-12, Bloque 5 - Tarea T-15)
*
* Características:
* - Conexión directa con useCatalogCart() (estado efímero sincronizado).
* - Revalidación activa al abrir mediante revalidateCartItems() contra el backend.
* - Advertencias de vigencia para productos modificados, ocultados (visible: false) o eliminados.
* - Controles de cantidad (+/-) y eliminación atómica.
* - Subtotal dinámico de productos con precio público y discriminación de ítems a cotizar.
* - Checkout directo estructurado hacia WhatsApp según RF-10 sin simulación de existencias.
*/
/**
* Calcula de forma determinista y estricta los subtotales numéricos y discriminación
* de repuestos a cotizar para el carrito mixto (Spec 009, RF-09, CL-03, Principio 5).
*/
function calculateCartTotals(items) {
	let numericalTotal = 0;
	let hasPricedItems = false;
	let quoteItemsCount = 0;
	for (const item of items) if (!item.requiresReconfirmation && item.showPrice && item.price !== null && item.price > 0) {
		numericalTotal += item.price * item.quantity;
		hasPricedItems = true;
	} else quoteItemsCount += item.quantity;
	let displayLabel = "";
	if (hasPricedItems && quoteItemsCount > 0) displayLabel = `${formatPrice(numericalTotal)} + ÍTEMS A COTIZAR`;
	else if (hasPricedItems && quoteItemsCount === 0) displayLabel = formatPrice(numericalTotal);
	else displayLabel = "PRESUPUESTO A CONFIRMAR";
	return {
		numericalTotal,
		hasPricedItems,
		quoteItemsCount,
		displayLabel
	};
}
function CartDrawer({ open, onOpenChange }) {
	const { items, count, changeQuantity, remove, clear, isDrawerOpen, setIsDrawerOpen } = useCatalogCart();
	const isOpen = open !== void 0 ? open : isDrawerOpen;
	const handleOpenChange = onOpenChange !== void 0 ? onOpenChange : setIsDrawerOpen;
	const [enrichedItems, setEnrichedItems] = useState([]);
	const [isValidating, setIsValidating] = useState(false);
	useEffect(() => {
		let isMounted = true;
		if (isOpen && items.length > 0) {
			setIsValidating(true);
			revalidateCartItems(items).then((fresh) => {
				if (isMounted) {
					setEnrichedItems(fresh);
					setIsValidating(false);
				}
			}).catch((err) => {
				if (isMounted) {
					console.error("Fallo al revalidar carrito:", err);
					setIsValidating(false);
				}
			});
		} else if (items.length === 0) setEnrichedItems([]);
		return () => {
			isMounted = false;
		};
	}, [isOpen, items]);
	const displayedItems = enrichedItems.length > 0 ? enrichedItems.map((enriched) => {
		const live = items.find((i) => i.productId === enriched.productId);
		return live ? {
			...enriched,
			quantity: live.quantity
		} : enriched;
	}).filter((enriched) => items.some((i) => i.productId === enriched.productId)) : items.map((item) => ({
		productId: item.productId,
		quantity: item.quantity,
		name: item.lastKnown.name,
		oem: item.lastKnown.oem,
		imageUrl: "",
		brandName: "",
		condition: "Nuevo",
		price: null,
		showPrice: false,
		visible: true,
		requiresReconfirmation: false,
		isDeletedOrUnavailable: false
	}));
	const cartSummary = useMemo(() => calculateCartTotals(displayedItems), [displayedItems]);
	const hasReconfirmation = displayedItems.some((item) => item.requiresReconfirmation);
	const whatsappCheckoutUrl = displayedItems.length > 0 ? generateCartWhatsAppUrl(displayedItems, void 0, { tagCotizar: true }) : "";
	return /* @__PURE__ */ jsx(Sheet, {
		open: isOpen,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ jsxs(SheetContent, {
			side: "right",
			className: "flex w-full flex-col gap-0 p-0 sm:max-w-lg bg-canvas text-white border-l border-white/10",
			"data-testid": "cart-drawer-sheet",
			children: [
				/* @__PURE__ */ jsxs(SheetHeader, {
					className: "border-b border-white/10 px-6 py-5 text-left bg-canvas",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between pr-10",
						children: [/* @__PURE__ */ jsxs(SheetTitle, {
							className: "flex items-center gap-2.5 font-display text-xl text-white",
							children: [
								/* @__PURE__ */ jsx(ShoppingCart, { className: "size-5 text-industrial" }),
								/* @__PURE__ */ jsx("span", { children: "Tu Carrito de Consultas" }),
								/* @__PURE__ */ jsx("span", {
									className: "rounded-full bg-industrial/20 px-2 py-0.5 font-mono text-xs font-bold text-industrial",
									children: count
								})
							]
						}), items.length > 0 && /* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							size: "sm",
							onClick: clear,
							className: "h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive",
							"aria-label": "Vaciar carrito",
							"data-testid": "clear-cart-button",
							children: [/* @__PURE__ */ jsx(RotateCcw, { className: "size-3.5" }), "Vaciar"]
						})]
					}), /* @__PURE__ */ jsx(SheetDescription, {
						className: "text-xs text-muted-foreground",
						children: "Cotización unificada directa vía WhatsApp · Sin reserva de existencias"
					})]
				}),
				hasReconfirmation && /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-2.5 border-b border-amber-500/20 bg-amber-500/10 px-6 py-3 text-xs text-amber-700 dark:text-amber-400",
					"data-testid": "cart-reconfirmation-banner",
					children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "size-4 shrink-0 mt-0.5" }), /* @__PURE__ */ jsx("p", { children: "Uno o más repuestos han cambiado su estado de publicación y requerirán confirmación directa de precio o disponibilidad con el taller." })]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-6 py-2 bg-canvas space-y-3",
					children: items.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center justify-center py-20 text-center",
						"data-testid": "empty-cart-state",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "mb-4 flex size-16 items-center justify-center rounded-2xl bg-card text-zinc-500 border border-white/10",
								children: /* @__PURE__ */ jsx(ShoppingCart, { className: "size-8 stroke-1" })
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "font-display text-lg font-semibold text-white",
								children: "Tu carrito de consultas está vacío"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400",
								children: "Explorá el catálogo de repuestos diésel y agregá piezas para enviar una solicitud de cotización consolidada por WhatsApp."
							})
						]
					}) : /* @__PURE__ */ jsx(AnimatePresence, {
						initial: false,
						children: displayedItems.map((item) => /* @__PURE__ */ jsxs(motion.article, {
							layout: true,
							initial: {
								opacity: 0,
								height: 0
							},
							animate: {
								opacity: 1,
								height: "auto"
							},
							exit: {
								opacity: 0,
								height: 0
							},
							transition: {
								duration: .2,
								ease: "easeInOut"
							},
							className: "flex gap-4 py-5 px-4 my-2 overflow-hidden rounded-xl border border-white/10 bg-[#111111] text-white",
							"data-testid": `cart-item-${item.productId}`,
							children: [/* @__PURE__ */ jsx("div", {
								className: "size-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-canvas",
								children: /* @__PURE__ */ jsx(ProductImageWithFallback, {
									src: item.imageUrl,
									alt: item.name,
									className: "size-full object-cover"
								})
							}), /* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-1.5 mb-1",
										children: [item.brandName && /* @__PURE__ */ jsx("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-industrial",
											children: item.brandName
										}), /* @__PURE__ */ jsx("span", {
											className: "rounded-md border border-white/10 bg-zinc-800 px-1.5 py-0.2 text-[10px] font-semibold text-zinc-300",
											children: item.condition
										})]
									}),
									/* @__PURE__ */ jsx("h4", {
										className: "font-display text-base font-semibold leading-tight text-white line-clamp-2",
										children: item.name
									}),
									item.oem && /* @__PURE__ */ jsxs("p", {
										className: "mt-1 font-mono text-xs text-muted-foreground",
										children: ["OEM ", item.oem]
									}),
									item.requiresReconfirmation && /* @__PURE__ */ jsxs("div", {
										className: "mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400",
										"data-testid": `badge-reconfirmation-${item.productId}`,
										children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "size-3" }), /* @__PURE__ */ jsx("span", { children: "Requiere reconfirmación" })]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "mt-2 text-sm font-bold text-foreground",
										children: item.requiresReconfirmation ? /* @__PURE__ */ jsx("span", {
											className: "font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											children: "[A Cotizar]"
										}) : item.showPrice && item.price !== null && item.price > 0 ? /* @__PURE__ */ jsxs("span", { children: [formatPrice(item.price * item.quantity), item.quantity > 1 && /* @__PURE__ */ jsxs("span", {
											className: "ml-1.5 font-mono text-xs font-normal text-muted-foreground",
											children: [
												"(",
												formatPrice(item.price),
												" c/u)"
											]
										})] }) : /* @__PURE__ */ jsx("span", {
											className: "font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											children: "[A Cotizar]"
										})
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-3 flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center rounded-lg border border-border bg-card",
											children: [
												/* @__PURE__ */ jsx(Button, {
													variant: "ghost",
													size: "icon",
													className: "size-8 text-foreground hover:bg-muted",
													disabled: item.quantity <= 1,
													"aria-label": `Reducir cantidad de ${item.name}`,
													"data-testid": `decrease-quantity-${item.productId}`,
													onClick: () => changeQuantity(item.productId, -1),
													children: /* @__PURE__ */ jsx(Minus, { className: "size-3.5" })
												}),
												/* @__PURE__ */ jsx("span", {
													className: "w-8 text-center font-mono text-xs font-bold text-foreground",
													"data-testid": `quantity-${item.productId}`,
													children: item.quantity
												}),
												/* @__PURE__ */ jsx(Button, {
													variant: "ghost",
													size: "icon",
													className: "size-8 text-foreground hover:bg-muted",
													"aria-label": `Aumentar cantidad de ${item.name}`,
													"data-testid": `increase-quantity-${item.productId}`,
													onClick: () => changeQuantity(item.productId, 1),
													children: /* @__PURE__ */ jsx(Plus, { className: "size-3.5" })
												})
											]
										}), /* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "icon",
											className: "size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
											"aria-label": `Eliminar ${item.name} del carrito`,
											"data-testid": `remove-item-${item.productId}`,
											onClick: () => remove(item.productId),
											children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
										})]
									})
								]
							})]
						}, item.productId))
					})
				}),
				items.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "border-t border-white/10 bg-zinc-900/90 p-6 space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between text-base",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-medium text-zinc-400",
									children: cartSummary.hasPricedItems ? "Subtotal estimado:" : "Presupuesto:"
								}), /* @__PURE__ */ jsx("span", {
									className: "font-display text-lg font-bold text-white",
									"data-testid": "cart-subtotal",
									children: cartSummary.hasPricedItems ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { children: formatPrice(cartSummary.numericalTotal) }), cartSummary.quoteItemsCount > 0 && /* @__PURE__ */ jsx("span", {
										className: "ml-1.5 text-xs font-mono font-bold text-industrial uppercase",
										children: "+ ÍTEMS A COTIZAR"
									})] }) : "PRESUPUESTO A CONFIRMAR"
								})]
							}),
							cartSummary.quoteItemsCount > 0 && /* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: "* La solicitud incluye repuestos para cotizar al día."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-muted-foreground leading-tight",
								children: "El envío a WhatsApp no realiza cobros ni reserva stock físico automáticamente."
							})
						]
					}), /* @__PURE__ */ jsx(Button, {
						variant: "whatsapp",
						className: "relative overflow-hidden h-12 w-full gap-2.5 text-sm font-bold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25",
						asChild: true,
						children: /* @__PURE__ */ jsxs("a", {
							href: whatsappCheckoutUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							"aria-label": "Enviar pedido del carrito por WhatsApp",
							"data-testid": "whatsapp-checkout-button",
							className: "relative overflow-hidden flex items-center justify-center gap-2.5",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ jsx(FaWhatsapp, { className: "size-5 shrink-0 text-white" }),
								/* @__PURE__ */ jsx("span", { children: "Consultar por WhatsApp" })
							]
						})
					})]
				})
			]
		})
	});
}
//#endregion
export { SheetHeader as a, normalizeSearchText as c, SheetContent as i, parseOemCodes as l, catalogService as n, SheetTitle as o, Sheet as r, evaluateProductMatch as s, CartDrawer as t };
