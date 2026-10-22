import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePoliciesConsent } from "./use-policies-consent";

export interface PoliciesBannerProps {
  /** Callback para abrir el modal accesible con los 4 ejes normativos completos */
  readonly onOpenModal?: () => void;
  readonly className?: string;
}

export function PoliciesBanner({ onOpenModal, className = "" }: PoliciesBannerProps) {
  const { shouldShowBanner, acceptPolicies } = usePoliciesConsent();
  const [hasDelayElapsed, setHasDelayElapsed] = useState(false);

  // Retardo de entrada de exactamente 1000ms tras el montaje en el cliente (RF-04.3)
  useEffect(() => {
    if (!shouldShowBanner) {
      setHasDelayElapsed(false);
      return;
    }

    const timer = setTimeout(() => {
      setHasDelayElapsed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [shouldShowBanner]);

  // Si estamos en el panel de administración (/admin/*), omitir por completo
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return null;
  }

  const isVisible = shouldShowBanner && hasDelayElapsed;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          role="region"
          aria-label="Aviso de políticas comerciales y de garantía"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96, transition: { duration: 0.3 } }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed bottom-3 inset-x-3 z-30 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md w-auto rounded-none border border-white/10 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md text-zinc-100 ${className}`}
        >
          <div className="flex items-start gap-3.5">
            {/* Ícono de garantía institucional */}
            <div className="flex size-10 shrink-0 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-industrial">
              <ShieldCheck className="size-5" />
            </div>

            <div className="flex-1">
              <h3 className="font-display text-sm font-semibold tracking-tight text-white uppercase">
                Políticas Comerciales y Garantía
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Precios orientativos sujetos a cotización técnica. Trabajos y componentes con
                garantía de 30 días bajo protocolo de montaje idóneo.
              </p>

              {/* Botones de acción */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={acceptPolicies}
                  className="h-8.5 rounded-none bg-industrial px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-industrial-hover active:scale-[0.98] transition-all cursor-pointer"
                >
                  Aceptar y Continuar
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>

                {onOpenModal && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onOpenModal}
                    className="h-8.5 rounded-none px-2.5 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    Ver Políticas Completas
                    <ExternalLink className="ml-1 size-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default PoliciesBanner;
