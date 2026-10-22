import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PoliciesModal } from "@/components/policies/PoliciesModal";
import { SITE_CONFIG } from "@/config/site-config";
import {
  POLICIES_STORAGE_KEY,
  POLICIES_CONSENT_EVENT,
  getPoliciesConsent,
} from "@/components/policies/policies-consent";

describe("Componente PoliciesModal (PoliciesModal.tsx)", () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event(POLICIES_CONSENT_EVENT));
  });

  it("renderiza el diálogo con los 4 ejes normativos completos cuando open=true (RF-04.1, RF-04.4)", () => {
    render(<PoliciesModal open={true} onOpenChange={vi.fn()} />);

    // Título principal
    expect(
      screen.getByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).toBeInTheDocument();

    // Validar los 4 ejes completos
    for (const policy of SITE_CONFIG.commercialPolicies.axes) {
      expect(screen.getByText(new RegExp(policy.shortTitle, "i"))).toBeInTheDocument();
      expect(screen.getByText(policy.content)).toBeInTheDocument();
    }
  });

  it("si no hay consentimiento previo, muestra botón 'Aceptar y Continuar' que persiste y cierra el modal (RF-04.2, RF-04.4)", () => {
    const handleOpenChange = vi.fn();
    render(<PoliciesModal open={true} onOpenChange={handleOpenChange} />);

    const acceptBtn = screen.getByRole("button", { name: /Aceptar y Continuar/i });
    expect(acceptBtn).toBeInTheDocument();

    act(() => {
      acceptBtn.click();
    });

    // Validar persistencia en localStorage
    const consent = getPoliciesConsent();
    expect(consent.accepted).toBe(true);
    expect(consent.version).toBe(1);

    // Validar que se solicita cerrar el modal
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("si ya existe consentimiento previo, muestra la insignia 'Políticas comerciales aceptadas previamente' (RF-04.4)", () => {
    localStorage.setItem(
      POLICIES_STORAGE_KEY,
      JSON.stringify({ version: 1, accepted: true, timestamp: Date.now() }),
    );

    const handleOpenChange = vi.fn();
    render(<PoliciesModal open={true} onOpenChange={handleOpenChange} />);

    expect(
      screen.getByText(/Políticas comerciales aceptadas previamente/i),
    ).toBeInTheDocument();

    // Botón de cierre
    const closeBtn = screen.getByRole("button", { name: /Cerrar políticas/i });
    expect(closeBtn).toBeInTheDocument();

    act(() => {
      closeBtn.click();
    });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("no renderiza el contenido del diálogo si open=false", () => {
    render(<PoliciesModal open={false} onOpenChange={vi.fn()} />);

    expect(
      screen.queryByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).not.toBeInTheDocument();
  });
});
