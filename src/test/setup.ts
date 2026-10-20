import "@testing-library/jest-dom/vitest";
import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
} from "@/test/fixtures/admin-fixtures";

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Emulación de datos iniciales exclusiva para tests unitarios aislados
(globalThis as any).__TEST_ADMIN_INITIAL_DATA__ = {
  brands: [...INITIAL_BRANDS],
  categories: [...INITIAL_CATEGORIES],
  products: [...INITIAL_PRODUCTS],
  metrics: {
    totalProducts: INITIAL_PRODUCTS.length,
    visibleProducts: INITIAL_PRODUCTS.filter((p) => p.visible).length,
    hiddenProducts: INITIAL_PRODUCTS.filter((p) => !p.visible).length,
    totalCategories: INITIAL_CATEGORIES.length,
    totalBrands: INITIAL_BRANDS.length,
  },
};

const originalFetch = globalThis.fetch;

// Interceptor de llamadas API REST para entorno jsdom en tests unitarios
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method?.toUpperCase() || "GET";

  if (url.includes("/api/")) {
    let body: any = null;
    if (init?.body && typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }

    // Brands
    if (url.includes("/api/brands")) {
      if (method === "GET") {
        return new Response(JSON.stringify(INITIAL_BRANDS), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (method === "POST") {
        return new Response(
          JSON.stringify({
            id: crypto.randomUUID(),
            name: body?.name || "Nueva Marca",
          }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (method === "PUT") {
        const parts = url.split("/api/brands/");
        const id = parts[1]?.split("?")[0] || crypto.randomUUID();
        return new Response(
          JSON.stringify({
            id,
            name: body?.name || "Marca Actualizada",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (method === "DELETE") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Marca eliminada correctamente",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // Categories
    if (url.includes("/api/categories")) {
      if (method === "GET") {
        return new Response(JSON.stringify(INITIAL_CATEGORIES), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (method === "POST") {
        return new Response(
          JSON.stringify({
            id: crypto.randomUUID(),
            name: body?.name || "Nueva Categoría",
            parentId: body?.parentId ?? null,
          }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (method === "PUT") {
        const parts = url.split("/api/categories/");
        const id = parts[1]?.split("?")[0] || crypto.randomUUID();
        return new Response(
          JSON.stringify({
            id,
            name: body?.name || "Categoría Actualizada",
            parentId: body?.parentId ?? null,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (method === "DELETE") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Categoría eliminada correctamente",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // Products
    if (url.includes("/api/products")) {
      if (url.includes("/visibility") && method === "PATCH") {
        return new Response(
          JSON.stringify({
            visible: body?.visible,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (method === "GET") {
        return new Response(JSON.stringify(INITIAL_PRODUCTS), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (method === "POST") {
        return new Response(
          JSON.stringify({
            id: crypto.randomUUID(),
            ...body,
            categoryIds: body?.categoryIds || [],
          }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (method === "PUT") {
        const parts = url.split("/api/products/");
        const id = parts[1]?.split("?")[0] || crypto.randomUUID();
        return new Response(
          JSON.stringify({
            id,
            ...body,
            categoryIds: body?.categoryIds || [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      if (method === "DELETE") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Producto eliminado correctamente",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // Metrics
    if (url.includes("/api/admin/metrics")) {
      return new Response(
        JSON.stringify({
          totalProducts: INITIAL_PRODUCTS.length,
          visibleProducts: INITIAL_PRODUCTS.filter((p) => p.visible).length,
          hiddenProducts: INITIAL_PRODUCTS.filter((p) => !p.visible).length,
          totalCategories: INITIAL_CATEGORIES.length,
          totalBrands: INITIAL_BRANDS.length,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  if (originalFetch) {
    return originalFetch(input, init);
  }

  return new Response("Not Found", { status: 404 });
};
