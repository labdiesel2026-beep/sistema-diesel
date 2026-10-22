/**
 * Suite de pruebas unitarias para totales de carrito y checkout mixto de WhatsApp
 * (Spec 009, Fase 4 - Tarea 4.4, RF-09, CL-03, Principio 5 de la Constitución).
 */

import { describe, expect, it } from "vitest";
import { calculateCartTotals } from "@/components/catalog/CartDrawer";
import { generateCartWhatsAppUrl } from "@/lib/catalog-whatsapp";
import type { EnrichedCartItem } from "@/types/catalog";

function createMockItem(overrides: Partial<EnrichedCartItem>): EnrichedCartItem {
  return {
    productId: "prod-" + Math.random().toString(36).substring(2, 7),
    quantity: 1,
    name: "Inyector Bosch Common Rail",
    oem: "0445110059",
    imageUrl: "/images/mock-injector.webp",
    brandName: "Bosch",
    condition: "Nuevo",
    price: null,
    showPrice: false,
    visible: true,
    requiresReconfirmation: false,
    isDeletedOrUnavailable: false,
    ...overrides,
  };
}

describe("Cálculo de Totales de Carrito y Checkout Mixto (Spec 009 - Tarea 4.4)", () => {
  describe("Escenario 1: Carrito exclusivo con precios públicos", () => {
    it("calcula la suma aritmética exacta y formatea la leyenda limpia", () => {
      const items: EnrichedCartItem[] = [
        createMockItem({
          name: "Inyector 1",
          price: 50000,
          showPrice: true,
          quantity: 2, // 100.000
        }),
        createMockItem({
          name: "Tobera Bosch",
          price: 25000,
          showPrice: true,
          quantity: 1, // 25.000
        }),
      ];

      const summary = calculateCartTotals(items);

      expect(summary.numericalTotal).toBe(125000);
      expect(summary.hasPricedItems).toBe(true);
      expect(summary.quoteItemsCount).toBe(0);
      expect(summary.displayLabel).toBe("$125.000 ARS");
    });

    it("genera URL de WhatsApp con total exacto y sin etiquetas de cotización pendiente", () => {
      const items: EnrichedCartItem[] = [
        createMockItem({
          name: "Válvula Reguladora",
          price: 80000,
          showPrice: true,
          quantity: 1,
        }),
      ];

      const url = generateCartWhatsAppUrl(items, undefined, { tagCotizar: true });
      const decodedMessage = decodeURIComponent(url);

      expect(decodedMessage).toContain("*TOTAL ESTIMADO:* $80.000 ARS");
      expect(decodedMessage).not.toContain("+ ÍTEMS A COTIZAR");
      expect(decodedMessage).not.toContain("PRESUPUESTO A CONFIRMAR");
      expect(decodedMessage).not.toContain("[A Cotizar]");
    });
  });

  describe("Escenario 2: Carrito mixto (precios publicados + ítems a cotizar)", () => {
    it("suma solo productos con precio y añade la leyenda '+ ÍTEMS A COTIZAR'", () => {
      const items: EnrichedCartItem[] = [
        createMockItem({
          name: "Bomba de Alta Presión",
          price: 300000,
          showPrice: true,
          quantity: 1,
        }),
        createMockItem({
          name: "Tobera Especial Denso",
          price: null,
          showPrice: false,
          quantity: 3,
        }),
      ];

      const summary = calculateCartTotals(items);

      expect(summary.numericalTotal).toBe(300000);
      expect(summary.hasPricedItems).toBe(true);
      expect(summary.quoteItemsCount).toBe(3);
      expect(summary.displayLabel).toBe("$300.000 ARS + ÍTEMS A COTIZAR");
    });

    it("genera URL de WhatsApp con etiqueta [A Cotizar] y desglose mixto explícito", () => {
      const items: EnrichedCartItem[] = [
        createMockItem({
          name: "Bomba CP1",
          price: 150000,
          showPrice: true,
          quantity: 1,
        }),
        createMockItem({
          name: "Inyector Piezoeléctrico",
          price: null,
          showPrice: false,
          quantity: 2,
        }),
      ];

      const url = generateCartWhatsAppUrl(items, undefined, { tagCotizar: true });
      const decodedMessage = decodeURIComponent(url);

      expect(decodedMessage).toContain("[A Cotizar]");
      expect(decodedMessage).toContain("*TOTAL ESTIMADO:* $150.000 ARS + ÍTEMS A COTIZAR");
      expect(decodedMessage).toContain("Solicito cotización actualizada de los productos sin precio público.");
    });
  });

  describe("Escenario 3: Carrito exclusivo a cotizar", () => {
    it("devuelve total cero y la leyenda 'PRESUPUESTO A CONFIRMAR'", () => {
      const items: EnrichedCartItem[] = [
        createMockItem({
          name: "Kit de Juntas Delphi",
          price: null,
          showPrice: false,
          quantity: 2,
        }),
        createMockItem({
          name: "Sensor de Riel",
          price: 45000,
          showPrice: false, // showPrice es false -> no es público
          quantity: 1,
        }),
      ];

      const summary = calculateCartTotals(items);

      expect(summary.numericalTotal).toBe(0);
      expect(summary.hasPricedItems).toBe(false);
      expect(summary.quoteItemsCount).toBe(3);
      expect(summary.displayLabel).toBe("PRESUPUESTO A CONFIRMAR");
    });

    it("genera URL de WhatsApp indicando PRESUPUESTO A CONFIRMAR", () => {
      const items: EnrichedCartItem[] = [
        createMockItem({
          name: "Inyector Cummins",
          price: null,
          showPrice: false,
          quantity: 1,
        }),
      ];

      const url = generateCartWhatsAppUrl(items, undefined, { tagCotizar: true });
      const decodedMessage = decodeURIComponent(url);

      expect(decodedMessage).toContain("*TOTAL ESTIMADO:* PRESUPUESTO A CONFIRMAR");
      expect(decodedMessage).toContain("[A Cotizar]");
    });
  });

  describe("Escenario 4: Carrito con producto desactualizado / reconfirmación requerida", () => {
    it("excluye del subtotal numérico a ítems con requiresReconfirmation: true", () => {
      const items: EnrichedCartItem[] = [
        createMockItem({
          name: "Inyector Vigente",
          price: 100000,
          showPrice: true,
          quantity: 1,
          requiresReconfirmation: false,
        }),
        createMockItem({
          name: "Inyector Precio Antiguo Modificado",
          price: 70000, // Aunque tenga un número en memoria, requiere reconfirmación
          showPrice: true,
          quantity: 1,
          requiresReconfirmation: true,
        }),
      ];

      const summary = calculateCartTotals(items);

      // El ítem desactualizado debe ser excluido del subtotal numérico
      expect(summary.numericalTotal).toBe(100000);
      expect(summary.hasPricedItems).toBe(true);
      expect(summary.quoteItemsCount).toBe(1);
      expect(summary.displayLabel).toBe("$100.000 ARS + ÍTEMS A COTIZAR");
    });

    it("genera advertencia de reconfirmación en el mensaje de WhatsApp y clasifica el ítem como a cotizar", () => {
      const items: EnrichedCartItem[] = [
        createMockItem({
          name: "Inyector Modificado",
          price: 50000,
          showPrice: true,
          quantity: 2,
          requiresReconfirmation: true,
        }),
      ];

      const summary = calculateCartTotals(items);
      expect(summary.numericalTotal).toBe(0);
      expect(summary.displayLabel).toBe("PRESUPUESTO A CONFIRMAR");

      const url = generateCartWhatsAppUrl(items, undefined, { tagCotizar: true });
      const decodedMessage = decodeURIComponent(url);

      expect(decodedMessage).toContain("[A Cotizar] (Requiere reconfirmación con taller)");
      expect(decodedMessage).toContain("⚠️ Algunos productos requieren verificar vigencia actual en taller.");
      expect(decodedMessage).toContain("*TOTAL ESTIMADO:* PRESUPUESTO A CONFIRMAR");
    });
  });
});
