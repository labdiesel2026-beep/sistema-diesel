import { describe, it, expect } from "vitest";
import { envSchema } from "../src/config/env.js";

describe("Validación Estricta de Variables de Entorno (env.ts)", () => {
  const validBaseConfig = {
    PORT: 3001,
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5433/laboratorio_diesel",
    JWT_SECRET: "12345678901234567890123456789012",
    CORS_ORIGIN: "http://localhost:5173",
    NODE_ENV: "test" as const,
    CLOUDINARY_CLOUD_NAME: "demo-cloud",
    CLOUDINARY_API_KEY: "987654321",
    CLOUDINARY_API_SECRET: "secret12345",
  };

  it("acepta una configuración válida con variables de Cloudinary", () => {
    const result = envSchema.safeParse(validBaseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.CLOUDINARY_CLOUD_NAME).toBe("demo-cloud");
      expect(result.data.CLOUDINARY_API_KEY).toBe("987654321");
      expect(result.data.CLOUDINARY_API_SECRET).toBe("secret12345");
    }
  });

  it("rechaza si falta CLOUDINARY_CLOUD_NAME", () => {
    const { CLOUDINARY_CLOUD_NAME, ...invalid } = validBaseConfig;
    const result = envSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rechaza si falta CLOUDINARY_API_KEY", () => {
    const { CLOUDINARY_API_KEY, ...invalid } = validBaseConfig;
    const result = envSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rechaza si falta CLOUDINARY_API_SECRET", () => {
    const { CLOUDINARY_API_SECRET, ...invalid } = validBaseConfig;
    const result = envSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rechaza campos no autorizados por ser .strict()", () => {
    const withExtra = {
      ...validBaseConfig,
      UNKNOWN_PARAM: "injected",
    };
    const result = envSchema.safeParse(withExtra);
    expect(result.success).toBe(false);
  });
});

