import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { WarrantySection } from "@/components/landing/WarrantySection";
import { SITE_CONFIG } from "@/config/site-config";

// Mocks de medios de video y poster
vi.mock("@/assets/workshop/banco-en-vivo.mp4", () => ({
  default: "banco-en-vivo-mock.mp4",
}));
vi.mock("@/assets/workshop/inyectores-detalle.webp", () => ({
  default: "inyectores-detalle-mock.webp",
}));

describe("Sección de Garantías y Resiliencia de Video (WarrantySection.tsx)", () => {
  const originalPlay = window.HTMLMediaElement.prototype.play;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Emular HTMLMediaElement.prototype.play exitoso por defecto
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    window.HTMLMediaElement.prototype.play = originalPlay;
    window.matchMedia = originalMatchMedia;
    delete (navigator as unknown as { connection?: unknown }).connection;
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

  it("renderiza el reproductor de video HTML5 con atributos requeridos y póster (RF-01.2, CL-01)", () => {
    const { container } = render(<WarrantySection />);
    const video = container.querySelector("video");

    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "banco-en-vivo-mock.mp4");
    expect(video).toHaveAttribute("poster", "inyectores-detalle-mock.webp");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveProperty("muted", true);

    // Badge técnico dinámico activo
    expect(screen.getByText(/Ensayo en Tiempo Real/i)).toBeInTheDocument();
  });

  it("degrada automáticamente a imagen estática ante rechazo de autoplay (RF-01.2, CL-08)", async () => {
    // Simular que el navegador rechaza la promesa de autoplay (política de batería o restricciones de usuario)
    window.HTMLMediaElement.prototype.play = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error("NotAllowedError: Autoplay failed")));

    const { container } = render(<WarrantySection />);

    // Tras el rechazo de la promesa, el componente debe activar shouldFallback
    await waitFor(() => {
      expect(container.querySelector("video")).not.toBeInTheDocument();
    });

    const fallbackImg = screen.getByAltText(/Banco de ensayo y calibración de precisión Common Rail/i);
    expect(fallbackImg).toBeInTheDocument();
    expect(fallbackImg).toHaveAttribute("src", "inyectores-detalle-mock.webp");
    expect(screen.getByText(/Banco de Precisión Common Rail/i)).toBeInTheDocument();
  });

  it("muestra la imagen estática directamente si se detecta Save-Data activado (RF-01.2, RNF-02)", () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: {
        saveData: true,
        effectiveType: "4g",
      },
    });

    const { container } = render(<WarrantySection />);

    expect(container.querySelector("video")).not.toBeInTheDocument();
    const img = screen.getByAltText(/Banco de ensayo y calibración de precisión Common Rail/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "inyectores-detalle-mock.webp");
    expect(screen.getByText(/Banco de Precisión Common Rail/i)).toBeInTheDocument();
  });

  it("muestra la imagen estática directamente si la conexión es 2G o slow-2g (RF-01.2, RNF-02)", () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: {
        saveData: false,
        effectiveType: "2g",
      },
    });

    const { container } = render(<WarrantySection />);

    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(
      screen.getByAltText(/Banco de ensayo y calibración de precisión Common Rail/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Banco de Precisión Common Rail/i)).toBeInTheDocument();
  });

  it("muestra la imagen estática directamente si el usuario prefiere reducir datos (prefers-reduced-data) (RF-01.2)", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-data: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<WarrantySection />);

    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(
      screen.getByAltText(/Banco de ensayo y calibración de precisión Common Rail/i)
    ).toBeInTheDocument();
  });

  it("conmuta a la imagen de fallback ante evento de error en la reproducción del video (RF-01.2)", () => {
    const { container } = render(<WarrantySection />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();

    // Disparar error de carga o decodificación
    fireEvent.error(video!);

    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(
      screen.getByAltText(/Banco de ensayo y calibración de precisión Common Rail/i)
    ).toBeInTheDocument();
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

