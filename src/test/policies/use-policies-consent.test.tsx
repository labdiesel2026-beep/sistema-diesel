import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePoliciesConsent } from "@/components/policies/use-policies-consent";
import {
  POLICIES_STORAGE_KEY,
  POLICIES_CONSENT_EVENT,
  CURRENT_POLICIES_VERSION,
  savePoliciesConsent,
} from "@/components/policies/policies-consent";

describe("Hook reactivo de consentimiento (usePoliciesConsent.ts)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("inicializa montado y detecta falta de consentimiento en cliente", () => {
    const { result } = renderHook(() => usePoliciesConsent());

    expect(result.current.isMounted).toBe(true);
    expect(result.current.hasAccepted).toBe(false);
    expect(result.current.shouldShowBanner).toBe(true);
  });

  it("detecta consentimiento previamente otorgado en localStorage", () => {
    localStorage.setItem(
      POLICIES_STORAGE_KEY,
      JSON.stringify({
        version: CURRENT_POLICIES_VERSION,
        accepted: true,
        timestamp: Date.now(),
      }),
    );

    const { result } = renderHook(() => usePoliciesConsent());

    expect(result.current.isMounted).toBe(true);
    expect(result.current.hasAccepted).toBe(true);
    expect(result.current.shouldShowBanner).toBe(false);
  });

  it("permite aceptar las políticas y actualiza reactivamente el estado", () => {
    const { result } = renderHook(() => usePoliciesConsent());

    expect(result.current.hasAccepted).toBe(false);
    expect(result.current.shouldShowBanner).toBe(true);

    act(() => {
      result.current.acceptPolicies();
    });

    expect(result.current.hasAccepted).toBe(true);
    expect(result.current.shouldShowBanner).toBe(false);

    const raw = localStorage.getItem(POLICIES_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw || "{}");
    expect(parsed.accepted).toBe(true);
    expect(parsed.version).toBe(1);
  });

  it("permite reiniciar el consentimiento mediante resetPolicies", () => {
    savePoliciesConsent(true);
    const { result } = renderHook(() => usePoliciesConsent());

    expect(result.current.hasAccepted).toBe(true);

    act(() => {
      result.current.resetPolicies();
    });

    expect(result.current.hasAccepted).toBe(false);
    expect(result.current.shouldShowBanner).toBe(true);
    expect(localStorage.getItem(POLICIES_STORAGE_KEY)).toBeNull();
  });

  it("sincroniza reactivamente el estado ante eventos POLICIES_CONSENT_EVENT de otros componentes", () => {
    const { result } = renderHook(() => usePoliciesConsent());

    expect(result.current.hasAccepted).toBe(false);

    act(() => {
      // Simular que otro componente (ej: modal) persiste el consentimiento
      savePoliciesConsent(true);
    });

    expect(result.current.hasAccepted).toBe(true);
    expect(result.current.shouldShowBanner).toBe(false);
  });

  it("sincroniza reactivamente ante eventos storage entre pestañas", () => {
    const { result } = renderHook(() => usePoliciesConsent());

    expect(result.current.hasAccepted).toBe(false);

    act(() => {
      // Simular evento storage disparado por otra pestaña
      localStorage.setItem(
        POLICIES_STORAGE_KEY,
        JSON.stringify({
          version: CURRENT_POLICIES_VERSION,
          accepted: true,
          timestamp: Date.now(),
        }),
      );
      window.dispatchEvent(new StorageEvent("storage", { key: POLICIES_STORAGE_KEY }));
    });

    expect(result.current.hasAccepted).toBe(true);
    expect(result.current.shouldShowBanner).toBe(false);
  });
});
