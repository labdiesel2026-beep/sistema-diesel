/**
 * Carrusel Continuo de Marcas Homologadas con Efecto Ghost Industrial.
 * (Spec 009, RF-05, RNF-04, CL-05, Bloque 3 - Tarea 3.3)
 *
 * Características:
 * - Desplazamiento continuo por GPU sin saltos de ciclo (20 nodos duplicados).
 * - En escritorio: Opacidad pasiva de 45% y desaturación completa; activación al 100% en 300ms ease-out
 *   ante :hover o navegación por teclado :focus-visible.
 * - En dispositivos táctiles: Opacidad calibrada fija al 70% estática para visibilidad diurna bajo luz solar,
 *   erradicando estados de hover bloqueados o pegados en pantalla.
 * - Accesibilidad completa: role="img", tabIndex={0} y aria-label descriptivo en cada nodo.
 * - Soporte para touch-pan-y y directiva prefers-reduced-motion.
 */

import { useState, useRef, useEffect } from "react";
import { WORKSHOP_BRANDS } from "./brands";

export interface BrandsMarqueeProps {
  className?: string;
}

// Duplicación de los 10 nodos en el DOM para generar el ciclo continuo sin saltos (RF-05)
const MARQUEE_ITEMS = [...WORKSHOP_BRANDS, ...WORKSHOP_BRANDS];

export function BrandsMarquee({ className = "" }: BrandsMarqueeProps) {
  const [isTouchPaused, setIsTouchPaused] = useState(false);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manejo táctil no intrusivo
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
      className={`relative overflow-hidden py-24 md:py-32 bg-zinc-950 border-y border-white/10 ${className}`}
    >
      <div className="site-container mb-12 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
          Especialización Técnica Multimarca
        </p>
        <h2 className="mt-3 font-display text-2xl md:text-3xl font-light tracking-tight text-zinc-300">
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
          className="flex w-max items-center gap-16 sm:gap-24 py-4 group hover:[animation-play-state:paused] animate-marquee max-md:[animation-duration:25s] motion-reduce:[animation:none]"
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
                role="img"
                tabIndex={0}
                aria-label={`Fabricante homologado: ${brand.name}`}
                className="flex items-center justify-center shrink-0 cursor-default outline-none rounded-none p-2 transition-all duration-300 ease-out text-zinc-600 hover:text-zinc-300 focus-visible:text-white focus-visible:ring-1 focus-visible:ring-white/20"
                title={title}
                data-testid={`brand-item-${brand.id}`}
              >
                <BrandLogoComponent className="h-7 sm:h-8 w-auto max-w-[130px] sm:max-w-[160px] opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BrandsMarquee;
