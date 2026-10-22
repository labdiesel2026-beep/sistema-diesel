import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Tags,
  BadgeCheck,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AdminSidebarProps {
  collapsed: boolean;
}

export function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const navItems = [
    { to: "/admin", label: "Productos", icon: Package, exact: true },
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/categorias", label: "Categorías", icon: Tags },
    { to: "/admin/marcas", label: "Marcas", icon: BadgeCheck },
  ] as const;

  const isItemActive = (to: string, exact?: boolean) => {
    if (exact || to === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname.startsWith(to);
  };

  return (
    <aside
      className={`sticky top-0 flex h-dvh shrink-0 flex-col border-r border-[#e5e7eb] bg-white text-[#111827] shadow-xs transition-all duration-200 ${
        collapsed ? "w-16" : "w-16 md:w-60"
      }`}
      aria-label="Menú de administración"
    >
      {/* Brand Header */}
      <Link
        to="/"
        title="Laboratorio Diésel — Inicio"
        className="flex h-20 items-center gap-3 border-b border-[#e5e7eb] px-4 transition-colors hover:bg-gray-50"
      >
        <SlidersHorizontal className="size-6 shrink-0 text-industrial" />
        {!collapsed && (
          <span className="hidden font-display text-xl font-bold leading-tight text-gray-900 md:block">
            Laboratorio
            <br />
            Diésel<span className="text-industrial">.</span>
          </span>
        )}
      </Link>

      {!collapsed && (
        <p className="hidden px-6 pb-2 pt-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 md:block">
          Backoffice
        </p>
      )}

      {/* Navegación Principal */}
      <nav className="space-y-1.5 px-2 py-4" aria-label="Secciones del panel de administración">
        {navItems.map((item) => {
          const active = isItemActive(item.to, "exact" in item ? item.exact : false);
          const Icon = item.icon;

          return (
            <Button
              key={item.to}
              variant="ghost"
              asChild
              className={`h-11 w-full justify-start rounded-md px-3 transition-colors ${
                active
                  ? "bg-orange-50 text-industrial font-semibold border-r-2 border-industrial shadow-xs hover:bg-orange-100/60"
                  : "bg-transparent text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
            >
              <Link
                to={item.to}
                title={item.label}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3"
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && <span className="hidden md:inline truncate">{item.label}</span>}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Acceso a Tienda / Catálogo */}
      <div className="mt-auto border-t border-[#e5e7eb] px-2 py-4">
        <Button
          variant="ghost"
          asChild
          className="h-11 w-full justify-start rounded-md px-3 text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
        >
          <Link to="/catalogo" title="Ver catálogo público en tienda">
            <ArrowUpRight className="size-5 shrink-0" />
            {!collapsed && <span className="hidden md:inline truncate">Ver tienda</span>}
          </Link>
        </Button>
      </div>
    </aside>
  );
}
