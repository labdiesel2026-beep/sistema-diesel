import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartDrawer } from "@/components/catalog/CartDrawer";
import { CatalogCartProvider } from "@/context/catalog-cart-context";
import * as cartRevalidation from "@/lib/cart-revalidation";
import type { CartItemCache, EnrichedCartItem } from "@/types/catalog";

// Mock del servicio de revalidación
vi.mock("@/lib/cart-revalidation", () => ({
  revalidateCartItems: vi.fn(),
}));

describe("CartDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("despliega items enriquecidos advertencias de vigencia y checkout", async () => {
    const initialItems: CartItemCache[] = [
      {
        productId: "p-bosch",
        quantity: 1,
        lastKnown: { name: "Inyector Bosch CR", oem: "0445110001" },
      },
      {
        productId: "p-delphi-hidden",
        quantity: 2,
        lastKnown: { name: "Bomba Delphi Oculta", oem: "28343144" },
      },
    ];

    const enrichedMock: EnrichedCartItem[] = [
      {
        productId: "p-bosch",
        quantity: 1,
        name: "Inyector Bosch CR Revalidado",
        oem: "0445110001",
        imageUrl: "/uploads/bosch.webp",
        brandName: "Bosch",
        condition: "Nuevo",
        price: 200000,
        showPrice: true,
        visible: true,
        requiresReconfirmation: false,
        isDeletedOrUnavailable: false,
      },
      {
        productId: "p-delphi-hidden",
        quantity: 2,
        name: "Bomba Delphi Oculta",
        oem: "28343144",
        imageUrl: "",
        brandName: "Delphi",
        condition: "Reacondicionado",
        price: null,
        showPrice: false,
        visible: false,
        requiresReconfirmation: true,
        isDeletedOrUnavailable: false,
      },
    ];

    vi.mocked(cartRevalidation.revalidateCartItems).mockResolvedValue(enrichedMock);

    render(
      <CatalogCartProvider initialItems={initialItems}>
        <CartDrawer open={true} />
      </CatalogCartProvider>,
    );

    // 1. Debe haber disparado la revalidación activa
    expect(cartRevalidation.revalidateCartItems).toHaveBeenCalledWith(initialItems);

    // 2. Esperar a que se resuelvan y rendericen los datos enriquecidos
    await waitFor(() => {
      expect(screen.getByText("Inyector Bosch CR Revalidado")).toBeInTheDocument();
    });

    // 3. Validar producto vigente con precio
    expect(screen.getByText("OEM 0445110001")).toBeInTheDocument();
    expect(screen.getAllByText("$200.000 ARS").length).toBe(2); // ítem y subtotal
    expect(screen.getByText("Bosch")).toBeInTheDocument();
    expect(screen.getByText("Nuevo")).toBeInTheDocument();

    // 4. Validar advertencias de vigencia para el ítem con visible: false
    expect(screen.getByText("Bomba Delphi Oculta")).toBeInTheDocument();
    expect(screen.getByTestId("badge-reconfirmation-p-delphi-hidden")).toBeInTheDocument();
    expect(screen.getByTestId("cart-reconfirmation-banner")).toBeInTheDocument();

    // 5. Validar subtotal de productos con precio ($200.000 ARS) y leyenda mixta
    expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("$200.000 ARS");
    expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("+ ÍTEMS A COTIZAR");
    expect(screen.getByText("[A Cotizar]")).toBeInTheDocument();

    // 6. Validar enlace de checkout por WhatsApp con desglose y etiqueta [A Cotizar]
    const checkoutLink = screen.getByTestId("whatsapp-checkout-button");
    expect(checkoutLink).toHaveAttribute("target", "_blank");
    const href = checkoutLink.getAttribute("href") || "";
    expect(href).toContain("https://wa.me/");
    expect(href).toContain("Inyector%20Bosch%20CR%20Revalidado");
    expect(href).toContain("Bomba%20Delphi%20Oculta");
    expect(decodeURIComponent(href)).toContain("[A Cotizar]");
    expect(checkoutLink.className).toContain("bg-whatsapp");
    expect(checkoutLink.className).toContain("font-bold");

    // 7. Modificar cantidad (+): aumenta cantidad y recalcula precio
    const increaseBtn = screen.getByTestId("increase-quantity-p-bosch");
    fireEvent.click(increaseBtn);

    await waitFor(() => {
      expect(screen.getByTestId("quantity-p-bosch")).toHaveTextContent("2");
      expect(screen.getByTestId("cart-subtotal")).toHaveTextContent("$400.000 ARS");
    });

    // 8. Eliminar ítem del carrito
    const removeHiddenBtn = screen.getByTestId("remove-item-p-delphi-hidden");
    fireEvent.click(removeHiddenBtn);

    await waitFor(() => {
      expect(screen.queryByText("Bomba Delphi Oculta")).not.toBeInTheDocument();
      expect(screen.queryByTestId("cart-reconfirmation-banner")).not.toBeInTheDocument();
    });

    // 9. Vaciar el carrito completamente
    const clearBtn = screen.getByTestId("clear-cart-button");
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByTestId("empty-cart-state")).toBeInTheDocument();
      expect(screen.getByText("Tu carrito de consultas está vacío")).toBeInTheDocument();
    });
  });
});
