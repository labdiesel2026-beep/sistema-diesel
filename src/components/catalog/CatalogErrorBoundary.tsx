/**
 * Error Boundary y Vista Funcional de Error del Catálogo de Repuestos Diésel.
 * (Spec 003, RF-02, docs/constitution.md §6 - Principio 6: Errores Opacos, Tarea T-16)
 *
 * Características:
 * - Captura errores de red y excepciones de componentes sin romper la aplicación.
 * - Mensaje amigable estándar en español: "Error temporal al cargar el catálogo".
 * - Principio 6 (Errores Opacos): Oculta estrictamente trazas técnicas, consultas SQL
 *   o detalles internos del servidor/base de datos.
 * - Provee botón accesible de reintento que resetea el estado y re-ejecuta la carga.
 */

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CatalogErrorViewProps {
  onRetry?: () => void;
  className?: string;
}

/**
 * Vista visual de error para renderizado directo o como fallback.
 */
export function CatalogErrorView({ onRetry, className = "" }: CatalogErrorViewProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-xs sm:p-12 ${className}`}
      data-testid="catalog-error-state"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-7 stroke-[1.75]" />
      </div>

      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Error temporal al cargar el catálogo
      </h2>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        No pudimos conectar con el servidor para obtener los inyectores y repuestos diésel. Por
        favor verificá tu conexión o intentá nuevamente en unos instantes.
      </p>

      {onRetry && (
        <div className="mt-6">
          <Button
            variant="default"
            onClick={onRetry}
            className="h-11 gap-2 px-6 font-semibold shadow-xs"
            data-testid="retry-button"
            aria-label="Reintentar carga del catálogo"
          >
            <RotateCcw className="size-4" />
            <span>Reintentar</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export interface CatalogErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface CatalogErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Componente ErrorBoundary para envolver la grilla y vistas del catálogo.
 */
export class CatalogErrorBoundary extends Component<
  CatalogErrorBoundaryProps,
  CatalogErrorBoundaryState
> {
  constructor(props: CatalogErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): CatalogErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Registro interno seguro en consola (nunca se expone al DOM del usuario)
    console.error("[CatalogErrorBoundary] Error capturado:", error.message, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <CatalogErrorView onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

export default CatalogErrorBoundary;
