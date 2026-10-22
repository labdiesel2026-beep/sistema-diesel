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
          className={`fixed bottom-3 inset-x-3 z-45 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md w-auto rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-md ring-1 ring-blue-500/20 dark:border-blue-900/50 dark:bg-slate-900/95 dark:shadow-slate-950/50 dark:ring-blue-400/20 ${className}`}
        >
          <div className="flex items-start gap-3.5">
            {/* Ícono de garantía institucional */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-400">
              <ShieldCheck className="size-5" />
            </div>

            <div className="flex-1">
              <h3 className="font-display text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Políticas Comerciales y Garantía
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Precios orientativos sujetos a cotización técnica. Trabajos y componentes con
                garantía de 30 días bajo protocolo de montaje idóneo.
              </p>

              {/* Botones de acción */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={acceptPolicies}
                  className="h-8.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
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
                    className="h-8.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
