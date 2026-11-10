/**
 * Ruta Principal del Catálogo Público (/catalogo).
 * (Spec 003, RF-01 a RF-12, Bloque 6 - Tarea T-17)
 *
 * Características:
 * - Integración institucional con LandingNavbar y LandingFooter (RF-01).
 * - Sincronización bidireccional de Search Params en URL con TanStack Router (RF-03, RF-04).
 * - Consumo del cliente HTTP centralizado (catalogService) filtrando visible: true (RF-02).
 * - Grilla con esqueleto de carga ProductGridSkeleton y tarjetas ProductCard (RF-06 a RF-09).
 * - Filtros facetados combinados CatalogFilters con árbol jerárquico y conteos (RF-04).
 * - Estado sin resultados con consulta asistida hacia WhatsApp (RF-05).
 * - Botón flotante reactivo del carrito de consultas y drawer CartDrawer (RF-08, RF-10, RF-12).
 * - Error boundary CatalogErrorBoundary ante fallos de conexión (Principio 6).
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, ShoppingCart, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";
import { ProductGridSkeleton } from "@/components/catalog/ProductGridSkeleton";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { MobileFilterTrigger } from "@/components/catalog/FilterDrawer";
import { CartDrawer } from "@/components/catalog/CartDrawer";
import { CatalogErrorBoundary, CatalogErrorView } from "@/components/catalog/CatalogErrorBoundary";
import { useCatalogCart } from "@/context/catalog-cart-context";
import { catalogService } from "@/services/catalog-service";
import { filterCatalogProducts } from "@/lib/catalog-filter";
import { generateNoResultsWhatsAppUrl } from "@/lib/catalog-whatsapp";
import {
  catalogSearchParamsSchema,
  normalizeFilterParam,
  type CatalogSearchParams,
} from "@/schemas/catalog-schemas";
import type { CatalogProduct, CatalogBrand, CatalogCategory } from "@/types/catalog";
import { pageHead } from "@/components/diesel-site";

export const Route = createFileRoute("/catalogo")({
  validateSearch: (search: Record<string, unknown>): Partial<CatalogSearchParams> => {
    const parsed = catalogSearchParamsSchema.safeParse(search);
    return parsed.success ? parsed.data : {};
  },
  head: () =>
    pageHead(
      "Catálogo de inyectores — Laboratorio Diésel",
      "Inyectores Bosch, Delphi y Denso. Buscá por código OEM, filtrá por marca y categoría y consultá precios en pesos argentinos.",
    ),
  component: CatalogRouteComponent,
});

export interface CatalogPageProps {
  searchParams?: Partial<CatalogSearchParams>;
  onUpdateSearchParams?: (updates: { q?: string; brand?: string[]; category?: string[] }) => void;
  mockProducts?: CatalogProduct[];
  mockBrands?: CatalogBrand[];
  mockCategories?: CatalogCategory[];
}

export function CatalogPage({
  searchParams,
  onUpdateSearchParams,
  mockProducts,
  mockBrands,
  mockCategories,
}: CatalogPageProps = {}) {
  const { count: cartCount } = useCatalogCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<CatalogProduct | null>(
    null,
  );

  // Estados de datos obtenidos de la API REST
  const [products, setProducts] = useState<CatalogProduct[]>(mockProducts || []);
  const [brands, setBrands] = useState<CatalogBrand[]>(mockBrands || []);
  const [categories, setCategories] = useState<CatalogCategory[]>(mockCategories || []);
  const [isLoading, setIsLoading] = useState(!mockProducts);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  // Búsqueda y facetas locales sincronizadas
  const [searchQuery, setSearchQuery] = useState(searchParams?.q || "");
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>(
    normalizeFilterParam(searchParams?.brand),
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    normalizeFilterParam(searchParams?.category),
  );

  // Sincronizar cambios entrantes de searchParams
  useEffect(() => {
    if (searchParams) {
      setSearchQuery(searchParams.q || "");
      setSelectedBrandIds(normalizeFilterParam(searchParams.brand));
      setSelectedCategoryIds(normalizeFilterParam(searchParams.category));
    }
  }, [searchParams]);

  // Carga asíncrona de datos desde el servicio HTTP centralizado
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [fetchedProducts, fetchedBrands, fetchedCategories] = await Promise.all([
        catalogService.getVisibleProducts(),
        catalogService.getBrands(),
        catalogService.getCategories(),
      ]);
      setProducts(fetchedProducts);
      setBrands(fetchedBrands);
      setCategories(fetchedCategories);
    } catch (err) {
      setFetchError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!mockProducts && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
  }, [loadData, mockProducts]);

  // Manejadores reactivos con sincronización
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onUpdateSearchParams?.({
      q: query,
      brand: selectedBrandIds,
      category: selectedCategoryIds,
    });
  };

  const handleBrandToggle = (brandId: string) => {
    const next = selectedBrandIds.includes(brandId)
      ? selectedBrandIds.filter((id) => id !== brandId)
      : [...selectedBrandIds, brandId];
    setSelectedBrandIds(next);
    onUpdateSearchParams?.({
      q: searchQuery,
      brand: next,
      category: selectedCategoryIds,
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const next = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    setSelectedCategoryIds(next);
    onUpdateSearchParams?.({
      q: searchQuery,
      brand: selectedBrandIds,
      category: next,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBrandIds([]);
    setSelectedCategoryIds([]);
    onUpdateSearchParams?.({ q: "", brand: [], category: [] });
  };

  // Mapa de marca para lookup rápido
  const brandsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of brands) {
      map.set(b.id, b.name);
    }
    return map;
  }, [brands]);

  // Filtrado cruzado multidimensional con priorización OEM (RF-03, RF-04)
  const filteredProducts = useMemo(() => {
    return filterCatalogProducts({
      products,
      searchQuery,
      selectedBrandIds,
      selectedCategoryIds,
      categories,
      brandsLookup: brandsMap,
    });
  }, [products, searchQuery, selectedBrandIds, selectedCategoryIds, categories, brandsMap]);

  // Metadatos para consulta asistida en estado sin resultados (RF-05)
  const activeBrandNames = useMemo(
    () => selectedBrandIds.map((id) => brandsMap.get(id) || id),
    [selectedBrandIds, brandsMap],
  );

  const activeCategoryNames = useMemo(() => {
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    return selectedCategoryIds.map((id) => catMap.get(id) || id);
  }, [selectedCategoryIds, categories]);

  const noResultsWhatsAppUrl = useMemo(
    () => generateNoResultsWhatsAppUrl(searchQuery, activeBrandNames, activeCategoryNames),
    [searchQuery, activeBrandNames, activeCategoryNames],
  );

  const activeFiltersCount = selectedBrandIds.length + selectedCategoryIds.length;

  return (
    <>
      <LandingNavbar isCatalog />

      <main className="min-h-screen bg-background">
        {/* Hero Section Institucional */}
        <section className="border-b border-border/80 bg-hero py-10 text-hero-foreground md:py-14">
          <div className="site-container">
            <p className="mb-2 font-mono text-xs font-semibold tracking-wider text-primary uppercase">
              Laboratorio Diésel · Catálogo Oficial
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              El inyector y repuesto que tu motor necesita.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Common Rail, bombas de alta presión y componentes de precisión. Buscá por código OEM,
              verificá compatibilidad y cotizá directamente por WhatsApp.
            </p>

            {/* Barra de Búsqueda Global (RF-03) */}
            <div className="mt-7 max-w-2xl">
              <label
                htmlFor="catalog-search-input"
                className="flex h-13 items-center gap-3 rounded-xl border border-border bg-card px-4 text-foreground shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              >
                <Search className="size-5 shrink-0 text-primary" />
                <input
                  id="catalog-search-input"
                  type="search"
                  className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Buscar por Código OEM, repuesto, marca o vehículo..."
                  aria-label="Buscar por Código OEM, repuesto, marca o vehículo"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  data-testid="catalog-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Limpiar término de búsqueda"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </label>
            </div>
          </div>
        </section>

        {/* Contenido Principal con Filtros y Grilla */}
        <div className="site-container py-8 md:py-12">
          {fetchError ? (
            <CatalogErrorView onRetry={loadData} />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
              {/* Columna Lateral: Filtros Facetados (RF-04) */}
              <aside aria-label="Filtros del catálogo" className="min-w-0">
                <CatalogFilters
                  brands={brands}
                  categories={categories}
                  selectedBrandIds={selectedBrandIds}
                  selectedCategoryIds={selectedCategoryIds}
                  onBrandToggle={handleBrandToggle}
                  onCategoryToggle={handleCategoryToggle}
                  onResetFilters={handleResetFilters}
                  products={products}
                  mobileOpen={isFilterDrawerOpen}
                  onMobileOpenChange={setIsFilterDrawerOpen}
                />
              </aside>

              {/* Columna Principal: Grilla de Productos y Estados */}
              <div className="min-w-0">
                {/* Encabezado de la Grilla */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Repuestos Diésel
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {isLoading
                        ? "Cargando repuestos..."
                        : `${filteredProducts.length} productos disponibles`}
                    </p>
                  </div>

                  {/* Chips de Filtros Activos */}
                  {(activeFiltersCount > 0 || searchQuery) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          <span>Búsqueda: {searchQuery}</span>
                          <button
                            type="button"
                            onClick={() => handleSearchChange("")}
                            className="hover:text-primary/70"
                            aria-label="Eliminar filtro de búsqueda"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetFilters}
                        className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        data-testid="reset-all-filters-chip"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  )}
                </div>

                {/* Grilla Asíncrona / Estados */}
                {isLoading ? (
                  <ProductGridSkeleton count={6} />
                ) : products.length === 0 ? (
                  /* Catálogo totalmente vacío en la BD */
                  <div
                    className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center"
                    data-testid="empty-catalog-state"
                  >
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      No hay repuestos publicados actualmente
                    </h3>
                    <p className="mt-2 max-w-sm text-xs text-muted-foreground">
                      El taller está actualizando el catálogo de inyectores. Por favor consultanos
                      directamente por WhatsApp.
                    </p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  /* Estado Sin Resultados para la búsqueda / filtros activos (RF-05) */
                  <div
                    className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center sm:p-14"
                    data-testid="no-results-state"
                  >
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Search className="size-7 stroke-[1.75]" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      No encontramos repuestos con los criterios aplicados
                    </h3>
                    <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                      {searchQuery
                        ? `No hay coincidencias para "${searchQuery}". Consultanos por WhatsApp con el código de tu pieza o vehículo y te asistimos inmediatamente.`
                        : "No encontramos piezas que coincidan con la combinación de filtros seleccionada."}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        variant="whatsapp"
                        className="h-11 gap-2.5 px-5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25"
                        asChild
                      >
                        <a
                          href={noResultsWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="no-results-whatsapp-button"
                        >
                          <FaWhatsapp className="size-4 shrink-0 text-white" />
                          <span>Consultar pieza por WhatsApp</span>
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-11 px-5 font-medium"
                        onClick={handleResetFilters}
                        data-testid="no-results-reset-button"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Grilla de Productos Coincidentes */
                  <div
                    className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6"
                    data-testid="catalog-product-grid"
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        brandName={brandsMap.get(product.brandId) || ""}
                        onViewDetail={() => setSelectedProductForModal(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalles Técnicos de Producto (Dialog shadcn) */}
        <ProductDetailModal
          product={selectedProductForModal}
          brandName={
            selectedProductForModal ? brandsMap.get(selectedProductForModal.brandId) || "" : ""
          }
          categoryName={
            selectedProductForModal && selectedProductForModal.categoryIds.length > 0
              ? categories.find((c) => c.id === selectedProductForModal.categoryIds[0])?.name || ""
              : ""
          }
          open={Boolean(selectedProductForModal)}
          onOpenChange={(open) => {
            if (!open) setSelectedProductForModal(null);
          }}
        />

        {/* Botón Flotante FILTROS TÉCNICOS en Móvil (z-35) */}
        <MobileFilterTrigger
          onClick={() => setIsFilterDrawerOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Botón Flotante Reactivo del Carrito de Consultas (RF-08) */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="industrial"
            size="lg"
            className="h-14 gap-3 rounded-full px-5 shadow-xl hover:scale-105 transition-transform"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Ver carrito de consultas (${cartCount} productos)`}
            data-testid="floating-cart-button"
          >
            <div className="relative">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground animate-in zoom-in"
                  data-testid="floating-cart-badge"
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-semibold text-sm hidden sm:inline">Tu Carrito</span>
          </Button>
        </div>

        {/* Drawer Lateral del Carrito con Revalidación Activa (RF-08, RF-10) */}
        <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
      </main>

      <LandingFooter />
    </>
  );
}

function CatalogRouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleUpdateSearch = (updates: { q?: string; brand?: string[]; category?: string[] }) => {
    navigate({
      search: (prev) => {
        const next: Partial<CatalogSearchParams> = { ...prev };
        if (updates.q !== undefined) {
          if (updates.q) next.q = updates.q;
          else delete next.q;
        }
        if (updates.brand !== undefined) {
          if (updates.brand.length === 1) next.brand = updates.brand[0];
          else if (updates.brand.length > 1) next.brand = updates.brand;
          else delete next.brand;
        }
        if (updates.category !== undefined) {
          if (updates.category.length === 1) next.category = updates.category[0];
          else if (updates.category.length > 1) next.category = updates.category;
          else delete next.category;
        }
        return next;
      },
      replace: true,
    });
  };

  return (
    <CatalogErrorBoundary>
      <CatalogPage searchParams={search} onUpdateSearchParams={handleUpdateSearch} />
    </CatalogErrorBoundary>
  );
}

export default CatalogPage;
