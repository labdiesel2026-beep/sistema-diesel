import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { AdminProvider } from "@/context/admin-context";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { AdminProduct } from "@/types/admin";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ProductTable — Columna de Acción Rápida de Destacados (Tarea 8.3, RF-01, RF-03, RF-05, RNF-04)", () => {
  const sampleProducts: AdminProduct[] = [
    {
      id: "prod-1",
      name: "Inyector Bosch Hilux",
      description: "Inyector Common Rail",
      imageUrl: "/uploads/hilux.webp",
      brandId: "brand-1",
      categoryIds: ["cat-1"],
      condition: "Nuevo",
      price: 320000,
      showPrice: true,
      visible: true,
      isFeatured: false,
      oem: "0445110369",
      vehicleCompatibility: "Toyota Hilux 2.8 D-4D",
    },
    {
      id: "prod-2",
      name: "Inyector Ranger Oculto",
      description: "Inyector fuera de stock",
      imageUrl: "/uploads/ranger.webp",
      brandId: "brand-1",
      categoryIds: ["cat-1"],
      condition: "Reacondicionado",
      price: 240000,
      showPrice: true,
      visible: false,
      isFeatured: false,
      oem: "28231014",
      vehicleCompatibility: "Ford Ranger 2.2",
    },
    {
      id: "prod-3",
      name: "Inyector Amarok Destacado",
      description: "Piezoeléctrico",
      imageUrl: "/uploads/amarok.webp",
      brandId: "brand-1",
      categoryIds: ["cat-1"],
      condition: "Nuevo",
      price: 380000,
      showPrice: true,
      visible: true,
      isFeatured: true,
      featuredAt: new Date().toISOString(),
      oem: "A2C59511603",
      vehicleCompatibility: "Volkswagen Amarok 2.0 TDI",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el switch de destacado en estado activo o inactivo según isFeatured", () => {
    render(
      <AdminProvider>
        <ProductTable products={sampleProducts} />
      </AdminProvider>,
    );

    const switch1 = screen.getByTestId("product-featured-switch-prod-1");
    expect(switch1).toHaveAttribute("aria-checked", "false");

    const switch3 = screen.getByTestId("product-featured-switch-prod-3");
    expect(switch3).toHaveAttribute("aria-checked", "true");
  });

  it("deshabilita el switch de destacado en productos ocultos (visible: false) (RF-01, CA-01.4)", () => {
    render(
      <AdminProvider>
        <ProductTable products={sampleProducts} />
      </AdminProvider>,
    );

    const switchHidden = screen.getByTestId("product-featured-switch-prod-2");
    expect(switchHidden).toBeDisabled();
    expect(switchHidden).toHaveAttribute(
      "title",
      "No se puede destacar un producto con visibilidad oculta",
    );
  });

  it("muestra spinner de carga durante la mutación pesimista (RNF-04)", async () => {
    let resolveMutation: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolveMutation = resolve;
    });

    const mockToggleFeatured = vi.fn().mockImplementation(() => pendingPromise);

    render(
      <AdminProvider>
        <ProductTable products={sampleProducts} onToggleFeatured={mockToggleFeatured} />
      </AdminProvider>,
    );

    const switch1 = screen.getByTestId("product-featured-switch-prod-1");
    fireEvent.click(switch1);

    expect(mockToggleFeatured).toHaveBeenCalledTimes(1);

    // Debe mostrarse el mini-spinner mientras la promesa esté pendiente
    expect(screen.getByTestId("product-featured-spinner-prod-1")).toBeInTheDocument();

    // Resolver la promesa
    resolveMutation!();

    await waitFor(() => {
      expect(screen.queryByTestId("product-featured-spinner-prod-1")).not.toBeInTheDocument();
    });
  });

  it("dispara toast de error ante rechazo HTTP 409 de límite alcanzado (CL-03)", async () => {
    const error409 = new ApiError("Límite alcanzado. Desmarca un producto primero", 409);
    const mockToggleFeatured = vi.fn().mockRejectedValue(error409);

    render(
      <AdminProvider>
        <ProductTable products={sampleProducts} onToggleFeatured={mockToggleFeatured} />
      </AdminProvider>,
    );

    const switch1 = screen.getByTestId("product-featured-switch-prod-1");
    fireEvent.click(switch1);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Límite alcanzado. Desmarca un producto primero",
      );
    });
  });
});
