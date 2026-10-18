import { describe, expect, it } from "vitest";
import {
  buildWhatsAppUrl,
  formatContactMessage,
  sanitizePhoneNumber,
} from "@/lib/whatsapp-utils";

describe("Utilidades de WhatsApp (whatsapp-utils.ts)", () => {
  describe("sanitizePhoneNumber", () => {
    it("elimina espacios, guiones, paréntesis y símbolos de formato internacional", () => {
      expect(sanitizePhoneNumber("+54 9 11 1234-5678")).toBe("5491112345678");
      expect(sanitizePhoneNumber("(011) 1234-5678")).toBe("01112345678");
      expect(sanitizePhoneNumber("+549-11-1234-5678")).toBe("5491112345678");
      expect(sanitizePhoneNumber("5491112345678")).toBe("5491112345678");
    });

    it("lanza un error descriptivo si el número tiene menos de 8 dígitos", () => {
      expect(() => sanitizePhoneNumber("12345")).toThrowError(
        /inválido \(mínimo 8 dígitos\)/i,
      );
      expect(() => sanitizePhoneNumber("")).toThrowError(/cadena no vacía/i);
      expect(() => sanitizePhoneNumber("   ---   ")).toThrowError(
        /inválido \(mínimo 8 dígitos\)/i,
      );
    });
  });

  describe("buildWhatsAppUrl", () => {
    const validPhone = "5491112345678";

    it("genera una URL canónica wa.me con el número sanitizado y texto codificado", () => {
      const message = "Hola, me contacto desde la web de Laboratorio Diésel.";
      const url = buildWhatsAppUrl("+54 9 11 1234-5678", message);

      expect(url).toBe(
        "https://wa.me/5491112345678?text=Hola%2C%20me%20contacto%20desde%20la%20web%20de%20Laboratorio%20Di%C3%A9sel.",
      );
    });

    it("codifica saltos de línea correctamente con %0A", () => {
      const message = "Línea 1\nLínea 2\nLínea 3";
      const url = buildWhatsAppUrl(validPhone, message);

      expect(url).toBe("https://wa.me/5491112345678?text=L%C3%ADnea%201%0AL%C3%ADnea%202%0AL%C3%ADnea%203");
    });

    it("preserva y codifica emojis y caracteres especiales sin romper la URI (CL-04)", () => {
      const message = "¡Hola! 🔧 Inyector Common Rail #0445110 & prueba de calibración 100% OK.";
      const url = buildWhatsAppUrl(validPhone, message);

      expect(url).toContain("https://wa.me/5491112345678?text=");
      // Decodificar la URL debe devolver exactamente el mensaje original
      const queryParam = url.split("?text=")[1]!;
      expect(decodeURIComponent(queryParam)).toBe(message);
    });

    it("maneja mensajes largos de hasta 1000 caracteres dentro de los límites de URL (CL-07)", () => {
      const longMessage = "Detalle del problema técnico: ".padEnd(999, "A") + "!";
      const url = buildWhatsAppUrl(validPhone, longMessage);

      expect(url.length).toBeLessThan(4000); // Muy por debajo de los límites prácticos (~8000)
      const queryParam = url.split("?text=")[1]!;
      expect(decodeURIComponent(queryParam)).toBe(longMessage);
    });

    it("devuelve la URL base sin parámetro text si el mensaje está vacío o con solo espacios", () => {
      expect(buildWhatsAppUrl(validPhone, "")).toBe("https://wa.me/5491112345678");
      expect(buildWhatsAppUrl(validPhone, "     ")).toBe("https://wa.me/5491112345678");
    });
  });

  describe("formatContactMessage", () => {
    it("interpola correctamente los datos del formulario aplicando trim() a cada campo (RF-06)", () => {
      const formatted = formatContactMessage({
        nombre: "  Juan Pérez  ",
        contacto: "   juan@ejemplo.com   ",
        mensaje: "   Consulta por calibración de bomba Bosch.   ",
      });

      expect(formatted).toBe(
        "Hola, me contacto desde la web de Laboratorio Diésel.\n" +
          "Nombre: Juan Pérez\n" +
          "Contacto: juan@ejemplo.com\n" +
          "Consulta: Consulta por calibración de bomba Bosch.",
      );
    });
  });
});
