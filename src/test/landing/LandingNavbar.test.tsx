import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";

// Mock del Link de TanStack Router para permitir testing aislado del componente
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

describe("Barra de Navegación (LandingNavbar.tsx)", () => {
  it("renderiza la denominación tipográfica 'Laboratorio Diésel' y NO contiene etiquetas <img> (RF-01, DA-03)", () => {
    const { container } = render(<LandingNavbar />);

    // Verificar presencia del texto de denominación
    expect(screen.getByText("Laboratorio")).toBeInTheDocument();
    expect(screen.getByText("Diésel")).toBeInTheDocument();

    // Regla estricta: No debe existir ningún elemento <img> (no hay logotipo gráfico)
    const images = container.querySelectorAll("img");
    expect(images.length).toBe(0);
  });

  it("renderiza los 5 enlaces áncora de navegación y el enlace a /catalogo (RF-01)", () => {
    render(<LandingNavbar />);

    // Enlaces áncora requeridos por RF-01
    const expectedAnchors = [
      "#inicio",
      "#servicios",
      "#garantias",
      "#ubicacion",
      "#contacto",
    ];

    for (const anchor of expectedAnchors) {
      const anchorElement = document.querySelector(`a[href="${anchor}"]`);
      expect(anchorElement).toBeInTheDocument();
    }

    // Enlace al catálogo
    const catalogLink = document.querySelector('a[href="/catalogo"]');
    expect(catalogLink).toBeInTheDocument();
    expect(catalogLink).toHaveTextContent(/Ver Catálogo/i);
  });

  it("conmuta el menú móvil al hacer clic en el botón hamburguesa (RF-01)", () => {
    render(<LandingNavbar />);

    const menuButton = screen.getByRole("button", {
      name: /Abrir menú de navegación/i,
    });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    // Inicialmente el contenedor de navegación móvil no está en el DOM
    expect(screen.queryByRole("navigation", { name: /Menú móvil/i })).not.toBeInTheDocument();

    // Clic para abrir el menú móvil
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: /Menú móvil/i })).toBeInTheDocument();

    // Clic nuevamente para cerrar
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: /Menú móvil/i })).not.toBeInTheDocument();
  });

  it("cierra el menú móvil al hacer clic en un enlace de navegación (RF-01)", () => {
    render(<LandingNavbar />);

    const menuButton = screen.getByRole("button", {
      name: /Abrir menú de navegación/i,
    });

    // Abrir menú
    fireEvent.click(menuButton);
    const mobileNav = screen.getByRole("navigation", { name: /Menú móvil/i });
    expect(mobileNav).toBeInTheDocument();

    // Clic en un enlace dentro del menú móvil
    const mobileServicesLink = mobileNav.querySelector('a[href="#servicios"]')!;
    fireEvent.click(mobileServicesLink);

    // Debe haberse cerrado el menú
    expect(screen.queryByRole("navigation", { name: /Menú móvil/i })).not.toBeInTheDocument();
  });
});
