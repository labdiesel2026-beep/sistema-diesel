import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Package, Eye, Tags, FileQuestion } from "lucide-react";
import { pageHead } from "@/components/diesel-site";
import { useAdminProducts } from "@/components/admin-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/dashboard")({
  head: () =>
    pageHead(
      "Dashboard — Laboratorio Diésel",
      "Resumen del catálogo de muestra: productos visibles, categorías y repuestos a cotizar.",
    ),
  component: Dashboard,
});

function Dashboard() {
  const { products } = useAdminProducts();
  const metrics = [
    { label: "Productos", value: products.length, icon: Package },
    { label: "Visibles", value: products.filter((product) => product.visible).length, icon: Eye },
    {
      label: "Categorías",
      value: new Set(products.map((product) => product.category)).size,
      icon: Tags,
    },
    {
      label: "A cotizar",
      value: products.filter((product) => product.price === null).length,
      icon: FileQuestion,
    },
  ];
  return (
    <>
      <p className="eyebrow mb-2 text-muted-foreground">Administración / Resumen</p>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground">{metric.label}</span>
              <metric.icon className="size-5 text-primary" />
            </div>
            <p className="mt-5 font-display text-4xl font-bold">{metric.value}</p>
          </article>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-border py-6">
        <h2 className="font-display text-xl font-semibold">Catálogo de productos</h2>
        <Button variant="industrial" asChild>
          <Link to="/admin">
            Gestionar productos
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </>
  );
}
