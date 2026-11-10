import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingPage } from "@/components/landing/LandingPage";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
  useLocation: () => ({ pathname: "/" }),
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
    window.history.replaceState(null, "", "/#ubicacion");
    const { container } = render(<LandingPage />);
    const locationSection = container.querySelector<HTMLElement>("#ubicacion")!;
    const scrollIntoView = vi.fn();
    locationSection.scrollIntoView = scrollIntoView;

    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      }),
    );
  });

  it("ensambla la navegación y todas las secciones institucionales activas (RF-01 a RF-08)", () => {
    window.history.replaceState(null, "", "/");
    const { container } = render(<LandingPage />);

    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();

    for (const sectionId of ["inicio", "servicios", "garantias", "ubicacion"]) {
      expect(container.querySelector(`#${sectionId}`)).toBeInTheDocument();
    }
    expect(container.querySelector("#contacto")).not.toBeInTheDocument();

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Contactar por WhatsApp para consulta general o turnos",
      }),
    ).toBeInTheDocument();

    // Validar integración del carrusel de marcas (RF-03.1)
    expect(
      screen.getByRole("region", { name: "Marcas y sistemas de inyección atendidos" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("brands-marquee-track")).toBeInTheDocument();

    // Validar orden narrativo en <main>
    const mainElement = container.querySelector("main")!;
    const mainChildren = Array.from(mainElement.children);
    const marqueeIndex = mainChildren.findIndex((el) =>
      el.getAttribute("aria-label")?.includes("Marcas y sistemas de inyección"),
    );
    const servicesIndex = mainChildren.findIndex((el) => el.id === "servicios");
    expect(marqueeIndex).toBeGreaterThan(0);
    expect(marqueeIndex).toBeLessThan(servicesIndex);
  });
});
