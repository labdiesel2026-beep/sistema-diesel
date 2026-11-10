import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { SiteSettingsProvider, useSiteSettings } from "@/context/site-settings-context";
import { api } from "@/lib/api";
import { SITE_CONFIG } from "@/config/site-config";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("SiteSettingsContext (TASK-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SiteSettingsProvider>{children}</SiteSettingsProvider>
  );

  it("inicializa con fallback inmediato de SITE_CONFIG.phone si no hay caché", () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {})); // Never resolves
    const { result } = renderHook(() => useSiteSettings(), { wrapper });

    expect(result.current.whatsappNumber).toBe(SITE_CONFIG.phone);
    expect(result.current.whatsappDisplay).toContain("2657");
  });

  it("recupera configuraciones desde /settings/public y actualiza el estado", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      whatsappNumber: "5491122334455",
      whatsappDisplay: "+54 9 1122 33-4455",
    });

    const { result } = renderHook(() => useSiteSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.whatsappNumber).toBe("5491122334455");
      expect(result.current.whatsappDisplay).toBe("+54 9 1122 33-4455");
    });
  });

  it("actualiza el número mediante updateWhatsApp() llamando al endpoint protegido", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      whatsappNumber: "5492657659108",
      whatsappDisplay: "+54 9 2657 65-9108",
    });

    vi.mocked(api.put).mockResolvedValueOnce({
      success: true,
      whatsappNumber: "5492657998877",
      whatsappDisplay: "+54 9 2657 99-8877",
      message: "Actualizado",
    });

    const { result } = renderHook(() => useSiteSettings(), { wrapper });

    await act(async () => {
      await result.current.updateWhatsApp("+54 9 2657 99-8877");
    });

    expect(api.put).toHaveBeenCalledWith("/settings/whatsapp", {
      whatsappNumber: "5492657998877",
    });
    expect(result.current.whatsappNumber).toBe("5492657998877");
    expect(result.current.whatsappDisplay).toBe("+54 9 2657 99-8877");
  });
});

