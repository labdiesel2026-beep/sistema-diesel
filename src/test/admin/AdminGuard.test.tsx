import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AdminGuard } from "@/components/admin/auth/AdminGuard";
import {
  AdminAuthProvider,
  useAdminAuth,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from "@/context/admin-auth-context";

// Mock de @tanstack/react-router Navigate para verificar la redirección defensiva
vi.mock("@tanstack/react-router", () => ({
  Navigate: vi.fn(({ to, replace }: { to: string; replace?: boolean }) => (
    <div
      data-testid="mock-navigate"
      data-to={to}
      data-replace={replace !== undefined ? String(replace) : undefined}
    >
      Redirecting to {to}
    </div>
  )),
}));

describe("Route Guard con Denegación por Defecto (AdminGuard) — Tarea 3.4", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe bloquear y redirigir inmediatamente a /admin/login con replace: true ante acceso anónimo (RF-02, CA-02.1)", () => {
    render(
      <AdminAuthProvider>
        <AdminGuard>
          <div data-testid="protected-dashboard">Panel de Control Confidencial</div>
        </AdminGuard>
      </AdminAuthProvider>
    );

    // No debe renderizar el contenido protegido
    expect(screen.queryByTestId("protected-dashboard")).toBeNull();

    // Debe renderizar la redirección a /admin/login con replace
    const redirectElement = screen.getByTestId("mock-navigate");
    expect(redirectElement).toBeDefined();
    expect(redirectElement.getAttribute("data-to")).toBe("/admin/login");
    expect(redirectElement.getAttribute("data-replace")).toBe("true");
  });

  it("debe simular pérdida de sesión ante F5 (arranque en memoria limpia) y denegar el acceso por defecto (RNF-P4-01, CL-08)", () => {
    // Un nuevo montaje sin login emula un F5 en el navegador (Zero-Trust)
    render(
      <AdminAuthProvider>
        <AdminGuard>
          <span data-testid="protected-content">Datos de Productos</span>
        </AdminGuard>
      </AdminAuthProvider>
    );

    expect(screen.queryByTestId("protected-content")).toBeNull();
    const redirectElement = screen.getByTestId("mock-navigate");
    expect(redirectElement.getAttribute("data-to")).toBe("/admin/login");
    expect(redirectElement.getAttribute("data-replace")).toBe("true");
  });

  it("debe renderizar los componentes hijos cuando el usuario cuenta con sesión válida (CA-02.2)", async () => {
    // Componente auxiliar para disparar login antes de renderizar el guard
    function AuthenticatedHarness({ children }: { children: ReactNode }) {
      const { login, isAuthenticated } = useAdminAuth();

      return (
        <div>
          {!isAuthenticated && (
            <button
              data-testid="trigger-login"
              onClick={() =>
                login({
                  email: DEMO_ADMIN_EMAIL,
                  password: DEMO_ADMIN_PASSWORD,
                })
              }
            >
              Iniciar Sesión
            </button>
          )}
          <AdminGuard>{children}</AdminGuard>
        </div>
      );
    }

    render(
      <AdminAuthProvider>
        <AuthenticatedHarness>
          <div data-testid="protected-content">Área de Gestión Segura</div>
        </AuthenticatedHarness>
      </AdminAuthProvider>
    );

    // Inicialmente bloqueado
    expect(screen.queryByTestId("protected-content")).toBeNull();
    expect(screen.getByTestId("mock-navigate")).toBeDefined();

    // Se efectúa el login
    await act(async () => {
      screen.getByTestId("trigger-login").click();
    });

    // Ahora el contenido protegido debe estar visible y el navigate ausente
    expect(screen.getByTestId("protected-content")).toBeDefined();
    expect(screen.getByText("Área de Gestión Segura")).toBeDefined();
    expect(screen.queryByTestId("mock-navigate")).toBeNull();
  });

  it("debe revocar inmediatamente el acceso y redirigir a /admin/login al ejecutar logout() (CA-02.3)", async () => {
    function LogoutHarness() {
      const { login, logout, isAuthenticated } = useAdminAuth();

      return (
        <div>
          <button
            data-testid="btn-login"
            onClick={() =>
              login({
                email: DEMO_ADMIN_EMAIL,
                password: DEMO_ADMIN_PASSWORD,
              })
            }
          >
            Login
          </button>
          <button data-testid="btn-logout" onClick={() => logout()}>
            Logout
          </button>
          <AdminGuard>
            <div data-testid="protected-secret">Información Privada Admin</div>
          </AdminGuard>
        </div>
      );
    }

    render(
      <AdminAuthProvider>
        <LogoutHarness />
      </AdminAuthProvider>
    );

    // Login
    await act(async () => {
      screen.getByTestId("btn-login").click();
    });
    expect(screen.getByTestId("protected-secret")).toBeDefined();

    // Logout
    await act(async () => {
      screen.getByTestId("btn-logout").click();
    });

    // Debe ser expulsado de inmediato
    expect(screen.queryByTestId("protected-secret")).toBeNull();
    const redirectElement = screen.getByTestId("mock-navigate");
    expect(redirectElement.getAttribute("data-to")).toBe("/admin/login");
    expect(redirectElement.getAttribute("data-replace")).toBe("true");
  });
});
