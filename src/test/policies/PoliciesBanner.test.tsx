import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PoliciesBanner } from "@/components/policies/PoliciesBanner";
import {
  POLICIES_STORAGE_KEY,
  POLICIES_CONSENT_EVENT,
  getPoliciesConsent,
} from "@/components/policies/policies-consent";

// Mock de AnimatePresence para desmontaje sincrónico en jsdom
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("Componente PoliciesBanner (PoliciesBanner.tsx)", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    localStorage.clear();
    window.dispatchEvent(new Event(POLICIES_CONSENT_EVENT));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    window.history.pushState({}, "", "/");
    vi.useRealTimers();
    localStorage.clear();
  });

  it("no se muestra inmediatamente tras el montaje sino tras el delay de 1000ms (RF-04.3)", () => {
    render(<PoliciesBanner />);

    // Inmediatamente después de montar, aún no debe ser visible por el delay
    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();

    // Avanzar 1000ms en el temporizador
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Ahora sí debe estar visible en el DOM
    const banner = screen.getByRole("region", {
      name: /Aviso de políticas comerciales y de garantía/i,
    });
    expect(banner).toBeInTheDocument();
    expect(banner.className).toContain("z-50");
    expect(banner.className).toContain("bottom-24");
    expect(banner.className).toContain("md:left-6");
    expect(banner.className).toContain("md:bottom-6");
    expect(banner.className).toContain("md:max-w-md");
  });

  it("renderiza el título, resumen y los dos botones de acción (RF-04.3)", () => {
    const handleOpenModal = vi.fn();
    render(<PoliciesBanner onOpenModal={handleOpenModal} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Políticas Comerciales y Garantía/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Precios orientativos sujetos a cotización técnica\. Trabajos y componentes con garantía de 30 días/i,
      ),
    ).toBeInTheDocument();

    const acceptBtn = screen.getByRole("button", { name: /Aceptar y Continuar/i });
    const viewBtn = screen.getByRole("button", { name: /Ver Políticas Completas/i });

    expect(acceptBtn).toBeInTheDocument();
    expect(viewBtn).toBeInTheDocument();
  });

  it("al pulsar 'Aceptar y Continuar', persiste en localStorage y oculta el banner (RF-04.2, RF-04.3)", async () => {
    render(<PoliciesBanner />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const acceptBtn = screen.getByRole("button", { name: /Aceptar y Continuar/i });
    expect(acceptBtn).toBeInTheDocument();

    // Clic en aceptar
    await act(async () => {
      acceptBtn.click();
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Verificar persistencia en localStorage
    const consent = getPoliciesConsent();
    expect(consent.accepted).toBe(true);
    expect(consent.version).toBe(1);

    // El banner debe haberse desmontado
    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();
  });

  it("al pulsar 'Ver Políticas Completas', ejecuta el callback onOpenModal (RF-04.3)", async () => {
    const handleOpenModal = vi.fn();
    render(<PoliciesBanner onOpenModal={handleOpenModal} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const viewBtn = screen.getByRole("button", { name: /Ver Políticas Completas/i });
    await act(async () => {
      viewBtn.click();
    });

    expect(handleOpenModal).toHaveBeenCalledTimes(1);
  });

  it("no se renderiza si el usuario ya otorgó consentimiento previo en localStorage (RF-04.2)", () => {
    localStorage.setItem(
      POLICIES_STORAGE_KEY,
      JSON.stringify({ version: 1, accepted: true, timestamp: Date.now() }),
    );

    render(<PoliciesBanner />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();
  });

  it("no se renderiza en rutas del panel de administración /admin/* (RF-04.2)", () => {
    window.history.pushState({}, "", "/admin/productos");

    render(<PoliciesBanner />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();
  });
});
