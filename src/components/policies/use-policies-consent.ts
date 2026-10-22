import { useState, useEffect, useCallback } from "react";
import {
  POLICIES_CONSENT_EVENT,
  getPoliciesConsent,
  savePoliciesConsent,
  purgePoliciesConsent,
} from "./policies-consent";

export interface UsePoliciesConsentReturn {
  /** Indica si el componente ya completó su primer montaje en el cliente (prevención de Hydration Mismatch) */
  readonly isMounted: boolean;
  /** Determina si debe desplegarse el banner flotante (solo en cliente y si no se ha otorgado consentimiento) */
  readonly shouldShowBanner: boolean;
  /** Estado actual de aceptación de las políticas comerciales */
  readonly hasAccepted: boolean;
  /** Persiste la aceptación en localStorage y notifica a todos los componentes suscriptores */
  readonly acceptPolicies: () => void;
  /** Purga la aceptación en localStorage y revierte el estado */
  readonly resetPolicies: () => void;
}

/**
 * Hook seguro y reactivo para consultar y actualizar el consentimiento de políticas comerciales.
 * Implementa una arquitectura en dos fases (SSR / Client Mounted) para garantizar cero Hydration Mismatch (RNF-05).
 */
export function usePoliciesConsent(): UsePoliciesConsentReturn {
  // Fase 1: En SSR y primer render en cliente, asumimos hasAccepted=true y isMounted=false
  // para garantizar que el markup inicial generado sea 100% idéntico y no renderice el banner prematuramente.
  const [isMounted, setIsMounted] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(true);

  const syncState = useCallback(() => {
    const consent = getPoliciesConsent();
    setHasAccepted(consent.accepted);
  }, []);

  useEffect(() => {
    // Fase 2: Tras el montaje en cliente, leemos el almacenamiento real y activamos sincronización
    setIsMounted(true);
    syncState();

    const handleSync = () => {
      syncState();
    };

    window.addEventListener(POLICIES_CONSENT_EVENT, handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(POLICIES_CONSENT_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [syncState]);

  const acceptPolicies = useCallback(() => {
    savePoliciesConsent(true);
    setHasAccepted(true);
  }, []);

  const resetPolicies = useCallback(() => {
    purgePoliciesConsent();
    setHasAccepted(false);
  }, []);

  return {
    isMounted,
    shouldShowBanner: isMounted && !hasAccepted,
    hasAccepted,
    acceptPolicies,
    resetPolicies,
  };
}
