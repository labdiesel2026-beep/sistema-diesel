import { createFileRoute } from "@tanstack/react-router";
import { Tags } from "lucide-react";
import { pageHead } from "@/components/diesel-site";
import { useAdminProducts } from "@/components/admin-data";

export const Route = createFileRoute("/admin/categorias")({
  head: () =>
    pageHead(
      "Categorías — Laboratorio Diésel",
      "Categorías de inyectores Common Rail y piezoeléctricos del catálogo de muestra.",
    ),
  component: Categories,
});

function Categories() {
  const { products } = useAdminProducts();
  const categories = ["Inyectores Common Rail", "Inyectores piezoeléctricos"];
  return (
    <>
      <p className="eyebrow mb-2 text-muted-foreground">Administración / Catálogo</p>
      <h1 className="font-display text-3xl font-bold">Categorías</h1>
      <div className="mt-8 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-80 text-left text-sm">
          <thead className="border-b border-border bg-secondary">
            <tr>
              <th className="px-5 py-4">Categoría</th>
              <th className="px-5 py-4 text-right">Productos</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category} className="border-b border-border last:border-0">
                <td className="px-5 py-6">
                  <span className="flex items-center gap-3">
                    <Tags className="size-4 shrink-0 text-primary" />
                    {category}
                  </span>
                </td>
                <td className="px-5 py-6 text-right font-semibold">
                  {products.filter((product) => product.category === category).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
