import { useEffect, useState, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { FaWhatsapp } from "react-icons/fa";
import { SITE_CONFIG } from "@/config/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp-utils";
import { CatalogCTAButton } from "@/components/ui/CatalogCTAButton";
import { cn } from "@/lib/utils";

export interface MobileStickyBarProps {
  className?: string;
}

/**
 * Barra fija móvil inferior (Spec 010, RF-07, RNF-03, Caso Límite 1, Caso Límite 3).
 *
 * Características canónicas:
 * 1. Renderizado condicional: Activa exclusivamente en pantallas móviles (< 768px)
 *    y estrictamente en la Landing Page (pathname === '/').
 * 2. Altura mínima flexible de 64px (min-h-[64px]) con superficie translúcida
 *    bg-black/80, desenfoque backdrop-blur-md y borde perimetral superior border-white/10.
 * 3. Botón WhatsApp icónico con ancho exacto e inmutable de 48px (w-12), sin texto,
 *    con área táctil mínima de 44x44px y estilo secundario.
 * 4. Botón "Ir al catálogo" (CatalogCTAButton) expandido en flex-1 con efecto shimmer.
 * 5. Área segura móvil protegida: padding-bottom acoplado a env(safe-area-inset-bottom).
 * 6. Suspensión automática en modo landscape (< 450px de altura) con re-evaluación al hacer blur.
 * 7. Suscripción a ResizeObserver para actualizar dinámicamente --bottom-bar-height.
 */
export function MobileStickyBar({ className = "" }: MobileStickyBarProps) {
  const location = useLocation();
  const barRef = useRef<HTMLDivElement>(null);
  const [isLandscape, setIsLandscape] = useState(false);

  // 1. Condición estricta de ruta: Solo en Landing Page ('/')
  const isLandingPage = location.pathname === "/";

  // 2. Detección de Modo Landscape / Viewport < 450px (Caso Límite 1)
  useEffect(() => {
    const checkLandscape = () => {
      if (typeof window === "undefined") return;
      const height = window.innerHeight;
      const isLandscapeMedia = window.matchMedia?.("(orientation: landscape)").matches;
      // Ocultar si la altura vertical es inferior a 450px o apaisado con altura reducida
      const shouldHide = height < 450 || (Boolean(isLandscapeMedia) && height < 500);
      setIsLandscape(shouldHide);
    };

    checkLandscape();
    window.addEventListener("resize", checkLandscape);
    window.addEventListener("orientationchange", checkLandscape);
    // Caso Límite 1: Re-evaluación dinámica ante evento blur del teclado virtual
    window.addEventListener("blur", checkLandscape);
    window.addEventListener("focus", checkLandscape);

    return () => {
      window.removeEventListener("resize", checkLandscape);
      window.removeEventListener("orientationchange", checkLandscape);
      window.removeEventListener("blur", checkLandscape);
      window.removeEventListener("focus", checkLandscape);
    };
  }, []);

  // 3. Medición dinámica por ResizeObserver para layout compensatorio (RF-07, TASK-15)
  useEffect(() => {
    if (!isLandingPage || isLandscape) {
      if (typeof document !== "undefined") {
        document.documentElement.style.removeProperty("--bottom-bar-height");
      }
      return;
    }

    const element = barRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height =
          (Array.isArray(entry.borderBoxSize) && entry.borderBoxSize[0]
            ? entry.borderBoxSize[0].blockSize
            : null) ??
          entry.contentRect?.height ??
          element.offsetHeight;

        if (height && height > 0) {
          document.documentElement.style.setProperty(
            "--bottom-bar-height",
            `${Math.round(height)}px`,
          );
        }
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (typeof document !== "undefined") {
        document.documentElement.style.removeProperty("--bottom-bar-height");
      }
    };
  }, [isLandingPage, isLandscape]);

  // Si no está en '/', o está en modo landscape < 450px, no se renderiza en el DOM
  if (!isLandingPage || isLandscape) {
    return null;
  }

  const generalWhatsappUrl = buildWhatsAppUrl(
    SITE_CONFIG.phone,
    SITE_CONFIG.whatsappMessages.general,
  );

  return (
    <aside
      ref={barRef}
      aria-label="Acciones rápidas inferiores"
      data-testid="mobile-sticky-bar"
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 md:hidden",
        "min-h-[64px] w-full",
        "bg-black/80 backdrop-blur-md",
        "border-t border-white/10",
        "px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]",
        "flex items-center gap-3",
        "transition-all duration-300",
        className,
      )}
      style={{
        paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Botón de WhatsApp icónico secundario: exactamente 48px de ancho (w-12), centrado y sin texto */}
      <a
        href={generalWhatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        data-testid="mobile-whatsapp-btn"
        className="flex h-11 w-12 shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-zinc-900/90 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 active:scale-95 transition-all shadow-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
      >
        <FaWhatsapp className="size-5 text-channel-support" />
        <span className="sr-only">Contactar por WhatsApp</span>
      </a>

      {/* Botón principal de acceso al catálogo: expandido en flex-1 con efecto shimmer y oscilación */}
      <CatalogCTAButton
        to="/catalogo"
        size="default"
        data-testid="mobile-catalog-btn"
        className="flex-1 h-11 w-full justify-center text-xs tracking-wider font-semibold"
      >
        Ir al catálogo
      </CatalogCTAButton>
    </aside>
  );
}

export default MobileStickyBar;
