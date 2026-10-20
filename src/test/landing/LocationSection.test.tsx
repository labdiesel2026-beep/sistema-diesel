import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationSection } from "@/components/landing/LocationSection";
import { SITE_CONFIG } from "@/config/site-config";

describe("Sección de Ubicación y Mapa (LocationSection.tsx)", () => {
  it("renderiza el contenedor con id='ubicacion' y clase 'scroll-mt-20' (RF-05)", () => {
    const { container } = render(<LocationSection />);
    const section = container.querySelector("section#ubicacion");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("scroll-mt-20");
  });

  it("muestra la dirección física exacta en texto plano y los horarios de atención (RF-05, RNF-06)", () => {
    render(<LocationSection />);

    // Dirección física exacta
    expect(screen.getByText(SITE_CONFIG.address)).toBeInTheDocument();

    // Horarios de atención
    expect(screen.getByText(SITE_CONFIG.businessHours)).toBeInTheDocument();
  });

  it("renderiza el elemento iframe de Google Maps Embed con la URL configurada (RF-05)", () => {
    const { container } = render(<LocationSection />);
    const iframe = container.querySelector("iframe");

    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("src")).toBe(SITE_CONFIG.googleMapsEmbedUrl);
    expect(iframe).toHaveAttribute("title", "Mapa de ubicación del taller Laboratorio Diésel");
  });

  it("ofrece un enlace accesible de fallback 'Cómo llegar' hacia Google Maps (CL-01)", () => {
    render(<LocationSection />);

    const fallbackLink = screen.getByRole("link", {
      name: /Cómo llegar en Google Maps/i,
    });

    expect(fallbackLink).toBeInTheDocument();
    expect(fallbackLink).toHaveAttribute("target", "_blank");
    expect(fallbackLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(fallbackLink).toHaveAttribute("href", SITE_CONFIG.googleMapsDirectionsUrl);
  });
});
