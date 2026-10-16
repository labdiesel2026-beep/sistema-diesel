import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  MessageCircle,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Header, Footer, pageHead, whatsappUrl } from "@/components/diesel-site";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCatalogCart } from "@/components/catalog-cart";
import { catalogProducts, filterProducts, formatPrice } from "@/lib/catalog-data";

export const Route = createFileRoute("/catalogo")({
  head: () =>
    pageHead(
      "Catálogo de inyectores — Laboratorio Diésel",
      "Inyectores Bosch, Delphi y Denso. Buscá por código OEM, filtrá por marca y categoría y consultá precios en pesos argentinos.",
    ),
  component: CatalogPage,
});

const brands = ["Bosch", "Delphi", "Denso"];
const categories = ["Inyectores Common Rail", "Inyectores piezoeléctricos"];
function CatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedBrands, setBrands] = useState<string[]>([]);
  const [selectedCategories, setCategories] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { items, add } = useCatalogCart();
  const filtered = filterProducts(search, selectedBrands, selectedCategories);
  const filterCount = selectedBrands.length + selectedCategories.length;
  const toggle = (current: string[], value: string) =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  const reset = () => {
    setSearch("");
    setBrands([]);
    setCategories([]);
  };

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-hero-border bg-hero py-9 text-hero-foreground md:py-11">
          <div className="site-container">
            <p className="eyebrow mb-3 text-hero-muted">Laboratorio Diésel / Catálogo</p>
            <h1 className="font-display text-4xl font-bold md:text-5xl">
              El inyector que tu motor necesita.
            </h1>
            <p className="mt-3 text-sm leading-6 text-hero-muted">
              Common Rail. Calidad comprobada. Respaldo en cada pieza.
            </p>
            <label className="mt-7 flex h-14 max-w-3xl items-center gap-3 rounded-xl border border-border bg-card px-4 text-foreground focus-within:ring-2 focus-within:ring-primary">
              <Search className="size-5 shrink-0 text-primary" />
              <input
                type="search"
                className="w-full min-w-0 bg-transparent text-sm outline-none"
                placeholder="Buscar por Código OEM o Marca..."
                aria-label="Buscar por Código OEM o Marca"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
        </section>
        <div className="site-container py-8 md:py-10">
          <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="min-w-0" aria-label="Filtros de productos">
              <Button
                variant="outline"
                className="h-12 w-full justify-between rounded-xl bg-card lg:hidden"
                aria-expanded={filtersOpen}
                aria-controls="catalog-filters"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal /> Filtros {filterCount > 0 && `(${filterCount})`}
                </span>
                <ChevronDown className={filtersOpen ? "rotate-180" : ""} />
              </Button>
              <div
                id="catalog-filters"
                className={`${filtersOpen ? "block" : "hidden"} mt-5 lg:mt-0 lg:block`}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                    <SlidersHorizontal className="size-4 text-primary" /> Filtros
                  </h2>
                  {filterCount > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setBrands([]);
                        setCategories([]);
                      }}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
                <fieldset className="border-t border-border py-6">
                  <legend className="sr-only">Marcas</legend>
                  <h3 className="mb-5 text-xs font-bold uppercase text-muted-foreground">Marcas</h3>
                  <div className="space-y-4">
                    {brands.map((brand) => (
                      <label key={brand} className="flex cursor-pointer items-center gap-3 text-sm">
                        <Checkbox
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => setBrands(toggle(selectedBrands, brand))}
                          aria-label={brand}
                        />
                        <span className="flex-1">{brand}</span>
                        <span className="text-xs text-muted-foreground">
                          {catalogProducts.filter((product) => product.brand === brand).length}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="border-t border-border py-6">
                  <legend className="sr-only">Categorías</legend>
                  <h3 className="mb-5 text-xs font-bold uppercase text-muted-foreground">
                    Categorías
                  </h3>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex cursor-pointer items-start gap-3 text-sm leading-5"
                      >
                        <Checkbox
                          className="mt-0.5"
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() =>
                            setCategories(toggle(selectedCategories, category))
                          }
                          aria-label={category}
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
                  ¿No encontrás tu código?
                  <br />
                  <a
                    className="font-semibold text-primary"
                    href={whatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consultanos por WhatsApp →
                  </a>
                </p>
              </div>
            </aside>
            <div className="min-w-0">
              <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="min-w-0 font-display text-2xl font-semibold">Inyectores diésel</h2>
                <span aria-live="polite" className="shrink-0 text-xs text-muted-foreground">
                  {filtered.length} productos
                </span>
              </div>
              {(filterCount > 0 || search) && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {[...selectedBrands, ...selectedCategories].map((value) => (
                    <Button
                      variant="secondary"
                      size="sm"
                      key={value}
                      onClick={() =>
                        brands.includes(value)
                          ? setBrands(toggle(selectedBrands, value))
                          : setCategories(toggle(selectedCategories, value))
                      }
                    >
                      {value}
                      <X className="size-3" />
                    </Button>
                  ))}
                  <Button variant="link" size="sm" onClick={reset}>
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
              <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:gap-6">
                {filtered.map((product) => {
                  const quantity =
                    items.find((item) => item.product.id === product.id)?.quantity ?? 0;
                  return (
                    <article
                      key={product.id}
                      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <div className="relative flex aspect-[2/1] items-center justify-center border-b border-border bg-muted">
                        <div
                          role="img"
                          aria-label={`Imagen de muestra de ${product.name}`}
                          className="text-center text-muted-foreground/60"
                        >
                          <ImageIcon className="mx-auto size-10 stroke-1" />
                          <span className="mt-2 block text-[10px]">Imagen del producto</span>
                        </div>
                        <span className="absolute left-4 top-4 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-bold">
                          {product.brand}
                        </span>
                        <span
                          className={`absolute right-4 top-4 rounded-md px-2.5 py-1 text-[11px] font-semibold ${product.condition === "Nuevo" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}
                        >
                          {product.condition}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-5 md:p-6">
                        <span className="mb-3 self-start rounded-md border border-primary/15 bg-primary/5 px-2.5 py-1.5 font-mono text-xs font-semibold text-primary">
                          OEM {product.oem}
                        </span>
                        <h3 className="font-display text-2xl font-semibold leading-tight">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground">{product.detail}</p>
                        <div className="mb-5 mt-5 flex h-9 items-center">
                          {product.price === null ? (
                            <span className="rounded-md bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground">
                              A cotizar
                            </span>
                          ) : (
                            <p className="font-display text-2xl font-bold">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                        <div className="mt-auto grid gap-2">
                          <Button
                            variant="industrial"
                            className="h-11 w-full"
                            onClick={() => add(product)}
                          >
                            {quantity ? <Check /> : <ShoppingCart />}
                            {quantity
                              ? `En el carrito (${quantity}) · Agregar`
                              : "Agregar al Carrito"}
                          </Button>
                          <Button variant="whatsapp" className="h-11 w-full" asChild>
                            <a
                              href={whatsappUrl(
                                `Hola, quisiera consultar por ${product.name}, marca ${product.brand}, OEM ${product.oem}.`,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle />
                              WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Search className="mx-auto mb-4 size-8 text-muted-foreground" />
                  <h3 className="font-display text-2xl font-semibold">
                    No encontramos ese inyector
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Probá con otro código OEM o cambiá los filtros.
                  </p>
                  <Button variant="industrial" className="mt-5" onClick={reset}>
                    Ver todos los productos
                  </Button>
                </div>
              )}
              <p className="mt-7 text-xs leading-5 text-muted-foreground">
                Catálogo de muestra · Precios y códigos ilustrativos. Confirmá compatibilidad y
                disponibilidad antes de comprar.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
