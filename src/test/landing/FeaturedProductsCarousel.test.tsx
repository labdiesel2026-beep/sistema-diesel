import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { FeaturedProductsCarousel } from "@/components/landing/FeaturedProductsCarousel";
import * as landingService from "@/services/landing.service";
import type { FeaturedProductItem } from "@/services/landing.service";

// Mock de TanStack Router Link para pruebas unitarias
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    params?: { productId?: string };
    [key: string]: unknown;
  }) => {
    let href = to;
    if (params?.productId && to.includes("$productId")) {
      href = to.replace("$productId", params.productId);
    }
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

describe("Carrusel de Productos Destacados (FeaturedProductsCarousel.tsx) — Tarea 8.4", () => {
  const mockFeaturedProducts: FeaturedProductItem[] = [
    {
      id: "prod-hilux-001",
      name: "Inyector Common Rail Bosch 0445110",
      brandName: "Bosch",
      oem: "0445110369",
      condition: "Nuevo",
      price: 320000,
      showPrice: true,
      vehicleCompatibility: "Toyota Hilux 2.8 / 3.0 D-4D",
      imageUrl: "/uploads/hilux.webp",
    },
    {
      id: "prod-ranger-002",
      name: "Inyector Common Rail Delphi 28231014",
      brandName: "Delphi",
      oem: "28231014",
      condition: "Reacondicionado",
      price: 245000,
      showPrice: true,
      vehicleCompatibility: "Ford Ranger 2.2 TDCi Puma",
      imageUrl: "/uploads/ranger.webp",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el contenedor skeleton con altura de reserva mínima anti-CLS durante la carga (CA-07.1)", async () => {
    // Promesa pendiente para mantener el estado isLoading
    vi.spyOn(landingService, "fetchFeaturedProducts").mockImplementation(
      () => new Promise(() => {}),
    );

    render(<FeaturedProductsCarousel />);

    const skeleton = screen.getByTestId("featured-carousel-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.className).toContain("min-h-[460px]");
    expect(screen.queryByTestId("featured-products-section")).not.toBeInTheDocument();
  });

  it("desmonta silenciosamente la sección si la API responde con 0 elementos (RF-07, CA-07.2, CL-01)", async () => {
    vi.spyOn(landingService, "fetchFeaturedProducts").mockResolvedValue([]);

    const { container } = render(<FeaturedProductsCarousel />);

    await waitFor(() => {
      // Debe desmontar la sección retornando null
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("featured-products-section")).not.toBeInTheDocument();
      expect(screen.queryByTestId("featured-carousel-skeleton")).not.toBeInTheDocument();
    });
  });

  it("degrada silenciosamente y desmonta la sección ante error de servidor 500 o fallo de red (CL-02, RNF-03)", async () => {
    vi.spyOn(landingService, "fetchFeaturedProducts").mockRejectedValue(
      new Error("Error interno del servidor 500"),
    );

    const { container } = render(<FeaturedProductsCarousel />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("featured-products-section")).not.toBeInTheDocument();
    });
  });

  it("no se renderiza (retorna null) si hay 1 o 2 productos destacados", async () => {
    vi.spyOn(landingService, "fetchFeaturedProducts").mockResolvedValue(mockFeaturedProducts);

    const { container } = render(<FeaturedProductsCarousel />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("featured-products-section")).not.toBeInTheDocument();
      expect(screen.queryByTestId("featured-carousel-skeleton")).not.toBeInTheDocument();
    });
  });

  it("cuando hay entre 3 y 10 productos activa el carrusel marquee infinito duplicando tarjetas", async () => {
    const threeProducts: FeaturedProductItem[] = [
      ...mockFeaturedProducts,
      {
        id: "prod-amarok-003",
        name: "Bomba Bosch CP4 Amarok",
        brandName: "Bosch",
        oem: "0445010507",
        condition: "Nuevo",
        price: 580000,
        showPrice: true,
        vehicleCompatibility: "Volkswagen Amarok 2.0 TDI",
        imageUrl: "/uploads/cp4.webp",
      },
    ];

    vi.spyOn(landingService, "fetchFeaturedProducts").mockResolvedValue(threeProducts);

    render(<FeaturedProductsCarousel />);

    await waitFor(() => {
      expect(screen.getByTestId("featured-products-section")).toBeInTheDocument();
    });

    expect(screen.getByTestId("featured-marquee-container")).toBeInTheDocument();

    const cardLinks = screen.getAllByRole("link", {
      name: /en el catálogo oficial/i,
    });
    // 3 productos duplicados en bucle infinito = 6 tarjetas
    expect(cardLinks.length).toBe(6);

    // CTA general al catálogo
    const ctaLink = screen.getByRole("link", {
      name: /Ver Catálogo Completo/i,
    });
    expect(ctaLink).toHaveAttribute("href", "/catalogo");
  });

  it("limita la visualización a un máximo de 10 productos si hay más disponibles", async () => {
    const twelveProducts: FeaturedProductItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: `prod-extra-${i}`,
      name: `Inyector Destacado ${i}`,
      brandName: "Bosch",
      oem: `0445110${i}`,
      condition: "Nuevo",
      price: 200000 + i * 10000,
      showPrice: true,
      vehicleCompatibility: "Vehículo Universal",
      imageUrl: `/uploads/prod-${i}.webp`,
    }));

    vi.spyOn(landingService, "fetchFeaturedProducts").mockResolvedValue(twelveProducts);

    render(<FeaturedProductsCarousel />);

    await waitFor(() => {
      expect(screen.getByTestId("featured-products-section")).toBeInTheDocument();
    });

    const cardLinks = screen.getAllByRole("link", {
      name: /en el catálogo oficial/i,
    });
    // Máximo 10 productos duplicados para el marquee = 20 tarjetas
    expect(cardLinks.length).toBe(20);
  });
});
