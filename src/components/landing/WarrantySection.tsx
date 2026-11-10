import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp-utils";
import { useScrollReveal } from "@/components/landing/scroll-reveal";
import videoSrc from "@/assets/workshop/banco-en-vivo.mp4";
import posterImg from "@/assets/workshop/inyectores-detalle.webp";

interface WarrantySectionProps {
  className?: string;
}

export function WarrantySection({ className = "" }: WarrantySectionProps) {
  const warrantyUrl = buildWhatsAppUrl(SITE_CONFIG.phone, SITE_CONFIG.whatsappMessages.warranty);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldFallback, setShouldFallback] = useState(false);

  const {
    ref,
    isInstant,
    containerVariants,
    itemVariants,
    singleVariants,
    viewportConfig,
    handleAnimationComplete,
  } = useScrollReveal("garantias");

  useEffect(() => {
    // Detección de directiva de ahorro de datos o conexiones móviles lentas (RF-01.2, RNF-02)
    if (typeof navigator !== "undefined") {
      const nav = navigator as unknown as {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
        };
      };

      if (
        nav.connection?.saveData === true ||
        nav.connection?.effectiveType === "2g" ||
        nav.connection?.effectiveType === "slow-2g"
      ) {
        setShouldFallback(true);
        return;
      }
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-data: reduce)")?.matches
    ) {
      setShouldFallback(true);
      return;
    }

    // Si autoplay es rechazado por políticas del navegador o modo de ahorro de energía
    const video = videoRef.current;
    if (video && typeof video.play === "function") {
      try {
        const playPromise = video.play();
        if (playPromise !== undefined && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            setShouldFallback(true);
          });
        }
      } catch {
        setShouldFallback(true);
      }
    }
  }, []);

  return (
    <section
      id="garantias"
      ref={ref}
      className={`scroll-mt-20 border-b border-white/10 bg-zinc-950 py-16 sm:py-24 md:py-32 text-foreground ${className}`}
      aria-labelledby="garantias-heading"
    >
      <div className="site-container">
        <div className="border-t border-white/10 pt-10 sm:pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
            {/* Columna Informativa (7 columnas en desktop) */}
            <motion.div
              variants={singleVariants}
              initial={isInstant ? "visible" : "hidden"}
              whileInView="visible"
              viewport={viewportConfig}
              className="lg:col-span-7 space-y-6 sm:space-y-8"
            >
              {/* Badge superior de garantía */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 block mb-3">
                  Respaldo & Posventa
                </span>
                <h2
                  id="garantias-heading"
                  className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-white uppercase leading-tight"
                >
                  {SITE_CONFIG.warrantyTerms.title}
                </h2>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base font-light leading-relaxed text-zinc-400 max-w-2xl">
                  {SITE_CONFIG.warrantyTerms.summary}
                </p>
              </div>

              {/* Lista de condiciones y detalles de garantía en formato plano con stagger */}
              <motion.div
                variants={containerVariants}
                initial={isInstant ? "visible" : "hidden"}
                whileInView="visible"
                viewport={viewportConfig}
                className="border-t border-white/10 pt-6 space-y-4"
              >
                {SITE_CONFIG.warrantyTerms.details.map((detail) => (
                  <motion.div
                    key={detail}
                    variants={itemVariants}
                    className="flex items-start gap-4 border-b border-white/5 pb-4"
                  >
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-zinc-400" />
                    <span className="text-sm font-light text-zinc-300 leading-relaxed">
                      {detail}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Acción de posventa WhatsApp */}
              <div className="pt-2 sm:pt-4 flex flex-col items-start gap-3 sm:gap-4 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-11 w-full sm:w-auto justify-center rounded-none border border-white/20 bg-white/[0.05] px-6 font-mono text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-none"
                >
                  <a href={warrantyUrl} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp className="mr-2 size-3.5 text-whatsapp" />
                    Solicitar Garantía / Soporte
                  </a>
                </Button>
                <p className="font-mono text-xs text-zinc-500">
                  Atención técnica directa de Lun a Vie
                </p>
              </div>
            </motion.div>

            {/* Columna Multimedia (5 columnas en desktop) */}
            <motion.div
              variants={singleVariants}
              initial={isInstant ? "visible" : "hidden"}
              whileInView="visible"
              viewport={viewportConfig}
              onAnimationComplete={handleAnimationComplete}
              className="lg:col-span-5"
            >
              <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-black">
                {shouldFallback ? (
                  <img
                    src={posterImg}
                    alt="Banco de ensayo y calibración de precisión Common Rail"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    poster={posterImg}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    suppressHydrationWarning
                    onError={() => setShouldFallback(true)}
                    className="h-full w-full object-cover"
                    aria-label="Ensayo y prueba de inyectores diésel en banco computarizado"
                  />
                )}

                {/* Badge técnico contextual */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 border border-white/10 bg-zinc-950/80 px-3 py-1 font-mono text-[10px] tracking-widest uppercase text-white/80">
                  <span
                    className={`size-1.5 ${
                      shouldFallback ? "bg-zinc-500" : "bg-emerald-400 animate-pulse"
                    }`}
                  />
                  <span>
                    {shouldFallback ? "Banco de Precisión Common Rail" : "Ensayo en Tiempo Real"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WarrantySection;
