import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAdminAuth } from "@/context/admin-auth-context";

interface AdminGuardProps {
  children: ReactNode;
}

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
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
