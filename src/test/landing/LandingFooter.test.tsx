import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
