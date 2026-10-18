import { describe, expect, it } from "vitest";
import { validateContactForm } from "@/components/landing/contact-validation";
import { FORM_VALIDATION_RULES } from "@/components/landing/types";

describe("Validación del Formulario de Contacto (contact-validation.ts)", () => {
  it("rechaza campos completamente vacíos y genera mensajes de error obligatorios", () => {
    const result = validateContactForm({
      nombre: "",
      contacto: "",
      mensaje: "",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.nombre).toBe(FORM_VALIDATION_RULES.nombre.requiredMessage);
    expect(result.errors.contacto).toBe(FORM_VALIDATION_RULES.contacto.requiredMessage);
    expect(result.errors.mensaje).toBe(FORM_VALIDATION_RULES.mensaje.requiredMessage);
  });

  it("rechaza campos que contienen únicamente espacios en blanco tras aplicar trim() (CL-03)", () => {
    const result = validateContactForm({
      nombre: "     ",
      contacto: "       ",
      mensaje: "            ",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.nombre).toBe(FORM_VALIDATION_RULES.nombre.requiredMessage);
    expect(result.errors.contacto).toBe(FORM_VALIDATION_RULES.contacto.requiredMessage);
    expect(result.errors.mensaje).toBe(FORM_VALIDATION_RULES.mensaje.requiredMessage);
  });

  describe("Restricciones de longitud de campos (min / max)", () => {
    it("valida la longitud mínima y máxima del Nombre (2 - 100 caracteres)", () => {
      // 1 carácter útil (inválido por mínimo)
      const tooShort = validateContactForm({
        nombre: " A ",
        contacto: "1122334455",
        mensaje: "Mensaje válido de prueba para consulta técnica.",
      });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.errors.nombre).toBe(FORM_VALIDATION_RULES.nombre.lengthMessage);

      // 101 caracteres (inválido por máximo)
      const tooLong = validateContactForm({
        nombre: "A".repeat(101),
        contacto: "1122334455",
        mensaje: "Mensaje válido de prueba para consulta técnica.",
      });
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.errors.nombre).toBe(FORM_VALIDATION_RULES.nombre.lengthMessage);
    });

    it("valida la longitud mínima y máxima del Contacto (5 - 100 caracteres)", () => {
      // 4 caracteres (inválido por mínimo)
      const tooShort = validateContactForm({
        nombre: "Carlos Gómez",
        contacto: "1234",
        mensaje: "Mensaje válido de prueba para consulta técnica.",
      });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.errors.contacto).toBe(FORM_VALIDATION_RULES.contacto.lengthMessage);

      // 101 caracteres (inválido por máximo)
      const tooLong = validateContactForm({
        nombre: "Carlos Gómez",
        contacto: "a".repeat(101),
        mensaje: "Mensaje válido de prueba para consulta técnica.",
      });
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.errors.contacto).toBe(FORM_VALIDATION_RULES.contacto.lengthMessage);
    });

    it("valida la longitud mínima y máxima del Mensaje (10 - 1000 caracteres)", () => {
      // 9 caracteres (inválido por mínimo)
      const tooShort = validateContactForm({
        nombre: "Carlos Gómez",
        contacto: "carlos@taller.com",
        mensaje: "Hola 1234",
      });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.errors.mensaje).toBe(FORM_VALIDATION_RULES.mensaje.lengthMessage);

      // 1001 caracteres (inválido por máximo)
      const tooLong = validateContactForm({
        nombre: "Carlos Gómez",
        contacto: "carlos@taller.com",
        mensaje: "M".repeat(1001),
      });
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.errors.mensaje).toBe(FORM_VALIDATION_RULES.mensaje.lengthMessage);
    });
  });

  it("acepta entradas válidas y devuelve cleanedValues con espacios recortados", () => {
    const rawData = {
      nombre: "   Esteban Quito   ",
      contacto: "   esteban@diesel.com.ar   ",
      mensaje: "   Necesito cotización para recambio de 4 inyectores Toyota Hilux.   ",
    };

    const result = validateContactForm(rawData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.cleanedValues.nombre).toBe("Esteban Quito");
    expect(result.cleanedValues.contacto).toBe("esteban@diesel.com.ar");
    expect(result.cleanedValues.mensaje).toBe(
      "Necesito cotización para recambio de 4 inyectores Toyota Hilux.",
    );
  });
});
