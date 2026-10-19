import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAdminAuth } from "@/context/admin-auth-context";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Route Guard defensivo con principio de denegación por defecto.
 * (RF-02, CA-02.1, CA-02.2, CA-02.3, RNF-P4-01, CL-08, CL-13)
 *
 * - Si no hay sesión activa en memoria (por ejemplo al hacer F5 o tras logout),
 *   intercepta el renderizado y expulsa al usuario hacia /admin/login con replace: true.
 * - Si la sesión es válida, renderiza los componentes protegidos.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
