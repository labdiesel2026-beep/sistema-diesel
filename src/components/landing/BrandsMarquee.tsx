import { useState, useRef, useEffect } from "react";
import { WORKSHOP_BRANDS } from "./brands";

export interface BrandsMarqueeProps {
  className?: string;
}

// Duplicación de los 10 nodos en el DOM para generar el ciclo continuo sin saltos (RF-03.1)
const MARQUEE_ITEMS = [...WORKSHOP_BRANDS, ...WORKSHOP_BRANDS];

/**
 * Carrusel continuo infinito de las 10 marcas de inyección atendidas por el taller.
 * Implementa desplazamiento por GPU continuo, gradientes difuminados laterales,
 * control táctil no invasivo y soporte para prefers-reduced-motion (RF-03.1, RF-03.2, RF-03.3, RNF-04).
 */
export function BrandsMarquee({ className = "" }: BrandsMarqueeProps) {
  const [isTouchPaused, setIsTouchPaused] = useState(false);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manejo táctil no intrusivo (CL-09, CL-13)
  const handleTouchStart = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    // Solo pausar si el toque sostenido dura más de 250ms (evita pausar durante scrolls verticales rápidos)
    touchTimerRef.current = setTimeout(() => {
      setIsTouchPaused(true);
    }, 250);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    // Reanudación suave con retardo de gracia de 1.5s
    resumeTimerRef.current = setTimeout(() => {
      setIsTouchPaused(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  return (
    <section
      aria-label="Marcas y sistemas de inyección atendidos"
      className={`relative overflow-hidden py-10 bg-slate-100/60 dark:bg-slate-950/40 border-y border-slate-200/60 dark:border-slate-800/80 ${className}`}
    >
      <div className="site-container mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Especialización Técnica Multimarca
        </p>
        <h2 className="mt-1 font-display text-lg font-bold text-slate-800 dark:text-slate-200 sm:text-xl">
          Marcas y Sistemas de Inyección que Atendemos
        </h2>
      </div>

      {/* Contenedor con gradientes difuminados laterales (mask-image) y touch-action: pan-y */}
      <div
        className="relative w-full overflow-hidden touch-pan-y [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [touch-action:pan-y]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        data-testid="brands-marquee-container"
      >
        <div
          className="flex w-max items-center gap-12 sm:gap-16 py-2 group hover:[animation-play-state:paused] animate-marquee max-md:[animation-duration:25s] motion-reduce:[animation:none]"
          style={isTouchPaused ? { animationPlayState: "paused" } : undefined}
          data-paused={isTouchPaused ? "true" : "false"}
          data-testid="brands-marquee-track"
        >
          {MARQUEE_ITEMS.map((brand, idx) => {
            const BrandLogoComponent = brand.Component;
            const subtitle = "subtitle" in brand ? (brand.subtitle as string | undefined) : undefined;
            const title = subtitle ? `${brand.name} (${subtitle})` : brand.name;

            return (
              <div
                key={`${brand.id}-${idx}`}
                className="flex items-center justify-center opacity-65 transition-all duration-300 hover:opacity-100 hover:scale-105 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.35)] shrink-0"
                title={title}
                data-testid={`brand-item-${brand.id}`}
              >
                <BrandLogoComponent className="h-7 sm:h-8 w-auto max-w-[130px] sm:max-w-[160px]" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BrandsMarquee;
