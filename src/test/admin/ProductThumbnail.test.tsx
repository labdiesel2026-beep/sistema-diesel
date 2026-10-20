import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductThumbnail } from "@/components/admin/products/ProductThumbnail";

describe("Componente de Fallback Gráfico de Imagen (ProductThumbnail) — Tarea 8.1", () => {
  it("debe renderizar la imagen con src y alt correctos ante una URL válida (CA-06.3)", () => {
    render(<ProductThumbnail src="/uploads/amarok-20-tdi.webp" alt="Inyector Amarok 2.0 TDI" />);

    const img = screen.getByTestId("product-thumbnail-img") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("/uploads/amarok-20-tdi.webp");
    expect(img.getAttribute("alt")).toBe("Inyector Amarok 2.0 TDI");

    expect(screen.queryByTestId("product-thumbnail-fallback")).toBeNull();
  });

  it("debe conmutar automáticamente al fallback gráfico con aria-label descriptivo al disparar onError (RF-06, CA-06.3, CL-10)", () => {
    render(<ProductThumbnail src="/uploads/foto-inexistente.webp" alt="Inyector Averiado" />);

    const img = screen.getByTestId("product-thumbnail-img");
    expect(img).toBeDefined();

    // Simular error de carga de red (imagen 404 o rota)
    fireEvent.error(img);

    // La imagen rota debe desaparecer del DOM
    expect(screen.queryByTestId("product-thumbnail-img")).toBeNull();

    // El fallback visual neutro debe estar presente
    const fallback = screen.getByTestId("product-thumbnail-fallback");
    expect(fallback).toBeDefined();
    expect(fallback.getAttribute("aria-label")).toBe("Imagen no disponible");
    expect(fallback.getAttribute("role")).toBe("img");

    // Accesible mediante getByRole
    expect(screen.getByRole("img", { name: "Imagen no disponible" })).toBeDefined();
  });

  it("debe renderizar directamente el fallback gráfico cuando src es nulo, indefinido o string vacío", () => {
    const { rerender } = render(<ProductThumbnail src="" />);
    expect(screen.getByTestId("product-thumbnail-fallback")).toBeDefined();
    expect(screen.queryByTestId("product-thumbnail-img")).toBeNull();

    rerender(<ProductThumbnail src={null} />);
    expect(screen.getByTestId("product-thumbnail-fallback")).toBeDefined();

    rerender(<ProductThumbnail src={undefined} />);
    expect(screen.getByTestId("product-thumbnail-fallback")).toBeDefined();
  });

  it("debe aceptar Data URLs base64 sin arrojar errores (RF-08, CA-08.5)", () => {
    const validDataUrl =
      "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gA==";

    render(<ProductThumbnail src={validDataUrl} alt="Preview temporal" />);

    const img = screen.getByTestId("product-thumbnail-img") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe(validDataUrl);
    expect(screen.queryByTestId("product-thumbnail-fallback")).toBeNull();
  });

  it("debe restablecer el estado de renderizado si se provee una nueva URL tras un error previo", () => {
    const { rerender } = render(<ProductThumbnail src="/primera-ruta-rota.webp" />);

    const brokenImg = screen.getByTestId("product-thumbnail-img");
    fireEvent.error(brokenImg);

    expect(screen.getByTestId("product-thumbnail-fallback")).toBeDefined();

    // Cambiar la prop src por una nueva imagen
    rerender(<ProductThumbnail src="/segunda-ruta-valida.webp" />);

    // Debe reiniciar hasError e intentar renderizar el nuevo src
    const newImg = screen.getByTestId("product-thumbnail-img");
    expect(newImg).toBeDefined();
    expect(newImg.getAttribute("src")).toBe("/segunda-ruta-valida.webp");
    expect(screen.queryByTestId("product-thumbnail-fallback")).toBeNull();
  });
});
