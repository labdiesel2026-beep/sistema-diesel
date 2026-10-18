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

  it("renderiza al menos 4 tarjetas de servicios con títulos y descripciones no vacíos (RF-03)", () => {
    const { container } = render(<ServicesSection />);
    const cards = container.querySelectorAll("article");

    // Verificar que existen al menos 4 tarjetas
    expect(cards.length).toBeGreaterThanOrEqual(4);
    expect(cards.length).toBe(SITE_CONFIG.services.length);

    // Verificar que cada servicio de la configuración está presente
    for (const service of SITE_CONFIG.services) {
      expect(screen.getByText(service.title)).toBeInTheDocument();
      expect(screen.getByText(service.description)).toBeInTheDocument();
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
});
