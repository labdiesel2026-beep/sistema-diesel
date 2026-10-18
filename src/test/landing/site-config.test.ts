import { describe, expect, it } from "vitest";
import { SITE_CONFIG } from "@/config/site-config";

describe("Módulo de Configuración Centralizada (site-config.ts)", () => {
  it("contiene los datos de contacto y ubicación física requeridos", () => {
    // Validación del teléfono oficial (Placeholder pendiente DA-01)
    expect(SITE_CONFIG.phone).toBe("5491112345678");

    // Validación de la dirección física (RF-05, DA-02)
    expect(SITE_CONFIG.address).toContain(
      "Pres. Juan Domingo Perón 1215, Villa Mercedes, San Luis",
    );

    // Validación de los horarios de atención (RF-05, DA-05)
    expect(SITE_CONFIG.businessHours).toBe("Lunes a Viernes de 9:00 a 18:00 h");
  });

  it("define la denominación tipográfica y eslogan institucional estático", () => {
    // Denominación tipográfica (DA-03)
    expect(SITE_CONFIG.name).toBe("Laboratorio Diésel");

    // Eslogan estático (RF-02)
    expect(SITE_CONFIG.tagline).toBe("Especialistas en inyección diésel");

    // Propuestas de valor (RF-02)
    expect(SITE_CONFIG.valueProps).toContain("Más de 20 años en el rubro");
    expect(SITE_CONFIG.valueProps).toContain(
      "Equipamiento de última generación para la reparación y calibración de bombas e inyectores",
    );
  });

  it("define los mensajes pre-formateados de WhatsApp requeridos", () => {
    // RF-04: Garantía
    expect(SITE_CONFIG.whatsappMessages.warranty).toContain(
      "Motivo: Consulta por garantía / soporte post-venta.",
    );

    // RF-07: Consulta general
    expect(SITE_CONFIG.whatsappMessages.general).toContain(
      "Motivo: Consulta general / solicitar turno.",
    );
  });

  it("incluye al menos 4 servicios con título y descripción para la grilla", () => {
    // RF-03: Al menos 4 servicios
    expect(SITE_CONFIG.services.length).toBeGreaterThanOrEqual(4);

    for (const service of SITE_CONFIG.services) {
      expect(service.id).toBeTruthy();
      expect(service.title).toBeTruthy();
      expect(service.description).toBeTruthy();
      expect(service.icon).toBeTruthy();
    }
  });

  it("contiene los enlaces áncora de navegación principal", () => {
    // RF-01, RF-08: Enlaces a secciones
    const expectedAnchors = [
      "#inicio",
      "#servicios",
      "#garantias",
      "#ubicacion",
      "#contacto",
    ];
    const actualAnchors = SITE_CONFIG.navLinks.map((link) => link.href);

    for (const anchor of expectedAnchors) {
      expect(actualAnchors).toContain(anchor);
    }
  });
});
