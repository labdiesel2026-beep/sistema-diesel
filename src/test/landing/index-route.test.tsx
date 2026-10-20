import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingPage } from "@/routes/index";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
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

describe("Ruta principal de Landing Page", () => {
  it("desplaza a la sección al hacer clic en un enlace áncora y actualiza el hash", () => {
    window.history.replaceState(null, "", "/");
    const { container } = render(<LandingPage />);
    const servicesSection = container.querySelector<HTMLElement>("#servicios")!;
    const scrollIntoView = vi.fn();
    servicesSection.scrollIntoView = scrollIntoView;
    const mainNavigation = screen.getByRole("navigation", {
      name: "Navegación principal",
    });

    fireEvent.click(within(mainNavigation).getByRole("link", { name: "Servicios" }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(window.location.hash).toBe("#servicios");
  });

  it("desplaza a la sección indicada por el hash al cargar", async () => {
    window.history.replaceState(null, "", "/#contacto");
    const { container } = render(<LandingPage />);
    const contactSection = container.querySelector<HTMLElement>("#contacto")!;
    const scrollIntoView = vi.fn();
    contactSection.scrollIntoView = scrollIntoView;

    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      }),
    );
  });

  it("ensambla la navegación y todas las secciones institucionales (RF-01 a RF-08)", () => {
    window.history.replaceState(null, "", "/");
    const { container } = render(<LandingPage />);

    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();

    for (const sectionId of ["inicio", "servicios", "garantias", "ubicacion", "contacto"]) {
      expect(container.querySelector(`#${sectionId}`)).toBeInTheDocument();
    }

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Contactar por WhatsApp para consulta general o turnos",
      }),
    ).toBeInTheDocument();
  });
});
