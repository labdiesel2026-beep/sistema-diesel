import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { CatalogCartProvider } from "@/context/catalog-cart-context";
import { PublicPoliciesContainer } from "@/components/policies/PublicPoliciesContainer";
import { PublicLayoutWrapper } from "@/components/layout/PublicLayoutWrapper";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Root ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const JSON_LD_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["AutoPartsStore", "AutomotiveBusiness"],
  name: "Laboratorio Diésel",
  alternateName: "LabDiesel",
  url: "https://labdiesel.com.ar",
  logo: "https://labdiesel.com.ar/favicon.svg",
  telephone: "+5492657659108",
  description:
    "Laboratorio Diésel (LabDiesel) - Venta y calibración de inyectores Common Rail, bombas de alta presión Bosch, Delphi, Denso, VDO y Continental. Envíos a todo el país desde Villa Mercedes, San Luis.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Villa Mercedes",
    addressRegion: "San Luis",
    addressCountry: "AR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -33.6756,
    longitude: -65.4578,
  },
  priceRange: "$$",
  currenciesAccepted: "ARS",
  areaServed: {
    "@type": "Country",
    name: "Argentina",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Catálogo de Inyectores y Repuestos Diésel",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Inyectores Common Rail",
      },
      {
        "@type": "OfferCatalog",
        name: "Bombas de Alta Presión",
      },
    ],
  },
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "google-site-verification",
        content: "AqNN7Ag8U65Trm2zOY6xHu17B5gBmM6XuoG-4evlygQ",
      },
      {
        title:
          "Laboratorio Diésel (LabDiesel) | Inyectores Common Rail, Bombas y Repuestos Diésel",
      },
      {
        name: "description",
        content:
          "Laboratorio Diésel (LabDiesel) - Venta y calibración de inyectores Common Rail, bombas de alta presión Bosch, Delphi, Denso, VDO y Continental. Envíos a todo el país desde Villa Mercedes, San Luis.",
      },
      {
        name: "keywords",
        content:
          "laboratorio diesel, labdiesel, labdiesel.com.ar, inyectores diesel, bombas de alta presion, common rail, bosch, delphi, denso, villa mercedes, san luis, argentina, reparacion de inyectores, repuestos diesel",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Laboratorio Diésel" },
      {
        property: "og:title",
        content:
          "Laboratorio Diésel (LabDiesel) | Inyectores Common Rail, Bombas y Repuestos Diésel",
      },
      {
        property: "og:description",
        content:
          "Venta y reparación de inyectores Common Rail y bombas diésel de alta presión con banco de pruebas computarizado. Villa Mercedes, San Luis, Argentina.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://labdiesel.com.ar" },
      { property: "og:locale", content: "es_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Laboratorio Diésel (LabDiesel) | Inyectores Common Rail y Bombas",
      },
      {
        name: "twitter:description",
        content:
          "Laboratorio Diésel y banco computarizado de inyectores Common Rail. Envíos a toda Argentina.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://labdiesel.com.ar" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(JSON_LD_SCHEMA),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js-enabled');`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    document.documentElement.classList.add("js-enabled");
    document.body.classList.add("js-enabled");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      {isAdmin ? (
        <Outlet />
      ) : (
        <CatalogCartProvider>
          <PublicLayoutWrapper>
            <Outlet />
            <PublicPoliciesContainer />
          </PublicLayoutWrapper>
        </CatalogCartProvider>
      )}
    </QueryClientProvider>
  );
}
