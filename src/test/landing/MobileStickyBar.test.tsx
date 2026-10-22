import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MobileStickyBar } from "@/components/landing/MobileStickyBar";
import { SITE_CONFIG } from "@/config/site-config";

// Mock de useLocation de TanStack Router
let mockPathname = "/";
vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({ pathname: mockPathname }),
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

describe("Barra Fija Móvil (MobileStickyBar.tsx) — Spec 010, RF-07, RNF-03, CL-01", () => {
  beforeEach(() => {
    mockPathname = "/";
    window.innerHeight = 800;
    window.innerWidth = 390; // Dispositivo móvil típico
    vi.restoreAllMocks();
  });

  it("renderiza la barra fija inferior con clases estructurales canónicas (RF-07)", () => {
    const { container } = render(<MobileStickyBar />);
    const bar = container.querySelector("aside");

    expect(bar).toBeInTheDocument();
    expect(bar?.className).toContain("fixed");
    expect(bar?.className).toContain("bottom-0");
    expect(bar?.className).toContain("min-h-[64px]");
    expect(bar?.className).toContain("bg-black/80");
    expect(bar?.className).toContain("backdrop-blur-md");
    expect(bar?.className).toContain("border-t");
    expect(bar?.className).toContain("border-white/10");
    expect(bar?.className).toContain("md:hidden");
  });

  it("contiene el botón icónico de WhatsApp de 48px exactos (w-12) sin texto visible (RF-07)", () => {
    render(<MobileStickyBar />);

    const whatsappBtn = screen.getByTestId("mobile-whatsapp-btn");
    expect(whatsappBtn).toBeInTheDocument();
    expect(whatsappBtn.className).toContain("w-12"); // 48px exactos
    expect(whatsappBtn.className).toContain("h-11"); // 44px interactivos
    expect(whatsappBtn).toHaveAttribute("target", "_blank");
    expect(whatsappBtn).toHaveAttribute("rel", "noopener noreferrer");

    const href = whatsappBtn.getAttribute("href") || "";
    expect(href).toContain(`https://wa.me/${SITE_CONFIG.phone}`);

    // No debe contener texto visible, solo el sr-only para accesibilidad
    const textNodes = Array.from(whatsappBtn.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    );
    expect(textNodes.length).toBe(0);
  });

  it("contiene el botón 'Ir al catálogo' expandido en flex-1 (RF-07)", () => {
    render(<MobileStickyBar />);

    const catalogBtn = screen.getByTestId("mobile-catalog-btn");
    expect(catalogBtn).toBeInTheDocument();
    expect(catalogBtn.className).toContain("flex-1");
    expect(catalogBtn).toHaveAttribute("href", "/catalogo");
    expect(catalogBtn).toHaveTextContent(/Ir al catálogo/i);
  });

  it("aplica protección de área segura móvil mediante padding-bottom env(safe-area-inset-bottom) (RF-07)", () => {
    const { container } = render(<MobileStickyBar />);
    const bar = container.querySelector("aside");

    expect(bar?.className).toContain("safe-area-inset-bottom");
  });

  it("se oculta automáticamente cuando la altura del viewport es inferior a 450px (Modo Landscape / Caso Límite 1)", () => {
    window.innerHeight = 420; // Altura reducida en apaisado

    const { container } = render(<MobileStickyBar />);
    const bar = container.querySelector("aside");

    expect(bar).not.toBeInTheDocument();
  });

  it("reevalúa y oculta la barra ante el evento blur si permanece en apaisado (Caso Límite 1)", () => {
    window.innerHeight = 800;
    const { container } = render(<MobileStickyBar />);
    expect(container.querySelector("aside")).toBeInTheDocument();

    act(() => {
      window.innerHeight = 380;
      window.dispatchEvent(new Event("blur"));
    });

    expect(container.querySelector("aside")).not.toBeInTheDocument();
  });

  it("se desmonta por completo cuando la ruta es diferente a la Landing Page ('/') (RF-07)", () => {
    mockPathname = "/catalogo";

    const { container } = render(<MobileStickyBar />);
    const bar = container.querySelector("aside");

    expect(bar).not.toBeInTheDocument();
  });

  it("actualiza dinámicamente la variable CSS --bottom-bar-height mediante ResizeObserver (RF-07, TASK-15)", () => {
    let resizeCallback: (entries: Partial<ResizeObserverEntry>[]) => void = () => {};

    class MockResizeObserver {
      constructor(callback: (entries: Partial<ResizeObserverEntry>[]) => void) {
        resizeCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal("ResizeObserver", MockResizeObserver);

    const { unmount } = render(<MobileStickyBar />);

    // Simular evento de ResizeObserver con aumento de altura por zoom (ej. apilado a 110px)
    act(() => {
      resizeCallback([
        {
          borderBoxSize: [{ blockSize: 110, inlineSize: 390 } as unknown as ResizeObserverSize],
          contentRect: { height: 110, width: 390 } as DOMRectReadOnly,
        },
      ]);
    });

    expect(document.documentElement.style.getPropertyValue("--bottom-bar-height")).toBe("110px");

    // Al desmontar, debe limpiar la propiedad de style
    unmount();
    expect(document.documentElement.style.getPropertyValue("--bottom-bar-height")).toBe("");
  });
});

