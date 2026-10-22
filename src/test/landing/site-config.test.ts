import { describe, expect, it } from "vitest";
import { SITE_CONFIG } from "@/config/site-config";

describe("Módulo de Configuración Centralizada (site-config.ts)", () => {
  it("contiene los datos de contacto y ubicación física requeridos", () => {
    // Validación del teléfono oficial (Placeholder pendiente DA-01)
    expect(SITE_CONFIG.phone).toBe("5492657659108");

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

  it("incluye exactamente los 4 bloques técnicos definitivos para el Bento Grid (RF-02.1, RF-02.2)", () => {
    expect(SITE_CONFIG.services.length).toBe(4);

    const expectedIds = [
      "banco-pruebas",
      "bombas-inyectoras",
      "inyectores-common-rail",
      "diagnostico-repuestos",
    ];

    const actualIds = SITE_CONFIG.services.map((s) => s.id);
    expect(actualIds).toEqual(expectedIds);

    for (const service of SITE_CONFIG.services) {
      expect(service.id).toBeTruthy();
      expect(service.title).toBeTruthy();
      expect(service.description).toBeTruthy();
      expect(service.icon).toBeTruthy();
      expect(service.image).toBeTruthy();
      expect(service.badges.length).toBeGreaterThanOrEqual(2);
      expect(service.colSpanDesktop).toBeTruthy();
    }

    // Cláusula de transparencia técnica
    expect(SITE_CONFIG.servicesTransparencyClause).toContain(
      "repuestos legítimos de primer equipo (OEM) y líneas alternativas homologadas",
    );
  });

  it("expone la nómina oficial inmutable de las 10 marcas del taller (RF-03.2)", () => {
    expect(SITE_CONFIG.workshopBrands.length).toBe(10);

    const expectedBrandIds = [
      "bosch",
      "zexel",
      "denso",
      "siemens-vdo",
      "delphi",
      "caterpillar",
      "cummins",
      "stanadyne",
      "diesel-kiki",
      "perkins",
    ];

    const actualBrandIds = SITE_CONFIG.workshopBrands.map((b) => b.id);
    expect(actualBrandIds).toEqual(expectedBrandIds);
  });

  it("define de forma inmutable los 4 ejes normativos de políticas comerciales y garantía (RF-04.1)", () => {
    expect(SITE_CONFIG.commercialPolicies.axes.length).toBe(4);

    const axes = SITE_CONFIG.commercialPolicies.axes;
    expect(axes[0]?.title).toContain("Eje 1: Alcance de Cotizaciones y Precios Publicados");
    expect(axes[0]?.content).toContain("carácter orientativo y referencial");

    expect(axes[1]?.title).toContain("Eje 2: Garantía de Calibración y Laboratorio");
    expect(axes[1]?.content).toContain("garantía técnica de 30 días corridos");

    expect(axes[2]?.title).toContain("Eje 3: Repuestos Originales y Alternativos");
    expect(axes[2]?.content).toContain("absoluta transparencia técnica");

    expect(axes[3]?.title).toContain("Eje 4: Recepción, Envíos y Comisionistas");
    expect(axes[3]?.content).toContain("comisionistas de confianza y empresas de encomienda");
  });

  it("contiene los enlaces áncora de navegación principal", () => {
    const expectedAnchors = ["#inicio", "#servicios", "#garantias", "#ubicacion"];
    const actualAnchors = SITE_CONFIG.navLinks.map((link) => link.href);

    expect(actualAnchors).toHaveLength(4);
    for (const anchor of expectedAnchors) {
      expect(actualAnchors).toContain(anchor);
    }
  });

  it("expone los activos fotográficos WebP del taller", () => {
    expect(SITE_CONFIG.workshopImages.hero).toBeTruthy();
    expect(SITE_CONFIG.workshopImages.bancoPruebas).toBeTruthy();
    expect(SITE_CONFIG.workshopImages.diagnosticoElectronico).toBeTruthy();
    expect(SITE_CONFIG.workshopImages.inyectoresDetalle).toBeTruthy();
    expect(SITE_CONFIG.workshopImages.fachadaLocal).toBeTruthy();
  });
});
