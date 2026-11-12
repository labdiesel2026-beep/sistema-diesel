import { prisma } from "../config/prisma.js";

export const DEFAULT_WHATSAPP_NUMBER = "5492657659108";
export const SETTING_KEY_WHATSAPP = "WHATSAPP_NUMBER";

interface CacheEntry {
  value: string;
  expiresAt: number;
}

/**
 * Servicio de Configuración Dinámica del Sistema (Zero-Downtime PostgreSQL).
 * Almacena pares clave-valor en la tabla system_settings de Neon.
 */
export class SettingsService {
  private cache = new Map<string, CacheEntry>();
  private cacheTtlMs = 60 * 1000; // 60 segundos
  private tableEnsured = false;

  /**
   * Garantiza de forma no destructiva que la tabla system_settings exista en PostgreSQL.
   */
  async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "system_settings" (
          "key" TEXT PRIMARY KEY,
          "value" TEXT NOT NULL,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      this.tableEnsured = true;
    } catch (error) {
      // Ignorar si la tabla ya fue creada concurrentemente
    }
  }

  /**
   * Formatea un número internacional para despliegue visual amigable (ej. +54 9 2657 65-9108).
   */
  formatWhatsAppDisplay(rawPhone: string): string {
    const clean = rawPhone.replace(/\D/g, "");
    if (!clean) return "+54 9 2657 65-9108";

    // Si es formato Argentina estándar con código de país 549 y 10 dígitos locales (13 dígitos total)
    if (clean.startsWith("549") && clean.length === 13) {
      const area = clean.slice(3, 7);
      const prefix = clean.slice(7, 9);
      const suffix = clean.slice(9);
      return `+54 9 ${area} ${prefix}-${suffix}`;
    }

    if (clean.startsWith("54") && clean.length === 12) {
      const area = clean.slice(2, 6);
      const prefix = clean.slice(6, 8);
      const suffix = clean.slice(8);
      return `+54 ${area} ${prefix}-${suffix}`;
    }

    return `+${clean}`;
  }

  /**
   * Obtiene el valor de una configuración con fallback y caché en memoria.
   */
  async getSetting(key: string, defaultValue: string): Promise<string> {
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    try {
      await this.ensureTable();
      const rows = await prisma.$queryRawUnsafe<Array<{ value: string }>>(
        `SELECT "value" FROM "system_settings" WHERE "key" = $1 LIMIT 1;`,
        key,
      );

      if (rows && rows.length > 0 && typeof rows[0]?.value === "string") {
        const value = rows[0].value;
        this.cache.set(key, { value, expiresAt: now + this.cacheTtlMs });
        return value;
      }
    } catch {
      // Fallback silencioso ante error de conexión o inicialización
    }

    this.cache.set(key, { value: defaultValue, expiresAt: now + this.cacheTtlMs });
    return defaultValue;
  }

  /**
   * Actualiza el valor de una configuración en PostgreSQL e invalida la caché.
   */
  async setSetting(key: string, value: string): Promise<void> {
    await this.ensureTable();
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "system_settings" ("key", "value", "updated_at")
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT ("key")
      DO UPDATE SET "value" = EXCLUDED."value", "updated_at" = CURRENT_TIMESTAMP;
      `,
      key,
      value,
    );

    // Actualizar caché inmediatamente
    this.cache.set(key, { value, expiresAt: Date.now() + this.cacheTtlMs });
  }

  /**
   * Obtiene la configuración pública de WhatsApp.
   */
  async getWhatsAppSetting(): Promise<{ whatsappNumber: string; whatsappDisplay: string }> {
    const number = await this.getSetting(SETTING_KEY_WHATSAPP, DEFAULT_WHATSAPP_NUMBER);
    return {
      whatsappNumber: number,
      whatsappDisplay: this.formatWhatsAppDisplay(number),
    };
  }

  /**
   * Actualiza el número telefónico de WhatsApp.
   */
  async setWhatsAppSetting(newNumber: string): Promise<{ whatsappNumber: string; whatsappDisplay: string }> {
    const cleanNumber = newNumber.replace(/\D/g, "");
    await this.setSetting(SETTING_KEY_WHATSAPP, cleanNumber);
    return {
      whatsappNumber: cleanNumber,
      whatsappDisplay: this.formatWhatsAppDisplay(cleanNumber),
    };
  }

  /**
   * Limpia la caché en memoria (para pruebas unitarias).
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const settingsService = new SettingsService();
export default settingsService;

