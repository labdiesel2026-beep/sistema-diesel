import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/components/diesel-site";
import { DashboardMetrics } from "@/components/admin/dashboard/DashboardMetrics";

export const Route = createFileRoute("/admin/dashboard")({
  head: () =>
    pageHead(
      "Dashboard — Laboratorio Diésel",
      "Panel de control y métricas consolidadas del catálogo técnico de inyección diésel y repuestos.",
    ),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Administración / Indicadores
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen cuantitativo del inventario, taxonomías y fabricantes registrados en el catálogo.
        </p>
      </header>

      <DashboardMetrics />
    </div>
  );
}
