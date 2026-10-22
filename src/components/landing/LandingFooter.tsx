import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, ArrowUp, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";
import { PoliciesModal } from "@/components/policies/PoliciesModal";

interface LandingFooterProps {
  className?: string;
  onOpenPoliciesModal?: () => void;
}

export function LandingFooter({ className = "", onOpenPoliciesModal }: LandingFooterProps) {
  const currentYear = new Date().getFullYear();
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const handleOpenPolicies = () => {
    if (onOpenPoliciesModal) {
      onOpenPoliciesModal();
    } else {
      setInternalModalOpen(true);
    }
  };

  return (
    <>
      <footer
        className={`border-t border-white/10 bg-canvas text-zinc-400 ${className}`}
        role="contentinfo"
      >
        <div className="site-container py-24 lg:py-32">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-12 lg:gap-16">
            {/* Columna 1: Marca y propuesta institucional (5 columnas) */}
            <div className="space-y-6 md:col-span-5">
              <a
                href="#inicio"
                className="inline-block text-2xl font-medium tracking-tighter text-white transition-opacity hover:opacity-90"
                aria-label={`${SITE_CONFIG.name} - Ir al inicio`}
              >
                <span className="font-display">
                  Laboratorio <span className="text-zinc-400">Diésel</span>
                </span>
              </a>
              <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                Especialistas en diagnóstico, reparación y calibración de sistemas de inyección Common
                Rail. Tecnología de precisión y respaldo técnico para su motor.
              </p>
              <div className="flex items-start gap-3 pt-3 text-xs text-zinc-400">
                <MapPin className="mt-0.5 size-4 shrink-0 text-industrial" />
                <span>{SITE_CONFIG.address}</span>
              </div>
            </div>

            {/* Columna 2: Navegación por secciones (4 columnas) */}
            <div className="md:col-span-4">
              <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500">
                Navegación
              </h4>
              <ul className="mt-8 space-y-3.5 text-sm">
                {SITE_CONFIG.navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3: Accesos Rápidos y Catálogo (3 columnas) */}
            <div className="md:col-span-3">
              <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500">
                Productos y Repuestos
              </h4>
              <ul className="mt-8 space-y-3.5 text-sm">
                <li>
                  <Link
                    to="/catalogo"
                    className="font-medium text-industrial transition-colors hover:text-industrial-hover hover:underline"
                  >
                    Explorar Catálogo Completo →
                  </Link>
                </li>
                <li>
                  <a href="#garantias" className="transition-colors hover:text-white">
                    Condiciones de Garantía
                  </a>
                </li>
                <li>
                  <a href="#ubicacion" className="transition-colors hover:text-white">
                    Visitar Taller / Ubicación
                  </a>
                </li>
                <li>
                  {/* Botón semántico permanente de políticas comerciales (RF-04.4) */}
                  <button
                    type="button"
                    onClick={handleOpenPolicies}
                    className="inline-flex items-center gap-1.5 text-left text-industrial transition-colors hover:text-industrial-hover hover:underline cursor-pointer"
                  >
                    <ShieldCheck className="size-3.5 shrink-0" />
                    <span>{SITE_CONFIG.commercialPolicies.footerLinkText}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Barra inferior de copyright, firma GEPI SOFTWARE y derechos */}
          <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-12 text-xs sm:flex-row">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-zinc-500">
              <p>
                © {currentYear} {SITE_CONFIG.name}. Todos los derechos reservados.
              </p>
              <span className="hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={handleOpenPolicies}
                className="text-zinc-400 hover:text-white underline decoration-zinc-700 hover:decoration-zinc-400 transition-colors cursor-pointer"
              >
                {SITE_CONFIG.commercialPolicies.footerLinkText}
              </button>
            </div>

            {/* Mención explícita institucional GEPI SOFTWARE (RF-06) */}
            <p className="font-mono text-[11px] text-[#a1a1aa] tracking-wider text-center">
              Desarrollada por{" "}
              <a
                href="https://www.gepisoftware.com"
                target="_self"
                rel="noopener"
                className="text-zinc-300 hover:text-industrial underline decoration-zinc-700 hover:decoration-industrial transition-colors"
              >
                GEPI SOFTWARE
              </a>
            </p>

            <a
              href="#inicio"
              className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500 transition-colors hover:text-white"
              aria-label="Volver arriba de la página"
            >
              <span>Volver arriba</span>
              <ArrowUp className="size-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modal accesible de políticas gestionado por el Footer si no se inyecta prop */}
      {!onOpenPoliciesModal && (
        <PoliciesModal open={internalModalOpen} onOpenChange={setInternalModalOpen} />
      )}
    </>
  );
}

export default LandingFooter;
