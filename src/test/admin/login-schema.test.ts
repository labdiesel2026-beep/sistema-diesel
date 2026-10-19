import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validations/admin-schemas";

describe("Esquema de Validación de Login (Zod Fail-Fast) — Tarea 2.1", () => {
  it("debe validar exitosamente credenciales correctas", () => {
    const input = {
      email: "admin@laboratoriodiesel.com",
      password: "admin123",
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("admin@laboratoriodiesel.com");
      expect(result.data.password).toBe("admin123");
    }
  });

  it("debe aplicar trim() al correo electrónico", () => {
    const input = {
      email: "  admin@laboratoriodiesel.com  ",
      password: "admin123",
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("admin@laboratoriodiesel.com");
    }
  });

  it("debe rechazar correo electrónico vacío o compuesto solo por espacios", () => {
    const input = {
      email: "   ",
      password: "admin123",
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.path.includes("email"))).toBe(true);
    }
  });

  it("debe rechazar formatos de correo electrónico inválidos", () => {
    const invalidEmails = ["admin", "admin@", "@laboratoriodiesel.com", "admin@.com", "admin@@test.com"];

    for (const email of invalidEmails) {
      const result = loginSchema.safeParse({
        email,
        password: "admin123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.message.includes("correo"))).toBe(true);
      }
    }
  });

  it("debe rechazar contraseña vacía", () => {
    const input = {
      email: "admin@laboratoriodiesel.com",
      password: "",
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.path.includes("password"))).toBe(true);
    }
  });

  it("debe rechazar propiedades adicionales gracias a .strict() (Prevención de inyección)", () => {
    const input = {
      email: "admin@laboratoriodiesel.com",
      password: "admin123",
      role: "superadmin",
      adminBypass: true,
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorKeys = result.error.errors.map((e) => e.message);
      expect(errorKeys.some((msg) => msg.includes("Unrecognized key"))).toBe(true);
    }
  });
});
