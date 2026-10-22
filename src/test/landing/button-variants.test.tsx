import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";

describe("Componente Button y buttonVariants (RF-05.1)", () => {
  it("renderiza la variante whatsapp con clases semánticas, ring perimetral y micro-interacciones", () => {
    render(<Button variant="whatsapp">Consultar por WhatsApp</Button>);

    const button = screen.getByRole("button", { name: /Consultar por WhatsApp/i });
    expect(button).toBeInTheDocument();

    const className = button.className;
    expect(className).toContain("bg-whatsapp");
    expect(className).toContain("text-whatsapp-foreground");
    expect(className).toContain("ring-1");
    expect(className).toContain("ring-emerald-400/20");
    expect(className).toContain("shadow-sm");
    expect(className).toContain("active:scale-[0.98]");
    expect(className).toContain("rounded-xl");
  });

  it("permite combinar className personalizado manteniendo la variante whatsapp", () => {
    render(
      <Button variant="whatsapp" className="w-full text-base font-bold">
        Enviar Mensaje
      </Button>,
    );

    const button = screen.getByRole("button", { name: /Enviar Mensaje/i });
    expect(button.className).toContain("bg-whatsapp");
    expect(button.className).toContain("w-full");
    expect(button.className).toContain("text-base");
    expect(button.className).toContain("font-bold");
  });

  it("genera las clases correctas a través de buttonVariants helper", () => {
    const classes = buttonVariants({ variant: "whatsapp" });
    expect(classes).toContain("bg-whatsapp");
    expect(classes).toContain("text-whatsapp-foreground");
    expect(classes).toContain("ring-emerald-400/20");
  });

  it("renderiza la variante ghost con borde hairline y transición de 300ms ease-out (Spec 009)", () => {
    const classes = buttonVariants({ variant: "ghost" });
    expect(classes).toContain("dark:border-white/10");
    expect(classes).toContain("duration-300");
    expect(classes).toContain("ease-out");
  });
});

