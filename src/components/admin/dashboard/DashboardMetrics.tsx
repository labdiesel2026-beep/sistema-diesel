import { Link } from "@tanstack/react-router";
import { Package, Eye, EyeOff, Tags, BadgeCheck, ArrowRight } from "lucide-react";
import { useAdmin } from "@/context/admin-context";
import { Button } from "@/components/ui/button";

/**
 * Componente de métricas cuantitativas y accesos directos del catálogo.
 * (RF-04, CA-04.1, CA-04.2)
 *
 * Muestra 5 indicadores calculados reactivamente desde el estado en memoria:
 * 1. Total de productos
 * 2. Productos visibles
 * 3. Productos pausados / ocultos
 * 4. Total de categorías registradas
 * 5. Total de marcas registradas
 */
export function DashboardMetrics() {
  const { products, categories, brands } = useAdmin();

  const totalProducts = products.length;
  const visibleProducts = products.filter((p) => p.visible).length;
  const hiddenProducts = products.filter((p) => !p.visible).length;
  const totalCategories = categories.length;
  const totalBrands = brands.length;

  const metricCards = [
    {
      id: "total-products",
      label: "Total de productos",
      value: totalProducts,
      description: "Repuestos registrados en el inventario",
      icon: Package,
      to: "/admin",
      linkText: "Ver productos",
    },
    {
      id: "visible-products",
      label: "Productos visibles",
      value: visibleProducts,
      description: "Publicados en el catálogo público",
      icon: Eye,
      to: "/admin",
      linkText: "Ver catálogo",
    },
    {
      id: "hidden-products",
      label: "Productos ocultos",
      value: hiddenProducts,
      description: "Pausados o fuera de stock",
      icon: EyeOff,
      to: "/admin",
      linkText: "Revisar pausados",
    },
    {
      id: "total-categories",
      label: "Total de categorías",
      value: totalCategories,
      description: "Taxonomías principales y secundarias",
      icon: Tags,
      to: "/admin/categorias",
      linkText: "Gestionar categorías",
    },
    {
      id: "total-brands",
      label: "Total de marcas",
      value: totalBrands,
      description: "Fabricantes y marcas líderes",
      icon: BadgeCheck,
      to: "/admin/marcas",
      linkText: "Gestionar marcas",
    },
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-metrics-container">
      {/* Grid de 5 tarjetas cuantitativas reactivas (CA-04.1) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              data-testid={`metric-card-${card.id}`}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span
                    className="font-display text-3xl font-bold tracking-tight text-foreground"
                    data-testid={`metric-value-${card.id}`}
                  >
                    {card.value}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <Link
                  to={card.to}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>{card.linkText}</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Accesos directos a los 3 submódulos ABM (CA-04.2) */}
      <section
        aria-label="Accesos directos a gestión"
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Accesos Directos de Gestión
            </h2>
            <p className="text-xs text-muted-foreground">
              Administración rápida de los submódulos del catálogo técnico
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Button
            variant="outline"
            asChild
            className="h-auto justify-between p-4 border-border hover:border-primary/50 hover:bg-accent/40"
          >
            <Link to="/admin" data-testid="quick-link-products">
              <div className="flex items-center gap-3 text-left">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="size-5" />
                </div>
                <div>
                  <span className="block font-semibold text-sm text-foreground">
                    Gestionar Productos
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {totalProducts} repuestos registrados
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="h-auto justify-between p-4 border-border hover:border-primary/50 hover:bg-accent/40"
          >
            <Link to="/admin/categorias" data-testid="quick-link-categories">
              <div className="flex items-center gap-3 text-left">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Tags className="size-5" />
                </div>
                <div>
                  <span className="block font-semibold text-sm text-foreground">
                    Gestionar Categorías
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {totalCategories} taxonomías activas
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="h-auto justify-between p-4 border-border hover:border-primary/50 hover:bg-accent/40"
          >
            <Link to="/admin/marcas" data-testid="quick-link-brands">
              <div className="flex items-center gap-3 text-left">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BadgeCheck className="size-5" />
                </div>
                <div>
                  <span className="block font-semibold text-sm text-foreground">
                    Gestionar Marcas
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {totalBrands} marcas fabricantes
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
