import { describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SITE_CONFIG } from "@/config/site-config";

// Mock de Link de TanStack Router
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
}));

describe("Pie de Página Institucional (LandingFooter.tsx)", () => {
  it("contiene el año actual calculado dinámicamente y el nombre del taller (RF-08)", () => {
    render(<LandingFooter />);
    const expectedYear = new Date().getFullYear().toString();

    const copyrightText = screen.getByText(
      new RegExp(`© ${expectedYear} ${SITE_CONFIG.name}`, "i"),
    );
    expect(copyrightText).toBeInTheDocument();
  });

  it("renderiza la dirección física centralizada sin hardcodear (RF-08, RNF-06)", () => {
    render(<LandingFooter />);

    expect(screen.getByText(SITE_CONFIG.address)).toBeInTheDocument();
  });

  it("duplica los enlaces áncora de navegación principal para accesibilidad (RF-08)", () => {
    const { container } = render(<LandingFooter />);

    for (const link of SITE_CONFIG.navLinks) {
      const anchor = container.querySelector(`footer a[href="${link.href}"]`);
      expect(anchor).toBeInTheDocument();
    }
  });

  it("ofrece un enlace directo al catálogo (/catalogo) (RF-08)", () => {
    render(<LandingFooter />);

    const catalogLink = screen.getByRole("link", {
      name: /Explorar Catálogo Completo/i,
    });
    expect(catalogLink).toBeInTheDocument();
    expect(catalogLink).toHaveAttribute("href", "/catalogo");
  });

  it("renderiza el botón de 'Políticas de Garantía y Cotización' y abre el modal al accionarlo (RF-04.4)", () => {
    render(<LandingFooter />);

    const policyButtons = screen.getAllByRole("button", {
      name: new RegExp(SITE_CONFIG.commercialPolicies.footerLinkText, "i"),
    });

    expect(policyButtons.length).toBeGreaterThanOrEqual(1);

    // Al hacer clic en el botón de políticas
    act(() => {
      policyButtons[0]!.click();
    });

    // El modal dialog debe abrirse
    expect(
      screen.getByRole("heading", { level: 2, name: /Políticas Comerciales y de Garantía/i }),
    ).toBeInTheDocument();
  });

  it("invoca onOpenPoliciesModal si se proporciona como prop", () => {
    const handleOpen = vi.fn();
    render(<LandingFooter onOpenPoliciesModal={handleOpen} />);

    const policyButtons = screen.getAllByRole("button", {
      name: new RegExp(SITE_CONFIG.commercialPolicies.footerLinkText, "i"),
    });

    act(() => {
      policyButtons[0]!.click();
    });

    expect(handleOpen).toHaveBeenCalledTimes(1);
  });

  it("incluye la mención institucional de GEPI SOFTWARE con target='_self' (RF-06)", () => {
    render(<LandingFooter />);

    const gepiLink = screen.getByRole("link", { name: "GEPI SOFTWARE" });
    expect(gepiLink).toBeInTheDocument();
    expect(gepiLink).toHaveAttribute("href", "https://www.gepisoftware.com");
    expect(gepiLink).toHaveAttribute("target", "_self");
    expect(screen.getByText(/Desarrollada por/i)).toBeInTheDocument();
  });

  it("no contiene clases cromáticas azules residuales en su marcado (RF-06)", () => {
    const { container } = render(<LandingFooter />);
    const htmlContent = container.innerHTML;

    expect(htmlContent).not.toMatch(/blue-/);
  });

  it("renderiza el enlace 'Volver arriba' con su diseño y tipografía original", () => {
    render(<LandingFooter />);

    const backToTopLink = screen.getByRole("link", { name: /Volver arriba de la página/i });
    expect(backToTopLink).toBeInTheDocument();
    expect(backToTopLink.className).toContain("font-mono");
    expect(backToTopLink.className).toContain("uppercase");
    expect(backToTopLink.className).toContain("text-zinc-500");
    expect(backToTopLink.className).toContain("hover:text-white");
    expect(backToTopLink.className).not.toContain("border-white/20");
  });
});
