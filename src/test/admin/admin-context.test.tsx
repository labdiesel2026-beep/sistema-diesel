import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AdminProvider, useAdmin } from "@/context/admin-context";
import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
} from "@/test/fixtures/admin-fixtures";

describe("Store de Administración y Reglas de Integridad Referencial (AdminProvider) — Tarea 4.3 y 8.4", () => {
  it("debe inicializar el estado con datos semilla normalizados", () => {
    const { result } = renderHook(() => useAdmin(), {
      wrapper: AdminProvider,
    });

    expect(result.current.categories.length).toBe(INITIAL_CATEGORIES.length);
    expect(result.current.brands.length).toBe(INITIAL_BRANDS.length);
    expect(result.current.products.length).toBe(INITIAL_PRODUCTS.length);
  });

  // -------------------------------------------------------------------------
  // 1) Integridad Referencial de Categorías (RF-10, RF-11, CL-04, CL-05, CL-06)
  // -------------------------------------------------------------------------
  describe("Integridad Referencial de Categorías", () => {
    it("debe bloquear la eliminación de una categoría vinculada a productos", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      // "e4b6d812-7a2b-4f51-b8f3-0a567c891002" es "Inyectores Common Rail", vinculado a Amarok, Ranger, Hilux
      const categoryIdWithProducts = "e4b6d812-7a2b-4f51-b8f3-0a567c891002";

      const check = result.current.canDeleteCategory(categoryIdWithProducts);
      expect(check.allowed).toBe(false);
      expect(check.blocked).toBe(true);
      expect(check.affectedProducts).toBeDefined();
      expect(check.affectedProducts?.length).toBeGreaterThan(0);
      expect(check.affectedProducts).toContain("Inyector Amarok 2.0 TDI");

      let deleteRes: any;
      await act(async () => {
        deleteRes = await result.current.deleteCategory(categoryIdWithProducts);
      });

      expect(deleteRes).toEqual({
        success: false,
        blocked: true,
        reason:
          "No se puede eliminar la categoría porque contiene productos asociados. Debe reasignarlos antes de continuar.",
        affectedProducts: expect.arrayContaining(["Inyector Amarok 2.0 TDI"]),
      });

      // Verifica que no fue removida
      expect(
        result.current.categories.some((c) => c.id === categoryIdWithProducts)
      ).toBe(true);
    });

    it("debe bloquear la eliminación de una categoría padre con subcategorías asociadas", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      // "e4b6d812-7a2b-4f51-b8f3-0a567c891001" es raíz y tiene 2 hijas
      const rootCategoryWithChildren = "e4b6d812-7a2b-4f51-b8f3-0a567c891001";

      const check = result.current.canDeleteCategory(rootCategoryWithChildren);
      expect(check.allowed).toBe(false);
      expect(check.blocked).toBe(true);
      expect(check.reason).toContain("posee subcategorías vinculadas");

      let deleteRes: any;
      await act(async () => {
        deleteRes = await result.current.deleteCategory(rootCategoryWithChildren);
      });

      expect(deleteRes?.success).toBe(false);
      expect(deleteRes?.blocked).toBe(true);
    });

    it("debe permitir eliminar una categoría que no tenga productos ni subcategorías", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      // Creamos una categoría limpia sin productos
      let newCatId = "";
      await act(async () => {
        const createRes = await result.current.createCategory({
          name: "Categoría Temporal Vacía",
          parentId: null,
        });
        newCatId = createRes.category?.id ?? "";
      });

      expect(newCatId).toBeTruthy();

      const check = result.current.canDeleteCategory(newCatId);
      expect(check.allowed).toBe(true);
      expect(check.blocked).toBe(false);

      let deleteRes: any;
      await act(async () => {
        deleteRes = await result.current.deleteCategory(newCatId);
      });

      expect(deleteRes?.success).toBe(true);
      expect(
        result.current.categories.some((c) => c.id === newCatId)
      ).toBe(false);
    });

    it("debe impedir convertir una categoría padre con hijas en una subcategoría (Prevención de ciclos CL-05)", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      const rootWithChildren = "e4b6d812-7a2b-4f51-b8f3-0a567c891001";
      const anotherRoot = "e4b6d812-7a2b-4f51-b8f3-0a567c891004";

      let updateRes: any;
      await act(async () => {
        updateRes = await result.current.updateCategory(rootWithChildren, {
          name: "Inyección Common Rail Modificada",
          parentId: anotherRoot,
        });
      });

      expect(updateRes?.success).toBe(false);
      expect(updateRes?.reason).toContain(
        "No se puede convertir una categoría padre con subcategorías asociadas"
      );
    });

    it("debe respetar el límite de 1 nivel: no permite asignar como padre una subcategoría", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      const childCategory = "e4b6d812-7a2b-4f51-b8f3-0a567c891002"; // Es subcategoría

      let createRes: any;
      await act(async () => {
        createRes = await result.current.createCategory({
          name: "Sub-subcategoría no permitida",
          parentId: childCategory,
        });
      });

      expect(createRes?.success).toBe(false);
      expect(createRes?.reason).toContain(
        "solo puede tener como padre una categoría principal de nivel raíz"
      );
    });
  });

  // -------------------------------------------------------------------------
  // 2) Integridad Referencial de Marcas y Renombrado Relacional (RF-12, CA-12.3, CA-12.4, CL-06, CL-09)
  // -------------------------------------------------------------------------
  describe("Integridad y Operaciones de Marcas", () => {
    it("debe bloquear la eliminación de una marca asignada a productos (CA-12.3, CL-06)", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      // Bosch ("b1a2c3d4-0001-4000-8000-000000000001") está asignada a Amarok y Sprinter
      const boschId = "b1a2c3d4-0001-4000-8000-000000000001";

      const check = result.current.canDeleteBrand(boschId);
      expect(check.allowed).toBe(false);
      expect(check.blocked).toBe(true);
      expect(check.affectedProducts).toBeDefined();
      expect(check.affectedProducts).toContain("Inyector Amarok 2.0 TDI");
      expect(check.affectedProducts).toContain("Inyector Sprinter 2.2 CDI");

      let deleteRes: any;
      await act(async () => {
        deleteRes = await result.current.deleteBrand(boschId);
      });

      expect(deleteRes).toEqual({
        success: false,
        blocked: true,
        reason:
          "No se puede eliminar la marca porque contiene productos asociados. Debe reasignarlos antes de continuar.",
        affectedProducts: expect.arrayContaining([
          "Inyector Amarok 2.0 TDI",
          "Inyector Sprinter 2.2 CDI",
        ]),
      });

      // Verifica que no fue removida del estado
      expect(result.current.brands.some((b) => b.id === boschId)).toBe(true);
    });

    it("debe permitir eliminar una marca cuando no tiene productos vinculados (CA-12.5)", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      // Crear marca sin productos
      let newBrandId = "";
      await act(async () => {
        const createRes = await result.current.createBrand({ name: "Siemens VDO" });
        newBrandId = createRes.brand?.id ?? "";
      });

      expect(newBrandId).toBeTruthy();

      const check = result.current.canDeleteBrand(newBrandId);
      expect(check.allowed).toBe(true);
      expect(check.blocked).toBe(false);

      let deleteRes: any;
      await act(async () => {
        deleteRes = await result.current.deleteBrand(newBrandId);
      });

      expect(deleteRes?.success).toBe(true);
      expect(result.current.brands.some((b) => b.id === newBrandId)).toBe(false);
    });

    it("debe reflejar el nuevo nombre relacionalmente por UUID al renombrar una marca (CA-12.4, CL-09)", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      const boschId = "b1a2c3d4-0001-4000-8000-000000000001";
      const oldName = result.current.getBrandById(boschId)?.name;
      expect(oldName).toBe("Bosch");

      // Renombrar la marca conservando el UUID
      await act(async () => {
        const updateRes = await result.current.updateBrand(boschId, {
          name: "Bosch Rexroth Motorsport",
        });
        expect(updateRes.success).toBe(true);
      });

      // Comprobar que el UUID de la marca es exactamente el mismo
      const updatedBrand = result.current.getBrandById(boschId);
      expect(updatedBrand?.id).toBe(boschId);
      expect(updatedBrand?.name).toBe("Bosch Rexroth Motorsport");

      // Comprobar que los productos vinculados resuelven el nuevo nombre sin cambiar su brandId (cero desnormalización)
      const linkedProducts = result.current.products.filter(
        (p) => p.brandId === boschId
      );
      expect(linkedProducts.length).toBeGreaterThan(0);

      linkedProducts.forEach((product) => {
        expect(product.brandId).toBe(boschId);
        const resolvedBrandName = result.current.getBrandById(
          product.brandId
        )?.name;
        expect(resolvedBrandName).toBe("Bosch Rexroth Motorsport");
      });
    });

    it("debe validar unicidad case-insensitive con trim al crear y editar marcas (CA-12.1, CA-12.2)", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      // Longitud mínima < 2
      await act(async () => {
        const shortRes = await result.current.createBrand({ name: " A " });
        expect(shortRes.success).toBe(false);
        expect(shortRes.reason).toContain("al menos 2 caracteres");
      });

      // Unicidad duplicada case-insensitive
      await act(async () => {
        const dupRes = await result.current.createBrand({ name: "  delphi  " });
        expect(dupRes.success).toBe(false);
        expect(dupRes.reason).toContain("Ya existe una marca con este nombre");
      });
    });
  });

  // -------------------------------------------------------------------------
  // 3) Operaciones de Productos y Toggle de Visibilidad (RF-05, RF-06, RF-07, CA-06.1)
  // -------------------------------------------------------------------------
  describe("Operaciones de Productos y Conmutación de Visibilidad", () => {
    it("debe conmutar reactivamente la visibilidad de un producto con toggleVisibility (RF-06, CA-06.1)", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      const product = result.current.products[0];
      expect(product).toBeDefined();
      if (!product) return;
      const initialVisibility = product.visible;

      // 1. Conmutar a estado inverso
      await act(async () => {
        const res = await result.current.toggleVisibility(product.id);
        expect(res.success).toBe(true);
        expect(res.product?.visible).toBe(!initialVisibility);
      });

      const toggledProduct = result.current.products.find(
        (p) => p.id === product.id
      );
      expect(toggledProduct?.visible).toBe(!initialVisibility);

      // 2. Conmutar de vuelta al estado original
      await act(async () => {
        await result.current.toggleProductVisibility(product.id);
      });

      const restoredProduct = result.current.products.find(
        (p) => p.id === product.id
      );
      expect(restoredProduct?.visible).toBe(initialVisibility);
    });

    it("debe crear, editar y eliminar un producto manteniendo la consistencia", async () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      let createdProductId = "";

      // 1. Crear producto
      await act(async () => {
        const res = await result.current.createProduct({
          name: "Inyector Test Nuevo",
          description: "Descripción de prueba para verificar creación",
          imageUrl: "/uploads/test.webp",
          categoryIds: ["e4b6d812-7a2b-4f51-b8f3-0a567c891002"],
          brandId: "b1a2c3d4-0001-4000-8000-000000000001",
          vehicleCompatibility: "Vehículo Test",
          condition: "Nuevo",
          price: 150000,
          showPrice: true,
          visible: true,
          oem: "OEM-9999",
        });

        expect(res.success).toBe(true);
        expect(res.product?.id).toBeTruthy();
        createdProductId = res.product?.id ?? "";
      });

      expect(
        result.current.products.some((p) => p.id === createdProductId)
      ).toBe(true);

      // 2. Editar producto
      await act(async () => {
        const updateRes = await result.current.updateProduct(createdProductId, {
          price: 180000,
          condition: "Reacondicionado",
        });
        expect(updateRes.success).toBe(true);
        expect(updateRes.product?.price).toBe(180000);
        expect(updateRes.product?.condition).toBe("Reacondicionado");
      });

      // 3. Eliminar producto
      await act(async () => {
        const deleteRes = await result.current.deleteProduct(createdProductId);
        expect(deleteRes.success).toBe(true);
      });

      expect(
        result.current.products.some((p) => p.id === createdProductId)
      ).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 4) Prevención de Excepciones RegExp en Búsqueda (CA-06.4, CL-11)
  // -------------------------------------------------------------------------
  describe("Búsqueda Sanitizada de Productos (CL-11)", () => {
    it("debe operar con caracteres especiales de RegExp sin arrojar excepciones de sintaxis", () => {
      const { result } = renderHook(() => useAdmin(), {
        wrapper: AdminProvider,
      });

      // Caracteres que romperían una RegExp no escapada: [ , * , \ , ( , ? , +
      expect(() => {
        const res1 = result.current.searchProducts("[");
        expect(Array.isArray(res1)).toBe(true);
      }).not.toThrow();

      expect(() => {
        const res2 = result.current.searchProducts("*");
        expect(Array.isArray(res2)).toBe(true);
      }).not.toThrow();

      expect(() => {
        const res3 = result.current.searchProducts("\\");
        expect(Array.isArray(res3)).toBe(true);
      }).not.toThrow();

      expect(() => {
        const res4 = result.current.searchProducts("Amarok (2.0");
        expect(Array.isArray(res4)).toBe(true);
      }).not.toThrow();

      // Búsqueda insensible a mayúsculas
      const amarokSearch = result.current.searchProducts("AMAROK");
      expect(amarokSearch.length).toBeGreaterThan(0);
      expect(amarokSearch[0]?.name).toContain("Amarok");
    });
  });

  // -------------------------------------------------------------------------
  // 5) Manejo de Errores Fuera del Provider
  // -------------------------------------------------------------------------
  it("debe lanzar un error descriptivo si useAdmin es consumido fuera de AdminProvider", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAdmin());
    }).toThrowError("useAdmin debe ser utilizado dentro de un AdminProvider");

    consoleErrorSpy.mockRestore();
  });
});
