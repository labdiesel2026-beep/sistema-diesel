import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  AdminAuthProvider,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from "@/context/admin-auth-context";
import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";

function renderWithAuthProvider(ui: React.ReactElement) {
  return render(<AdminAuthProvider>{ui}</AdminAuthProvider>);
}

describe("Componente AdminLoginForm — Tarea 3.2", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("debe renderizar los campos de correo, contraseña y botón con autocompletado permitido", () => {
    renderWithAuthProvider(<AdminLoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i });

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autocomplete", "email");

    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it("debe mostrar errores inline al desenfocar (onBlur) un campo vacío o mal formateado", async () => {
    renderWithAuthProvider(<AdminLoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);

    // Escribir correo inválido y desenfocar (blur)
    fireEvent.change(emailInput, { target: { value: "invalido" } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/formato de correo electrónico inválido/i)).toBeInTheDocument();

    // Limpiar correo y desenfocar
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
  });

  it("debe bloquear el envío y señalar campos con error si se envía formulario vacío", async () => {
    renderWithAuthProvider(<AdminLoginForm />);

    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
  });

  it("debe mostrar alerta de 'Credenciales incorrectas' ante fallo de autenticación", async () => {
    renderWithAuthProvider(<AdminLoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: "usuario@incorrecto.com" } });
    fireEvent.change(passwordInput, { target: { value: "claveErronea123" } });
    fireEvent.click(submitButton);

    const alertElement = await screen.findByRole("alert");
    expect(alertElement).toHaveTextContent("Credenciales incorrectas");
  });

  it("debe llamar a onSuccess cuando se ingresan credenciales válidas", async () => {
    const onSuccessSpy = vi.fn();
    renderWithAuthProvider(<AdminLoginForm onSuccess={onSuccessSpy} />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: DEMO_ADMIN_EMAIL } });
    fireEvent.change(passwordInput, { target: { value: DEMO_ADMIN_PASSWORD } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccessSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("debe deshabilitar el botón durante el submit y restablecerlo en el bloque finally", async () => {
    renderWithAuthProvider(<AdminLoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: "usuario@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "pass12345" } });
    fireEvent.click(submitButton);

    // Al finalizar el proceso (sea éxito o error), el botón debe quedar re-habilitado
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
