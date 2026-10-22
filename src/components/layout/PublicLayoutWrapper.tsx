import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface PublicLayoutWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Envoltorio de maquetación para vistas públicas (Landing, Catálogo, Detalle y Carrito).
 * (Spec 009, RF-01, RF-12, Spec 010, RF-07, Caso Límite 3, TASK-15)
 *
 * Características:
 * - Inyecta la clase `dark` de forma determinista y sincrónica para activar los tokens semánticos OKLCH oscuros.
 * - En `pathname === '/'` (Landing Page), aplica el relleno compensatorio dinámico para la barra fija móvil:
 *   padding-bottom: calc(var(--bottom-bar-height, 64px) + env(safe-area-inset-bottom))
 * - En rutas secundarias (/catalogo, /admin, etc.), este padding no se aplica.
 */
export function PublicLayoutWrapper({ children, className = "" }: PublicLayoutWrapperProps) {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div
      className={cn(
        "dark min-h-screen bg-background text-foreground antialiased selection:bg-white/20 selection:text-white",
        isLandingPage && "landing-bottom-bar-pad pb-[calc(var(--bottom-bar-height,64px)+env(safe-area-inset-bottom,0px))]",
        className,
      )}
      style={
        isLandingPage
          ? {
              paddingBottom:
                "calc(var(--bottom-bar-height, 64px) + env(safe-area-inset-bottom, 0px))",
            }
          : undefined
      }
      data-testid="public-layout-wrapper"
    >
      {children}
    </div>
  );
}

export default PublicLayoutWrapper;
