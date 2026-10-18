import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WarrantySection } from "@/components/landing/WarrantySection";
import { SITE_CONFIG } from "@/config/site-config";

describe("Sección de Garantías (WarrantySection.tsx)", () => {
  it("renderiza el contenedor con id='garantias' y clase 'scroll-mt-20' (RF-04)", () => {
    const { container } = render(<WarrantySection />);
    const section = container.querySelector("section#garantias");

    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("scroll-mt-20");
  });

  it("muestra el título, resumen y todos los detalles de garantía institucional (RF-04)", () => {
    render(<WarrantySection />);

    expect(screen.getByText(SITE_CONFIG.warrantyTerms.title)).toBeInTheDocument();
    expect(screen.getByText(SITE_CONFIG.warrantyTerms.summary)).toBeInTheDocument();

    for (const detail of SITE_CONFIG.warrantyTerms.details) {
      expect(screen.getByText(detail)).toBeInTheDocument();
    }
  });

  it("el botón contiene el enlace a wa.me con el teléfono oficial y mensaje de garantía codificado (RF-04)", () => {
    render(<WarrantySection />);

    const warrantyLink = screen.getByRole("link", {
      name: /Solicitar Garantía \/ Soporte/i,
    });

    expect(warrantyLink).toBeInTheDocument();
    expect(warrantyLink).toHaveAttribute("target", "_blank");
    expect(warrantyLink).toHaveAttribute("rel", "noopener noreferrer");

    const href = warrantyLink.getAttribute("href") || "";
    expect(href).toContain(`https://wa.me/${SITE_CONFIG.phone}`);
    expect(href).toContain("?text=");

    // Decodificar el mensaje para verificar contenido exacto
    const encodedText = href.split("?text=")[1] || "";
    const decodedMessage = decodeURIComponent(encodedText);
    expect(decodedMessage).toContain(
      "Motivo: Consulta por garantía / soporte post-venta.",
    );
  });
});
