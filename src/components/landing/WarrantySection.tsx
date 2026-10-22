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
      className={`scroll-mt-20 border-y border-border/80 bg-background py-20 text-foreground sm:py-24 ${className}`}
      aria-labelledby="garantias-heading"
    >
      <div className="site-container">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Columna Informativa (7 columnas en desktop) */}
            <div className="lg:col-span-7">
              {/* Badge superior de garantía */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Respaldo y Posventa</span>
              </div>

              {/* Título de la sección */}
              <h2
                id="garantias-heading"
                className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
              >
                {SITE_CONFIG.warrantyTerms.title}
              </h2>

              {/* Resumen institucional */}
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {SITE_CONFIG.warrantyTerms.summary}
              </p>

              {/* Lista de condiciones y detalles de garantía en tarjetas técnicas */}
              <div className="mt-6 flex flex-col gap-2.5">
                {SITE_CONFIG.warrantyTerms.details.map((detail) => (
                  <div
                    key={detail}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-3 transition-colors hover:border-border"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-sm font-medium text-foreground">
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
                  className="h-12 w-full px-6 font-mono text-xs uppercase tracking-wider font-bold shadow-md sm:w-auto"
                >
                  <a href={warrantyUrl} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp className="size-4" />
                    Solicitar Garantía / Soporte
                  </a>
                </Button>
                <p className="font-mono text-xs text-muted-foreground">
                  Atención técnica directa de Lun a Vie
                </p>
              </div>
            </div>

            {/* Columna Multimedia (5 columnas en desktop) con reproductor HTML5 resiliente Edge-to-Edge */}
            <div className="lg:col-span-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/80 bg-black shadow-2xl">
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
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-md">
                  <span
                    className={`size-2 rounded-full ${
                      shouldFallback ? "bg-muted-foreground" : "bg-emerald-400 animate-pulse"
                    }`}
                  />
                  <span>
                    {shouldFallback ? "Banco de Precisión Common Rail" : "Ensayo en Tiempo Real"}
                  </span>
                </div>

                {/* Overlay degradado sutil de profundidad acotado a la base */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
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
