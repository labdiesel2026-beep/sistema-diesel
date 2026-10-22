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
      className={`relative overflow-hidden py-10 bg-background border-y border-border/80 ${className}`}
    >
      <div className="site-container mb-6 text-center">
        <p className="text-micro text-muted-foreground">
          Especialización Técnica Multimarca
        </p>
        <h2 className="mt-1.5 font-display text-lg font-bold text-foreground sm:text-2xl">
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
                role="img"
                tabIndex={0}
                aria-label={`Fabricante homologado: ${brand.name}`}
                className="flex items-center justify-center shrink-0 cursor-default outline-none rounded-md p-1.5 transition-all duration-300 ease-out opacity-45 grayscale hover:opacity-100 hover:grayscale-0 focus-visible:opacity-100 focus-visible:grayscale-0 focus-visible:ring-1 focus-visible:ring-white/40 text-muted-foreground hover:text-white max-md:opacity-70 max-md:grayscale-0 [@media(hover:none)]:opacity-70 [@media(hover:none)]:grayscale-0"
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
