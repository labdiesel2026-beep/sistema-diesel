import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/landing/HeroSection";
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

// Mock de la imagen de assets
vi.mock("@/assets/diesel-injector.jpg", () => ({
  default: "diesel-injector-mock.jpg",
}));

describe("Sección Hero (HeroSection.tsx)", () => {
  it("renderiza el contenedor con id='inicio' y altura 'min-h-[100dvh]' (RF-02, RNF-02)", () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector("section#inicio");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("min-h-[100dvh]");
  });

  it("muestra la denominación tipográfica 'Laboratorio Diésel' y el eslogan estático (RF-02)", () => {
    render(<HeroSection />);

    expect(screen.getByText(SITE_CONFIG.name)).toBeInTheDocument();
    expect(screen.getByText(SITE_CONFIG.tagline)).toBeInTheDocument();
  });

  it("renderiza todas las propuestas de valor requeridas por el cliente (RF-02)", () => {
    render(<HeroSection />);

    for (const prop of SITE_CONFIG.valueProps) {
      expect(screen.getByText(prop)).toBeInTheDocument();
    }
  });

  it("contiene los dos CTAs con los atributos href correctos (/catalogo y #contacto) (RF-02)", () => {
    render(<HeroSection />);

    // CTA Principal al Catálogo
    const catalogCta = screen.getByRole("link", {
      name: /Ver Catálogo de Inyectores/i,
    });
    expect(catalogCta).toBeInTheDocument();
    expect(catalogCta).toHaveAttribute("href", "/catalogo");

    // CTA Secundario a Contacto
    const contactCta = screen.getByRole("link", {
      name: /Contactar al Taller/i,
    });
    expect(contactCta).toBeInTheDocument();
    expect(contactCta).toHaveAttribute("href", "#contacto");
  });
});
