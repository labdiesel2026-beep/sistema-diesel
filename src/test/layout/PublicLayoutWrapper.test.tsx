import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicLayoutWrapper } from "@/components/layout/PublicLayoutWrapper";

let mockCurrentPath = "/";
vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({ pathname: mockCurrentPath }),
}));

describe("PublicLayoutWrapper (TASK-15, RF-07, Caso Límite 3)", () => {
  beforeEach(() => {
    mockCurrentPath = "/";
  });

  it("aplica relleno compensatorio condicional en la Landing Page ('/') para la barra fija móvil", () => {
    mockCurrentPath = "/";
    render(
      <PublicLayoutWrapper>
        <div>Contenido Landing</div>
      </PublicLayoutWrapper>,
    );

    const wrapper = screen.getByTestId("public-layout-wrapper");
    expect(wrapper).toBeInTheDocument();

    // Comprueba que incluya la clase de padding compensatorio con la variable y env safe-area
    expect(wrapper.className).toContain("landing-bottom-bar-pad");
    expect(wrapper.className).toContain("--bottom-bar-height");
    expect(wrapper.className).toContain("safe-area-inset-bottom");
  });

  it("NO aplica relleno compensatorio en rutas secundarias como '/catalogo'", () => {
    mockCurrentPath = "/catalogo";
    render(
      <PublicLayoutWrapper>
        <div>Contenido Catálogo</div>
      </PublicLayoutWrapper>,
    );

    const wrapper = screen.getByTestId("public-layout-wrapper");
    expect(wrapper.className).not.toContain("landing-bottom-bar-pad");
    expect(wrapper.className).not.toContain("--bottom-bar-height");
  });

  it("NO aplica relleno compensatorio en rutas institucionales como '/garantia'", () => {
    mockCurrentPath = "/garantia";
    render(
      <PublicLayoutWrapper>
        <div>Contenido Garantía</div>
      </PublicLayoutWrapper>,
    );

    const wrapper = screen.getByTestId("public-layout-wrapper");
    expect(wrapper.className).not.toContain("landing-bottom-bar-pad");
    expect(wrapper.className).not.toContain("--bottom-bar-height");
  });
});
