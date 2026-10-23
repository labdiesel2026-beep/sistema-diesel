import { i as formatPrice, l as ProductImageWithFallback, n as LandingNavbar, o as generateDirectProductWhatsAppUrl, r as LandingFooter, y as useCatalogCart } from "./diesel-site-DP12_HDl.js";
import { i as Button } from "./api-Db5K75is.js";
import { l as parseOemCodes, n as catalogService, t as CartDrawer } from "./CartDrawer-BlazrQB7.js";
import { t as Route } from "./catalogo._productId-BYQCybBj.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, ArrowLeft, Check, ShieldCheck, ShoppingCart } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
//#region src/routes/catalogo.$productId.tsx?tsr-split=component
/**
* Ficha Técnica Detallada de Repuesto Diésel (/catalogo/$productId).
* (Spec 003, RF-06, RF-07, RF-09, RF-11, RF-12, Bloque 6 - Tarea T-18)
*
* Características:
* - Consulta individual mediante catalogService.getProductById(productId).
* - Tratamiento de productos pausados o eliminados: si visible === false o no existe,
*   despliega el estado accesible "Producto no disponible" y botón de retorno al catálogo (RF-11).
* - Ficha técnica completa para repuestos visibles (RF-06):
*   - Imagen de alta resolución con fallback SVG local accesible.
*   - Nombre, Marca, Código OEM, Condición ('Nuevo' | 'Reacondicionado' | 'Usado').
*   - Compatibilidad vehicular y especificaciones técnicas.
*   - Exhibición condicional de precios en ARS o rótulo "Consultar precio" (RF-07).
*   - Acciones: Agregar al Carrito (useCatalogCart) y Consulta Directa por WhatsApp (RF-09).
* - Integración institucional con LandingNavbar, LandingFooter y CartDrawer.
*/
function ProductDetailPage({ productId, mockProduct, mockBrand, mockCategories } = {}) {
	const { add, getItemQuantity, count: cartCount } = useCatalogCart();
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [product, setProduct] = useState(mockProduct !== void 0 ? mockProduct : null);
	const [brand, setBrand] = useState(mockBrand !== void 0 ? mockBrand : null);
	const [categories, setCategories] = useState(mockCategories || []);
	const [isLoading, setIsLoading] = useState(!mockProduct && mockProduct !== null);
	const [isUnavailable, setIsUnavailable] = useState(false);
	const loadProductData = useCallback(async (id) => {
		setIsLoading(true);
		setIsUnavailable(false);
		try {
			const [fetchedProduct, allBrands, allCategories] = await Promise.all([
				catalogService.getProductById(id).catch(() => null),
				catalogService.getBrands().catch(() => []),
				catalogService.getCategories().catch(() => [])
			]);
			if (!fetchedProduct || !fetchedProduct.visible) {
				setIsUnavailable(true);
				setProduct(null);
			} else {
				setProduct(fetchedProduct);
				const matchedBrand = allBrands.find((b) => b.id === fetchedProduct.brandId) || null;
				setBrand(matchedBrand);
				setCategories(allCategories);
			}
		} catch {
			setIsUnavailable(true);
			setProduct(null);
		} finally {
			setIsLoading(false);
		}
	}, []);
	useEffect(() => {
		if (mockProduct !== void 0) {
			if (!mockProduct || !mockProduct.visible) {
				setIsUnavailable(true);
				setProduct(null);
			} else {
				setProduct(mockProduct);
				setIsUnavailable(false);
			}
			setIsLoading(false);
		} else if (productId) loadProductData(productId);
	}, [
		productId,
		mockProduct,
		loadProductData
	]);
	const brandName = brand?.name || "";
	const directWhatsAppUrl = useMemo(() => product ? generateDirectProductWhatsAppUrl(product, brandName) : "", [product, brandName]);
	const oemData = useMemo(() => parseOemCodes(product?.oem), [product?.oem]);
	const cartQuantity = product ? getItemQuantity(product.id) : 0;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(LandingNavbar, { isCatalog: true }),
		/* @__PURE__ */ jsxs("main", {
			className: "min-h-screen bg-background py-8 md:py-12",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "site-container",
					children: [
						/* @__PURE__ */ jsxs("nav", {
							"aria-label": "Breadcrumb",
							className: "mb-6 flex items-center gap-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ jsx(Link, {
									to: "/",
									className: "hover:text-foreground transition-colors",
									children: "Inicio"
								}),
								/* @__PURE__ */ jsx("span", { children: "/" }),
								/* @__PURE__ */ jsx(Link, {
									to: "/catalogo",
									className: "hover:text-foreground transition-colors",
									children: "Catálogo"
								}),
								/* @__PURE__ */ jsx("span", { children: "/" }),
								/* @__PURE__ */ jsx("span", {
									className: "font-medium text-foreground truncate max-w-[200px] sm:max-w-md",
									children: product ? product.name : "Detalle de Repuesto"
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mb-6",
							children: /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								asChild: true,
								className: "h-8 gap-1.5 px-0 text-xs font-semibold text-primary hover:bg-transparent hover:underline",
								children: /* @__PURE__ */ jsxs(Link, {
									to: "/catalogo",
									"data-testid": "back-to-catalog-link",
									children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "size-3.5" }), /* @__PURE__ */ jsx("span", { children: "Volver al catálogo" })]
								})
							})
						}),
						isLoading && /* @__PURE__ */ jsxs("div", {
							className: "grid gap-8 md:grid-cols-2 animate-pulse",
							"data-testid": "product-detail-skeleton",
							children: [/* @__PURE__ */ jsx("div", { className: "aspect-[4/3] w-full rounded-2xl bg-muted" }), /* @__PURE__ */ jsxs("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ jsx("div", { className: "h-6 w-24 rounded bg-muted" }),
									/* @__PURE__ */ jsx("div", { className: "h-10 w-3/4 rounded bg-muted" }),
									/* @__PURE__ */ jsx("div", { className: "h-6 w-1/3 rounded bg-muted" }),
									/* @__PURE__ */ jsx("div", { className: "h-24 w-full rounded bg-muted" })
								]
							})]
						}),
						!isLoading && isUnavailable && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center sm:p-14 shadow-xs",
							"data-testid": "product-unavailable-state",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground",
									children: /* @__PURE__ */ jsx(AlertCircle, { className: "size-7 stroke-[1.75]" })
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "font-display text-2xl font-bold text-foreground",
									children: "Producto no disponible"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground",
									children: "El repuesto seleccionado no existe, fue pausado temporalmente o ya no se encuentra publicado en el catálogo público."
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-6 flex flex-wrap items-center justify-center gap-3",
									children: /* @__PURE__ */ jsx(Button, {
										variant: "industrial",
										asChild: true,
										children: /* @__PURE__ */ jsxs(Link, {
											to: "/catalogo",
											"data-testid": "back-to-catalog-button",
											children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "mr-2 size-4" }), /* @__PURE__ */ jsx("span", { children: "Volver al catálogo" })]
										})
									})
								})
							]
						}),
						!isLoading && !isUnavailable && product && /* @__PURE__ */ jsxs("article", {
							className: "grid gap-10 md:grid-cols-2 lg:gap-14",
							"data-testid": "product-detail-article",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-xs",
									children: [
										/* @__PURE__ */ jsx(ProductImageWithFallback, {
											src: product.imageUrl,
											alt: product.name,
											className: "size-full object-cover"
										}),
										brandName && /* @__PURE__ */ jsx("span", {
											className: "absolute left-4 top-4 rounded-md border border-border/80 bg-card/95 px-3 py-1 text-xs font-bold text-foreground shadow-xs backdrop-blur-xs",
											children: brandName
										}),
										/* @__PURE__ */ jsx("span", {
											className: `absolute right-4 top-4 rounded-md border px-3 py-1 text-xs font-semibold shadow-xs ${product.condition === "Nuevo" ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-secondary-foreground border-secondary"}`,
											children: product.condition
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-5 shrink-0 text-primary" }), /* @__PURE__ */ jsx("span", { children: "Pieza ensayada y calibrada en banco computarizado con informe técnico de tolerancia." })]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "mb-2 flex flex-wrap items-center gap-2 self-start",
										children: oemData.primary ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("span", {
											className: "rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 font-mono text-xs font-semibold text-primary",
											"data-testid": "detail-oem-primary",
											children: ["OEM ", oemData.primary]
										}), oemData.alternatives.length > 0 && /* @__PURE__ */ jsxs("span", {
											tabIndex: 0,
											role: "note",
											className: "cursor-help rounded-md border border-border/80 bg-card px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase hover:border-border-hover hover:text-foreground transition-colors",
											title: `Códigos OEM alternativos:\n${oemData.alternatives.join(", ")}`,
											"aria-label": `Códigos OEM alternativos: ${oemData.alternatives.join(", ")}`,
											"data-testid": "detail-oem-alternatives",
											children: [
												"+",
												oemData.alternatives.length,
												" ALTERNATIVOS"
											]
										})] }) : /* @__PURE__ */ jsx("span", {
											className: "font-mono text-xs text-muted-foreground",
											"data-testid": "detail-oem-empty",
											children: "—"
										})
									}),
									/* @__PURE__ */ jsx("h1", {
										className: "font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl",
										children: product.name
									}),
									/* @__PURE__ */ jsx("div", {
										className: "my-5 flex items-baseline gap-3",
										children: product.showPrice && product.price !== null ? /* @__PURE__ */ jsx("span", {
											className: "font-display text-3xl font-bold text-foreground md:text-4xl",
											children: formatPrice(product.price)
										}) : /* @__PURE__ */ jsx("span", {
											className: "rounded-lg bg-muted px-4 py-2 font-display text-lg font-semibold text-muted-foreground",
											children: "Consultar precio"
										})
									}),
									product.description && /* @__PURE__ */ jsx("p", {
										className: "mb-6 text-sm leading-relaxed text-muted-foreground",
										children: product.description
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mb-8 rounded-xl border border-border bg-card overflow-hidden",
										children: [/* @__PURE__ */ jsx("div", {
											className: "border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground",
											children: "Especificaciones Técnicas"
										}), /* @__PURE__ */ jsxs("dl", {
											className: "divide-y divide-border text-xs",
											children: [
												oemData.primary ? /* @__PURE__ */ jsxs("div", {
													className: "grid grid-cols-3 px-4 py-2.5",
													children: [/* @__PURE__ */ jsx("dt", {
														className: "font-semibold text-muted-foreground",
														children: "Código OEM"
													}), /* @__PURE__ */ jsxs("dd", {
														className: "col-span-2 font-mono text-foreground flex flex-wrap items-center gap-2",
														children: [/* @__PURE__ */ jsx("span", { children: oemData.primary }), oemData.alternatives.length > 0 && /* @__PURE__ */ jsxs("span", {
															className: "font-mono text-xs text-muted-foreground",
															title: oemData.alternatives.join(", "),
															children: [
																"(+",
																oemData.alternatives.length,
																" alternativos: ",
																oemData.alternatives.join(", "),
																")"
															]
														})]
													})]
												}) : /* @__PURE__ */ jsxs("div", {
													className: "grid grid-cols-3 px-4 py-2.5",
													children: [/* @__PURE__ */ jsx("dt", {
														className: "font-semibold text-muted-foreground",
														children: "Código OEM"
													}), /* @__PURE__ */ jsx("dd", {
														className: "col-span-2 font-mono text-muted-foreground",
														children: "—"
													})]
												}),
												brandName && /* @__PURE__ */ jsxs("div", {
													className: "grid grid-cols-3 px-4 py-2.5",
													children: [/* @__PURE__ */ jsx("dt", {
														className: "font-semibold text-muted-foreground",
														children: "Marca"
													}), /* @__PURE__ */ jsx("dd", {
														className: "col-span-2 text-foreground font-medium",
														children: brandName
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "grid grid-cols-3 px-4 py-2.5",
													children: [/* @__PURE__ */ jsx("dt", {
														className: "font-semibold text-muted-foreground",
														children: "Condición"
													}), /* @__PURE__ */ jsx("dd", {
														className: "col-span-2 text-foreground",
														children: product.condition
													})]
												}),
												product.vehicleCompatibility && /* @__PURE__ */ jsxs("div", {
													className: "grid grid-cols-3 px-4 py-2.5",
													children: [/* @__PURE__ */ jsx("dt", {
														className: "font-semibold text-muted-foreground",
														children: "Compatibilidad"
													}), /* @__PURE__ */ jsx("dd", {
														className: "col-span-2 text-foreground leading-relaxed",
														children: product.vehicleCompatibility
													})]
												})
											]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-auto grid gap-3 sm:grid-cols-2",
										children: [/* @__PURE__ */ jsx(Button, {
											variant: "industrial",
											size: "lg",
											className: "h-12 w-full gap-2 text-sm font-semibold shadow-xs",
											onClick: () => add(product),
											"aria-label": cartQuantity > 0 ? `En el carrito (${cartQuantity}). Agregar otra unidad` : `Agregar ${product.name} al carrito`,
											"data-testid": "add-to-cart-button",
											children: cartQuantity > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, { className: "size-4" }), /* @__PURE__ */ jsxs("span", { children: [
												"En el carrito (",
												cartQuantity,
												") · Agregar"
											] })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(ShoppingCart, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Agregar al Carrito" })] })
										}), /* @__PURE__ */ jsx(Button, {
											variant: "whatsapp",
											size: "lg",
											className: "h-12 w-full gap-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25",
											asChild: true,
											children: /* @__PURE__ */ jsxs("a", {
												href: directWhatsAppUrl,
												target: "_blank",
												rel: "noopener noreferrer",
												"aria-label": "Consultar repuesto por WhatsApp",
												"data-testid": "direct-whatsapp-button",
												children: [/* @__PURE__ */ jsx(FaWhatsapp, { className: "size-[18px] shrink-0 text-white" }), /* @__PURE__ */ jsx("span", { children: "WhatsApp Directo" })]
											})
										})]
									})
								]
							})]
						})
					]
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
function ProductDetailRouteComponent() {
	const { productId } = Route.useParams();
	return /* @__PURE__ */ jsx(ProductDetailPage, { productId });
}
//#endregion
export { ProductDetailPage, ProductDetailPage as default, ProductDetailRouteComponent as component };
