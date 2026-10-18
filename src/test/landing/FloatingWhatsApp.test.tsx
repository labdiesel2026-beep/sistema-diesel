import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { SITE_CONFIG } from "@/config/site-config";

describe("Botón Flotante de WhatsApp (FloatingWhatsApp.tsx)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.innerWidth = 1024; // Default desktop
  });

  it("renderiza el botón fijo en la esquina inferior derecha con las clases 'fixed bottom-6 right-6 z-50' (RF-07)", () => {
    const { container } = render(<FloatingWhatsApp />);
    const aside = container.querySelector("aside");

    expect(aside).toBeInTheDocument();
    expect(aside?.className).toContain("fixed");
    expect(aside?.className).toContain("bottom-6");
    expect(aside?.className).toContain("right-6");
    expect(aside?.className).toContain("z-50");
  });

  it("contiene el enlace de WhatsApp con el mensaje de consulta general pre-formateado (RF-07)", () => {
    render(<FloatingWhatsApp />);

    const link = screen.getByRole("link", {
      name: /Contactar por WhatsApp para consulta general o turnos/i,
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    const href = link.getAttribute("href") || "";
    expect(href).toContain(`https://wa.me/${SITE_CONFIG.phone}`);
    expect(href).toContain("?text=");

    const encodedText = href.split("?text=")[1] || "";
    const decodedMessage = decodeURIComponent(encodedText);
    expect(decodedMessage).toContain(
      "Motivo: Consulta general / solicitar turno.",
    );
  });

  it("responde al IntersectionObserver ocultándose en vista móvil ante solapamiento (RF-07)", () => {
    let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void =
      () => {};

    // Mock de IntersectionObserver
    class MockIntersectionObserver {
      constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        observerCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    // Simular pantalla móvil (< 768px)
    window.innerWidth = 400;

    // Crear elementos ficticios de sección para observar
    const contactoSection = document.createElement("div");
    contactoSection.id = "contacto";
    document.body.appendChild(contactoSection);

    const { container } = render(
      <FloatingWhatsApp targetSectionIds={["contacto"]} />,
    );
    const aside = container.querySelector("aside");

    // Inicialmente visible
    expect(aside?.className).toContain("opacity-100");

    // Disparar evento de intersección (contacto visible en viewport móvil)
    act(() => {
      observerCallback([
        {
          target: contactoSection,
          isIntersecting: true,
        },
      ]);
    });

    // Ahora debe ocultarse con opacity-0 y pointer-events-none
    expect(aside?.className).toContain("opacity-0");
    expect(aside?.className).toContain("pointer-events-none");

    // Salir de la sección (isIntersecting: false)
    act(() => {
      observerCallback([
        {
          target: contactoSection,
          isIntersecting: false,
        },
      ]);
    });

    // Debe volver a mostrarse
    expect(aside?.className).toContain("opacity-100");

    document.body.removeChild(contactoSection);
  });
});
