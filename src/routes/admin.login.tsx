import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";
import { useAdminAuth } from "@/context/admin-auth-context";
import { pageHead } from "@/components/diesel-site";

export const Route = createFileRoute("/admin/login")({
  head: () =>
    pageHead(
      "Iniciar Sesión — Panel de Administración",
      "Acceso restringido para el personal y administración de Laboratorio Diésel.",
    ),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  // Si ya se encuentra autenticado, redirigir directamente al panel administrativo
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = () => {
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Laboratorio Diésel
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Acceso al Backoffice
          </p>
        </div>

        <AdminLoginForm onSuccess={handleSuccess} />

        <div className="mt-6 border-t border-border pt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Volver al sitio público
          </Link>
        </div>
      </div>
    </div>
  );
}
