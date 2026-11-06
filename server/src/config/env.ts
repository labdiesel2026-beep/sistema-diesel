import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { z } from "zod";

// Cargar variables de entorno: buscar en directorio actual o en la raíz del proyecto
const localEnvPath = path.resolve(process.cwd(), ".env");
const rootEnvPath = path.resolve(process.cwd(), "../.env");

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

/**
 * Esquema de validación estricta para variables de entorno del Backend.
 * (RF-01, 4.6, D-02)
 */
export const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
    CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN es obligatorio"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    ADMIN_INITIAL_EMAIL: z.string().email().optional(),
    ADMIN_INITIAL_PASSWORD: z.string().min(6).optional(),
    CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME es obligatorio"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY es obligatorio"),
    CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET es obligatorio"),
  })
  .strict();

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno aplicando la directiva Crash Early.
 * Si faltan variables requeridas o no cumplen con los tipos/longitud,
 * imprime los errores en consola y detiene inmediatamente el proceso con código 1.
 */
export function validateEnv(customEnv?: Record<string, unknown>): EnvConfig {
  const source = customEnv ?? process.env;

  const payload: Record<string, unknown> = {};

  if (customEnv) {
    Object.assign(payload, customEnv);
  } else {
    const knownKeys = [
      "PORT",
      "DATABASE_URL",
      "JWT_SECRET",
      "CORS_ORIGIN",
      "NODE_ENV",
      "ADMIN_INITIAL_EMAIL",
      "ADMIN_INITIAL_PASSWORD",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ] as const;

    for (const key of knownKeys) {
      if (source[key] !== undefined && source[key] !== "") {
        payload[key] = source[key];
      }
    }
  }

  const result = envSchema.safeParse(payload);

  if (!result.success) {
    console.error(
      "❌ [Crash Early] Error fatal de configuración: Variables de entorno faltantes o inválidas:",
    );
    for (const issue of result.error.issues) {
      console.error(`   -> ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const ENV: EnvConfig = validateEnv();
