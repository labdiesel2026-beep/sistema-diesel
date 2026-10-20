import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import { CatalogErrorBoundary, CatalogErrorView } from "@/components/catalog/CatalogErrorBoundary";
import { ApiError } from "@/lib/api";

// Componente espía para simular un fallo en tiempo de renderizado
function FaultyCatalogGrid({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new ApiError(
      "Database connection failed: SELECT * FROM products WHERE visible = true; stack: PrismaClientKnownRequestError",
      500,
      { code: "P2002", table: "products" },
    );
  }
  return <div data-testid="recovered-catalog">Grilla de productos cargada con éxito</div>;
}

// Wrapper reactivo para probar recuperación con el botón de reintento
function ErrorBoundaryHarness({ onRetryCallback }: { onRetryCallback: () => void }) {
  const [hasFailure, setHasFailure] = useState(true);

  const handleRetry = () => {
    onRetryCallback();
    setHasFailure(false);
  };

  return (
    <CatalogErrorBoundary onRetry={handleRetry}>
      <FaultyCatalogGrid shouldThrow={hasFailure} />
    </CatalogErrorBoundary>
  );
}

describe("CatalogErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silenciar error en consola de React durante la prueba
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("atrapa errores de carga y ofrece reintento sin exponer detalles", () => {
    const handleRetry = vi.fn();

    render(<ErrorBoundaryHarness onRetryCallback={handleRetry} />);

    // 1. Debe haber atrapado el error y mostrar el mensaje amigable estándar
    expect(screen.getByText("Error temporal al cargar el catálogo")).toBeInTheDocument();
    expect(
      screen.getByText(
        /No pudimos conectar con el servidor para obtener los inyectores y repuestos diésel/i,
      ),
    ).toBeInTheDocument();

    // 2. Principio 6 (Errores Opacos): NO debe exponer consultas SQL, códigos de error ni datos internos
    expect(screen.queryByText(/SELECT \* FROM/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PrismaClientKnownRequestError/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Database connection failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/P2002/i)).not.toBeInTheDocument();

    // 3. Debe proveer el botón de reintento
    const retryButton = screen.getByTestId("retry-button");
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent("Reintentar");

    // 4. Al hacer clic en reintentar, debe llamar al callback y restablecer la vista
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);

    // 5. La grilla debe haberse recuperado exitosamente
    expect(screen.getByTestId("recovered-catalog")).toBeInTheDocument();
    expect(screen.queryByText("Error temporal al cargar el catálogo")).not.toBeInTheDocument();
  });

  it("renderiza CatalogErrorView de forma directa y ejecuta onRetry", () => {
    const handleDirectRetry = vi.fn();
    render(<CatalogErrorView onRetry={handleDirectRetry} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Error temporal al cargar el catálogo")).toBeInTheDocument();

    const button = screen.getByTestId("retry-button");
    fireEvent.click(button);
    expect(handleDirectRetry).toHaveBeenCalledTimes(1);
  });
});
