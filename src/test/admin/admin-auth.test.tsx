import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  AdminAuthProvider,
  useAdminAuth,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_USER_ID,
} from "@/context/admin-auth-context";

describe("Contexto de Autenticación Zero-Trust (AdminAuthProvider) — Tarea 3.1", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("debe inicializar con estado no autenticado por defecto (Memoria limpia ante F5)", () => {
    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("debe autenticar exitosamente con las credenciales demo unificadas", async () => {
    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    let loginResponse;
    await act(async () => {
      loginResponse = await result.current.login({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      });
    });

    expect(loginResponse).toEqual({ success: true });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: DEMO_ADMIN_USER_ID,
      email: DEMO_ADMIN_EMAIL,
      role: "admin",
    });
  });

  it("debe rechazar credenciales incorrectas y mantener la sesión inactiva", async () => {
    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    let loginResponse;
    await act(async () => {
      loginResponse = await result.current.login({
        email: "hacker@test.com",
        password: "wrongpassword",
      });
    });

    expect(loginResponse).toEqual({
      success: false,
      error: "Credenciales incorrectas",
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("debe rechazar contraseña incorrecta aunque el email sea el demo", async () => {
    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    let loginResponse;
    await act(async () => {
      loginResponse = await result.current.login({
        email: DEMO_ADMIN_EMAIL,
        password: "contraseñaErronea",
      });
    });

    expect(loginResponse).toEqual({
      success: false,
      error: "Credenciales incorrectas",
    });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("debe destruir la sesión en memoria al invocar logout()", async () => {
    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    // 1. Iniciar sesión
    await act(async () => {
      await result.current.login({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      });
    });
    expect(result.current.isAuthenticated).toBe(true);

    // 2. Cerrar sesión
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("ASVS Zero-Trust: Jamás debe almacenar tokens ni banderas en localStorage o sessionStorage", async () => {
    const localSetItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const localGetItemSpy = vi.spyOn(Storage.prototype, "getItem");

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    await act(async () => {
      await result.current.login({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      });
    });

    expect(localSetItemSpy).not.toHaveBeenCalled();
    expect(localGetItemSpy).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it("debe establecer una sesión vacía segura si checkSession recibe 401 Unauthorized", async () => {
    const { api, ApiError } = await import("@/lib/api");
    vi.spyOn(api, "get").mockRejectedValueOnce(
      new ApiError("No autenticado", 401, { error: "No autenticado" }),
    );

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    await act(async () => {
      await result.current.checkSession();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("debe lanzar error explicativo si useAdminAuth se consume fuera de AdminAuthProvider", () => {
    // Suprimir temporalmente el console.error de React al capturar excepción
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAdminAuth());
    }).toThrowError("useAdminAuth debe ser utilizado dentro de un AdminAuthProvider");

    consoleErrorSpy.mockRestore();
  });
});
