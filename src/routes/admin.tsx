import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { AdminAuthProvider } from "@/context/admin-auth-context";
import { AdminGuard } from "@/components/admin/auth/AdminGuard";
import { AdminProvider } from "@/context/admin-context";
import { AdminProvider as LegacyAdminProvider } from "@/components/admin-data";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

/**
 * Layout principal del árbol administrativo /admin.
 * Estructura jerárquica estricta de proveedores:
 * 1. AdminAuthProvider (provee la sesión Zero-Trust en memoria).
 * 2. AdminGuard (verifica la sesión y redirige defensivamente si no está autenticado).
 * 3. AdminProvider (provee el estado reactivo del catálogo y taxonomías).
 * 4. Layout visual (Sidebar, Header y <Outlet />).
 */
function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith("/admin/login");

  return (
    <AdminAuthProvider>
      {isLoginPage ? (
        <Outlet />
      ) : (
        <AdminGuard>
          <AdminProvider>
            <LegacyAdminProvider>
              <div className="flex min-h-dvh w-full bg-background text-foreground">
                <AdminSidebar collapsed={collapsed} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <AdminHeader
                    collapsed={collapsed}
                    onToggleSidebar={() => setCollapsed((prev) => !prev)}
                  />
                  <main
                    id="admin-main-content"
                    className="min-w-0 flex-1 p-4 py-7 md:p-8 lg:p-10"
                  >
                    <Outlet />
                  </main>
                </div>
              </div>
            </LegacyAdminProvider>
          </AdminProvider>
        </AdminGuard>
      )}
    </AdminAuthProvider>
  );
}
