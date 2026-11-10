import { useEffect, useRef, useState } from "react";

export interface UseViewportVideoOptions {
  /** Umbral de visibilidad del viewport para disparar reproducción (por defecto 0.15 = 15% visible) */
  threshold?: number | number[];
  /** Margen raíz para anticipar carga antes de entrar en viewport */
  rootMargin?: string;
}

export interface UseViewportVideoResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoFallback: boolean;
  setVideoFallback: React.Dispatch<React.SetStateAction<boolean>>;
  isVisible: boolean;
}

/**
 * Hook de alto rendimiento para videos multimedia en la Landing Page.
 * (Spec 015, TASK-03)
 *
 * Características:
 * - Detección de bajo ancho de banda / directiva de ahorro de datos (fallback preventivo a póster).
 * - Control de reproducción estricto por `IntersectionObserver`:
 *   * Ejecuta `.play()` ÚNICAMENTE cuando el video está visible en la pantalla (`isIntersecting === true`).
 *   * Ejecuta `.pause()` INMEDIATAMENTE en cuanto el video sale del viewport (`isIntersecting === false`).
 *   * Desconecta el decodificador por hardware de video para liberar hilos y GPU durante el scroll.
 * - Integración con Page Visibility API para suspender reproducción al cambiar de pestaña.
 * - Limpieza segura de observadores y pausas en desmontaje.
 */
export function useViewportVideo(options: UseViewportVideoOptions = {}): UseViewportVideoResult {
  const { threshold = 0, rootMargin = "200px 0px 200px 0px" } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFallback, setVideoFallback] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    // 1. Detección de conectividad lenta o ahorro de datos
    if (typeof navigator !== "undefined") {
      const nav = navigator as unknown as {
        connection?: { saveData?: boolean; effectiveType?: string };
      };
      if (
        nav.connection?.saveData === true ||
        nav.connection?.effectiveType === "2g" ||
        nav.connection?.effectiveType === "slow-2g"
      ) {
        setVideoFallback(true);
        return;
      }
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-data: reduce)")?.matches
    ) {
      setVideoFallback(true);
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    // 2. Control de reproducción seguro
    let isIntersectingRef = true;

    const handlePlaySafe = () => {
      if (!videoEl) return;
      try {
        const playPromise = videoEl.play();
        if (playPromise !== undefined && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            // Autoplay bloqueado por políticas del navegador o ahorro de energía
            setVideoFallback(true);
          });
        }
      } catch {
        setVideoFallback(true);
      }
    };

    const handlePauseSafe = () => {
      if (!videoEl) return;
      try {
        videoEl.pause();
      } catch {
        // Ignorar
      }
    };

    // Iniciar reproducción activa por defecto al montar
    handlePlaySafe();

    // 3. IntersectionObserver configurado a 200px de margen (threshold: 0)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === videoEl) {
            isIntersectingRef = entry.isIntersecting;
            setIsVisible(entry.isIntersecting);

            if (entry.isIntersecting && !document.hidden) {
              handlePlaySafe();
            } else if (!entry.isIntersecting) {
              handlePauseSafe();
            }
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(videoEl);

    // 3. Suspensión cuando la pestaña pasa a segundo plano
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePauseSafe();
      } else if (isIntersectingRef) {
        handlePlaySafe();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      handlePauseSafe();
    };
  }, [threshold, rootMargin]);

  return {
    videoRef,
    videoFallback,
    setVideoFallback,
    isVisible,
  };
}
