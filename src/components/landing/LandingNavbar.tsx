import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Menu, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";

interface LandingNavbarProps {
  className?: string;
  isCatalog?: boolean;
}

export function LandingNavbar({ className = "", isCatalog }: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isCatalogPage =
    isCatalog ??
    (typeof window !== "undefined" && window.location.pathname.startsWith("/catalogo"));

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all ${className}`}
    >
      <div className="site-container flex h-18 items-center justify-between gap-4">
        {/* Denominación tipográfica con navegación hacia Inicio */}
        {isCatalogPage ? (
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            aria-label={`${SITE_CONFIG.name} - Volver al inicio`}
          >
            <span className="font-display">
              Laboratorio{" "}
              <span className="text-primary transition-colors group-hover:text-blue-500">Diésel</span>
            </span>
          </Link>
        ) : (
          <a
            href="#inicio"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            aria-label={`${SITE_CONFIG.name} - Ir al inicio`}
          >
            <span className="font-display">
              Laboratorio{" "}
              <span className="text-primary transition-colors group-hover:text-blue-500">Diésel</span>
            </span>
          </a>
        )}

        {/* Navegación Desktop (Visible >= 768px / md) */}
        <nav
          className="hidden items-center gap-7 text-sm font-medium md:flex"
          aria-label="Navegación principal"
        >
          {SITE_CONFIG.navLinks.map((link) => {
            const targetHref = isCatalogPage ? `/${link.href}` : link.href;

            return (
              <a
                key={link.href}
                href={targetHref}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Acciones de cabecera Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          {isCatalogPage ? (
            <Button variant="outline" asChild className="h-10 px-4 font-semibold border-border hover:bg-muted">
              <Link to="/">
                <ArrowLeft className="mr-1.5 size-4" />
                Volver al Inicio
              </Link>
            </Button>
          ) : (
            <Button
              variant="industrial"
              asChild
              className="group relative overflow-hidden h-10 px-4 font-semibold shadow-md shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 active:scale-95"
            >
              <Link to="/catalogo" className="relative overflow-hidden flex items-center">
                {/* Rayo de luz reflectante continuo */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  aria-hidden="true"
                />
                <span className="relative z-10 flex items-center">
                  Ver Catálogo
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="ml-1.5 inline-flex"
                  >
                    <ArrowRight className="size-4" />
                  </motion.span>
                </span>
              </Link>
            </Button>
          )}
        </div>

        {/* Botón menú hamburguesa Móvil (< 768px) */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex size-10 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil (< 768px) */}
      {isOpen && (
        <div
          className="border-b border-border bg-background/98 px-4 py-6 shadow-lg backdrop-blur-lg md:hidden"
          role="navigation"
          aria-label="Menú móvil"
        >
          <nav className="flex flex-col gap-4 text-base font-medium">
            {SITE_CONFIG.navLinks.map((link) => {
              const targetHref = isCatalogPage ? `/${link.href}` : link.href;

              return (
                <a
                  key={link.href}
                  href={targetHref}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-3 py-2 text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </a>
              );
            })}
            <div className="mt-2 border-t border-border pt-4">
              {isCatalogPage ? (
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-center h-11 font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/">
                    <ArrowLeft className="mr-1.5 size-4" />
                    Volver al Inicio
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="industrial"
                  asChild
                  className="group relative overflow-hidden w-full justify-center h-11 font-semibold shadow-md shadow-primary/25"
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/catalogo" className="relative overflow-hidden flex items-center justify-center">
                    {/* Rayo de luz reflectante continuo */}
                    <div
                      className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="relative z-10 flex items-center">
                      Ver Catálogo
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="ml-1.5 inline-flex"
                      >
                        <ArrowRight className="size-4" />
                      </motion.span>
                    </span>
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
