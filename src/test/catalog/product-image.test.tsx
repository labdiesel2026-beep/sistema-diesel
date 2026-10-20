import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductImageWithFallback } from "@/components/catalog/ProductImageWithFallback";

describe("Product Image with Accessible Fallback (T-12)", () => {
  it("renderiza imagen resuelta o placeholder SVG local accesible ante fallo", () => {
    // 1. Caso con URL válida: debe renderizar la etiqueta <img> con la URL resuelta
    const { unmount } = render(
      <ProductImageWithFallback src="/uploads/amarok-20-tdi.webp" alt="Inyector Amarok 2.0 TDI" />,
    );

    const imgElement = screen.getByRole("img");
    expect(imgElement.tagName.toLowerCase()).toBe("img");
    expect(imgElement).toHaveAttribute("alt", "Inyector Amarok 2.0 TDI");
    expect(imgElement.getAttribute("src")).toContain("/uploads/amarok-20-tdi.webp");

    unmount();

    // 2. Caso con ausencia de imagen (null o vacío): debe renderizar el placeholder accesible
    const { unmount: unmountEmpty } = render(
      <ProductImageWithFallback src={null} alt="Inyector Sin Foto" />,
    );

    const fallbackElement = screen.getByRole("img");
    expect(fallbackElement.tagName.toLowerCase()).toBe("div");
    expect(fallbackElement).toHaveAttribute(
      "aria-label",
      "Imagen no disponible para Inyector Sin Foto",
    );
    expect(screen.getByText("Imagen no disponible")).toBeInTheDocument();

    unmountEmpty();

    // 3. Caso con URL que falla al cargar (disparo de onError): debe alternar al fallback
    render(
      <ProductImageWithFallback
        src="https://servidor-caido.com/foto-inexistente.webp"
        alt="Inyector Roto"
      />,
    );

    const imgToFail = screen.getByTestId("product-image");
    fireEvent.error(imgToFail);

    // Tras el fallo, debe aparecer el placeholder SVG accesible
    const errorFallback = screen.getByTestId("product-image-fallback");
    expect(errorFallback).toBeInTheDocument();
    expect(errorFallback).toHaveAttribute("aria-label", "Imagen no disponible para Inyector Roto");
    expect(screen.getByText("Imagen no disponible")).toBeInTheDocument();
  });
});
