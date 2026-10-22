import { z } from "zod";

export const POLICIES_STORAGE_KEY = "ld_policies_consent_v1" as const;
export const CURRENT_POLICIES_VERSION = 1 as const;
export const POLICIES_CONSENT_EVENT = "ld:policies-consent-changed" as const;

/**
 * Esquema Zod estricto para validar el consentimiento de políticas comerciales y de garantía.
 * Cumple con el Principio 2 (Validación Estricta en Fronteras) y Principio 5 de la Constitución.
 */
export const PoliciesConsentSchema = z
  .object({
    version: z.literal(CURRENT_POLICIES_VERSION),
    accepted: z.boolean(),
    timestamp: z.number().positive(),
  })
  .strict();

export type PoliciesConsent = z.infer<typeof PoliciesConsentSchema>;

export const DEFAULT_POLICIES_CONSENT: PoliciesConsent = {
  version: CURRENT_POLICIES_VERSION,
  accepted: false,
  timestamp: 0,
};

/**
 * Recupera y valida el estado de consentimiento desde localStorage.
 * Si la clave no existe, o si falla la validación ante datos corruptos o versiones desactualizadas,
 * purga inmediatamente la clave en localStorage (Fail-Fast) y retorna { accepted: false }.
 */
export function getPoliciesConsent(): PoliciesConsent {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_POLICIES_CONSENT;
  }

  try {
    const raw = window.localStorage.getItem(POLICIES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_POLICIES_CONSENT;
    }

    const json = JSON.parse(raw);
    const result = PoliciesConsentSchema.safeParse(json);

    if (result.success) {
      return result.data;
    }

    // Fail-Fast: purgar datos inválidos o esquema corrupto
    purgePoliciesConsent();
    return DEFAULT_POLICIES_CONSENT;
  } catch {
    // Modo incógnito estricto o fallo en JSON.parse
    try {
      purgePoliciesConsent();
    } catch {
      // noop
    }
    return DEFAULT_POLICIES_CONSENT;
  }
}

/**
 * Persiste el consentimiento en localStorage de forma segura y emite un evento personalizado
 * para sincronización reactiva entre componentes de la aplicación.
 */
export function savePoliciesConsent(accepted = true): PoliciesConsent | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const payload: PoliciesConsent = {
      version: CURRENT_POLICIES_VERSION,
      accepted,
      timestamp: Date.now(),
    };

    window.localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(payload));

    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent(POLICIES_CONSENT_EVENT, { detail: payload }),
      );
    }

    return payload;
  } catch (err) {
    console.warn("[policies-consent] Error al persistir en localStorage:", err);
    return null;
  }
}

/**
 * Elimina la clave de consentimiento en localStorage de forma segura y notifica.
 */
export function purgePoliciesConsent(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(POLICIES_STORAGE_KEY);
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent(POLICIES_CONSENT_EVENT, {
          detail: DEFAULT_POLICIES_CONSENT,
        }),
      );
    }
  } catch {
    // noop
  }
}
