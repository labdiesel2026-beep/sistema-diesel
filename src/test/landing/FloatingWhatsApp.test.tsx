import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { SITE_CONFIG } from "@/config/site-config";
import {
  POLICIES_STORAGE_KEY,
  POLICIES_CONSENT_EVENT,
} from "@/components/policies/policies-consent";

describe("Botón Flotante de WhatsApp (FloatingWhatsApp.tsx)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    window.dispatchEvent(new Event(POLICIES_CONSENT_EVENT));
    window.innerWidth = 1024; // Default desktop
  });

  it("renderiza el botón fijo en la esquina inferior derecha con las clases 'fixed right-6 z-40' (RF-07, CL-07)", () => {
    const { container } = render(<FloatingWhatsApp />);
    const aside = container.querySelector("aside");

    expect(aside).toBeInTheDocument();
    expect(aside?.className).toContain("fixed");
    expect(aside?.className).toContain("right-6");
    expect(aside?.className).toContain("z-40");
  });

  it("se desplaza dinámicamente a bottom-36 en móvil cuando el banner de políticas está desplegado (RF-04.3, CL-07)", () => {
    // Sin consentimiento en localStorage -> shouldShowBanner=true
    const { container } = render(<FloatingWhatsApp />);
    const aside = container.querySelector("aside");

    expect(aside?.className).toContain("bottom-36");
    expect(aside?.className).toContain("sm:bottom-6");
  });

  it("mantiene bottom-6 cuando el usuario ya otorgó consentimiento a las políticas (RF-04.3)", () => {
    localStorage.setItem(
      POLICIES_STORAGE_KEY,
      JSON.stringify({ version: 1, accepted: true, timestamp: Date.now() }),
    );

    const { container } = render(<FloatingWhatsApp />);
    const aside = container.querySelector("aside");

    expect(aside?.className).toContain("bottom-6");
    expect(aside?.className).not.toContain("bottom-36");
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
    expect(decodedMessage).toContain("Motivo: Consulta general / solicitar turno.");
  });

  it("responde al IntersectionObserver ocultándose en vista móvil ante solapamiento (RF-07)", () => {
    let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {};

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

    const { container } = render(
      <FloatingWhatsApp targetSectionIds={["garantias", "ubicacion"]} />,
    );
    const aside = container.querySelector("aside");

    expect(aside?.className).toContain("opacity-100");

    // Disparar evento de intersección
    act(() => {
      observerCallback([
        {
          target: { id: "garantias" } as unknown as Element,
          isIntersecting: true,
        },
      ]);
    });

    expect(aside?.className).toContain("opacity-0");
    expect(aside?.className).toContain("pointer-events-none");

    // Disparar evento de salida
    act(() => {
      observerCallback([
        {
          target: { id: "garantias" } as unknown as Element,
          isIntersecting: false,
        },
      ]);
    });

    expect(aside?.className).toContain("opacity-100");
  });
});
