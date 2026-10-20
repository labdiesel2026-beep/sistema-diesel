import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateEnv, envSchema, ENV } from "@/config/env";

describe("Validación de Variables de Entorno (Crash Early) — Tarea 1.1", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe parsear exitosamente cuando las variables requeridas están presentes", () => {
    const config = validateEnv({
      VITE_API_URL: "https://api.laboratoriodiesel.com",
      VITE_CONTACT_WHATSAPP: "5492657659108",
      MODE: "staging",
      PROD: false,
    });

    expect(config.VITE_API_URL).toBe("https://api.laboratoriodiesel.com");
    expect(config.VITE_CONTACT_WHATSAPP).toBe("5492657659108");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("debe aplicar fallback seguro y emitir console.warn en entorno de desarrollo si faltan variables", () => {
    const config = validateEnv({
      PROD: false,
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[AppSec ENV] Operando con variables de entorno por defecto"),
    );
    expect(config.VITE_API_URL).toBe("http://localhost:3000/api");
    expect(config.VITE_CONTACT_WHATSAPP).toBe("5492657659108");
    expect(config.PROD).toBe(false);
  });

  it("debe lanzar excepción fatal [Crash Early] en modo producción si faltan variables requeridas", () => {
    expect(() =>
      validateEnv({
        PROD: true,
      }),
    ).toThrowError(/\[Crash Early\] Faltan variables de entorno requeridas/);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("FATAL: Variables de entorno inválidas o ausentes"),
      expect.any(String),
    );
  });

  it("debe rechazar campos inesperados gracias al modo .strict() de Zod", () => {
    const result = envSchema.safeParse({
      VITE_API_URL: "http://localhost:3000",
      VITE_CONTACT_WHATSAPP: "5491112345678",
      injectedField: "malicious_payload",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain("Unrecognized key");
    }
  });

  it("el objeto global ENV exportado debe estar inicializado y contener valores válidos", () => {
    expect(ENV).toBeDefined();
    expect(ENV.VITE_API_URL.length).toBeGreaterThan(0);
    expect(ENV.VITE_CONTACT_WHATSAPP.length).toBeGreaterThanOrEqual(8);
  });
});
