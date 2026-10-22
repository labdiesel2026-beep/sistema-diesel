import type { ReactNode } from "react";

export interface PublicLayoutWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Envoltorio de maquetación para vistas públicas (Landing, Catálogo, Detalle y Carrito).
 * (Spec 009, RF-01, RF-12, Bloque 1 - Tarea 1.2)
 *
 * Características:
 * - Inyecta la clase `dark` de forma determinista y sincrónica para activar los tokens semánticos OKLCH oscuros.
 * - Aísla el árbol público protegiendo el tema claro nativo de `:root` para el Panel de Administración (/admin).
 * - Erradica el FOUC (Flash of Unstyled Content) durante SSR e hidratación al no depender de lecturas asíncronas.
 */
export function PublicLayoutWrapper({ children, className = "" }: PublicLayoutWrapperProps) {
  return (
    <div
      className={`dark min-h-screen bg-background text-foreground antialiased selection:bg-white/20 selection:text-white ${className}`}
      data-testid="public-layout-wrapper"
    >
      {children}
    </div>
  );
}

export default PublicLayoutWrapper;
