import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Gauge,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogCart } from "@/components/catalog-cart";
import { CartDrawer } from "@/components/cart-drawer";

export const whatsappUrl = (text = "Hola, quisiera consultar sobre inyección diésel.") =>
  `https://wa.me/?text=${encodeURIComponent(text)}`;

export function WhatsAppButton({
  children = "Consultar por WhatsApp",
  warranty = false,
}: {
  children?: React.ReactNode;
  warranty?: boolean;
}) {
  return (
    <Button variant="whatsapp" asChild className="h-12 px-5 font-bold">
      <a
        href={whatsappUrl(
          warranty ? "Hola, quisiera solicitar la garantía de 30 días." : undefined,
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="size-4" />
        {children}
      </a>
    </Button>
  );
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      to="/"
      className="flex min-w-0 items-center gap-3"
      aria-label="Laboratorio Diésel, inicio"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <SlidersHorizontal className="size-6" />
      </span>
      <span
        className={`min-w-0 font-display text-[22px] font-bold leading-[1.05] ${footer ? "text-hero-foreground" : "text-foreground"}`}
      >
        Laboratorio{" "}
        <span className="block">
          Diésel<span className="text-primary">.</span>
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [menu, setMenu] = useState(false);
  const [cart, setCart] = useState(false);
  const { count } = useCatalogCart();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <>
      <header className="relative z-20 border-b border-border bg-card">
        <div className="site-container grid h-21 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
          <Brand />
          <nav
            className="hidden items-center gap-8 text-sm font-semibold md:flex"
            aria-label="Navegación principal"
          >
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-primary" }}
            >
              Inicio
            </Link>
            <a href="/#servicios" className="hover:text-primary transition-colors">
              Servicios
            </a>
            <Link to="/catalogo" activeProps={{ className: "text-primary" }}>
              Catálogo
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden sm:block">
              <WhatsAppButton>Hablemos</WhatsAppButton>
            </div>
            <span className="hidden h-7 border-l border-border sm:block" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir carrito"
              title="Carrito"
              className="relative"
              onClick={() => setCart(true)}
            >
              <ShoppingCart className="size-5" />
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {count}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        <div className="border-t border-border bg-secondary/50">
          <div className="site-container flex items-center justify-between gap-3 py-2">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">
              Vistas · Demo
            </span>
            <nav
              aria-label="Selector temporal de vistas"
              className="flex shrink-0 gap-1 rounded-xl border border-border bg-card p-1"
            >
              <Button size="sm" variant={pathname === "/" ? "industrial" : "ghost"} asChild>
                <Link to="/" onClick={() => setMenu(false)}>
                  Landing
                </Link>
              </Button>
              <Button size="sm" variant={pathname === "/catalogo" ? "industrial" : "ghost"} asChild>
                <Link to="/catalogo" onClick={() => setMenu(false)}>
                  Catálogo
                </Link>
              </Button>
              <Button
                size="sm"
                variant={pathname.startsWith("/admin") ? "industrial" : "ghost"}
                asChild
              >
                <Link to="/admin" onClick={() => setMenu(false)}>
                  Admin
                </Link>
              </Button>
            </nav>
          </div>
        </div>
        {menu && (
          <nav
            className="site-container flex flex-col gap-5 border-t border-border py-6 md:hidden"
            aria-label="Navegación móvil"
          >
            <Link to="/" onClick={() => setMenu(false)}>
              Inicio
            </Link>
            <a href="/#servicios" onClick={() => setMenu(false)}>
              Servicios
            </a>
            <Link to="/catalogo" onClick={() => setMenu(false)}>
              Catálogo
            </Link>
            <WhatsAppButton>Hablemos</WhatsAppButton>
          </nav>
        )}
      </header>
      <CartDrawer open={cart} onOpenChange={setCart} />
    </>
  );
}

const services = [
  {
    icon: Gauge,
    number: "01",
    title: "Diagnóstico",
    text: "Detectamos la falla con precisión. Evaluación completa de tu sistema de inyección.",
    detail: "Análisis especializado",
  },
  {
    icon: SlidersHorizontal,
    number: "02",
    title: "Banco de pruebas",
    text: "Ensayo y calibración de inyectores con tecnología de alta precisión.",
    detail: "Resultados comprobables",
  },
  {
    icon: Settings2,
    number: "03",
    title: "Recambios",
    text: "Recuperá el rendimiento de tu motor con inyectores reacondicionados.",
    detail: "Rendimiento garantizado",
  },
  {
    icon: Package,
    number: "04",
    title: "Repuestos",
    text: "Inyectores y componentes de calidad para sistemas diésel Common Rail.",
    detail: "Calidad en cada pieza",
  },
];

export function Services({ standalone = false }: { standalone?: boolean }) {
  return (
    <section className="bg-background py-14 md:py-17">
      <div className="site-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-3 text-primary">Experiencia que se traduce en rendimiento</p>
            {standalone ? (
              <h1 className="font-display text-4xl font-bold">Nuestros servicios</h1>
            ) : (
              <h2 className="font-display text-4xl font-bold">
                Tu sistema diésel, en buenas manos.
              </h2>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Soluciones integrales, desde el diagnóstico hasta el último repuesto.
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <BadgeCheck className="size-4 text-primary" /> Atención especializada
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="service-card rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-7 flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <service.icon className="size-6" />
                </span>
                <span className="font-display text-sm text-muted-foreground/60">
                  {service.number}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold">{service.title}</h3>
              <p className="mt-3 min-h-18 text-[13px] leading-6 text-muted-foreground">
                {service.text}
              </p>
              <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-[11px] font-semibold">
                <Check className="size-3.5 text-primary" />
                {service.detail}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Warranty() {
  return (
    <section className="border-y border-border bg-secondary py-10">
      <div className="site-container flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
        <div className="flex items-start gap-5">
          <span className="flex size-15 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
            <ShieldCheck className="size-8" />
          </span>
          <div>
            <p className="eyebrow mb-2 text-primary">Trabajamos con respaldo</p>
            <h2 className="font-display text-3xl font-bold">30 días de garantía. Cero dudas.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Respaldamos nuestros trabajos y repuestos durante 30 días.
              <br className="hidden md:block" /> Si necesitás asistencia, estamos a un mensaje de
              distancia.
            </p>
          </div>
        </div>
        <WhatsAppButton warranty>
          Solicitar Garantía <ArrowRight className="size-4" />
        </WhatsAppButton>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-hero text-hero-foreground">
      <div className="site-container grid gap-10 py-12 md:grid-cols-[1fr_1fr_1.2fr]">
        <div>
          <Brand footer />
          <p className="mt-5 max-w-xs text-sm leading-6 text-hero-muted">
            Precisión en cada prueba.
            <br />
            Confianza en cada kilómetro.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-hero-muted">
            <Zap className="size-4 text-primary" /> Especialistas en Common Rail
          </div>
        </div>
        <div>
          <h3 className="mb-5 text-sm font-bold">Estamos para ayudarte</h3>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-hero-muted"
          >
            <MessageCircle className="size-4 text-whatsapp" /> Contactar por WhatsApp{" "}
            <ChevronRight className="size-3" />
          </a>
          <div className="mt-5 flex items-start gap-3 text-sm text-hero-muted">
            <MapPin className="size-4 shrink-0" />
            <span>
              Dirección del taller
              <br />
              <span className="text-xs">Por confirmar</span>
            </span>
          </div>
          <p className="mt-5 text-xs text-hero-muted">Teléfono y horarios por confirmar</p>
        </div>
        <div className="map-placeholder flex min-h-40 items-center justify-center rounded-xl text-muted-foreground">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 size-7" />
            <p className="text-sm font-semibold">Ubicación del taller</p>
            <p className="mt-1 text-[11px]">Google Maps · Próximamente</p>
          </div>
        </div>
      </div>
      <div className="border-t border-hero-border">
        <div className="site-container flex flex-wrap justify-between gap-3 py-5 text-[11px] text-hero-muted">
          <span>© 2026 Laboratorio Diésel. Todos los derechos reservados.</span>
          <span>Inyección diésel. Sin concesiones.</span>
        </div>
      </div>
    </footer>
  );
}

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
