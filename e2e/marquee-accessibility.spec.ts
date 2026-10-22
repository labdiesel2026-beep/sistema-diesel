import { test, expect } from "@playwright/test";

/**
 * TASK-28: Prueba E2E 3 - Comprobación de navegación por teclado en el Marquee con botón toggle :focus-visible (WCAG 2.2.2).
 * (Spec 010, RF-01, RNF-02, RNF-04, DoD Criterio 1)
 */
test.describe("Accesibilidad WCAG 2.2.2: Marquee Continuo y Botón Toggle por Teclado", () => {
  test.use({
    viewport: { width: 1280, height: 720 },
  });

  test("El botón toggle inicia como sr-only, se hace visible con :focus-visible, y conmuta pausa/reanudación mediante teclado (Enter)", async ({
    page,
  }) => {
    // 1. Navegar a la Landing Page donde se aloja el Marquee
    await page.goto("/");

    // 2. Localizar el contenedor del carrusel de marcas
    const marqueeContainer = page.getByTestId("brands-marquee-container");
    await expect(marqueeContainer).toBeVisible({ timeout: 8000 });

    // 3. Localizar el botón accesible de pausa/reanudación WCAG 2.2.2
    const toggleButton = page.locator("section[aria-label*='Marcas y sistemas'] button[aria-pressed]");
    await expect(toggleButton).toBeAttached();

    // Estado inicial: no pausado, texto 'Pausar animación' y aria-pressed='false'
    await expect(toggleButton).toHaveText("Pausar animación");
    await expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    // Verificar que tiene la clase 'sr-only' antes de recibir foco
    const initialClass = await toggleButton.getAttribute("class");
    expect(initialClass).toContain("sr-only");

    // 4. Enfocar el botón simulando navegación por teclado (Tab)
    await toggleButton.focus();

    // Al recibir foco de teclado (:focus-visible), el botón se proyecta fuera del lector de pantalla (not-sr-only)
    await expect(toggleButton).toBeVisible();

    // 5. Presionar 'Enter' para pausar la animación
    await page.keyboard.press("Enter");

    // El estado del botón cambia a 'Reanudar animación' y aria-pressed='true'
    await expect(toggleButton).toHaveText("Reanudar animación");
    await expect(toggleButton).toHaveAttribute("aria-pressed", "true");

    // El track de marcas refleja el estado de animación pausado
    const track = page.getByTestId("brands-marquee-track");
    await expect(track).toHaveAttribute("data-paused", "true");

    // 6. Presionar 'Enter' nuevamente para reanudar el carrusel
    await page.keyboard.press("Enter");

    // El estado vuelve a 'Pausar animación' y aria-pressed='false'
    await expect(toggleButton).toHaveText("Pausar animación");
    await expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    // El desplazamiento se reanuda
    await expect(track).toHaveAttribute("data-paused", "false");
  });
});
