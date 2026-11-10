import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { SITE_CONFIG } from "@/config/site-config";
import { api } from "@/lib/api";
import {
  getDynamicWhatsAppNumber,
  setDynamicWhatsAppNumber,
} from "@/lib/whatsapp-utils";

export interface SiteSettingsState {
  whatsappNumber: string;
  whatsappDisplay: string;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateWhatsApp: (
    newNumber: string,
  ) => Promise<{ success: boolean; whatsappNumber: string; whatsappDisplay?: string; message: string }>;
}

const defaultDisplay = "+54 9 2657 65-9108";

export const SiteSettingsContext = createContext<SiteSettingsState>({
  whatsappNumber: SITE_CONFIG.phone,
  whatsappDisplay: defaultDisplay,
  isLoading: false,
  refreshSettings: async () => {},
  updateWhatsApp: async () => ({ success: false, whatsappNumber: SITE_CONFIG.phone, message: "" }),
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    return getDynamicWhatsAppNumber() || SITE_CONFIG.phone;
  });

  const [whatsappDisplay, setWhatsappDisplay] = useState<string>(() => {
    const num = getDynamicWhatsAppNumber() || SITE_CONFIG.phone;
    if (num.startsWith("549") && num.length === 13) {
      return `+54 9 ${num.slice(3, 7)} ${num.slice(7, 9)}-${num.slice(9)}`;
    }
    return `+${num}`;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get<{ whatsappNumber: string; whatsappDisplay: string }>("/settings/public");
      if (data?.whatsappNumber) {
        setWhatsappNumber(data.whatsappNumber);
        setWhatsappDisplay(data.whatsappDisplay || `+${data.whatsappNumber}`);
        setDynamicWhatsAppNumber(data.whatsappNumber);
      }
    } catch {
      // Fallback silencioso ante falla de red (usa caché o SITE_CONFIG)
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWhatsApp = useCallback(
    async (newNumber: string) => {
      const sanitized = newNumber.replace(/\D/g, "");
      const res = await api.put<{
        success: boolean;
        whatsappNumber: string;
        whatsappDisplay: string;
        message: string;
      }>("/settings/whatsapp", { whatsappNumber: sanitized });

      if (res?.whatsappNumber) {
        setWhatsappNumber(res.whatsappNumber);
        setWhatsappDisplay(res.whatsappDisplay || `+${res.whatsappNumber}`);
        setDynamicWhatsAppNumber(res.whatsappNumber);
      }

      return res;
    },
    [],
  );

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const value = useMemo(
    () => ({
      whatsappNumber,
      whatsappDisplay,
      isLoading,
      refreshSettings,
      updateWhatsApp,
    }),
    [whatsappNumber, whatsappDisplay, isLoading, refreshSettings, updateWhatsApp],
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsState {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return {
      whatsappNumber: SITE_CONFIG.phone,
      whatsappDisplay: defaultDisplay,
      isLoading: false,
      refreshSettings: async () => {},
      updateWhatsApp: async () => ({
        success: false,
        whatsappNumber: SITE_CONFIG.phone,
        message: "",
      }),
    };
  }
  return context;
}

