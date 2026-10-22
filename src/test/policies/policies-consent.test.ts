import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  POLICIES_STORAGE_KEY,
  POLICIES_CONSENT_EVENT,
  CURRENT_POLICIES_VERSION,
  PoliciesConsentSchema,
  getPoliciesConsent,
  savePoliciesConsent,
  purgePoliciesConsent,
  DEFAULT_POLICIES_CONSENT,
} from "@/components/policies/policies-consent";

describe("Módulo de Persistencia y Validación de Consentimiento (policies-consent.ts)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("valida el esquema estricto Zod para payloads válidos", () => {
    const valid = {
      version: 1,
      accepted: true,
      timestamp: Date.now(),
    };

    const parsed = PoliciesConsentSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rechaza payloads con versiones obsoletas o campos no reconocidos (strict)", () => {
    const outdatedVersion = {
      version: 0,
      accepted: true,
      timestamp: Date.now(),
    };
    expect(PoliciesConsentSchema.safeParse(outdatedVersion).success).toBe(false);

    const extraFields = {
      version: 1,
      accepted: true,
      timestamp: Date.now(),
      unexpected: "malicious_or_polluted_data",
    };
    expect(PoliciesConsentSchema.safeParse(extraFields).success).toBe(false);

    const nonBoolean = {
      version: 1,
      accepted: "true",
      timestamp: Date.now(),
    };
    expect(PoliciesConsentSchema.safeParse(nonBoolean).success).toBe(false);
  });

  it("retorna estado seguro por defecto cuando no existe registro en localStorage", () => {
    const consent = getPoliciesConsent();
    expect(consent).toEqual(DEFAULT_POLICIES_CONSENT);
    expect(consent.accepted).toBe(false);
  });

  it("recupera exitosamente el consentimiento válido persistido", () => {
    const timestamp = 1729549800000;
    localStorage.setItem(
      POLICIES_STORAGE_KEY,
      JSON.stringify({
        version: CURRENT_POLICIES_VERSION,
        accepted: true,
        timestamp,
      }),
    );

    const consent = getPoliciesConsent();
    expect(consent.accepted).toBe(true);
    expect(consent.version).toBe(1);
    expect(consent.timestamp).toBe(timestamp);
  });

  it("purga de forma Fail-Fast y retorna accepted: false ante JSON corrupto", () => {
    localStorage.setItem(POLICIES_STORAGE_KEY, "{corrupt_json: invalid");

    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
    const consent = getPoliciesConsent();

    expect(consent.accepted).toBe(false);
    expect(removeItemSpy).toHaveBeenCalledWith(POLICIES_STORAGE_KEY);
    expect(localStorage.getItem(POLICIES_STORAGE_KEY)).toBeNull();
  });

  it("purga de forma Fail-Fast y retorna accepted: false ante violación de esquema Zod", () => {
    localStorage.setItem(
      POLICIES_STORAGE_KEY,
      JSON.stringify({
        version: 99, // Versión no autorizada
        accepted: true,
        timestamp: -50, // Timestamp inválido
      }),
    );

    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
    const consent = getPoliciesConsent();

    expect(consent.accepted).toBe(false);
    expect(removeItemSpy).toHaveBeenCalledWith(POLICIES_STORAGE_KEY);
    expect(localStorage.getItem(POLICIES_STORAGE_KEY)).toBeNull();
  });

  it("persiste el consentimiento y emite el evento global de sincronización", () => {
    let capturedEventDetail: unknown = null;
    const listener = (event: Event) => {
      capturedEventDetail = (event as CustomEvent).detail;
    };

    window.addEventListener(POLICIES_CONSENT_EVENT, listener);

    const result = savePoliciesConsent(true);

    expect(result).not.toBeNull();
    expect(result?.accepted).toBe(true);
    expect(result?.version).toBe(1);
    expect(result?.timestamp).toBeGreaterThan(0);

    const storedRaw = localStorage.getItem(POLICIES_STORAGE_KEY);
    expect(storedRaw).toBeTruthy();
    expect(JSON.parse(storedRaw || "{}")).toEqual(result);

    expect(capturedEventDetail).toEqual(result);
    window.removeEventListener(POLICIES_CONSENT_EVENT, listener);
  });

  it("purga el consentimiento y emite el evento correspondiente", () => {
    savePoliciesConsent(true);
    expect(localStorage.getItem(POLICIES_STORAGE_KEY)).not.toBeNull();

    let capturedEventDetail: unknown = null;
    const listener = (event: Event) => {
      capturedEventDetail = (event as CustomEvent).detail;
    };

    window.addEventListener(POLICIES_CONSENT_EVENT, listener);

    purgePoliciesConsent();

    expect(localStorage.getItem(POLICIES_STORAGE_KEY)).toBeNull();
    expect(capturedEventDetail).toEqual(DEFAULT_POLICIES_CONSENT);

    window.removeEventListener(POLICIES_CONSENT_EVENT, listener);
  });

  it("maneja de forma segura y opaca excepciones de almacenamiento bloqueado en getPoliciesConsent (modo incógnito)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });

    const consent = getPoliciesConsent();
    expect(consent).toEqual(DEFAULT_POLICIES_CONSENT);
    expect(consent.accepted).toBe(false);
  });

  it("maneja de forma segura y opaca excepciones de almacenamiento bloqueado en savePoliciesConsent (modo incógnito)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = savePoliciesConsent(true);
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[policies-consent]"),
      expect.any(DOMException),
    );
  });
});
