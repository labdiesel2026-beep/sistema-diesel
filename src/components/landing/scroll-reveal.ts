import { useRef, useState, useEffect } from "react";
import { useReducedMotion, type Variants } from "framer-motion";

/**
 * Spec 010 (RF-05, Caso Límite 2, RNF-02):
 * Sistema canónico de revelación progresiva al scroll con stagger y activación única (once).
 *
 * Configuración canónica:
 * - Umbral de intersección: 10% (amount: 0.1)
 * - Activación única: once: true
 * - Stagger entre tarjetas consecutivas: 0.12s (rango 0.1s - 0.2s)
 * - Curva de aceleración: cubic-bezier(0.16, 1, 0.3, 1)
 * - Resiliencia ante scroll ultrarrápido y navegación SPA.
 */

// Memoria estricta para navegación SPA (RF-05): los bloques revelados no se re-animan al volver del Catálogo
const revealedSectionsCache = new Set<string>();

export const scrollRevealViewport = {
  once: true,
  amount: 0.1,
} as const;

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export const instantContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0,
      delayChildren: 0,
    },
  },
};

export const scrollRevealItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const instantItemVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
    },
  },
};

export const singleBlockVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const instantSingleBlockVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
    },
  },
};

export function useScrollReveal(sectionId?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  const [isInstant, setIsInstant] = useState(() => {
    if (shouldReduceMotion) return true;
    if (sectionId && revealedSectionsCache.has(sectionId)) return true;
    return false;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (shouldReduceMotion || (sectionId && revealedSectionsCache.has(sectionId))) {
      setIsInstant(true);
      setIsVisible(true);
      el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
      el.classList.remove("opacity-0", "translate-y-4", "translate-y-8", "translate-y-20");
      return;
    }

    // Comprobación inicial de posición física:
    const rect = el.getBoundingClientRect();
    if (rect.bottom <= 0 || (rect.top < window.innerHeight && rect.bottom > 0)) {
      setIsVisible(true);
      setIsInstant(true);
      if (sectionId) revealedSectionsCache.add(sectionId);
      el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
      el.classList.remove("opacity-0", "translate-y-4", "translate-y-8", "translate-y-20");
    } else {
      el.classList.add("scroll-reveal");
    }

    // 1. IntersectionObserver activo para inyección de clases CSS en tiempo real
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setIsVisible(true);
              if (sectionId) revealedSectionsCache.add(sectionId);

              // Inyectar clase canónica is-visible y de visibilidad al elemento
              el.classList.add("is-visible", "opacity-100", "translate-y-0", "revealed");
              el.classList.remove("opacity-0", "translate-y-4", "translate-y-8", "translate-y-20");

              // Propagar a descendientes directos o marcados
              const childNodes = el.querySelectorAll<HTMLElement>(
                ".scroll-reveal, [data-scroll-reveal], .scroll-reveal-item",
              );
              childNodes.forEach((child) => {
                child.classList.add("is-visible", "opacity-100", "translate-y-0", "revealed");
                child.classList.remove(
                  "opacity-0",
                  "translate-y-4",
                  "translate-y-8",
                  "translate-y-20",
                );
              });

              if (observer) {
                observer.unobserve(el);
                observer.disconnect();
              }
              break;
            }
          }
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -40px 0px",
        },
      );

      observer.observe(el);
    }

    // 2. Resiliencia ante scroll acelerado / teclas de salto
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PageDown" || e.key === "End" || (e.key === " " && !e.shiftKey)) {
        setIsInstant(true);
        setIsVisible(true);
        if (sectionId) revealedSectionsCache.add(sectionId);
        el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
      }
    };

    let lastScrollY = window.scrollY;
    let lastTime = performance.now();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();
      const timeDelta = currentTime - lastTime;

      if (timeDelta > 0) {
        const velocity = Math.abs(currentScrollY - lastScrollY) / timeDelta;
        if (velocity > 2.5) {
          setIsInstant(true);
          setIsVisible(true);
          if (sectionId) revealedSectionsCache.add(sectionId);
          el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
        }
      }

      lastScrollY = currentScrollY;
      lastTime = currentTime;

      const currentRect = el.getBoundingClientRect();
      if (currentRect.top < window.innerHeight && currentRect.bottom > 0) {
        setIsVisible(true);
        if (sectionId) revealedSectionsCache.add(sectionId);
        el.classList.add("opacity-100", "translate-y-0", "revealed", "is-visible");
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sectionId, shouldReduceMotion]);

  const handleAnimationComplete = () => {
    if (sectionId) {
      revealedSectionsCache.add(sectionId);
    }
  };

  return {
    ref,
    isInstant,
    isVisible,
    handleAnimationComplete,
    containerVariants: isInstant ? instantContainerVariants : staggerContainerVariants,
    itemVariants: isInstant ? instantItemVariants : scrollRevealItemVariants,
    singleVariants: isInstant ? instantSingleBlockVariants : singleBlockVariants,
    viewportConfig: scrollRevealViewport,
    transitionClass: "transition-all duration-700 ease-out",
  };
}
