import { test, expect } from "@playwright/test";

/**
 * TASK-28: Prueba E2E 2 - Comprobación de que la barra fija inferior móvil solo está presente en `/` y desaparece en `/catalogo`.
 * (Spec 010, RF-07, RNF-03, Caso Límite 1, Caso Límite 3, DoD Criterio 2)
 */
test.describe("Regresión Visual y DOM: Barra Fija Móvil y Safe Areas (MobileStickyBar)", () => {
  // Configuración de viewport vertical móvil estándar (< 768px)
  test.use({
    viewport: { width: 375, height: 667 },
  });

  test("En la ruta '/' la barra móvil está visible, el botón de WhatsApp mide 48px y el layout aplica padding compensatorio", async ({
    page,
  }) => {
    // 1. Navegar a la Landing Page
    await page.goto("/");

    // 2. Verificar presencia de la barra fija móvil
    const stickyBar = page.getByTestId("mobile-sticky-bar");
    await expect(stickyBar).toBeVisible({ timeout: 8000 });

    // 3. Verificar que el botón de WhatsApp mide exactamente 48px de ancho (w-12)
    const whatsappBtn = page.getByTestId("mobile-whatsapp-btn");
    await expect(whatsappBtn).toBeVisible();
    const box = await whatsappBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // 48px de ancho exacto (+- 0.5px por redondeo de subpíxeles)
      expect(Math.round(box.width)).toBe(48);
    }

    // 4. Verificar que el botón de catálogo ocupa el espacio restante
    const catalogBtn = page.getByTestId("mobile-catalog-btn");
    await expect(catalogBtn).toBeVisible();

    // 5. Verificar que el envoltorio de layout compensatorio aplica el relleno inferior
    const layoutWrapper = page.getByTestId("public-layout-wrapper");
    await expect(layoutWrapper).toBeVisible();

    // Esperar a que el ResizeObserver inyecte --bottom-bar-height
    await page.waitForFunction(() => {
      const el = document.querySelector("[data-testid='public-layout-wrapper']");
      return (
        el &&
        (getComputedStyle(el).paddingBottom !== "0px" ||
          el.getAttribute("style")?.includes("padding-bottom"))
      );
    });

    const paddingBottom = await layoutWrapper.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });
    // Debe ser mayor a 0px (mínimo los 64px de la barra)
    const numericPadding = parseFloat(paddingBottom);
    expect(numericPadding).toBeGreaterThanOrEqual(60);
  });

  test("En la ruta '/catalogo' la barra fija móvil desaparece completamente y se elimina el padding compensatorio", async ({
    page,
  }) => {
    // 1. Navegar a la página de catálogo
    await page.goto("/catalogo");

    // 2. La barra fija móvil no debe estar visible ni renderizada
    const stickyBar = page.getByTestId("mobile-sticky-bar");
    await expect(stickyBar).not.toBeVisible();

    // 3. El layout wrapper no debe tener la clase ni el estilo de compensación de la barra fija
    const layoutWrapper = page.getByTestId("public-layout-wrapper");
    await expect(layoutWrapper).toBeVisible();

    const hasBottomBarPadClass = await layoutWrapper.evaluate((el) => {
      return el.classList.contains("landing-bottom-bar-pad");
    });
    expect(hasBottomBarPadClass).toBe(false);
  });

  test("En rotación a modo apaisado/landscape (< 450px de altura vertical), la barra se oculta automáticamente", async ({
    page,
  }) => {
    // 1. Navegar a '/' en modo vertical
    await page.goto("/");
    const stickyBar = page.getByTestId("mobile-sticky-bar");
    await expect(stickyBar).toBeVisible();

    // 2. Simular rotación a apaisado (667 x 375, donde altura 375px < 450px)
    await page.setViewportSize({ width: 667, height: 375 });

    // 3. La barra móvil debe ocultarse automáticamente en apaisado para no obstruir el contenido útil
    await expect(stickyBar).not.toBeVisible({ timeout: 5000 });
  });
});
