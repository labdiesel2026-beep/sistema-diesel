import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WarrantySection } from "@/components/landing/WarrantySection";
import { SITE_CONFIG } from "@/config/site-config";

// Mocks de medios de video y poster
vi.mock("@/assets/workshop/2doBanco.mp4", () => ({
  default: "2doBanco-mock.mp4",
}));
vi.mock("@/assets/workshop/inyectores-detalle.webp", () => ({
  default: "inyectores-detalle-mock.webp",
}));

describe("Sección de Garantías y Video Permanente de Bancos (WarrantySection.tsx)", () => {
  const originalPlay = window.HTMLMediaElement.prototype.play;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Emular HTMLMediaElement.prototype.play exitoso por defecto
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    window.HTMLMediaElement.prototype.play = originalPlay;
  });

  it("renderiza el contenedor con id='garantias' y clase 'scroll-mt-20' (RF-04)", () => {
    const { container } = render(<WarrantySection />);
    const section = container.querySelector("section#garantias");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("scroll-mt-20");
  });

  it("estructura la sección en dos columnas en desktop (lg:grid-cols-12, 7/5) (RF-01.2)", () => {
    const { container } = render(<WarrantySection />);
    const grid = container.querySelector(".lg\\:grid-cols-12");
    expect(grid).toBeInTheDocument();

    const infoCol = container.querySelector(".lg\\:col-span-7");
    const mediaCol = container.querySelector(".lg\\:col-span-5");

    expect(infoCol).toBeInTheDocument();
    expect(mediaCol).toBeInTheDocument();
  });

  it("renderiza permanentemente el reproductor de video HTML5 con atributos de autoplay y aislamiento GPU", () => {
    const { container } = render(<WarrantySection />);
    const video = container.querySelector("video");

    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "2doBanco-mock.mp4");
    expect(video).toHaveAttribute("poster", "inyectores-detalle-mock.webp");
    expect(video).toHaveAttribute("preload", "auto");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveProperty("muted", true);
    expect(video?.className).toContain("transform-gpu");
    expect(video?.className).toContain("will-change-transform");

    // Badge técnico dinámico activo
    expect(screen.getByText(/Ensayo en Tiempo Real/i)).toBeInTheDocument();
  });

  it("mantiene el elemento <video> en el DOM garantizando reproducción activa", () => {
    const { container } = render(<WarrantySection />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video?.tagName.toLowerCase()).toBe("video");
  });

  it("muestra el título, resumen y todos los detalles de garantía institucional (RF-04)", () => {
    render(<WarrantySection />);

    expect(screen.getByText(SITE_CONFIG.warrantyTerms.title)).toBeInTheDocument();
    expect(screen.getByText(SITE_CONFIG.warrantyTerms.summary)).toBeInTheDocument();

    for (const detail of SITE_CONFIG.warrantyTerms.details) {
      expect(screen.getByText(detail)).toBeInTheDocument();
    }
  });

  it("el botón contiene el enlace a wa.me con el teléfono oficial y mensaje de garantía codificado (RF-04)", () => {
    render(<WarrantySection />);

    const warrantyLink = screen.getByRole("link", {
      name: /Solicitar Garantía \/ Soporte/i,
    });

    expect(warrantyLink).toBeInTheDocument();
    expect(warrantyLink).toHaveAttribute("target", "_blank");
    expect(warrantyLink).toHaveAttribute("rel", "noopener noreferrer");

    const href = warrantyLink.getAttribute("href") || "";
    expect(href).toContain(`https://wa.me/${SITE_CONFIG.phone}`);
    expect(href).toContain("?text=");

    // Decodificar el mensaje para verificar contenido exacto
    const encodedText = href.split("?text=")[1] || "";
    const decodedMessage = decodeURIComponent(encodedText);
    expect(decodedMessage).toContain("Motivo: Consulta por garantía / soporte post-venta.");
  });
});
