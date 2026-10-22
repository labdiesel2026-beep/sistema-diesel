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
        className={`border-t border-slate-800 bg-slate-950 text-slate-400 ${className}`}
        role="contentinfo"
      >
        <div className="site-container py-14 lg:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
            {/* Columna 1: Marca y propuesta institucional (5 columnas) */}
            <div className="space-y-4 md:col-span-5">
              <a
                href="#inicio"
                className="inline-block text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
                aria-label={`${SITE_CONFIG.name} - Ir al inicio`}
              >
                <span className="font-display">
                  Laboratorio <span className="text-blue-500">Diésel</span>
                </span>
              </a>
              <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                Especialistas en diagnóstico, reparación y calibración de sistemas de inyección Common
                Rail. Tecnología de precisión y respaldo técnico para su motor.
              </p>
              <div className="flex items-start gap-2.5 pt-2 text-xs text-slate-400">
                <MapPin className="mt-0.5 size-4 shrink-0 text-blue-500" />
                <span>{SITE_CONFIG.address}</span>
              </div>
            </div>

            {/* Columna 2: Navegación por secciones (4 columnas) */}
            <div className="md:col-span-4">
              <h4 className="font-display text-sm font-semibold tracking-wider text-slate-200 uppercase">
                Navegación
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
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
              <h4 className="font-display text-sm font-semibold tracking-wider text-slate-200 uppercase">
                Productos y Repuestos
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/catalogo"
                    className="font-medium text-blue-400 transition-colors hover:text-blue-300 hover:underline"
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
                    className="inline-flex items-center gap-1.5 text-left text-blue-400 transition-colors hover:text-blue-300 hover:underline cursor-pointer"
                  >
                    <ShieldCheck className="size-3.5 shrink-0" />
                    <span>{SITE_CONFIG.commercialPolicies.footerLinkText}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Barra inferior de copyright y derechos */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs sm:flex-row">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-slate-500">
              <p>
                © {currentYear} {SITE_CONFIG.name}. Todos los derechos reservados.
              </p>
              <span className="hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={handleOpenPolicies}
                className="text-slate-400 hover:text-white underline decoration-slate-700 hover:decoration-slate-400 transition-colors cursor-pointer"
              >
                {SITE_CONFIG.commercialPolicies.footerLinkText}
              </button>
            </div>

            <a
              href="#inicio"
              className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white"
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
