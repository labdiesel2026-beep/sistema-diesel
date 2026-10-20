import { describe, expect, it } from "vitest";
import {
  generateDirectProductWhatsAppUrl,
  generateCartWhatsAppUrl,
  generateNoResultsWhatsAppUrl,
  formatPrice,
} from "@/lib/catalog-whatsapp";
import { SITE_CONFIG } from "@/config/site-config";
import type { CatalogProduct, EnrichedCartItem } from "@/types/catalog";

describe("Catalog WhatsApp URL Generator (T-09, T-10, T-11)", () => {
  const sampleProduct: CatalogProduct = {
    id: "a0f1e2d3-1111-4000-8000-111111111111",
    name: "Inyector Amarok 2.0 TDI",
    description: "Inyector Common Rail",
    imageUrl: "/uploads/amarok.webp",
    brandId: "brand-bosch",
    categoryIds: ["cat-1"],
    vehicleCompatibility: "Volkswagen Amarok",
    condition: "Nuevo",
    price: 320000,
    showPrice: true,
    visible: true,
    oem: "0445110369",
  };

  it("genera consulta directa con telefono oficial cantidad uno y precio correcto", () => {
    // 1. Producto con precio público visible
    const url = generateDirectProductWhatsAppUrl(sampleProduct, "Bosch");
    const sanitizedOfficialPhone = SITE_CONFIG.phone.replace(/\D/g, "");

    expect(url.startsWith(`https://wa.me/${sanitizedOfficialPhone}?text=`)).toBe(true);

    const queryPart = url.split("?text=")[1]!;
    const decodedMessage = decodeURIComponent(queryPart);

    // Verificar contenido del mensaje pre-estructurado (RF-09)
    expect(decodedMessage).toContain("1x Inyector Amarok 2.0 TDI");
    expect(decodedMessage).toContain("Marca: Bosch");
    expect(decodedMessage).toContain("Código OEM: 0445110369");
    expect(decodedMessage).toContain("Precio: $320.000 ARS");
    expect(decodedMessage).toContain(
      "¿Podrían confirmarme compatibilidad técnica y disponibilidad de entrega?",
    );

    // 2. Producto sin precio público visible (showPrice === false) -> debe mostrar "A cotizar"
    const quoteProduct: CatalogProduct = {
      ...sampleProduct,
      price: null,
      showPrice: false,
    };
    const quoteUrl = generateDirectProductWhatsAppUrl(quoteProduct, "Bosch");
    const quoteMessage = decodeURIComponent(quoteUrl.split("?text=")[1]!);
    expect(quoteMessage).toContain("Precio: A cotizar");
    expect(quoteMessage).not.toContain("ARS");

    // 3. Producto con precio cargado pero con showPrice === false -> también "A cotizar"
    const hiddenPriceProduct: CatalogProduct = {
      ...sampleProduct,
      price: 250000,
      showPrice: false,
    };
    const hiddenUrl = generateDirectProductWhatsAppUrl(hiddenPriceProduct, "Bosch");
    const hiddenMessage = decodeURIComponent(hiddenUrl.split("?text=")[1]!);
    expect(hiddenMessage).toContain("Precio: A cotizar");

    // 4. Producto sin código OEM (omite la línea sin texto vacío)
    const noOemProduct: CatalogProduct = {
      ...sampleProduct,
      oem: null,
    };
    const noOemUrl = generateDirectProductWhatsAppUrl(noOemProduct, "Bosch");
    const noOemMessage = decodeURIComponent(noOemUrl.split("?text=")[1]!);
    expect(noOemMessage).not.toContain("Código OEM:");

    // 5. Utilidad de formateo de precio
    expect(formatPrice(500000)).toBe("$500.000 ARS");
  });

  it("genera mensaje de carrito con items subtotal y notas de reconfirmacion", () => {
    const sampleEnrichedItems: EnrichedCartItem[] = [
      // 1. Ítem con precio visible y cantidad > 1
      {
        productId: "p-1",
        quantity: 2,
        name: "Inyector Amarok 2.0 TDI",
        oem: "0445110369",
        imageUrl: "/uploads/amarok.webp",
        brandName: "Bosch",
        condition: "Nuevo",
        price: 320000,
        showPrice: true,
        visible: true,
        requiresReconfirmation: false,
        isDeletedOrUnavailable: false,
      },
      // 2. Ítem a cotizar (sin precio cargado)
      {
        productId: "p-2",
        quantity: 1,
        name: "Inyector Ranger 3.2 TDCi",
        oem: "28236381",
        imageUrl: "/uploads/ranger.webp",
        brandName: "Delphi",
        condition: "Reacondicionado",
        price: null,
        showPrice: false,
        visible: true,
        requiresReconfirmation: false,
        isDeletedOrUnavailable: false,
      },
      // 3. Ítem que requiere reconfirmación (ocultado o eliminado de la DB)
      {
        productId: "p-3",
        quantity: 1,
        name: "Inyector Hilux Descontinuado",
        oem: "23670-0L050",
        imageUrl: "",
        brandName: "No disponible",
        condition: "Usado",
        price: null,
        showPrice: false,
        visible: false,
        requiresReconfirmation: true,
        isDeletedOrUnavailable: true,
      },
    ];

    const url = generateCartWhatsAppUrl(sampleEnrichedItems);
    const sanitizedPhone = SITE_CONFIG.phone.replace(/\D/g, "");

    expect(url.startsWith(`https://wa.me/${sanitizedPhone}?text=`)).toBe(true);

    const message = decodeURIComponent(url.split("?text=")[1]!);

    // Formato de líneas de pedido enumeradas
    expect(message).toContain(
      "1. 2x Inyector Amarok 2.0 TDI | Marca: Bosch | OEM: 0445110369 -> $640.000 ARS ($320.000 ARS c/u)",
    );
    expect(message).toContain(
      "2. 1x Inyector Ranger 3.2 TDCi | Marca: Delphi | OEM: 28236381 -> A cotizar",
    );
    expect(message).toContain(
      "3. 1x Inyector Hilux Descontinuado | Marca: No disponible | OEM: 23670-0L050 -> A cotizar (Requiere reconfirmación con taller)",
    );

    // Subtotal de productos con precio ($320.000 * 2 = $640.000)
    expect(message).toContain("Subtotal productos con precio público: $640.000 ARS");

    // Advertencia de cotización para los productos sin precio público
    expect(message).toContain(
      "* Solicito cotización actualizada de los productos sin precio público.",
    );

    // Advertencia de reconfirmación para piezas no vigentes
    expect(message).toContain(
      "⚠️ Algunos productos requieren verificar vigencia actual en taller.",
    );

    // Intento de generar carrito vacío debe arrojar error (RF-08, CL-07)
    expect(() => generateCartWhatsAppUrl([])).toThrow(
      "El carrito no contiene productos para cotizar.",
    );
  });

  it("genera consulta contextualizada para estado sin resultados", () => {
    // 1. Con búsqueda y filtros combinados (RF-05)
    const urlWithContext = generateNoResultsWhatsAppUrl(
      "0445110369",
      ["Bosch", "Delphi"],
      ["Inyectores Common Rail"],
    );
    const sanitizedPhone = SITE_CONFIG.phone.replace(/\D/g, "");
    expect(urlWithContext.startsWith(`https://wa.me/${sanitizedPhone}?text=`)).toBe(true);

    const msg = decodeURIComponent(urlWithContext.split("?text=")[1]!);
    expect(msg).toContain('- Búsqueda: "0445110369"');
    expect(msg).toContain("- Marcas: Bosch, Delphi");
    expect(msg).toContain("- Categorías: Inyectores Common Rail");
    expect(msg).toContain(
      "¿Podrían confirmarme si disponen o pueden conseguir esta pieza o similar?",
    );

    // 2. Con solo término de búsqueda
    const urlQueryOnly = generateNoResultsWhatsAppUrl("Bomba CP4");
    const msgQueryOnly = decodeURIComponent(urlQueryOnly.split("?text=")[1]!);
    expect(msgQueryOnly).toContain('- Búsqueda: "Bomba CP4"');
    expect(msgQueryOnly).not.toContain("- Marcas:");
    expect(msgQueryOnly).not.toContain("- Categorías:");

    // 3. Con solo marcas filtradas
    const urlBrandsOnly = generateNoResultsWhatsAppUrl("", ["Denso"]);
    const msgBrandsOnly = decodeURIComponent(urlBrandsOnly.split("?text=")[1]!);
    expect(msgBrandsOnly).not.toContain("- Búsqueda:");
    expect(msgBrandsOnly).toContain("- Marcas: Denso");

    // 4. Sin ningún filtro ni búsqueda (consulta general de catálogo vacío)
    const urlEmpty = generateNoResultsWhatsAppUrl("", [], []);
    const msgEmpty = decodeURIComponent(urlEmpty.split("?text=")[1]!);
    expect(msgEmpty).toContain("- Consulta general sobre repuestos diésel disponibles.");
  });
});
