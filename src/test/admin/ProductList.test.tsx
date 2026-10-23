import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "@/components/admin/products/ProductList";
import { AdminProvider } from "@/context/admin-context";
import type { AdminProduct } from "@/types/admin";

const sampleProduct: AdminProduct = {
  id: "prod-list-1",
  name: "Inyector Bosch Common Rail Piezoeléctrico",
  brandId: "brand-bosch",
  categoryIds: ["cat-inyectores"],
  vehicleCompatibility: "VW Amarok 2.0 TDI (2010-2021)",
  condition: "Nuevo",
  oem: "0445116034",
  price: 345000,
  showPrice: true,
  visible: true,
  isFeatured: true,
  imageUrl: "/uploads/prod-list-1.webp",
  description: "Inyector piezoeléctrico original Bosch",
};

describe("ProductList — Cabeceras Fijas, Tema Claro y Códigos OEM (TASK-18, RF-09, Apéndice 10.2)", () => {
  it("opera estrictamente en tema claro con contenedor bg-admin-bg y cabeceras fijas opacas", () => {
    const { container } = render(
      <AdminProvider>
        <ProductList products={[sampleProduct]} />
      </AdminProvider>,
    );

    // 1. Contenedor de lista opera en tema claro con bg-admin-bg
    const tableContainer = screen.getByTestId("product-table-container");
    expect(tableContainer).toBeInTheDocument();
    expect(tableContainer.className).toContain("bg-admin-bg");
    expect(tableContainer.className).toContain("border-admin-border");

    // 2. Cabeceras de tabla fijas (sticky headers) con fondo 100% opaco blanco (#ffffff) y box-shadow
    const thead = container.querySelector("thead");
    expect(thead).toBeInTheDocument();
    expect(thead?.className).toContain("sticky");
    expect(thead?.className).toContain("top-0");
    expect(thead?.className).toContain("bg-white");
    expect(thead?.className).toContain("[box-shadow:0_1px_0_rgba(0,0,0,0.10)]");

    // Las celdas th individuales también poseen fondo opaco blanco y delimitación
    const thElements = thead?.querySelectorAll("th");
    expect(thElements?.length).toBeGreaterThanOrEqual(8);
    thElements?.forEach((th) => {
      expect(th.className).toContain("bg-white");
      expect(th.className).toContain("text-admin-text-main");
      expect(th.className).toContain("[box-shadow:0_1px_0_rgba(0,0,0,0.10)]");
    });
  });

  it("formatea códigos OEM con tipografía monoespaciada de alto contraste", () => {
    render(
      <AdminProvider>
        <ProductList products={[sampleProduct]} />
      </AdminProvider>,
    );

    const oemBadge = screen.getByTestId("product-oem-prod-list-1");
    expect(oemBadge).toBeInTheDocument();
    expect(oemBadge).toHaveTextContent("OEM: 0445116034");

    // Valida clases de alto contraste y monoespaciado en tema claro
    expect(oemBadge.className).toContain("font-mono");
    expect(oemBadge.className).toContain("text-admin-text-main");
    expect(oemBadge.className).toContain("border-admin-border");
    expect(oemBadge.className).toContain("bg-slate-100/90");
  });

  it("preserva las cabeceras fijas intactas ante listas vacías y maneja errores de servidor", () => {
    const { container, rerender } = render(
      <AdminProvider>
        <ProductList products={[]} searchQuery="CódigoInexistente" />
      </AdminProvider>,
    );

    // Las cabeceras deben permanecer renderizadas incluso si no hay productos
    expect(container.querySelector("thead")).toBeInTheDocument();
    expect(screen.getByTestId("product-table-empty")).toBeInTheDocument();
    expect(screen.getByText("No se encontraron repuestos")).toBeInTheDocument();

    // Rerender con error de servidor (HTTP 500)
    rerender(
      <AdminProvider>
        <ProductList products={[]} error="Error del servidor. Referencia: 550e8400-e29b-41d4-a716-446655440000" />
      </AdminProvider>,
    );

    // Cabeceras siguen renderizadas protegiendo la estructura
    expect(container.querySelector("thead")).toBeInTheDocument();
    const errorContainer = screen.getByTestId("product-table-error");
    expect(errorContainer).toBeInTheDocument();
    expect(screen.getByText("Error del servidor. Referencia: 550e8400-e29b-41d4-a716-446655440000")).toBeInTheDocument();
  });

  it("cumple con TASK-19: manejo opaco de errores 500 del servidor previniendo fugas técnicas", () => {
    // 1. Error con payload estándar { error: "Referencia: a1b2c3d4-e5f6-7890-abcd-ef1234567890" }
    const { container, rerender } = render(
      <AdminProvider>
        <ProductList products={[]} error="Referencia: a1b2c3d4-e5f6-7890-abcd-ef1234567890" />
      </AdminProvider>,
    );

    // Debe anteponer "Error del servidor." formalmente
    const msg = screen.getByTestId("server-error-message");
    expect(msg).toBeInTheDocument();
    expect(msg).toHaveTextContent("Error del servidor. Referencia: a1b2c3d4-e5f6-7890-abcd-ef1234567890");

    // Cabecera fija se mantiene intacta
    const thead = container.querySelector("thead");
    expect(thead).toBeInTheDocument();
    expect(thead?.className).toContain("sticky");
    expect(thead?.className).toContain("bg-white");

    // 2. Simulación de caída de base de datos con traza SQL técnica interna
    const rawTechnicalTrace =
      "PrismaClientInitializationError: Can't reach database server at localhost:5432. SQL: SELECT id, name FROM \"Product\" WHERE visible = true";

    rerender(
      <AdminProvider>
        <ProductList products={[]} error={rawTechnicalTrace} />
      </AdminProvider>,
    );

    // La traza técnica NUNCA debe filtrarse al DOM
    expect(screen.queryByText(/PrismaClientInitializationError/i)).toBeNull();
    expect(screen.queryByText(/localhost:5432/i)).toBeNull();
    expect(screen.queryByText(/SELECT id, name/i)).toBeNull();

    // En su lugar, proyecta estrictamente el formato constitucional
    const maskedMsg = screen.getByTestId("server-error-message");
    expect(maskedMsg.textContent).toMatch(/^Error del servidor\. Referencia: [0-9a-fA-F-]+$/);
  });
});
