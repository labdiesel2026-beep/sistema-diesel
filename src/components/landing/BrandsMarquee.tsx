/**
 * Carrusel Continuo de Marcas Homologadas (Brands Marquee).
 * (Spec 010, RF-01, Módulo A, RNF-04, WCAG 2.2.2)
 *
 * Características canónicas:
 * 1. Botón Accesible Toggle WCAG 2.2.2:
 *    - Posicionado al inicio como sr-only, visible al foco de teclado (:focus-visible).
 *    - Alterna entre "Pausar animación" (aria-pressed="false") y "Reanudar animación" (aria-pressed="true").
 *    - Memoria de pausa estricta: prevalece sobre visibilitychange (no se reanuda al volver de pestaña si el usuario pausó).
 *    - Si prefers-reduced-motion está activo, el botón NO se renderiza en el DOM para evitar redundancia de accesibilidad.
 * 2. Clonación dinámica: calcula programáticamente clones para superar min-width: 200vw
 *    (incluso en resoluciones 4K y Ultrawide) independientemente de si hay 3 o 30 marcas.
 * 3. Recálculo en resize con debounce de 250ms para adaptación continua.
 * 4. Traslación CSS pura continua de 0 a -50% en 35 segundos de derecha a izquierda.
 * 5. Siluetas monocromáticas accesibles: brightness-0 invert opacity-70 (opacity-100 en hover),
 *    con tamaño máximo de 40x120px y separación horizontal uniforme de 48px (gap-12).
 * 6. Desmontaje condicional completo (retorna null) si el listado de marcas es vacío.
 * 7. Máscara difuminada lateral (mask-image) para entrada y salida suave de logotipos.
 * 8. Suspensión automática al hover, al toque en pantallas táctiles y por Page Visibility API.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { WORKSHOP_BRANDS } from "./brands";
import { cn } from "@/lib/utils";

export interface WorkshopBrandItem {
  readonly id: string;
  readonly name: string;
  readonly subtitle?: string;
  readonly Component?: React.ComponentType<{ className?: string }>;
}

export interface BrandsMarqueeProps {
  className?: string;
  brands?: readonly WorkshopBrandItem[];
}

const ITEM_ESTIMATED_WIDTH_PX = 168; // 120px max-width + 48px gap

export function BrandsMarquee({ className = "", brands = WORKSHOP_BRANDS }: BrandsMarqueeProps) {
  const [viewportWidth, setViewportWidth] = useState<number>(() => {
    return typeof window !== "undefined" ? window.innerWidth : 1920;
  });
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [isTouchPaused, setIsTouchPaused] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // 1. Detección en tiempo real de 'prefers-reduced-motion'
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // 2. Suscripción a resize con debounce de 250ms (RF-01)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        setViewportWidth(window.innerWidth);
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // 3. Suspensión por Page Visibility API (respetando memoria estricta de pausa manual)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible" && !document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 4. Cálculo matemático de clones para min-width > 200vw (cobertura 4K / Ultrawide)
  const marqueeItems = useMemo(() => {
    if (!brands || brands.length === 0) return [];
    const targetHalfWidth = viewportWidth;
    const oneSetWidth = brands.length * ITEM_ESTIMATED_WIDTH_PX;
    const repetitionsPerHalf = Math.max(1, Math.ceil(targetHalfWidth / oneSetWidth));

    const halfItems: Array<{ brand: WorkshopBrandItem; cloneIndex: number }> = [];
    for (let i = 0; i < repetitionsPerHalf; i++) {
      for (const brand of brands) {
        halfItems.push({ brand, cloneIndex: i });
      }
    }

    // Duplicamos exactamente la mitad para el loop sin costuras (0% a -50%)
    return [...halfItems, ...halfItems];
  }, [brands, viewportWidth]);

  // Manejador del botón accesible de alternancia
  const toggleManualPause = useCallback(() => {
    setIsManualPaused((prev) => !prev);
  }, []);

  // Referencias para temporizadores de toque
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Al iniciar contacto táctil: pausar tras 250ms de contacto sostenido
  const handleTouchStart = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    touchTimerRef.current = setTimeout(() => {
      setIsTouchPaused(true);
    }, 250);
  }, []);

  // Al soltar contacto: reanudar tras 1.5s de gracia
  const handleTouchEnd = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsTouchPaused(false);
    }, 1500);
  }, []);

  // Memoria de Pausa Estricta: si el usuario pausó manualmente, prevalece sobre cualquier evento
  const isEffectivePaused = isManualPaused || isTouchPaused || !isTabVisible;

  // Desmontaje condicional completo ante listas vacías después de invocar todos los hooks
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Marcas y sistemas de inyección atendidos"
      className={cn(
        "relative overflow-hidden py-16 sm:py-24 md:py-32 bg-zinc-950 border-y border-white/10",
        className,
      )}
    >
      {/* 
        Botón Accesible Toggle WCAG 2.2.2 (Pausa / Reanudación):
        - Solo se renderiza si prefers-reduced-motion está inactivo.
        - Invisible por defecto (sr-only), visible al foco de teclado (:focus-visible).
        - Alterna entre 'Pausar animación' (aria-pressed="false") y 'Reanudar animación' (aria-pressed="true").
      */}
      {!prefersReducedMotion && (
        <button
          type="button"
          onClick={toggleManualPause}
          aria-pressed={isManualPaused}
          className={cn(
            "sr-only focus-visible:not-sr-only",
            "focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-30",
            "focus-visible:inline-flex focus-visible:items-center focus-visible:gap-2",
            "focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-none",
            "focus-visible:bg-white focus-visible:text-black focus-visible:font-mono focus-visible:text-xs focus-visible:font-semibold focus-visible:uppercase focus-visible:tracking-widest",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            "transition-all duration-150 cursor-pointer shadow-lg",
          )}
        >
          {isManualPaused ? "Reanudar animación" : "Pausar animación"}
        </button>
      )}

      <div className="site-container mb-8 sm:mb-12 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Especialización Técnica Multimarca
        </p>
        <h2 className="mt-3 font-display text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-zinc-300">
          Marcas y Sistemas de Inyección que Atendemos
        </h2>
      </div>

      {/* Contenedor con gradientes difuminados laterales (mask-image) */}
      <div
        className="relative w-full overflow-hidden touch-pan-y will-change-transform transform-gpu [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [touch-action:pan-y]"
        style={{ transform: "translate3d(0, 0, 0)" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        data-testid="brands-marquee-container"
      >
        <div
          className="flex w-max items-center gap-12 py-4 group hover:[animation-play-state:paused] animate-marquee motion-reduce:[animation:none] will-change-transform transform-gpu"
          style={{
            transform: "translate3d(0, 0, 0)",
            ...(isEffectivePaused ? { animationPlayState: "paused" } : {}),
          }}
          data-paused={isEffectivePaused ? "true" : "false"}
          data-testid="brands-marquee-track"
        >
          {marqueeItems.map(({ brand, cloneIndex }, idx) => {
            const BrandLogoComponent = brand.Component;
            const subtitle = brand.subtitle;
            const title = subtitle ? `${brand.name} (${subtitle})` : brand.name;

            return (
              <div
                key={`${brand.id}-${cloneIndex}-${idx}`}
                aria-hidden="true"
                tabIndex={-1}
                className="flex h-12 w-[140px] max-w-[140px] items-center justify-center shrink-0 cursor-default select-none transition-all duration-300 ease-out bg-[#161B26] border border-slate-800/80 rounded-lg px-3 py-1.5 shadow-sm"
                title={title}
                data-testid={`brand-item-${brand.id}`}
              >
                {BrandLogoComponent ? (
                  <BrandLogoComponent
                    className="h-auto max-h-8 w-auto max-w-[110px] object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200">
                    {brand.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BrandsMarquee;
