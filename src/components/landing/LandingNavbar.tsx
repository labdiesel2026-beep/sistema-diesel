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
      className={`fixed top-0 inset-x-0 z-50 w-full border-b border-white/10 bg-zinc-950/60 backdrop-blur-md transition-all ${className}`}
    >
      <div className="site-container flex h-20 items-center justify-between gap-6">
        {/* Denominación tipográfica estilo Longbow */}
        {isCatalogPage ? (
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-80"
            aria-label={`${SITE_CONFIG.name} - Volver al inicio`}
          >
            <span className="font-display">
              Laboratorio <span className="text-zinc-400">Diésel</span>
            </span>
          </Link>
        ) : (
          <a
            href="#inicio"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-80"
            aria-label={`${SITE_CONFIG.name} - Ir al inicio`}
          >
            <span className="font-display">
              Laboratorio <span className="text-zinc-400">Diésel</span>
            </span>
          </a>
        )}

        {/* Navegación Desktop: Enlaces finos monoespaciados */}
        <nav
          className="hidden items-center gap-8 text-xs font-mono uppercase tracking-[0.2em] md:flex"
          aria-label="Navegación principal"
        >
          {SITE_CONFIG.navLinks.map((link) => {
            const targetHref = isCatalogPage ? `/${link.href}` : link.href;

            return (
              <a
                key={link.href}
                href={targetHref}
                className="text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Acciones Desktop: Botón ortogonal fino sin rounded */}
        <div className="hidden items-center gap-4 md:flex">
          {isCatalogPage ? (
            <Button
              variant="outline"
              asChild
              className="h-9 px-5 rounded-none border border-white/20 bg-transparent text-xs font-mono uppercase tracking-widest text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 size-3.5" />
                Volver al Inicio
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              asChild
              className="h-9 px-5 rounded-none border border-white/20 bg-white/[0.04] text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all"
            >
              <Link to="/catalogo" className="flex items-center">
                <span>Ver Catálogo</span>
                <ArrowRight className="ml-2 size-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Botón menú hamburguesa Móvil (< 768px) */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex size-10 items-center justify-center border border-white/10 bg-zinc-950 text-white transition-colors hover:bg-zinc-900 focus-visible:outline-none"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil (< 768px) Ortogonal */}
      {isOpen && (
        <div
          className="border-b border-white/10 bg-zinc-950/98 px-6 py-8 backdrop-blur-xl md:hidden"
          role="navigation"
          aria-label="Menú móvil"
        >
          <nav className="flex flex-col gap-5 text-xs font-mono uppercase tracking-[0.2em]">
            {SITE_CONFIG.navLinks.map((link) => {
              const targetHref = isCatalogPage ? `/${link.href}` : link.href;

              return (
                <a
                  key={link.href}
                  href={targetHref}
                  onClick={() => setIsOpen(false)}
                  className="py-1 text-zinc-400 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              );
            })}
            <div className="mt-4 border-t border-white/10 pt-6">
              {isCatalogPage ? (
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-center h-10 rounded-none border border-white/20 bg-transparent text-xs font-mono uppercase tracking-widest text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/">
                    <ArrowLeft className="mr-2 size-3.5" />
                    Volver al Inicio
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-center h-10 rounded-none border border-white/20 bg-white/[0.08] text-xs font-mono uppercase tracking-widest text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/catalogo" className="flex items-center justify-center">
                    <span>Ver Catálogo</span>
                    <ArrowRight className="ml-2 size-3.5" />
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
