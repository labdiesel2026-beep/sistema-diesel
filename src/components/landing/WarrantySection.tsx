import { useEffect, useRef, useState } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/config/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp-utils";
import videoSrc from "@/assets/workshop/banco-en-vivo.mp4";
import posterImg from "@/assets/workshop/inyectores-detalle.webp";

interface WarrantySectionProps {
  className?: string;
}

export function WarrantySection({ className = "" }: WarrantySectionProps) {
  const warrantyUrl = buildWhatsAppUrl(SITE_CONFIG.phone, SITE_CONFIG.whatsappMessages.warranty);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldFallback, setShouldFallback] = useState(false);

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
      className={`scroll-mt-20 border-y border-slate-200/80 bg-white py-20 dark:border-slate-800 dark:bg-slate-950 sm:py-24 ${className}`}
      aria-labelledby="garantias-heading"
    >
      <div className="site-container">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-6 sm:p-10 lg:p-12 shadow-sm dark:border-blue-900/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Columna Informativa (7 columnas en desktop) */}
            <div className="lg:col-span-7">
              {/* Badge superior de garantía */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/70 px-3.5 py-1 text-xs font-semibold text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
                <span>Respaldo y Posventa</span>
              </div>

              {/* Título de la sección */}
              <h2
                id="garantias-heading"
                className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
              >
                {SITE_CONFIG.warrantyTerms.title}
              </h2>

              {/* Resumen institucional */}
              <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {SITE_CONFIG.warrantyTerms.summary}
              </p>

              {/* Lista de condiciones y detalles de garantía */}
              <div className="mt-6 flex flex-col gap-3">
                {SITE_CONFIG.warrantyTerms.details.map((detail) => (
                  <div key={detail} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* Acción de posventa WhatsApp */}
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="whatsapp"
                  size="lg"
                  asChild
                  className="h-13 w-full px-6 text-sm font-bold shadow-md sm:w-auto"
                >
                  <a href={warrantyUrl} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp className="size-5" />
                    Solicitar Garantía / Soporte
                  </a>
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Atención técnica directa de Lun a Vie
                </p>
              </div>
            </div>

            {/* Columna Multimedia (5 columnas en desktop) con reproductor HTML5 resiliente */}
            <div className="lg:col-span-5">
              <div className="relative aspect-video lg:aspect-[4/3] w-full overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-950 shadow-xl">
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
                    onError={() => setShouldFallback(true)}
                    className="h-full w-full object-cover"
                    aria-label="Ensayo y prueba de inyectores diésel en banco computarizado"
                  />
                )}

                {/* Badge técnico contextual */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-slate-950/85 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
                  <span
                    className={`size-2 rounded-full ${
                      shouldFallback ? "bg-blue-400" : "bg-emerald-400 animate-pulse"
                    }`}
                  />
                  <span>
                    {shouldFallback ? "Banco de Precisión Common Rail" : "Ensayo en Tiempo Real"}
                  </span>
                </div>

                {/* Overlay degradado sutil de profundidad */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WarrantySection;
