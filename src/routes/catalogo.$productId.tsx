/**
 * Ficha Técnica Detallada de Repuesto Diésel (/catalogo/$productId).
 * (Spec 003, RF-06, RF-07, RF-09, RF-11, RF-12, Bloque 6 - Tarea T-18)
 *
 * Características:
 * - Consulta individual mediante catalogService.getProductById(productId).
 * - Tratamiento de productos pausados o eliminados: si visible === false o no existe,
 *   despliega el estado accesible "Producto no disponible" y botón de retorno al catálogo (RF-11).
 * - Ficha técnica completa para repuestos visibles (RF-06):
 *   - Imagen de alta resolución con fallback SVG local accesible.
 *   - Nombre, Marca, Código OEM, Condición ('Nuevo' | 'Reacondicionado' | 'Usado').
 *   - Compatibilidad vehicular y especificaciones técnicas.
 *   - Exhibición condicional de precios en ARS o rótulo "Consultar precio" (RF-07).
 *   - Acciones: Agregar al Carrito (useCatalogCart) y Consulta Directa por WhatsApp (RF-09).
 * - Integración institucional con LandingNavbar, LandingFooter y CartDrawer.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  AlertCircle,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { ProductImageWithFallback } from "@/components/catalog/ProductImageWithFallback";
import { CartDrawer } from "@/components/catalog/CartDrawer";
import { useCatalogCart } from "@/context/catalog-cart-context";
import { catalogService } from "@/services/catalog-service";
import { formatPrice, generateDirectProductWhatsAppUrl } from "@/lib/catalog-whatsapp";
import type { CatalogProduct, CatalogBrand, CatalogCategory } from "@/types/catalog";
import { pageHead } from "@/components/diesel-site";

export const Route = createFileRoute("/catalogo/$productId")({
  head: () =>
    pageHead(
      "Ficha Técnica de Repuesto — Laboratorio Diésel",
      "Detalle técnico, compatibilidad vehicular, código OEM y cotización en pesos argentinos con garantía de banco.",
    ),
  component: ProductDetailRouteComponent,
});

export interface ProductDetailPageProps {
  productId?: string;
  mockProduct?: CatalogProduct | null;
  mockBrand?: CatalogBrand | null;
  mockCategories?: CatalogCategory[];
}

export function ProductDetailPage({
  productId,
  mockProduct,
  mockBrand,
  mockCategories,
}: ProductDetailPageProps = {}) {
  const { add, getItemQuantity, count: cartCount } = useCatalogCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [product, setProduct] = useState<CatalogProduct | null>(
    mockProduct !== undefined ? mockProduct : null,
  );
  const [brand, setBrand] = useState<CatalogBrand | null>(
    mockBrand !== undefined ? mockBrand : null,
  );
  const [categories, setCategories] = useState<CatalogCategory[]>(mockCategories || []);
  const [isLoading, setIsLoading] = useState(!mockProduct && mockProduct !== null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  const loadProductData = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsUnavailable(false);
    try {
      const [fetchedProduct, allBrands, allCategories] = await Promise.all([
        catalogService.getProductById(id).catch(() => null),
        catalogService.getBrands().catch(() => []),
        catalogService.getCategories().catch(() => []),
      ]);

      if (!fetchedProduct || !fetchedProduct.visible) {
        setIsUnavailable(true);
        setProduct(null);
      } else {
        setProduct(fetchedProduct);
        const matchedBrand = allBrands.find((b) => b.id === fetchedProduct.brandId) || null;
        setBrand(matchedBrand);
        setCategories(allCategories);
      }
    } catch {
      setIsUnavailable(true);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mockProduct !== undefined) {
      if (!mockProduct || !mockProduct.visible) {
        setIsUnavailable(true);
        setProduct(null);
      } else {
        setProduct(mockProduct);
        setIsUnavailable(false);
      }
      setIsLoading(false);
    } else if (productId) {
      loadProductData(productId);
    }
  }, [productId, mockProduct, loadProductData]);

  const brandName = brand?.name || "";
  const directWhatsAppUrl = useMemo(
    () => (product ? generateDirectProductWhatsAppUrl(product, brandName) : ""),
    [product, brandName],
  );

  const cartQuantity = product ? getItemQuantity(product.id) : 0;

  return (
    <>
      <LandingNavbar isCatalog />

      <main className="min-h-screen bg-background py-8 md:py-12">
        <div className="site-container">
          {/* Navegación Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link to="/catalogo" className="hover:text-foreground transition-colors">
              Catálogo
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
              {product ? product.name : "Detalle de Repuesto"}
            </span>
          </nav>

          {/* Enlace de Retorno */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 gap-1.5 px-0 text-xs font-semibold text-primary hover:bg-transparent hover:underline"
            >
              <Link to="/catalogo" data-testid="back-to-catalog-link">
                <ArrowLeft className="size-3.5" />
                <span>Volver al catálogo</span>
              </Link>
            </Button>
          </div>

          {/* Estado de Carga */}
          {isLoading && (
            <div
              className="grid gap-8 md:grid-cols-2 animate-pulse"
              data-testid="product-detail-skeleton"
            >
              <div className="aspect-[4/3] w-full rounded-2xl bg-muted" />
              <div className="space-y-4">
                <div className="h-6 w-24 rounded bg-muted" />
                <div className="h-10 w-3/4 rounded bg-muted" />
                <div className="h-6 w-1/3 rounded bg-muted" />
                <div className="h-24 w-full rounded bg-muted" />
              </div>
            </div>
          )}

          {/* Estado: Producto no disponible (RF-11) */}
          {!isLoading && isUnavailable && (
            <div
              className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center sm:p-14 shadow-xs"
              data-testid="product-unavailable-state"
            >
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <AlertCircle className="size-7 stroke-[1.75]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Producto no disponible
              </h2>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                El repuesto seleccionado no existe, fue pausado temporalmente o ya no se encuentra
                publicado en el catálogo público.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="industrial" asChild>
                  <Link to="/catalogo" data-testid="back-to-catalog-button">
                    <ArrowLeft className="mr-2 size-4" />
                    <span>Volver al catálogo</span>
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Ficha Técnica Completa (RF-06, RF-07, RF-09) */}
          {!isLoading && !isUnavailable && product && (
            <article
              className="grid gap-10 md:grid-cols-2 lg:gap-14"
              data-testid="product-detail-article"
            >
              {/* Columna Multimedia */}
              <div className="space-y-4">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-xs">
                  <ProductImageWithFallback
                    src={product.imageUrl}
                    alt={product.name}
                    className="size-full object-cover"
                  />

                  {brandName && (
                    <span className="absolute left-4 top-4 rounded-md border border-border/80 bg-card/95 px-3 py-1 text-xs font-bold text-foreground shadow-xs backdrop-blur-xs">
                      {brandName}
                    </span>
                  )}

                  <span
                    className={`absolute right-4 top-4 rounded-md border px-3 py-1 text-xs font-semibold shadow-xs ${
                      product.condition === "Nuevo"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-secondary text-secondary-foreground border-secondary"
                    }`}
                  >
                    {product.condition}
                  </span>
                </div>

                {/* Banner de Garantía de Banco Diésel */}
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
                  <ShieldCheck className="size-5 shrink-0 text-primary" />
                  <span>
                    Pieza ensayada y calibrada en banco computarizado con informe técnico de
                    tolerancia.
                  </span>
                </div>
              </div>

              {/* Columna de Información y Acciones */}
              <div className="flex flex-col">
                {product.oem && (
                  <span className="mb-2 self-start rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                    OEM {product.oem}
                  </span>
                )}

                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {product.name}
                </h1>

                {/* Precio o Rótulo A Cotizar */}
                <div className="my-5 flex items-baseline gap-3">
                  {product.showPrice && product.price !== null ? (
                    <span className="font-display text-3xl font-bold text-foreground md:text-4xl">
                      {formatPrice(product.price)}
                    </span>
                  ) : (
                    <span className="rounded-lg bg-muted px-4 py-2 font-display text-lg font-semibold text-muted-foreground">
                      Consultar precio
                    </span>
                  )}
                </div>

                {/* Descripción Técnica */}
                {product.description && (
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}

                {/* Tabla de Especificaciones Técnicas (RF-06) */}
                <div className="mb-8 rounded-xl border border-border bg-card overflow-hidden">
                  <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Especificaciones Técnicas
                  </div>
                  <dl className="divide-y divide-border text-xs">
                    {product.oem && (
                      <div className="grid grid-cols-3 px-4 py-2.5">
                        <dt className="font-semibold text-muted-foreground">Código OEM</dt>
                        <dd className="col-span-2 font-mono text-foreground">{product.oem}</dd>
                      </div>
                    )}
                    {brandName && (
                      <div className="grid grid-cols-3 px-4 py-2.5">
                        <dt className="font-semibold text-muted-foreground">Marca</dt>
                        <dd className="col-span-2 text-foreground font-medium">{brandName}</dd>
                      </div>
                    )}
                    <div className="grid grid-cols-3 px-4 py-2.5">
                      <dt className="font-semibold text-muted-foreground">Condición</dt>
                      <dd className="col-span-2 text-foreground">{product.condition}</dd>
                    </div>
                    {product.vehicleCompatibility && (
                      <div className="grid grid-cols-3 px-4 py-2.5">
                        <dt className="font-semibold text-muted-foreground">Compatibilidad</dt>
                        <dd className="col-span-2 text-foreground leading-relaxed">
                          {product.vehicleCompatibility}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Botones de Acción (RF-08, RF-09) */}
                <div className="mt-auto grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="industrial"
                    size="lg"
                    className="h-12 w-full gap-2 text-sm font-semibold shadow-xs"
                    onClick={() => add(product)}
                    aria-label={
                      cartQuantity > 0
                        ? `En el carrito (${cartQuantity}). Agregar otra unidad`
                        : `Agregar ${product.name} al carrito`
                    }
                    data-testid="add-to-cart-button"
                  >
                    {cartQuantity > 0 ? (
                      <>
                        <Check className="size-4" />
                        <span>En el carrito ({cartQuantity}) · Agregar</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="size-4" />
                        <span>Agregar al Carrito</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="whatsapp"
                    size="lg"
                    className="h-12 w-full gap-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/25"
                    asChild
                  >
                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Consultar repuesto por WhatsApp"
                      data-testid="direct-whatsapp-button"
                    >
                      <FaWhatsapp className="size-[18px] shrink-0 text-white" />
                      <span>WhatsApp Directo</span>
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Botón Flotante y Drawer del Carrito */}
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
                <span className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-semibold text-sm hidden sm:inline">Tu Carrito</span>
          </Button>
        </div>

        <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
      </main>

      <LandingFooter />
    </>
  );
}

function ProductDetailRouteComponent() {
  const { productId } = Route.useParams();
  return <ProductDetailPage productId={productId} />;
}

export default ProductDetailPage;
