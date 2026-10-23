import { i as Button } from "./api-DvKWNf7S.js";
import { t as AdminProvider } from "./admin-context-B3zUnms8.js";
import { t as Badge } from "./badge-DXmXa5Va.js";
import { n as useAdminAuth, t as AdminAuthProvider } from "./AuthContext-BHek7ogo.js";
import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate, useRouterState } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowUpRight, BadgeCheck, LayoutDashboard, LogOut, Package, PanelLeftClose, PanelLeftOpen, ShieldCheck, SlidersHorizontal, Tags } from "lucide-react";
//#region src/components/admin/auth/AdminGuard.tsx
/**
* Route Guard defensivo con principio de denegación por defecto y soporte para rehidratación.
* (RF-02, RF-03, Tarea 8.2)
*
* - Mientras la aplicación rehidrata la sesión con GET /api/auth/me (`isLoading === true`),
*   muestra un indicador de carga en lugar de expulsar al usuario prematuramente.
* - Si no hay sesión activa en memoria tras finalizar la comprobación,
*   intercepta el renderizado y expulsa al usuario hacia /admin/login con replace: true.
* - Si la sesión es válida, renderiza los componentes protegidos.
*/
function AdminGuard({ children }) {
	const { isAuthenticated, isLoading } = useAdminAuth();
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background text-foreground",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ jsx("div", { className: "size-8 animate-spin rounded-full border-4 border-industrial border-t-transparent" }), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground font-medium",
				children: "Verificando sesión..."
			})]
		})
	});
	if (!isAuthenticated) return /* @__PURE__ */ jsx(Navigate, {
		to: "/admin/login",
		replace: true
	});
	return /* @__PURE__ */ jsx(Fragment, { children });
}
//#endregion
//#region src/components/admin/layout/AdminSidebar.tsx
function AdminSidebar({ collapsed }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const navItems = [
		{
			to: "/admin",
			label: "Productos",
			icon: Package,
			exact: true
		},
		{
			to: "/admin/dashboard",
			label: "Dashboard",
			icon: LayoutDashboard
		},
		{
			to: "/admin/categorias",
			label: "Categorías",
			icon: Tags
		},
		{
			to: "/admin/marcas",
			label: "Marcas",
			icon: BadgeCheck
		}
	];
	const isItemActive = (to, exact) => {
		if (exact || to === "/admin") return pathname === "/admin" || pathname === "/admin/";
		return pathname.startsWith(to);
	};
	return /* @__PURE__ */ jsxs("aside", {
		className: `sticky top-0 flex h-dvh shrink-0 flex-col border-r border-[#e5e7eb] bg-white text-[#111827] shadow-xs transition-all duration-200 ${collapsed ? "w-16" : "w-16 md:w-60"}`,
		"aria-label": "Menú de administración",
		children: [
			/* @__PURE__ */ jsxs(Link, {
				to: "/",
				title: "Laboratorio Diésel — Inicio",
				className: "flex h-20 items-center gap-3 border-b border-[#e5e7eb] px-4 transition-colors hover:bg-gray-50",
				children: [/* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-6 shrink-0 text-industrial" }), !collapsed && /* @__PURE__ */ jsxs("span", {
					className: "hidden font-display text-xl font-bold leading-tight text-gray-900 md:block",
					children: [
						"Laboratorio",
						/* @__PURE__ */ jsx("br", {}),
						"Diésel",
						/* @__PURE__ */ jsx("span", {
							className: "text-industrial",
							children: "."
						})
					]
				})]
			}),
			!collapsed && /* @__PURE__ */ jsx("p", {
				className: "hidden px-6 pb-2 pt-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 md:block",
				children: "Backoffice"
			}),
			/* @__PURE__ */ jsx("nav", {
				className: "space-y-1.5 px-2 py-4",
				"aria-label": "Secciones del panel de administración",
				children: navItems.map((item) => {
					const active = isItemActive(item.to, "exact" in item ? item.exact : false);
					const Icon = item.icon;
					return /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						asChild: true,
						className: `h-11 w-full justify-start rounded-md px-3 transition-colors ${active ? "bg-orange-50 text-industrial font-semibold border-r-2 border-industrial shadow-xs hover:bg-orange-100/60" : "bg-transparent text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"}`,
						children: /* @__PURE__ */ jsxs(Link, {
							to: item.to,
							title: item.label,
							"aria-current": active ? "page" : void 0,
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx(Icon, { className: "size-5 shrink-0" }), !collapsed && /* @__PURE__ */ jsx("span", {
								className: "hidden md:inline truncate",
								children: item.label
							})]
						})
					}, item.to);
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-auto border-t border-[#e5e7eb] px-2 py-4",
				children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					asChild: true,
					className: "h-11 w-full justify-start rounded-md px-3 text-gray-500 hover:bg-gray-100/80 hover:text-gray-900",
					children: /* @__PURE__ */ jsxs(Link, {
						to: "/catalogo",
						title: "Ver catálogo público en tienda",
						children: [/* @__PURE__ */ jsx(ArrowUpRight, { className: "size-5 shrink-0" }), !collapsed && /* @__PURE__ */ jsx("span", {
							className: "hidden md:inline truncate",
							children: "Ver tienda"
						})]
					})
				})
			})
		]
	});
}
//#endregion
//#region src/components/admin/layout/AdminHeader.tsx
function AdminHeader({ collapsed, onToggleSidebar }) {
	const { user, logout } = useAdminAuth();
	const navigate = useNavigate();
	const handleLogout = async () => {
		await logout();
		navigate({
			to: "/admin/login",
			replace: true
		});
	};
	return /* @__PURE__ */ jsxs("header", {
		className: "flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] bg-white text-[#111827] px-4 py-3 md:px-8 shadow-xs",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ jsx(Button, {
				size: "icon",
				variant: "ghost",
				title: collapsed ? "Expandir menú lateral" : "Contraer menú lateral",
				"aria-label": collapsed ? "Expandir menú lateral" : "Contraer menú lateral",
				onClick: onToggleSidebar,
				className: "text-gray-600 hover:bg-gray-100",
				children: collapsed ? /* @__PURE__ */ jsx(PanelLeftOpen, { className: "size-5" }) : /* @__PURE__ */ jsx(PanelLeftClose, { className: "size-5" })
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "hidden text-sm font-semibold text-gray-900 sm:inline",
					children: "Panel de administración"
				}), /* @__PURE__ */ jsxs(Badge, {
					variant: "outline",
					className: "gap-1 text-[11px] font-bold border-orange-200 bg-orange-50 text-industrial",
					children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-3 text-industrial" }), "ADMIN"]
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3",
			children: [user?.email && /* @__PURE__ */ jsx("span", {
				className: "hidden text-xs text-gray-500 lg:inline font-mono",
				title: `Sesión activa: ${user.email}`,
				children: user.email
			}), /* @__PURE__ */ jsxs(Button, {
				variant: "outline",
				size: "sm",
				onClick: handleLogout,
				className: "gap-2 border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer",
				title: "Cerrar sesión y volver al login",
				children: [/* @__PURE__ */ jsx(LogOut, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: "Cerrar Sesión" })]
			})]
		})]
	});
}
//#endregion
//#region src/routes/admin.tsx?tsr-split=component
/**
* Layout principal del árbol administrativo /admin.
* Estructura jerárquica estricta de proveedores y tema claro SaaS:
* 1. AdminAuthProvider (provee la sesión Zero-Trust en memoria).
* 2. AdminGuard (verifica la sesión y redirige defensivamente si no está autenticado).
* 3. AdminProvider (provee el estado reactivo del catálogo y taxonomías conectado a PostgreSQL).
* 4. Layout visual (Sidebar, Header y <Outlet /> en Modo Claro SaaS).
*/
function AdminLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const isLoginPage = useLocation().pathname.startsWith("/admin/login");
	useEffect(() => {
		if (typeof document !== "undefined") document.documentElement.classList.remove("dark");
	}, []);
	return /* @__PURE__ */ jsx(AdminAuthProvider, { children: isLoginPage ? /* @__PURE__ */ jsx(Outlet, {}) : /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(AdminProvider, { children: /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-dvh w-full bg-[#f9fafb] text-[#111827] font-sans",
		children: [/* @__PURE__ */ jsx(AdminSidebar, { collapsed }), /* @__PURE__ */ jsxs("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [/* @__PURE__ */ jsx(AdminHeader, {
				collapsed,
				onToggleSidebar: () => setCollapsed((prev) => !prev)
			}), /* @__PURE__ */ jsx("main", {
				id: "admin-main-content",
				className: "min-w-0 flex-1 p-4 py-7 md:p-8 lg:p-10 bg-[#f9fafb]",
				children: /* @__PURE__ */ jsx(Outlet, {})
			})]
		})]
	}) }) }) });
}
//#endregion
export { AdminLayout as component };
