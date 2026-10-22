import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  AdminAuthProvider,
  useAdminAuth,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  AUTH_CHANNEL_NAME,
  AUTH_STORAGE_SYNC_KEY,
} from "@/context/AuthContext";

describe("TASK-25: Sincronización Multi-Pestaña de Sesión por BroadcastChannel (Caso Límite 9)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("1. Al invocar logout() en una pestaña, emite SESSION_REVOKED al canal auth_channel", async () => {
    const postMessageSpy = vi.fn();
    const closeSpy = vi.fn();

    // Mock global de BroadcastChannel
    class MockBroadcastChannel {
      name: string;
      onmessage: any = null;
      constructor(name: string) {
        this.name = name;
      }
      postMessage = postMessageSpy;
      close = closeSpy;
    }
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    // Iniciar sesión
    await act(async () => {
      await result.current.login({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Ejecutar logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SESSION_REVOKED",
      }),
    );

    vi.unstubAllGlobals();
  });

  it("2. Una pestaña autenticada invalida su estado en memoria al recibir mensaje SESSION_REVOKED de BroadcastChannel", async () => {
    let capturedOnMessage: ((event: MessageEvent) => void) | null = null;

    class MockBroadcastChannel {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      set onmessage(fn: (event: MessageEvent) => void) {
        capturedOnMessage = fn;
      }
      postMessage = vi.fn();
      close = vi.fn();
    }
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    // Pestaña B inicialmente autenticada
    await act(async () => {
      await result.current.login({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      });
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();

    // Pestaña A cerró sesión y envió SESSION_REVOKED por el canal
    act(() => {
      capturedOnMessage?.({
        data: { type: "SESSION_REVOKED", timestamp: Date.now() },
      } as MessageEvent);
    });

    // Pestaña B invalida su estado inmediatamente sin esperar una petición fallida de red
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    vi.unstubAllGlobals();
  });

  it("3. Mecanismo de Fallback: Invalida el estado en memoria al recibir evento 'storage' con SESSION_REVOKED", async () => {
    // Simular entorno restrictivo sin soporte de BroadcastChannel
    vi.stubGlobal("BroadcastChannel", undefined);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    await act(async () => {
      await result.current.login({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      });
    });
    expect(result.current.isAuthenticated).toBe(true);

    // Simular evento storage emitido por otra pestaña
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: AUTH_STORAGE_SYNC_KEY,
          newValue: JSON.stringify({ type: "SESSION_REVOKED", timestamp: Date.now() }),
        }),
      );
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    vi.unstubAllGlobals();
  });

  it("4. Sincroniza SESSION_RESTORED cuando otra pestaña completa la re-autenticación", async () => {
    let capturedOnMessage: ((event: MessageEvent) => void) | null = null;

    class MockBroadcastChannel {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      set onmessage(fn: (event: MessageEvent) => void) {
        capturedOnMessage = fn;
      }
      postMessage = vi.fn();
      close = vi.fn();
    }
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

    const { result } = renderHook(() => useAdminAuth(), {
      wrapper: AdminAuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);

    // Simular que otra pestaña se re-autenticó exitosamente
    act(() => {
      capturedOnMessage?.({
        data: {
          type: "SESSION_RESTORED",
          user: {
            id: "user-123",
            email: "operador@laboratoriodiesel.com",
            role: "admin",
          },
        },
      } as MessageEvent);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("operador@laboratoriodiesel.com");

    vi.unstubAllGlobals();
  });
});
