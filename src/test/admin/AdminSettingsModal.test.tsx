import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AdminSettingsModal } from "@/components/admin/settings/AdminSettingsModal";
import { SiteSettingsContext } from "@/context/site-settings-context";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    put: vi.fn(),
  },
  ApiError: class ApiError extends Error {},
}));

describe("AdminSettingsModal (TASK-04)", () => {
  const mockUpdateWhatsApp = vi.fn();
  const mockRefreshSettings = vi.fn();
  const mockOnOpenChange = vi.fn();

  const renderModal = (open = true) => {
    return render(
      <SiteSettingsContext.Provider
        value={{
          whatsappNumber: "5492657659108",
          whatsappDisplay: "+54 9 2657 65-9108",
          isLoading: false,
          refreshSettings: mockRefreshSettings,
          updateWhatsApp: mockUpdateWhatsApp,
        }}
      >
        <AdminSettingsModal open={open} onOpenChange={mockOnOpenChange} />
      </SiteSettingsContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Sección WhatsApp", () => {
    it("renderiza el modal con el input de WhatsApp cargado", () => {
      renderModal(true);

      expect(screen.getByTestId("admin-settings-modal")).toBeInTheDocument();
      expect(screen.getByTestId("tab-whatsapp")).toBeInTheDocument();
      expect(screen.getByTestId("tab-password")).toBeInTheDocument();

      const input = screen.getByTestId("whatsapp-input") as HTMLInputElement;
      expect(input.value).toBe("5492657659108");
      expect(screen.getByText(/https:\/\/wa\.me\/5492657659108/i)).toBeInTheDocument();
    });

    it("valida longitud mínima al guardar WhatsApp", async () => {
      renderModal(true);

      const input = screen.getByTestId("whatsapp-input");
      fireEvent.change(input, { target: { value: "123" } });
      fireEvent.click(screen.getByTestId("save-whatsapp-btn"));

      await waitFor(() => {
        expect(
          screen.getByText(/debe tener entre 8 y 20 dígitos numéricos/i),
        ).toBeInTheDocument();
      });
      expect(mockUpdateWhatsApp).not.toHaveBeenCalled();
    });

    it("guarda el número de WhatsApp exitosamente", async () => {
      mockUpdateWhatsApp.mockResolvedValueOnce({
        success: true,
        whatsappNumber: "5492657112233",
        message: "OK",
      });

      renderModal(true);

      const input = screen.getByTestId("whatsapp-input");
      fireEvent.change(input, { target: { value: "+54 9 2657 11-2233" } });
      fireEvent.click(screen.getByTestId("save-whatsapp-btn"));

      await waitFor(() => {
        expect(mockUpdateWhatsApp).toHaveBeenCalledWith("5492657112233");
        expect(
          screen.getByText(/¡Número de WhatsApp actualizado correctamente en toda la tienda!/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("2. Sección Contraseña", () => {
    it("cambia a la pestaña de contraseña al hacer clic en el tab", () => {
      renderModal(true);

      fireEvent.click(screen.getByTestId("tab-password"));

      expect(screen.getByTestId("current-password-input")).toBeInTheDocument();
      expect(screen.getByTestId("new-password-input")).toBeInTheDocument();
      expect(screen.getByTestId("confirm-password-input")).toBeInTheDocument();
    });

    it("valida que la nueva contraseña tenga al menos 8 caracteres", async () => {
      renderModal(true);
      fireEvent.click(screen.getByTestId("tab-password"));

      fireEvent.change(screen.getByTestId("current-password-input"), {
        target: { value: "ActualPass123" },
      });
      fireEvent.change(screen.getByTestId("new-password-input"), {
        target: { value: "short" },
      });
      fireEvent.change(screen.getByTestId("confirm-password-input"), {
        target: { value: "short" },
      });

      fireEvent.click(screen.getByTestId("change-password-btn"));

      await waitFor(() => {
        expect(
          screen.getByText(/mínimo de 8 caracteres/i),
        ).toBeInTheDocument();
      });
      expect(api.put).not.toHaveBeenCalled();
    });

    it("valida coincidencia entre la nueva contraseña y la confirmación", async () => {
      renderModal(true);
      fireEvent.click(screen.getByTestId("tab-password"));

      fireEvent.change(screen.getByTestId("current-password-input"), {
        target: { value: "ActualPass123" },
      });
      fireEvent.change(screen.getByTestId("new-password-input"), {
        target: { value: "NewPassword2026!" },
      });
      fireEvent.change(screen.getByTestId("confirm-password-input"), {
        target: { value: "DifferentPassword2026!" },
      });

      fireEvent.click(screen.getByTestId("change-password-btn"));

      await waitFor(() => {
        expect(
          screen.getByText(/no coinciden/i),
        ).toBeInTheDocument();
      });
      expect(api.put).not.toHaveBeenCalled();
    });

    it("envía la petición al backend y muestra feedback de éxito", async () => {
      vi.mocked(api.put).mockResolvedValueOnce({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });

      renderModal(true);
      fireEvent.click(screen.getByTestId("tab-password"));

      fireEvent.change(screen.getByTestId("current-password-input"), {
        target: { value: "OldPassword123" },
      });
      fireEvent.change(screen.getByTestId("new-password-input"), {
        target: { value: "NewSecurePassword2026!" },
      });
      fireEvent.change(screen.getByTestId("confirm-password-input"), {
        target: { value: "NewSecurePassword2026!" },
      });

      fireEvent.click(screen.getByTestId("change-password-btn"));

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith("/auth/change-password", {
          currentPassword: "OldPassword123",
          newPassword: "NewSecurePassword2026!",
        });
        expect(
          screen.getByText(/¡Contraseña actualizada exitosamente!/i),
        ).toBeInTheDocument();
      });
    });
  });
});

