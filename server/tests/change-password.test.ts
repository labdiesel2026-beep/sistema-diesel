import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../src/config/prisma.js";
import { authService } from "../src/services/auth.service.js";
import { changePasswordSchema } from "../src/schemas/auth.schemas.js";
import { changePassword } from "../src/controllers/auth.controller.js";

// Mock de prisma para pruebas unitarias de aislamiento
vi.mock("../src/config/prisma.js", () => {
  return {
    prisma: {
      adminUser: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

describe("Suite: Cambio de Contraseña de Administrador (server/tests/change-password.test.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Validación de Esquema Zod (changePasswordSchema)", () => {
    it("falla si currentPassword está vacío", () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "passwordValido123",
      });
      expect(res.success).toBe(false);
    });

    it("falla si newPassword tiene menos de 8 caracteres", () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: "actualPassword",
        newPassword: "short",
      });
      expect(res.success).toBe(false);
    });

    it("falla si contiene propiedades no autorizadas (.strict)", () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: "actualPassword",
        newPassword: "passwordValido123",
        extraField: "hacker",
      });
      expect(res.success).toBe(false);
    });

    it("aprueba un payload válido de cambio de contraseña", () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: "actualPassword",
        newPassword: "nuevaPasswordSegura2026",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("2. Controlador changePassword()", () => {
    const createMockRes = () => {
      const res: any = {};
      res.status = vi.fn().mockReturnValue(res);
      res.json = vi.fn().mockReturnValue(res);
      return res;
    };

    it("responde 401 si no hay usuario en la sesión", async () => {
      const req: any = { body: {}, user: undefined };
      const res = createMockRes();
      const next = vi.fn();

      await changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Sesión no válida o expirada" }),
      );
    });

    it("responde 401 si el usuario no existe en la base de datos", async () => {
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValueOnce(null);

      const req: any = {
        user: { id: "user-uuid-999" },
        body: { currentPassword: "OldPassword123", newPassword: "NewPassword2026" },
      };
      const res = createMockRes();
      const next = vi.fn();

      await changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Usuario no encontrado o dado de baja" }),
      );
    });

    it("responde 400 si la contraseña actual no coincide con el hash", async () => {
      const realHash = await authService.hashPassword("CorrectOriginalPass123");

      vi.mocked(prisma.adminUser.findUnique).mockResolvedValueOnce({
        id: "user-uuid-1",
        email: "admin@diesel.com",
        passwordHash: realHash,
      } as any);

      const req: any = {
        user: { id: "user-uuid-1" },
        body: { currentPassword: "WrongPassword123", newPassword: "NewPassword2026!" },
      };
      const res = createMockRes();
      const next = vi.fn();

      await changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "La contraseña actual es incorrecta" }),
      );
      expect(prisma.adminUser.update).not.toHaveBeenCalled();
    });

    it("hashea con Argon2id y actualiza la contraseña exitosamente", async () => {
      const currentPlain = "CorrectOriginalPass123";
      const realHash = await authService.hashPassword(currentPlain);
      const newPlain = "NewSecurePassword2026!";

      vi.mocked(prisma.adminUser.findUnique).mockResolvedValueOnce({
        id: "user-uuid-1",
        email: "admin@diesel.com",
        passwordHash: realHash,
      } as any);

      vi.mocked(prisma.adminUser.update).mockResolvedValueOnce({
        id: "user-uuid-1",
      } as any);

      const req: any = {
        user: { id: "user-uuid-1" },
        body: { currentPassword: currentPlain, newPassword: newPlain },
      };
      const res = createMockRes();
      const next = vi.fn();

      await changePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Contraseña actualizada exitosamente",
        }),
      );

      expect(prisma.adminUser.update).toHaveBeenCalledTimes(1);
      const updateArgs = vi.mocked(prisma.adminUser.update).mock.calls[0][0];
      expect(updateArgs.where.id).toBe("user-uuid-1");
      expect(updateArgs.data.passwordHash).toMatch(/^\$argon2id\$/);

      // Verificar que el nuevo hash corresponde a newPlain
      const isNewMatch = await authService.verifyPassword(updateArgs.data.passwordHash, newPlain);
      expect(isNewMatch).toBe(true);
    });
  });
});
