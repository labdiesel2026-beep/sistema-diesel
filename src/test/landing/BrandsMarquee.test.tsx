import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { BrandsMarquee } from "@/components/landing/BrandsMarquee";

describe("Componente BrandsMarquee (RF-03.1, RF-03.2, RF-03.3)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza la sección accesible y su encabezado formal", () => {
    render(<BrandsMarquee />);

    const section = screen.getByRole("region", {
      name: /Marcas y sistemas de inyección atendidos/i,
    });
    expect(section).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Marcas y Sistemas de Inyección que Atendemos/i,
      }),
    ).toBeInTheDocument();
  });

  it("renderiza exactamente 20 nodos en el DOM (10 marcas oficiales duplicadas)", () => {
    render(<BrandsMarquee />);

    const track = screen.getByTestId("brands-marquee-track");
    expect(track).toBeInTheDocument();

    // 20 elementos hijos en el track
    expect(track.children.length).toBe(20);

    // Validar las 10 marcas exactas
    const expectedBrands = [
      "bosch",
      "zexel",
      "denso",
      "siemens-vdo",
      "delphi",
      "caterpillar",
      "cummins",
      "stanadyne",
      "diesel-kiki",
      "perkins",
    ];

    for (const brandId of expectedBrands) {
      const brandElements = screen.getAllByTestId(`brand-item-${brandId}`);
      // Cada marca debe estar duplicada exactamente 2 veces
      expect(brandElements).toHaveLength(2);
    }
  });

  it("aplica la clase de animación infinita, directiva touch-pan-y y soporte prefers-reduced-motion", () => {
    render(<BrandsMarquee />);

    const container = screen.getByTestId("brands-marquee-container");
    expect(container.className).toContain("touch-pan-y");
    expect(container.className).toContain("overflow-hidden");

    const track = screen.getByTestId("brands-marquee-track");
    expect(track.className).toContain("animate-marquee");
    expect(track.className).toContain("motion-reduce:[animation:none]");
    expect(track.className).toContain("hover:[animation-play-state:paused]");
  });

  it("maneja el contacto táctil de forma no intrusiva con pausa tras 250ms y reanudación con gracia", () => {
    render(<BrandsMarquee />);

    const container = screen.getByTestId("brands-marquee-container");
    const track = screen.getByTestId("brands-marquee-track");

    // Inicialmente no está en pausa táctil
    expect(track).toHaveAttribute("data-paused", "false");
    expect(track.style.animationPlayState).toBe("");

    // 1. Toque rápido (scroll vertical < 250ms): NO debe pausar
    fireEvent.touchStart(container);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.touchEnd(container);

    expect(track).toHaveAttribute("data-paused", "false");
    expect(track.style.animationPlayState).toBe("");

    // 2. Toque sostenido (> 250ms): Sí debe pausar
    fireEvent.touchStart(container);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(track).toHaveAttribute("data-paused", "true");
    expect(track.style.animationPlayState).toBe("paused");

    // 3. Soltar contacto: debe esperar 1.5s de gracia antes de reanudar
    fireEvent.touchEnd(container);

    // Todavía en pausa a los 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(track).toHaveAttribute("data-paused", "true");

    // Reanudado tras los 1500ms
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(track).toHaveAttribute("data-paused", "false");
    expect(track.style.animationPlayState).toBe("");
  });
});
