import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PublicPoliciesContainer } from "@/components/policies/PublicPoliciesContainer";
import { POLICIES_CONSENT_EVENT } from "@/components/policies/policies-consent";

let currentTestPath = "/";

// Mock de useRouterState de TanStack Router
vi.mock("@tanstack/react-router", () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: currentTestPath } }),
}));

// Mock de AnimatePresence para desmontaje sincrónico en jsdom
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("Contenedor Global PublicPoliciesContainer (PublicPoliciesContainer.tsx)", () => {
  beforeEach(() => {
    currentTestPath = "/";
    localStorage.clear();
    window.dispatchEvent(new Event(POLICIES_CONSENT_EVENT));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("renderiza el banner en rutas públicas (ej. '/') tras 1000ms si no hay consentimiento (RF-04.2)", () => {
    currentTestPath = "/";
    render(<PublicPoliciesContainer />);

    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.getByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).toBeInTheDocument();
  });

  it("renderiza el banner en el catálogo público (/catalogo) para nuevos visitantes (RF-04.2)", () => {
    currentTestPath = "/catalogo";
    render(<PublicPoliciesContainer />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.getByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).toBeInTheDocument();
  });

  it("se auto-excluye formalmente en rutas privadas del panel de administración /admin/* (RF-04.2, CL-06)", () => {
    currentTestPath = "/admin/dashboard";
    const { container } = render(<PublicPoliciesContainer />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(container.firstChild).toBeNull();
    expect(
      screen.queryByRole("region", { name: /Aviso de políticas comerciales y de garantía/i }),
    ).not.toBeInTheDocument();
  });

  it("abre el diálogo PoliciesModal al pulsar 'Ver Políticas Completas' desde el banner (RF-04.3, RF-04.4)", async () => {
    currentTestPath = "/catalogo/123";
    render(<PublicPoliciesContainer />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const viewBtn = screen.getByRole("button", { name: /Ver Políticas Completas/i });
    expect(viewBtn).toBeInTheDocument();

    await act(async () => {
      viewBtn.click();
    });

    // El modal debe estar abierto
    expect(
      screen.getByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).toBeInTheDocument();
  });
});
