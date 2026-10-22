import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { SITE_CONFIG } from "@/config/site-config";

describe("Sección de Servicios (ServicesSection.tsx)", () => {
  it("renderiza el contenedor con id='servicios' y clase 'scroll-mt-20' (RF-03)", () => {
    const { container } = render(<ServicesSection />);
    const section = container.querySelector("section#servicios");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("scroll-mt-20");
  });

  it("renderiza la estructura de Bento Grid industrial en 12 columnas (RF-02.1)", () => {
    const { container } = render(<ServicesSection />);
    const grid = container.querySelector(".lg\\:grid-cols-12");
    expect(grid).toBeInTheDocument();

    const cardBanco = container.querySelector(".lg\\:col-span-7");
    const cardBombas = container.querySelector(".lg\\:col-span-5");
    const cardsMedias = container.querySelectorAll(".lg\\:col-span-6");

    expect(cardBanco).toBeInTheDocument();
    expect(cardBombas).toBeInTheDocument();
    expect(cardsMedias.length).toBe(2);
  });

  it("renderiza las 4 tarjetas enriquecidas fotográficamente con sus badges técnicos (RF-02.1, RF-02.2)", () => {
    const { container } = render(<ServicesSection />);
    const cards = container.querySelectorAll("article");

    expect(cards.length).toBe(SITE_CONFIG.services.length);

    for (const service of SITE_CONFIG.services) {
      // Título y descripción
      expect(screen.getByText(service.title)).toBeInTheDocument();
      expect(screen.getByText(service.description)).toBeInTheDocument();

      // Imagen con alt accesible
      const img = screen.getByAltText(service.title);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", service.image);

      // Badges técnicos
      for (const badge of service.badges) {
        expect(screen.getByText(badge)).toBeInTheDocument();
      }
    }
  });

  it("renderiza un encabezado h2 accesible para la sección", () => {
    render(<ServicesSection />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: /Soluciones para Sistemas de Inyección Diésel/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("renderiza la cláusula formal de transparencia sobre repuestos originales y alternativos (RF-02.3)", () => {
    render(<ServicesSection />);
    expect(screen.getByText(SITE_CONFIG.servicesTransparencyClause)).toBeInTheDocument();
  });
});
