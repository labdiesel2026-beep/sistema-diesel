import { z } from "zod";

/**
 * Esquema de validación estricta para variables de entorno frontend.
 * (RF-14, CA-14.1, CA-14.2, CA-14.3, RNF-P4-02, AGENTS.MD §3)
 */
export const envSchema = z
  .object({
    VITE_API_URL: z
      .string({ required_error: "VITE_API_URL no puede ser vacía" })
      .trim()
      .min(1, "VITE_API_URL no puede ser vacía")
      .transform((val) => val.replace(/\/+$/, "")),
    VITE_CONTACT_WHATSAPP: z
      .string({ required_error: "VITE_CONTACT_WHATSAPP inválido" })
      .trim()
      .min(8, "VITE_CONTACT_WHATSAPP inválido"),
    MODE: z.string().optional(),
    PROD: z.boolean().optional(),
  })
  .strict();

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Valida de forma síncrona las variables de entorno.
 * - En desarrollo/test (PROD !== true): provee fallback con console.warn si faltan variables.
 * - En producción (PROD === true): aplica Crash Early arrojando excepción fatal.
 */
export function validateEnv(customEnv?: Record<string, unknown>): EnvConfig {
  const envSource = customEnv ?? (import.meta.env as Record<string, unknown> | undefined) ?? {};
  const isProd = Boolean(envSource["PROD"]);

  const rawEnv: Record<string, unknown> = {
    VITE_API_URL: envSource["VITE_API_URL"],
    VITE_CONTACT_WHATSAPP: envSource["VITE_CONTACT_WHATSAPP"],
  };
  if (envSource["MODE"] !== undefined) rawEnv["MODE"] = envSource["MODE"];
  if (envSource["PROD"] !== undefined) rawEnv["PROD"] = envSource["PROD"];

  if (customEnv) {
    for (const key of Object.keys(customEnv)) {
      if (!(key in rawEnv)) {
        rawEnv[key] = customEnv[key];
      }
    }
  }

  const apiUrl = rawEnv["VITE_API_URL"];
  const whatsapp = rawEnv["VITE_CONTACT_WHATSAPP"];
  const mode = rawEnv["MODE"];

  const hasMissingRequired =
    typeof apiUrl !== "string" ||
    apiUrl.trim() === "" ||
    typeof whatsapp !== "string" ||
    whatsapp.trim() === "";

  if (!isProd && hasMissingRequired) {
    console.warn(
      "[AppSec ENV] Operando con variables de entorno por defecto para desarrollo local.",
    );
    return {
      VITE_API_URL:
        typeof apiUrl === "string" && apiUrl.trim() !== ""
          ? apiUrl.trim().replace(/\/+$/, "")
          : "http://localhost:3000/api",
      VITE_CONTACT_WHATSAPP:
        typeof whatsapp === "string" && whatsapp.trim() !== "" ? whatsapp.trim() : "5492657659108",
      MODE: typeof mode === "string" ? mode : "development",
      PROD: false,
    };
  }

  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("\n");
    console.error("FATAL: Variables de entorno inválidas o ausentes:\n", errorDetails);
    throw new Error(`[Crash Early] Faltan variables de entorno requeridas:\n${errorDetails}`);
  }

  return result.data;
}

export const ENV = validateEnv();
