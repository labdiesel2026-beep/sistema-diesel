import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { authService, type AuthTokenPayload } from "../src/services/auth.service.js";
import { loginSchema } from "../src/schemas/auth.schemas.js";
import { AppError } from "../src/middleware/error.middleware.js";

describe("Esquemas Zod y Servicio Criptográfico de Autenticación (Tarea 3.1)", () => {
  describe("loginSchema", () => {
    it("valida credenciales válidas aplicando trim al email", () => {
      const res = loginSchema.safeParse({
        email: "  admin@laboratoriodiesel.com  ",
        password: "adminPassword123",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.email).toBe("admin@laboratoriodiesel.com");
        expect(res.data.password).toBe("adminPassword123");
      }
    });

    it("rechaza emails con formato inválido o passwords vacías", () => {
      const invalidEmail = loginSchema.safeParse({
        email: "correo-invalido",
        password: "123",
      });
      expect(invalidEmail.success).toBe(false);

      const emptyPass = loginSchema.safeParse({
        email: "admin@test.com",
        password: "",
      });
      expect(emptyPass.success).toBe(false);
    });

    it("rechaza propiedades no declaradas (.strict)", () => {
      const res = loginSchema.safeParse({
        email: "admin@test.com",
        password: "123",
        role: "admin",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("AuthService - Argon2id", () => {
    it("hashea contraseñas generando una firma $argon2id$", async () => {
      const plain = "SuperSecretAdminPass!2026";
      const hash = await authService.hashPassword(plain);

      expect(hash.startsWith("$argon2id$")).toBe(true);
      expect(hash).toContain("m=65536,p=1,t=3");
    });

    it("verifica correctamente contraseñas válidas y rechaza erróneas", async () => {
      const plain = "CorrectPassword123";
      const hash = await authService.hashPassword(plain);

      const isMatch = await authService.verifyPassword(hash, plain);
      expect(isMatch).toBe(true);

      const isMismatch = await authService.verifyPassword(hash, "WrongPassword");
      expect(isMismatch).toBe(false);
    });
  });

  describe("AuthService - JWT", () => {
    const mockUser: AuthTokenPayload = {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      email: "admin@laboratoriodiesel.com",
      role: "admin",
    };

    it("firma un JWT con payload { id, email, role } y duración de 8 horas", () => {
      const token = authService.generateToken(mockUser);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);

      const decoded = jwt.decode(token) as any;
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);

      // Verificar vigencia aproximada de 8 horas (28800s)
      const durationSeconds = decoded.exp - decoded.iat;
      expect(durationSeconds).toBe(28800);
    });

    it("verifica exitosamente un token válido retornando el payload tipado", () => {
      const token = authService.generateToken(mockUser);
      const verified = authService.verifyToken(token);

      expect(verified).toEqual(mockUser);
    });

    it("arroja AppError.unauthorized ante tokens apócrifos o manipulados", () => {
      const token = authService.generateToken(mockUser);
      const tampered = token.slice(0, -5) + "abcde";

      expect(() => authService.verifyToken(tampered)).toThrow(AppError);
      expect(() => authService.verifyToken("token_invalido")).toThrow("Sesión no válida o expirada");
    });
  });
});
