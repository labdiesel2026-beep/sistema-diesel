import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { PublicPoliciesContainer } from "@/components/policies/PublicPoliciesContainer";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  POLICIES_STORAGE_KEY,
  POLICIES_CONSENT_EVENT,
  getPoliciesConsent,
} from "@/components/policies/policies-consent";
import { SITE_CONFIG } from "@/config/site-config";

// Mock de TanStack Router para contexto público
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
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => string;
  }) => select({ location: { pathname: "/" } }),
}));

// Mock de AnimatePresence para desmontaje sincrónico en jsdom
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

function PoliciesIntegrationApp() {
  return (
    <div>
      <main>
        <h1>Laboratorio Diésel - Experiencia Pública</h1>
      </main>
      <LandingFooter />
      <PublicPoliciesContainer />
    </div>
  );
}

describe("Suite de Integración: Políticas Comerciales y Banner (Policies.integration.test.tsx)", () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event(POLICIES_CONSENT_EVENT));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("(1) Flujo Completo: Render diferido a 1000ms y aceptación directa desde el banner (RF-04.2, RF-04.3)", async () => {
    render(<PoliciesIntegrationApp />);

    // Inmediatamente tras montar, el banner no existe en el DOM (prevención de Hydration Mismatch)
    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();

    // Avanzar el delay de 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // El banner se proyecta en z-45
    const banner = screen.getByRole("region", {
      name: /Aviso de políticas comerciales y de garantía/i,
    });
    expect(banner).toBeInTheDocument();
    expect(banner.className).toContain("z-45");

    // Localizar botón de aceptación en el banner
    const acceptBtn = screen.getByRole("button", { name: /Aceptar y Continuar/i });

    // Aceptar políticas
    await act(async () => {
      acceptBtn.click();
    });

    // Validar persistencia en localStorage
    const consent = getPoliciesConsent();
    expect(consent.accepted).toBe(true);
    expect(consent.version).toBe(1);

    // El banner se desmonta del DOM
    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();
  });

  it("(2) Flujo Completo: Apertura del modal desde el banner y aceptación sincronizada que cierra ambos (RF-04.3, RF-04.4, CL-11)", async () => {
    render(<PoliciesIntegrationApp />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Abrir modal desde el botón del banner
    const openModalBtn = screen.getByRole("button", { name: /Ver Políticas Completas/i });
    await act(async () => {
      openModalBtn.click();
    });

    // Validar que el modal está abierto con el título oficial y los 4 ejes
    expect(
      screen.getByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).toBeInTheDocument();

    for (const policy of SITE_CONFIG.commercialPolicies.axes) {
      expect(screen.getByText(new RegExp(policy.shortTitle, "i"))).toBeInTheDocument();
    }

    // Localizar botón "Aceptar y Continuar" en el footer del modal
    const modalAcceptBtn = screen.getByRole("button", { name: /Aceptar y Continuar/i });

    // Aceptar desde el modal
    await act(async () => {
      modalAcceptBtn.click();
    });

    // Validar persistencia Zod
    expect(getPoliciesConsent().accepted).toBe(true);

    // Validar que el modal y el banner se cerraron/desmontaron
    expect(
      screen.queryByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();
  });

  it("(3) Flujo Completo: Apertura del modal desde el footer institucional y soporte para tecla Escape (RF-04.4, CL-04)", async () => {
    render(<PoliciesIntegrationApp />);

    // Buscar enlace en el footer
    const footerPolicyButtons = screen.getAllByRole("button", {
      name: new RegExp(SITE_CONFIG.commercialPolicies.footerLinkText, "i"),
    });

    // Clic en el botón del footer
    await act(async () => {
      footerPolicyButtons[0]!.click();
    });

    // El diálogo modal se encuentra abierto
    expect(
      screen.getByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).toBeInTheDocument();

    // Presionar tecla Escape para cerrar
    act(() => {
      fireEvent.keyDown(document.activeElement || document.body, {
        key: "Escape",
        code: "Escape",
      });
    });

    // El diálogo modal debe cerrarse
    expect(
      screen.queryByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).not.toBeInTheDocument();
  });

  it("(4) Flujo Completo: Visita recurrente con consentimiento previo en localStorage (RF-04.2, RF-04.4)", async () => {
    localStorage.setItem(
      POLICIES_STORAGE_KEY,
      JSON.stringify({ version: 1, accepted: true, timestamp: Date.now() }),
    );

    render(<PoliciesIntegrationApp />);

    // Avanzar el tiempo para confirmar que el banner nunca aparece
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();

    // El enlace del footer sigue disponible y al abrir el modal muestra la insignia de consentimiento previo
    const footerPolicyButtons = screen.getAllByRole("button", {
      name: new RegExp(SITE_CONFIG.commercialPolicies.footerLinkText, "i"),
    });

    await act(async () => {
      footerPolicyButtons[0]!.click();
    });

    expect(
      screen.getByText(/Políticas comerciales aceptadas previamente/i),
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Cerrar políticas/i });
    expect(closeBtn).toBeInTheDocument();

    await act(async () => {
      closeBtn.click();
    });

    expect(
      screen.queryByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).not.toBeInTheDocument();
  });
});
