/**
 * Generador de Mensajes y URLs de Consulta para WhatsApp (wa.me).
 * (Spec 003, RF-05, RF-06, RF-07, RF-09, RF-10, Bloque 4 - Tareas T-09, T-10, T-11)
 *
 * Utiliza el número centralizado inmutable de SITE_CONFIG.phone y
 * la utilidad universal de codificación RFC 3986 buildWhatsAppUrl().
 */

import { SITE_CONFIG } from "@/config/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp-utils";
import type { EnrichedCartItem } from "@/types/catalog";

/**
 * Formatea un importe numérico en pesos argentinos según estándar local.
 */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("es-AR")} ARS`;
}

export interface DirectProductParam {
  name: string;
  oem?: string | null;
  price: number | null;
  showPrice: boolean;
  condition?: string | null;
  vehicleCompatibility?: string | null;
}

/**
 * Genera la URL de WhatsApp para consultar directamente por un producto individual (RF-09).
 * Asume e incluye automáticamente una cantidad de 1 unidad.
 */
export function generateDirectProductWhatsAppUrl(
  product: DirectProductParam,
  brandName = "",
  customPhone = SITE_CONFIG.phone,
): string {
  const priceDisplay =
    product.showPrice && product.price !== null ? formatPrice(product.price) : "A cotizar";

  const lines = [
    "Hola, me contacto desde la web de Laboratorio Diésel.",
    "Quisiera consultar por el siguiente repuesto:",
    "",
    `1x ${product.name}`,
    brandName ? `Marca: ${brandName}` : null,
    product.oem ? `Código OEM: ${product.oem}` : null,
    `Precio: ${priceDisplay}`,
    "",
    "¿Podrían confirmarme compatibilidad técnica y disponibilidad de entrega?",
  ].filter((line): line is string => line !== null);

  const message = lines.join("\n");
  return buildWhatsAppUrl(customPhone, message);
}

/**
 * Genera la URL de WhatsApp para enviar el pedido completo del carrito con datos enriquecidos (RF-10).
 * Calcula el subtotal de productos con precio, discrimina ítems a cotizar y señala
 * advertencias para ítems que requieren reconfirmación de vigencia (RF-11, RF-12).
 */
export function generateCartWhatsAppUrl(
  enrichedItems: EnrichedCartItem[],
  customPhone = SITE_CONFIG.phone,
): string {
  if (!enrichedItems.length) {
    throw new Error("El carrito no contiene productos para cotizar.");
  }

  const lines: string[] = [
    "Hola, me contacto desde la web de Laboratorio Diésel.",
    "Quisiera solicitar cotización para los siguientes repuestos:",
    "",
  ];

  let subtotalPriced = 0;
  let hasQuotes = false;
  let hasReconfirmation = false;

  enrichedItems.forEach((item, index) => {
    let priceLabel = "";

    if (item.requiresReconfirmation) {
      priceLabel = "A cotizar (Requiere reconfirmación con taller)";
      hasReconfirmation = true;
      hasQuotes = true;
    } else if (item.showPrice && item.price !== null) {
      const itemTotal = item.price * item.quantity;
      subtotalPriced += itemTotal;
      priceLabel =
        item.quantity > 1
          ? `${formatPrice(itemTotal)} (${formatPrice(item.price)} c/u)`
          : formatPrice(itemTotal);
    } else {
      priceLabel = "A cotizar";
      hasQuotes = true;
    }

    const brandPart = item.brandName ? ` | Marca: ${item.brandName}` : "";
    const oemPart = item.oem ? ` | OEM: ${item.oem}` : "";

    lines.push(
      `${index + 1}. ${item.quantity}x ${item.name}${brandPart}${oemPart} -> ${priceLabel}`,
    );
  });

  lines.push("");

  if (subtotalPriced > 0) {
    lines.push(`Subtotal productos con precio público: ${formatPrice(subtotalPriced)}`);
  }

  if (hasQuotes) {
    lines.push("* Solicito cotización actualizada de los productos sin precio público.");
  }

  if (hasReconfirmation) {
    lines.push("⚠️ Algunos productos requieren verificar vigencia actual en taller.");
  }

  lines.push("¿Podrían confirmarme compatibilidad técnica y disponibilidad de entrega?");

  const message = lines.join("\n");
  return buildWhatsAppUrl(customPhone, message);
}

/**
 * Genera la URL de WhatsApp para asistir al usuario cuando la búsqueda o filtros
 * no arrojaron resultados (RF-05).
 * Preserva en el texto el término buscado y los filtros que estaban activos.
 */
export function generateNoResultsWhatsAppUrl(
  searchQuery = "",
  activeBrandNames: string[] = [],
  activeCategoryNames: string[] = [],
  customPhone = SITE_CONFIG.phone,
): string {
  const lines: string[] = [
    "Hola, me contacto desde la web de Laboratorio Diésel.",
    "Estuve buscando un repuesto en el catálogo pero no encontré resultados con mis criterios:",
    "",
  ];

  const cleanQuery = searchQuery.trim();
  if (cleanQuery) {
    lines.push(`- Búsqueda: "${cleanQuery}"`);
  }

  const cleanBrands = activeBrandNames.filter((b) => b && b.trim() !== "");
  if (cleanBrands.length) {
    lines.push(`- Marcas: ${cleanBrands.join(", ")}`);
  }

  const cleanCategories = activeCategoryNames.filter((c) => c && c.trim() !== "");
  if (cleanCategories.length) {
    lines.push(`- Categorías: ${cleanCategories.join(", ")}`);
  }

  if (!cleanQuery && !cleanBrands.length && !cleanCategories.length) {
    lines.push("- Consulta general sobre repuestos diésel disponibles.");
  }

  lines.push("");
  lines.push("¿Podrían confirmarme si disponen o pueden conseguir esta pieza o similar?");

  const message = lines.join("\n");
  return buildWhatsAppUrl(customPhone, message);
}
