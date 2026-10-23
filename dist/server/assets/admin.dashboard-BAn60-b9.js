import { i as Button } from "./api-DvKWNf7S.js";
import { n as useAdmin } from "./admin-context-B3zUnms8.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, BadgeCheck, Eye, EyeOff, Package, Star, Tags } from "lucide-react";
//#region src/components/admin/dashboard/DashboardMetrics.tsx
/**
* Componente de métricas cuantitativas y accesos directos del catálogo.
* (RF-04, CA-04.1, CA-04.2)
*
* Muestra 6 indicadores calculados reactivamente desde el estado en memoria:
* 1. Total de productos
* 2. Productos visibles
* 3. Productos pausados / ocultos
* 4. Productos destacados (X / 10)
* 5. Total de categorías registradas
* 6. Total de marcas registradas
*/
function DashboardMetrics() {
	const { products, categories, brands, metrics } = useAdmin();
	const totalProducts = products.length;
	const visibleProducts = products.filter((p) => p.visible).length;
	const hiddenProducts = products.filter((p) => !p.visible).length;
	const featuredProducts = metrics?.featuredProducts ?? products.filter((p) => p.isFeatured).length;
	const totalCategories = categories.length;
	const totalBrands = brands.length;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		"data-testid": "dashboard-metrics-container",
		children: [/* @__PURE__ */ jsx("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
			children: [
				{
					id: "total-products",
					label: "Total de productos",
					value: totalProducts,
					description: "Repuestos registrados en el inventario",
					icon: Package,
					to: "/admin",
					linkText: "Ver productos"
				},
				{
					id: "visible-products",
					label: "Productos visibles",
					value: visibleProducts,
					description: "Publicados en el catálogo público",
					icon: Eye,
					to: "/admin",
					linkText: "Ver catálogo"
				},
				{
					id: "hidden-products",
					label: "Productos ocultos",
					value: hiddenProducts,
					description: "Pausados o fuera de stock",
					icon: EyeOff,
					to: "/admin",
					linkText: "Revisar pausados"
				},
				{
					id: "featured-products",
					label: "Productos destacados",
					value: `${featuredProducts} / 10`,
					description: "Exhibidos en carrusel de inicio",
					icon: Star,
					to: "/admin",
					linkText: "Gestionar destacados"
				},
				{
					id: "total-categories",
					label: "Total de categorías",
					value: totalCategories,
					description: "Taxonomías principales y secundarias",
					icon: Tags,
					to: "/admin/categorias",
					linkText: "Gestionar categorías"
				},
				{
					id: "total-brands",
					label: "Total de marcas",
					value: totalBrands,
					description: "Fabricantes y marcas líderes",
					icon: BadgeCheck,
					to: "/admin/marcas",
					linkText: "Gestionar marcas"
				}
			].map((card) => {
				const Icon = card.icon;
				return /* @__PURE__ */ jsxs("article", {
					"data-testid": `metric-card-${card.id}`,
					className: "flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-industrial/40 hover:shadow-md",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
							children: card.label
						}), /* @__PURE__ */ jsx("div", {
							className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-industrial/10 text-industrial",
							children: /* @__PURE__ */ jsx(Icon, { className: "size-4" })
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-display text-3xl font-bold tracking-tight text-foreground",
							"data-testid": `metric-value-${card.id}`,
							children: card.value
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: card.description
						})]
					})] }), /* @__PURE__ */ jsx("div", {
						className: "mt-4 pt-3 border-t border-border/50",
						children: /* @__PURE__ */ jsxs(Link, {
							to: card.to,
							className: "inline-flex items-center gap-1.5 text-xs font-semibold text-industrial hover:underline",
							children: [/* @__PURE__ */ jsx("span", { children: card.linkText }), /* @__PURE__ */ jsx(ArrowRight, { className: "size-3" })]
						})
					})]
				}, card.id);
			})
		}), /* @__PURE__ */ jsxs("section", {
			"aria-label": "Accesos directos a gestión",
			className: "rounded-xl border border-border bg-card p-6",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display text-lg font-semibold text-foreground",
					children: "Accesos Directos de Gestión"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: "Administración rápida de los submódulos del catálogo técnico"
				})] })
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						asChild: true,
						className: "h-auto justify-between p-4 border-border hover:border-industrial/50 hover:bg-accent/40",
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/admin",
							"data-testid": "quick-link-products",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3 text-left",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex size-9 items-center justify-center rounded-lg bg-industrial/10 text-industrial",
									children: /* @__PURE__ */ jsx(Package, { className: "size-5" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
									className: "block font-semibold text-sm text-foreground",
									children: "Gestionar Productos"
								}), /* @__PURE__ */ jsxs("span", {
									className: "block text-xs text-muted-foreground",
									children: [totalProducts, " repuestos registrados"]
								})] })]
							}), /* @__PURE__ */ jsx(ArrowRight, { className: "size-4 text-muted-foreground" })]
						})
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						asChild: true,
						className: "h-auto justify-between p-4 border-border hover:border-industrial/50 hover:bg-accent/40",
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/admin/categorias",
							"data-testid": "quick-link-categories",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3 text-left",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex size-9 items-center justify-center rounded-lg bg-industrial/10 text-industrial",
									children: /* @__PURE__ */ jsx(Tags, { className: "size-5" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
									className: "block font-semibold text-sm text-foreground",
									children: "Gestionar Categorías"
								}), /* @__PURE__ */ jsxs("span", {
									className: "block text-xs text-muted-foreground",
									children: [totalCategories, " taxonomías activas"]
								})] })]
							}), /* @__PURE__ */ jsx(ArrowRight, { className: "size-4 text-muted-foreground" })]
						})
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						asChild: true,
						className: "h-auto justify-between p-4 border-border hover:border-industrial/50 hover:bg-accent/40",
						children: /* @__PURE__ */ jsxs(Link, {
							to: "/admin/marcas",
							"data-testid": "quick-link-brands",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3 text-left",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex size-9 items-center justify-center rounded-lg bg-industrial/10 text-industrial",
									children: /* @__PURE__ */ jsx(BadgeCheck, { className: "size-5" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
									className: "block font-semibold text-sm text-foreground",
									children: "Gestionar Marcas"
								}), /* @__PURE__ */ jsxs("span", {
									className: "block text-xs text-muted-foreground",
									children: [totalBrands, " marcas fabricantes"]
								})] })]
							}), /* @__PURE__ */ jsx(ArrowRight, { className: "size-4 text-muted-foreground" })]
						})
					})
				]
			})]
		})]
	});
}
//#endregion
//#region src/routes/admin.dashboard.tsx?tsr-split=component
function AdminDashboardPage() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("header", { children: [
			/* @__PURE__ */ jsx("p", {
				className: "eyebrow mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: "Administración / Indicadores"
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "font-display text-3xl font-bold tracking-tight text-foreground",
				children: "Dashboard"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Resumen cuantitativo del inventario, taxonomías y fabricantes registrados en el catálogo."
			})
		] }), /* @__PURE__ */ jsx(DashboardMetrics, {})]
	});
}
//#endregion
export { AdminDashboardPage as component };
