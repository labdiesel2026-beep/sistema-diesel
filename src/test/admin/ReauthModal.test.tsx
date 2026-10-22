import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import {
  AdminAuthProvider,
  useAdminAuth,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from "@/context/AuthContext";
import * as apiClientModule from "@/lib/api-client";

// Componente de prueba que simula un formulario administrativo activo con datos sin guardar
function ActiveProductFormDummy() {
  const { setReauthModalOpen } = useAdminAuth();

  return (
    <div>
      <h1 data-testid="form-title">Formulario de Edición de Repuesto</h1>
      <input data-testid="part-name-input" defaultValue="Inyector Bosch 0445" />
      <button
        data-testid="trigger-reauth-btn"
        onClick={() => setReauthModalOpen(true)}
      >
        Disparar Reauth Manual
      </button>
    </div>
  );
}

describe("TASK-24: Modal Bloqueante de Re-autenticación en AuthContext.tsx (Caso Límite 8)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1. Se despliega sobre el formulario activo al recibir evento SHOW_REAUTH_MODAL sin destruirlo", async () => {
    render(
      <AdminAuthProvider>
        <ActiveProductFormDummy />
      </AdminAuthProvider>,
    );

    // El formulario está presente y con sus datos intactos
    expect(screen.getByTestId("form-title")).toBeInTheDocument();
    expect(screen.getByTestId("part-name-input")).toHaveValue("Inyector Bosch 0445");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Disparar evento global SHOW_REAUTH_MODAL (como emitiría el interceptor)
    act(() => {
      window.dispatchEvent(new CustomEvent("SHOW_REAUTH_MODAL"));
    });

    // Modal aparece en pantalla
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Sesión Expirada")).toBeInTheDocument();
    });

    // El formulario activo de fondo PERMANECE montado e intacto en el DOM
    expect(screen.getByTestId("part-name-input")).toHaveValue("Inyector Bosch 0445");
  });

  it("2. Es estrictamente bloqueante: no se cierra al presionar Escape ni al hacer clic en el backdrop", async () => {
    render(
      <AdminAuthProvider>
        <ActiveProductFormDummy />
      </AdminAuthProvider>,
    );

    act(() => {
      window.dispatchEvent(new CustomEvent("SHOW_REAUTH_MODAL"));
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const dialog = screen.getByRole("dialog");

    // Intento de escape
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Intento de clic en el backdrop (dialog container)
    act(() => {
      fireEvent.click(dialog);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("3. Muestra mensaje de error en rojo ante credenciales erróneas y mantiene el formulario en memoria", async () => {
    render(
      <AdminAuthProvider>
        <ActiveProductFormDummy />
      </AdminAuthProvider>,
    );

    act(() => {
      window.dispatchEvent(new CustomEvent("SHOW_REAUTH_MODAL"));
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText("Contraseña");
    const submitBtn = screen.getByRole("button", { name: /Reanudar Sesión/i });

    // Ingresar contraseña incorrecta
    act(() => {
      fireEvent.change(passwordInput, { target: { value: "clave_incorrecta" } });
      fireEvent.click(submitBtn);
    });

    // Debe mostrar alerta en rojo
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Credenciales incorrectas");
    });

    // El diálogo permanece visible y el formulario de fondo intacto
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("part-name-input")).toHaveValue("Inyector Bosch 0445");
  });

  it("4. Al enviar credenciales bloquea el botón con indicador de carga para evitar doble submit", async () => {
    render(
      <AdminAuthProvider>
        <ActiveProductFormDummy />
      </AdminAuthProvider>,
    );

    act(() => {
      window.dispatchEvent(new CustomEvent("SHOW_REAUTH_MODAL"));
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText("Correo Electrónico");
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitBtn = screen.getByRole("button", { name: /Reanudar Sesión/i });

    act(() => {
      fireEvent.change(emailInput, { target: { value: DEMO_ADMIN_EMAIL } });
      fireEvent.change(passwordInput, { target: { value: DEMO_ADMIN_PASSWORD } });
      fireEvent.submit(submitBtn.closest("form")!);
    });

    // Al hacer submit, el botón pasa a disabled
    expect(submitBtn).toBeDisabled();
  });

  it("5. Tras login exitoso, cierra el modal y re-transmite automáticamente las peticiones retenidas", async () => {
    const retrySpy = vi.spyOn(apiClientModule, "retryRetainedRequests").mockResolvedValue([]);

    render(
      <AdminAuthProvider>
        <ActiveProductFormDummy />
      </AdminAuthProvider>,
    );

    act(() => {
      window.dispatchEvent(new CustomEvent("SHOW_REAUTH_MODAL"));
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText("Correo Electrónico");
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitBtn = screen.getByRole("button", { name: /Reanudar Sesión/i });

    act(() => {
      fireEvent.change(emailInput, { target: { value: DEMO_ADMIN_EMAIL } });
      fireEvent.change(passwordInput, { target: { value: DEMO_ADMIN_PASSWORD } });
      fireEvent.click(submitBtn);
    });

    // El modal debe cerrarse
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Debe invocar retryRetainedRequests para retransmitir el FormData retenido
    expect(retrySpy).toHaveBeenCalled();

    // El formulario de fondo continúa presente y sin cambios
    expect(screen.getByTestId("part-name-input")).toHaveValue("Inyector Bosch 0445");
  });
});
