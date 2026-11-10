import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PrivacyPolicyModal } from "@/components/policies/PrivacyPolicyModal";
import { LegalNoticeModal } from "@/components/policies/LegalNoticeModal";
import { LandingFooter } from "@/components/landing/LandingFooter";

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

describe("Modales de Políticas Legales y de Privacidad", () => {
  it("renderiza PrivacyPolicyModal con el texto exacto de Ley 25.326", () => {
    const handleOpenChange = vi.fn();

    render(<PrivacyPolicyModal open={true} onOpenChange={handleOpenChange} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Política de Privacidad/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("privacy-modal-text")).toHaveTextContent(
      "En Laboratorio Diésel (Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis) respetamos su privacidad conforme a la Ley 25.326 de Protección de Datos Personales (Argentina).",
    );
    expect(screen.getByTestId("privacy-modal-text")).toHaveTextContent(
      "No compartimos, vendemos ni cedemos su información a terceros.",
    );

    const closeBtn = screen.getByRole("button", { name: /Entendido/i });
    fireEvent.click(closeBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("renderiza LegalNoticeModal con las 3 cláusulas normativas", () => {
    const handleOpenChange = vi.fn();

    render(<LegalNoticeModal open={true} onOpenChange={handleOpenChange} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Aviso Legal y Términos/i }),
    ).toBeInTheDocument();

    // 1. Precios y Stock
    expect(screen.getByText(/1\. Precios y Stock/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Dado el dinamismo del mercado de autopartes, los precios y la disponibilidad de stock/i,
      ),
    ).toBeInTheDocument();

    // 2. Referencias OEM
    expect(screen.getByText(/2\. Referencias OEM/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Las imágenes, marcas comerciales y números de pieza originales \(OEM\) se exhiben con fines estrictamente comparativos/i,
      ),
    ).toBeInTheDocument();

    // 3. Garantía
    expect(screen.getByText(/3\. Garantía/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Todos nuestros trabajos de calibración y reparación de inyectores cuentan con una garantía escrita de 30 días/i,
      ),
    ).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Entendido/i });
    fireEvent.click(closeBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("LandingFooter abre PrivacyPolicyModal al hacer clic en 'Política de Privacidad'", () => {
    render(<LandingFooter />);

    const privacyBtn = screen.getByTestId("footer-privacy-btn");
    expect(privacyBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(privacyBtn);
    });

    expect(
      screen.getByRole("heading", { level: 2, name: /Política de Privacidad/i }),
    ).toBeInTheDocument();
  });

  it("LandingFooter abre LegalNoticeModal al hacer clic en 'Aviso Legal y Términos'", () => {
    render(<LandingFooter />);

    const legalBtn = screen.getByTestId("footer-legal-btn");
    expect(legalBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(legalBtn);
    });

    expect(
      screen.getByRole("heading", { level: 2, name: /Aviso Legal y Términos/i }),
    ).toBeInTheDocument();
  });
});

