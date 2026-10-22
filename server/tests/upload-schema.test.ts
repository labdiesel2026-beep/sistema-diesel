import { describe, it, expect } from "vitest";
import {
  uploadFileSchema,
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
} from "../src/schemas/upload.schema.js";

describe("TASK-26: Validación Zod en Frontera (uploadFileSchema) — Backend", () => {
  it("valida exitosamente archivos con tipos MIME permitidos menores a 8 MB", () => {
    const validSamples = [
      { mimetype: "image/jpeg", size: 1024 * 1024, originalname: "inyector.jpg" },
      { mimetype: "image/png", size: 3 * 1024 * 1024, originalname: "bomba.png" },
      { mimetype: "image/webp", size: 700 * 1024, originalname: "tobera.webp" },
    ];

    for (const sample of validSamples) {
      const result = uploadFileSchema.safeParse(sample);
      expect(result.success).toBe(true);
    }
  });

  it("acepta un archivo en el límite inclusivo exacto de 8 MB (8_000_000 bytes)", () => {
    const boundarySample = {
      mimetype: "image/png",
      size: MAX_UPLOAD_SIZE_BYTES,
      originalname: "exacto.png",
    };
    const result = uploadFileSchema.safeParse(boundarySample);
    expect(result.success).toBe(true);
  });

  it("rechaza archivos que exceden los 8 MB (8_000_001 bytes)", () => {
    const overLimit = {
      mimetype: "image/jpeg",
      size: 8_000_001,
      originalname: "demasiado-grande.jpg",
    };
    const result = uploadFileSchema.safeParse(overLimit);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues || (result.error as any).errors;
      expect(issues[0].message).toBe(
        "El tamaño de archivo entrante no debe exceder 8 MB",
      );
    }
  });

  it("rechaza tipos MIME no autorizados (PDF, GIF, SVG, ejecutables)", () => {
    const invalidTypes = [
      { mimetype: "application/pdf", size: 1024 },
      { mimetype: "image/gif", size: 2048 },
      { mimetype: "image/svg+xml", size: 512 },
      { mimetype: "application/x-msdownload", size: 4096 },
    ];

    for (const sample of invalidTypes) {
      const result = uploadFileSchema.safeParse(sample);
      expect(result.success).toBe(false);
    }
  });

  it("preserva campos binarios requeridos por Sharp mediante passthrough()", () => {
    const buffer = Buffer.from("fake-binary-content");
    const rawFile = {
      mimetype: "image/webp",
      size: 2048,
      buffer,
      originalname: "test.webp",
    };

    const result = uploadFileSchema.safeParse(rawFile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).buffer).toBe(buffer);
    }
  });
});
