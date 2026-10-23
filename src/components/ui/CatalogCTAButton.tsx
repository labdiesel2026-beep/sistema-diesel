import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CatalogCTAButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
}

/**
 * Componente Unificado de Captación de Atención ("Ver Catálogo" / "Ir al catálogo").
 * (Spec 010, RF-02, Módulo B, RNF-02, RNF-03)
 *
 * Características canónicas:
 * 1. Estructura y tipografía estáticas (sin vibraciones en Navbar, Hero ni Barra Móvil).
 * 2. Haz de luz interno (shimmer) diagonal a 45° con token canónico --shimmer-beam al 25% de ancho en ciclo de 5.2s
 *    (4.0s de reposo + 1.2s de barrido activo con aceleración ease-in-out).
 * 3. Micro-desplazamiento autónomo de flecha direccional en eje X (0px a 4px en 1.5s ease-in-out).
 * 4. Suspensión al hover/focus-visible (oculta haz y fija flecha a 4px).
 * 5. Feedback físico táctil: compresión scale-[0.98] en :active de escritorio.
 * 6. Pausa táctil inmediata al pulsar en pantallas touch.
 * 7. Suspensión automática ante inactividad de pestaña (Page Visibility API).
 * 8. Cancelación total de animaciones ante 'prefers-reduced-motion: reduce'.
 */
export const CatalogCTAButton = React.forwardRef<
  HTMLAnchorElement,
  CatalogCTAButtonProps
>(
  (
    {
      to = "/catalogo",
      label = "Ver Catálogo",
      children,
      className,
      size = "default",
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
      href,
      ...props
    },
    ref,
  ) => {
    const [isTabVisible, setIsTabVisible] = React.useState(true);
    const [isTouched, setIsTouched] = React.useState(false);

    React.useEffect(() => {
      const handleVisibilityChange = () => {
        setIsTabVisible(document.visibilityState === "visible" && !document.hidden);
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, []);

    const sizeClasses = {
      sm: "h-9 px-4 text-xs",
      default: "h-10 px-5 text-xs",
      lg: "h-12 px-7 text-sm",
    }[size];

    const isAnimationPaused = !isTabVisible || isTouched;
    const content = children ?? label;

    const baseClasses = cn(
      "group relative inline-flex items-center justify-center gap-2 select-none",
      "overflow-hidden rounded-none border border-white/20 shadow-none",
      "bg-industrial text-white font-mono uppercase tracking-widest font-semibold",
      "hover:bg-industrial-hover hover:border-white/40",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-industrial focus-visible:ring-offset-2 focus-visible:ring-offset-black",
      "active:scale-[0.98] transition-all duration-200 cursor-pointer",
      sizeClasses,
      className,
    );

    const innerContent = (
      <>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span
            className={cn(
              "absolute inset-0 block pointer-events-none animate-shimmer",
              "bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.22)] to-transparent",
              isAnimationPaused && "[animation-play-state:paused]",
              "group-hover:opacity-0 group-focus-visible:opacity-0 group-active:opacity-0 transition-opacity duration-200",
            )}
            style={{ width: "200%", height: "200%", top: "-50%", left: "-50%" }}
          />
        </span>

        {/* 2. Etiqueta Estática de Contenido */}
        <span className="relative z-10 flex items-center">{content}</span>

        {/* 3. Flecha Direccional de Micro-Desplazamiento Autónomo (0 a 4px en 1.5s) */}
        <ArrowRight
          aria-hidden="true"
          className={cn(
            "relative z-10 size-3.5 shrink-0 transition-transform duration-200 animate-arrow",
            isAnimationPaused && "[animation-play-state:paused]",
            "group-hover:translate-x-1 group-focus-visible:translate-x-1",
            "group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused]",
            "group-active:[animation-play-state:paused]",
          )}
        />
      </>
    );

    const handleTouchStart = (e: React.TouchEvent<HTMLAnchorElement>) => {
      setIsTouched(true);
      onTouchStart?.(e);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLAnchorElement>) => {
      setIsTouched(false);
      onTouchEnd?.(e);
    };

    const handleTouchCancel = (e: React.TouchEvent<HTMLAnchorElement>) => {
      setIsTouched(false);
      onTouchCancel?.(e);
    };

    if (to) {
      return (
        <Link
          to={to}
          ref={ref}
          className={baseClasses}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          {...(props as any)}
        >
          {innerContent}
        </Link>
      );
    }

    return (
      <a
        ref={ref}
        href={href ?? "#catalogo"}
        className={baseClasses}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        {...props}
      >
        {innerContent}
      </a>
    );
  },
);

CatalogCTAButton.displayName = "CatalogCTAButton";

export default CatalogCTAButton;
