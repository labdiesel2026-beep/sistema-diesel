import { test, expect } from "@playwright/test";

/**
 * TASK-28: Prueba E2E 1 - Flujo completo de re-autenticación bloqueante sin pérdida de datos en el formulario de repuestos.
 * (Spec 010, DoD Criterio 6, Caso Límite 8, Principio 4, Principio 5)
 */
test.describe("Flujo E2E: Re-autenticación Bloqueante y Retención de Formulario (Zero-Trust)", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Simular autenticación inicial del administrador
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "user-admin-uuid-1",
            email: "admin@laboratoriodiesel.com",
            name: "Administrador Técnico",
            role: "ADMIN",
          },
        }),
      });
    });

    // Mock de catálogo inicial y taxonomías para cargar el backoffice
    await page.route("**/api/admin/products", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            products: [],
            total: 0,
            featuredCount: 0,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "cat-1", name: "Inyectores Common Rail", slug: "inyectores-common-rail" },
        ]),
      });
    });

    await page.route("**/api/brands", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "brand-1", name: "Bosch", slug: "bosch" },
        ]),
      });
    });

    // Mock de subida de imagen técnica
    await page.route("**/api/uploads/product-image", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          imageUrl: "/uploads/products/inyector-bosch-test.webp",
          width: 1080,
          height: 1080,
          format: "webp",
          sizeBytes: 184500,
        }),
      });
    });
  });

  test("Debe abrir el modal de repuesto, retener datos ante expiración 401, bloquear cierre con Esc/backdrop, y guardar tras re-autenticar", async ({
    page,
  }) => {
    // 1. Navegar a la sección de administración de repuestos
    await page.goto("/admin");

    // 2. Abrir el modal de creación de repuesto
    const newProductBtn = page.getByTestId("new-product-btn");
    await expect(newProductBtn).toBeVisible({ timeout: 10000 });
    await newProductBtn.click();

    // 3. Completar campos del formulario
    const nameInput = page.getByTestId("product-name-input");
    const oemInput = page.getByTestId("product-oem-input");
    const submitBtn = page.getByTestId("product-form-submit-btn");

    await expect(nameInput).toBeVisible();
    await nameInput.fill("Inyector Bosch Common Rail CRIN2 0445120");
    await oemInput.fill("0445120007");

    // Llenar campos opcionales si existen en el DOM
    const descInput = page.locator("#product-description");
    if (await descInput.isVisible()) {
      await descInput.fill("Repuesto original calibrado en banco de pruebas diésel con tolerancias micrométricas.");
    }

    const priceInput = page.locator("#product-price");
    if (await priceInput.isVisible()) {
      await priceInput.fill("185000");
    }

    // 4. Adjuntar archivo de imagen simulado al dropzone
    const fileInput = page.getByTestId("image-file-input");
    await fileInput.setInputFiles({
      name: "inyector-muestra.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      ),
    });

    // 5. Configurar intercepción de red para simular caducidad de sesión (401 en POST de guardado y en refresh)
    let postAttempts = 0;
    await page.route("**/api/admin/products", async (route) => {
      if (route.request().method() === "POST") {
        postAttempts++;
        if (postAttempts === 1) {
          // Primera petición: token expirado
          await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Referencia: a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c",
            }),
          });
        } else {
          // Petición re-transmitida tras login exitoso
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              id: "new-prod-uuid",
              name: "Inyector Bosch Common Rail CRIN2 0445120",
              oem: "0445120007",
              success: true,
            }),
          });
        }
      } else {
        await route.continue();
      }
    });

    // Mock del refresh silencioso: falla para obligar al modal bloqueante
    await page.route("**/api/auth/refresh", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Sesión expirada" }),
      });
    });

    // 6. El operador pulsa "Crear Repuesto"
    await submitBtn.click();

    // 7. Se despliega el modal bloqueante de re-autenticación
    const reauthModal = page.getByTestId("reauth-modal");
    await expect(reauthModal).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Sesión Expirada")).toBeVisible();

    // Verificación constitucional: el formulario de repuestos permanece montado en el DOM con sus datos
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue("Inyector Bosch Common Rail CRIN2 0445120");
    await expect(oemInput).toHaveValue("0445120007");

    // 8. Verificación de robustez bloqueante: presionar Esc NO cierra el modal
    await page.keyboard.press("Escape");
    await expect(reauthModal).toBeVisible();

    // 9. Verificación de robustez bloqueante: clic en el fondo oscuro/backdrop NO cierra el modal
    await reauthModal.click({ position: { x: 10, y: 10 } });
    await expect(reauthModal).toBeVisible();

    // 10. Ingreso de credenciales erróneas
    await page.route("**/api/auth/login", async (route) => {
      const payload = JSON.parse(route.request().postData() || "{}");
      if (payload.password === "clave-erronea") {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Credenciales incorrectas" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: "user-admin-uuid-1",
              email: "admin@laboratoriodiesel.com",
              name: "Administrador Técnico",
              role: "ADMIN",
            },
          }),
        });
      }
    });

    const emailInput = page.locator("#reauth-email");
    const passwordInput = page.locator("#reauth-password");
    const reauthSubmitBtn = page.getByTestId("reauth-submit-btn");

    await emailInput.fill("admin@laboratoriodiesel.com");
    await passwordInput.fill("clave-erronea");
    await reauthSubmitBtn.click();

    // Se muestra mensaje de error en rojo y el modal NO se cierra
    const errorMessage = page.getByTestId("reauth-error-message");
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Credenciales incorrectas");
    await expect(reauthModal).toBeVisible();

    // Los datos del formulario continúan intactos
    await expect(nameInput).toHaveValue("Inyector Bosch Common Rail CRIN2 0445120");

    // 11. Ingreso de credenciales correctas
    await passwordInput.fill("admin123456");
    await reauthSubmitBtn.click();

    // 12. El modal se cierra, la petición se re-transmite y el repuesto se guarda
    await expect(reauthModal).not.toBeVisible({ timeout: 8000 });
    expect(postAttempts).toBe(2);
  });
});
