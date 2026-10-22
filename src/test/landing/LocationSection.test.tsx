import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationSection } from "@/components/landing/LocationSection";
import { SITE_CONFIG } from "@/config/site-config";

// Mock de imagen de fachada
vi.mock("@/assets/workshop/fachada-local.webp", () => ({
  default: "fachada-local-mock.webp",
}));

describe("Sección de Ubicación y Mapa (LocationSection.tsx)", () => {
  it("renderiza el contenedor con id='ubicacion' y clase 'scroll-mt-20' (RF-05)", () => {
    const { container } = render(<LocationSection />);
    const section = container.querySelector("section#ubicacion");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("scroll-mt-20");
  });

  it("renderiza la estructura de 12 columnas con fotografía real de fachada e insignia técnica (RF-01.3)", () => {
    const { container } = render(<LocationSection />);

    // Grilla de 12 columnas
    const grid = container.querySelector(".lg\\:grid-cols-12");
    expect(grid).toBeInTheDocument();

    const infoCol = container.querySelector(".lg\\:col-span-5");
    const mapCol = container.querySelector(".lg\\:col-span-7");
    expect(infoCol).toBeInTheDocument();
    expect(mapCol).toBeInTheDocument();

    // Fotografía real de fachada
    const img = screen.getByAltText(
      /Fachada oficial del taller Laboratorio Diésel en Av. Pres. Perón 1215/i,
    );
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "fachada-local-mock.webp");

    // Insignia técnica flotante con numeración 1215
    expect(screen.getByText(/Local a la Calle · Pres. Perón 1215/i)).toBeInTheDocument();
  });

  it("muestra la dirección física exacta en texto plano y los horarios de atención (RF-05, RNF-06)", () => {
    render(<LocationSection />);

    // Dirección física exacta
    expect(screen.getByText(SITE_CONFIG.address)).toBeInTheDocument();

    // Horarios de atención
    expect(screen.getByText(SITE_CONFIG.businessHours)).toBeInTheDocument();
  });

  it("renderiza el elemento iframe de Google Maps Embed con altura mínima de 420px (RF-01.3, RF-05)", () => {
    const { container } = render(<LocationSection />);
    const iframe = container.querySelector("iframe");

    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("src")).toBe(SITE_CONFIG.googleMapsEmbedUrl);
    expect(iframe).toHaveAttribute("title", "Mapa de ubicación del taller Laboratorio Diésel");

    const mapContainer = iframe?.parentElement;
    expect(mapContainer?.className).toContain("min-h-[420px]");
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
