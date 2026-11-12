import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../src/config/prisma.js";
import { settingsService, DEFAULT_WHATSAPP_NUMBER } from "../src/services/settings.service.js";
import { updateWhatsAppSchema } from "../src/schemas/settings.schemas.js";
import { getPublicSettings, updateWhatsApp } from "../src/controllers/settings.controller.js";

// Mock de prisma para pruebas unitarias sin dependencia de PostgreSQL activo
vi.mock("../src/config/prisma.js", () => {
  return {
    prisma: {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    },
  };
});

describe("Suite: Módulo de Configuraciones Dinámicas (server/tests/settings.test.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsService.clearCache();
  });

  describe("1. Validación de Esquema Zod (updateWhatsAppSchema)", () => {
    it("falla si whatsappNumber está vacío", () => {
      const res = updateWhatsAppSchema.safeParse({ whatsappNumber: "" });
      expect(res.success).toBe(false);
    });

    it("falla si el número tiene menos de 8 dígitos tras sanitizar", () => {
      const res = updateWhatsAppSchema.safeParse({ whatsappNumber: "12345" });
      expect(res.success).toBe(false);
    });

    it("falla si contiene campos imprevistos (.strict())", () => {
      const res = updateWhatsAppSchema.safeParse({
        whatsappNumber: "5492657659108",
        extra: "inyeccion",
      });
      expect(res.success).toBe(false);
    });

    it("sanea y valida correctamente un número con espacios, guiones y signos +", () => {
      const res = updateWhatsAppSchema.safeParse({
        whatsappNumber: "+54 9 2657 65-9108",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.whatsappNumber).toBe("5492657659108");
      }
    });
  });

  describe("2. SettingsService", () => {
    it("retorna el valor por defecto si no hay registros en la base de datos", async () => {
      vi.mocked(prisma.$queryRawUnsafe).mockResolvedValueOnce([]);

      const data = await settingsService.getWhatsAppSetting();
      expect(data.whatsappNumber).toBe(DEFAULT_WHATSAPP_NUMBER);
      expect(data.whatsappDisplay).toBe("+54 9 2657 65-9108");
    });

    it("recupera el número desde la base de datos y formatea el display amigable", async () => {
      vi.mocked(prisma.$queryRawUnsafe).mockResolvedValueOnce([
        { value: "5491122334455" },
      ] as any);

      const data = await settingsService.getWhatsAppSetting();
      expect(data.whatsappNumber).toBe("5491122334455");
      expect(data.whatsappDisplay).toBe("+54 9 1122 33-4455");
    });

    it("persiste un nuevo número sanitizado en PostgreSQL e invalida la caché", async () => {
      vi.mocked(prisma.$executeRawUnsafe).mockResolvedValue(1 as any);

      const updated = await settingsService.setWhatsAppSetting("+54 9 2657 11-2233");
      expect(updated.whatsappNumber).toBe("5492657112233");
      expect(updated.whatsappDisplay).toBe("+54 9 2657 11-2233");

      expect(prisma.$executeRawUnsafe).toHaveBeenCalled();
    });
  });

  describe("3. Controladores getPublicSettings y updateWhatsApp", () => {
    const createMockRes = () => {
      const res: any = {};
      res.status = vi.fn().mockReturnValue(res);
      res.json = vi.fn().mockReturnValue(res);
      return res;
    };

    it("getPublicSettings responde 200 con número y display", async () => {
      vi.mocked(prisma.$queryRawUnsafe).mockResolvedValueOnce([
        { value: "5492657659108" },
      ] as any);

      const req: any = {};
      const res = createMockRes();
      const next = vi.fn();

      await getPublicSettings(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          whatsappNumber: "5492657659108",
          whatsappDisplay: "+54 9 2657 65-9108",
        }),
      );
    });

    it("updateWhatsApp actualiza y responde 200 con confirmación", async () => {
      vi.mocked(prisma.$executeRawUnsafe).mockResolvedValue(1 as any);

      const req: any = { body: { whatsappNumber: "5492657998877" } };
      const res = createMockRes();
      const next = vi.fn();

      await updateWhatsApp(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          whatsappNumber: "5492657998877",
          message: "Número de WhatsApp actualizado exitosamente",
        }),
      );
    });
  });
});

