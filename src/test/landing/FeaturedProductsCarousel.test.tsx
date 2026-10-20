import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeaturedProductsCarousel } from "@/components/landing/FeaturedProductsCarousel";

// Mock de TanStack Router Link
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("Carrusel de Productos Destacados (FeaturedProductsCarousel.tsx)", () => {
  it("renderiza la sección con id='destacados' y encabezado accesible", () => {
    const { container } = render(<FeaturedProductsCarousel />);
    const section = container.querySelector("section#destacados");

    expect(section).toBeInTheDocument();
    expect(screen.getByText("Inyectores y Bombas en Stock")).toBeInTheDocument();
  });

  it("renderiza los productos destacados por defecto con códigos OEM y badges en el bucle continuo", () => {
    render(<FeaturedProductsCarousel />);

    expect(screen.getAllByText("Inyector Common Rail Bosch 0445110")[0]).toBeInTheDocument();
    expect(screen.getAllByText("OEM 0445110369")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Inyector Common Rail Delphi 28231014")[0]).toBeInTheDocument();
    expect(screen.getAllByText("OEM 28231014")[0]).toBeInTheDocument();
  });

  it("renderiza el carrusel en formato Marquee autónomo continuo con enlaces hacia el catálogo", () => {
    const { container } = render(<FeaturedProductsCarousel />);

    // Verificar indicador de actualización en tiempo real
    expect(screen.getByText("Actualización en tiempo real")).toBeInTheDocument();

    // Las tarjetas deben renderizarse duplicadas para permitir el bucle continuo (10 tarjetas en total de los 5 productos base)
    const cards = container.querySelectorAll("article");
    expect(cards.length).toBe(10);

    // Cada tarjeta cuenta con enlace directo hacia el catálogo
    const catalogLinks = screen.getAllByRole("link", {
      name: /en el catálogo oficial/i,
    });
    expect(catalogLinks.length).toBe(10);
    expect(catalogLinks[0]).toHaveAttribute("href", "/catalogo");
  });

  it("renderiza el botón CTA gigante hacia el catálogo completo (/catalogo)", () => {
    render(<FeaturedProductsCarousel />);

    const ctaLink = screen.getByRole("link", {
      name: /Ver Catálogo Completo/i,
    });

    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/catalogo");
  });
});
