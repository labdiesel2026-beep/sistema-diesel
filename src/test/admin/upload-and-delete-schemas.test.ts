import { describe, it, expect } from "vitest";
import {
  uploadFileSchema,
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/validations/upload-schema";
import {
  deleteConfirmationSchema,
  isDeleteConfirmationValid,
  DELETE_CONFIRMATION_WORD,
} from "@/lib/validations/admin-schemas";

describe("TASK-26: Pruebas Unitarias de Esquemas Zod y Contratos de Validación", () => {
  describe("1. Validación Zod en Frontera (uploadFileSchema) — Principio 2 & Principio 3", () => {
    it("valida exitosamente archivos con tipos MIME permitidos (JPEG, PNG, WebP) menores a 8 MB", () => {
      const validFiles = [
        { mimetype: "image/jpeg", size: 1024 * 1024, originalname: "inyector.jpg" },
        { mimetype: "image/png", size: 4 * 1024 * 1024, originalname: "bomba.png" },
        { mimetype: "image/webp", size: 500 * 1024, originalname: "tobera.webp" },
      ];

      for (const file of validFiles) {
        const result = uploadFileSchema.safeParse(file);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.mimetype).toBe(file.mimetype);
          expect(result.data.size).toBe(file.size);
        }
      }
    });

    it("acepta un archivo en el límite inclusivo exacto de 8 MB (8_000_000 bytes)", () => {
      const boundaryFile = {
        mimetype: "image/webp",
        size: MAX_UPLOAD_SIZE_BYTES, // 8,000,000 bytes
        originalname: "foto-limite-exacto.webp",
      };

      const result = uploadFileSchema.safeParse(boundaryFile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.size).toBe(8_000_000);
      }
    });

    it("rechaza archivos que exceden 8 MB (8_000_001 bytes) con el mensaje de error estricto", () => {
      const overLimitFile = {
        mimetype: "image/jpeg",
        size: 8_000_001,
        originalname: "foto-gigante.jpg",
      };

      const result = uploadFileSchema.safeParse(overLimitFile);
      expect(result.success).toBe(false);
      if (!result.success) {
        const sizeError = result.error.errors.find((e) => e.path.includes("size"));
        expect(sizeError).toBeDefined();
        expect(sizeError?.message).toBe("El tamaño de archivo entrante no debe exceder 8 MB");
      }
    });

    it("rechaza tipos MIME no permitidos (PDF, GIF, SVG, ejecutables)", () => {
      const disallowedFiles = [
        { mimetype: "application/pdf", size: 1024, originalname: "ficha.pdf" },
        { mimetype: "image/gif", size: 2048, originalname: "animacion.gif" },
        { mimetype: "image/svg+xml", size: 512, originalname: "vector.svg" },
        { mimetype: "application/x-msdownload", size: 4096, originalname: "script.exe" },
        { mimetype: "text/html", size: 256, originalname: "index.html" },
      ];

      for (const file of disallowedFiles) {
        const result = uploadFileSchema.safeParse(file);
        expect(result.success).toBe(false);
        if (!result.success) {
          const mimeError = result.error.errors.find((e) => e.path.includes("mimetype"));
          expect(mimeError).toBeDefined();
        }
      }
    });

    it("preserva campos binarios y metadata adicional mediante passthrough()", () => {
      const dummyBuffer = Buffer.from("raw-bytes");
      const fileWithExtras = {
        mimetype: "image/png",
        size: 1024,
        buffer: dummyBuffer,
        originalname: "valvula.png",
        encoding: "7bit",
      };

      const result = uploadFileSchema.safeParse(fileWithExtras);
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as any).buffer).toBe(dummyBuffer);
        expect((result.data as any).originalname).toBe("valvula.png");
        expect((result.data as any).encoding).toBe("7bit");
      }
    });

    it("rechaza objetos incompletos que carecen de mimetype o size", () => {
      expect(uploadFileSchema.safeParse({ size: 1024 }).success).toBe(false);
      expect(uploadFileSchema.safeParse({ mimetype: "image/jpeg" }).success).toBe(false);
      expect(uploadFileSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("2. Contrato de Validación del Modal Destructivo ('ELIMINAR') — RF-09", () => {
    it("valida exitosamente cuando el texto es exactamente 'ELIMINAR'", () => {
      const parseResult = deleteConfirmationSchema.safeParse("ELIMINAR");
      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data).toBe(DELETE_CONFIRMATION_WORD);
      }
      expect(isDeleteConfirmationValid("ELIMINAR")).toBe(true);
    });

    it("admite espacios perimetrales antes y después gracias a .trim()", () => {
      const parseResult = deleteConfirmationSchema.safeParse("   ELIMINAR   ");
      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data).toBe(DELETE_CONFIRMATION_WORD);
      }
      expect(isDeleteConfirmationValid("   ELIMINAR   ")).toBe(true);
      expect(isDeleteConfirmationValid("  ELIMINAR")).toBe(true);
      expect(isDeleteConfirmationValid("ELIMINAR  ")).toBe(true);
    });

    it("rechaza de forma estricta el texto en minúsculas 'eliminar' (case-sensitive)", () => {
      const parseResult = deleteConfirmationSchema.safeParse("eliminar");
      expect(parseResult.success).toBe(false);
      expect(isDeleteConfirmationValid("eliminar")).toBe(false);
    });

    it("rechaza texto con mayúsculas parciales 'Eliminar' o 'EliminaR'", () => {
      expect(deleteConfirmationSchema.safeParse("Eliminar").success).toBe(false);
      expect(isDeleteConfirmationValid("Eliminar")).toBe(false);
      expect(isDeleteConfirmationValid("EliminaR")).toBe(false);
    });

    it("rechaza texto incompleto 'ELIM' o 'ELIMINA'", () => {
      expect(deleteConfirmationSchema.safeParse("ELIM").success).toBe(false);
      expect(isDeleteConfirmationValid("ELIM")).toBe(false);
      expect(isDeleteConfirmationValid("ELIMINA")).toBe(false);
    });

    it("rechaza palabras diferentes como 'BORRAR', 'CANCELAR' o 'DELETE'", () => {
      const words = ["BORRAR", "CANCELAR", "DELETE", "CONFIRMAR", "SI", "YES"];
      for (const w of words) {
        expect(deleteConfirmationSchema.safeParse(w).success).toBe(false);
        expect(isDeleteConfirmationValid(w)).toBe(false);
      }
    });

    it("rechaza entradas vacías, nulas o con solo espacios", () => {
      expect(deleteConfirmationSchema.safeParse("").success).toBe(false);
      expect(deleteConfirmationSchema.safeParse("   ").success).toBe(false);
      expect(isDeleteConfirmationValid("")).toBe(false);
      expect(isDeleteConfirmationValid("   ")).toBe(false);
    });
  });
});
