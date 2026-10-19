import { describe, it, expect } from "vitest";
import {
  imageMetadataSchema,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/validations/admin-schemas";

describe("Esquema de Validación de Metadata de Imágenes (Zod Fail-Fast) — Tarea 2.2", () => {
  it("debe validar exitosamente archivos de imagen permitidos menores a 5 MB", () => {
    const validSamples = [
      { name: "inyector-amarok.jpg", size: 1024 * 1024, type: "image/jpeg" },
      { name: "bomba-presion.png", size: 2 * 1024 * 1024, type: "image/png" },
      { name: "tobera-delphi.webp", size: 500 * 1024, type: "image/webp" },
    ];

    for (const sample of validSamples) {
      const result = imageMetadataSchema.safeParse(sample);
      expect(result.success).toBe(true);
    }
  });

  it("debe aceptar un archivo de exactamente 5.00 MB (5242880 bytes) como límite inclusivo (CL-01)", () => {
    const exactLimitSample = {
      name: "foto-limite-exacto.webp",
      size: MAX_IMAGE_SIZE_BYTES, // 5242880
      type: "image/webp",
    };

    const result = imageMetadataSchema.safeParse(exactLimitSample);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.size).toBe(5242880);
    }
  });

  it("debe rechazar un archivo de 5.01 MB (5253360 bytes) con el mensaje de error exacto (CL-02)", () => {
    const overLimitSample = {
      name: "foto-pesada.png",
      size: 5253360, // 5.01 MB
      type: "image/png",
    };

    const result = imageMetadataSchema.safeParse(overLimitSample);
    expect(result.success).toBe(false);
    if (!result.success) {
      const sizeError = result.error.errors.find((e) => e.path.includes("size"));
      expect(sizeError).toBeDefined();
      expect(sizeError?.message).toBe("El archivo excede el tamaño máximo permitido de 5 MB");
    }
  });

  it("debe rechazar formatos no permitidos (.svg, .gif, .pdf, ejecutables)", () => {
    const invalidTypes = [
      { name: "vector.svg", size: 1000, type: "image/svg+xml" },
      { name: "animacion.gif", size: 2000, type: "image/gif" },
      { name: "documento.pdf", size: 5000, type: "application/pdf" },
      { name: "script.exe", size: 8000, type: "application/x-msdownload" },
    ];

    for (const sample of invalidTypes) {
      const result = imageMetadataSchema.safeParse(sample);
      expect(result.success).toBe(false);
      if (!result.success) {
        const typeError = result.error.errors.find((e) => e.path.includes("type"));
        expect(typeError).toBeDefined();
        expect(typeError?.message).toBe("Solo se permiten imágenes en formato .jpg, .png o .webp");
      }
    }
  });

  it("debe rechazar nombres de archivo vacíos", () => {
    const emptyNameSample = {
      name: "",
      size: 1000,
      type: "image/jpeg",
    };

    const result = imageMetadataSchema.safeParse(emptyNameSample);
    expect(result.success).toBe(false);
  });

  it("debe rechazar propiedades adicionales inyectadas gracias al modo .strict()", () => {
    const maliciousSample = {
      name: "foto.webp",
      size: 1000,
      type: "image/webp",
      injectedPayload: "<script>alert(1)</script>",
    };

    const result = imageMetadataSchema.safeParse(maliciousSample);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain("Unrecognized key");
    }
  });
});
